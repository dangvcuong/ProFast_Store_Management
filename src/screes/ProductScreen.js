import React, { useState, useEffect } from 'react';
import { addProduct, updateProduct, deleteProduct } from '../models/ProductModel';
import { storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../firebaseConfig';
import { ref as dbRef, onValue } from 'firebase/database';
import { getCompany } from '../models/Company_Model'; // Hàm lấy danh sách hãng sản phẩm

const ProductManagement = () => {
    const [id, setId] = useState('');
    const [products, setProducts] = useState({});
    const [companies, setCompanies] = useState({}); // State lưu danh sách hãng sản phẩm
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [describe, setDescribe] = useState('');
    const [evaluate, setEvaluate] = useState('');
    const [id_Hang, setId_Hang] = useState(''); // ID của hãng sản phẩm
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        loadProductsRealtime();
        loadCompanies(); // Gọi hàm tải hãng sản phẩm khi component được render
    }, []);

    const loadProductsRealtime = () => {
        const productsRef = dbRef(db, '/products');
        onValue(productsRef, (snapshot) => {
            const data = snapshot.val();
            setProducts(data || {});
        });
    };

    // Hàm tải danh sách hãng sản phẩm
    const loadCompanies = async () => {
        const companiesData = await getCompany();
        setCompanies(companiesData);
    };

    const handleImageChange = (e) => {
        const selectedFile = e.target.files[0]; // Lấy tệp đã chọn
        if (selectedFile) {
            console.log("Image selected:", selectedFile); // Kiểm tra ảnh được chọn
            setImage(selectedFile); // Lưu ảnh vào state
        } else {
            console.error("No image selected");
        }
    };

    const handleUploadImage = async () => {
        try {
            if (image) {
                const storageRef = ref(storage, `products/${image.name}`);
                await uploadBytes(storageRef, image); // Tải ảnh lên Firebase Storage
                const url = await getDownloadURL(storageRef); // Lấy URL của ảnh đã tải lên
                setImageUrl(url);
                return url;
            }
            return '';
        } catch (error) {
            console.error("Lỗi khi tải ảnh lên:", error);
            alert("Lỗi khi tải ảnh lên Firebase Storage. Vui lòng thử lại.");
            return '';
        }
    };

    const handleAdd = async () => {
        try {
            // Kiểm tra xem ảnh đã được chọn chưa
            if (!image) {
                alert('Vui lòng chọn ảnh sản phẩm');
                return;
            }

            // Tải ảnh lên Firebase Storage trước khi thêm sản phẩm
            const uploadedImageUrl = await handleUploadImage();
            if (!uploadedImageUrl) {
                alert('Lỗi tải ảnh. Vui lòng thử lại.');
                return;
            }

            // Kiểm tra xem các trường còn lại có đầy đủ không
            if (!name || !price || !quantity || !describe || !evaluate || !id_Hang) {
                alert('Vui lòng nhập đầy đủ thông tin');
                return;
            }

            // Tạo đối tượng sản phẩm để lưu vào Firebase Database
            const product = {
                name,
                price,
                quantity,
                dateOfEntry: new Date().toISOString(), // Tự động thêm ngày nhập hiện tại
                describe,
                evaluate,
                id_Hang,
                imageUrl: uploadedImageUrl // Lưu URL ảnh vào thông tin sản phẩm
            };

            // Gọi hàm thêm sản phẩm và reset form sau khi thêm thành công
            await addProduct(product);
            resetForm(); // Reset lại form sau khi thêm thành công
            alert("Sản phẩm đã được thêm thành công!");
        } catch (error) {
            console.error("Lỗi khi thêm sản phẩm:", error);
            alert("Lỗi khi thêm sản phẩm. Vui lòng thử lại.");
        }
    };



    const handleUpdate = async () => {
        // Kiểm tra ID sản phẩm cần cập nhật
        if (!id) {
            alert('Không tìm thấy sản phẩm để cập nhật');
            return;
        }

        // Kiểm tra các trường còn lại
        if (!name || !price || !quantity || !describe || !evaluate || !id_Hang) {
            alert('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        try {
            let uploadedImageUrl = imageUrl; // Nếu không có ảnh mới thì giữ nguyên URL cũ

            // Kiểm tra nếu người dùng có chọn ảnh mới
            if (image) {
                uploadedImageUrl = await handleUploadImage(); // Tải ảnh mới lên Firebase Storage
                if (!uploadedImageUrl) {
                    alert('Lỗi tải ảnh. Vui lòng thử lại.');
                    return;
                }
            }

            // Cập nhật sản phẩm
            const product = { id, name, price, quantity, describe, evaluate, id_Hang, imageUrl: uploadedImageUrl };
            await updateProduct(product);

            alert("Cập nhật sản phẩm thành công!");
            resetForm(); // Reset lại form sau khi cập nhật
        } catch (error) {
            console.error("Lỗi khi cập nhật sản phẩm:", error);
            alert("Lỗi khi cập nhật sản phẩm. Vui lòng thử lại.");
        }
    };



    const handleEdit = (product) => {
        setId(product.id_SanPham); // Sử dụng id_SanPham lấy từ Firebase
        setName(product.name);
        setPrice(product.price);
        setQuantity(product.quantity);
        setDescribe(product.describe);
        setEvaluate(product.evaluate);
        setId_Hang(product.id_Hang);
        setImageUrl(product.imageUrl);
    };


    const handleDelete = async (id_SanPham) => {
        await deleteProduct(id_SanPham);
    };

    const resetForm = () => {
        setName('');
        setPrice('');
        setQuantity('');
        setDescribe('');
        setEvaluate('');
        setId_Hang('');
        setImage(null);
        setImageUrl('');
    };

    return (
        <div className="container">
            <h1>Quản lý sản phẩm</h1>

            <input placeholder="Tên sản phẩm" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: '10px' }} />
            <input placeholder="Giá" type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={{ marginBottom: '10px' }} />
            <input placeholder="Số lượng" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={{ marginBottom: '10px' }} />
            <input placeholder="Mô tả" value={describe} onChange={(e) => setDescribe(e.target.value)} style={{ marginBottom: '10px' }} />
            <input placeholder="Đánh giá" type="number" value={evaluate} onChange={(e) => setEvaluate(e.target.value)} style={{ marginBottom: '10px' }} />

            <select value={id_Hang} onChange={(e) => setId_Hang(e.target.value)} style={{ marginBottom: '10px' }}>
                <option value="">Chọn hãng sản phẩm</option>
                {companies && Object.keys(companies).map((key) => (
                    <option key={key} value={key}>
                        {companies[key].name}
                    </option>
                ))}
            </select>

            <input type="file" onChange={handleImageChange} style={{ marginBottom: '10px' }} />

            <button onClick={handleAdd}>Thêm</button>
            <button onClick={handleUpdate} disabled={!id}>Cập nhật</button>

            <h2>Danh sách sản phẩm</h2>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Hình ảnh</th>
                            <th>Tên sản phẩm</th>
                            <th>Giá</th>
                            <th>Số lượng</th>
                            <th>Mô tả</th>
                            <th>Hãng sản phẩm</th>
                            <th>Đánh giá</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(products).map((key) => (
                            <tr key={key}>
                                <td>
                                    <img src={products[key].imageUrl} alt="Product" style={{ width: '100px', height: '100px' }} onError={(e) => e.target.src = "https://via.placeholder.com/50"} />
                                </td>
                                <td>{products[key].name}</td>
                                <td>{products[key].price}</td>
                                <td>{products[key].quantity}</td>
                                <td>{products[key].describe}</td>
                                <td>{companies[products[key].id_Hang]?.name || 'N/A'}</td>
                                <td>{products[key].evaluate}</td>
                                <td>
                                    <button onClick={() => handleDelete(products[key].id_SanPham)}>Xóa</button>
                                    <button onClick={() => handleEdit(products[key])}>Sửa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

    );
};

export default ProductManagement;
