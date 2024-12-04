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
                            onChange={(e) => setQuantity(e.target.value)}
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
                            onChange={(e) => setEvaluate(e.target.value)}
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
                <div style={{ flex: 1 }}>
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
                            <td>{products[key].name}</td>
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
            {confirmDialog && (
                <div className="confirmation-dialog">
                    <div className="dialog-content">
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
