import {Swiper, SwiperSlide } from "swiper/react"
import IMAGES from "../../constant/theme";
import { FreeMode, Thumbs } from "swiper/modules";
import { useState } from "react";

const GallerySliderData = [
    { image1 : IMAGES.PostLayoutPic1, image2: IMAGES.PostLayoutThumbPic1},
    { image1 : IMAGES.PostLayoutPic2, image2: IMAGES.PostLayoutThumbPic2},
    { image1 : IMAGES.PostLayoutPic3, image2: IMAGES.PostLayoutThumbPic3},
    { image1 : IMAGES.PostLayoutPic4, image2: IMAGES.PostLayoutThumbPic4},
];

export default function PostGallerySlider(){
        const [thumbsSwiper, setThumbsSwiper] = useState(null);
    
    return(
        <div className="galley-swiper-box">
            <Swiper className="galley-swiper"
                loop= {true}
                spaceBetween = {10}
                
                thumbs={{ swiper: thumbsSwiper }}
                modules={[Thumbs]} 
            >                
                {GallerySliderData.map((elem, ind)=>(
                    <SwiperSlide key={ind}>
                        <img src={elem.image1} className="w-100" />
                    </SwiperSlide>
                ))}                                
            </Swiper>
            <Swiper className="swiper galley-thumb-swiper mt-3 mb-5"
                loop = {false}
                spaceBetween = {10}
                slidesPerView = {4}
                freeMode = {true}
                watchSlidesProgress = {true}
                // @ts-ignore   
                onSwiper={setThumbsSwiper}
                modules={[FreeMode, Thumbs]}
            >   
                {GallerySliderData.map((elem, ind)=>(             
                    <SwiperSlide key={ind}>
                        <img src={elem.image2} />
                    </SwiperSlide>
                ))}                
            </Swiper>
        </div> 
    )
}