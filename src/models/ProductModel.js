import { ref, set, push, get, remove, update } from "firebase/database";
import { db } from '../firebaseConfig'; // Import Firebase Database từ file cấu hình

class Product {
    constructor({ id_SanPham, name, price, quantity, dateOfEntry, describe, evaluate, id_Hang, imageUrl }) {
        this.id_SanPham = id_SanPham || '';    // ID sản phẩm
        this.name = name || '';                // Tên sản phẩm
        this.price = price || 0;               // Giá sản phẩm
        this.quantity = quantity || 0;         // Số lượng sản phẩm
        this.dateOfEntry = dateOfEntry || '';  // Ngày nhập kho
        this.describe = describe || '';        // Mô tả sản phẩm
        this.evaluate = evaluate || 0;         // Đánh giá sản phẩm
        this.id_Hang = id_Hang || '';          // ID hãng sản phẩm
        this.imageUrl = imageUrl || '';        // URL ảnh sản phẩm
    }
}

// Thêm sản phẩm vào Firebase với ngày nhập và URL ảnh
export const addProduct = async (product) => {
    const newRef = push(ref(db, '/products'));  // Tạo mới một sản phẩm trong Firebase
    return set(newRef, {
        id_SanPham: newRef.key,  // Tự động sinh ID cho sản phẩm
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        dateOfEntry: new Date().toISOString(),  // Tự động tạo ngày nhập với định dạng ISO
        describe: product.describe,
        evaluate: product.evaluate,
        id_Hang: product.id_Hang,
        imageUrl: product.imageUrl // Thêm URL của ảnh sản phẩm
    });
};

// Đọc danh sách sản phẩm từ Firebase
export const getProducts = async () => {
    const snapshot = await get(ref(db, '/products'));
    return snapshot.exists() ? snapshot.val() : {};
};

// Cập nhật sản phẩm trong Firebase (không cho phép thay đổi ngày nhập)
export const updateProduct = async (product) => {
    if (!product.id) {
        throw new Error("Không tìm thấy ID sản phẩm để cập nhật");
    }

    return update(ref(db, `/products/${product.id}`), product); // Cập nhật sản phẩm với đúng ID
};

// Xóa sản phẩm khỏi Firebase
export const deleteProduct = async (id_SanPham) => {
    return remove(ref(db, `/products/${id_SanPham}`));
};

export default Product;
