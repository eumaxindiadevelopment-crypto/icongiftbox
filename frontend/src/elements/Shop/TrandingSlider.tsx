import { Autoplay, Navigation } from "swiper/modules";
import {Swiper, SwiperSlide } from "swiper/react";
import IMAGES from "../../constant/theme";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useCurrency } from "../../context/CurrencyContext";

interface trandingType {
    price: number;
    image: string;
    title: string;
}

const trandingSliderData : trandingType[] = [
    { price: 80, image: IMAGES.shopproduct1, title:'Cozy Knit Cardigan Sweater'},
    { price: 70, image: IMAGES.shopproduct2, title:'Sophisticated Swagger Suit'},
    { price: 65, image: IMAGES.shopproduct3, title:'Classic Denim Skinny Jeans'},
    { price: 85, image: IMAGES.shopproduct4, title:'Athletic Mesh Sports Leggings'},
    { price: 78, image: IMAGES.shopproduct2, title:'Cozy Knit Cardigan Sweater'},
    { price: 63, image: IMAGES.shopproduct3, title:'Sophisticated Swagger Suit'},
    { price: 75, image: IMAGES.shopproduct1, title:'Classic Denim Skinny Jeans'},
    { price: 74, image: IMAGES.shopproduct4, title:'Athletic Mesh Sports Leggings'},
];

interface QuickViewProduct {
    title: string;
    price: string;
    image: string;
}

interface modelType{
    showdetailModal? : ((product?: QuickViewProduct) => void) | undefined;
}

export default function TrandingSlider({showdetailModal} :  modelType) {
    const { addToCart } = useCart();
    const { formatPrice } = useCurrency();
    return (
        <Swiper
            slidesPerView={4}
            speed = {1000}
            loop = {true}
            parallax = {true}
            spaceBetween = {30}
            autoplay = {{
                delay: 2500,
            }}
            navigation ={{
                nextEl: ".tranding-button-next",
                prevEl: ".tranding-button-prev",
            }}
            modules={[Autoplay, Navigation]}
            breakpoints = {{
                1200: {
                    slidesPerView: 4,
                },
                1024: {
                    slidesPerView: 4,
                },
                991: {
                    slidesPerView: 3,
                },
                591: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                },
                340: {
                    slidesPerView: 1,
                    spaceBetween: 15,
                },
            }}
            className="swiper-four"
        >
            {trandingSliderData.map((elem, ind)=>(
                <SwiperSlide key={ind}>
                    <div className="shop-card wow fadeInUp" data-wow-delay="0.2s">
                        <div className="dz-media">
                            <img src={elem.image} alt="card" />
                            <div className="shop-meta">
                                <Link to="#" className="btn btn-secondary btn-md btn-rounded"
                                    onClick={() => showdetailModal?.({ title: elem.title, price: formatPrice(elem.price), image: elem.image })}>
                                    <i className="fa-solid fa-eye d-md-none d-block"/>
                                    <span className="d-md-block d-none">Quick View</span>
                                </Link>
                                <div className="btn btn-primary meta-icon dz-wishicon">
                                    <i className="icon feather icon-heart dz-heart"/>
                                    <i className="icon feather icon-heart-on dz-heart-fill"/>
                                </div>
                                <div className="btn btn-primary meta-icon dz-carticon"
                                    onClick={() => addToCart({
                                        id: elem.title,
                                        image: elem.image,
                                        title: elem.title,
                                        price: elem.price,
                                    })}>
                                    <i className="flaticon flaticon-basket"/>
                                    <i className="flaticon flaticon-basket-on dz-heart-fill"/>
                                </div>
                            </div>
                        </div>
                        <div className="dz-content">
                            <h5 className="title"><Link to="/shop-list">{elem.title}</Link></h5>
                            <h5 className="price">{formatPrice(elem.price)}</h5>
                        </div>
                        <div className="product-tag">
                            <span className="badge ">Get 20% Off</span>
                        </div>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    )
}
