import React, { useState, useEffect } from 'react';
import { fetchOrders, confirmOrderStatus, cancelOrderStatus, updateOrderStatus } from '../models/OrderModel';
import '../screes/csss/OrderManagerScreen.css';

const OrderManagerScreen = () => {
    const [orders, setOrders] = useState({});
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [cancelDialog, setCancelDialog] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState(null);
    const [productDetails, setProductDetails] = useState(null);

    useEffect(() => {
        fetchOrders((data) => {
            console.log("Dữ liệu nhận được:", data);
            const sortedOrders = Object.keys(data)
                .map(key => ({
                    ...data[key],
                    orderId: key,
                }))
                .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

            const sortedOrdersObject = sortedOrders.reduce((acc, order) => {
                acc[order.orderId] = order;
                return acc;
            }, {});

            setOrders(sortedOrdersObject);
        });
    }, []);

    const handleConfirmStatus = async (orderId) => {
        const result = await confirmOrderStatus(orderId);
        if (result) {
            alert('Trạng thái đơn hàng đã được cập nhật thành "Đang giao hàng"');
            updateOrdersList();
        } else {
            alert('Lỗi khi cập nhật trạng thái đơn hàng');
        }
        setConfirmDialog(false);
    };

    const handleCancelStatus = async (orderId) => {
        const result = await cancelOrderStatus(orderId);
        if (result) {
            alert('Trạng thái đơn hàng đã được cập nhật thành "Đã hủy"');
            updateOrdersList();
        } else {
            alert('Lỗi khi cập nhật trạng thái đơn hàng');
        }
        setCancelDialog(false);
    };

    const handleMarkAsDelivered = async (orderId) => {
        const order = orders[orderId];
        if (order.orderStatus !== 'Đang giao hàng') {
            alert('Chỉ có thể cập nhật trạng thái đơn hàng "Đang giao hàng" thành "Thành công".');
            return;
        }

        const confirmed = window.confirm('Bạn có chắc chắn muốn đánh dấu đơn hàng này là đã giao thành công?');
        if (confirmed) {
            const result = await updateOrderStatus(orderId, 'Thành công');
            if (result) {
                alert('Đơn hàng đã được cập nhật thành công.');
                updateOrdersList();
            } else {
                alert('Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng.');
            }
        }
    };

    const updateOrdersList = () => {
        fetchOrders((data) => {
            const updatedOrders = { ...data };
            const sortedOrders = Object.keys(updatedOrders)
                .map(key => ({
                    ...updatedOrders[key],
                    orderId: key,
                }))
                .sort((a, b) => {
                    if (a.orderStatus === 'Đã xác nhận' && b.orderStatus !== 'Đã xác nhận') return 1;
                    if (b.orderStatus === 'Đã xác nhận' && a.orderStatus !== 'Đã xác nhận') return -1;
                    return new Date(b.orderDate) - new Date(a.orderDate);
                });

            const sortedOrdersObject = sortedOrders.reduce((acc, order) => {
                acc[order.orderId] = order;
                return acc;
            }, {});

            setOrders(sortedOrdersObject);
        });
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
        setProductDetails(order.products);
    };

    const closeDialog = () => {
        setConfirmDialog(false);
        setCancelDialog(false);
        setCurrentOrderId(null);
        setProductDetails(null);
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
                                        {(order.orderStatus === 'Thành công' || order.orderStatus === 'Đã hủy') ? (
                                            <button
                                                className="details"
                                                onClick={() => openProductDetails(order)}
                                            >
                                                Chi tiết
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    className="confirm"
                                                    onClick={() => openConfirmDialog(key)}
                                                >
                                                    Xác nhận
                                                </button>
                                                <button
                                                    className="cancel"
                                                    onClick={() => openCancelDialog(key)}
                                                >
                                                    Hủy
                                                </button>
                                                {order.orderStatus === 'Đang giao hàng' && (
                                                    <button
                                                        className="success"
                                                        onClick={() => handleMarkAsDelivered(key)}
                                                    >
                                                        Giao thành công
                                                    </button>
                                                )}
                                                <button
                                                    className="details"
                                                    onClick={() => openProductDetails(order)}
                                                >
                                                    Chi tiết
                                                </button>
                                            </>
                                        )}
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

            {productDetails && (
                <div className="product-details-dialog">
                    <div className="dialog-content">
                        <h3>Chi tiết sản phẩm trong đơn hàng</h3>
                        <ul>
                            {productDetails && (
                                <div className="product-details-dialog">
                                    <div className="dialog-overlay" onClick={closeDialog}></div>
                                    <div className="dialog-content">
                                        <h3>Chi tiết sản phẩm trong đơn hàng</h3>
                                        <div className="product-grid">
                                            {productDetails.map((product, index) => (
                                                <div key={index} className="product-item">
                                                    <div className="product-image">
                                                        <img
                                                            src={product.imageUrl || '/default-product-image.png'}
                                                            alt={product.name}
                                                        />
                                                    </div>
                                                    <div className="product-info">
                                                        <p><strong>Tên sản phẩm:</strong> {product.name}</p>
                                                        <p><strong>Giá:</strong> {product.price.toLocaleString()} VND</p>
                                                        <p><strong>Số lượng:</strong> {product.quantity}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="close-dialog-btn" onClick={closeDialog}>Đóng</button>
                                    </div>
                                </div>
                            )}
                        </ul>
                        <button onClick={closeDialog}>Đóng</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagerScreen;

