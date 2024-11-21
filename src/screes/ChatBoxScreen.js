import React, { useState, useEffect } from 'react';

import "firebase/compat/database"; // Import Firebase Realtime Database
import { db, storage, store } from '../firebaseConfig';
import { ref as dbRef, push, set, onValue } from "firebase/database";

const ChatBoxScreen = () => {
    const [messages, setMessages] = useState([]); // Danh sách tin nhắn
    const [selectedMessage, setSelectedMessage] = useState(null); // Người đang trò chuyện
    const [chatHistory, setChatHistory] = useState([]); // Lịch sử tin nhắn
    const [replyText, setReplyText] = useState(''); // Nội dung trả lời
    const [userId, setUserID] = useState(''); // ID người dùng
    const [userData, setUserData] = useState(null); // Dữ liệu người dùng
    const [selectedImage, setSelectedImage] = React.useState(null); // Lưu ảnh được chọn
    const [isModalOpen, setIsModalOpen] = React.useState(false); // Quản lý trạng thái Modal
    // Lấy danh sách các tin nhắn (theo userId)
    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
        setIsModalOpen(true);
    };



    useEffect(() => {
        const messagesRef = dbRef(db, `chats/`);
        const unsubscribe = onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const messagesArray = Object.keys(data).map((key) => ({
                    id: key,
                    ...data[key],
                }));
                setMessages(messagesArray);
            }
        });
        return () => unsubscribe();
    }, [userId]);


    // Lấy lịch sử trò chuyện với người được chọn
    useEffect(() => {
        if (selectedMessage) {
            const chatRef = dbRef(db, `chats/${userId}/messages`);
            const unsubscribe = onValue(chatRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const messageList = Object.keys(data).map(key => ({
                        id: key,
                        ...data[key]
                    }));
                    setChatHistory(messageList);


                }
            });

            return () => unsubscribe();
        }
    }, [selectedMessage]);

    useEffect(() => {
        if (selectedMessage) {
            const chatRef = dbRef(db, `chats/${userId}/messages/`);
            const unsubscribe = onValue(chatRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const messageList = Object.keys(data).map(key => ({
                        id: key,
                        ...data[key]
                    }));
                    setChatHistory(messageList);


                }
            });

            return () => unsubscribe();
        }
    }, [selectedMessage]);


    // Lấy thông tin người dùng khi chọn tin nhắn
    useEffect(() => {
        if (selectedMessage) {
            const userRef = dbRef(db, `users/${selectedMessage.id}`); // Giả sử `id` là id người dùng
            const unsubscribe = onValue(userRef, (snapshot) => {
                const userData = snapshot.val();
                if (userData) {
                    console.log("User data: ", userData);
                    setUserData(userData); // Cập nhật thông tin người dùng vào state
                } else {
                    console.log("Không tìm thấy người dùng.");
                }
            });

            return () => unsubscribe();
        }
    }, [selectedMessage]);

    // Xử lý gửi tin nhắn
    const handleReplySend = () => {
        if (!replyText.trim()) {
            console.error("Message text is empty.");
            return;
        }

        try {
            const chatRef = dbRef(db, `chats/${selectedMessage.id}/messages`);
            const newMessageRef = push(chatRef);
            const newMessageId = newMessageRef.key;

            const newMessage = {
                id: newMessageId,
                authorId: userId,
                createdAt: Date.now(),
                text: replyText.trim(),
                status: 2,
            };

            set(newMessageRef, newMessage)
                .then(() => {
                    setReplyText('');
                    console.log("Message sent successfully!");
                })
                .catch((error) => {
                    console.error("Error sending message:", error);
                });
        } catch (error) {
            console.error("Unexpected error:", error);
        }
    };

    return (
        <div style={{ display: 'flex', height: '93vh', fontFamily: 'Arial, sans-serif' }}>
            {/* Sidebar danh sách tin nhắn */}
            <div
                style={{
                    width: '25%',
                    borderRight: '1px solid #ddd',
                    overflowY: 'scroll',
                    padding: '10px',
                }}
            >
                <h3 style={{ textAlign: 'center', margin: '10px 0' }}>Danh sách tin nhắn</h3>
                {messages && messages.length > 0 ? (
                    messages.map((message) => (
                        console.log('ID:', message),

                        <div
                            key={message.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '15px',
                                padding: '10px',
                                backgroundColor: selectedMessage?.id === message.id ? '#f0f0f0' : '#fff',
                                cursor: 'pointer',
                                borderRadius: '8px',
                            }}
                            onClick={() => {
                                setSelectedMessage(message);
                                setUserID(message.id);
                            }}
                        >
                            <img
                                src={message.imageUser || 'https://via.placeholder.com/50'}
                                alt={message.nameUser || 'Hình đại diện'}
                                style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    marginRight: '10px',
                                }}
                            />
                            <div>
                                <p style={{ margin: 0, fontWeight: 'bold' }}>
                                    {message.nameUser || 'Không rõ'}
                                </p>
                                <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
                                    {message.text || '...'}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>Không có tin nhắn nào.</p>
                )}






            </div>

            {/* Cửa sổ chat */}
            <div
                style={{
                    flex: 1,
                    overflowY: 'scroll',
                    padding: '10px',
                    backgroundColor: '#f9f9f9',
                    minHeight: '100px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}
            >
                {/* Thông tin người dùng */}
                {userData && (

                    <div style={{ textAlign: 'center' }}>
                        <img
                            src={userData.image || 'https://via.placeholder.com/150'} // Dùng một hình ảnh placeholder nếu không có URL
                            alt="User Image"
                            style={{ width: '100px', height: '100px', borderRadius: '50%' }} // Điều chỉnh kích thước và kiểu dáng
                        />
                        <h3>{userData.name}</h3>
                        {/* Hiển thị thêm thông tin người dùng nếu cần */}
                    </div>
                )}
                <hr style={{ border: '1px solid #ddd', margin: '1px ' }} />

                {selectedMessage ? (
                    chatHistory.length > 0 ? (
                        chatHistory.map((chat) => {
                            const isRightAligned = chat.status === 2;
                            return (
                                <div
                                    key={chat.id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: isRightAligned ? 'flex-end' : 'flex-start',
                                        marginBottom: '10px',
                                    }}
                                >
                                    <div
                                        style={{
                                            maxWidth: '60%',
                                            padding: '10px',
                                            borderRadius: '10px',
                                            backgroundColor: isRightAligned ? '#4caf50' : '#fff',
                                            color: isRightAligned ? '#fff' : '#000',
                                        }}
                                    >
                                        {/* Kiểm tra và hiển thị ảnh hoặc văn bản */}
                                        {chat.imageUrl ? (
                                            <img
                                                src={chat.imageUrl}
                                                alt="Message Image"
                                                style={{
                                                    width: '30%',
                                                    height: 'auto',
                                                    borderRadius: '10px',
                                                }}
                                                onClick={() => handleImageClick(chat.imageUrl)}
                                            />
                                        ) : (
                                            <p style={{ margin: 0 }}>{chat.text}</p>
                                        )}
                                    </div>
                                    {/* Modal hiển thị ảnh lớn */}
                                    {isModalOpen && (
                                        <div
                                            style={{
                                                position: 'fixed',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                zIndex: 1000,
                                            }}
                                            onClick={() => setIsModalOpen(false)} // Đóng Modal khi click bên ngoài
                                        >
                                            <img
                                                src={selectedImage}
                                                alt="Large view"
                                                style={{
                                                    maxWidth: '90%',
                                                    maxHeight: '90%',
                                                    borderRadius: '10px',
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <p>Chưa có tin nhắn nào.</p>
                    )
                ) : (
                    <p style={{ textAlign: 'center', marginTop: '50px' }}>
                        Chọn một tin nhắn để bắt đầu trò chuyện
                    </p>
                )}



                {/* Thanh nhập tin nhắn */}
                <div
                    style={{
                        padding: '10px',
                        borderTop: '1px solid #ddd',
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#fff',
                        marginTop: 'auto',
                    }}
                >
                    <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '20px',
                            border: '1px solid #ddd',
                            marginRight: '10px',
                        }}
                    />
                    <button
                        onClick={handleReplySend}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#4caf50',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer',
                        }}
                    >
                        Gửi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatBoxScreen;
