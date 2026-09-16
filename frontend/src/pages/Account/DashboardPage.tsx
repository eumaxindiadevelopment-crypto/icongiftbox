import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CommanBanner from "../../components/CommanBanner";
import IMAGES from "../../constant/theme";
import CommanSidebar from "../../elements/MyAccount/CommanSidebar";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { useCurrency } from "../../context/CurrencyContext";
import { fetchMyOrders, Order } from "../../lib/api";

const STATUS_LABEL: Record<string, string> = {
    pending: "Pending", processing: "Processing", "on-hold": "On Hold",
    completed: "Completed", cancelled: "Cancelled", refunded: "Refunded",
};

export default function DashboardPage() {
    const { customer, logout } = useCustomerAuth();
    const { formatPrice } = useCurrency();
    const navigate = useNavigate();
    const fullName = customer ? `${customer.firstName} ${customer.lastName}`.trim() : "";
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyOrders().then(setOrders).catch(() => setOrders([])).finally(() => setLoading(false));
    }, []);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const totalSpent = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div className="page-content bg-light">
            <CommanBanner image={IMAGES.BackBg1} mainText="Dashboard" parentText="Home" currentText="Dashboard" />
            <div className="content-inner-1">
                <div className="container">
                    <div className="row">
                       <CommanSidebar />
                        <section className="col-xl-9 account-wrapper">
                            <div className="account-card">
                                <div className="m-b30">
                                    <p>Hello <strong className="text-black">{fullName || "there"}</strong> (not <strong className="text-black">{fullName || "you"}</strong>? <button type="button" className="text-underline btn-link p-0 border-0 bg-transparent" onClick={handleLogout}>Log out</button>)</p>
                                    <p>From your account dashboard you can view your <Link to="/account-orders" className="text-underline">recent orders</Link>, manage your <Link to="/account-address" className="text-underline">shipping and billing addresses</Link>, and
                                        <Link to="/account-profile" className="text-underline">edit your password and account details</Link>.
                                    </p>
                                </div>
                                <div className="row g-4">
                                    <div className="col-md-4">
                                        <div className="total-contain">
                                            <div className="total-detail">
                                                <span className="text">Total Orders</span>
                                                <h2 className="title">{loading ? '—' : totalOrders}</h2>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="total-contain">
                                            <div className="total-detail">
                                                <span className="text">Pending Orders</span>
                                                <h2 className="title">{loading ? '—' : pendingOrders}</h2>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="total-contain">
                                            <div className="total-detail">
                                                <span className="text">Total Spent</span>
                                                <h2 className="title">{loading ? '—' : formatPrice(totalSpent)}</h2>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="card px-3 pt-3 pb-2 mb-2">
                                            <h6>Recent Orders</h6>
                                            {loading ? (
                                                <p className="text-muted mb-0">Loading…</p>
                                            ) : orders.length === 0 ? (
                                                <p className="text-muted mb-0">You haven't placed any orders yet. <Link to="/shop">Start shopping</Link>.</p>
                                            ) : (
                                                <ul className="list-unstyled mb-0">
                                                    {orders.slice(0, 5).map(order => (
                                                        <li key={order._id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                                                            <Link to={`/account-order-details/${order._id}`}>#{order.orderNumber}</Link>
                                                            <span className="text-capitalize">{STATUS_LABEL[order.status] || order.status}</span>
                                                            <span>{formatPrice(order.total)}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}