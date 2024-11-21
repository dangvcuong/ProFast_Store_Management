import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import fetchStatisticsData from '../models/Statistics_Model';
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
import ChartDataLabels from 'chartjs-plugin-datalabels'; // Import plugin

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels // Đăng ký plugin
);

const StatisticsManagement = () => {
  const [revenueData, setRevenueData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [selectedTab, setSelectedTab] = useState('revenue'); // Trạng thái lưu tab hiện tại

  useEffect(() => {
    const fetchData = async () => {
      const { monthlyRevenue, productSales } = await fetchStatisticsData();

      console.log('Dữ liệu doanh thu:', monthlyRevenue);
      console.log('Dữ liệu sản phẩm bán:', productSales);

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
    };

    fetchData();
  }, []);

  return (
    <div className="container">
      <h1>Quản lý Thống kê</h1>
      
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
      <div className="chart-container">
        {selectedTab === 'revenue' && revenueData ? (
          <>
            <h2>Doanh thu theo tháng</h2>
            <Bar 
              data={revenueData} 
              options={{
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        return `${context.raw.toLocaleString()} triệu VNĐ`; // Định dạng tooltip
                      },
                    },
                  },
                  datalabels: {
                    color: '#000',
                    anchor: 'end',
                    align: 'top',
                    formatter: (value) => value > 0 ? `${value} triệu` : '',
                    font: {
                      weight: 'bold',
                    },
                  },
                },
              }}
            />
          </>
        ) : selectedTab === 'products' && productData ? (
          <>
            <h2>Sản phẩm bán chạy nhất</h2>
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
                    formatter: (value) => value > 0 ? `${value} sản phẩm` : '',
                    font: {
                      weight: 'bold',
                    },
                  },
                },
              }}
            />
          </>
        ) : (
          <p>Đang tải dữ liệu...</p>
        )}
      </div>
    </div>
  );
};

export default StatisticsManagement;
