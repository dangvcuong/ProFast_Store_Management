import { getDatabase, ref, get, query, orderByChild, equalTo } from "firebase/database";
import dayjs from "dayjs";

const fetchStatisticsData = async () => {
    const db = getDatabase();
    const ordersRef = ref(db, '/orders');
  
    try {
      // Lấy tất cả đơn hàng
      const snapshot = await get(query(ordersRef));
      if (snapshot.exists()) {
        const orders = snapshot.val();
        let monthlyRevenue = {};
        let productSales = {};
  
        // Khởi tạo tất cả các tháng có doanh thu mặc định là 0
        const months = [
          '01-2024', '02-2024', '03-2024', '04-2024', '05-2024', '06-2024',
          '07-2024', '08-2024', '09-2024', '10-2024', '11-2024', '12-2024'
        ];
  
        months.forEach(month => {
          monthlyRevenue[month] = 0;  // Gán doanh thu mặc định cho từng tháng
        });
  
        Object.values(orders).forEach(order => {
          if (order.orderStatus === "Thành công") {
            // Đảm bảo dữ liệu ngày đặt hàng hợp lệ
            const orderDate = order.orderDate ? new Date(order.orderDate) : null;
            if (!orderDate || isNaN(orderDate)) return;
  
            const monthYear = dayjs(orderDate).format("MM-YYYY");
  
            // Tính doanh thu theo tháng
            const products = order.products || [];
            products.forEach(product => {
              const productRevenue = parseFloat(product.price || "0") * parseInt(product.quantity || "0");
              monthlyRevenue[monthYear] = (monthlyRevenue[monthYear] || 0) + productRevenue;
  
              // Tính số lượng sản phẩm
              const productName = product.name || "Sản phẩm không tên";
              productSales[productName] = (productSales[productName] || 0) + parseInt(product.quantity || "0");
            });
          }
        });
  
        console.log('Doanh thu theo tháng:', monthlyRevenue); // Kiểm tra lại dữ liệu
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
