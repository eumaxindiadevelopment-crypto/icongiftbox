import { Link } from "react-router-dom";
import {motion} from 'framer-motion'
import IMAGES from "../constant/theme";
import { FooterMenu, OurStores,
    UsefulLinks
}
from "../constant/Alldata";
// import SubscribeNewsletter from "./SubscribeNewsletter";

interface footertype{
    footerStyle? : string
}

const Footer = (props : footertype) => {
    let year = new Date().getFullYear();
    return (
        <footer className={`site-footer ${props.footerStyle || "style-1" }`}>
		{/* <!-- Footer Top --> */}
            <div className="footer-top">
                <div className="container">
                    <div className="row">
                        <motion.div className="col-xl-3 col-md-4 col-sm-6" 
                            animate={{y : '50%'}}
                            whileInView={{ y : 0}}
                            transition={{ duration: 0.8}}
                        >
                            <div className="widget widget_about me-2">
                                 <h5 className="footer-title">About Us</h5>
                                <div className="footer-logo logo-white">
                                    {/* <Link to={"/"}>
                                        {props.footerStyle === "footer-dark" ?                                        
                                            <img src={IMAGES.LogoWhite} alt="" />
                                            :
                                            <img src={IMAGES.logo} alt="" />
                                        }

                                    </Link>  */}

                                    <p>Create meaningful connections with thoughtfully curated corporate gifts.
From employee rewards to client appreciation, we offer quality gifting solutions.
Make every occasion memorable with gifts that leave a lasting impression.</p>
                                </div>
                                {/* <ul className="widget-address">
                                    <li>
                                        <p><span>Address</span> : 451 Wall Street, UK, London</p>
                                    </li>
                                    <li>
                                        <p><span>E-mail</span> : example@info.com</p>
                                    </li>
                                    <li>
                                        <p><span>Phone</span> : (064) 332-1233</p>
                                    </li>
                                </ul> */}
                                {/* <div className="subscribe_widget">
                                    <h6 className="title fw-medium text-capitalize">subscribe to our newsletter</h6>	
                                    <SubscribeNewsletter />
                                </div> */}
                            </div>
                        </motion.div>

                        {/* <motion.div className="col-xl-3 col-md-4 col-sm-6"
                            animate={{y : '50%'}}
                            whileInView={{ y : 0}}
                            transition={{ duration: 1.2}}
                        >
                            <div className="widget widget_post">
                                <h5 className="footer-title">Recent Posts</h5>
                                <ul>
                                    {WidgetData.map((item, ind)=>(
                                        <li key={ind}>
                                            <div className="dz-media"><img src={item.image} alt="" /></div>
                                            <div className="dz-content">
                                                <h6 className="name"><Link to="/blogs">{item.name}</Link></h6>
                                                <span className="time">Jan 23, 2025</span>
                                            </div>
                                        </li>
                                    ))}                                    
                                </ul>
                            </div>
                        </motion.div> */}

                        <motion.div className="col-xl-3 col-md-4 col-sm-4 col-6" 
                            animate={{y : '50%'}}
                            whileInView={{ y : 0}}
                            transition={{ duration: 1.3}}
                        >
                            <div className="widget widget_services">
                                <h5 className="footer-title">Our Gifting Collections</h5>
                                <ul>
                                    {OurStores.map((item,ind)=>(
                                        <li key={ind}><Link to={item.url}>{item.name}</Link></li>
                                    ))}                                    
                                </ul>   
                            </div>
                        </motion.div>

                        <motion.div className="col-xl-3 col-md-4 col-sm-4 col-6" 
                            animate={{y : '50%'}}
                            whileInView={{ y : 0}}
                            transition={{ duration: 1.4}}
                        >
                            <div className="widget widget_services">
                                <h5 className="footer-title">Useful Links</h5>
                                <ul>
                                    {UsefulLinks.map((item, i)=>(
                                        <li key={i}><Link to="#">{item.name}</Link></li>
                                    ))}                                    
                                </ul>
                            </div>
                        </motion.div>

                        <motion.div className="col-xl-3 col-md-4 col-sm-4"
                            animate={{y : '50%'}}
                            whileInView={{ y : 0}}
                            transition={{ duration: 1.5}}
                        >
                            <div className="widget widget_services">
                                <h5 className="footer-title">Customer Support</h5>
                                <ul>
                                    {FooterMenu.map((item,ind)=>(
                                        <li key={ind}><Link to={"#"}>{item.name}</Link></li>
                                    ))}                                    
                                </ul>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
            {/*  Footer Top End  */}
            
            {/*  Footer Bottom  */}
            <div className="footer-bottom">
                <div className="container">
                    <div className="row fb-inner">
                        <div className="col-lg-6 col-md-12 text-start"> 
                            <p className="copyright-text">© <span className="current-year">{year}</span> <a href="https://www.clicktots.com/">Clicktots Technologies</a> Theme. All Rights Reserved.</p>
                        </div>
                        <div className="col-lg-6 col-md-12 text-end"> 
                            <div className="d-flex align-items-center justify-content-center justify-content-md-center justify-content-xl-end">
                                <span className="me-3">We Accept: </span>
                                <img src={IMAGES.FooterImg} alt="" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*  Footer Bottom End  */}
        </footer>
    );
};

export default Footer;

