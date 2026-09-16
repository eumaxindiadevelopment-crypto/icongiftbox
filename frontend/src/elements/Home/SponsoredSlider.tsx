import { useState, useEffect } from "react";
import {Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { SponsoredSliderData } from "../../constant/Alldata";
import api from "../../lib/api";

const DEFAULT_HEADER = { sectionTitle: 'Brand', seeAllLink: '/shop-list', autoplay: true, autoplayDelay: 3000 };

const SponsoredSlider = () => {
    const [slides, setSlides] = useState<any[]>(SponsoredSliderData)
    const [header, setHeader] = useState(DEFAULT_HEADER)

    useEffect(() => {
        api.get('/sponsored').then(({ data }) => {
            if (data?.slides?.length > 0) setSlides(data.slides)
            setHeader({
                sectionTitle: data?.sectionTitle || DEFAULT_HEADER.sectionTitle,
                seeAllLink: data?.seeAllLink || DEFAULT_HEADER.seeAllLink,
                autoplay: data?.autoplay ?? DEFAULT_HEADER.autoplay,
                autoplayDelay: data?.autoplayDelay || DEFAULT_HEADER.autoplayDelay,
            })
        }).catch(() => {})
    }, [])

    return (
        <>
            <div className="section-head style-1 wow fadeInUp d-flex justify-content-between align-items-center" data-wow-delay="0.2s">
                <div className="left-content">
                    <h2 className="title">{header.sectionTitle}</h2>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <div className="brand-button-prev btn-prev">
                        <i className="icon feather icon-chevron-left" />
                    </div>
                    <div className="brand-button-next btn-next">
                        <i className="icon feather icon-chevron-right" />
                    </div>
                </div>
            </div>
            <Swiper
                slidesPerView = {4}
                spaceBetween = {30}
                loop = {true}
                navigation = {{
                    nextEl: '.brand-button-next',
                    prevEl: '.brand-button-prev',
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
                                <img src={item.logoImage || item.image2 || item.image} alt={item.title || 'Brand'} className="logo" />
                                {(item.showStoreBadge || item.store === 'store') && <span className="sale-badge">in Store</span>}
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </>
    );
};

export default SponsoredSlider;
