import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, update } from "firebase/database";
import UserModel from '../models/KhachHang_Model'; // Import the user model
import { app } from '../firebaseConfig'; // Import Firebase app configuration
import '../screes/csss/OrderManagerScreen.css';
const Customer_managenments = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentOrderId, setCurrentOrderId] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState(false);
    useEffect(() => {
        const db = getDatabase(app);
        const usersRef = ref(db, 'users');

        // Lấy dữ liệu từ Firebase
        const unsubscribe = onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            setLoading(false);
            if (data) {
                const usersArray = Object.keys(data).map(key => {
                    const user = data[key];
                    const addresses = user.addresses ? Object.values(user.addresses) : [];

                    return {
                        userModel: new UserModel({
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            phoneNumber: user.phoneNumber,
                            status: user.status,
                            dateCreated: user.dateCreated,
                            image: user.image,
                            addresses: addresses
                        }),
                        addresses: addresses
                    };
                });
                setUsers(usersArray);
            } else {
                setError('Không có người dùng nào.');
            }
        }, (error) => {
            setLoading(false);
            setError(`Lỗi khi tải dữ liệu: ${error.message}`);
        });

        return () => unsubscribe();
    }, []);

    const deactivateUser = async (userId) => {
        const db = getDatabase();
        const userRef = ref(db, `users/${userId}`);
        await update(userRef, { status: 'Ngừng hoạt động' });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    // Hàm chuyển đổi chuỗi có dấu thành không dấu (dùng cho tìm kiếm không phân biệt dấu)
    const removeVietnameseTones = (str) => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D");
    };

    // Lọc danh sách người dùng dựa trên từ khóa tìm kiếm (không phân biệt dấu)
    const filteredUsers = users.filter(user =>
        removeVietnameseTones(user.userModel.name.toLowerCase()).includes(removeVietnameseTones(searchTerm.toLowerCase()))
    );
    const closeDialog = () => {
        setConfirmDialog(false);
        setCurrentOrderId(null);
    };
    return (
        <div style={{ margin: 20 }}>
            <h1>Quản lý khách hàng</h1>
            <div>
                <input
                    placeholder="Nhập tên nhân viên cần tìm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '30%', padding: '8px', fontSize: '16px', marginBottom: 30 }}
                />
            </div>
            <div className="table-container">
                <table >
                    <thead>
                        <tr>
                            <th>Tên</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Ngày tạo</th>
                            <th>Trạng thái</th>
                            <th>Báo cáo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user, index) => (
                            <tr key={index}>
                                <td>{user.userModel.name}</td>
                                <td style={{
                                    wordBreak: 'break-word',
                                    whiteSpace: 'normal',
                                }} >{user.userModel.email}</td>
                                <td >{user.userModel.phoneNumber}</td>
                                <td >{user.userModel.dateCreated}</td>
                                <td >{user.userModel.status}</td>
                                <td >
                                    <button onClick={() => { setCurrentOrderId(user.userModel.id); setConfirmDialog(true) }} style={{
                                        color: 'white',
                                        backgroundColor: '#2196F3',
                                        width: 150,
                                    }}>
                                        Khóa tài khoản
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {confirmDialog && (
                    <div className="confirmation-dialog">
                        <div className="dialog-content">
                            <h3>Xác nhận khóa tài khoản này?</h3>

                            <div className="dialog-footer">
                                <button onClick={() => { deactivateUser(currentOrderId); closeDialog(); }} style={{
                                    color: 'white',
                                    backgroundColor: '#2196F3',
                                }}>Đồng ý</button>
                                <button onClick={closeDialog} style={{
                                    color: 'white',
                                    backgroundColor: '#2196F3',
                                }}>Không</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Customer_managenments;
