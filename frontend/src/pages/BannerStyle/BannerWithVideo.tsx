import { Link } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import IMAGES from "../../constant/theme";
import CommanSection from "./CommanSection";

export default function BannerWithVideo() {
    return (
        <div className="page-wraper">            
            <Header design="header-text-white header-transparent"/>
            <div className="page-content bg-light">
                <div className="dz-bnr-inr bg-secondary overlay-black-light">
                    <video autoPlay loop muted id="video-background">
                        <source src={IMAGES.BgVideoMp4} type="video/mp4" />
                    </video>
                    <div className="container">
                        <div className="dz-bnr-inr-entry">
                            <h1>Banner With Video</h1>
                            <nav aria-label="breadcrumb" className="breadcrumb-row">
                                <ul className="breadcrumb">
                                    <li className="breadcrumb-item"><Link to="/"> Home</Link></li>
                                    <li className="breadcrumb-item">Banner With Video</li>
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