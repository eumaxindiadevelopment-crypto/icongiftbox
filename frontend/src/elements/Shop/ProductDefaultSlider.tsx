import { Link } from "react-router-dom";
import IMAGES from "../../constant/theme";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import { useState } from "react";
import type { CSSProperties } from "react";
import LightGallery from 'lightgallery/react';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';

const DEMO_IMAGES = [IMAGES.productdetail2png1, IMAGES.productdetail2png2, IMAGES.productdetail2png3];

type Props = {
    images?: string[];
};

const THUMB_SIZE = 60;

const thumbBtnStyle = (active: boolean): CSSProperties => ({
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    padding: 0,
    border: active ? '2px solid var(--secondary, #d9a441)' : '1px solid #e5e5e5',
    borderRadius: 8,
    overflow: 'hidden',
    background: '#fff',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'border-color .15s ease, opacity .15s ease',
});

export default function ProductDefaultSlider({ images }: Props = {}){
    const [mainSwiper, setMainSwiper] = useState<SwiperInstance | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const slides = images && images.length > 0 ? images : DEMO_IMAGES;

    return(
        <div className="d-flex" style={{ gap: 12, width: '100%', alignItems: 'flex-start' }}>
            <style>{`
                .pdslider-thumb:hover { border-color: var(--secondary, #d9a441) !important; opacity: .85; }
            `}</style>
            <div
                className="d-flex flex-column"
                style={{
                    gap: 8,
                    maxHeight: 520,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    padding: 2,
                    width: THUMB_SIZE + 4,
                    flex: `0 0 ${THUMB_SIZE + 4}px`,
                }}
            >
                {slides.map((src, i) => (
                    <button
                        key={`photo-${i}`}
                        type="button"
                        title="View photo"
                        className="pdslider-thumb"
                        onClick={() => mainSwiper?.slideTo(i)}
                        style={thumbBtnStyle(activeIndex === i)}
                    >
                        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#f7f7f7' }} />
                    </button>
                ))}
            </div>
            <div style={{ flex: '1 1 0%', minWidth: 0 }}>
                <LightGallery
                    plugins={[lgThumbnail, lgZoom]}
                    selector={'.DZoomImage'}
                >
                    <Swiper className="product-gallery-swiper2 rounded"
                        spaceBetween={0}
                        updateOnWindowResize={true}
                        onSwiper={setMainSwiper}
                        onSlideChange={(s) => setActiveIndex(s.activeIndex)}
                    >
                        {slides.map((src, i) => (
                            <SwiperSlide key={i}>
                                <div className="dz-media">
                                    <Link className="mfp-link lg-item DZoomImage" to={src} data-src={src}>
                                        <i className="feather icon-maximize dz-maximize top-left"/>
                                        <img src={src} alt="" className=" d-none"/>
                                    </Link>
                                    <img src={src} alt="product" />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </LightGallery>
            </div>
        </div>
    )
}
