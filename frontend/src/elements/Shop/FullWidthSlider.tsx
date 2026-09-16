import {Swiper, SwiperSlide } from "swiper/react"
import { Thumbs } from "swiper/modules";
import { useState } from "react";
import IMAGES from "../../constant/theme";

export default function FullWidthSlider(){
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    return(
        <>
            <Swiper className="product-gallery-swiper2" 
                spaceBetween= {0}
                updateOnWindowResize = {true}
                navigation = {{
                    nextEl: ".gallery-button-next",
                    prevEl: ".gallery-button-prev",
                }}
                thumbs={{ swiper: thumbsSwiper }}
                modules={[Thumbs]} 
            >                
                <SwiperSlide>
                    <img src={IMAGES.Productdetail4png1} alt="product" />
                </SwiperSlide>
                <SwiperSlide>
                    <img src={IMAGES.Productdetail4png2} alt="product" />
                </SwiperSlide>
                <SwiperSlide>
                    <img src={IMAGES.Productdetail4png3} alt="product" />
                </SwiperSlide>               
            </Swiper>
            <Swiper className="product-gallery-swiper thumb-swiper-lg swiper-vertical"
                spaceBetween = {10}
				slidesPerView = {2}				
				pagination = {{
					el: ".swiper-pagination-trading",
				}}
                 // @ts-ignore
                onSwiper={setThumbsSwiper}
                modules={[Thumbs]}
            >
                <SwiperSlide>
                    <img src={IMAGES.ProductdetailThumbpng1} alt="product" />
                </SwiperSlide>
                <SwiperSlide>
                    <img src={IMAGES.ProductdetailThumbpng2} alt="product" />
                </SwiperSlide>
                <SwiperSlide>
                    <img src={IMAGES.ProductdetailThumbpng3} alt="product" />
                </SwiperSlide>                
            </Swiper>
        </>
    )
}