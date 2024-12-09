import { getDatabase, ref, get, query } from "firebase/database";
import dayjs from "dayjs";

/**
 * Hàm lấy dữ liệu thống kê từ Firebase
 * @param {string|null} startDate - Ngày bắt đầu (chuỗi định dạng "YYYY-MM-DD", ví dụ: "2024-01-01")
 * @param {string|null} endDate - Ngày kết thúc (chuỗi định dạng "YYYY-MM-DD", ví dụ: "2024-01-31")
 * @param {string} mode - Chế độ thống kê ("daily" hoặc "monthly")
 * @returns {Promise<{dailyStats?: Object, monthlyRevenue?: Object, productSales?: Object}>}
 */
const fetchStatisticsData = async (startDate = null, endDate = null, mode = "monthly") => {
    const db = getDatabase(); // Kết nối tới Firebase Database
    const ordersRef = ref(db, "/orders"); // Đường dẫn tới danh sách đơn hàng trong Firebase

    try {
        // Lấy tất cả đơn hàng từ Firebase
        const snapshot = await get(query(ordersRef));
        if (snapshot.exists()) {
            const orders = snapshot.val(); // Dữ liệu đơn hàng
            let dailyStats = {}; // Thống kê theo ngày
            let monthlyRevenue = {}; // Thống kê doanh thu theo tháng
            let productSales = {}; // Số lượng sản phẩm bán ra

            // Chuyển đổi startDate và endDate sang định dạng Date
            const start = startDate ? dayjs(startDate).startOf("day").toDate() : null;
            const end = endDate ? dayjs(endDate).endOf("day").toDate() : null;

            // Xử lý từng đơn hàng
            Object.values(orders).forEach((order) => {
                if (order.orderStatus === "Thành công") { // Chỉ xét các đơn hàng "Thành công"
                    const orderDate = order.orderDate ? new Date(order.orderDate) : null;
                    if (!orderDate || isNaN(orderDate)) return; // Bỏ qua đơn hàng không hợp lệ

                    // Lọc theo khoảng thời gian
                    if ((start && orderDate < start) || (end && orderDate > end)) return;

                    // Định dạng theo ngày và tháng
                    const formattedDate = dayjs(orderDate).format("YYYY-MM-DD"); // Ngày
                    const monthYear = dayjs(orderDate).format("MM-YYYY"); // Tháng

                    // === Thống kê theo ngày ===
                    if (mode === "daily") {
                        if (!dailyStats[formattedDate]) {
                            dailyStats[formattedDate] = { totalOrders: 0, totalRevenue: 0 };
                        }
                        dailyStats[formattedDate].totalOrders += 1; // Tăng số đơn hàng
                        const products = order.products || [];
                        products.forEach((product) => {
                            const productRevenue =
                                parseFloat(product.price || "0") * parseInt(product.quantity || "0");
                            dailyStats[formattedDate].totalRevenue += productRevenue;
                        });
                    }

                    // === Thống kê theo tháng ===
                    if (mode === "monthly") {
                        if (!monthlyRevenue[monthYear]) {
                            monthlyRevenue[monthYear] = 0;
                        }
                        const products = order.products || [];
                        products.forEach((product) => {
                            const productRevenue =
                                parseFloat(product.price || "0") * parseInt(product.quantity || "0");
                            monthlyRevenue[monthYear] += productRevenue;

                            // Thống kê số lượng sản phẩm
                            const productName = product.name || "Sản phẩm không tên";
                            productSales[productName] =
                                (productSales[productName] || 0) + parseInt(product.quantity || "0");
                        });
                    }
                }
            });

            // Trả về dữ liệu theo chế độ
            if (mode === "daily") {
                return { dailyStats };
            } else if (mode === "monthly") {
                return { monthlyRevenue, productSales };
            }
        } else {
            console.log("Không có đơn hàng nào!");
            return mode === "daily"
                ? { dailyStats: {} }
                : { monthlyRevenue: {}, productSales: {} };
        }
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu thống kê:", error.message);
        return mode === "daily"
            ? { dailyStats: {} }
            : { monthlyRevenue: {}, productSales: {} };
    }
};

export default fetchStatisticsData;
