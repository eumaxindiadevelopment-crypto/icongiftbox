import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CommanBanner from "../../components/CommanBanner";
import IMAGES from "../../constant/theme";
import CommanSidebar from "../../elements/MyAccount/CommanSidebar";
import { fetchMyOrders, Order } from "../../lib/api";
import { useCurrency } from "../../context/CurrencyContext";

const STATUS_BADGE: Record<string, string> = {
    pending: "bg-warning",
    processing: "bg-info",
    "on-hold": "bg-secondary",
    completed: "bg-success",
    cancelled: "bg-danger",
    refunded: "bg-dark",
};

const STATUS_LABEL: Record<string, string> = {
    pending: "Pending",
    processing: "Processing",
    "on-hold": "On Hold",
    completed: "Completed",
    cancelled: "Cancelled",
    refunded: "Refunded",
};

export default function AccountOrder() {
    const { formatPrice } = useCurrency();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMyOrders()
            .then(setOrders)
            .catch(() => setError('Could not load your orders. Please try again.'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="page-content bg-light">
            <CommanBanner image={IMAGES.BackBg1} mainText="Orders" parentText="Home" currentText="Orders" />
            <div className="content-inner-1">
                <div className="container">
                    <div className="row">
                        <CommanSidebar />
                        <div className="col-xl-9 account-wrapper">
                            <div className="account-card">
                                {loading ? (
                                    <p className="text-center py-4">Loading your orders…</p>
                                ) : error ? (
                                    <p className="text-center py-4 text-danger">{error}</p>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-4">
                                        <p className="mb-3">You haven't placed any orders yet.</p>
                                        <Link to="/shop" className="btn btn-secondary btnhover20">Start Shopping</Link>
                                    </div>
                                ) : (
                                    <div className="table-responsive table-style-1">
                                        <table className="table table-hover mb-3">
                                            <thead>
                                                <tr>
                                                    <th>Order #</th>
                                                    <th>Date Purchased</th>
                                                    <th>Status</th>
                                                    <th>Total</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.map((order) => (
                                                    <tr key={order._id}>
                                                        <td><Link to={`/account-order-details/${order._id}`} className="fw-medium">#{order.orderNumber}</Link></td>
                                                        <td>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                                        <td><span className={`badge m-0 ${STATUS_BADGE[order.status] || 'bg-secondary'}`}>{STATUS_LABEL[order.status] || order.status}</span></td>
                                                        <td>{formatPrice(order.total)}</td>
                                                        <td><Link to={`/account-order-details/${order._id}`} className="btn-link text-underline p-0">View</Link></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
