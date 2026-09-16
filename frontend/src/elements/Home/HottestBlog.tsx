import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import IMAGES, { SVGICON } from "../../constant/theme";
import HottestSliderBlog from "./HottestSliderBlog";
import api from '../../lib/api';

interface SliderItem {
  image: string;
  title: string;
  saleTitle: string;
  link: string;
}

interface HottestData {
  title: string;
  subtitle: string;
  seeAllLink: string;
  mapCards: SliderItem[];
  sliderItems: SliderItem[];
}

const MAP_DESIGNS = ['area-box1', 'area-box2', 'area-box3'];

const FALLBACK_IMAGES = [IMAGES.productmedium3, IMAGES.productmedium4, IMAGES.productmedium5];

const DEFAULTS: HottestData = {
  title: 'Discovering the Hottest Nearby Destinations in Your Area',
  subtitle: 'Up to 60% off + up to ₹107 cashback',
  seeAllLink: '/shop',
  mapCards: [
    { image: '', title: 'Cozy Knit Cardigan Sweater', saleTitle: 'up to 79% off', link: '/shop' },
    { image: '', title: 'Sophisticated Swagger Suit',  saleTitle: 'up to 79% off', link: '/shop' },
    { image: '', title: 'Classic Denim Skinny Jeans',  saleTitle: 'up to 79% off', link: '/shop' },
  ],
  sliderItems: [],
};

const HottestBlog = () => {
  const [data, setData] = useState<HottestData>(DEFAULTS);

  useEffect(() => {
    api.get('/hottest-blog')
      .then(({ data: d }) => setData({
        ...DEFAULTS, ...d,
        mapCards:    d.mapCards?.length    ? d.mapCards    : DEFAULTS.mapCards,
        sliderItems: d.sliderItems?.length ? d.sliderItems : [],
      }))
      .catch(() => {});
  }, []);

  return (
    <div className="row align-items-start">
      <div className="col-xl-7 col-lg-12 col-md-12">
        <div className="map-area">
          <img src={IMAGES.map2} alt="product" />
          <div className="map-line" id="map-line">
            <img src={IMAGES.mapline} alt="product" />
          </div>
          <div className="loction-b" dangerouslySetInnerHTML={{ __html: SVGICON.locationSvgB }}></div>
          <div className="loction-center" dangerouslySetInnerHTML={{ __html: SVGICON.KiloMeterSvg }}></div>
          <div className="loction-a" dangerouslySetInnerHTML={{ __html: SVGICON.locationSvgA }}></div>

          {data.mapCards.map((item, i) => (
            <div className={`animated ${MAP_DESIGNS[i]}`} key={i}>
              <div className="shop-card style-7">
                <div className="dz-media">
                  <img src={item.image || FALLBACK_IMAGES[i]} alt="product" />
                </div>
                <div className="dz-content">
                  <h5 className="title"><Link to={item.link}>{item.title}</Link></h5>
                  <span className="sale-title">{item.saleTitle}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="col-xl-5 col-lg-12 col-md-12 custom-width">
        <div className="section-head style-1 d-lg-flex align-items-end justify-content-between">
          <div className="left-content">
            <h2 className="title">{data.title}</h2>
            <p className="text-capitalize text-secondary m-0">{data.subtitle}</p>
          </div>
          <Link to={data.seeAllLink} className="text-secondary font-14 d-flex align-items-center gap-1 m-b15">
            See All <i className="icon feather icon-chevron-right font-18" />
          </Link>
        </div>
        <HottestSliderBlog items={data.sliderItems.length ? data.sliderItems : undefined} />
      </div>
    </div>
  );
};

export default HottestBlog;
