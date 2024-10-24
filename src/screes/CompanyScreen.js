import React, { useState, useEffect } from 'react';
import { getCompany, deleteCompany, addCompany, updateCompany } from '../models/Company_Model';

import '../screes/csss/Personnel_management.css'; // Import file CSS đã tạo

const CompanyScreen = () => {
    const [companys, setCompanys] = useState({});
    const [id, setId] = useState('');
    const [name, setName] = useState('');


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

    return (
        <div className="container">
            <h1>Quản lý hãng</h1>

            <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: '10px' }} />
            <button onClick={handleAdd}>Thêm</button>
            <button onClick={handleUpdate} disabled={!id}>Cập nhật</button>

            <h2>Danh sách hãng</h2>
            <table>
                <thead>
                    <tr>
                        <th>Tên</th>
                        <th>Ngày tạo</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(companys).map((key) => (
                        <tr key={key}>
                            <td>{companys[key].name}</td>
                            <td>{companys[key].createdDate}</td>
                            <td>
                                <button onClick={() => handleDelete(companys[key].id)}>Xóa</button>
                                <button onClick={() => handleEdit(companys[key])}>Sửa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CompanyScreen;

