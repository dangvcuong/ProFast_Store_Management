import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Box, Toolbar, Drawer, List, ListItem, ListItemText } from '@mui/material';
import logo from './images/grofast.png';
import CustomerManagement from './screes/Customer_management';
import PersonnelManagement from './screes/Personnel_management';
import LoginScreen from './screes/Login';
import CompanyScreen from './screes/CompanyScreen';
import ProductManagement from './screes/ProductScreen';
import { getDatabase, ref, update } from 'firebase/database'; // Import Firebase
function OrderManagement() {
  return <h1>Order management</h1>;
}

function StatisticsManagement() {
  return <h1>Statistics management</h1>;
}

function Navbar({ onLogout, position }) {
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
    setSelectedTab(tab);
  };

  const menuItems = [
    { label: 'Quản lý khách hàng', path: '/customer-management', roles: ['admin'] },
    { label: 'Quản lý nhân viên', path: '/personnel_management', roles: ['admin'] },
    { label: 'Quản lý hãng', path: '/firm_management', roles: ['admin'] },
    { label: 'Quản lý sản phẩm', path: '/product_management', roles: ['admin', 'nv'] },
    { label: 'Quản lý đơn hàng', path: '/order_management', roles: ['admin', 'nv'] },
    { label: 'Quản lý thống kê', path: '/statistics_management', roles: ['admin', 'nv'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(position));

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: '#1976d2',
          color: 'white',
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
          {filteredMenuItems.map((tab, index) => (
            <ListItem
              button
              key={index}
              component={Link}
              to={tab.path}
              onClick={() => handleTabClick(tab.path)}
              sx={{
                color: selectedTab === tab.path ? 'yellow' : 'white',
                justifyContent: 'center',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&.Mui-selected': {
                  borderBottom: '2px solid white',
                },
                marginBottom: 2,
                padding: '10px 20px',
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
            color: 'white',
            justifyContent: 'center',
            marginBottom: 2,
            border: '2px solid green',
            backgroundColor: 'green',
            '&:hover': {
              backgroundColor: '#b71c1c',
            },
            borderRadius: '8px',
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
    const savedPosition = localStorage.getItem('position');
    const savedUserId = localStorage.getItem('userId'); // Lưu userId của người dùng
    return { isLoggedIn: savedLoginStatus === 'true', position: savedPosition, userId: savedUserId };
  });

  // Hàm cập nhật trạng thái người dùng trong Firebase
  const updateUserStatus = async (userId, status) => {
    const db = getDatabase();
    const userRef = ref(db, `employees/${userId}`);
    try {
      await update(userRef, { status });
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
    }
  };

  const handleLoginSuccess = (userPosition, userId) => {
    setIsLoggedIn({ isLoggedIn: true, position: userPosition, userId });
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('position', userPosition);
    localStorage.setItem('userId', userId);
    updateUserStatus(userId, 'online'); // Cập nhật status thành online khi đăng nhập
  };

  const handleLogout = () => {
    const { userId } = isLoggedIn;
    if (userId) {
      updateUserStatus(userId, 'offline'); // Cập nhật status thành offline khi đăng xuất
    }
    setIsLoggedIn({ isLoggedIn: false, position: null, userId: null });
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('position');
    localStorage.removeItem('userId');
  };

  return (
    <Router>
      {isLoggedIn.isLoggedIn ? (
        <>
          <Navbar onLogout={handleLogout} position={isLoggedIn.position} />
          <Box sx={{ p: 3, ml: 30 }}>
            <Routes>
              {isLoggedIn.position === 'admin' && (
                <>
                  <Route path="/customer-management" element={<CustomerManagement />} />
                  <Route path="/personnel_management" element={<PersonnelManagement />} />
                  <Route path="/firm_management" element={<CompanyScreen />} />
                </>
              )}
              {(isLoggedIn.position === 'admin' || isLoggedIn.position === 'nv') && (
                <>
                  <Route path="/product_management" element={<ProductManagement />} />
                  <Route path="/order_management" element={<OrderManagement />} />
                  <Route path="/statistics_management" element={<StatisticsManagement />} />
                </>
              )}
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
