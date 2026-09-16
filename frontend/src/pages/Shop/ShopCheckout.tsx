import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Form from 'react-bootstrap/Form';
import CommanBanner from "../../components/CommanBanner";
import IMAGES from "../../constant/theme";
import { Accordion } from "react-bootstrap";
import { useCart } from "../../context/CartContext";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { useCurrency } from "../../context/CurrencyContext";
import api from "../../lib/api";

export default function ShopCheckout() {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { customer } = useCustomerAuth();
    const { formatPrice } = useCurrency();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cod');

    const [form, setForm] = useState({
        firstName: '', lastName: '', company: '',
        country: 'India', address1: '', address2: '',
        city: '', state: '', postcode: '', phone: '', email: '',
        notes: '',
    });

    useEffect(() => {
        if (!customer) return;
        setForm(prev => ({
            ...prev,
            firstName: prev.firstName || customer.firstName || '',
            lastName: prev.lastName || customer.lastName || '',
            email: prev.email || customer.email || '',
            phone: prev.phone || customer.phone || '',
        }));
    }, [customer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cartItems.length === 0) {
            setError('Your cart is empty.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/orders/guest', {
                billingAddress: {
                    firstName: form.firstName,
                    lastName: form.lastName,
                    company: form.company,
                    address1: form.address1,
                    address2: form.address2,
                    city: form.city,
                    state: form.state,
                    postcode: form.postcode,
                    country: form.country,
                    phone: form.phone,
                    email: form.email,
                },
                lineItems: cartItems.map(item => ({
                    title: item.title,
                    quantity: item.quantity,
                    price: item.price,
                })),
                notes: form.notes,
                paymentMethod,
                customerId: customer?.id,
            });
            clearCart();
            navigate(`/shop-order-success?order=${res.data.orderNumber}`);
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-content bg-light">
            <CommanBanner parentText="Home" mainText="Shop Checkout" currentText="Shop Checkout" image={IMAGES.BackBg1} />
            <div className="content-inner-1">
                <div className="container">
                    <form className="row shop-checkout" onSubmit={handlePlaceOrder}>
                        <div className="col-xl-8">
                            <h4 className="title m-b15">Billing details</h4>
                            <Accordion className="dz-accordion accordion-sm" id="accordionFaq">
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header>Returning customer? Click here to login<span className="toggle-close" /></Accordion.Header>
                                    <Accordion.Body><p className="m-b0">Already have an account? <Link to="/login">Login here</Link></p></Accordion.Body>
                                </Accordion.Item>
                                <Accordion.Item eventKey="1">
                                    <Accordion.Header>Have a coupon? Click here to enter your code<span className="toggle-close" /></Accordion.Header>
                                    <Accordion.Body><p className="m-b0">Coupon codes can be applied in the cart page.</p></Accordion.Body>
                                </Accordion.Item>
                            </Accordion>

                            <div className="row mt-4">
                                <div className="col-md-6">
                                    <div className="form-group m-b25">
                                        <label className="label-title">First Name *</label>
                                        <input name="firstName" required className="form-control" value={form.firstName} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group m-b25">
                                        <label className="label-title">Last Name *</label>
                                        <input name="lastName" required className="form-control" value={form.lastName} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group m-b25">
                                        <label className="label-title">Company name (optional)</label>
                                        <input name="company" className="form-control" value={form.company} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="m-b25">
                                        <label className="label-title">Country / Region *</label>
                                        <Form.Select name="country" value={form.country} onChange={handleChange}>
                                            <option value="India">India</option>
                                            <option value="UK">UK</option>
                                            <option value="USA">USA</option>
                                        </Form.Select>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group m-b25">
                                        <label className="label-title">Street address *</label>
                                        <input name="address1" required className="form-control m-b15" placeholder="House number and street name" value={form.address1} onChange={handleChange} />
                                        <input name="address2" className="form-control" placeholder="Apartment, suite, unit, etc. (optional)" value={form.address2} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group m-b25">
                                        <label className="label-title">Town / City *</label>
                                        <input name="city" required className="form-control" value={form.city} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group m-b25">
                                        <label className="label-title">State *</label>
                                        <input name="state" required className="form-control" value={form.state} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group m-b25">
                                        <label className="label-title">ZIP Code *</label>
                                        <input name="postcode" required className="form-control" value={form.postcode} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group m-b25">
                                        <label className="label-title">Phone *</label>
                                        <input name="phone" required type="tel" className="form-control" value={form.phone} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group m-b25">
                                        <label className="label-title">Email address *</label>
                                        <input name="email" required type="email" className="form-control" value={form.email} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="col-md-12 m-b25">
                                    <div className="form-group">
                                        <label className="label-title">Order notes (optional)</label>
                                        <textarea name="notes" placeholder="Notes about your order, e.g. special notes for delivery." className="form-control" cols={90} rows={5} value={form.notes} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-4 side-bar">
                            <h4 className="title m-b15">Your Order</h4>
                            <div className="order-detail sticky-top">
                                {cartItems.length === 0 ? (
                                    <div className="text-center py-3 text-muted">
                                        <p>Your cart is empty.</p>
                                        <Link to="/shop" className="btn btn-secondary btn-sm">Go Shopping</Link>
                                    </div>
                                ) : (
                                    <>
                                        {cartItems.map(item => (
                                            <div key={item.id} className="cart-item style-1">
                                                <div className="dz-media">
                                                    <img src={item.image} alt={item.title} />
                                                </div>
                                                <div className="dz-content">
                                                    <h6 className="title mb-0">{item.title}</h6>
                                                    <span className="price">{formatPrice(item.price)} × {item.quantity}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}

                                <table>
                                    <tbody>
                                        <tr className="subtotal">
                                            <td>Subtotal</td>
                                            <td className="price">{formatPrice(cartTotal)}</td>
                                        </tr>
                                        <tr className="title">
                                            <td><h6 className="title font-weight-500">Shipping</h6></td>
                                            <td></td>
                                        </tr>
                                        <tr className="shipping">
                                            <td>
                                                <div className="custom-control custom-checkbox">
                                                    <input className="form-check-input radio" type="radio" id="shipFree" readOnly checked />
                                                    <label className="form-check-label ms-1" htmlFor="shipFree">Free shipping</label>
                                                </div>
                                            </td>
                                            <td className="price">{formatPrice(0)}</td>
                                        </tr>
                                        <tr className="total">
                                            <td>Total</td>
                                            <td className="price">{formatPrice(cartTotal)}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div className="dz-accordion accordion-sm mb-3" id="accordionPayment">
                                    <div className="accordion-item">
                                        <div className="accordion-header">
                                            <div className="accordion-button custom-control border-0">
                                                <input className="form-check-input radio me-2" type="radio"
                                                    checked={paymentMethod === 'bank'}
                                                    onChange={() => setPaymentMethod('bank')}
                                                    id="payBank" />
                                                <label className="form-check-label" htmlFor="payBank">Direct bank transfer</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="accordion-item">
                                        <div className="accordion-header">
                                            <div className="accordion-button custom-control border-0">
                                                <input className="form-check-input radio me-2" type="radio"
                                                    checked={paymentMethod === 'cod'}
                                                    onChange={() => setPaymentMethod('cod')}
                                                    id="payCod" />
                                                <label className="form-check-label" htmlFor="payCod">Cash on delivery</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {error && <div className="alert alert-danger py-2 mb-3" style={{ fontSize: 13 }}>{error}</div>}

                                <p className="text">Your personal data will be used to process your order and support your experience throughout this website.</p>

                                <button type="submit" className="btn btn-secondary w-100" disabled={loading || cartItems.length === 0}>
                                    {loading ? 'Placing Order…' : 'PLACE ORDER'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
