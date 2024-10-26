import React, { useState, useEffect } from 'react';
import { getCompany, deleteCompany, addCompany, updateCompany } from '../models/Company_Model';

import '../screes/csss/Personnel_management.css'; // Import file CSS đã tạo

const CompanyScreen = () => {
    const [companys, setCompanys] = useState({});
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [searchTerm, setSearchTerm] = useState(''); // Từ khóa tìm kiếm hãng

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

        const company = { id, name };
        await updateCompany(company);
        loadCompanys();
        resetForm();
    };

    const handleEdit = (company) => {
        setId(company.id);
        setName(company.name);
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

    return (
        <div className="container">
            <h1>Quản lý hãng</h1>

            <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: '10px' }} />
            <button onClick={handleAdd}>Thêm</button>
            <button onClick={handleUpdate} disabled={!id}>Cập nhật</button>

            <h2>Danh sách hãng</h2>
            <div>
                <input
                    placeholder="Nhập tên hãng cần tìm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '30%', padding: '8px', fontSize: '16px', marginBottom: 30, justifyContent: 'right' }}
                />
            </div>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Tên</th>
                            <th>Ngày tạo</th>
                            <th>Hành động</th>
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
                                    <button onClick={() => handleEdit({ id: key, name: companys[key].name })}>Sửa</button>
                                    <button onClick={() => handleDelete(key)}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CompanyScreen;

