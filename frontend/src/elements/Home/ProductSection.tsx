import { Link } from "react-router-dom";
import { useReducer, useEffect, useState, useCallback } from "react";
import { Modal } from "react-bootstrap";
import { masonryData, headfilterData } from "../../constant/Alldata";
import ModalSlider from "../../components/ModalSlider";
import BasicModalData from "../../components/BasicModalData";
import api from "../../lib/api";
import { useCart } from "../../context/CartContext";
import { useCurrency } from "../../context/CurrencyContext";
import { getPriceRange, PriceRange } from "../../lib/productPricing";
import { buildProductUrl, CategoryRef } from "../../lib/seoUrl";

interface MenuItem {
    image: string;
    discountPercent?: number;
    onSale?: boolean;
    name: string;
    price: string;
    priceRange?: PriceRange;
    category: string;
    hert: boolean;
    id: number;
    _id?: string;
    slug?: string;
    primaryCategory?: CategoryRef | null;
}

interface FilterTab {
    label: string;
    category: string;
    categoryId?: string;
}

interface SectionSettings {
    title: string;
    productCount: number;
    filterTabs: FilterTab[];
}

type HeartIconsState = { [key: number]: boolean };

const initialState = {
    heartIcon:   {} as HeartIconsState,
    basketIcon:  {} as HeartIconsState,
    detailModal: false,
    selectedItem: null as MenuItem | null,
    activeMenu:  0,
    data:        masonryData as MenuItem[],
};

function reducer(state: typeof initialState, action: any) {
    switch (action.type) {
        case 'TOGGLE_HEART':
            return { ...state, heartIcon: { ...state.heartIcon, [action.index]: !state.heartIcon[action.index] } };
        case 'TOGGLE_BASKET':
            return { ...state, basketIcon: { ...state.basketIcon, [action.index]: !state.basketIcon[action.index] } };
        case 'SET_DETAIL_MODAL':
            return { ...state, detailModal: action.value };
        case 'SET_SELECTED_ITEM':
            return { ...state, selectedItem: action.item, detailModal: true };
        case 'SET_ACTIVE_MENU':
            return { ...state, activeMenu: action.index };
        case 'SET_DATA':
            return { ...state, data: action.data };
        default:
            throw new Error();
    }
}

const DEFAULT_SETTINGS: SectionSettings = {
    title: 'Most popular products',
    productCount: 8,
    filterTabs: headfilterData.map(h => ({ label: h.title, category: h.title, categoryId: '' })),
};

function mapProducts(items: any[], fallbackData: typeof masonryData): MenuItem[] {
    return items.map((p: any, i: number) => {
        const regularPrice = Number(p.regularPrice) || 0;
        const salePrice = Number(p.salePrice) || 0;
        const onSale = !!p.onSale && regularPrice > 0 && salePrice > 0 && regularPrice > salePrice;
        return {
            id: i + 1,
            _id: p._id,
            slug: p.slug,
            primaryCategory: p.primaryCategory,
            hert: false,
            image: p.images?.[0]?.src || fallbackData[i % fallbackData.length]?.image,
            price: String(p.price ?? (salePrice || regularPrice)),
            priceRange: getPriceRange(p),
            name: p.name,
            onSale,
            discountPercent: onSale ? Math.round(((regularPrice - salePrice) / regularPrice) * 100) : 0,
            category: p.categories?.[0]?.name || 'ALL',
        };
    });
}

const ProductSection = () => {
    const [state, dispatch]   = useReducer(reducer, initialState);
    const [settings, setSettings] = useState<SectionSettings>(DEFAULT_SETTINGS);
    const [tabCounts, setTabCounts] = useState<Record<string, number>>({});
    const [tabLoading, setTabLoading] = useState(false);
    const { addToCart } = useCart();
    const { formatPrice } = useCurrency();
  
    const handleHide = () => dispatch({ type: 'SET_DETAIL_MODAL', value: false });

    // load settings then load initial products
    useEffect(() => {
        api.get('/product-section-settings')
            .then(({ data }) => {
                if (data?.title) setSettings(data);
                return data;
            })
            .catch(() => DEFAULT_SETTINGS)
            .then((s) => {
                const count = s?.productCount || 8;
                return api.get(`/products?status=publish&limit=${count}`);
            })
            .then(({ data }) => {
                const items = Array.isArray(data) ? data : data.products || [];
                if (items.length > 0) {
                    dispatch({ type: 'SET_DATA', data: mapProducts(items, masonryData) });
                }
            })
            .catch(() => {});
    }, []);

    const filterCategory = useCallback(async (tab: FilterTab, ind: number) => {
        document.querySelectorAll(".card-container").forEach(el => {
            (el as HTMLElement).style.transform = 'scale(0)';
        });
        dispatch({ type: 'SET_ACTIVE_MENU', index: ind });
        setTabLoading(true);

        try {
            let url = `/products?status=publish&limit=${settings.productCount}`;
            if (tab.category !== 'ALL' && tab.categoryId) {
                url += `&category=${tab.categoryId}`;
            }
            const { data } = await api.get(url);
            const items = Array.isArray(data) ? data : data.products || [];
            const mapped = items.length > 0
                ? mapProducts(items, masonryData)
                : [];
            dispatch({ type: 'SET_DATA', data: mapped });

            // update count for this tab
            const total = Array.isArray(data) ? data.length : (data.total ?? items.length);
            setTabCounts(prev => ({ ...prev, [ind]: total }));
        } catch {
            // keep current data
        } finally {
            setTabLoading(false);
            setTimeout(() => {
                document.querySelectorAll(".card-container").forEach(el => {
                    (el as HTMLElement).style.cssText = 'transform:scale(1);transition:all .5s linear';
                });
            }, 200);
        }
    }, [settings.productCount]);

    const toggleHeart = (index: number) => dispatch({ type: 'TOGGLE_HEART', index });

    const toggleBasket = (index: number) => {
        dispatch({ type: 'TOGGLE_BASKET', index });
        const item = state.data[index] as MenuItem;
        addToCart({
            id: item._id ?? item.id ?? index,
            slug: item.slug,
            image: item.image,
            title: item.name,
            price: parseFloat(String(item.price)) || 0,
            primaryCategory: item.primaryCategory,
        });
    };

    return (
        <>
            <div className="row justify-content-md-between align-items-start">
                <div className="col-lg-6 col-md-12">
                    <div className="section-head style-1 m-b30">
                        <div className="left-content">
                            <h2 className="title">{settings.title}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-lg-6 col-md-12">
                    <div className="site-filters clearfix style-1 align-items-center ms-lg-auto">
                        <ul className="filters">
                            {settings.filterTabs.map((tab, ind) => (
                                <li
                                    key={ind}
                                    className={`btn ${state.activeMenu === ind ? "active" : ""}`}
                                    onClick={() => filterCategory(tab, ind)}
                                    style={{ position: 'relative' }}
                                >
                                    <input type="radio" readOnly checked={state.activeMenu === ind} />
                                    <Link to={"#"}>
                                        {tab.label}
                                        {tabCounts[ind] !== undefined && (
                                            <span style={{
                                                marginLeft: '5px',
                                                fontSize: '11px',
                                                background: 'rgba(0,0,0,0.15)',
                                                borderRadius: '10px',
                                                padding: '1px 6px',
                                            }}>
                                                {tabCounts[ind]}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="clearfix">
                {tabLoading ? (
                    <div className="text-center py-4">
                        <span className="spinner-border spinner-border-sm" role="status" />
                    </div>
                ) : (
                    <ul id="masonry" className="row g-xl-4 g-3">
                        {state.data.map((item: MenuItem, ind: number) => (
                            <div className="card-container col-6 col-xl-3 col-lg-3 col-md-4 col-sm-6 Tops wow fadeInUp" data-wow-delay="0.6s" key={ind}>
                                <div className="shop-card">
                                    <div className="dz-media">
                                        <img src={item.image} alt="" />
                                        <div className="shop-meta">
                                            <Link to={"#"} className="btn btn-secondary btn-md btn-rounded"
                                                onClick={() => dispatch({ type: 'SET_SELECTED_ITEM', item })}>
                                                <i className="fa-solid fa-eye d-md-none d-block" />
                                                <span className="d-md-block d-none">Quick View</span>
                                            </Link>
                                            <div className={`btn btn-primary meta-icon dz-wishicon ${state.heartIcon[ind] ? "active" : ""}`}
                                                onClick={() => toggleHeart(ind)}>
                                                <i className="icon feather icon-heart dz-heart" />
                                                <i className="icon feather icon-heart-on dz-heart-fill" />
                                            </div>
                                            <div className={`btn btn-primary meta-icon dz-carticon ${state.basketIcon[ind] ? "active" : ""}`}
                                                onClick={() => toggleBasket(ind)}>
                                                <i className="flaticon flaticon-basket" />
                                                <i className="flaticon flaticon-basket-on dz-heart-fill" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="dz-content">
                                        <h5 className="title"><Link to={item._id ? buildProductUrl({ slug: item.slug, _id: item._id, primaryCategory: item.primaryCategory }) : "/shop"}>{item.name}</Link></h5>
                                        <h5 className="price">{formatPrice(item.priceRange ? item.priceRange.min : item.price)}</h5>
                                    </div>
                                    {item.onSale && (
                                        <div className="product-tag">
                                            <span className="badge">Get {item.discountPercent}% Off</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </ul>
                )}
            </div>

            <Modal className="quick-view-modal" show={state.detailModal} onHide={handleHide} centered>
                <button type="button" className="btn-close" onClick={handleHide}>
                    <i className="icon feather icon-x" />
                </button>
                <div className="modal-body">
                    <div className="row g-xl-4 g-3">
                        <div className="col-xl-6 col-md-6">
                            <div className="dz-product-detail mb-0">
                                <ModalSlider images={state.selectedItem?.image ? [state.selectedItem.image] : undefined} />
                            </div>
                        </div>
                        <div className="col-xl-6 col-md-6">
                            <BasicModalData product={state.selectedItem ? {
                                id: state.selectedItem._id ?? state.selectedItem.id,
                                name: state.selectedItem.name,
                                price: formatPrice(state.selectedItem.price),
                                image: state.selectedItem.image,
                            } : undefined} />
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default ProductSection;
