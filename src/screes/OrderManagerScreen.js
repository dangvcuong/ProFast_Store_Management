import React, { useState, useEffect } from 'react';
import { fetchOrders, confirmOrderStatus, deliveryOrderStatus, cancelOrderStatus, updateOrderStatus } from '../models/OrderModel';
import '../screes/csss/OrderManagerScreen.css';
import { db } from '../firebaseConfig';
import { ref, get, update } from 'firebase/database';
const OrderManagerScreen = () => {
    const [orders, setOrders] = useState({});
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Lấy ngày hiện tại
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [confirmDialogdl, setConfirmDialogdl] = useState(false);
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

            // Sắp xếp theo orderDate giảm dần (mới nhất lên đầu)
            const sortedOrders = ordersArray
                .filter(order => order.orderDate && !isNaN(new Date(order.orderDate))) // Lọc ra các order có orderDate hợp lệ
                .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)); // Sắp xếp giảm dần

            setOrders(sortedOrders);

            // Lọc theo ngày hôm nay mặc định
            filterOrdersByDate(new Date().toISOString().split('T')[0], sortedOrders);
        });
    }, []);



    const updateProductSoldQuantity = async (productId, quantityToAdd) => {
        try {
            // Lấy reference tới sản phẩm trong Firebase
            const productRef = ref(db, `products/${productId}`);

            // Lấy dữ liệu của sản phẩm
            const snapshot = await get(productRef);
            console.log("ID SNPAM: ", productRef);

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

    const handleMarkAsDelivered = async (orderId) => {
        try {
            // Tìm đơn hàng theo orderId
            const order = orders.find(order => order.orderId === orderId);

            // Kiểm tra nếu đơn hàng không tồn tại
            if (!order) {
                console.error(`Không tìm thấy đơn hàng với ID: ${orderId}`);
                alert('Không tìm thấy đơn hàng. Vui lòng kiểm tra lại.');
                return;
            }

            // Kiểm tra trạng thái đơn hàng
            if (order.orderStatus !== 'Đang giao hàng') {
                alert('Chỉ có thể cập nhật trạng thái đơn hàng "Đang giao hàng" thành "Thành công".');
                return;
            }

            // Cập nhật trạng thái đơn hàng
            const result = await updateOrderStatus(orderId, 'Thành công');
            if (!result) {
                alert('Lỗi khi cập nhật trạng thái đơn hàng');
                return;
            }

            // Cập nhật số lượng bán được cho từng sản phẩm
            const updateResults = [];
            if (order.products && Array.isArray(order.products)) {
                for (const product of order.products) {
                    try {
                        const updateResult = await updateProductSoldQuantity(product.id, product.quantity);
                        updateResults.push(updateResult);
                    } catch (error) {
                        console.error(`Lỗi khi cập nhật số lượng bán cho sản phẩm ${product.id}:`, error);
                        updateResults.push(false);
                    }
                }
            } else {
                console.error('Danh sách sản phẩm không hợp lệ hoặc không tồn tại.');

                return;
            }

            // Kiểm tra kết quả cập nhật
            if (updateResults.every(result => result)) {
                alert('Trạng thái đơn hàng đã được cập nhật thành "Thành công".');
            } else {
                console.log('Lỗi khi cập nhật số lượng bán được cho một số sản phẩm. Vui lòng kiểm tra lại.');
            }

            // Làm mới danh sách đơn hàng
            fetchOrders(setOrders);
        } catch (error) {
            console.error('Lỗi khi xử lý cập nhật đơn hàng:', error);
            alert('Đã xảy ra lỗi trong quá trình xử lý. Vui lòng thử lại.');
        }
    };


    // Lọc danh sách đơn hàng theo ngày
    const filterOrdersByDate = (date, allOrders) => {
        // Kiểm tra allOrders có phải là mảng không
        if (!Array.isArray(allOrders)) {
            console.error("allOrders không phải là mảng:", allOrders);
            return;
        }

        const filtered = allOrders.filter(order => {
            if (!order.orderDate) return false; // Bỏ qua nếu không có orderDate
            const orderDate = new Date(order.orderDate);
            if (isNaN(orderDate)) return false; // Bỏ qua nếu orderDate không hợp lệ

            return orderDate.toISOString().split('T')[0] === date; // So sánh ngày
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
        updateOrdersList()
    };
    const handledelivery = async (orderId) => {
        await deliveryOrderStatus(orderId);
        updateOrdersList()
    };

    const handleCancelStatus = async (orderId) => {
        await cancelOrderStatus(orderId);

        updateOrdersList()
    };



    const updateOrdersList = () => {
        fetchOrders((data) => {
            if (!data || typeof data !== 'object') {
                console.error("Dữ liệu không hợp lệ:", data);
                return;
            }

            // Chuyển dữ liệu từ object sang array và thêm orderId
            const updatedOrders = Object.keys(data)
                .map(key => ({
                    ...data[key],
                    orderId: key,
                }))
                .filter(order => order.orderDate && !isNaN(new Date(order.orderDate))); // Lọc ra orderDate hợp lệ

            // Sắp xếp theo ngày giảm dần (mới nhất lên đầu)
            const sortedOrders = updatedOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

            // Lưu danh sách đơn hàng và lọc theo ngày được chọn
            setOrders(sortedOrders);
            filterOrdersByDate(selectedDate, sortedOrders);
        });
    };



    const openProductDetails = (order) => {
        setProductDetails(order);
    };

    const closeDialog = () => {
        setConfirmDialog(false);
        setCancelDialog(false);
        setCurrentOrderId(null);
        setProductDetails(null);
        setConfirmDialogSX(false);
        setConfirmDialogdl(false);
    };
    const handleSelectAction = (event, order) => {
        const selectedAction = event.target.value;

        // Kiểm tra hành động đã chọn và gọi các hàm xử lý tương ứng
        if (selectedAction === 'Xác nhận') {
            setCurrentOrderId(order.orderId);
            setConfirmDialog(true);
        } else if (selectedAction === 'Đang giao') {
            setCurrentOrderId(order.orderId);
            setConfirmDialogdl(true);
        }
        else if (selectedAction === 'Hủy đơn') {
            setCurrentOrderId(order.orderId);
            setCancelDialog(true);
        } else if (selectedAction === 'Thành công') {
            setCurrentOrderId(order.orderId);
            setConfirmDialogSX(true);

        }
        else if (selectedAction === 'Chi tiết') {
            openProductDetails(order);

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
            <table style={{ width: "100%", height: 100, bordercollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Mã đơn hàng</th>
                        <th>Ngày tạo</th>
                        <th>Người mua</th>
                        <th>Tổng tiền</th>
                        <th>Thanh toán</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody style={{ height: '70vh' }}>
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order, index) => (
                            <tr key={order.orderId}>
                                <td>{index + 1}</td>
                                <td>{order.orderId}</td>
                                <td>{order.orderDate ? new Date(order.orderDate).toLocaleString() : 'N/A'}</td>
                                <td>{order.shippingAddress ? order.shippingAddress.nameAddresUser : 'N/A'}</td>
                                <td>{order.totalAmount ? `${Number(order.totalAmount).toLocaleString()} VND` : 'N/A'}</td>
                                <td>
                                    {order.totalAmount > 0 ? 'Tiền mặt' : 'Ví Grofast'}
                                </td>
                                <td>{order.orderStatus}</td>
                                <td className=" ">
                                    <select
                                        value={order.orderStatus}
                                        onChange={(e) => handleSelectAction(e, order)}
                                        className="action-select"
                                    >
                                        <option value={order.orderStatus} disabled>
                                            {order.orderStatus}
                                        </option>
                                        <option value="Xác nhận" disabled={order.orderStatus === 'Đã xác nhận' || order.orderStatus === 'Đang giao hàng' || order.orderStatus === 'Thành công' || order.orderStatus === 'Đã hủy'}>
                                            Xác nhận
                                        </option>
                                        <option value="Đang giao" disabled={order.orderStatus === 'Đang chờ xác nhận' || order.orderStatus === 'Đang giao hàng' || order.orderStatus === 'Thành công' || order.orderStatus === 'Đã hủy'}>
                                            Đang giao
                                        </option>
                                        <option value="Thành công" disabled={order.orderStatus === 'Đang chờ xác nhận' || order.orderStatus === 'Đã xác nhận' || order.orderStatus === 'Thành công' || order.orderStatus === 'Đã hủy'}>
                                            Thành công
                                        </option>
                                        <option value="Hủy đơn" disabled={order.orderStatus === 'Thành công' || order.orderStatus === 'Đã hủy' || order.orderStatus === 'Đang giao hàng' || order.orderStatus === 'Đã xác nhận'}>
                                            Hủy đơn
                                        </option>
                                        <option value="Chi tiết">
                                            Chi tiết
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
            {
                confirmDialog && (
                    <div className="confirmation-dialog">
                        <div style={{ width: 500, height: 100, backgroundColor: "white", textAlign: 'center', borderRadius: 10, padding: 10 }}>
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
                )
            }
            {
                confirmDialogdl && (
                    <div className="confirmation-dialog">
                        <div style={{ width: 500, height: 100, backgroundColor: "white", textAlign: 'center', borderRadius: 10, padding: 10 }}>
                            <h3>Xác nhận đơn hàng #{currentOrderId} đang giao hàng?</h3>

                            <div className="dialog-footer">
                                <button onClick={() => { handledelivery(currentOrderId); closeDialog(); }} style={{
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
                )
            }
            {
                confirmDialogSx && (
                    <div className="confirmation-dialog">
                        <div style={{ width: 500, height: 100, backgroundColor: "white", textAlign: 'center', borderRadius: 10, padding: 20 }}>
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
                )
            }

            {
                cancelDialog && (
                    <div className="confirmation-dialog">
                        <div style={{ width: 500, height: 100, backgroundColor: "white", textAlign: 'center', borderRadius: 10, padding: 20 }}>
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
                )
            }


            {/* Product details dialog */}
            {productDetails && (
                <div className="product-details-dialog">
                    <div className="dialog-overlay" onClick={closeDialog}></div>
                    <div className="dialog-content">
                        <h3>Chi tiết đơn hàng #{productDetails.orderId}</h3>
                        <div className="order-info">
                            <p><strong>Tên khách hàng:</strong> {productDetails.shippingAddress?.nameAddresUser || 'N/A'}</p>
                            <p><strong>Số điện thoại:</strong> {productDetails.shippingAddress?.phoneAddresUser || 'N/A'}</p>
                            <p><strong>Ngày đặt:</strong> {new Date(productDetails.orderDate).toLocaleString() || 'N/A'}</p>
                            <p><strong>Tổng tiền:</strong> {productDetails.totalAmount ? `${Number(productDetails.totalAmount).toLocaleString()} VND` : 'N/A'}</p>
                            <p><strong>Phương thức thanh toán:</strong> {productDetails.totalAmount > 0 ? 'Tiền mặt' : 'Ví Grofast'}</p>
                            <p><strong>Trạng thái:</strong> {productDetails.orderStatus || 'N/A'}</p>
                            <p><strong>Địa chỉ:</strong> {productDetails.shippingAddress?.addressUser || 'N/A'}</p>
                        </div>
                        <h4>Sản phẩm trong đơn hàng</h4>
                        <div className="product-list">
                            {productDetails.products.map((product, index) => (
                                <div key={index} className="product-item">
                                    <div className="product-image">

                                        <img src={product.imageUrl} alt={product.name} />
                                    </div>
                                    <div className="product-info">

                                        <p><strong>Tên:</strong> {product.name}</p>
                                        <p><strong>Số lượng:</strong> {product.quantity}</p>
                                        <p><strong>Giá:</strong> {Number(product.price).toLocaleString()} VND</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div>
                            <button onClick={closeDialog} className="close-button">Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default OrderManagerScreen;
