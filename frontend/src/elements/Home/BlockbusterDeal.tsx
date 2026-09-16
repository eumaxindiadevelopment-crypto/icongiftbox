import { useState, useEffect } from "react";
import {Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { BlockbusterSliderData } from "../../constant/Alldata";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import { useCurrency } from "../../context/CurrencyContext";

const DEFAULT_HEADER = { sectionTitle: 'Blockbuster deals', seeAllText: 'See all deals', seeAllLink: '/shop-list' };

const BlockbusterDeal = () => {
    const { formatPrice } = useCurrency();
    const [items, setItems] = useState<any[]>(BlockbusterSliderData)
    const [header, setHeader] = useState(DEFAULT_HEADER)

    useEffect(() => {
        api.get('/blockbuster').then(({ data }) => {
            if (data?.sliderItems?.length > 0) setItems(data.sliderItems)
            setHeader({
                sectionTitle: data?.sectionTitle || DEFAULT_HEADER.sectionTitle,
                seeAllText: data?.seeAllText || DEFAULT_HEADER.seeAllText,
                seeAllLink: data?.seeAllLink || DEFAULT_HEADER.seeAllLink,
            })
        }).catch(() => {})
    }, [])

    return (
        <>
            <div className="section-head style-1 wow fadeInUp d-lg-flex justify-content-between" data-wow-delay="0.2s">
                <div className="left-content">
                    <h2 className="title">{header.sectionTitle}</h2>
                </div>
                <Link to={header.seeAllLink} className="text-secondary font-14 d-flex align-items-center gap-1">{header.seeAllText}
                    <i className="icon feather icon-chevron-right font-18" />
                </Link>
            </div>
            <Swiper
            speed = {1000}
            loop = {true}
            parallax = {true}
            slidesPerView = {4}
            spaceBetween = {30}
            watchSlidesProgress={true}
            autoplay ={{
                delay: 2500,
            }}
            modules={[Autoplay]}
            className="swiper-four swiper-visible"
            breakpoints = {{
                1200: { slidesPerView: 4 },
                1024: { slidesPerView: 4 },
                991:  { slidesPerView: 3 },
                591:  { slidesPerView: 2, spaceBetween: 20 },
                340:  { slidesPerView: 1, spaceBetween: 15 },
            }}
        >
            {items.map((item, i)=>(
                <SwiperSlide key={i}>
                    <div className="shop-card style-2">
                        <div className="dz-media">
                            <img src={item.image} alt="" />
                        </div>
                        <div className="dz-content">
                            <div>
                                <span className="sale-title">{item.saleTitle || 'up to 79% off'}</span>
                                <h5 className="title"><Link to={item.link || '/shop-list'}>{item.title}</Link></h5>
                            </div>
                            <h6 className="price">
                                {formatPrice(item.price || 80)}
                                <del>{formatPrice(item.originalPrice || 95)}</del>
                            </h6>
                        </div>
                    </div>
                </SwiperSlide>
            ))}
            </Swiper>
        </>
    );
};

export default BlockbusterDeal;