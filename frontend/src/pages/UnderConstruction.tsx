import { Link } from "react-router-dom";
import IMAGES from "../constant/theme";
import SocialIcon from "../elements/SocialIcon";

function UnderConstruction(){
    return(
        <section className="px-3 overflow-hidden bg-light">
            <div className="row under-construct">
                <div className="col-xxl-6 col-xl-5 col-lg-6 construct-box-1 single-page">
                    <img src={IMAGES.CircleLine1} className="bg-img" alt="circle"/>
                    <div className="logo">
                        <Link to="/"><img src={IMAGES.logo} alt="logo" /></Link>
                    </div>	
                    <div className="dz-content">
                        <div className="dz-media-title"><img src={IMAGES.VlcPng} alt=""/>Oops!</div>
                        <h2 className="dz-title">Our website in Under Construction</h2>
                        <form className="dzSubscribe">
                            <div className="dzSubscribeMsg"></div>
                            <div className="ft-row m-b15 d-flex align-items-center">
                                <input name="dzEmail" required type="email" placeholder="Your Email Address" className="form-control bg-light" />
                                <button name="submit" value="Submit" type="submit" className="btn btn-secondary">Subscribe</button>
                            </div>
                        </form>
                        <div className="dz-social-icon style-2">                           
                            <SocialIcon />
                        </div>
                    </div>
                </div>
                <div className="col-xxl-6 col-xl-7 col-lg-6 construct-box-2 px-xl-0 d-lg-block d-none">
                    <div className="construct-media">
                        <img src={IMAGES.RegistrationPng} alt="reg"/>
                    </div>
                    <div className="banner-social-media style-1">
                        <ul>
                            <li>
                                <Link target="_blank" to="https://www.instagram.com/dexignzone/">Instagram</Link>
                            </li>
                            <li>
                                <Link target="_blank" to="https://www.facebook.com/dexignzone">Facebook</Link>
                            </li>
                            <li>
                                <Link target="_blank" to="https://twitter.com/dexignzones">twitter</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    )
}
export default UnderConstruction;