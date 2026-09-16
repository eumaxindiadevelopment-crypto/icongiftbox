import { Link } from "react-router-dom";
import IMAGES from "../constant/theme";
import { useCurrency } from "../context/CurrencyContext";

interface propsValue {
  name: string;
  image: string;
  star?: string;
  saleTitle?: string;
  price?: string;
  originalPrice?: string;
  link?: string;
  showBadge?: boolean;
}

const SaleDiscountShopCard = ({ name, image, star, saleTitle, price, originalPrice, link, showBadge }: propsValue) => {
  const { formatPrice } = useCurrency();
  const to = link || '/shop';
  const hasBadge = showBadge || star === 'star';

  return (
    <div className="shop-card style-3">
      <div className="dz-media">
        <img src={image} alt="shop-1" />
      </div>
      <div className="dz-content">
        <div>
          <span className="sale-title">{saleTitle || 'up to 79% off'}</span>
          <h6 className="title"><Link to={to}>{name}</Link></h6>
        </div>
        <h6 className="price">
          {formatPrice(price || 80)}
          <del>{formatPrice(originalPrice || 95)}</del>
        </h6>
      </div>
      {hasBadge && (
        <span className="sale-badge">50%<br />Sale <img src={IMAGES.starpng} alt="" /></span>
      )}
    </div>
  );
};

export default SaleDiscountShopCard;
