import React, { useState, useEffect } from 'react';
import { addProduct, updateProduct, deleteProduct } from '../models/ProductModel';
import { storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../firebaseConfig';
import { ref as dbRef, onValue } from 'firebase/database';
import { getCompany } from '../models/Company_Model';

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
    const quantitysold = "0";
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
                alert('Please select a product image');
                return;
            }

            const uploadedImageUrl = await handleUploadImage();
            if (!uploadedImageUrl) {
                alert('Image upload error. Please try again.');
                return;
            }

            if (!name || !price || !quantity || !describe || !evaluate || !id_Hang) {
                alert('Please enter all required information');
                return;
            }

            const product = {
                name,
                price,
                quantity,
                dateOfEntry: new Date().toISOString(),
                describe,
                evaluate,
                id_Hang,
                imageUrl: uploadedImageUrl,
                quantitysold,
            };

            await addProduct(product);
            resetForm();
            alert("Product added successfully!");
        } catch (error) {
            console.error("Error adding product:", error);
            alert("Error adding product. Please try again.");
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

            const product = { id, name, price, quantity, describe, evaluate, id_Hang, imageUrl: uploadedImageUrl, quantitysold };
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

    return (
        <div className="container">
            <h1>Product Management</h1>
            <div style={{ display: 'flex', gap: '250px' }}>
                <div style={{ flex: 1 }}>


                    <input placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: '10px' }} />
                    <input placeholder="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={{ marginBottom: '10px' }} />
                    <input placeholder="Quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={{ marginBottom: '10px', }} />
                    <input placeholder="Description" value={describe} onChange={(e) => setDescribe(e.target.value)} style={{ marginBottom: '10px' }} />
                    <input placeholder="Rating" type="number" value={evaluate} onChange={(e) => setEvaluate(e.target.value)} style={{ marginBottom: '10px' }} />

                    <select value={id_Hang} onChange={(e) => setId_Hang(e.target.value)} style={{ width: "40%", padding: '8px', fontSize: '12px' }}>
                        <option value="">Chọn hãng</option>
                        {companies && Object.keys(companies).map((key) => (
                            <option key={key} value={key}>
                                {companies[key].name}
                            </option>
                        ))}
                    </select>
                    <div style={{ height: 5 }}></div>
                    <input type="file" onChange={handleImageChange} />
                    <button onClick={handleAdd}>Add</button>
                    <button onClick={handleUpdate} disabled={!id}>Update</button>
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '40px', marginTop: '15%' }}>
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
                                style={{ width: '100%', padding: '8px', fontSize: '16px' }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <h2>Product List</h2>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Description</th>
                            <th>Company</th>
                            <th>Rating</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
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
                                <td>{products[key].describe}</td>
                                <td>{companies[products[key].id_Hang]?.name || 'N/A'}</td>
                                <td>{products[key].evaluate}</td>
                                <td>
                                    <button onClick={() => handleDelete(products[key].id_SanPham)}>Delete</button>
                                    <button onClick={() => handleEdit(products[key])}>Edit</button>
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
