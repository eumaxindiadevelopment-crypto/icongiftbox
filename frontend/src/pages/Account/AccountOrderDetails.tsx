import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Nav, Tab } from 'react-bootstrap'
import CommanBanner from "../../components/CommanBanner";
import IMAGES from "../../constant/theme";
import CommanSidebar from "../../elements/MyAccount/CommanSidebar";
import { fetchMyOrder, Order } from "../../lib/api";
import { useCurrency } from "../../context/CurrencyContext";

const STATUS_LABEL: Record<string, string> = {
    pending: "Pending",
    processing: "Processing",
    "on-hold": "On Hold",
    completed: "Completed",
    cancelled: "Cancelled",
    refunded: "Refunded",
};

function formatDateTime(value?: string) {
    if (!value) return '—';
    return new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function addressLine(a: Order['billingAddress']) {
    if (!a) return 'No address on file';
    return `${a.address1 || ''}${a.city ? `, ${a.city}` : ''}${a.state ? `, ${a.state}` : ''}${a.postcode ? ` ${a.postcode}` : ''}, ${a.country || 'India'}`;
}

export default function AccountOrderDetails() {
    const { id } = useParams<{ id?: string }>();
    const { formatPrice } = useCurrency();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(!!id);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        fetchMyOrder(id)
            .then(setOrder)
            .catch(() => setError('Order not found.'))
            .finally(() => setLoading(false));
    }, [id]);

    return (
        <div className="page-content bg-light">
            <CommanBanner image={IMAGES.BackBg1} mainText="Orders" parentText="Home" currentText="Orders" />
            <div className="content-inner-1">
                <div className="container">
                    <div className="row">
                        <CommanSidebar />
                        <section className="col-xl-9 account-wrapper">
                            <div className="account-card order-details">
                                {!id ? (
                                    <div className="text-center py-4">
                                        <p className="mb-3">Select an order from <Link to="/account-orders">your order history</Link> to view its details.</p>
                                    </div>
                                ) : loading ? (
                                    <p className="text-center py-4">Loading order…</p>
                                ) : error || !order ? (
                                    <p className="text-center py-4 text-danger">{error || 'Order not found.'}</p>
                                ) : (
                                    <>
                                        <div className="order-head">
                                            <div className="head-thumb">
                                                <img src={IMAGES.ShopSmallPic1} alt="order" />
                                            </div>
                                            <div className="clearfix m-l20">
                                                <div className="badge">{STATUS_LABEL[order.status] || order.status}</div>
                                                <h4 className="mb-0">Order #{order.orderNumber}</h4>
                                            </div>
                                        </div>
                                        <div className="row mb-sm-4 mb-2">
                                            <div className="col-sm-6">
                                                <div className="shiping-tracker-detail">
                                                    <span>Items</span>
                                                    <h6 className="title">{order.lineItems.length} item{order.lineItems.length === 1 ? '' : 's'}</h6>
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="shiping-tracker-detail">
                                                    <span>Payment Method</span>
                                                    <h6 className="title">{order.paymentMethodTitle || order.paymentMethod || '—'}</h6>
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="shiping-tracker-detail">
                                                    <span>Order Placed</span>
                                                    <h6 className="title">{formatDateTime(order.createdAt)}</h6>
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="shiping-tracker-detail">
                                                    <span>Shipping Address</span>
                                                    <h6 className="title">{addressLine(order.shippingAddress || order.billingAddress)}</h6>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="content-btn m-b15">
                                            <button type="button" onClick={() => window.print()} className="btn btn-secondary me-xl-3 me-2 m-b15 btnhover20">Print</button>
                                            <Link to="/account-cancellation-requests" className="btn btn-outline-danger m-b15 btnhover20">Cancel Order</Link>
                                        </div>
                                        <div className="clearfix">
                                            <Tab.Container defaultActiveKey={'history'}>
                                                <div className="dz-tabs style-3">
                                                    <Nav className="nav nav-tabs" id="nav-tab" role="tablist">
                                                        <Nav.Link className="nav-link" eventKey={"history"}>Order Notes</Nav.Link>
                                                        <Nav.Link className="nav-link" eventKey={"details"}>Item Details</Nav.Link>
                                                        <Nav.Link className="nav-link" eventKey={"Courier"}>Billing Address</Nav.Link>
                                                        <Nav.Link className="nav-link" eventKey={"receiver"}>Summary</Nav.Link>
                                                    </Nav>
                                                </div>
                                                <Tab.Content className="tab-content" id="nav-tabContent">
                                                    <Tab.Pane eventKey={"history"}>
                                                        {order.orderNotes.length === 0 ? (
                                                            <p className="text-muted mb-0">No updates yet.</p>
                                                        ) : (
                                                            <div className="widget-timeline style-1">
                                                                <ul className="timeline">
                                                                    {order.orderNotes.map((n, i) => (
                                                                        <li key={i}>
                                                                            <div className="timeline-badge primary"></div>
                                                                            <div className="timeline-box">
                                                                                <div className="timeline-panel">
                                                                                    <h6 className="mb-0">{n.author || 'Store'}</h6>
                                                                                    <span>{formatDateTime(n.dateCreated)}</span>
                                                                                </div>
                                                                                <p>{n.note}</p>
                                                                            </div>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </Tab.Pane>
                                                    <Tab.Pane eventKey={"details"}>
                                                        <h5>Item Details</h5>
                                                        {order.lineItems.map((item) => (
                                                            <div className="tracking-item" key={item._id}>
                                                                <div className="tracking-product-content">
                                                                    <h6 className="title">{item.name}</h6>
                                                                    <small className="d-block"><strong>Price</strong> : {formatPrice(item.price)}</small>
                                                                    <small className="d-block"><strong>Qty</strong> : {item.quantity}</small>
                                                                </div>
                                                                <div className="tracking-item-content">
                                                                    <span>Total</span>
                                                                    <h6>{formatPrice(item.total)}</h6>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <div className="tracking-item-content border-top border-light pt-2 mt-2">
                                                            <span>Subtotal</span>
                                                            <h6>{formatPrice(order.subtotal)}</h6>
                                                        </div>
                                                        {order.discountTotal > 0 && (
                                                            <div className="tracking-item-content">
                                                                <span className="text-success">Discount</span>
                                                                <h6>- {formatPrice(order.discountTotal)}</h6>
                                                            </div>
                                                        )}
                                                        {order.tax > 0 && (
                                                            <div className="tracking-item-content">
                                                                <span>Tax</span>
                                                                <h6>{formatPrice(order.tax)}</h6>
                                                            </div>
                                                        )}
                                                        <div className="tracking-item-content border-bottom border-light mb-2">
                                                            <span>Shipping</span>
                                                            <h6>{formatPrice(order.shippingTotal)}</h6>
                                                        </div>
                                                        <div className="tracking-item-content">
                                                            <span>Order Total</span>
                                                            <h6>{formatPrice(order.total)}</h6>
                                                        </div>
                                                    </Tab.Pane>
                                                    <Tab.Pane eventKey={"Courier"}>
                                                        {order.billingAddress ? (
                                                            <address className="not-italic">
                                                                <p className="mb-1"><strong>{order.billingAddress.firstName} {order.billingAddress.lastName}</strong></p>
                                                                {order.billingAddress.company && <p className="mb-1">{order.billingAddress.company}</p>}
                                                                <p className="mb-1">{order.billingAddress.address1}</p>
                                                                {order.billingAddress.address2 && <p className="mb-1">{order.billingAddress.address2}</p>}
                                                                <p className="mb-1">{order.billingAddress.city}{order.billingAddress.state ? `, ${order.billingAddress.state}` : ''} {order.billingAddress.postcode}</p>
                                                                <p className="mb-1">{order.billingAddress.country || 'India'}</p>
                                                                {order.billingAddress.email && <p className="mb-1">{order.billingAddress.email}</p>}
                                                                {order.billingAddress.phone && <p className="mb-0">{order.billingAddress.phone}</p>}
                                                            </address>
                                                        ) : (
                                                            <p className="text-muted mb-0">No billing address on file.</p>
                                                        )}
                                                    </Tab.Pane>
                                                    <Tab.Pane eventKey={"receiver"}>
                                                        <h5 className="text-success mb-4">Thank you, your order has been received</h5>
                                                        <ul className="tracking-receiver">
                                                            <li>Order Number : <strong>#{order.orderNumber}</strong></li>
                                                            <li>Date : <strong>{formatDateTime(order.createdAt)}</strong></li>
                                                            <li>Total : <strong>{formatPrice(order.total)}</strong></li>
                                                            <li>Payment Method : <strong>{order.paymentMethodTitle || order.paymentMethod || '—'}</strong></li>
                                                            <li>Payment Status : <strong>{order.isPaid ? 'Paid' : 'Unpaid'}</strong></li>
                                                        </ul>
                                                    </Tab.Pane>
                                                </Tab.Content>
                                            </Tab.Container>
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
