import React, { useState, useEffect } from 'react';
import { addEmployee, updateEmployee, getEmployees, deleteEmployee } from '../models/Employee_Model';

import '../screes/csss/Personnel_management.css'; // Import file CSS đã tạo

const Personnel_management = () => {
    const [employees, setEmployees] = useState({});
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [position, setPosition] = useState('');
    const [createdDate, setCreatedDate] = useState('');

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        const employeesData = await getEmployees();
        setEmployees(employeesData);
    };

    const handleAdd = async () => {
        if (!name || !email || !password || !status || !phoneNumber || !position) {
            alert('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        const employee = { name, email, password, status, phoneNumber, position };
        await addEmployee(employee);
        loadEmployees();
        resetForm();
    };

    const handleUpdate = async () => {
        if (!id || !name || !email || !password || !status || !phoneNumber || !position) {
            alert('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        const employee = { id, name, email, password, status, phoneNumber, position, createdDate };
        await updateEmployee(employee);
        loadEmployees();
        resetForm();
    };

    const handleEdit = (employee) => {
        setId(employee.id);
        setName(employee.name);
        setEmail(employee.email);
        setPassword(employee.password);
        setStatus(employee.status);
        setPhoneNumber(employee.phoneNumber);
        setPosition(employee.position);
        setCreatedDate(employee.createdDate);
    };

    const handleDelete = async (id) => {
        await deleteEmployee(id);
        loadEmployees();
    };

    const resetForm = () => {
        setId('');
        setName('');
        setEmail('');
        setPassword('');
        setStatus('');
        setPhoneNumber('');
        setPosition('');
        setCreatedDate('');
    };

    return (
        <div className="container">
            <h1>Quản lý nhân viên</h1>

            <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <input placeholder="Status" value={status} onChange={(e) => setStatus(e.target.value)} />
            <input placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            <input placeholder="Position" value={position} onChange={(e) => setPosition(e.target.value)} />

            <button onClick={handleAdd}>Thêm</button>
            <button onClick={handleUpdate} disabled={!id}>Cập nhật</button>

            <h2>Danh sách nhân viên</h2>
            <table>
                <thead>
                    <tr>
                        <th>Tên</th>
                        <th>Email</th>
                        <th>Số điện thoại</th>
                        <th>Ngày tạo</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(employees).map((key) => (
                        <tr key={key}>
                            <td>{employees[key].name}</td>
                            <td>{employees[key].email}</td>
                            <td>{employees[key].phoneNumber}</td>
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
    );
};

export default Personnel_management;

