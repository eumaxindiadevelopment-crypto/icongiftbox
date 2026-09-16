import { Link, useSearchParams } from "react-router-dom";
import CommanBanner from "../../components/CommanBanner";
import IMAGES from "../../constant/theme";

export default function ShopOrderSuccess() {
    const [params] = useSearchParams();
    const orderNumber = params.get('order') || '';

    return (
        <div className="page-content bg-light">
            <CommanBanner parentText="Home" currentText="Order Confirmed" mainText="Order Confirmed" image={IMAGES.BackBg1} />
            <section className="content-inner shop-account">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-6 text-center py-5">
                            <i className="flaticon flaticon-check" style={{ fontSize: 64, color: '#28a745' }} />
                            <h3 className="mt-3">Thank you for your order!</h3>
                            {orderNumber && (
                                <p className="text-muted">Your order reference: <strong>#{orderNumber}</strong></p>
                            )}
                            <p className="text-muted">We have received your order and will process it shortly. You will be contacted on the phone/email you provided.</p>
                            <Link to="/shop" className="btn btn-secondary mt-3 me-2">Continue Shopping</Link>
                            <Link to="/account-orders" className="btn btn-outline-secondary mt-3">View Orders</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
