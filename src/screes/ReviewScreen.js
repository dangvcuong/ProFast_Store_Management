import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { ref, onValue, update, remove } from 'firebase/database';

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
    const [error, setError] = useState(null);
    const [selectedReview, setSelectedReview] = useState(null); // State modal chi tiết
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null); // Đánh giá cần xóa

    useEffect(() => {
        const reviewsRef = ref(db, 'reviews');

        // Lắng nghe sự thay đổi dữ liệu từ Firebase
        const unsubscribe = onValue(reviewsRef, (snapshot) => {
            if (snapshot.exists()) {
                const allReviews = [];
                const data = snapshot.val();

                // Lặp qua các sản phẩm và thu thập đánh giá
                Object.keys(data).forEach((productId) => {
                    const productReviews = data[productId];
                    Object.keys(productReviews).forEach((reviewId) => {
                        allReviews.push({
                            id: reviewId,
                            productId,
                            ...productReviews[reviewId],
                        });
                    });
                });

                setReviews(allReviews); // Cập nhật danh sách đánh giá
            } else {
                setReviews([]); // Trả về mảng rỗng nếu không có dữ liệu
            }
        }, (error) => {
            setError('Không thể tải đánh giá. Vui lòng thử lại.');
        });

        // Hủy lắng nghe khi component unmount
        return () => unsubscribe();
    }, []);

    const handleDelete = (reviewId, productId) => {
        setReviewToDelete({ reviewId, productId });
        setShowDeleteDialog(true);
    };
    const confirmDelete = async () => {
        if (reviewToDelete) {
            const { reviewId, productId } = reviewToDelete;
            try {
                const reviewRef = ref(db, `reviews/${productId}/${reviewId}`);
                await remove(reviewRef);
                setShowDeleteDialog(false);
                setReviewToDelete(null); // Reset reviewToDelete
            } catch (err) {
                setError('Không thể xóa đánh giá. Vui lòng thử lại.');
            }
        }
    };

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

            {showDeleteDialog && (
    <div className="confirmation-dialog">
        <div style={{
            width: 500, height: 100, backgroundColor: "white", textAlign: 'center',
            borderRadius: 10, padding: 20
        }}>
            <h3>Bạn có chắc chắn muốn xóa đánh giá này?</h3>
            <div className="dialog-footer">
                <button onClick={confirmDelete} style={{
                    color: 'white', backgroundColor: '#2196F3',
                }}>Đồng ý</button>
                <button onClick={() => { setShowDeleteDialog(false); setReviewToDelete(null); }} style={{
                    color: 'white', backgroundColor: '#2196F3',
                }}>Không</button>
            </div>
        </div>
    </div>
)}

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
