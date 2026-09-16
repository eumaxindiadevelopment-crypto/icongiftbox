import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CommanBanner from "../../components/CommanBanner";
import IMAGES from "../../constant/theme";
import CommanSidebar from "../../elements/MyAccount/CommanSidebar";
import { fetchMyOrders, Order } from "../../lib/api";
import { useCurrency } from "../../context/CurrencyContext";

export default function AccountReturnRequest() {
    const { formatPrice } = useCurrency();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyOrders().then(setOrders).finally(() => setLoading(false));
    }, []);

    return (
        <div className="page-content bg-light">
            <CommanBanner image={IMAGES.BackBg1} mainText="Return Request" parentText="Home" currentText="Return Request" />
            <div className="content-inner-1">
                <div className="container">
                    <div className="row">
                        <CommanSidebar />
                        <section className="col-xl-9 account-wrapper">
                            <div className="row">
                                <div className="col-12 m-b30">
                                    <h3 className="mb-0">REQUEST A PRODUCT RETURN</h3>
                                    <p className="text-muted mt-2 mb-0">Select an order below and contact us to start a return. We don't have an automated returns tracker yet, so our team will process it manually.</p>
                                </div>
                                {loading ? (
                                    <p>Loading your orders…</p>
                                ) : orders.length === 0 ? (
                                    <p className="text-muted">You have no orders eligible for return.</p>
                                ) : (
                                    orders.map((order) => (
                                        <div className="col-lg-6 m-b30" key={order._id}>
                                            <div className="order-cancel-card">
                                                <div className="order-head">
                                                    <h6 className="mb-0">Order: <span className="text-primary">#{order.orderNumber}</span></h6>
                                                    <span className="text-capitalize">{order.status}</span>
                                                </div>
                                                <div className="order-cancel-box">
                                                    <div className="cancel-media">
                                                        <img src={IMAGES.ShopSmallPic1} alt="order" />
                                                    </div>
                                                    <div className="order-cancel-content">
                                                        <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                        <h5 className="title mb-0">{order.lineItems?.length ? `${order.lineItems.length} item(s)` : `Order #${order.orderNumber}`}</h5>
                                                        <h6 className="mb-0">{formatPrice(order.total)}</h6>
                                                    </div>
                                                </div>
                                                <Link to="/contact-us-1" className="btn-link text-underline text-primary mt-2 d-inline-block">Contact us about this order</Link>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
