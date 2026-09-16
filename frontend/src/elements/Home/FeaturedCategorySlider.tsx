import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FeaturedSliderData } from '../../constant/Alldata';
import api from '../../lib/api';

interface FeaturedItem {
  _id?: string;
  name: string;
  image: string;
  url: string;
}

const FeaturedCategorySlider = () => {
  const [slides, setSlides] = useState<FeaturedItem[]>([]);

  useEffect(() => {
    api.get('/featured-categories')
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) setSlides(data)
      })
      .catch(() => {})
  }, [])

  const data: FeaturedItem[] = slides.length > 0
    ? slides
    : FeaturedSliderData.map(s => ({ name: s.name, image: s.image, url: '/shop' }))

  return (
    <Swiper
      slidesPerView={5}
      spaceBetween={15}
      loop={true}
      navigation={{
        nextEl: '.shop-button-next',
        prevEl: '.shop-button-prev',
      }}
      className="swiper-shop"
      modules={[Navigation]}
      breakpoints={{
        1600: { slidesPerView: 5 },
        1400: { slidesPerView: 4 },
        991:  { slidesPerView: 3 },
        767:  { slidesPerView: 3 },
        575:  { slidesPerView: 2 },
        340:  { slidesPerView: 2 },
      }}
    >
      {data.map((item, ind) => (
        <SwiperSlide key={ind}>
          <div className="shop-box style-1 wow fadeInUp" data-wow-delay="0.2s">
            <div className="dz-media">
              <img src={item.image} alt={item.name} />
            </div>
            <h6 className="product-name"><Link to={item.url}>{item.name}</Link></h6>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default FeaturedCategorySlider;
