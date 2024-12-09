import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import fetchStatisticsData from '../models/Statistics_Model'; // Sử dụng API đã sửa đổi
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
  const [selectedTab, setSelectedTab] = useState('revenue');
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(7, 'day').toDate(),
    endDate: new Date(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0); // Dùng để lưu tổng doanh thu

  const fetchData = async () => {
    setIsLoading(true);
    const { monthlyRevenue, productSales, dailyStats: fetchedDailyStats } = await fetchStatisticsData(
      dateRange.startDate,
      dateRange.endDate,
      selectedTab === 'daily' ? 'daily' : 'monthly'
    );

    if (selectedTab === 'revenue' && monthlyRevenue) {
      const months = Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`);
      const revenue = {
        labels: months,
        datasets: [
          {
            label: 'Doanh thu (triệu VNĐ)',
            data: months.map((_, index) => {
              const monthKey = dayjs().month(index).format('MM-YYYY');
              return monthlyRevenue[monthKey] ? (monthlyRevenue[monthKey] / 1_000_000).toFixed(2) : 0;
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
      const topProducts = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      const productNames = topProducts.map(([name]) => name);
      const productQuantities = topProducts.map(([_, quantity]) => quantity);

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
      // Tính tổng doanh thu trong khoảng thời gian đã chọn
      const totalRevenue = Object.values(fetchedDailyStats).reduce((total, stats) => total + stats.totalRevenue, 0);
      setTotalRevenue(totalRevenue);

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
  }, [dateRange, selectedTab]);

  const handleDateChange = (range) => {
    const { startDate, endDate } = range;
  
    if (startDate > endDate) {
      alert("Ngày bắt đầu không được lớn hơn ngày kết thúc. Vui lòng chọn lại!");
      return;
    }
  
    setDateRange(range);
  };

  return (
    <div className="body">
      <h1>Quản lý Thống kê</h1>
      <div className="filter-section">
        <DatePickerComponent onDateChange={handleDateChange} />
      </div>
      <div className="tab-navigation">
        <button className={`tab ${selectedTab === 'revenue' ? 'active' : ''}`} onClick={() => setSelectedTab('revenue')}>
          Doanh thu
        </button>
        <button className={`tab ${selectedTab === 'products' ? 'active' : ''}`} onClick={() => setSelectedTab('products')}>
          Sản phẩm bán chạy
        </button>
        <button className={`tab ${selectedTab === 'daily' ? 'active' : ''}`} onClick={() => setSelectedTab('daily')}>
          Doanh thu theo ngày
        </button>
      </div>
      <div className="chart-container" style={{ height: '500px', overflowY: 'auto' }}>
        {isLoading ? (
          <p>Đang tải dữ liệu...</p>
        ) : selectedTab === 'revenue' && revenueData ? (
          <Bar data={revenueData} options={{ maintainAspectRatio: false }} height={500} />
        ) : selectedTab === 'products' && productData ? (
          <Bar data={productData} options={{ maintainAspectRatio: false }} height={500} />
        ) : selectedTab === 'daily' && dailyStats.length > 0 ? (
          <div>
            <table className="daily-stats-table">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Tổng đơn hàng</th>
                  <th>Tổng tiền (VNĐ)</th>
                </tr>
              </thead>
              <tbody>
                {dailyStats.map((stat, index) => (
                  <tr key={index}>
                    <td>{dayjs(stat.date).format('DD-MM-YYYY')}</td>
                    <td>{stat.totalOrders}</td>
                    <td>{stat.totalRevenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Thêm thông tin tổng doanh thu dưới bảng */}
            <div className="total-revenue">
              <strong>
                Tổng doanh thu từ ngày {dayjs(dateRange.startDate).format('DD-MM-YYYY')} đến {dayjs(dateRange.endDate).format('DD-MM-YYYY')}:
              </strong>
              <span>{totalRevenue.toLocaleString()} VNĐ</span>
            </div>
          </div>
        ) : (
          <p>Không có dữ liệu thống kê.</p>
        )}
      </div>
    </div>
  );
};

export default StatisticsManagement;
