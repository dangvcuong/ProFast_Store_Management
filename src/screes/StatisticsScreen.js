import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import fetchStatisticsData from '../models/Statistics_Model';
import DatePickerComponent from '../models/DatePickerComponent';
import '../screes/csss/StatisticsScreen.css';
import dayjs from 'dayjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const StatisticsManagement = () => {
  const [revenueData, setRevenueData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [dailyStats, setDailyStats] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedTab, setSelectedTab] = useState('daily');
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().startOf('month').toDate(),
    endDate: new Date(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [confirmedOrders, setConfirmedOrders] = useState(0);
  const [shippingOrders, setShippingOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [cancelledOrders, setCancelledOrders] = useState(0);

  const fetchData = async () => {
    setIsLoading(true);
    const { monthlyRevenue, productSales, dailyStats: fetchedDailyStats, orderStatusCounts } = await fetchStatisticsData(
      dateRange.startDate,
      dateRange.endDate,
      selectedTab === 'daily' ? 'daily' : 'monthly'
    );

    if (orderStatusCounts) {
      setPendingOrders(orderStatusCounts.pending || 0);
      setConfirmedOrders(orderStatusCounts.confirmed || 0);
      setShippingOrders(orderStatusCounts.shipping || 0);
      setCompletedOrders(orderStatusCounts.completed || 0);
      setCancelledOrders(orderStatusCounts.cancelled || 0);
    }

    if (selectedTab === 'revenue' && monthlyRevenue) {
      const months = Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`);
      const revenue = {
        labels: months,
        datasets: [
          {
            label: 'Doanh thu (triệu VNĐ)',
            data: months.map((_, index) => {
              const monthKey = dayjs().month(index).format('MM-YYYY');
              const value = monthlyRevenue[monthKey] || 0;
              return value > 0 ? (value / 1_000_000).toFixed(2) : null;
            }),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      };
      setRevenueData(revenue);
    }

    if (selectedTab === 'products' && productSales) {
      const allProducts = Object.entries(productSales);
      const productNames = allProducts.map(([name]) => name);
      const productQuantities = allProducts.map(([_, quantity]) => quantity);

      const products = {
        labels: productNames,
        datasets: [
          {
            label: 'Số lượng',
            data: productQuantities,
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
        ],
      };
      setProductData(products);
    }

    if (selectedTab === 'daily' && fetchedDailyStats) {
      const totalRevenue = Object.values(fetchedDailyStats).reduce((total, stats) => total + stats.totalRevenue, 0);
      const totalOrdersCount = Object.values(fetchedDailyStats).reduce((total, stats) => total + stats.totalOrders, 0);
      const successfulOrdersCount = Object.values(fetchedDailyStats).reduce((total, stats) => total + stats.successfulOrders, 0);

      setTotalRevenue(totalRevenue);
      setTotalOrders(totalOrdersCount);
      setCompletedOrders(successfulOrdersCount); // Cập nhật số đơn hàng thành công

      setDailyStats(
        Object.entries(fetchedDailyStats).map(([date, stats]) => ({
          date,
          ...stats,
        }))
      );
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [dateRange, selectedTab]); // Gọi fetchData khi dateRange hoặc selectedTab thay đổi

  const handleDateChange = async (range) => {
    const { startDate, endDate } = range;

    if (startDate > endDate) {
      alert("Ngày bắt đầu không được lớn hơn ngày kết thúc. Vui lòng chọn lại!");
      return;
    }

    setDateRange(range);

    // Gọi lại hàm fetchData sau khi chọn ngày
    const { monthlyRevenue, productSales, dailyStats: fetchedDailyStats, orderStatusCounts } = await fetchStatisticsData(
      startDate,
      endDate,
      'daily' // Chọn 'daily' để tính toán ngay
    );

    if (orderStatusCounts) {
      setPendingOrders(orderStatusCounts.pending || 0);
      setConfirmedOrders(orderStatusCounts.confirmed || 0);
      setShippingOrders(orderStatusCounts.shipping || 0);
      setCompletedOrders(orderStatusCounts.completed || 0);
      setCancelledOrders(orderStatusCounts.cancelled || 0);
    }

    if (fetchedDailyStats) {
      const totalRevenue = Object.values(fetchedDailyStats).reduce((total, stats) => total + stats.totalRevenue, 0);
      const totalOrdersCount = Object.values(fetchedDailyStats).reduce((total, stats) => total + stats.totalOrders, 0);
      const successfulOrdersCount = Object.values(fetchedDailyStats).reduce((total, stats) => total + stats.successfulOrders, 0);

      setTotalRevenue(totalRevenue);
      setTotalOrders(totalOrdersCount);
      setCompletedOrders(successfulOrdersCount); // Cập nhật số đơn hàng thành công

      setDailyStats(
        Object.entries(fetchedDailyStats).map(([date, stats]) => ({
          date,
          ...stats,
        }))
      );
    }
  };

  return (
    <div className="body">
      <h1>Quản lý Thống kê</h1>
      <div className="filter-section">
        <DatePickerComponent onDateChange={handleDateChange} />
      </div>
      <div className="info">
        <strong>
          Tổng số đơn hàng từ ngày {dayjs(dateRange.startDate).format('DD-MM-YYYY')} đến {dayjs(dateRange.endDate).format('DD-MM-YYYY')}:
        </strong>
        <span>{totalOrders}</span>
      </div>
      <div className="order-status-boxes">
        <div className="box completed">
          <img src="https://png.pngtree.com/png-clipart/20230418/original/pngtree-order-confirm-line-icon-png-image_9065104.png" alt="Đơn hàng thành công" className="icon completed-icon" />
          <span className="box-title">Đơn hàng thành công</span>
          <strong>{completedOrders}</strong>
        </div>
        
        <div className="box cancelled">
          <img src="https://png.pngtree.com/png-clipart/20230417/original/pngtree-revenue-line-icon-png-image_9063740.png" alt="Doanh thu" className="icon cancelled-icon" />
          <span className="box-title">Tổng doanh thu</span>
          <strong>{totalRevenue.toLocaleString()} VNĐ</strong>
        </div>
      </div>
      <div className="tab-navigation">
        <button className={`tab ${selectedTab === 'daily' ? 'active' : ''}`} onClick={() => setSelectedTab('daily')}>
          Doanh thu theo ngày
        </button>
        <button className={`tab ${selectedTab === 'revenue' ? 'active' : ''}`} onClick={() => setSelectedTab('revenue')}>
          Doanh thu theo tháng
        </button>
        <button className={`tab ${selectedTab === 'products' ? 'active' : ''}`} onClick={() => setSelectedTab('products')}>
          Sản phẩm
        </button>
      </div>
      <div style={{ height: '370px' }}>
        {isLoading ? (
          <p>Đang tải dữ liệu...</p>
        ) : selectedTab === 'revenue' && revenueData ? (
          <Bar data={revenueData} options={{ maintainAspectRatio: false }} height={500} />
        ) : selectedTab === 'products' && productData ? (
          <div>
            <table>
              <thead>
                <tr>
                  <th>Tên sản phẩm</th>
                  <th>Số lượng đã bán</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(productData.datasets[0].data).map(([index, quantity]) => (
                  <tr key={index}>
                    <td>{productData.labels[index]}</td>
                    <td>{quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : selectedTab === 'daily' && dailyStats.length > 0 ? (
          <div>
            <table>
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Tổng đơn hàng</th>
                  <th>Đơn thành công</th>
                  <th>Đơn hủy</th>
                  <th>Tổng tiền (VNĐ)</th>
                </tr>
              </thead>
              <tbody>
                {dailyStats.map((stat, index) => (
                  <tr key={index}>
                    <td>{dayjs(stat.date).format('DD-MM-YYYY')}</td>
                    <td>{stat.totalOrders}</td>
                    <td>{stat.successfulOrders}</td> {/* Hiển thị số đơn hàng thành công */}
                    <td>{stat.cancelledOrders}</td> {/* Hiển thị số đơn hàng đã hủy */}
                    <td>{stat.totalRevenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Không có dữ liệu thống kê.</p>
        )}
      </div>
    </div>
  );
};

export default StatisticsManagement;