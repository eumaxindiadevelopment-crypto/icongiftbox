import { useState, useEffect } from "react";
import { Autoplay } from "swiper/modules";
import {Swiper, SwiperSlide } from "swiper/react";
import IMAGES from "../../constant/theme";
import { Link } from "react-router-dom";
import api from "../../lib/api";

const staticSlides = [
    { backgroundImage: IMAGES.ClothesPng1, offerText: '20% Off', headingStyle: 'product-name', heading: 'Luxury Bras', spanText: '', btnText: 'Collect Now', btnLink: '/shop-list' },
    { backgroundImage: IMAGES.ClothesPng2, offerText: 'Sale Up to 50% Off', headingStyle: 'sub-title1', heading: 'Summer', spanText: '2024', btnText: 'Collect Now', btnLink: '/shop-list' },
    { backgroundImage: IMAGES.ClothesPng3, offerText: '20% Off', headingStyle: 'sub-title2', heading: 'Swimwear', spanText: 'Sale', btnText: 'Collect Now', btnLink: '/shop-list' },
]

const OffersectionSlider = () => {
    const [slides, setSlides] = useState<any[]>(staticSlides)

    useEffect(() => {
        api.get('/offer-section').then(({ data }) => {
            if (data?.slides?.length > 0) setSlides(data.slides)
        }).catch(() => {})
    }, [])

    return (
        <Swiper
            speed = {1000}
            loop = {true}
            parallax = {true}
            slidesPerView = {3}
            spaceBetween = {15}
            autoplay={{ delay: 2500 }}
            breakpoints = {{
                1400: { slidesPerView: 3 },
                1024: { slidesPerView: 2 },
                991:  { slidesPerView: 2 },
                767:  { slidesPerView: 1.5 },
                600:  { slidesPerView: 1 },
                575:  { slidesPerView: 1 },
                340:  { slidesPerView: 1, centeredSlides: true },
            }}
            modules={[Autoplay]}
            className="swiper-product"
        >
            {slides.map((slide, i) => (
                <SwiperSlide key={i}>
                    <div className="product-box style-2 wow fadeInUp">
                        <div className="product-media" style={{ backgroundImage: `url(${slide.backgroundImage})` }}></div>
                        <div className="product-content">
                            <div className="main-content">
                                <span className="offer">{slide.offerText}</span>
                                {slide.headingStyle === 'product-name' && <h2 className="product-name">{slide.heading}</h2>}
                                {slide.headingStyle === 'sub-title1' && <h2 className="sub-title1">{slide.heading}<span className="year">{slide.spanText}</span></h2>}
                                {slide.headingStyle === 'sub-title2' && <h2 className="sub-title2">{slide.heading}<span className="bg-title">{slide.spanText}</span></h2>}
                                <Link to={slide.btnLink || '/shop-list'} className="btn btn-outline-secondary btn-rounded btn-lg">{slide.btnText || 'Collect Now'}</Link>
                            </div>
                        </div>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
};

export default OffersectionSlider;