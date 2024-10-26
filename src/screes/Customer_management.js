import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, update } from "firebase/database";
import UserModel from '../models/KhachHang_Model'; // Import the user model
import { app } from '../firebaseConfig'; // Import Firebase app configuration

const Customer_managenments = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

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
        const confirmLogout = window.confirm("Bạn có chắc chắn muốn tố cáo tài khoản này không?");
        if (confirmLogout) {
            try {
                await update(userRef, { status: 'Ngừng hoạt động' });
                console.log('Trạng thái người dùng đã được cập nhật thành Ngừng hoạt động.');
            } catch (error) {
                console.error('Lỗi khi cập nhật trạng thái người dùng:', error);
            }
        }

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
                <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
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
                                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{user.userModel.name}</td>
                                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{user.userModel.email}</td>
                                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{user.userModel.phoneNumber}</td>
                                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{user.userModel.dateCreated}</td>
                                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{user.userModel.status}</td>
                                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                    <button onClick={() => deactivateUser(user.userModel.id)}>
                                        Customer reports
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Customer_managenments;
