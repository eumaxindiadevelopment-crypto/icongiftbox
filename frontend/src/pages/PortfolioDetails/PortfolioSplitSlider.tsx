import {Swiper, SwiperSlide } from "swiper/react"
import IMAGES from "../../constant/theme";
import { Mousewheel, Pagination, Parallax } from "swiper/modules";
import { Link } from "react-router-dom";

export default function PortfolioSplitSlider(){
    return(
        <div className="page-content bg-light">
            <div className="content-block">
                <div className="section-full overflow-hidden">
                    <div id="home-slider" className="split-area">
                        <div className="swiper-pagination-two style-1"></div>
                        <Swiper className="spilt-swiper-slider spilt-slider-wrapper"
                            direction= "vertical"
                            loop= {true}
                            slidesPerView = {1}
                            mousewheel= {true}                            
                            pagination= {{
                                el: ".swiper-pagination-two",
                                clickable : true
                            }}
                            grabCursor= {true}
                            parallax= {true}
                            speed= {1000}
                            effect= "slide"
                            // @ts-ignore
                            mousewheelControl= {1}
                            modules={[Pagination, Parallax, Mousewheel ]}
                        >                           
                            <SwiperSlide>
                                <div className="swiper-image swiper-bg portfolio-box style-2 rounded-0" data-swiper-parallax-y="35%" 
                                    style={{backgroundImage:`url('${IMAGES.Portfolio10Pic1}')`}}
                                >
                                    <div className="dz-content">
                                        <div className="product-tag">
                                            <Link to="/portfolio-details-1">
                                                <span className="badge badge-primary">Bottles</span>
                                            </Link>
                                        </div>
                                        <h4 className="title"><Link to="/portfolio-details-1"> Hydrate with Confidence using Sturdy Wooden Bottles</Link></h4>
                                    </div>
                                </div>
                                <div className="swiper-image">
                                    <div className="swiper-content">
                                        <div className="portfolio-box style-2 rounded-0">
                                            <div className="dz-media">
                                                <Link to="/portfolio-details-1">                                                        
                                                    <img src={IMAGES.Portfolio10Pic2} alt="/" />
                                                </Link>
                                            </div>
                                            <div className="dz-content">
                                                <div className="product-tag">
                                                    <Link to="/portfolio-details-1">
                                                        <span className="badge badge-primary">Bottles</span>
                                                    </Link>
                                                </div>
                                                <h4 className="title"><Link to="/portfolio-details-1"> Hydrate with Confidence using Sturdy Wooden Bottles</Link></h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="swiper-image">
                                    <div className="swiper-content">
                                        <div className="portfolio-box style-2 rounded-0">
                                            <div className="dz-media">
                                                <Link to="/portfolio-details-1">
                                                    <img src={IMAGES.Portfolio10Pic3} alt="/" />
                                                </Link>
                                            </div>
                                            <div className="dz-content">
                                                <div className="product-tag">
                                                    <Link to="/portfolio-details-1">
                                                        <span className="badge badge-primary">Paper Bags</span>
                                                    </Link>
                                                </div>
                                                <h4 className="title"><Link to="/portfolio-details-2">Simplify Your Life with Practical Paper Bag </Link></h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="swiper-image swiper-bg portfolio-box style-2 rounded-0" data-swiper-parallax-y="35%"  
                                    style={{backgroundImage:`url('${IMAGES.Portfolio10Pic4}')`}}>
                                    <div className="dz-content">
                                        <div className="product-tag">
                                            <Link to="/portfolio-details-1">
                                                <span className="badge badge-primary">Bottles</span>
                                            </Link>
                                        </div>
                                        <h4 className="title"><Link to="/portfolio-details-1">Simplify Your Life with Practical Paper Bag</Link></h4>
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="swiper-image swiper-bg portfolio-box style-2 rounded-0" data-swiper-parallax-y="20%" 
                                    style={{backgroundImage:`url('${IMAGES.Portfolio10Pic5}')`}}
                                >
                                    <div className="dz-content">
                                        <div className="product-tag">
                                            <Link to="/portfolio-details-1">
                                                <span className="badge badge-primary">Bottles</span>
                                            </Link>
                                        </div>
                                        <h4 className="title"><Link to="/portfolio-details-1">Simplify Your Life with Practical Paper Bag</Link></h4>
                                    </div>
                                </div>
                                <div className="swiper-image">
                                    <div className="swiper-content">
                                        <div className="portfolio-box style-2 rounded-0">
                                            <div className="dz-media">
                                                <Link to="/portfolio-details-1">                                                        
                                                    <img src={IMAGES.Portfolio10Pic6} alt="/" />
                                                </Link>
                                            </div>
                                            <div className="dz-content">
                                                <div className="product-tag">
                                                    <Link to="/portfolio-details-1">
                                                        <span className="badge badge-primary">Glass</span>
                                                    </Link>
                                                </div>
                                                <h4 className="title"><Link to="/portfolio-details-3">Unveiling the Aesthetic Blend of Wood and Glass</Link></h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="swiper-image">
                                    <div className="swiper-content">
                                        <div className="portfolio-box style-2 rounded-0">
                                            <div className="dz-media">
                                                <Link to="/portfolio-details-1">                                                        
                                                    <img src={IMAGES.Portfolio10Pic8} alt="/" />
                                                </Link>
                                            </div>
                                            <div className="dz-content">
                                                <div className="product-tag">
                                                    <Link to="/portfolio-details-1">
                                                        <span className="badge badge-primary">Bowls</span>
                                                    </Link>
                                                </div>
                                                <h4 className="title"><Link to="/portfolio-details-4">Uncovering the Beauty of Plant-Based Products</Link></h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="swiper-image swiper-bg portfolio-box style-2 rounded-0" data-swiper-parallax-y="35%"  
                                    style={{backgroundImage:`url('${IMAGES.Portfolio10Pic7}')`}}
                                >
                                    <div className="dz-content">
                                        <div className="product-tag">
                                            <Link to="/portfolio-details-1">
                                                <span className="badge badge-primary">Tumbler</span>
                                            </Link>
                                        </div>
                                        <h4 className="title"><Link to="/portfolio-details-4">Uncovering the Beauty of Plant-Based Products</Link></h4>
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="swiper-image swiper-bg portfolio-box style-2 rounded-0" data-swiper-parallax-y="20%" 
                                    style={{backgroundImage:`url('${IMAGES.Portfolio10Pic9}')`}}
                                >
                                    <div className="dz-content">
                                        <div className="product-tag">
                                            <Link to="/portfolio-details-1">
                                                <span className="badge badge-primary">Tumbler</span>
                                            </Link>
                                        </div>
                                        <h4 className="title"><Link to="/portfolio-details-4">Uncovering the Beauty of Plant-Based Products</Link></h4>
                                    </div>
                                </div>
                                <div className="swiper-image">
                                    <div className="swiper-content">
                                        <div className="portfolio-box style-2 rounded-0">
                                            <div className="dz-media">
                                                <Link to="/portfolio-details-1">                                                        
                                                    <img src={IMAGES.Portfolio10Pic11} alt="/" />
                                                </Link>
                                            </div>
                                            <div className="dz-content">
                                                <div className="product-tag">
                                                    <Link to="/portfolio-details-1">
                                                        <span className="badge badge-primary">Bottal</span>
                                                    </Link>
                                                </div>
                                                <h4 className="title"><Link to="/portfolio-details-5">Go Green with the Best Reusable Metal Bottles</Link></h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>                            
                        </Swiper>
                    </div>
                </div>
            </div>
        </div>
    )
}