import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import IMAGES from "../../constant/theme";
import api from '../../lib/api';

interface SummerData {
  panel1Image: string;
  panel1Badge: string;
  panel1Heading: string;
  panel1Year: string;
  panel1BtnText: string;
  panel1BtnLink: string;
  panel2Image: string;
  panel2Badge: string;
  panel2Heading: string;
  panel2BtnText: string;
  panel2BtnLink: string;
}

const DEFAULTS: SummerData = {
  panel1Image: '',
  panel1Badge: 'Sale Up to 50% Off',
  panel1Heading: 'Summer',
  panel1Year: '2024',
  panel1BtnText: 'Shop Now',
  panel1BtnLink: '/shop',
  panel2Image: '',
  panel2Badge: 'Sale Up to 50% Off',
  panel2Heading: 'New Summer Collection',
  panel2BtnText: 'Shop Now',
  panel2BtnLink: '/shop',
};

const SummerSaleBlog = () => {
  const [data, setData] = useState<SummerData>(DEFAULTS);

  useEffect(() => {
    api.get('/summer-sale')
      .then(({ data: d }) => setData({ ...DEFAULTS, ...d }))
      .catch(() => {});
  }, []);

  const bg1 = data.panel1Image || IMAGES.ShopLargbnr1;
  const bg2 = data.panel2Image || IMAGES.ShopLargbnr2;

  return (
    <div className="row product-style2 g-0">
      <motion.div className="col-lg-6 col-md-12"
        animate={{ y: '50%' }}
        whileInView={{ y: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="product-box style-4">
          <div className="product-media" style={{ backgroundImage: `url(${bg1})` }}></div>
          <div className="sale-box">
            <div className="badge style-1 mb-1">{data.panel1Badge}</div>
            <h2 className="sale-name">{data.panel1Heading}<span>{data.panel1Year}</span></h2>
            <Link to={data.panel1BtnLink} className="btn btn-outline-secondary btn-lg text-uppercase">
              {data.panel1BtnText}
            </Link>
          </div>
        </div>
      </motion.div>

      <motion.div className="col-lg-6 col-md-12"
        animate={{ y: '70%' }}
        whileInView={{ y: 0 }}
        transition={{ duration: 1.2 }}
      >
        <div className="product-box style-4">
          <div className="product-media" style={{ backgroundImage: `url(${bg2})` }}></div>
          <div className="product-content">
            <div className="main-content">
              <div className="badge style-1 mb-3">{data.panel2Badge}</div>
              <h2 className="product-name">{data.panel2Heading}</h2>
            </div>
            <Link to={data.panel2BtnLink} className="btn btn-secondary btn-lg text-uppercase">
              {data.panel2BtnText}
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SummerSaleBlog;
