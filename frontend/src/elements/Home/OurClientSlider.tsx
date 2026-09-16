import { useState, useEffect } from "react";
import {Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import api from "../../lib/api";

const DEFAULT_HEADER = { sectionTitle: 'Our Client', autoplay: true, autoplayDelay: 3000 };

const OurClientSlider = () => {
    const [slides, setSlides] = useState<any[]>([])
    const [header, setHeader] = useState(DEFAULT_HEADER)

    useEffect(() => {
        api.get('/our-client').then(({ data }) => {
            if (data?.slides?.length > 0) setSlides(data.slides)
            setHeader({
                sectionTitle: data?.sectionTitle || DEFAULT_HEADER.sectionTitle,
                autoplay: data?.autoplay ?? DEFAULT_HEADER.autoplay,
                autoplayDelay: data?.autoplayDelay || DEFAULT_HEADER.autoplayDelay,
            })
        }).catch(() => {})
    }, [])

    if (slides.length === 0) return null

    return (
        <>
            <div className="section-head style-1 wow fadeInUp d-flex justify-content-between align-items-center" data-wow-delay="0.2s">
                <div className="left-content">
                    <h2 className="title">{header.sectionTitle}</h2>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <div className="client-button-prev btn-prev">
                        <i className="icon feather icon-chevron-left" />
                    </div>
                    <div className="client-button-next btn-next">
                        <i className="icon feather icon-chevron-right" />
                    </div>
                </div>
            </div>
            <Swiper
                slidesPerView = {4}
                spaceBetween = {30}
                loop = {true}
                navigation = {{
                    nextEl: '.client-button-next',
                    prevEl: '.client-button-prev',
                }}
                autoplay={header.autoplay ? { delay: header.autoplayDelay, disableOnInteraction: false } : false}
                modules={[Navigation, Autoplay]}
                breakpoints= {{
                    1200: { slidesPerView: 4 },
                    991:  { slidesPerView: 3 },
                    767:  { slidesPerView: 2 },
                    575:  { slidesPerView: 1.5 },
                    340:  { slidesPerView: 1, centeredSlides: true },
                }}
                className="swiper swiper-company"
            >
                {slides.map((item, i) => (
                    <SwiperSlide key={i}>
                        <div className="company-box style-1 logo-only">
                            <div className="dz-media">
                                <img src={item.logoImage} alt={item.title || 'Client'} className="logo" />
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </>
    );
};

export default OurClientSlider;
