import {Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination } from "swiper/modules";
import IMAGES from "../../constant/theme";

interface SliderDatatype{
    image: string;
}
const SliderData : SliderDatatype[] = [
    {image : IMAGES.Portfolio9Pic1},
    {image : IMAGES.Portfolio9Pic2},
    {image : IMAGES.Portfolio9Pic1},
    {image : IMAGES.Portfolio9Pic3},
];
export default function ShopProductSlider(){
    return(
        <Swiper className="portfolio-gallery3"
            slidesPerView = {3}
            spaceBetween = {30}
            loop = {true}                        
            pagination= {{
                el: ".swiper-pagination-two",
                clickable : true
            }}
            navigation ={{
                nextEl: ".portfolio-button-next",
                prevEl: ".portfolio-button-prev",
            }}
            modules={[Navigation, Pagination]}
            breakpoints= {{
                1200: {
                    slidesPerView: 3,
                },
                768: {
                    slidesPerView: 2,
                },
                600: {
                    slidesPerView: 2,
                    spaceBetween: 15,
                },
                300: {
                    slidesPerView: 1,
                    spaceBetween: 15,
                },
            }}
        > 
            {SliderData.map((elem, ind)=>(
                <SwiperSlide key={ind}>
                    <div className="portfolio-box style-1">
                        <div className="dz-media">
                            <img src={elem.image} alt="/" />
                        </div>
                    </div>
                </SwiperSlide>
            ))}   
        </Swiper>
    )
}