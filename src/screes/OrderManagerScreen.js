import React, { useState, useEffect } from 'react';
import { fetchOrders, confirmOrderStatus } from '../models/OrderModel';
import '../screes/csss/OrderManagerScreen.css';

const OrderManagerScreen = () => {
    const [orders, setOrders] = useState({});

    useEffect(() => {
        fetchOrders((data) => {
            console.log("Dữ liệu nhận được:", data); // Kiểm tra dữ liệu đã tải
            setOrders(data);
        });
    }, []);

    const handleConfirmStatus = async (orderId) => {
        await confirmOrderStatus(orderId);
        alert('Trạng thái đơn hàng đã được cập nhật');
        fetchOrders(setOrders); // Cập nhật lại danh sách đơn hàng sau khi xác nhận
    };

    const handleViewDetails = (order) => {
        alert(JSON.stringify(order, null, 2));
    };

    return (
        <div className="container">
            <h1>Quản lý Đơn hàng</h1>
            <table>
                <thead>
                    <tr>
                        <th>Mã đơn hàng</th>
                        <th>Ngày đặt hàng</th>
                        <th>Trạng thái</th>
                        <th>Tổng số tiền</th>
                        <th>Tên người nhận</th>
                        <th>Tên sản phẩm</th>
                        <th>Số lượng</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {orders && Object.keys(orders).length > 0 ? (
                        Object.keys(orders).map((key) => {
                            const order = orders[key];
                            return (
                                <tr key={key}>
                                    <td>{key}</td>
                                    <td>
                                        {order.orderDate ? new Date(order.orderDate).toLocaleString() : 'Không có ngày đặt hàng'}
                                    </td>
                                    <td>{order.orderStatus || 'Chưa cập nhật'}</td>
                                    <td>{order.totalAmount ? `${Number(order.totalAmount).toLocaleString()} VND` : 'N/A'}</td>
                                    <td>{order.shippingAddress ? order.shippingAddress.nameAddresUser : 'Không có tên người nhận'}</td>
                                    <td>
                                        {order.products ? (
                                            <ul>
                                                {order.products.map((product, index) => (
                                                    <li key={index}>
                                                        <p>{product.name}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>Không có sản phẩm</p>
                                        )}
                                    </td>
                                    <td>
                                        {order.products ? (
                                            <ul>
                                                {order.products.map((product, index) => (
                                                    <li key={index}>
                                                        <p>{product.quantity}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>Không có sản phẩm</p>
                                        )}
                                    </td>
                                    <td>
                                        <div className="button-container">
                                            <button onClick={() => handleViewDetails(order)}>Xem chi tiết</button>
                                            <button onClick={() => handleConfirmStatus(key)}>Xác nhận</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="8">Không có đơn hàng nào</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default OrderManagerScreen;
