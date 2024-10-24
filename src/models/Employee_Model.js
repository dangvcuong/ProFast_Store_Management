import { ref, set, push, get, child, remove } from "firebase/database";
import { db } from '../firebaseConfig'; // Import Firebase Database từ file cấu hình

class Employee {
    constructor(id, email, username, password, name, status, phoneNumber, position, createdDate) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.password = password;
        this.name = name;
        this.status = status;
        this.phoneNumber = phoneNumber;
        this.position = position;
        this.createdDate = createdDate; // Thêm trường ngày tạo
    }
}

// Hàm thêm mới một nhân viên
export const addEmployee = async (employee) => {
    const dbRef = ref(db, 'employees');
    const newEmployeeRef = push(dbRef); // Tạo ID tự động bằng cách sử dụng push()
    employee.id = newEmployeeRef.key; // Lấy khóa (ID) tự động

    // Tạo ngày hiện tại cho nhân viên mới
    employee.createdDate = new Date().toLocaleDateString();

    await set(newEmployeeRef, employee); // Sử dụng set để thêm dữ liệu
};

// Hàm cập nhật một nhân viên đã tồn tại
export const updateEmployee = async (employee) => {
    if (employee.id) {
        const dbRef = ref(db, 'employees/' + employee.id); // Sử dụng ID hiện có
        await set(dbRef, employee); // Sử dụng set để ghi đè dữ liệu
    } else {
        throw new Error('ID nhân viên không tồn tại để cập nhật');
    }
};

// Lấy danh sách nhân viên
export const getEmployees = async () => {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, 'employees'));
    return snapshot.exists() ? snapshot.val() : {};
};

// Xóa một nhân viên
export const deleteEmployee = async (id) => {
    const dbRef = ref(db, 'employees/' + id);
    await remove(dbRef); // Sử dụng remove để xóa dữ liệu
};

export default Employee;
