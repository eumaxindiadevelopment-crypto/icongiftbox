import { Link, useNavigate } from "react-router-dom";
import { Fragment, useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import StarRating from "./StarRating";
import ProductInputButton from "./ProductInputButton";
import { useCart } from "../../context/CartContext";
import { useCurrency } from "../../context/CurrencyContext";
import { getPriceRange, formatPriceRange } from "../../lib/productPricing";
import { isValidCssColor } from "../../lib/colorUtils";
import { buildProductUrl } from "../../lib/seoUrl";
import type { CategoryRef } from "../../lib/seoUrl";

export type Variation = {
    _id?: string;
    attributes: Record<string, string>;
    sku?: string;
    price: number;
    stockQuantity: number;
    stockStatus?: string;
    images?: { src: string; alt?: string }[];
    enabled: boolean;
};

type Attribute = { name: string; options: string[] };

export type Product = {
    _id: string;
    slug?: string;
    name: string;
    price: number;
    regularPrice?: number;
    salePrice?: number;
    onSale?: boolean;
    sku?: string;
    shortDescription?: string;
    description?: string;
    stockQuantity?: number;
    stockStatus?: string;
    categories?: { _id: string; name: string; slug?: string }[];
    primaryCategory?: (CategoryRef & { _id?: string; name?: string }) | null;
    tags?: string[];
    attributes?: Attribute[];
    type?: 'simple' | 'variable';
    variations?: Variation[];
    images?: { src: string; alt?: string }[];
};

type Props = {
    product: Product;
    selected: Record<string, string>;
    onSelect: Dispatch<SetStateAction<Record<string, string>>>;
    onVariationChange?: (variation: Variation | null) => void;
};

const stripHtml = (html?: string) => (html || '').replace(/<[^>]+>/g, '');

export default function ShopProductRightContent({ product, selected, onSelect, onVariationChange }: Props){
    const { addToCart } = useCart();
    const { formatPrice } = useCurrency();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);

    const isVariable = product.type === 'variable' && (product.attributes?.length || 0) > 0;
    const allSelected = isVariable && product.attributes!.every(a => selected[a.name]);

    const matchedVariation = useMemo(() => {
        if (!isVariable || !allSelected) return null;
        return product.variations?.find(v =>
            v.enabled && Object.entries(selected).every(([k, val]) => v.attributes[k] === val)
        ) || null;
    }, [isVariable, allSelected, selected, product.variations]);

    const displayPrice = matchedVariation?.price ?? product.salePrice ?? product.price;
    const priceRange = useMemo(() => isVariable ? getPriceRange(product) : null, [isVariable, product]);
    const displayStock = matchedVariation ? matchedVariation.stockQuantity : (product.stockQuantity ?? 0);
    const displaySku = matchedVariation?.sku || product.sku;
    const displayImage = matchedVariation?.images?.[0]?.src || product.images?.[0]?.src;

    useEffect(() => {
        onVariationChange?.(matchedVariation);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchedVariation]);

    // Default to the first in-stock variation so shoppers land on a ready-to-buy
    // combination instead of an empty "select an option" state.
    useEffect(() => {
        if (!isVariable) return;
        const defaultVariation = product.variations?.find(v => v.enabled && v.stockQuantity > 0)
            || product.variations?.find(v => v.enabled);
        onSelect(defaultVariation?.attributes || {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product._id]);

    const selectOption = (attrName: string, value: string) => {
        onSelect(prev => ({ ...prev, [attrName]: value }));
    };

    const canAddToCart = !isVariable || (allSelected && !!matchedVariation && matchedVariation.stockQuantity > 0);

    const shareUrl = `${window.location.origin}${buildProductUrl(product)}`;
    const shareText = product.name;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success('Link copied to clipboard!', { position: 'bottom-right', autoClose: 2000 });
        } catch {
            toast.error('Could not copy link', { position: 'bottom-right', autoClose: 2000 });
        }
    };

    const handleAddToCart = () => {
        if (isVariable && !allSelected) {
            const missing = product.attributes!.filter(a => !selected[a.name]).map(a => a.name);
            toast.error(`Please select ${missing.join(' and ')} first`, { position: 'bottom-right', autoClose: 2500 });
            return;
        }
        if (isVariable && allSelected && !matchedVariation) {
            toast.error('This combination is not available', { position: 'bottom-right', autoClose: 2500 });
            return;
        }
        if (isVariable && matchedVariation && matchedVariation.stockQuantity <= 0) {
            toast.error('This variation is out of stock', { position: 'bottom-right', autoClose: 2500 });
            return;
        }
        addToCart({
            id: product._id,
            slug: product.slug,
            image: displayImage || '',
            title: product.name,
            price: displayPrice,
            variationId: matchedVariation?._id,
            attributes: isVariable ? selected : undefined,
            primaryCategory: product.primaryCategory,
        }, quantity);
        navigate('/cart');
    };

    return(
        <div className="dz-product-detail style-2 p-t20 ps-0">
            <div className="dz-content">
                <div className="dz-content-footer">
                    <div className="dz-content-start">
                        {product.onSale && <span className="badge bg-secondary mb-2">On Sale</span>}
                        <h4 className="title mb-1">{product.name}</h4>
                        <div className="review-num">
                            <ul className="dz-rating me-2">
                                <StarRating />
                            </ul>
                        </div>
                    </div>
                </div>
                {(product.shortDescription || product.description) && (
                    <p className="para-text">
                        {stripHtml(product.shortDescription || product.description).slice(0, 300)}
                    </p>
                )}
                <div className="meta-content m-b20 d-flex align-items-end">
                    {isVariable && !matchedVariation ? (
                        <h4 className="text-secondary mb-0">{formatPriceRange(priceRange!, formatPrice)}</h4>
                    ) : (
                        <>
                            <h4 className="text-secondary mb-0">{formatPrice(displayPrice)}</h4>
                            {product.onSale && product.regularPrice && product.regularPrice > displayPrice && (
                                <span className="text-gray line-through ms-2">{formatPrice(product.regularPrice)}</span>
                            )}
                        </>
                    )}
                </div>
                <div className="product-num">
                    <div className="btn-quantity light d-xl-block">
                        <label className="form-label">Quantity</label>
                        <ProductInputButton value={quantity} onChange={setQuantity} />
                    </div>

                    {isVariable && product.attributes!.map(attr => {
                        const isColor = /^colou?r$/i.test(attr.name);
                        return (
                            <div className={isColor ? "meta-content" : "d-block"} key={attr.name}>
                                <label className="form-label">{attr.name}</label>
                                {isColor ? (
                                    <div className="d-flex align-items-center color-filter">
                                        {attr.options.map(opt => {
                                            const validColor = isValidCssColor(opt);
                                            return (
                                                <div className="form-check" key={opt} title={opt}>
                                                    <input className="form-check-input" type="radio" name={`attr-${attr.name}`}
                                                        checked={selected[attr.name] === opt}
                                                        onChange={() => selectOption(attr.name, opt)} />
                                                    <span style={validColor ? { backgroundColor: opt } : {
                                                        backgroundColor: '#eee', color: '#666', fontSize: 9, fontWeight: 700,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        textTransform: 'uppercase', border: '1px solid #ccc',
                                                    }}>
                                                        {!validColor && opt.slice(0, 2)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="btn-group product-size m-0">
                                        {attr.options.map(opt => (
                                            <Fragment key={opt}>
                                                <input type="radio" className="btn-check" name={`attr-${attr.name}`} id={`attr-${attr.name}-${opt}`}
                                                    checked={selected[attr.name] === opt}
                                                    onChange={() => selectOption(attr.name, opt)} />
                                                <label className="btn" htmlFor={`attr-${attr.name}-${opt}`}>{opt}</label>
                                            </Fragment>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {isVariable && allSelected && !matchedVariation && (
                    <p className="text-danger font-14">This combination is not available.</p>
                )}
                {isVariable && matchedVariation && matchedVariation.stockQuantity === 0 && (
                    <p className="text-danger font-14">Out of stock.</p>
                )}

                <div className="d-flex m-b20">
                    <Link to="#" onClick={(e) => { e.preventDefault(); handleAddToCart(); }}
                        className="btn btn-secondary btn-md"
                        style={!canAddToCart ? { opacity: 0.6 } : undefined}
                        aria-disabled={!canAddToCart}
                    >
                        <i className="icon feather icon-shopping-cart me-2" />
                        Add to cart
                    </Link>
                </div>

                <div className="dz-info">
                    <ul>
                        <li><strong>SKU:</strong></li>
                        <li>{displaySku || '—'}</li>
                    </ul>
                    <ul>
                        <li><strong>Stock:</strong></li>
                        <li>{isVariable && !allSelected ? 'Select options to see availability' : displayStock > 0 ? `${displayStock} available` : 'Out of stock'}</li>
                    </ul>
                    {product.categories && product.categories.length > 0 && (
                        <ul>
                            <li><strong>Category:</strong></li>
                            {product.categories.map(c => (
                                <li key={c._id}><Link to="/shop-sidebar">{c.name},</Link></li>
                            ))}
                        </ul>
                    )}
                    {product.tags && product.tags.length > 0 && (
                        <ul>
                            <li><strong>Tags:</strong></li>
                            {product.tags.map(tag => (
                                <li key={tag}><Link to="/shop-sidebar">{tag},</Link></li>
                            ))}
                        </ul>
                    )}
                    <ul className="social-icon">
                        <li><strong>Share:</strong></li>
                        <li>
                            <Link to={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank">
                                <i className="fa-brands fa-facebook-f"/>
                            </Link>
                        </li>
                        <li>
                            <Link to={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank">
                                <i className="fa-brands fa-twitter"/>
                            </Link>
                        </li>
                        <li>
                            <Link to={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank">
                                <i className="fa-brands fa-linkedin-in"/>
                            </Link>
                        </li>
                        <li>
                            <Link to={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`} target="_blank">
                                <i className="fa-brands fa-whatsapp"/>
                            </Link>
                        </li>
                        <li>
                            <Link to="#" onClick={(e) => { e.preventDefault(); handleCopyLink(); }} title="Copy link">
                                <i className="icon feather icon-link-2"/>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
