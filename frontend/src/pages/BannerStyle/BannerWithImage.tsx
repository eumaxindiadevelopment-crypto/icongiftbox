import { Link } from "react-router-dom";
import IMAGES from "../../constant/theme";
import CommanSection from "./CommanSection";

export default function BannerWithImage(){
    return(
        <div className="page-content bg-light">		
            <div className="dz-bnr-inr" style={{backgroundImage:`url('${IMAGES.BgShape}')`}}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8">
                            <div className="dz-bnr-inr-entry text-start">
                                <h1>Banner With Image</h1>
                                <nav aria-label="breadcrumb" className="breadcrumb-row">
                                    <ul className="breadcrumb">
                                        <li className="breadcrumb-item"><Link to="/"> Home</Link></li>
                                        <li className="breadcrumb-item">Banner With Image</li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>	
                    <div className="banner-media">
                        <img src={IMAGES.BannerPic} alt="bnner" />
                    </div>
                </div>	
            </div>
            <CommanSection />
        </div>
    )
}