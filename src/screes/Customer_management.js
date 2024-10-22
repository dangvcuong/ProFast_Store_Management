import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from "firebase/database";
import UserModel from '../models/KhachHang_Model'; // Import the user model
import { app } from '../firebaseConfig'; // Import Firebase app configuration
import { update } from "firebase/database";


const Customer_managenments = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true); // Thêm trạng thái loading
    const [error, setError] = useState(null); // Thêm trạng thái lỗi

    useEffect(() => {
        const db = getDatabase(app); // Sử dụng app đã khởi tạo
        const usersRef = ref(db, 'users'); // Trỏ đến nhánh users

        // Lấy dữ liệu từ Firebase
        const unsubscribe = onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            setLoading(false); // Dữ liệu đã tải xong
            if (data) {
                const usersArray = Object.keys(data).map(key => {
                    const user = data[key];

                    // Lấy địa chỉ của người dùng (nếu có)
                    const addresses = user.addresses ? Object.keys(user.addresses).map(addressKey => {
                        return user.addresses[addressKey];
                    }) : [];

                    // Khởi tạo đối tượng UserModel cho từng người dùng
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
                        addresses: addresses // Thêm danh sách địa chỉ
                    };
                });
                setUsers(usersArray); // Lưu danh sách người dùng vào state
            } else {
                setError('Không có người dùng nào.');
            }
        }, (error) => {
            setLoading(false);
            setError(`Lỗi khi tải dữ liệu: ${error.message}`);
        });

        return () => unsubscribe(); // Ngừng lắng nghe khi component unmount
    }, []);

    const deactivateUser = async (userId) => {
        const db = getDatabase();
        const userRef = ref(db, `users/${userId}`);

        try {
            await update(userRef, {
                status: 'Ngừng hoạt động',
            });
            console.log('Trạng thái người dùng đã được cập nhật thành Ngừng hoạt động.');
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái người dùng:', error);
        }
    };

    // Hiển thị khi đang tải
    if (loading) {
        return <div>Loading...</div>;
    }

    // Hiển thị thông báo lỗi nếu có
    if (error) {
        return <div>{error}</div>;
    }

    // Hiển thị danh sách người dùng theo dạng bảng
    return (
        <div style={{ margin: 20 }}>
            <h1>Danh sách người dùng</h1>
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
                    {users.map((user) => (
                        <tr key={user.userModel.id}>
                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{user.userModel.name}</td>
                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{user.userModel.email}</td>
                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{user.userModel.phoneNumber}</td>
                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{user.userModel.getFormattedDate()}</td>
                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{user.userModel.status}</td>
                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                <button onClick={() => deactivateUser(user.userModel.id)} >
                                    Customer reports
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Customer_managenments;
