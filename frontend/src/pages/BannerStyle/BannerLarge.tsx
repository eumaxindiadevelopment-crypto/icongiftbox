import { Link } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import CommanSection from "./CommanSection";
import IMAGES from "../../constant/theme";

export default function BannerLarge() {
    return (
        <div className="page-wraper">
            <Header design="header-text-white header-transparent" />
            <div className="page-content bg-light">
                <div className="dz-bnr-inr bg-secondary overlay-black-light dz-bnr-inr-lg" style={{ backgroundImage: `url('${IMAGES.BackBg1}')` }}>
                    <div className="container">
                        <div className="dz-bnr-inr-entry d-table-cell">
                            <h1>Banner Large</h1>
                            <nav aria-label="breadcrumb" className="breadcrumb-row">
                                <ul className="breadcrumb">
                                    <li className="breadcrumb-item"><Link to="/"> Home</Link></li>
                                    <li className="breadcrumb-item">Banner Large</li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
                <CommanSection />
            </div>
            <Footer />
        </div>

    )
}