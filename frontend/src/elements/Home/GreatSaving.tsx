import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import IMAGES from "../../constant/theme";
import { GreatSavindData } from '../../constant/Alldata';
import SaleDiscountShopCard from '../../components/SaleDiscountShopCard';
import api from '../../lib/api';

interface CardData {
  name: string;
  image: string;
  saleTitle: string;
  price: string;
  originalPrice: string;
  link: string;
  showBadge: boolean;
}

interface GreatSavingData {
  bannerImage: string;
  title: string;
  subtitle: string;
  btnText: string;
  btnLink: string;
  animationText: string;
  cards: CardData[];
}

const DEFAULT_CARDS: CardData[] = GreatSavindData.map((d) => ({
  name: d.name,
  image: d.image,
  saleTitle: 'up to 79% off',
  price: '80',
  originalPrice: '95',
  link: '/shop',
  showBadge: d.star === 'star',
}));

const DEFAULTS: GreatSavingData = {
  bannerImage: '',
  title: 'Great saving on everyday essentials',
  subtitle: 'Up to 60% off + up to ₹107 cashback',
  btnText: 'See all',
  btnLink: '/shop',
  animationText: 'Great saving',
  cards: DEFAULT_CARDS,
};

const FALLBACK_IMAGES = [
  IMAGES.ShopPorductPng1,
  IMAGES.ShopPorductPng2,
  IMAGES.ShopPorductPng3,
  IMAGES.ShopPorductPng4,
];

const GreatSaving = () => {
  const [data, setData] = useState<GreatSavingData>(DEFAULTS);

  useEffect(() => {
    api.get('/great-saving')
      .then(({ data: d }) => setData({
        ...DEFAULTS,
        ...d,
        cards: d.cards?.length ? d.cards : DEFAULT_CARDS,
      }))
      .catch(() => {});
  }, []);

  const bannerImg = data.bannerImage || IMAGES.AboutPic1;

  return (
    <div className="row">
      <div className="col-lg-6 col-md-12 align-self-center">
        <div className="row">
          {data.cards.map((card, ind) => (
            <div className="col-lg-6 col-md-6 col-sm-6 m-b30" key={ind}>
              <SaleDiscountShopCard
                image={card.image || FALLBACK_IMAGES[ind]}
                name={card.name}
                saleTitle={card.saleTitle}
                price={card.price}
                originalPrice={card.originalPrice}
                link={card.link}
                showBadge={card.showBadge}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="col-lg-6 col-md-12 m-b30">
        <div className="about-box style-1 clearfix h-100 right">
          <div className="dz-media h-100">
            <img src={bannerImg} alt="" />
            <div className="media-contant">
              <h2 className="title">{data.title}</h2>
              <h5 className="sub-title">{data.subtitle}</h5>
              <Link to={data.btnLink} className="btn btn-white btn-lg">{data.btnText}</Link>
            </div>
            <svg className="title animation-text" viewBox="0 0 1320 300">
              <text x="0" y="">{data.animationText}</text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreatSaving;
