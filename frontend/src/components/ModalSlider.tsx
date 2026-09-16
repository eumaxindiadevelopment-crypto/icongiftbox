import {Swiper, SwiperSlide } from "swiper/react";
import IMAGES from "../constant/theme";
import { FreeMode, Thumbs } from "swiper/modules";
import { useState } from "react";
import LightGallery from 'lightgallery/react';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import { Link } from "react-router-dom";

const defaultSliderData = [
    { image: IMAGES.productlady1 },
    { image: IMAGES.productlady2 },
    { image: IMAGES.productlady3 },
];

interface Props {
    images?: string[];
}

export default function ModalSlider({ images }: Props) {
    const [thumbsSwiper, setThumbsSwiper] = useState(null);

    const sliderData = images && images.length > 0
        ? images.map(src => ({ image: src }))
        : defaultSliderData;

    function hoverEffect(e: any) {
        const targetRect = e.target.getBoundingClientRect();
        const xValue = ((e.clientX - targetRect.left) / targetRect.width) * 50;
        const yValue = ((e.clientY - targetRect.top) / targetRect.height) * 50;
        e.target.setAttribute("style", `cursor: pointer; transition: 0.1s; transform: scale(1.5); transform-origin: ${xValue}% ${yValue}%`);
    }
    function removeHover(e: any) {
        e.target.setAttribute("style", `cursor: pointer; transition: 0.1s; transform: scale(1); transform-origin: 0% 0%`);
    }

    return (
        <>
            <LightGallery plugins={[lgThumbnail, lgZoom]} selector={'.DZoomImage'}>
                <Swiper className="quick-modal-swiper2"
                    spaceBetween={0}
                    updateOnWindowResize={true}
                    thumbs={{ swiper: thumbsSwiper }}
                    modules={[Thumbs]}
                >
                    {sliderData.map((item, ind) => (
                        <SwiperSlide id="lightgallery" key={ind}>
                            <div className="dz-media">
                                <Link className="mfp-link lg-item DZoomImage" to={item.image} data-src={item.image}>
                                    <i className="feather icon-maximize dz-maximize top-right z-1" />
                                    <img src={item.image} alt="" className="d-none" />
                                </Link>
                                <img src={item.image} alt=""
                                    onMouseEnter={hoverEffect}
                                    onMouseLeave={removeHover}
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </LightGallery>
            <Swiper className="quick-modal-swiper thumb-swiper-lg thumb-sm swiper-vertical"
                spaceBetween={15}
                slidesPerView={4}
                freeMode={true}
                watchSlidesProgress={true}
                // @ts-ignore
                onSwiper={setThumbsSwiper}
                modules={[FreeMode, Thumbs]}
            >
                {sliderData.map((item, ind) => (
                    <SwiperSlide key={ind}>
                        <img src={item.image} alt={`thumb${ind + 1}`} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </>
    );
}
