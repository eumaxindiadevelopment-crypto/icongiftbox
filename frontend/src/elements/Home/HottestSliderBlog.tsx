import { Swiper, SwiperSlide } from 'swiper/react';
import { Link } from 'react-router-dom';
import { Autoplay } from 'swiper/modules';
import { HottestSliderBlogData } from '../../constant/Alldata';
import IMAGES from '../../constant/theme';

interface SliderItem {
  image: string;
  title: string;
  saleTitle: string;
  link: string;
}

const FALLBACK_IMAGES = [
  IMAGES.productmedium3, IMAGES.productmedium4, IMAGES.productmedium5,
  IMAGES.productmedium6, IMAGES.productmedium3, IMAGES.productmedium4,
];

interface Props {
  items?: SliderItem[];
}

const HottestSliderBlog = ({ items }: Props) => {
  const data: SliderItem[] = items?.length
    ? items
    : HottestSliderBlogData.map((d, i) => ({
        image: d.image,
        title: d.title,
        saleTitle: 'up to 79% off',
        link: '/shop',
      }));

  return (
    <Swiper
      speed={1000}
      loop={true}
      parallax={true}
      slidesPerView={4}
      spaceBetween={30}
      autoplay={{ delay: 2500 }}
      watchSlidesProgress={true}
      modules={[Autoplay]}
      breakpoints={{
        1600: { slidesPerView: 4 },
        1440: { slidesPerView: 3 },
        1300: { slidesPerView: 5 },
        991:  { slidesPerView: 4 },
        767:  { slidesPerView: 2 },
        575:  { slidesPerView: 2 },
        340:  { slidesPerView: 1, centeredSlides: true },
      }}
      className="swiper swiper-shop2 swiper-visible"
    >
      {data.map((item, i) => (
        <SwiperSlide key={i}>
          <div className="shop-card style-7">
            <div className="dz-media">
              <img src={item.image || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]} alt="product" />
            </div>
            <div className="dz-content">
              <h5 className="title"><Link to={item.link}>{item.title}</Link></h5>
              <span className="sale-title text-success">{item.saleTitle}</span>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HottestSliderBlog;
