import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import IMAGES, { SVGICON } from "../../constant/theme";
import { Link } from 'react-router-dom';
import ProductRollup from '../../components/ProductRollup';
import api from '../../lib/api';
import { useCurrency } from '../../context/CurrencyContext';

interface ProductCard {
  name: string;
  image: string;
  saleTitle: string;
  price: string;
  originalPrice: string;
  link: string;
}

interface AllProductionData {
  mainImage: string;
  title: string;
  shopLink: string;
  cards: ProductCard[];
}

const DEFAULT_CARDS: ProductCard[] = [
  { name: 'Cozy Knit Cardigan Sweater', image: '', saleTitle: 'up to 79% off', price: '80', originalPrice: '95', link: '/shop' },
  { name: 'Sophisticated Swagger Suit',  image: '', saleTitle: 'up to 79% off', price: '80', originalPrice: '95', link: '/shop' },
  { name: 'Classic Denim Skinny Jeans',  image: '', saleTitle: 'up to 79% off', price: '80', originalPrice: '95', link: '/shop' },
];

const FALLBACK_IMAGES = [IMAGES.ShopPorductPng1, IMAGES.ShopPorductPng2, IMAGES.ShopPorductPng3];

const DEFAULTS: AllProductionData = {
  mainImage: '',
  title: 'Users Who Viewed This Also Checked Out These Similar Profiles',
  shopLink: '/shop',
  cards: DEFAULT_CARDS,
};

const AllProduction = () => {
  const { formatPrice } = useCurrency();
  const [data, setData] = useState<AllProductionData>(DEFAULTS);

  useEffect(() => {
    api.get('/all-production')
      .then(({ data: d }) => setData({
        ...DEFAULTS,
        ...d,
        cards: d.cards?.length ? d.cards : DEFAULT_CARDS,
      }))
      .catch(() => {});
  }, []);

  const mainImg = data.mainImage || IMAGES.AboutPic3;

  return (
    <div className="row align-items-xl-center align-items-start">
      <div className="col-lg-5 col-md-12 m-b30 align-self-center">
        <motion.div className="dz-media style-1 img-ho1"
          animate={{ y: '50%' }}
          whileInView={{ y: 0 }}
          transition={{ duration: 1 }}
        >
          <img src={mainImg} alt="shop" />
        </motion.div>
      </div>

      <div className="col-lg-7 col-md-12 col-sm-12">
        <div className="row justify-content-between align-items-center">
          <div className="col-lg-8 col-md-8 col-sm-12">
            <motion.div className="section-head style-1"
              animate={{ y: '60%' }}
              whileInView={{ y: 0 }}
              transition={{ duration: 1.2 }}
            >
              <div className="left-content">
                <h2 className="title">{data.title}</h2>
              </div>
            </motion.div>
          </div>
          <div className="col-lg-4 col-md-4 col-sm-12 text-md-end">
            <Link to={data.shopLink} className="icon-button d-md-block d-none ms-md-auto m-b30">
              <div className="text-row word-rotate-box c-black">
                <ProductRollup />
                <svg className="badge__emoji" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none"
                  dangerouslySetInnerHTML={{ __html: SVGICON.ArrowRightSvg }}
                ></svg>
              </div>
            </Link>
          </div>
        </div>

        <div className="row">
          {data.cards.map((card, ind) => (
            <div className="col-lg-4 col-md-4 col-sm-6 m-b15" key={ind}>
              <motion.div className="shop-card style-5"
                animate={{ y: '60%' }}
                whileInView={{ y: 0 }}
                transition={{ duration: 1.4 }}
              >
                <div className="dz-media">
                  <img src={card.image || FALLBACK_IMAGES[ind]} alt="shop" />
                </div>
                <div className="dz-content">
                  <div>
                    <span className="sale-title">{card.saleTitle}</span>
                    <h6 className="title"><Link to={card.link}>{card.name}</Link></h6>
                  </div>
                  <h6 className="price">
                    {formatPrice(card.price)}
                    <del>{formatPrice(card.originalPrice)}</del>
                  </h6>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllProduction;
