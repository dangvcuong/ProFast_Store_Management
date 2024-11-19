import React, { useState, useEffect } from 'react';
import { addEmployee, updateEmployee, getEmployees, deleteEmployee } from '../models/Employee_Model';

import '../screes/csss/Personnel_management.css'; // Import file CSS đã tạo

const Personnel_management = () => {
    const [employees, setEmployees] = useState({});
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setuserName] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [position, setPosition] = useState('')
    const [createdDate, setCreatedDate] = useState('');
    const [searchTerm, setSearchTerm] = useState(''); // Từ khóa tìm kiếm hãng

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        const employeesData = await getEmployees();
        setEmployees(employeesData);
    };

    const handleAdd = async () => {
        setPosition('nv');
        if (!name || !email || !password || !phoneNumber || !username) {
            alert('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        const employee = { name, email, username, password, phoneNumber, position };
        await addEmployee(employee);
        loadEmployees();
        resetForm();
    };

    const handleUpdate = async () => {
        if (!id || !name || !email || !password || !phoneNumber || !username) {
            alert('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        const employee = { id, name, email, username, password, phoneNumber, createdDate };
        await updateEmployee(employee);
        loadEmployees();
        resetForm();
    };

    const handleEdit = (employee) => {
        setId(employee.id);
        setName(employee.name);
        setEmail(employee.email);
        setuserName(employee.username);
        setPassword(employee.password);
        setPhoneNumber(employee.phoneNumber);
        setCreatedDate(employee.createdDate);
    };

    const handleDelete = async (id) => {
        await deleteEmployee(id);
        loadEmployees();
    };

    const resetForm = () => {
        setId('');
        setName('');
        setuserName("");
        setEmail('');
        setPassword('');
        setPhoneNumber('');
        setCreatedDate('');
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
    const filterEdemployees = Object.keys(employees).filter((key) => {
        const employeesName = employees[key]?.name || ''; // Sử dụng '' nếu name là undefined
        return removeVietnameseTones(employeesName.toLowerCase()).includes(removeVietnameseTones(searchTerm.toLowerCase()));
    });
    return (
        <div className="container">
            <h1>Quản lý nhân viên</h1>

            <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: '10px' }} />
            <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ marginBottom: '10px' }} />
            <input placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} style={{ marginBottom: '10px' }} />
            <input placeholder="UserName" type="username" value={username} onChange={(e) => setuserName(e.target.value)} style={{ marginBottom: '10px' }} />
            <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ marginBottom: '10px', }} />

            <button onClick={handleAdd}>Thêm</button>
            <button onClick={handleUpdate} disabled={!id}>Cập nhật</button>

            <h2>Danh sách nhân viên</h2>
            <div>
                <input
                    placeholder="Nhập tên nhân viên cần tìm"
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
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Tên đăng nhập</th>
                            <th>Ngày tạo</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filterEdemployees.map((key) => (
                            <tr key={key}>
                                <td>{employees[key].name}</td>
                                <td>{employees[key].email}</td>
                                <td>{employees[key].phoneNumber}</td>
                                <td>{employees[key].username}</td>
                                <td>{employees[key].createdDate}</td>
                                <td>{employees[key].status}</td>
                                <td>
                                    <button onClick={() => handleDelete(employees[key].id)}>Xóa</button>
                                    <button onClick={() => handleEdit(employees[key])}>Sửa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Personnel_management;

