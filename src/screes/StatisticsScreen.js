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
              console.log(`Tháng: ${monthKey}, Doanh thu: ${monthlyRevenue[monthKey] || 0}`);
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
      <div className="chart-container">
        <h2>Doanh thu theo tháng</h2>
        {revenueData ? (
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
                  formatter: (value) => {
                    // Chỉ hiển thị giá trị nếu khác 0
                    return value > 0 ? `${value} triệu` : '';
                  },
                  font: {
                    weight: 'bold',
                  },
                },
              },
            }}
          />
        ) : (
          <p>Đang tải dữ liệu doanh thu...</p>
        )}
      </div>
      <div className="chart-container">
        <h2>Sản phẩm bán chạy nhất</h2>
        {productData ? (
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
                  formatter: (value) => {
                    // Chỉ hiển thị số lượng nếu lớn hơn 0
                    return value > 0 ? `${value} sản phẩm` : '';
                  },
                  font: {
                    weight: 'bold',
                  },
                },
              },
            }}
          />
        ) : (
          <p>Đang tải dữ liệu sản phẩm...</p>
        )}
      </div>
    </div>
  );
};

export default StatisticsManagement;
