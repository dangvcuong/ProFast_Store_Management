import { ref, set, push, get, child, remove } from "firebase/database";
import { db } from '../firebaseConfig'; // Import Firebase Database từ file cấu hình
class Company {
    constructor(id, name, dateCreated) {
        this.id = id;
        this.name = name;
        this.dateCreated = dateCreated;
    }
}
// Hàm thêm mới một nhân viên
export const addCompany = async (company) => {
    const dbRef = ref(db, 'companys');
    const newCompanyRef = push(dbRef); // Tạo ID tự động bằng cách sử dụng push()
    company.id = newCompanyRef.key; // Lấy khóa (ID) tự động

    // Tạo ngày hiện tại cho nhân viên mới
    company.createdDate = new Date().toLocaleDateString();

    await set(newCompanyRef, company); // Sử dụng set để thêm dữ liệu
};

// Hàm cập nhật một nhân viên đã tồn tại
export const updateCompany = async (company) => {
    if (company.id) {
        const dbRef = ref(db, 'companys/' + company.id); // Sử dụng ID hiện có
        await set(dbRef, company); // Sử dụng set để ghi đè dữ liệu
    } else {
        throw new Error('ID nhân viên không tồn tại để cập nhật');
    }
};

// Lấy danh sách nhân viên
export const getCompany = async () => {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, 'companys'));
    return snapshot.exists() ? snapshot.val() : {};
};
// Xóa một nhân viên
export const deleteCompany = async (id) => {
    const dbRef = ref(db, 'companys/' + id);
    await remove(dbRef); // Sử dụng remove để xóa dữ liệu
};
export default Company;




