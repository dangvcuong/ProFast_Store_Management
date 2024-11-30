import React, { useState, useEffect } from 'react';
import { getCompany, deleteCompany, addCompany, updateCompany } from '../models/Company_Model';
import '../screes/csss/Product.css';


const CompanyScreen = () => {
    const [companys, setCompanys] = useState({});
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [ngay, setNgay] = useState('');
    const [searchTerm, setSearchTerm] = useState(''); // Từ khóa tìm kiếm hãng
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState(null);
    useEffect(() => {
        loadCompanys();
    }, []);

    const loadCompanys = async () => {
        const companyData = await getCompany();
        setCompanys(companyData);
    };

    const handleAdd = async () => {
        if (!name) {
            alert('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        const company = { name };
        await addCompany(company);
        loadCompanys();
        resetForm();
    };

    const handleUpdate = async () => {
        if (!id || !name) {
            alert('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        const company = { id, name, createdDate: ngay };
        await updateCompany(company);
        loadCompanys();
        resetForm();
    };

    const handleEdit = (company) => {
        setId(company.id);
        setName(company.name);
        setNgay(company.createdDate);
    };

    const handleDelete = async (id) => {
        await deleteCompany(id);
        loadCompanys();
    };

    const resetForm = () => {
        setId('');
        setName('');
    };

    // Hàm chuyển đổi chuỗi có dấu thành không dấu (dùng cho tìm kiếm không phân biệt dấu)
    const removeVietnameseTones = (str) => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D");
    };

    // Lọc danh sách hãng dựa trên từ khóa tìm kiếm (không phân biệt dấu)
    const filteredCompanies = Object.keys(companys).filter((key) => {
        const companyName = companys[key].name;
        return removeVietnameseTones(companyName.toLowerCase()).includes(removeVietnameseTones(searchTerm.toLowerCase()));
    });
    const formatDate = (dateString) => {
        const [day, month, year] = dateString.split('/');
        const date = new Date(year, month - 1, day); // month - 1 vì tháng bắt đầu từ 0 trong JavaScript
        return date.toLocaleDateString('vi-VN');
    };

    const closeDialog = () => {
        setConfirmDialog(false);
        setCurrentOrderId(null);
    };

    return (
        <div className="body">
            <h1>Quản lý danh mục</h1>

            <input placeholder="Nhập tên danh mục" value={name} onChange={(e) => setName(e.target.value)} style={{
                marginBottom: '10px',
                flex: 1,
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box',
            }} />
            <button onClick={handleAdd} style={{
                marginLeft: '10px',
                padding: '10px',
                backgroundColor: '#2196F3',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
                color: 'white',
                boxSizing: 'border-box',
            }}>Thêm</button>
            <button onClick={handleUpdate} disabled={!id} style={{
                marginLeft: '10px',
                padding: '10px',
                backgroundColor: '#2196F3',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
                color: 'white',
                boxSizing: 'border-box',
            }}>Cập nhật</button>


            <div>
                <input
                    placeholder="Nhập tên danh mục cần tìm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '30%', padding: '8px', fontSize: '16px', marginBottom: 30, justifyContent: 'right' }}
                />
            </div>

            <table className="table-container">
                <thead>
                    <tr>
                        <th>Tên</th>
                        <th>Ngày tạo</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCompanies.map((key) => (
                        <tr key={key}>
                            <td>{companys[key].name}</td>
                            <td>
                                {companys[key].createdDate
                                    ? formatDate(companys[key].createdDate)
                                    : 'N/A'}
                            </td>
                            <td>
                                <button onClick={() => handleEdit({ id: key, name: companys[key].name, createdDate: companys[key].createdDate })} style={{

                                    padding: '10px',
                                    backgroundColor: '#2196F3',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    color: 'white',
                                    boxSizing: 'border-box',
                                }}>Sửa</button>
                                <button onClick={() => { setCurrentOrderId(key); setConfirmDialog(true) }} style={{
                                    marginLeft: '10px',
                                    padding: '10px',
                                    backgroundColor: '#2196F3',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    color: 'white',
                                    boxSizing: 'border-box',
                                }}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {confirmDialog && (
                <div className="confirmation-dialog">
                    <div className="dialog-content">
                        <h3>Xác nhận xóa danh mục này không?</h3>

                        <div className="dialog-footer">
                            <button onClick={() => { handleDelete(currentOrderId); closeDialog(); }} style={{
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
    );
};

export default CompanyScreen;

