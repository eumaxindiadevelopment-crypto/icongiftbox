import { Swiper, SwiperSlide } from "swiper/react"
import IMAGES from "../../constant/theme"

interface SliderDataType{
    image: string;
}

const SliderData : SliderDataType[] = [
    {image : IMAGES.Portfolio2Pic1},
    {image : IMAGES.Portfolio2Pic2},
    {image : IMAGES.Portfolio2Pic3},
    {image : IMAGES.Portfolio2Pic4},
    {image : IMAGES.Portfolio2Pic2},
];

export default function Portfolio3Slider(){
    return(
        <Swiper className="portfolio-detail3"
            slidesPerView= {4}
            spaceBetween= {30}
            loop= {true}
            autoplay = {{
                delay: 2500,
            }}
            breakpoints = {{
                1200: {
                    slidesPerView: 4,
                },
                768: {
                    slidesPerView: 3,
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
            {SliderData.map((elem, index)=>(
                <SwiperSlide key={index}>
                    <div className="portfolio-box style-2">
                        <div className="dz-media">
                            <img src={elem.image} alt="portfolio" />
                        </div>
                    </div>
                </SwiperSlide>
            ))}                            
        </Swiper>
    )
}
