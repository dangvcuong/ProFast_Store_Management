import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Box, Toolbar, Drawer, List, ListItem, ListItemText } from '@mui/material';
import logo from './images/grofast.png';
import CustomerManagement from './screes/Customer_management';
import PersonnelManagement from './screes/Personnel_management';
import LoginScreen from './screes/Login';
import CompanyScreen from './screes/CompanyScreen';
import ProductManagement from './screes/ProductScreen';



function OrderManagement() {
  return <h1>Order management</h1>;
}

function StatisticsManagement() {
  return <h1>Statistics management</h1>;
}

function Navbar({ onLogout }) {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = React.useState('');

  const handleLogoutClick = () => {
    const confirmLogout = window.confirm("Bạn có chắc chắn muốn đăng xuất không?");
    if (confirmLogout) {
      onLogout();
      navigate('/');
    }
  };

  const handleTabClick = (tab) => {
    setSelectedTab(tab); // Cập nhật tab được chọn
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: '#1976d2', // Màu background cho menu (Drawer)
          color: 'white', // Màu chữ mặc định cho menu
        },
      }}
    >
      <Toolbar>
        <img
          src={logo}
          alt="logo"
          style={{ width: 150, height: 150, marginRight: 16 }}
        />
      </Toolbar>
      <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', padding: 1 }}>
        <List>
          {[
            { label: 'Quản lý khách hàng', path: '/customer-management' },
            { label: 'Quản lý nhân viên', path: '/personnel_management' },
            { label: 'Quản lý hãng', path: '/firm_management' },
            { label: 'Quản lý sản phẩm', path: '/product_management' },
            { label: 'Quản lý đơn hàng', path: '/order_management' },
            { label: 'Quản lý thống kê', path: '/statistics_management' },
          ].map((tab, index) => (
            <ListItem
              button
              key={index}
              component={Link}
              to={tab.path}
              onClick={() => handleTabClick(tab.path)}
              sx={{
                color: selectedTab === tab.path ? 'yellow' : 'white', // Đổi màu chữ khi được chọn
                justifyContent: 'center', // Canh giữa
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)', // Màu nền khi hover
                },
                '&.Mui-selected': {
                  borderBottom: '2px solid white', // Dòng kẻ dưới chân chữ khi chọn
                },
                marginBottom: 2,
                padding: '10px 20px', // Tạo khoảng cách giữa các mục
              }}
            >
              <ListItemText primary={tab.label} />
            </ListItem>
          ))}
        </List>
        <ListItem
          button
          onClick={handleLogoutClick}
          sx={{
            color: 'white', // Màu chữ
            justifyContent: 'center',
            marginBottom: 2,
            border: '2px solid green', // Thêm border màu đỏ
            backgroundColor: 'green', // Màu nền
            '&:hover': {
              backgroundColor: '#b71c1c', // Màu nền khi hover
            },
            borderRadius: '8px', // Bo góc nhẹ cho nút
          }}
        >
          <ListItemText primary="Đăng xuất" />
        </ListItem>
      </Box>
    </Drawer>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(() => {
    const savedLoginStatus = localStorage.getItem('isLoggedIn');
    return savedLoginStatus === 'true';
  });

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
  };

  return (
    <Router>
      {isLoggedIn ? (
        <>
          <Navbar onLogout={handleLogout} />
          <Box sx={{ p: 3, ml: 30 }}> {/* Dịch nội dung sang phải để tránh bị che bởi Drawer */}
            <Routes>
              <Route path="/customer-management" element={<CustomerManagement />} />
              <Route path="/personnel_management" element={<PersonnelManagement />} />
              <Route path="/firm_management" element={<CompanyScreen />} />
              <Route path="/product_management" element={<ProductManagement />} />
              <Route path="/order_management" element={<OrderManagement />} />
              <Route path="/statistics_management" element={<StatisticsManagement />} />
            </Routes>
          </Box>
        </>
      ) : (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}
    </Router>
  );
}

export default App;
