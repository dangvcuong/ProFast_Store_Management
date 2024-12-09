import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { get, ref, update, remove } from 'firebase/database';

// Hàm để hiển thị đánh giá sao
const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <span key={i} className={i <= rating ? 'filled-star' : 'empty-star'}>
                ⭐
            </span>
        );
    }
    return stars;
};

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [productIds, setProductIds] = useState([]);

    const fetchProductIds = async () => {
        try {
            const productRef = ref(db, 'products');
            const snapshot = await get(productRef);

            if (snapshot.exists()) {
                const productsData = snapshot.val();
                const productIdsArray = Object.keys(productsData);
                setProductIds(productIdsArray);
            } else {
                setProductIds([]);
            }
        } catch (err) {
            setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại.');
        }
    };

    useEffect(() => {
        fetchProductIds();
    }, []);

    useEffect(() => {
        if (productIds.length > 0) {
            setLoading(true);
            Promise.all(productIds.map(productId => fetchReviews(productId)))
                .then(() => setLoading(false))
                .catch(err => {
                    setError('Có lỗi khi tải dữ liệu');
                    setLoading(false);
                });
        }
    }, [productIds]);

    const fetchReviews = async (productId) => {
        try {
            const reviewRef = ref(db, `reviews/${productId}`);
            const snapshot = await get(reviewRef);

            if (snapshot.exists()) {
                const reviewsData = snapshot.val();
                const reviewsArray = Object.keys(reviewsData).map(key => ({
                    id: key,
                    productId,
                    ...reviewsData[key],
                }));

                setReviews((prevReviews) => {
                    const newReviews = reviewsArray.filter((review) =>
                        !prevReviews.some((r) => r.id === review.id)
                    );
                    return [...prevReviews, ...newReviews];
                });
            } else {
                console.log('Không có đánh giá nào cho sản phẩm', productId);
            }
        } catch (err) {
            setError('Không thể tải đánh giá. Vui lòng thử lại.');
        }
    };

    const handleConfirm = async (reviewId, productId) => {
        try {
            const reviewRef = ref(db, `reviews/${productId}/${reviewId}`);
            await update(reviewRef, { status: 'đã xác nhận' });
            setReviews((prevReviews) => prevReviews.map((review) =>
                review.id === reviewId ? { ...review, status: 'đã xác nhận' } : review
            ));
        } catch (err) {
            setError('Không thể xác nhận đánh giá. Vui lòng thử lại.');
        }
    };

    const handleDelete = async (reviewId, productId) => {
        try {
            const reviewRef = ref(db, `reviews/${productId}/${reviewId}`);
            await remove(reviewRef);
            setReviews((prevReviews) => prevReviews.filter((review) => review.id !== reviewId));
        } catch (err) {
            setError('Không thể xóa đánh giá. Vui lòng thử lại.');
        }
    };

    if (loading) {
        return <p>Đang tải đánh giá...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <h1>Danh sách đánh giá</h1>
            <table>
                <thead>
                    <tr>
                        <th>Mã sản phẩm</th>
                        <th>Người dùng</th>
                        <th>Nội dung đánh giá</th>
                        <th>Đánh giá sao</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {reviews.map((review) => (
                        <tr key={review.id}>
                            <td>{review.productId}</td>
                            <td>{review.userName}</td>
                            <td>{review.review}</td>
                            <td>{renderStars(review.rating)}</td>
                            <td>{review.status}</td>
                            <td>
                                {review.status !== 'đã xác nhận' && (
                                    <button style={{ marginBottom: 10 }} onClick={() => handleConfirm(review.id, review.productId)}>Xác nhận</button>
                                )}
                                <button onClick={() => handleDelete(review.id, review.productId)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Reviews;
