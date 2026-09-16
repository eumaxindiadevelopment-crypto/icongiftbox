import { Link } from "react-router-dom";
import IMAGES from "../../constant/theme";
import SocialIcon from "../../elements/SocialIcon";

export default function ErrorPage2(){
    return(
        <div className="page-content">
            <section className="overflow-hidden">
                <div className="row error-page style-2">
                    <div className="col-lg-6 col-md-6 error-start-content">
                        <div className="logo">
                            <Link to={"/"}><img src={IMAGES.LogoWhite} alt="logo" /></Link>
                        </div>
                        <div className="dz_error">404</div>
                        <div className="dz-social-icon style-2 white">
                            <SocialIcon />
                        </div>
                        <img src={IMAGES.CircleLine3} className="bg-img" alt="circle" />
                    </div>
                    <div className="col-lg-6 col-md-6 error-end-content">
                        <div className="error-inner">
                            <h1 className="error-head">OOPS!</h1>
                            <p className="error-para">Oh, no! This page does not exist.</p>
                            <Link to={"/"} className="btn btn-secondary  text-uppercase">Go to Main Page</Link>
                        </div>
                        <img src={IMAGES.CircleLine4} className="bg-img2" alt="" />
                    </div>
                </div>
            </section>
        </div>
    )
}