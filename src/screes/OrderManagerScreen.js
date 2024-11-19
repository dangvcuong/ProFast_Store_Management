import React, { useState, useEffect } from 'react';
import { fetchOrders, confirmOrderStatus, cancelOrderStatus } from '../models/OrderModel';
import '../screes/csss/OrderManagerScreen.css';

const OrderManagerScreen = () => {
    const [orders, setOrders] = useState({});
    const [confirmDialog, setConfirmDialog] = useState(false); // Để mở hộp thoại xác nhận
    const [cancelDialog, setCancelDialog] = useState(false); // Để mở hộp thoại hủy
    const [currentOrderId, setCurrentOrderId] = useState(null); // Để lưu ID đơn hàng đang xác nhận
    const [productDetails, setProductDetails] = useState(null); // Để lưu thông tin chi tiết sản phẩm

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
        setConfirmDialog(false); // Đóng hộp thoại sau khi xác nhận
    };

    const handleCancelStatus = async (orderId) => {
        const result = await cancelOrderStatus(orderId);
        if (result) {
            alert('Trạng thái đơn hàng đã được cập nhật thành "Đã hủy"');
            fetchOrders(setOrders);
        } else {
            alert('Lỗi khi cập nhật trạng thái đơn hàng');
        }
        setCancelDialog(false); // Đóng hộp thoại sau khi hủy
    };

    const openConfirmDialog = (orderId) => {
        setCurrentOrderId(orderId);
        setConfirmDialog(true);
    };

    const openCancelDialog = (orderId) => {
        setCurrentOrderId(orderId);
        setCancelDialog(true);
    };

    const openProductDetails = (order) => {
        setProductDetails(order.products); // Lưu thông tin sản phẩm vào trạng thái
    };

    const closeDialog = () => {
        setConfirmDialog(false);
        setCancelDialog(false);
        setCurrentOrderId(null);
        setProductDetails(null); // Đóng chi tiết sản phẩm
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
                                    <td>{order.totalAmount ? `${Number(order.totalAmount).toLocaleString()} VND` : 'N/A'}</td>
                                    <td>Chuyển khoản</td>
                                    <td>
                                        <button className={order.orderStatus === 'Đã xác nhận' ? 'confirm' : order.orderStatus === 'Đã hủy' ? 'cancel' : 'pending'}>
                                            {order.orderStatus || 'Chờ xác nhận'}
                                        </button>
                                    </td>
                                    <td className="action-cell">
                                        <button className="confirm" onClick={() => openConfirmDialog(key)}>
                                            Xác nhận
                                        </button>
                                        <button className="cancel" onClick={() => openCancelDialog(key)}>
                                            Hủy
                                        </button>
                                        <button className="details" onClick={() => openProductDetails(order)}>
                                            Chi tiết
                                        </button>
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

            {/* Hộp thoại xác nhận */}
            {confirmDialog && (
                <div className="confirmation-dialog">
                    <div className="dialog-content">
                        <h3>Bạn có chắc chắn muốn xác nhận đơn hàng này?</h3>
                        <div className="dialog-footer">
                            <button onClick={() => handleConfirmStatus(currentOrderId)}>Đồng ý</button>
                            <button onClick={closeDialog}>Không</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hộp thoại hủy */}
            {cancelDialog && (
                <div className="confirmation-dialog">
                    <div className="dialog-content">
                        <h3>Bạn có chắc chắn muốn hủy đơn hàng này?</h3>
                        <div className="dialog-footer">
                            <button onClick={() => handleCancelStatus(currentOrderId)}>Đồng ý</button>
                            <button onClick={closeDialog}>Không</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hiển thị chi tiết sản phẩm */}
            {productDetails && (
                <div className="product-details-dialog">
                    <div className="dialog-content">
                        <h3>Chi tiết sản phẩm trong đơn hàng</h3>
                        <ul>
                            {productDetails.map((product, index) => (
                                <li key={index}>
                                    <p>Tên sản phẩm: {product.name}</p>
                                    <p>Giá: {product.price} VND</p>
                                    <p>Số lượng: {product.quantity}</p>
                                </li>
                            ))}
                        </ul>
                        <button onClick={closeDialog}>Đóng</button>
                    </div>
                </div>
            )}
        </div>
    );
};
//loi

export default OrderManagerScreen;
