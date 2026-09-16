import { Fragment } from "react/jsx-runtime";
import IMAGES from "../../constant/theme";
import Header from "../../components/Header";
import CommanSection from "./CommanSection";
import Footer from "../../components/Footer";
import { Link } from "react-router-dom";

export default function BannerSmall() {
    return (
        <Fragment>
            <div className="page-wraper">            
                <Header design="header-text-white header-transparent"/>
                <div className="page-content bg-light">
                    <div className="dz-bnr-inr bg-secondary overlay-black-light dz-bnr-inr-sm" style={{ backgroundImage: `url(${IMAGES.BackBg1})` }}>
                        <div className="container">
                            <div className="dz-bnr-inr-entry">
                                <h1>Banner Small</h1>
                                <nav aria-label="breadcrumb" className="breadcrumb-row">
                                    <ul className="breadcrumb">
                                        <li className="breadcrumb-item"><Link to="/"> Home</Link></li>
                                        <li className="breadcrumb-item">Banner Small</li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                    <CommanSection />
                </div>
                <Footer />
            </div>
        </Fragment>
    )
}