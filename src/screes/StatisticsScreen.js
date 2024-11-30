import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import fetchStatisticsData from '../models/Statistics_Model'; // API mock
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
import ChartDataLabels from 'chartjs-plugin-datalabels'; // Plugin nhãn dữ liệu

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
  const [selectedTab, setSelectedTab] = useState('revenue'); // Tab hiện tại
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(7, 'day').toDate(),
    endDate: new Date(),
  });
  const [pendingDateRange, setPendingDateRange] = useState(dateRange); // Dữ liệu ngày tạm thời (chỉ cập nhật khi bấm "Thống kê")
  const [isLoading, setIsLoading] = useState(false); // Trạng thái tải dữ liệu
  const [dateError, setDateError] = useState(""); // Lưu thông báo lỗi khi ngày không hợp lệ

  const fetchData = async () => {
    setIsLoading(true); // Bắt đầu tải dữ liệu
    const { monthlyRevenue, productSales } = await fetchStatisticsData(
      dateRange.startDate,
      dateRange.endDate
    );

    const months = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];

    const revenue = {
      labels: months,
      datasets: [
        {
          label: 'Doanh thu (triệu VNĐ)',
          data: months.map((_, index) => {
            const monthKey = dayjs().month(index).format("MM-YYYY");
            return monthlyRevenue[monthKey] ? (monthlyRevenue[monthKey] / 1_000_000).toFixed(2) : 0;
          }),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };

    setRevenueData(revenue);

    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const productNames = topProducts.map(product => product[0]);
    const productQuantities = topProducts.map(product => product[1]);

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
    setIsLoading(false); // Dữ liệu đã tải xong
  };

  // Gọi fetchData khi dateRange thay đổi
  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const handleDateChange = (range) => {
    // Kiểm tra nếu ngày bắt đầu lớn hơn ngày kết thúc
    if (dayjs(range.startDate).isAfter(dayjs(range.endDate))) {
      setDateError("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
    } else {
      setDateError(""); // Không có lỗi, cập nhật ngày
      setPendingDateRange(range); // Cập nhật dữ liệu ngày tạm thời
    }
  };

  const handleApplyFilter = () => {
    // Nếu không có lỗi, mới áp dụng bộ lọc
    if (dateError === "") {
      setDateRange(pendingDateRange); // Áp dụng ngày đã chọn khi bấm "Thống kê"
    }
  };

  return (
    <div className="body">
      <h1>Quản lý Thống kê</h1>

      {/* Lọc ngày và nút thống kê nằm cùng một hàng */}
      <div className="filter-section">
        {/* Chọn ngày */}
        <DatePickerComponent onDateChange={handleDateChange} />

        {/* Nút "Thống kê" */}
        <button
          className="apply-filter-button"
          onClick={handleApplyFilter}
        >
          Thống kê
        </button>
      </div>

      {/* Hiển thị thông báo lỗi nếu ngày không hợp lệ */}
      {dateError && <p className="error-message">{dateError}</p>}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab ${selectedTab === 'revenue' ? 'active' : ''}`}
          onClick={() => setSelectedTab('revenue')}
        >
          Doanh thu
        </button>
        <button
          className={`tab ${selectedTab === 'products' ? 'active' : ''}`}
          onClick={() => setSelectedTab('products')}
        >
          Sản phẩm bán chạy
        </button>
      </div>

      {/* Biểu đồ */}
      <div className="chart-container" style={{ height: '500px', overflowY: 'auto' }}>
        {isLoading ? (
          <p>Đang tải dữ liệu...</p>
        ) : selectedTab === 'revenue' && revenueData ? (
          <Bar
            data={revenueData}
            options={{
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      return `${context.raw.toLocaleString()} triệu VNĐ`;
                    },
                  },
                },
                datalabels: {
                  color: '#000',
                  anchor: 'end',
                  align: 'top',
                  formatter: (value) => (value > 0 ? `${value} triệu` : ''),
                  font: {
                    weight: 'bold',
                  },
                },
              },
              maintainAspectRatio: false, // Quan trọng: Không giữ tỉ lệ mặc định để biểu đồ phù hợp với chiều cao
            }}
            height={500} // Thiết lập chiều cao cụ thể
          />
        ) : selectedTab === 'products' && productData ? (
          <Bar
            data={productData}
            options={{
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      return `${context.raw.toLocaleString()} sản phẩm`;
                    },
                  },
                },
                datalabels: {
                  color: '#000',
                  anchor: 'end',
                  align: 'top',
                  formatter: (value) => (value > 0 ? `${value} sản phẩm` : ''),
                  font: {
                    weight: 'bold',
                  },
                },
              },
              maintainAspectRatio: false, // Quan trọng
            }}
            height={500} // Thiết lập chiều cao cụ thể
          />
        ) : (
          <p>Chọn ngày và bấm "Thống kê" để xem dữ liệu.</p>
        )}
      </div>

    </div>
  );
};

export default StatisticsManagement;
