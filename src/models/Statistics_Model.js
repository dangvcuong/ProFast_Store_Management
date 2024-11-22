import { getDatabase, ref, get, query } from "firebase/database";
import dayjs from "dayjs";

/**
 * Hàm lấy dữ liệu thống kê từ Firebase
 * @param {string|null} startDate - Ngày bắt đầu (chuỗi định dạng "YYYY-MM-DD", ví dụ: "2024-01-01")
 * @param {string|null} endDate - Ngày kết thúc (chuỗi định dạng "YYYY-MM-DD", ví dụ: "2024-01-31")
 * @returns {Promise<{monthlyRevenue: Object, productSales: Object}>} 
 */
const fetchStatisticsData = async (startDate = null, endDate = null) => {
    const db = getDatabase(); // Kết nối đến Firebase Database
    const ordersRef = ref(db, '/orders'); // Đường dẫn tới danh sách đơn hàng trong Firebase

    try {
        // Lấy tất cả đơn hàng từ Firebase
        const snapshot = await get(query(ordersRef));
        if (snapshot.exists()) {
            const orders = snapshot.val(); // Dữ liệu đơn hàng
            let monthlyRevenue = {}; // Lưu trữ doanh thu theo tháng
            let productSales = {}; // Lưu trữ số lượng sản phẩm bán ra

            // Khởi tạo tất cả các tháng trong năm với giá trị mặc định là 0
            const months = [
                '01-2024', '02-2024', '03-2024', '04-2024', '05-2024', '06-2024',
                '07-2024', '08-2024', '09-2024', '10-2024', '11-2024', '12-2024'
            ];
            months.forEach(month => {
                monthlyRevenue[month] = 0; // Khởi tạo doanh thu mặc định
            });

            // Chuyển đổi startDate và endDate sang định dạng Date
            const start = startDate ? dayjs(startDate).startOf("day").toDate() : null;
            const end = endDate ? dayjs(endDate).endOf("day").toDate() : null;

            // Xử lý từng đơn hàng
            Object.values(orders).forEach(order => {
                if (order.orderStatus === "Thành công") { // Chỉ xét các đơn hàng "Thành công"
                    // Kiểm tra ngày đặt hàng
                    const orderDate = order.orderDate ? new Date(order.orderDate) : null;
                    if (!orderDate || isNaN(orderDate)) return; // Bỏ qua đơn hàng không hợp lệ

                    // Lọc theo khoảng thời gian
                    if ((start && orderDate < start) || (end && orderDate > end)) {
                        return; // Bỏ qua đơn hàng không nằm trong khoảng thời gian
                    }

                    // Định dạng tháng-năm của ngày đặt hàng
                    const monthYear = dayjs(orderDate).format("MM-YYYY");

                    // Tính toán doanh thu theo tháng
                    const products = order.products || [];
                    products.forEach(product => {
                        const productRevenue = parseFloat(product.price || "0") * parseInt(product.quantity || "0");
                        monthlyRevenue[monthYear] = (monthlyRevenue[monthYear] || 0) + productRevenue;

                        // Tính số lượng sản phẩm bán ra
                        const productName = product.name || "Sản phẩm không tên";
                        productSales[productName] = (productSales[productName] || 0) + parseInt(product.quantity || "0");
                    });
                }
            });

            // Trả về dữ liệu thống kê
            return { monthlyRevenue, productSales };
        } else {
            console.log("Không có đơn hàng nào!");
            return { monthlyRevenue: {}, productSales: {} };
        }
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu thống kê:", error.message);
        return { monthlyRevenue: {}, productSales: {} };
    }
};

export default fetchStatisticsData;
