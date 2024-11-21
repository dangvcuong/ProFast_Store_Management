import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { ref as dbRef, push, set, onValue } from 'firebase/database';

const ChatBoxScreen = () => {
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [replyText, setReplyText] = useState('');
    const [userId, setUserID] = useState('');
    const [userData, setUserData] = useState(null);

    // Lấy danh sách tin nhắn
    useEffect(() => {
        const messagesRef = dbRef(db, 'chats/');
        const unsubscribe = onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const messagesArray = Object.keys(data).map((key) => {
                    const lastMessage = data[key]?.messages
                        ? Object.values(data[key].messages).pop()
                        : null;

                    return {
                        id: key,
                        nameUser: lastMessage?.nameUser || 'Không rõ',
                        imageUser: lastMessage?.imageUser || 'https://via.placeholder.com/50',
                        text: lastMessage?.text || '...',
                    };
                });
                setMessages(messagesArray);
            } else {
                setMessages([]);
            }
        });
        return () => unsubscribe();
    }, []);


    // Lấy thông tin người dùng và lịch sử trò chuyện
    useEffect(() => {
        if (selectedMessage) {
            const userRef = dbRef(db, `users/${selectedMessage.id}`);
            const chatRef = dbRef(db, `chats/${selectedMessage.id}/messages`);

            const unsubscribeUser = onValue(userRef, (snapshot) => {
                setUserData(snapshot.val() || null);
            });

            const unsubscribeChat = onValue(chatRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const messageList = Object.keys(data).map((key) => ({
                        id: key,
                        ...data[key],
                    }));
                    setChatHistory(messageList);
                } else {
                    setChatHistory([]);
                }
            });

            return () => {
                unsubscribeUser();
                unsubscribeChat();
            };
        }
    }, [selectedMessage]);

    // Gửi tin nhắn
    const handleReplySend = async () => {
        if (!replyText.trim() || !selectedMessage) return;

        try {
            const chatRef = dbRef(db, `chats/${selectedMessage.id}/messages`);
            const newMessageRef = push(chatRef);
            const newMessage = {
                id: newMessageRef.key,
                authorId: userId,
                createdAt: Date.now(),
                text: replyText.trim(),
                status: 2,
            };

            await set(newMessageRef, newMessage);
            setReplyText('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div style={{ display: 'flex', height: '93vh', fontFamily: 'Arial, sans-serif' }}>
            {/* Sidebar */}
            <div style={{ width: '25%', borderRight: '1px solid #ddd', overflowY: 'scroll', padding: '10px' }}>
                <h3 style={{ textAlign: 'center', margin: '10px 0' }}>Danh sách tin nhắn</h3>
                {messages.length > 0 ? (
                    messages.map((message) => (
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
                                src={message.imageUser}
                                alt={message.nameUser}
                                style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '10px' }}
                            />
                            <div>
                                <p style={{ margin: 0, fontWeight: 'bold' }}>{message.nameUser}</p>
                                <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>{message.text}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>Không có tin nhắn nào.</p>
                )}
            </div>

            {/* Chat box */}
            <div style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column' }}>
                {userData && (
                    <div style={{ textAlign: 'center' }}>
                        <img
                            src={userData.image || 'https://via.placeholder.com/100'}
                            alt="User Avatar"
                            style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                        />
                        <h3>{userData.name || 'Không rõ'}</h3>
                    </div>
                )}
                <hr />

                {/* Chat history */}
                <div style={{ flex: 1, overflowY: 'scroll', padding: '10px', maxHeight: '70vh' }}>
                    {chatHistory.length > 0 ? (
                        chatHistory.map((chat) => (
                            <div
                                key={chat.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: chat.status === 2 ? 'flex-end' : 'flex-start',
                                    marginBottom: '10px',
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: '60%',
                                        padding: '10px',
                                        borderRadius: '10px',
                                        backgroundColor: chat.status === 2 ? '#4caf50' : '#fff',
                                        color: chat.status === 2 ? '#fff' : '#000',
                                    }}
                                >
                                    <p style={{ margin: 0 }}>{chat.text}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>Chưa có tin nhắn nào.</p>
                    )}
                </div>

                {/* Input bar */}
                <div style={{ padding: '10px', display: 'flex', alignItems: 'center', borderTop: '1px solid #ddd' }}>
                    <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd', marginRight: '10px' }}
                    />
                    <button
                        onClick={handleReplySend}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#4caf50',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '20px',
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
