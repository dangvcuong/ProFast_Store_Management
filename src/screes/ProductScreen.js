import React, { useState, useEffect } from 'react';
import { addProduct, updateProduct, deleteProduct } from '../models/ProductModel';
import { storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../firebaseConfig';
import { ref as dbRef, onValue } from 'firebase/database';
import { getCompany } from '../models/Company_Model';
import '../screes/csss/Product.css';
const ProductManagement = () => {
    const [id, setId] = useState('');
    const [products, setProducts] = useState({});
    const [companies, setCompanies] = useState({});
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [describe, setDescribe] = useState('');
    const [evaluate, setEvaluate] = useState('');
    const [id_Hang, setId_Hang] = useState('');
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [quantitysold, setQuantitysold] = useState('');
    const [currentOrderId, setCurrentOrderId] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState(false);
    const quantitysoldNew = 0;
    const [position, setPosition] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded((prev) => !prev);
    };

    // Hàm mở modal và set dữ liệu sản phẩm
    const handleViewDetails = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    // Hàm đóng modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };
    // Lấy position từ Firebase hoặc từ localStorage
    useEffect(() => {
        // Ví dụ lấy từ Firebase hoặc localStorage
        const userPosition = localStorage.getItem('position');
        setPosition(userPosition);
    }, []);
    console.log("Position: ", position);

    useEffect(() => {
        loadProductsRealtime();
        loadCompanies();
    }, []);

    const loadProductsRealtime = () => {
        const productsRef = dbRef(db, '/products');
        onValue(productsRef, (snapshot) => {
            const data = snapshot.val();
            setProducts(data || {});
        });
    };

    const loadCompanies = async () => {
        const companiesData = await getCompany();
        setCompanies(companiesData);
    };

    const handleImageChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setImage(selectedFile);
        }
    };

    const handleUploadImage = async () => {
        try {
            if (image) {
                const storageRef = ref(storage, `products/${image.name}`);
                await uploadBytes(storageRef, image);
                const url = await getDownloadURL(storageRef);
                setImageUrl(url);
                return url;
            }
            return '';
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Error uploading image to Firebase Storage.");
            return '';
        }
    };

    const handleAdd = async () => {
        if (position !== 'admin') { // Chỉ admin được thêm
            alert('Bạn không có quyền thêm sản phẩm.');
            return;
        }
        try {
            if (!image) {
                alert('Vui lòng chọn ảnh');
                return;
            }

            const uploadedImageUrl = await handleUploadImage();
            if (!uploadedImageUrl) {
                alert('Image upload error. Please try again.');
                return;
            }

            if (!name || !price || !quantity || !describe || !evaluate || !id_Hang) {
                alert('Vui lòng nhập đầy đủ thông tin');
                return;
            }

            const product = {
                name,
                price: Number(price),
                quantity: Number(quantity),
                dateOfEntry: new Date().toISOString(),
                describe,
                evaluate,
                id_Hang,
                imageUrl: uploadedImageUrl,
                quantitysold: Number(quantitysoldNew),
            };

            await addProduct(product);
            resetForm();
            alert("Thêm sản phẩm mới thành công!");
        } catch (error) {
            console.error("Error adding product:", error);
            alert("Lỗi vui lòng thêm lại.");
        }
    };

    const handleUpdate = async () => {
        if (position !== 'admin') { // Chỉ admin được thêm
            alert('Bạn không có quyền sửa sản phẩm.');
            return;
        }
        if (!id) {
            alert('Product ID not found for update');
            return;
        }

        if (!name || !price || !quantity || !describe || !evaluate || !id_Hang) {
            alert('Please enter all required information');
            return;
        }

        try {
            let uploadedImageUrl = imageUrl;
            if (image) {
                uploadedImageUrl = await handleUploadImage();
                if (!uploadedImageUrl) {
                    alert('Image upload error. Please try again.');
                    return;
                }
            }

            const product = { id, name, price: Number(price), quantity: Number(quantity), describe, evaluate, id_Hang, imageUrl: uploadedImageUrl, quantitysold: Number(quantitysold), };
            await updateProduct(product);

            alert("Product updated successfully!");
            resetForm();
        } catch (error) {
            console.error("Error updating product:", error);
            alert("Error updating product. Please try again.");
        }
    };

    const handleEdit = (product) => {
        setId(product.id_SanPham);
        setName(product.name);
        setPrice(product.price);
        setQuantity(product.quantity);
        setDescribe(product.describe);
        setEvaluate(product.evaluate);
        setId_Hang(product.id_Hang);
        setImageUrl(product.imageUrl);
        setQuantitysold(product.quantitysold);
    };

    const handleDelete = async (id_SanPham) => {
        if (position !== 'admin') { // Chỉ admin được thêm
            alert('Bạn không có quyền xóa sản phẩm.');
            return;
        }
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

    // Hàm chuyển đổi chuỗi có dấu thành không dấu
    const removeVietnameseTones = (str) => {
        return str
            .normalize("NFD") // Chuẩn hóa chuỗi theo chuẩn Unicode Normalization Form D
            .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
            .replace(/đ/g, "d") // Chuyển đổi "đ" thành "d"
            .replace(/Đ/g, "D"); // Chuyển đổi "Đ" thành "D"
    };

    const filteredProducts = Object.keys(products).filter((key) => {
        const product = products[key];

        // Chuyển đổi cả searchTerm và tên sản phẩm sang dạng không dấu
        const matchesCompany = selectedCompany === '' || product.id_Hang === selectedCompany;
        const matchesSearchTerm =
            searchTerm === '' ||
            removeVietnameseTones(product.name.toLowerCase()).includes(removeVietnameseTones(searchTerm.toLowerCase()));

        return matchesCompany && matchesSearchTerm;
    });
    const closeDialog = () => {
        setConfirmDialog(false);
        setCurrentOrderId(null);
    };


    const [expanded, setExpanded] = useState({});

    // Hàm kiểm tra nếu mô tả dài
    const isDescriptionLong = (description) => {
        // Định nghĩa chiều dài tối đa cho mô tả ngắn
        const maxLength = 100;
        return description.length > maxLength;
    };

    const toggleDescription = (id) => {
        setExpanded((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    return (
        <div className="body">
            <h1>Quản lý sản phẩm</h1>
            <div style={{ display: 'flex', gap: '200px' }}>
                <div style={{ flex: 1 }}>


                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            placeholder="Nhập tên sản phẩm"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{
                                marginBottom: '10px',
                                flex: 1,
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                            }}
                        />
                        <input
                            placeholder="Nhập giá"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            style={{
                                marginBottom: '10px',
                                flex: 1,
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            placeholder="Nhập số lượng"
                            type="number"
                            value={quantity}
                            onChange={(e) => {
                                const value = e.target.value;
                                // Chỉ cho phép nhập số không âm
                                if (value >= 0) {
                                    setQuantity(value);
                                }
                            }}
                            min="0" // Ngăn không cho nhập số âm
                            style={{
                                marginBottom: '10px',
                                flex: 1,
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                            }}
                        />
                        <input
                            placeholder="Nhập mô tả"
                            value={describe}
                            onChange={(e) => setDescribe(e.target.value)}
                            style={{
                                marginBottom: '10px',
                                flex: 1,
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            placeholder="Đánh giá"
                            type="number"
                            value={evaluate}
                            onChange={(e) => {
                                const value = e.target.value;
                                // Chỉ cho phép nhập số không âm và tối đa 5
                                if (value >= 0 && value <= 5) {
                                    setEvaluate(value);
                                }
                            }}
                            min="0" // Ngăn không cho nhập số âm
                            max="5" // Giới hạn đánh giá tối đa là 5
                            style={{
                                marginBottom: '10px',
                                flex: 1,
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                            }}
                        />
                        <select value={id_Hang} onChange={(e) => setId_Hang(e.target.value)} style={{
                            marginBottom: '10px',
                            flex: 1,
                            padding: '10px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                        }}>
                            <option value="">Chọn hãng</option>
                            {companies && Object.keys(companies).map((key) => (
                                <option key={key} value={key}>
                                    {companies[key].name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="file" onChange={handleImageChange} style={{
                            marginBottom: '10px',
                            width: '49%',
                            padding: 10,
                            justifyContent: 'center',
                            alignContent: 'center',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            boxSizing: 'border-box',
                        }} />

                        <div style={{ marginTop: 10, flex: 1, }}>
                            <button onClick={handleAdd} style={{
                                marginRight: '10px',
                                padding: '10px',
                                backgroundColor: '#2196F3',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '14px',
                                color: 'white',
                                boxSizing: 'border-box',
                            }}>Thêm mới </button>

                            <button onClick={handleUpdate} disabled={!id} style={{
                                marginBottom: '10px',
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '14px',
                                color: 'white',
                                backgroundColor: '#2196F3',
                                boxSizing: 'border-box',
                            }}>Cập nhật</button>
                        </div>
                    </div>



                </div>
                <div className="loc-sp" style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', }}>
                        <div style={{}}>
                            <h3>Lọc sản phẩm theo hãng</h3>
                            <select
                                value={selectedCompany}
                                onChange={(e) => setSelectedCompany(e.target.value)}
                                style={{ width: '100%', padding: '8px', fontSize: '16px', }}
                            >
                                <option value="">Tất cả sản phẩm</option>
                                {companies && Object.keys(companies).map((key) => (
                                    <option key={key} value={key}>
                                        {companies[key].name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3>Tìm kiếm sản phẩm</h3>
                            <input
                                placeholder="Nhập tên sản phẩm cần tìm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '90%', padding: '8px', fontSize: '16px' }}
                            />
                        </div>
                    </div>
                </div>
            </div>



            <table className="table-container">
                <thead>
                    <tr>
                        <th>Ảnh sản phẩm</th>
                        <th>Tên sản phẩm</th>
                        <th>Giá</th>
                        <th>Số lượng</th>
                        <th>Mô tả</th>
                        <th>Danh mục</th>
                        <th>Đánh giá</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody className='tablecao'>
                    {filteredProducts.map((key) => (
                        <tr key={key}>
                            <td>
                                <img
                                    src={products[key].imageUrl}
                                    alt="Product"
                                    style={{ width: '100px', height: '100px' }}
                                    onError={(e) => e.target.src = "https://via.placeholder.com/50"}
                                />
                            </td>
                            <td onClick={() => handleViewDetails(products[key])}>{products[key].name}</td>
                            <td>{products[key].price}</td>
                            <td>{products[key].quantity}</td>
                            <td>
                                <div className={`product-description ${expanded[products[key].id_SanPham] ? 'expanded' : ''}`}>
                                    {products[key].describe}
                                </div>
                                {isDescriptionLong(products[key].describe) && (
                                    <button className="toggle-btn" onClick={() => toggleDescription(products[key].id_SanPham)}>
                                        {expanded[products[key].id_SanPham] ? 'Thu gọn' : 'Xem thêm'}
                                    </button>
                                )}
                            </td>
                            <td>{companies[products[key].id_Hang]?.name || 'N/A'}</td>
                            <td>{products[key].evaluate}</td>
                            <td>
                                <button onClick={() => { setCurrentOrderId(products[key].id_SanPham); setConfirmDialog(true) }} style={{
                                    color: 'white',
                                    backgroundColor: '#2196F3',
                                }}>Xóa</button>
                                <div style={{ height: 5 }}></div>
                                <button onClick={() => handleEdit(products[key])} style={{
                                    color: 'white',
                                    backgroundColor: '#2196F3',
                                }}>Sửa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* Modal hiển thị chi tiết sản phẩm */}
            {isModalOpen && selectedProduct && (
                <div className="confirmation-dialog" style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0,0,0,0.5)",
                }}>
                    <div style={{
                        width: 500,
                        maxHeight: 500,
                        backgroundColor: "white",
                        borderRadius: 10,
                        padding: 10,
                        display: "flex",
                        flexDirection: "column",
                    }}>
                        {/* Nội dung có thể cuộn */}
                        <div style={{
                            flex: 1, // Phần nội dung sẽ chiếm toàn bộ không gian còn lại
                            overflowY: "auto", // Cho phép cuộn nếu nội dung quá dài
                        }}>
                            <h2 style={{ textAlign: 'center' }}>Chi tiết sản phẩm</h2>
                            <img
                                src={selectedProduct.imageUrl}
                                alt={selectedProduct.name}
                                style={{ width: 100, height: 100, marginBottom: "10px", }}
                            />
                            <p><strong>Tên sản phẩm:</strong> {selectedProduct.name}</p>
                            <p><strong>Giá:</strong> {selectedProduct.price} VNĐ</p>
                            <p><strong>Số lượng:</strong> {selectedProduct.quantity}</p>
                            <p><strong>Đã bán:</strong> {selectedProduct.quantitysold}</p>
                            <p><strong>Đánh giá:</strong> {selectedProduct.evaluate}</p>

                            {/* Mô tả */}
                            <p>
                                <strong>Mô tả:</strong>{" "}
                                {isExpanded
                                    ? selectedProduct.describe
                                    : `${selectedProduct.describe.slice(0, 100)}...`}
                                <button
                                    onClick={toggleExpand}
                                    className="toggle-btn"
                                >
                                    {isExpanded ? "Thu gọn" : "Xem thêm"}
                                </button>
                            </p>
                        </div>

                        {/* Nút Đóng luôn ở dưới */}
                        <div style={{
                            textAlign: "center",
                            paddingTop: "10px",

                        }}>
                            <button
                                onClick={handleCloseModal}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: "#007BFF",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",

                                }}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {confirmDialog && (
                <div className="confirmation-dialog">
                    <div style={{ width: 500, height: 100, backgroundColor: "white", textAlign: 'center', borderRadius: 10, padding: 10 }}>
                        <h3>Xác nhận xóa sản phẩm này không?</h3>

                        <div className="dialog-footer">
                            <button onClick={() => { handleDelete(currentOrderId); closeDialog(); }} style={{
                                color: 'white',
                                backgroundColor: '#2196F3',
                            }}>Đồng ý</button>
                            <button onClick={closeDialog} style={{
                                color: 'white',
                                backgroundColor: '#2196F3',
                            }}>Không</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManagement;
