import React, { useState, useEffect } from 'react';
import { fetchOrders, confirmOrderStatus, cancelOrderStatus, updateOrderStatus } from '../models/OrderModel';
import '../screes/csss/OrderManagerScreen.css';

const OrderManagerScreen = () => {
    const [orders, setOrders] = useState({});
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Lấy ngày hiện tại
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [confirmDialogSx, setConfirmDialogSX] = useState(false);
    const [cancelDialog, setCancelDialog] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState(null);
    const [productDetails, setProductDetails] = useState(null);

    // Lấy danh sách đơn hàng
    useEffect(() => {
        fetchOrders((data) => {
            if (!data || typeof data !== 'object') {
                console.error("Dữ liệu không hợp lệ:", data);
                return;
            }

            const ordersArray = Object.keys(data).map(key => ({
                ...data[key],
                orderId: key,
            }));

            // Sắp xếp đơn hàng theo thời gian tạo (mới nhất lên đầu)
            const sortedOrders = ordersArray.sort((a, b) => {
                // Đảm bảo "createdAt" là ngày hợp lệ, nếu không sẽ sắp xếp theo giá trị mặc định
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);

                // So sánh thời gian chính xác (mới nhất lên đầu)
                return dateB - dateA;  // Nếu muốn mới nhất lên đầu
            });

            // Lưu danh sách đơn hàng đã được sắp xếp
            setOrders(sortedOrders);

            // Lọc theo ngày hôm nay mặc định
            filterOrdersByDate(new Date().toISOString().split('T')[0], sortedOrders);
        });
    }, []);




    // Lọc danh sách đơn hàng theo ngày
    const filterOrdersByDate = (date, allOrders) => {
        const filtered = allOrders.filter(order => {
            const orderDate = new Date(order.orderDate).toISOString().split('T')[0];
            return orderDate === date;
        });
        setFilteredOrders(filtered);
    };

    // Xử lý khi chọn ngày
    const handleDateChange = (event) => {
        const selected = event.target.value;
        setSelectedDate(selected);
        filterOrdersByDate(selected, orders);
    };

    const handleConfirmStatus = async (orderId) => {
        await confirmOrderStatus(orderId);
    };

    const handleCancelStatus = async (orderId) => {
        await cancelOrderStatus(orderId);


    };

    const handleMarkAsDelivered = async (orderId) => {
        const order = orders.find(order => order.orderId === orderId);
        if (order.orderStatus !== 'Đang giao hàng') {
            alert('Chỉ có thể cập nhật trạng thái đơn hàng "Đang giao hàng" thành "Thành công".');
            return;
        }
        await updateOrderStatus(orderId, 'Thành công');

    };

    // const updateOrdersList = () => {
    //     fetchOrders((data) => {
    //         const updatedOrders = Object.keys(data).map(key => ({
    //             ...data[key],
    //             orderId: key,
    //         }));
    //         setOrders(updatedOrders);
    //         filterOrdersByDate(selectedDate, updatedOrders);
    //     });
    // };


    const openProductDetails = (order) => {
        setProductDetails(order.products);
    };

    const closeDialog = () => {
        setConfirmDialog(false);
        setCancelDialog(false);
        setCurrentOrderId(null);
        setProductDetails(null);
        setConfirmDialogSX(false);
    };
    const handleSelectAction = (event, order) => {
        const selectedAction = event.target.value;

        // Kiểm tra hành động đã chọn và gọi các hàm xử lý tương ứng
        if (selectedAction === 'Xác nhận') {
            setCurrentOrderId(order.orderId);
            setConfirmDialog(true);
        } else if (selectedAction === 'Hủy đơn') {
            setCurrentOrderId(order.orderId);
            setCancelDialog(true);
        } else if (selectedAction === 'Thành công') {
            setCurrentOrderId(order.orderId);
            setConfirmDialogSX(true);

        }
    };



    return (
        <div className="body">
            <h1>Quản lý Đơn hàng</h1>

            {/* Bộ lọc ngày */}
            <div className="filter-section">
                <label htmlFor="datePicker">Chọn ngày:</label>
                <input
                    id="datePicker"
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                />
            </div>

            {/* Bảng hiển thị danh sách đơn hàng */}
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
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order, index) => (
                            <tr key={order.orderId}>
                                <td>{index + 1}</td>
                                <td>{order.orderId}</td>
                                <td>{order.orderDate ? new Date(order.orderDate).toLocaleString() : 'N/A'}</td>
                                <td>{order.shippingAddress ? order.shippingAddress.nameAddresUser : 'N/A'}</td>
                                <td>{order.totalAmount ? `${Number(order.totalAmount).toLocaleString()} VND` : 'N/A'}</td>
                                <td>Chuyển khoản</td>
                                <td>
                                    <button
                                        className="details"
                                        onClick={() => openProductDetails(order)}
                                    >
                                        Chi tiết
                                    </button>
                                </td>
                                <td className=" ">
                                    <select
                                        value={order.orderStatus}
                                        onChange={(e) => handleSelectAction(e, order)}
                                        className="action-select"
                                    >
                                        <option value={order.orderStatus} disabled>
                                            {order.orderStatus}
                                        </option>
                                        <option value="Xác nhận" disabled={order.orderStatus === 'Đang giao hàng' || order.orderStatus === 'Thành công' || order.orderStatus === 'Đã hủy'}>
                                            Xác nhận
                                        </option>
                                        <option value="Thành công" disabled={order.orderStatus === 'Thành công' || order.orderStatus === 'Đã hủy'}>
                                            Thành công
                                        </option>
                                        <option value="Hủy đơn" disabled={order.orderStatus === 'Đã hủy'}>
                                            Hủy đơn
                                        </option>

                                    </select>
                                </td>




                            </tr>
                        ))
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
                        <h3>Xác nhận đơn hàng #{currentOrderId}?</h3>

                        <div className="dialog-footer">
                            <button onClick={() => { handleConfirmStatus(currentOrderId); closeDialog(); }} style={{
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
            {confirmDialogSx && (
                <div className="confirmation-dialog">
                    <div className="dialog-content">
                        <h3>Bạn có chắc chắn đơn hàng này #{currentOrderId} đã giao thành công?</h3>

                        <div className="dialog-footer">
                            <button onClick={() => { handleMarkAsDelivered(currentOrderId); closeDialog(); }} style={{
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

            {cancelDialog && (
                <div className="confirmation-dialog">
                    <div className="dialog-content">
                        <h3>Bạn có chắc chắn muốn hủy đơn hàng này #{currentOrderId}?</h3>
                        <div className="dialog-footer">
                            <button onClick={() => { handleCancelStatus(currentOrderId); closeDialog(); }} style={{
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
                                        <button className="close-dialog-btn" onClick={closeDialog} style={{
                                            color: 'white',
                                            backgroundColor: '#2196F3',
                                        }}>Đóng</button>
                                    </div>
                                </div>
                            )}
                        </ul>
                        <button onClick={closeDialog}>Đóng</button>
                    </div>
                </div>
            )}
        </div >
    );
};

export default OrderManagerScreen;
