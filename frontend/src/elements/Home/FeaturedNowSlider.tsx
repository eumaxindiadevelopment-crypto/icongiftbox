import { useState, useEffect } from "react";
import { Autoplay } from "swiper/modules";
import {Swiper, SwiperSlide } from "swiper/react";
import { FeaturedNowSliderData } from "../../constant/Alldata";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import { useCurrency } from "../../context/CurrencyContext";

const FeaturedNowSlider = () => {
    const { formatPrice } = useCurrency();
    const [items, setItems] = useState<any[]>(FeaturedNowSliderData)

    useEffect(() => {
        api.get('/featured-now').then(({ data }) => {
            if (data?.sliderItems?.length > 0) setItems(data.sliderItems)
        }).catch(() => {})
    }, [])

    return (
        <Swiper
            speed = {1000}
            loop = {true}
            parallax = {true}
            slidesPerView = {3}
            spaceBetween = {30}
            watchSlidesProgress={true}
            autoplay = {{ delay: 2500 }}
            modules={[Autoplay]}
            breakpoints={{
                1400: { slidesPerView: 3 },
                1024: { slidesPerView: 2 },
                991:  { slidesPerView: 2 },
                767:  { slidesPerView: 1.5 },
                600:  { slidesPerView: 1 },
                575:  { slidesPerView: 1 },
                340:  { slidesPerView: 1, centeredSlides: true },
            }}
            className="swiper swiper-product2 swiper-visible"
        >
            {items.map((item, ind)=>(
                <SwiperSlide key={ind}>
                    <div className="shop-card style-4">
                        <div className="dz-media">
                            <img src={item.image} alt="image" />
                        </div>
                        <div className="dz-content">
                            <div>
                                <h6 className="title"><Link to={item.link || '/shop-list'}>{item.name}</Link></h6>
                                <span className="sale-title">{item.saleTitle || 'Up to 40% Off'}</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <h6 className="price">{formatPrice(item.price || 80)}<del>{formatPrice(item.originalPrice || 95)}</del></h6>
                                <span className="review"><i className="fa-solid fa-star" />{item.review || '(2k Review)'}</span>
                            </div>
                        </div>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
};

export default FeaturedNowSlider;