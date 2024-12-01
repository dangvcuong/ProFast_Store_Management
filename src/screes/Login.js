import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ref, get, query, orderByChild, equalTo } from "firebase/database";
import { db } from '../firebaseConfig'; // Import từ file cấu hình Firebase
import { updateUserStatus } from '../models/Employee_Model'
const LoginScreen = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);

    const handleLogin = async (username, password) => {
        if (username === "" || password === "") {
            alert("Vui lòng nhập đầy đủ thông tin"); 
        } else {
            if (username === "admin" || password === "admin") {
                onLoginSuccess("admin");
                return;
            }
            try {
                const userRef = query(ref(db, 'employees'), orderByChild('username'), equalTo(username));
                const snapshot = await get(userRef);

                if (snapshot.exists()) {
                    const userData = Object.values(snapshot.val())[0];
                    if (userData.password === password) {
                        console.log("Đăng nhập thành công!", userData);
                        await updateUserStatus(userData.id, "online");
                        onLoginSuccess(userData.position, userData.id); // Gửi thêm userData.id
                    } else {
                        alert("Mật khẩu không chính xác!");
                    }
                } else {
                    alert("Tên đăng nhập không đúng.");
                }
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu người dùng: ", error);
                setErrorMessage("Có lỗi xảy ra. Vui lòng thử lại.");
            }
        }
    };


    const handleSubmit = () => {
        handleLogin(username, password);
    };

    return (
        <View style={styles.container}>
            <View style={styles.box1}>
                <Text style={styles.logoText}>ProFast</Text>
                <Text style={styles.subtitle}>Good to see you again</Text>
                <TextInput
                    placeholder="Your Username"
                    value={username}
                    onChangeText={setUsername}
                    style={styles.input}
                    keyboardType="name-phone-pad"
                />
                <TextInput
                    placeholder="Your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.input}
                />
                {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
                <TouchableOpacity onPress={handleSubmit} style={styles.button}>
                    <Text style={styles.buttonText}>Sign in</Text>
                </TouchableOpacity>
            </View>
        </View>


    );
};

const styles = StyleSheet.create({

    container: {
        width: '100vw', // Chiếm toàn bộ chiều rộng màn hình
        height: '100vh', // Chiếm toàn bộ chiều cao màn hình
        justifyContent: 'center', // Canh giữa theo chiều dọc
        alignItems: 'center', // Canh giữa theo chiều ngang
        backgroundColor: '#f0f4f7',
    },
    box1: {
        width: '30%',
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center'
    },
    logoText: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        color: 'blue',
    },
    subtitle: {
        fontSize: 22,
        marginBottom: 40,
        color: 'orangered',
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 20,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    button: {
        width: '100%',
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        marginBottom: 20,
    },
});


export default LoginScreen;




