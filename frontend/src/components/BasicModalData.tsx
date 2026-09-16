import { Link, useNavigate } from "react-router-dom";
import { SVGICON } from "../constant/theme";
import { modalCategoryBlog, modalCategoryBlog2 } from "../constant/Alldata";
import ProductInputButton from "../elements/Shop/ProductInputButton";
import { useCart } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";

export interface QuickViewProduct {
    id?: string | number;
    name?: string;
    price?: string;
    // Raw base-currency numbers (alongside the formatted display `price` above)
    // so the sale discount below can be computed correctly regardless of
    // which currency the shopper has selected.
    priceNum?: number;
    regularPrice?: number;
    onSale?: boolean;
    image?: string;
    images?: string[];
    sku?: string;
    description?: string;
}

interface Props {
    product?: QuickViewProduct;
}

// Short descriptions come from the admin's rich-text editor (raw HTML like
// <p>/<strong>), but this modal renders plain text — without stripping tags
// they'd show up literally on the page instead of being applied as formatting.
const stripHtml = (html?: string) => (html || '').replace(/<[^>]+>/g, '');

export default function BasicModalData({ product }: Props) {
    const { addToCart } = useCart();
    const { formatPrice } = useCurrency();
    const navigate = useNavigate();

    const name = product?.name || "Cozy Knit Cardigan Sweater";
    const price = product?.price || formatPrice(125.75);
    const sku = product?.sku || "PRT584E63A";
    const description = stripHtml(product?.description);
    const onSale = !!product?.onSale && !!product?.regularPrice && !!product?.priceNum && product.regularPrice > product.priceNum;
    const discountPercent = onSale ? Math.round(((product!.regularPrice! - product!.priceNum!) / product!.regularPrice!) * 100) : 0;

    const handleAddToCart = () => {
        const priceNum = parseFloat(String(price).replace(/[^\d.]/g, '')) || 0;
        addToCart({
            id: product?.id ?? name,
            image: product?.images?.[0] || product?.image || '',
            title: name,
            price: priceNum,
        });
        navigate('/cart');
    };

    return (
        <>
            <div className="dz-product-detail style-2 ps-xl-3 ps-0 pt-2 mb-0">
                <div className="dz-content">
                    <div className="dz-content-footer">
                        <div className="dz-content-start">
                            {onSale && <span className="badge bg-secondary mb-2">SALE {discountPercent}% Off</span>}
                            <h4 className="title mb-1"><Link to="/shop-list">{name}</Link></h4>
                            <div className="review-num">
                                <ul className="dz-rating me-2">
                                    <li className="star-fill"><i className="flaticon-star-1" /></li>
                                    <li className="star-fill"><i className="flaticon-star-1" /></li>
                                    <li className="star-fill"><i className="flaticon-star-1" /></li>
                                    <li><i className="flaticon-star-1" /></li>
                                    <li><i className="flaticon-star-1" /></li>
                                </ul>
                                <span className="text-secondary me-2">4.7 Rating</span>
                                <Link to="#">(5 customer reviews)</Link>
                            </div>
                        </div>
                    </div>
                    {description && <p className="para-text">{description}</p>}
                    <div className="meta-content m-b20 d-flex align-items-end">
                        <div className="me-3">
                            <span className="form-label">Price</span>
                            <span className="price">{price}</span>
                        </div>
                        <div className="btn-quantity light me-0">
                            <label className="form-label">Quantity</label>
                            <ProductInputButton />
                        </div>
                    </div>
                    <div className="cart-btn">
                        <button type="button" className="btn btn-secondary text-uppercase" onClick={handleAddToCart}>
                            Add To Cart
                        </button>
                        <Link to="/shop-wishlist" className="btn btn-md btn-outline-secondary btn-icon">
                            <svg width="19" height="17" viewBox="0 0 19 17" fill="none" xmlns="http://www.w3.org/2000/svg" dangerouslySetInnerHTML={{ __html: SVGICON.BlankHeart }} />
                            Add To Wishlist
                        </Link>
                    </div>
                    <div className="dz-info mb-0">
                        <ul>
                            <li><strong>SKU:</strong></li>
                            <li>{sku}</li>
                        </ul>
                        <ul>
                            <li><strong>Category:</strong></li>
                            {modalCategoryBlog.map((elem, ind) => (
                                <li key={ind}><Link to="/shop">{elem.name}</Link></li>
                            ))}
                        </ul>
                        <ul>
                            <li><strong>Tags:</strong></li>
                            {modalCategoryBlog2.map((elem, ind) => (
                                <li key={ind}><Link to="/shop">{elem.name}</Link></li>
                            ))}
                        </ul>
                        <div className="dz-social-icon">
                            <ul>
                                <li><Link target="_blank" className="text-dark" to="https://www.facebook.com/dexignzone"><i className="fab fa-facebook-f" /></Link></li>
                                <li><Link target="_blank" className="text-dark" to="https://twitter.com/dexignzones"><i className="fab fa-twitter" /></Link></li>
                                <li><Link target="_blank" className="text-dark" to="https://www.youtube.com/@dexignzone1723"><i className="fa-brands fa-youtube" /></Link></li>
                                <li><Link target="_blank" className="text-dark" to="https://www.linkedin.com/showcase/3686700/admin/"><i className="fa-brands fa-linkedin-in" /></Link></li>
                                <li><Link target="_blank" className="text-dark" to="https://www.instagram.com/dexignzone/"><i className="fab fa-instagram" /></Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

