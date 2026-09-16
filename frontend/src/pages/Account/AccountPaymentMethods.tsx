import { useEffect, useState } from "react";
import CommanBanner from "../../components/CommanBanner";
import IMAGES from "../../constant/theme";
import CommanSidebar from "../../elements/MyAccount/CommanSidebar";
import { fetchMyOrders, Order } from "../../lib/api";

export default function AccountPaymentMethods() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyOrders().then(setOrders).finally(() => setLoading(false));
    }, []);

    const lastOrder = orders[0];

    return (
        <div className="page-content bg-light">
            <CommanBanner image={IMAGES.BackBg1} mainText="Payment Methods" parentText="Home" currentText="Payment Methods" />
            <div className="content-inner-1">
                <div className="container">
                    <div className="row">
                        <CommanSidebar />
                        <section className="col-xl-9 account-wrapper">
                            <div className="account-card">
                                <h4 className="title m-b15 text-capitalize">Payment Methods</h4>
                                <p className="mb-2">We currently accept:</p>
                                <ul className="mb-4">
                                    <li>Cash on Delivery</li>
                                    <li>Direct Bank Transfer</li>
                                </ul>
                                <p className="text-muted mb-0">We don't store saved cards or wallets — you choose a payment method at checkout each time.</p>
                            </div>

                            <div className="account-card mt-4">
                                <h5 className="mb-3">Your Most Recent Order</h5>
                                {loading ? (
                                    <p>Loading…</p>
                                ) : !lastOrder ? (
                                    <p className="text-muted mb-0">You haven't placed an order yet.</p>
                                ) : (
                                    <p className="mb-0">
                                        Order #{lastOrder.orderNumber} was paid via <strong>{lastOrder.paymentMethodTitle || lastOrder.paymentMethod}</strong> — status: <strong>{lastOrder.isPaid ? 'Paid' : 'Unpaid'}</strong>.
                                    </p>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
