import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Tabs, Tab, Box, Toolbar } from '@mui/material';
import logo from './images/grofast.png';
import CustomerManagement from './screes/Customer_management';
import PersonnelManagement from './screes/Personnel_management';
// function List() {
//   return <h1>List Page</h1>;
// }

// function PersonnelManagement() {
//   return <h1>Personnel management</h1>;
// }

function FirmManagement() {
  return <h1>Firm management</h1>;
}

function ProductManagement() {
  return <h1>Product management</h1>;
}

function OrderManagement() {
  return <h1>Order management</h1>;
}

function StatisticsManagement() {
  return <h1>Statistics management</h1>;
}

function Navbar() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
      <Toolbar>
        {/* Thêm hình ảnh vào thanh menu */}
        <img
          src={logo}
          alt="logo"
          style={{ width: 150, height: 150, marginRight: 16 }}
        />
        <Tabs
          value={value}
          onChange={handleChange}
          textColor="inherit"
          indicatorColor="secondary"
          aria-label="nav tabs example"
        >
          <Tab
            label="Quản lý khách hàng"
            component={Link}
            to="/customer-management"
            sx={{ color: 'white', '&.Mui-selected': { color: 'yellow' } }}
          />
          <Tab
            label="Quản lý nhân viên"
            component={Link}
            to="/personnel_management"
            sx={{ color: 'white', '&.Mui-selected': { color: 'yellow' } }}
          />
          <Tab
            label="Quản lý hãng"
            component={Link}
            to="/firm_management"
            sx={{ color: 'white', '&.Mui-selected': { color: 'yellow' } }}
          />
          <Tab
            label="Quản lý sản phẩm"
            component={Link}
            to="/product_management"
            sx={{ color: 'white', '&.Mui-selected': { color: 'yellow' } }}
          />
          <Tab
            label="Quản lý đơn hàng"
            component={Link}
            to="/order_management"
            sx={{ color: 'white', '&.Mui-selected': { color: 'yellow' } }}
          />
          <Tab
            label="Quản lý thông kê"
            component={Link}
            to="/statistics_management"
            sx={{ color: 'white', '&.Mui-selected': { color: 'yellow' } }}
          />
        </Tabs>
      </Toolbar>
    </AppBar>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <Box sx={{ p: 3 }}>
        <Routes>
          <Route path="/customer-management" element={<CustomerManagement />} />
          <Route path="/personnel_management" element={<PersonnelManagement />} />
          <Route path="/firm_management" element={<FirmManagement />} />
          <Route path="/product_management" element={<ProductManagement />} />
          <Route path="/order_management" element={<OrderManagement />} />
          <Route path="/statistics_management" element={<StatisticsManagement />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
