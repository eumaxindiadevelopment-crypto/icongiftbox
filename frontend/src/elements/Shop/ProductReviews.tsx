import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { fetchProductReviews, submitProductReview, ProductReview } from "../../lib/api";

function Stars({ rating, onRate }: { rating: number; onRate?: (n: number) => void }) {
    return (
        <div className="d-inline-flex">
            {[1, 2, 3, 4, 5].map(n => (
                <i
                    key={n}
                    className={`fa fa-star me-1 ${n <= rating ? 'text-yellow' : 'text-gray-300'}`}
                    style={{ cursor: onRate ? 'pointer' : 'default' }}
                    onClick={() => onRate?.(n)}
                />
            ))}
        </div>
    );
}

export default function ProductReviews({ productId }: { productId: string }) {
    const { isAuthenticated } = useCustomerAuth();
    const [reviews, setReviews] = useState<ProductReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const load = () => {
        setLoading(true);
        fetchProductReviews(productId).then(setReviews).catch(() => setReviews([])).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [productId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;
        setSubmitting(true);
        try {
            await submitProductReview({ productId, rating, title, comment });
            setComment(''); setTitle(''); setRating(5);
            setSubmitted(true);
            toast.success('Thanks! Your review will appear once approved.', { position: 'bottom-right', autoClose: 3000 });
        } catch {
            toast.error('Could not submit your review. Please try again.', { position: 'bottom-right' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="post-comments comments-area style-1 clearfix">
            <h4 className="comments-title mb-2">Reviews ({reviews.length})</h4>

            {loading ? (
                <p>Loading reviews…</p>
            ) : reviews.length === 0 ? (
                <p className="dz-title-text">No reviews yet — be the first to review this product.</p>
            ) : (
                <div id="comment">
                    <ol className="comment-list">
                        {reviews.map(r => (
                            <li className="comment even thread-even depth-1 comment" key={r._id}>
                                <div className="comment-body">
                                    <div className="comment-author vcard d-flex align-items-center gap-2">
                                        <cite className="fn">{r.authorName}</cite>
                                        <Stars rating={r.rating} />
                                    </div>
                                    <div className="comment-content dz-page-text">
                                        {r.title && <p className="fw-bold mb-1">{r.title}</p>}
                                        <p>{r.comment}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            )}

            <div className="default-form comment-respond style-1" id="respond">
                <h4 className="comment-reply-title mb-2" id="reply-title">Write a Review</h4>
                {!isAuthenticated ? (
                    <p className="dz-title-text">
                        Please <Link to="/login">log in</Link> to write a review.
                    </p>
                ) : submitted ? (
                    <p className="dz-title-text text-success">Thanks for your review! It will appear here once approved by our team.</p>
                ) : (
                    <form onSubmit={handleSubmit} className="clearfix">
                        <div className="m-b20">
                            <label className="d-block mb-1">Your Rating</label>
                            <Stars rating={rating} onRate={setRating} />
                        </div>
                        <div className="row">
                            <div className="col-12 m-b20">
                                <input
                                    className="form-control"
                                    placeholder="Title (optional)"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="col-12 m-b20">
                                <textarea
                                    className="form-control"
                                    rows={4}
                                    placeholder="Share your experience with this product..."
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="col-12">
                                <button type="submit" className="btn btn-secondary btnhover20" disabled={submitting}>
                                    {submitting ? 'Submitting…' : 'Submit Review'}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
