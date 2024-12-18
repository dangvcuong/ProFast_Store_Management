import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Box, Toolbar, Drawer, List, ListItem, ListItemText, Modal, Typography, Button } from '@mui/material';
import logo from './images/grofast.png';
import CustomerManagement from './screes/Customer_management';
import PersonnelManagement from './screes/Personnel_management';
import LoginScreen from './screes/Login';
import CompanyScreen from './screes/CompanyScreen';
import ProductManagement from './screes/ProductScreen';
import OrderManagerScreen from './screes/OrderManagerScreen';
import StatisticsScreen from './screes/StatisticsScreen';
import Reviews from './screes/ReviewScreen';
import Vorcher from './screes/Vorcher';
import { getDatabase, ref, update } from 'firebase/database'; // Import Firebase
import { FaBox, FaUsers, FaClipboardList, FaChartBar, FaComments, FaTags, FaUserTie, FaStore, FaSignOutAlt } from 'react-icons/fa';
import Fade from '@mui/material/Fade'; // Đảm bảo đã import Fade
import { Close as X, ExitToApp as LogOut } from '@mui/icons-material';


import ChatBoxScreen from './screes/ChatBoxScreen';

import { db } from './firebaseConfig';
import { ref as dbRef, onValue } from 'firebase/database';


function Navbar({ onLogout, position }) {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false); // State kiểm soát Modal
  const [selectedTab, setSelectedTab] = React.useState('');
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(true); // State kiểm soát Drawer

  const handlclick = () => {
    setOpenModal(true); // Mở Modal khi người dùng nhấn đăng xuất
  };

  const handleConfirmLogout = () => {
    onLogout();
    setOpenModal(false); // Đóng Modal khi người dùng xác nhận đăng xuất
  };

  const handleCancelLogout = () => {
    setOpenModal(false); // Đóng Modal khi người dùng hủy
  };



  //Thông báo tin nhắn
  useEffect(() => {
    // Kiểm tra quyền thông báo
    if ("Notification" in window) {
      Notification.requestPermission()
        .then((permission) => {
          if (permission !== "granted") {
            console.warn("Notification permission not granted");
          }
        })
        .catch((error) => console.error("Notification request error:", error));
    }

    const messagesRef = dbRef(db, "chats/");
    const unsubscribe = onValue(messagesRef, handleNewMessages);

    return () => unsubscribe(); // Hủy lắng nghe khi component unmount
  }, []);
  const handleNewMessages = (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    Object.keys(data).forEach((chatId) => {
      const messages = Object.values(data[chatId]?.messages || {});
      messages.forEach((message) => {
        if (message.status === 1 && message.trangThai === "Chưa xem") {
          // Hiển thị thông báo cho từng tin nhắn chưa xem
          showNotification({
            nameUser: message.nameUser || "Không rõ",
            text: message.text || "Tin nhắn mới",
            imageUser: message.imageUser || "https://via.placeholder.com/50",
          });
        }
      });
    });
  };
  const showNotification = (message) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Tin nhắn mới", {
        body: `${message.nameUser}: ${message.text}`,
        icon: message.imageUser,
      });
    }
  };



  // Lắng nghe thay đổi trong Firebase Realtime Database (Đơn hàng)
  // const [notifiedOrders, setNotifiedOrders] = useState(new Set()); // Dùng Set để lưu trữ các ID đơn hàng đã thông báo

  // useEffect(() => {
  //   // Kiểm tra quyền thông báo
  //   if ("Notification" in window) {
  //     Notification.requestPermission()
  //       .then((permission) => {
  //         if (permission !== "granted") {
  //           console.warn("Notification permission not granted");
  //         }
  //       })
  //       .catch((error) => console.error("Notification request error:", error));
  //   }

  //   // Lắng nghe thay đổi trong Firebase Realtime Database (Đơn hàng)
  //   const ordersRef = dbRef(db, "orders/"); // Giả sử bạn lưu đơn hàng trong 'orders/'
  //   const unsubscribe = onValue(ordersRef, handleNewOrders);

  //   // Hủy lắng nghe khi component unmount
  //   return () => unsubscribe();
  // }, []);

  // // Hàm xử lý khi có đơn hàng mới
  // const handleNewOrders = (snapshot) => {
  //   const data = snapshot.val();
  //   if (!data) return;

  //   // Duyệt qua các đơn hàng
  //   Object.keys(data).forEach((orderId) => {
  //     const order = data[orderId];

  //     // Kiểm tra nếu đơn hàng có trạng thái là "Đang chờ xác nhận" và chưa được thông báo
  //     if (order.orderStatus === "Đang chờ xác nhận" && !notifiedOrders.has(orderId)) {
  //       // Hiển thị thông báo cho đơn hàng mới
  //       showNotifications({
  //         orderId: orderId,
  //         customerName: order.customerName || "Khách hàng mới",
  //         orderDetails: order.details || "Chi tiết đơn hàng chưa có",
  //       });

  //       // Thêm ID đơn hàng vào mảng notifiedOrders để tránh thông báo lại
  //       setNotifiedOrders((prev) => new Set(prev).add(orderId));
  //     }
  //   });
  // };

  // // Hàm hiển thị thông báo
  // const showNotifications = (order) => {
  //   if ("Notification" in window && Notification.permission === "granted") {
  //     new Notification("Đơn hàng mới", {
  //       body: `Đơn hàng của ${order.customerName}: ${order.orderDetails}`,
  //       icon: "https://via.placeholder.com/50", // Bạn có thể thay bằng icon cho đơn hàng
  //     });
  //   }
  // };



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
    { label: 'Quản lý đơn hàng', path: '/order_management', icon: <FaClipboardList />, roles: ['admin', 'nv'] },
    { label: 'Quản lý đánh giá', path: '/review', icon: <FaComments />, roles: ['admin'] },
    { label: 'Quản lý sản phẩm', path: '/product_management', icon: <FaBox />, roles: ['admin', 'nv'] },
    { label: 'Quản lý danh mục', path: '/firm_management', icon: <FaStore />, roles: ['admin'] },
    { label: 'Quản lý mã ưu đãi', path: '/vorcher', icon: <FaTags />, roles: ['admin'] },
    { label: 'Quản lý nhân viên', path: '/personnel_management', icon: <FaUserTie />, roles: ['admin'] },
    { label: 'Quản lý khách hàng', path: '/customer-management', icon: <FaUsers />, roles: ['admin'] },
    { label: 'Quản lý thống kê', path: '/statistics_management', icon: <FaChartBar />, roles: ['admin', 'nv'] },
    { label: 'Hỗ trợ khách hàng', path: '/chat_box', icon: <FaComments />, roles: ['admin', 'nv'] },
  ];


  const filteredMenuItems = menuItems.filter(item => item.roles.includes(position));

  return (
    <>
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
            paddingTop: 1, // Giảm padding trên của Drawer
          },
        }}
      >
        <Toolbar>
          <img
            src={logo}
            alt="logo"
            style={{ width: 150, height: 150, marginRight: 16, cursor: 'pointer' }}
            onClick={() => window.location.reload()}  // Thêm sự kiện reload khi nhấn vào logo
          />
        </Toolbar>

        <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', padding: 1 }}>
          <Box
            sx={{
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start', // Căn lên trên
              height: '100%',
              padding: 1,
              gap: 1, // Thêm khoảng cách giữa các mục
            }}
          >
            <List sx={{ padding: 0, margin: 0 }}> {/* Gỡ padding/margin thừa */}
              {filteredMenuItems.map((tab, index) => (
                <ListItem
                  button
                  key={index}
                  component={Link}
                  to={tab.path}
                  onClick={() => handleTabClick(tab.path)}
                  sx={{
                    color: selectedTab === tab.path ? 'yellow' : 'white',
                    justifyContent: 'flex-start',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-selected': {
                      borderBottom: '2px solid white',
                    },
                    marginBottom: 0.5, // Giảm khoảng cách giữa các mục
                    padding: '10px 16px', // Tăng giảm padding theo ý muốn
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {tab.icon} {/* Hiển thị icon */}
                    <ListItemText primary={tab.label} />
                  </Box>
                </ListItem>
              ))}
            </List>
          </Box>

          <ListItem
            button
            onClick={handlclick} // Mở Modal khi click nút Đăng xuất
            sx={{
              color: 'white',
              justifyContent: 'center',
              border: '2px solid green',
              backgroundColor: 'green',
              '&:hover': {
                backgroundColor: '#b71c1c',
              },
              borderRadius: '8px',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FaSignOutAlt />
              <ListItemText primary="Đăng xuất" />
            </Box>
          </ListItem>
        </Box>
      </Drawer>

      {/* Modal xác nhận đăng xuất */}
      <Modal
        open={openModal}
        onClose={handleCancelLogout}
        closeAfterTransition
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backdropFilter: 'blur(5px)',
        }}
      >
        <Fade in={openModal}>
          <Box
            sx={{
              width: 400,
              backgroundColor: 'background.paper',
              borderRadius: 4,
              boxShadow: 24,
              p: 4,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Bạn có chắc chắn muốn đăng xuất không?
            </Typography>

            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Bạn sẽ cần đăng nhập lại để truy cập tài khoản của mình.
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleCancelLogout}
                startIcon={<X />}
                sx={{
                  padding: '10px 20px',
                  borderColor: 'grey.300',
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                Hủy
              </Button>

              <Button
                variant="contained"
                onClick={handleConfirmLogout}
                startIcon={<LogOut />}
                sx={{
                  padding: '10px 20px',
                  backgroundColor: 'error.main',
                  color: 'common.white',
                  '&:hover': {
                    backgroundColor: 'error.dark',
                  },
                }}
              >
                Đăng xuất
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

    </>
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
              <Route path="/" element={<OrderManagerScreen />} />
              {isLoggedIn.position === 'admin' && (
                <>
                  <Route path="/review" element={<Reviews />} />
                  <Route path="/customer-management" element={<CustomerManagement />} />
                  <Route path="/personnel_management" element={<PersonnelManagement />} />
                  <Route path="/firm_management" element={<CompanyScreen />} />
                  <Route path="/vorcher" element={<Vorcher />} />
                </>
              )}
              {(isLoggedIn.position === 'admin' || isLoggedIn.position === 'nv') && (
                <>
                  <Route path="/product_management" element={<ProductManagement />} />
                  <Route path="/order_management" element={<OrderManagerScreen />} />
                  <Route path="/statistics_management" element={<StatisticsScreen />} />
                  <Route path="/chat_box" element={<ChatBoxScreen />} />
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
