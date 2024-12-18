import React, { useState, useEffect } from "react";
import { getDatabase, ref, set, push, onValue, remove, update } from "firebase/database";
import { app } from "../firebaseConfig";


const Vorcher = () => {
    const [vouchers, setVouchers] = useState([]);
    const [form, setForm] = useState({ id: "", name: "", discount: "", soluong: "", ngayTao: "", ngayHetHan: "" });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const db = getDatabase(app);
        const usersRef = ref(db, "vouchers");
        onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const currentDate = new Date();
                const voucherList = Object.keys(data).map((key) => {
                    const voucher = { id: key, ...data[key] };
                    const expiryDate = new Date(voucher.ngayHetHan);

                    // Tự động cập nhật trạng thái nếu cần
                    const status = expiryDate >= currentDate ? "Còn hạn" : "Hết hạn";
                    if (voucher.status !== status) {
                        const voucherRef = ref(db, `vouchers/${key}`);
                        update(voucherRef, { status });
                    }

                    return { ...voucher, status };
                });
                setVouchers(voucherList);
            } else {
                setVouchers([]);
            }
        });
    }, []);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [name]: value !== undefined ? value : "",
        }));
    };


    const handleAddOrUpdateVoucher = () => {
        const { name, discount, soluong, ngayTao, ngayHetHan } = form;
        if (!name || !discount || !soluong || !ngayTao || !ngayHetHan) {
            alert("Vui lòng nhập đầy đủ thông tin cho tất cả các trường!");
            return;
        }

        const db = getDatabase(app);
        const currentDate = new Date();
        const expiryDate = new Date(ngayHetHan);

        const status = expiryDate >= currentDate ? "Còn hạn" : "Hết hạn";

        if (isEditing) {
            const voucherRef = ref(db, `vouchers/${form.id}`);
            update(voucherRef, {
                name,
                discount,
                soluong,
                ngayTao,
                ngayHetHan,
                status,
            });
            setIsEditing(false);
        } else {
            const voucherRef = ref(db, "vouchers");
            const newVoucherRef = push(voucherRef);
            set(newVoucherRef, {
                name,
                discount,
                soluong,
                ngayTao,
                ngayHetHan,
                status,
            });
        }

        setForm({ id: "", name: "", discount: "", soluong: "", ngayTao: "", ngayHetHan: "" });
    };



    const handleEditVoucher = (voucher) => {
        setForm({
            id: voucher.id,
            name: voucher.name,
            discount: voucher.discount,
            soluong: voucher.soluong,
            ngayTao: voucher.ngayTao,
            ngayHetHan: voucher.ngayHetHan,
        });
        setIsEditing(true);
    };


    const handleDeleteVoucher = (id) => {
        const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa?");
        if (confirmDelete) {
            const db = getDatabase(app);
            const voucherRef = ref(db, `vouchers/${id}`);
            remove(voucherRef);
        }
    };

    return (
        <div>
            <h1>Quản Lý Voucher</h1>
            <div style={{ display: 'flex', gap: '200px' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="date"
                            name="ngayTao"
                            placeholder="Ngày tạo"
                            value={form.ngayTao}
                            onChange={handleInputChange}
                            style={{
                                marginBottom: '10px',
                                flex: 1,
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                            }}
                        />
                        <input
                            type="date"
                            name="ngayHetHan"
                            placeholder="Ngày hết hạn"
                            value={form.ngayHetHan}
                            onChange={handleInputChange}
                            style={{
                                marginBottom: '10px',
                                flex: 1,
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            name="name"
                            placeholder="Tên Voucher"
                            value={form.name}
                            onChange={handleInputChange}
                            style={{
                                marginBottom: '10px',
                                flex: 1,
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                            }}
                        />
                        <input
                            type="number"
                            name="discount"
                            placeholder="Giảm Giá (%)"
                            value={form.discount}
                            onChange={handleInputChange}
                            style={{
                                marginBottom: '10px',
                                flex: 1,
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="number"
                            name="soluong"
                            placeholder="Số lượng"
                            value={form.soluong}
                            onChange={handleInputChange}
                            style={{
                                marginBottom: '10px',
                                flex: 1,
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                            }}
                        />

                        <button onClick={handleAddOrUpdateVoucher} style={{
                            color: 'white',
                            backgroundColor: '#2196F3',
                        }}>
                            {isEditing ? "Cập Nhật" : "Thêm Mới"}
                        </button>
                    </div>

                </div>

                <div style={{ flex: 1 }}></div>

            </div>
            <table className="table-container">
                <thead>
                    <tr>
                        <th style={{ width: 200 }}>Mã ưu đãi</th>
                        <th>Tên ưu đãi</th>
                        <th>Giảm Giá (%)</th>
                        <th>Số Lượng</th>
                        <th>Ngày Tạo</th>
                        <th>Ngày Hết Hạn</th>
                        <th>Trạng Thái</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody style={{ height: '55vh' }}>
                    {vouchers.length === 0 ? (
                        <tr>
                            <td colSpan="8" style={{ textAlign: "center" }}>Không có dữ liệu</td>
                        </tr>
                    ) : (
                        vouchers.map((voucher) => (
                            <tr key={voucher.id}>
                                <td style={{ width: 200 }}>{voucher.id}</td>
                                <td>{voucher.name}</td>
                                <td>{voucher.discount}</td>
                                <td>{voucher.soluong}</td>
                                <td>{voucher.ngayTao}</td>
                                <td>{voucher.ngayHetHan}</td>
                                <td style={{ color: voucher.status === "Còn hạn" ? "green" : "red" }}>
                                    {voucher.status}
                                </td>
                                <td>
                                    <button onClick={() => handleEditVoucher(voucher)} style={{
                                        color: 'white',
                                        backgroundColor: '#2196F3',
                                        marginBottom: 10,
                                    }}>Sửa</button>
                                    <button onClick={() => handleDeleteVoucher(voucher.id)} style={{
                                        color: 'white',
                                        backgroundColor: '#2196F3',
                                    }}>Xóa</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Vorcher;
