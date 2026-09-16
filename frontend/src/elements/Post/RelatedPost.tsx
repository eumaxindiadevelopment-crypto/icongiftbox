import { Link } from "react-router-dom";
import IMAGES from "../../constant/theme";

export default function RelatedPost(){
    return(
        <>
            <h4 className="widget-title">Related Blogs</h4>
            <div className="row">
                <div className="col-lg-6 col-md-6 m-b30">
                    <div className="dz-card style-5">
                        <div className="dz-media">
                            <img src={IMAGES.BlogPost5Pic1} alt="/" />
                        </div>
                        <div className="dz-info">
                            <div className="dz-meta">
                                <ul>
                                    <li className="post-date">20 Jan 2025</li>
                                </ul>
                            </div>
                            <h4 className="dz-title">
                                <Link to="/blogs">Trendsetter Chronicles: Unveiling the Latest in Fashion</Link>
                            </h4>
                            <Link to="/blogs" className="font-14 read-btn">Read More 
                                <i className="icon feather icon-chevron-right"/>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="col-lg-6 col-md-6 m-b30">
                    <div className="dz-card style-5">
                        <div className="dz-media">
                            <img src={IMAGES.BlogPost5Pic2} alt="/" />
                        </div>
                        <div className="dz-info">
                            <div className="dz-meta">
                                <ul>
                                    <li className="post-date">31 Jan 2025</li>
                                </ul>
                            </div>
                            <h4 className="dz-title">
                                <Link to="/blogs">Runway Rundown: Decoding Fashion Week’s Best Looks</Link>
                            </h4>
                            <Link to="/blogs" className="font-14 read-btn">Read More 
                                <i className="icon feather icon-chevron-right"/>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

