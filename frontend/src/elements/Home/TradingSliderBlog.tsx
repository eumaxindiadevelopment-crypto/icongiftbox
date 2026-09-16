import { useState, useEffect } from "react";
import {Swiper, SwiperSlide } from "swiper/react";
import {motion} from 'framer-motion'
import { Link } from "react-router-dom";
import { SVGICON } from "../../constant/theme";
import { TradingSliderBlogdata } from "../../constant/Alldata";
import LatestNewsRollup from "./LatestNewsRollup";
import api from "../../lib/api";

const TradingSliderBlog = () => {
    const [slides, setSlides] = useState<any[]>(TradingSliderBlogdata)
    const [sectionTitle, setSectionTitle] = useState('Discover the most trending Post in Pixio.')
    const [shopLink, setShopLink] = useState('/shop')

    useEffect(() => {
        api.get('/trading').then(({ data }) => {
            if (data?.slides?.length > 0) setSlides(data.slides)
            if (data?.sectionTitle) setSectionTitle(data.sectionTitle)
            if (data?.shopLink) setShopLink(data.shopLink)
        }).catch(() => {})
    }, [])

    return (
        <>
        <div className="container">
            <div className="row justify-content-between align-items-center">
                <div className="col-lg-6 col-md-8 col-sm-12">
                    <div className="section-head style-2 m-0 wow fadeInUp" data-wow-delay="0.1s" >
                        <div className="left-content">
                            <h2 className="title">{sectionTitle}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-lg-6 col-md-4 col-sm-12 text-md-end m-b30 wow fadeInUp" data-wow-delay="0.2s" >
                    <Link className="icon-button d-md-inline-block d-none" to={shopLink}>
                        <div className="text-row word-rotate-box c-black">
                            <LatestNewsRollup />
                            <svg className="badge__emoji" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none"
                                dangerouslySetInnerHTML={{__html :  SVGICON.ArrowRightSvg}}
                            >
                            </svg>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
        <Swiper
            slidesPerView = {4.5}
            spaceBetween = {30}
            loop = {true}
            speed = {1000}
            breakpoints = {{
                1600: { slidesPerView: 4.5 },
                1400: { slidesPerView: 3.5 },
                1024: { slidesPerView: 2.5 },
                991:  { slidesPerView: 2 },
                767:  { slidesPerView: 1.5, spaceBetween: 15, centeredSlides: true },
                575:  { slidesPerView: 1.5, spaceBetween: 15, centeredSlides: true },
                300:  { slidesPerView: 1.2, spaceBetween: 15 },
            }}
            className="swiper swiper-blog-post"
        >
            {slides.map((item, ind) => (
                <SwiperSlide key={ind}>
                    <motion.div className="dz-card style-2"
                        animate={{ y: '50%' }}
                        whileInView={{ y: 0 }}
                        transition={{ duration: parseFloat(item.animDuration || item.time || 0.6) }}
                    >
                        <div className="dz-media">
                            <img src={item.image} alt="" />
                            <div className="post-date">{item.date}</div>
                        </div>
                        <div className="dz-info">
                            <h4 className="dz-title mb-0">
                                <Link to="/blogs">{item.name}</Link>
                            </h4>
                            <ul className="blog-social">
                                <li>
                                    <Link to={'#'} className="share-btn" dangerouslySetInnerHTML={{__html: SVGICON.ArrowUp15Degree}}></Link>
                                    <ul className="sub-team-social">
                                        <li><Link to="https://www.facebook.com/" target="_blank"><i className="fab fa-facebook-f" /></Link></li>
                                        <li><Link to="https://twitter.com/" target="_blank"><i className="fab fa-twitter" /></Link></li>
                                        <li><Link to="https://www.instagram.com/" target="_blank"><i className="fab fa-instagram" /></Link></li>
                                        <li><Link to="https://www.linkedin.com/" target="_blank"><i className="fa-brands fa-linkedin-in" /></Link></li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                    </motion.div>
                </SwiperSlide>
            ))}
        </Swiper>
        </>
    );
};

export default TradingSliderBlog;