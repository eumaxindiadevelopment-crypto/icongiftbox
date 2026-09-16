import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { QuickViewProduct } from "../../components/BasicModalData";
import { buildProductUrl, CategoryRef } from "../../lib/seoUrl";

interface cardType {
  id?: string | number;
  slug?: string;
  image: string;
  title: string;
  price?: string;
  priceNum?: number;
  regularPrice?: number;
  onSale?: boolean;
  primaryCategory?: CategoryRef | null;
  shortDescription?: string;
  showdetailModal?: ((product?: QuickViewProduct) => void) | undefined;
}

export default function ShopGridCard(props: cardType) {
  const [heartIcon, setHeartIcon] = useState(false);
  const [basketIcon, setBasketIcon] = useState(false);
  const { addToCart } = useCart();
  const productLink = props.slug || props.id;
  const productHref = productLink
    ? buildProductUrl({ slug: props.slug, _id: props.id?.toString(), primaryCategory: props.primaryCategory })
    : "/shop-list";
  const onSale = !!props.onSale && !!props.regularPrice && !!props.priceNum && props.regularPrice > props.priceNum;
  const discountPercent = onSale ? Math.round(((props.regularPrice! - props.priceNum!) / props.regularPrice!) * 100) : 0;

  const handleAddToCart = () => {
    setBasketIcon(true);
    const priceVal = (props.priceNum ?? parseFloat(String(props.price ?? '').replace(/[^\d.]/g, ''))) || 0;
    addToCart({
      id: props.id ?? props.title,
      slug: props.slug,
      image: props.image,
      title: props.title,
      price: priceVal,
      primaryCategory: props.primaryCategory,
    });
  };

  return (
    <div className="shop-card style-1">
      <div className="dz-media">
        <img src={props.image} alt="shop" />
        <div className="shop-meta">
          <Link to={"#"} className="btn btn-secondary btn-md btn-rounded"
            data-bs-toggle="modal" data-bs-target="#exampleModal"
            onClick={() => props.showdetailModal?.({ id: props.id, image: props.image, name: props.title, price: props.price, priceNum: props.priceNum, regularPrice: props.regularPrice, onSale: props.onSale, description: props.shortDescription })}>
            <i className="fa-solid fa-eye d-md-none d-block" />
            <span className="d-md-block d-none">Quick View</span>
          </Link>
          <div className={`btn btn-primary meta-icon dz-wishicon ${heartIcon ? "active" : ""}`}
            onClick={() => setHeartIcon(!heartIcon)}>
            <i className="icon feather icon-heart dz-heart" />
            <i className="icon feather icon-heart-on dz-heart-fill" />
          </div>
          <div className={`btn btn-primary meta-icon dz-carticon ${basketIcon ? "active" : ""}`}
            onClick={handleAddToCart}>
            <i className="flaticon flaticon-basket" />
            <i className="flaticon flaticon-shopping-basket-on dz-heart-fill" />
          </div>
        </div>
      </div>
      <div className="dz-content">
        <h5 className="title"><Link to={productHref}>{props.title}</Link></h5>
        <h5 className="price">{props.price}</h5>
      </div>
      {onSale && (
        <div className="product-tag">
          <span className="badge">Get {discountPercent}% Off</span>
        </div>
      )}
    </div>
  );
}
