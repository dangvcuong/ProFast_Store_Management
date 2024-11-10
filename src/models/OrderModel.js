// OrderModel.js
import { db } from '../firebaseConfig';
import { ref as dbRef, onValue, update } from 'firebase/database';

export const fetchOrders = (callback) => {
    const ordersRef = dbRef(db, '/orders');
    onValue(ordersRef, (snapshot) => {
        const data = snapshot.val();
        console.log("Dữ liệu đơn hàng từ Firebase:", data); // Log dữ liệu từ Firebase
        if (data) {
            callback(data); // Trả về dữ liệu nếu có
        } else {
            callback({}); // Trả về đối tượng rỗng nếu không có dữ liệu
            console.log("Không có đơn hàng nào.");
        }
    }, (error) => {
        console.error('Lỗi khi lấy dữ liệu:', error);
        callback({}); // Trả về đối tượng rỗng trong trường hợp có lỗi
    });
};



// Hàm cập nhật trạng thái đơn hàng thành "Đã xác nhận"
export const confirmOrderStatus = async (orderId, callback) => {
    const orderRef = dbRef(db, `/orders/${orderId}`);
    try {
        await update(orderRef, { orderStatus: 'Đã xác nhận' });
        console.log('Trạng thái đơn hàng đã được cập nhật');
        callback(true);  // Callback báo thành công
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái:', error);
        callback(false); // Callback báo lỗi
    }
};
