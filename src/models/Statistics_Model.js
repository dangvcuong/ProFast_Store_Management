import { getDatabase, ref, get, query } from "firebase/database";
import dayjs from "dayjs";

const fetchStatisticsData = async (startDate = null, endDate = null, mode = "monthly") => {
    const db = getDatabase();
    const ordersRef = ref(db, "/orders");

    try {
        const snapshot = await get(query(ordersRef));
        if (snapshot.exists()) {
            const orders = snapshot.val();
            let dailyStats = {};
            let monthlyRevenue = {};
            let productSales = {};
            let orderStatusCounts = {
                pending: 0,
                confirmed: 0,
                shipping: 0,
                completed: 0,
                cancelled: 0,
            };

            const start = startDate ? dayjs(startDate).startOf("day").toDate() : null;
            const end = endDate ? dayjs(endDate).endOf("day").toDate() : null;

            Object.values(orders).forEach((order) => {
                const orderDate = order.orderDate ? new Date(order.orderDate) : null;
                if (!orderDate || isNaN(orderDate)) return;

                if ((start && orderDate < start) || (end && orderDate > end)) return;

                const formattedDate = dayjs(orderDate).format("YYYY-MM-DD");
                const monthYear = dayjs(orderDate).format("MM-YYYY");

                // Thống kê trạng thái đơn hàng
                if (order.orderStatus === "Đang chờ xác nhận") {
                    orderStatusCounts.pending++;
                } else if (order.orderStatus === "Đã xác nhận") {
                    orderStatusCounts.confirmed++;
                } else if (order.orderStatus === "Đang giao hàng") {
                    orderStatusCounts.shipping++;
                } else if (order.orderStatus === "Thành công") {
                    orderStatusCounts.completed++;
                } else if (order.orderStatus === "Đã hủy") {
                    orderStatusCounts.cancelled++;
                }

                // === Thống kê theo ngày ===
                if (mode === "daily") {
                    if (!dailyStats[formattedDate]) {
                        dailyStats[formattedDate] = { totalOrders: 0, totalRevenue: 0, successfulOrders: 0, cancelledOrders: 0 };
                    }
                    dailyStats[formattedDate].totalOrders += 1;

                    const products = order.products || [];
                    let orderRevenue = 0; // Khởi tạo doanh thu cho đơn hàng này

                    // Chỉ tính doanh thu nếu đơn hàng thành công
                    if (order.orderStatus === "Thành công") {
                        dailyStats[formattedDate].successfulOrders += 1;
                        products.forEach((product) => {
                            const productRevenue = parseFloat(product.price || "0") * parseInt(product.quantity || "0");
                            orderRevenue += productRevenue; // Tính doanh thu cho đơn hàng
                        });
                        dailyStats[formattedDate].totalRevenue += orderRevenue; // Cộng doanh thu vào tổng doanh thu

                        // Cập nhật số lượng sản phẩm đã bán
                        products.forEach((product) => {
                            const productName = product.name || "Sản phẩm không tên";
                            productSales[productName] = (productSales[productName] || 0) + parseInt(product.quantity || "0");
                        });
                    } else if (order.orderStatus === "Đã hủy") {
                        dailyStats[formattedDate].cancelledOrders += 1; // Tăng số đơn hàng đã hủy
                    }
                }

                // Thống kê theo tháng
                if (mode === "monthly") {
                    if (order.orderStatus === "Thành công") {
                        if (!monthlyRevenue[monthYear]) {
                            monthlyRevenue[monthYear] = 0;
                        }
                        const products = order.products || [];
                        products.forEach((product) => {
                            const productRevenue = parseFloat(product.price || "0") * parseInt(product.quantity || "0");
                            monthlyRevenue[monthYear] += productRevenue; // Chỉ cộng doanh thu nếu đơn hàng thành công

                            // Cập nhật số lượng sản phẩm đã bán
                            const productName = product.name || "Sản phẩm không tên";
                            productSales[productName] = (productSales[productName] || 0) + parseInt(product.quantity || "0");
                        });
                    }
                }
            });

            if (mode === "daily") {
                return { dailyStats, orderStatusCounts, productSales };
            } else if (mode === "monthly") {
                return { monthlyRevenue, productSales };
            }
        } else {
            console.log("Không có đơn hàng nào!");
            return mode === "daily"
                ? { dailyStats: {}, orderStatusCounts: {}, productSales: {} }
                : { monthlyRevenue: {}, productSales: {} };
        }
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu thống kê:", error.message);
        return mode === "daily"
            ? { dailyStats: {}, orderStatusCounts: {}, productSales: {} }
            : { monthlyRevenue: {}, productSales: {} };
    }
};

export default fetchStatisticsData;