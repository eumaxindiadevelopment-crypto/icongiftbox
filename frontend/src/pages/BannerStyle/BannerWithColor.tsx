import { Link } from "react-router-dom";
import CommanSection from "./CommanSection";

export default function BannerWithColor(){
    return(
        <div className="page-content bg-light">
            <div className="dz-bnr-inr bg-secondary">
                <div className="container">
                    <div className="dz-bnr-inr-entry ">
                        <h1>Banner With Bg-Color</h1>
                        <nav aria-label="breadcrumb" className="breadcrumb-row">
                            <ul className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"> Home</Link></li>
                                <li className="breadcrumb-item">Banner With Bg-Color</li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
            <CommanSection />
        </div> 
    )
}