import React, { useState, useEffect } from 'react';
import { addEmployee, updateEmployee, getEmployees, deleteEmployee } from '../models/Employee_Model';

import '../screes/csss/OrderManagerScreen.css';

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
    const [currentOrderId, setCurrentOrderId] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState(false);
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

    const closeDialog = () => {
        setConfirmDialog(false);
        setCurrentOrderId(null);
    };
    return (
        <div className="body">
            <h1>Quản lý nhân viên</h1>
            <div style={{ display: 'flex', gap: '200px' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input placeholder="Tên nhân viên" value={name} onChange={(e) => setName(e.target.value)} style={{
                            marginBottom: '10px',
                            flex: 1,
                            padding: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                        }} />
                        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{
                            marginBottom: '10px',
                            flex: 1,
                            padding: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                        }} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input placeholder="Số điện thoại" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} style={{
                            marginBottom: '10px',
                            flex: 1,
                            padding: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                        }} />
                        <input placeholder="Tên đăng nhập" type="username" value={username} onChange={(e) => setuserName(e.target.value)} style={{
                            marginBottom: '10px',
                            flex: 1,
                            padding: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                        }} />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input placeholder="Mật khẩu" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{
                            marginBottom: '10px',
                            padding: 10,
                            width: "49%",
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                        }} />
                        <div style={{ flex: 1 }}>
                            <button onClick={handleAdd} style={{
                                marginRight: '10px',
                                padding: '10px',
                                backgroundColor: '#2196F3',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '14px',
                                color: 'white',
                                boxSizing: 'border-box',
                            }}>Thêm</button>
                            <button onClick={handleUpdate} disabled={!id} style={{
                                marginBottom: '10px',
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '14px',
                                color: 'white',
                                backgroundColor: '#2196F3',
                                boxSizing: 'border-box',
                            }}>Cập nhật</button>
                        </div>
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    <h3>Tìm kiếm</h3>
                    <input
                        placeholder="Nhập tên nhân viên cần tìm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
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
            </div>





            <div>

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
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody style={{ height: '55vh' }}>
                        {filterEdemployees.map((key) => (
                            <tr key={key}>
                                <td>{employees[key].name}</td>
                                <td style={{
                                    wordWrap: 'break-word', // Cho phép nội dung ngắt từ
                                    wordBreak: 'break-word', // Ngắt từ dài nếu cần
                                    whiteSpace: 'normal', // Cho phép nội dung xuống dòng
                                }}>{employees[key].email}</td>
                                <td>{employees[key].phoneNumber}</td>
                                <td>{employees[key].username}</td>
                                <td>{employees[key].createdDate}</td>
                                <td>{employees[key].status}</td>
                                <td>
                                    <button onClick={() => { setCurrentOrderId(employees[key].id); setConfirmDialog(true) }} style={{
                                        color: 'white',
                                        backgroundColor: '#2196F3',
                                    }}>Xóa</button>
                                    <div style={{ height: 5 }}></div>
                                    <button onClick={() => handleEdit(employees[key])} style={{
                                        color: 'white',
                                        backgroundColor: '#2196F3',
                                    }}>Sửa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {confirmDialog && (
                    <div className="confirmation-dialog">
                        <div style={{
                            width: 500, height: 100, backgroundColor: "white", textAlign: 'center',
                            borderRadius: 10, padding: 20
                        }}>
                            <h3>Xác nhận xóa nhân viên này không?</h3>

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
        </div >
    );
};

export default Personnel_management;

