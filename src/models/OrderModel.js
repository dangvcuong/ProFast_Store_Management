import { db } from '../firebaseConfig';
import { ref as dbRef, onValue, update } from 'firebase/database';

// Hàm lấy dữ liệu đơn hàng từ Firebase
export const fetchOrders = (callback) => {
    const ordersRef = dbRef(db, '/orders');
    onValue(
        ordersRef,
        (snapshot) => {
            const data = snapshot.val();
            console.log("Dữ liệu đơn hàng từ Firebase:", data);
            if (data) {
                callback(data);
            } else {
                callback({});
                console.log("Không có đơn hàng nào.");
            }
        },
        (error) => {
            console.error('Lỗi khi lấy dữ liệu:', error);
            callback({});
        }
    );
};

// Hàm cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (orderId, newStatus) => {
    const orderRef = dbRef(db, `/orders/${orderId}`);
    try {
        await update(orderRef, { orderStatus: newStatus });
        console.log(`Trạng thái đơn hàng đã được cập nhật thành "${newStatus}"`);
        return true;
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái:', error);
        return false;
    }
};

// Hàm cập nhật trạng thái đơn hàng thành "Đang giao hàng"
export const confirmOrderStatus = async (orderId) => {
    return updateOrderStatus(orderId, 'Đang giao hàng');
};

// Hàm cập nhật trạng thái đơn hàng thành "Đã hủy"
export const cancelOrderStatus = async (orderId) => {
    return updateOrderStatus(orderId, 'Đã hủy');
};

// Hàm cập nhật trạng thái đơn hàng thành "Thành công"
export const markOrderAsDelivered = async (orderId) => {
    return updateOrderStatus(orderId, 'Thành công');
};

