import { Link } from "react-router-dom";
import CommanBanner from "../../components/CommanBanner";
import IMAGES from "../../constant/theme";
import CommanSidebar from "../../elements/MyAccount/CommanSidebar";
import { useCurrency } from "../../context/CurrencyContext";

export default function AccountReturnRequestDetails() {
    const { formatPrice } = useCurrency();
    return (
        <div className="page-content bg-light">
            <CommanBanner image={IMAGES.BackBg1} mainText="Return Request Detail" parentText="Home" currentText="Return Request Detail" />
            <div className="content-inner-1">
                <div className="container">
                    <div className="row">
                        <CommanSidebar />
                        <section className="col-xl-9 account-wrapper">
                            <div className="row">
                                <div className="col-lg-6 m-b30">
                                    <div className="order-cancel-card">
                                        <div className="order-head">
                                            <h6 className="mb-0">Request No: <span className="text-primary">#1374837</span></h6>
                                        </div>
                                        <Link to="/account-return-request-detail" className="order-cancel-box">
                                            <div className="cancel-media">
                                                <img src={IMAGES.ShopSmallPic1} alt="small" />
                                            </div>
                                            <div className="order-cancel-content">
                                                <span>March 21, 2024</span>
                                                <h5 className="title mb-0">Collar Casual Shirt</h5>
                                                <p className="mb-2">Quantity: <strong className="text-black">1</strong></p>
                                                <h6 className="mb-0">{formatPrice(105)}</h6>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                                <div className="col-lg-6 m-b30">
                                    <div className="order-cancel-card">
                                        <div className="order-head">
                                            <h6 className="mb-0">Request No: <span className="text-primary">#1374837</span></h6>
                                        </div>
                                        <Link to="/account-return-request-detail" className="order-cancel-box">
                                            <div className="cancel-media">
                                                <img src={IMAGES.ShopSmallPic2} alt="small" />
                                            </div>
                                            <div className="order-cancel-content">
                                                <span>March 21, 2024</span>
                                                <h5 className="title mb-0">Collar Casual Shirt</h5>
                                                <p className="mb-2">Quantity: <strong className="text-black">1</strong></p>
                                                <h6 className="mb-0">{formatPrice(304)}</h6>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12 m-b30">
                                    <h4>What do you want to return?</h4>
                                    <div className="custom-control custom-checkbox mb-1">
                                        <input className="form-check-input radio" type="radio" name="flexRadioDefault" id="flexRadioDefault1" />
                                        <label className="form-check-label" htmlFor="flexRadioDefault1">Refund</label>
                                    </div>
                                    <div className="custom-control custom-checkbox mb-1">
                                        <input className="form-check-input radio" type="radio" name="flexRadioDefault" id="flexRadioDefault2" />
                                        <label className="form-check-label" htmlFor="flexRadioDefault2">Replacment</label>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="custom-control style-1">
                                        <input className="form-check-input radio" type="radio" name="Methods1" id="Methods7" />
                                        <label className="custom-checkbox form-check-label payment" htmlFor="Methods7">
                                            <span>
                                                <span className="title">Direct bank Transfer</span>
                                            </span>
                                        </label>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="custom-control style-1">
                                        <input className="form-check-input radio" type="radio" name="Methods1" id="Methods8" />
                                        <label className="custom-checkbox form-check-label payment" htmlFor="Methods8">
                                            <span>
                                                <span className="title">Gifte Card Wallet</span>
                                            </span>
                                        </label>
                                    </div>
                                </div>
                                <div className="col-md-6 m-t10">
                                    <Link to="/shop-wishlist" className="btn btn-secondary me-xl-3 me-2 btnhover20">Submit Request</Link>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
