import React, { useState, useEffect } from 'react';
import {
    fetchOrders,
    confirmOrderStatus,
    cancelOrderStatus,
    markOrderAsDelivered,
} from '../models/OrderModel';
import '../screes/csss/OrderManagerScreen.css';
import { ref, get, update } from 'firebase/database';  // Import Realtime Database methods
import { db } from '../firebaseConfig'; // Ensure you're importing the correct Firebase instance

const OrderManagerScreen = () => {
    const [orders, setOrders] = useState({});
    const [confirmDialog, setConfirmDialog] = useState(false); // Hộp thoại xác nhận
    const [cancelDialog, setCancelDialog] = useState(false); // Hộp thoại hủy
    const [currentOrderId, setCurrentOrderId] = useState(null); // ID đơn hàng đang xử lý
    const [productDetails, setProductDetails] = useState(null); // Chi tiết sản phẩm

    useEffect(() => {
        fetchOrders((data) => setOrders(data));
    }, []);


    const updateProductSoldQuantity = async (productId, quantityToAdd) => {
        try {
            // Lấy reference tới sản phẩm trong Firebase
            const productRef = ref(db, `products/${productId}`);

            // Lấy dữ liệu của sản phẩm
            const snapshot = await get(productRef);

            // Kiểm tra xem sản phẩm có tồn tại trong DB không
            if (snapshot.exists()) {
                // Đảm bảo giá trị hiện tại là một số
                let currentQuantitySold = Number(snapshot.val().quantitysold || 0);
                let currentQuantity = Number(snapshot.val().quantity || 0);


                // Đảm bảo giá trị cần cộng thêm là một số
                const quantityToAddNumber = Number(quantityToAdd);

                if (isNaN(quantityToAddNumber)) {
                    console.error(`Số lượng cần cộng không hợp lệ: ${quantityToAdd}`);
                    return false;
                }

                // Cộng thêm số lượng bán mới
                const newQuantitySold = currentQuantitySold + quantityToAddNumber;
                const newsoluong = currentQuantity - quantityToAddNumber;
                // Cập nhật lại giá trị quantitysold trong Firebase
                await update(productRef, {
                    quantitysold: newQuantitySold,
                    quantity: newsoluong,
                });

                console.log(`Cập nhật thành công số lượng bán cho sản phẩm ${productId}`);
                return true;
            } else {
                console.error(`Sản phẩm không tồn tại: ${productId}`);
                return false;
            }
        } catch (error) {
            console.error(`Lỗi khi cập nhật số lượng bán cho sản phẩm ${productId}:`, error.message);
            return false;
        }
    };


    const handleConfirmStatus = async (orderId) => {
        const result = await confirmOrderStatus(orderId);
        if (result) {
alert('Trạng thái đơn hàng đã được cập nhật thành "Đang giao hàng"');
            fetchOrders(setOrders);
        } else {
            alert('Lỗi khi cập nhật trạng thái đơn hàng');
        }
        setConfirmDialog(false);
    };

    const handleCancelStatus = async (orderId) => {
        const result = await cancelOrderStatus(orderId);
        if (result) {
            alert('Trạng thái đơn hàng đã được cập nhật thành "Đã hủy"');
            fetchOrders(setOrders);
        } else {
            alert('Lỗi khi cập nhật trạng thái đơn hàng');
        }
        setCancelDialog(false);
    };

    const handleMarkAsDelivered = async (orderId) => {
        const result = await markOrderAsDelivered(orderId);
        if (result) {
            const order = orders[orderId];
            let updateResults = [];

            // Lặp qua từng sản phẩm trong đơn hàng
            for (const product of order.products) {
                try {
                    // Cập nhật số lượng đã bán
                    const updateResult = await updateProductSoldQuantity(product.id, product.quantity);
                    updateResults.push(updateResult);
                } catch (error) {
                    console.error(`Lỗi khi cập nhật số lượng bán cho sản phẩm ${product.id}: `, error);
                    updateResults.push(false); // If update fails, push false
                }
            }

            // Kiểm tra nếu tất cả cập nhật thành công
            if (updateResults.every(result => result)) {
                alert('Trạng thái đơn hàng đã được cập nhật thành "Thành công" và số lượng bán được đã được cập nhật.');
            } else {
                alert('Lỗi khi cập nhật số lượng bán được cho một số sản phẩm. Vui lòng kiểm tra lại.');
            }

            fetchOrders(setOrders); // Làm mới danh sách đơn hàng
        } else {
            alert('Lỗi khi cập nhật trạng thái đơn hàng');
        }
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
                                    <td>
                                        {order.orderDate
                                            ? new Date(order.orderDate).toLocaleString()
                                            : 'N/A'}
                                    </td>
                                    <td>
                                        {order.shippingAddress
                                            ? order.shippingAddress.nameAddresUser
                                            : 'N/A'}
                                    </td>
                                    <td>
                                        {order.totalAmount
                                            ? `${Number(order.totalAmount).toLocaleString()} VND`
                                            : 'N/A'}
                                    </td>
                                    <td>Chuyển khoản</td>
                                    <td>
                                        <button
                                            className={
                                                order.orderStatus === 'Thành công'
                                                    ? 'success'
                                                    : order.orderStatus === 'Đã hủy'
                                                        ? 'cancel'
                                                        : 'pending'
                                            }
                                        >
                                            {order.orderStatus || 'Chờ xác nhận'}
                                        </button>
                                    </td>
                                    <td className="action-cell">
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
                                        <button
className="details"
                                            onClick={() => openProductDetails(order)}
                                        >
                                            Chi tiết
                                        </button>
                                        {order.orderStatus === 'Đang giao hàng' && (
                                            <button
                                                className="success"
                                                onClick={() => handleMarkAsDelivered(key)}
                                            >
                                                Giao thành công
                                            </button>
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

            {/* Hộp thoại xác nhận */}
            {confirmDialog && (
                <div className="confirmation-dialog">
                    <div className="dialog-content">
                        <h3>Bạn có chắc chắn muốn xác nhận đơn hàng này?</h3>
                        <div className="dialog-footer">
                            <button onClick={() => handleConfirmStatus(currentOrderId)}>
                                Đồng ý
                            </button>
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
                            <button onClick={() => handleCancelStatus(currentOrderId)}>
                                Đồng ý
                            </button>
                            <button onClick={closeDialog}>Không</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hiển thị chi tiết sản phẩm */}
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
        </div>
    );
};

export default OrderManagerScreen;