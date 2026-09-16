import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import IMAGES, { SVGICON } from "../../constant/theme";
import api from '../../lib/api';

interface AboutData {
  mainImage: string;
  mainBtnText: string;
  mainBtnLink: string;
  title: string;
  description: string;
  aboutLink: string;
  card1Image: string;
  card1BtnText: string;
  card1Link: string;
  card2Image: string;
  card2BtnText: string;
  card2Link: string;
  card2Badge: string;
}

const DEFAULTS: AboutData = {
  mainImage: '',
  mainBtnText: 'Woman collection',
  mainBtnLink: '/shop',
  title: 'Set your wardrobe with our amazing selection!',
  description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the',
  aboutLink: '/about-us',
  card1Image: '',
  card1BtnText: 'Child Fashion',
  card1Link: '/shop',
  card2Image: '',
  card2BtnText: 'Man collection',
  card2Link: '/shop',
  card2Badge: '50% Sale',
};

const AboutusBlog = () => {
  const [data, setData] = useState<AboutData>(DEFAULTS);

  useEffect(() => {
    api.get('/about-section')
      .then(({ data: d }) => setData({ ...DEFAULTS, ...d }))
      .catch(() => {});
  }, []);

  const mainImg   = data.mainImage   || IMAGES.Womenpng;
  const card1Img  = data.card1Image  || IMAGES.productmedium1;
  const card2Img  = data.card2Image  || IMAGES.productmedium2;

  return (
    <div className="row about-style1">
      <div className="col-lg-6 col-md-12 m-b30">
        <div className="about-thumb wow fadeInUp position-relative" data-wow-delay="0.2s">
          <div className="dz-media h-100">
            <img src={mainImg} alt="" />
          </div>
          <Link to={data.mainBtnLink} className="btn btn-outline-secondary btn-light btn-xl">
            {data.mainBtnText}
          </Link>
        </div>
      </div>
      <div className="col-lg-6 col-md-12 align-self-center">
        <div className="about-content">
          <div className="section-head style-1 wow fadeInUp" data-wow-delay="0.4s">
            <h3 className="title">{data.title}</h3>
            {data.description && <p>{data.description}</p>}
          </div>
          <Link to={data.aboutLink} className="service-btn-2 wow fadeInUp" data-wow-delay="0.6s">
            <span className="icon-wrapper" dangerouslySetInnerHTML={{ __html: SVGICON.ArrowUpSvg }}></span>
          </Link>
          <div className="row">
            <div className="col-lg-6 col-md-6 col-sm-6">
              <div className="shop-card style-6 wow fadeInUp" data-wow-delay="0.8s">
                <div className="dz-media">
                  <img src={card1Img} alt="image" />
                </div>
                <div className="dz-content">
                  <Link to={data.card1Link} className="btn btn-outline-secondary btn-light btn-md">
                    {data.card1BtnText}
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-6 col-sm-6">
              <div className="shop-card style-6 wow fadeInUp" data-wow-delay="1.0s">
                <div className="dz-media">
                  <img src={card2Img} alt="image" />
                </div>
                <div className="dz-content">
                  <Link to={data.card2Link} className="btn btn-outline-secondary btn-light btn-md">
                    {data.card2BtnText}
                  </Link>
                </div>
                {data.card2Badge && (
                  <span className="sale-badge">
                    {data.card2Badge} <img src={IMAGES.starpng} alt="" />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutusBlog;
