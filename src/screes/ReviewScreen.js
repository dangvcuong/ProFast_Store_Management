import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { get, ref, update, remove } from 'firebase/database';

// Hàm render đánh giá sao
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

// Modal xem chi tiết
const ReviewDetailModal = ({ review, onClose }) => {
    if (!review) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
            justifyContent: 'center', alignItems: 'center',
        }}>
            <div style={{
                backgroundColor: 'white', padding: '20px', borderRadius: '8px',
                width: '500px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
            }}>
                <h2>Chi tiết đánh giá</h2>
                <p><strong>Tên sản phẩm:</strong> {review.nameProduct}</p>
                <p><strong>Người dùng:</strong> {review.userName}</p>
                <p><strong>Nội dung:</strong> {review.review}</p>
                <p><strong>Đánh giá sao:</strong> {renderStars(review.rating)}</p>
                <div style={{ textAlign: 'right' }}>
                    <button onClick={onClose} style={{ marginTop: '10px' }}>Đóng</button>
                </div>
            </div>
        </div>
    );
};

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [productIds, setProductIds] = useState([]);
    const [selectedReview, setSelectedReview] = useState(null); // State modal chi tiết

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

    if (loading) return <p>Đang tải đánh giá...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1>Danh sách đánh giá</h1>
            <table>
                <thead>
                    <tr>
                        <th>Tên sản phẩm</th>
                        <th>Người dùng</th>
                        <th>Nội dung</th>
                        <th>Đánh giá sao</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {reviews.map((review) => (
                        <tr key={review.id}>
                            <td onClick={() => setSelectedReview(review)}>{review.nameProduct}</td>
                            <td>{review.userName}</td>
                            <td>{review.review}</td>
                            <td>{renderStars(review.rating)}</td>
                            <td>
                                <button onClick={() => handleDelete(review.id, review.productId)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Hiển thị modal khi selectedReview có giá trị */}
            {selectedReview && (
                <ReviewDetailModal
                    review={selectedReview}
                    onClose={() => setSelectedReview(null)}
                />
            )}
        </div>
    );
};

export default Reviews;
