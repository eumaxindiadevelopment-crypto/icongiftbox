import CommanBanner from "../../components/CommanBanner";
import IMAGES from "../../constant/theme";
import CommanSidebar from "../../elements/MyAccount/CommanSidebar";

export default function AccountShippingMethods() {
    return (
        <div className="page-content bg-light">
            <CommanBanner image={IMAGES.BackBg1} mainText="Shipping Methods" parentText="Home" currentText="Shipping Methods" />
            <div className="content-inner-1">
                <div className="container">
                    <div className="row">
                        <CommanSidebar />
                        <section className="col-xl-9 account-wrapper">
                            <div className="account-card">
                                <h4 className="title m-b15 text-capitalize">Shipping Methods</h4>
                                <p className="mb-2">We currently offer a single standard delivery method across India:</p>
                                <div className="custom-control style-1 style-thumb mb-3">
                                    <label className="custom-checkbox form-check-label">
                                        <span>
                                            <span className="title">Standard Delivery</span>
                                            <span className="text d-block">Dispatched within 2–3 business days</span>
                                        </span>
                                        <span className="price">Free</span>
                                    </label>
                                </div>
                                <p className="text-muted mb-0">We don't offer courier/speed selection at checkout yet — every order ships via our standard delivery partner at no extra cost.</p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
