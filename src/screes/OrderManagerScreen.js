import React, { useState, useEffect } from 'react';
import { fetchOrders, confirmOrderStatus, cancelOrderStatus } from '../models/OrderModel';
import '../screes/csss/OrderManagerScreen.css';

const OrderManagerScreen = () => {
    const [orders, setOrders] = useState({});

    useEffect(() => {
        fetchOrders((data) => {
            console.log("Dữ liệu nhận được:", data);
            setOrders(data);
        });
    }, []);

    const handleConfirmStatus = async (orderId) => {
        const result = await confirmOrderStatus(orderId);
        if (result) {
            alert('Trạng thái đơn hàng đã được cập nhật');
            fetchOrders(setOrders);
        } else {
            alert('Lỗi khi cập nhật trạng thái đơn hàng');
        }
    };

    const handleCancelStatus = async (orderId) => {
        const result = await cancelOrderStatus(orderId);
        if (result) {
            alert('Trạng thái đơn hàng đã được cập nhật thành "Đã hủy"');
            fetchOrders(setOrders);
        } else {
            alert('Lỗi khi cập nhật trạng thái đơn hàng');
        }
    };

    return (
        <div className="container">
            <h1>Quản lý Đơn hàng</h1>
            <table>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Mã đơn hàng</th>
                        <th>Ngày tạo</th>
                        <th>Người mua</th>
                        <th>Sản phẩm</th>
                        <th>Giá</th>
                        <th>Thanh toán</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {orders && Object.keys(orders).length > 0 ? (
                        Object.keys(orders).map((key, index) => {
                            const order = orders[key];
                            return (
                                <tr key={key}>
                                    <td>{index + 1}</td>
                                    <td>{key}</td>
                                    <td>{order.orderDate ? new Date(order.orderDate).toLocaleString() : 'N/A'}</td>
                                    <td>{order.shippingAddress ? order.shippingAddress.nameAddresUser : 'N/A'}</td>
                                    <td>{order.products ? order.products[0].name : 'N/A'}</td>
                                    <td>{order.totalAmount ? `${Number(order.totalAmount).toLocaleString()} VND` : 'N/A'}</td>
                                    <td>Chuyển khoản</td>
                                    <td>
                                        <button className={order.orderStatus === 'Đã xác nhận' ? 'confirm' : order.orderStatus === 'Đã hủy' ? 'cancel' : 'pending'}>
                                            {order.orderStatus || 'Chờ xác nhận'}
                                        </button>
                                    </td>
                                    <td className="action-cell">
                                        <button className="confirm" onClick={() => handleConfirmStatus(key)}>
                                            Xác nhận
                                        </button>
                                        <button className="cancel" onClick={() => handleCancelStatus(key)}>
                                            Huỷ
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="9">Không có đơn hàng nào</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default OrderManagerScreen;
