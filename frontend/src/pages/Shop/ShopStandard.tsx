import { Modal, Nav, Tab } from "react-bootstrap";
import IMAGES, { SVGICON } from "../../constant/theme";
import ShopSidebar from "../../elements/Shop/ShopSidebar";
import ShopGridCard from "../../elements/Shop/ShopGridCard";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import SelectBoxOne from "../../elements/Shop/SelectBoxOne";
import { useState, useEffect, useMemo } from "react";
import ModalSlider from "../../components/ModalSlider";
import BasicModalData from "../../components/BasicModalData";
import Breadcrumbs from "../../components/Breadcrumbs";
import NotFound from "../NotFound";
import { fetchCategory, fetchProducts } from "../../lib/api";
import { useCurrency } from "../../context/CurrencyContext";
import { getPriceRange } from "../../lib/productPricing";
import { buildCategoryUrl, type CategoryRef } from "../../lib/seoUrl";

const PAGE_SIZE = 12;


export const TabData = ()=>{
    return(
        <Nav as="ul">
            <Nav.Item as="li" role="presentation">
                <Nav.Link eventKey={"Coloumn"}>
                    <svg xmlns="http://www.w3.org/2000/svg"  version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 512 512"   width="512" height="512"                                                            
                        dangerouslySetInnerHTML={{__html: SVGICON.ColoumnSvg}}
                    >
                    </svg>
                </Nav.Link>
            </Nav.Item>
            <Nav.Item as="li" role="presentation">
                <Nav.Link eventKey={"Grid"}>
                    <svg xmlns="http://www.w3.org/2000/svg"  version="1.1" id="Capa_2" x="0px" y="0px" viewBox="0 0 512 512"  width="512" height="512"
                        dangerouslySetInnerHTML={{__html : SVGICON.GridSvg}}
                    >                                                            
                    </svg>
                </Nav.Link>
            </Nav.Item>
        </Nav>
    )
}

type ShopStandardProps = {
    // Set by SeoUrlLevel2 when it has resolved a /:slug1/:slug2 URL to a
    // subcategory page — bypasses this component's own useParams() lookup,
    // since that route's params are named slug1/slug2, not categorySlug/parentSlug.
    categorySlugOverride?: string;
    parentSlugOverride?: string;
};

export default function ShopStandard({ categorySlugOverride, parentSlugOverride }: ShopStandardProps = {}){
    const { formatPrice } = useCurrency();
    const  [detailModal, setDetailModal] = useState<boolean>(false)
    const [selectedProduct, setSelectedProduct] = useState<any>(null)

    // Category comes from the URL path (SEO slug); every other filter lives in the
    // query string. Together they fully describe the page — refresh, back/forward,
    // and copy-pasting the URL all just work without any extra state to rehydrate.
    // `parentSlug` is only present on the /category/:parentSlug/:categorySlug route
    // (and via parentSlugOverride on the resolved /:slug1/:slug2 route).
    const params = useParams<{ categorySlug?: string; parentSlug?: string }>();
    const categorySlug = categorySlugOverride ?? params.categorySlug ?? null;
    const parentSlug = parentSlugOverride ?? params.parentSlug ?? null;
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const selectedTags = useMemo(
        () => searchParams.get("tags")?.split(",").filter(Boolean) ?? [],
        [searchParams]
    );
    const selectedBrands = useMemo(
        () => searchParams.get("brand")?.split(",").filter(Boolean) ?? [],
        [searchParams]
    );
    const search = searchParams.get("q") ?? "";
    const selectedColor = searchParams.get("color");
    const selectedSize = searchParams.get("size");
    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");
    // Independent so an open-ended bucket like "Above ₹5,000" (min set, no max)
    // still applies — requiring both would silently drop a min-only filter.
    const selectedMinPrice = minPriceParam ? +minPriceParam : null;
    const selectedMaxPrice = maxPriceParam ? +maxPriceParam : null;
    const page = Math.max(1, +(searchParams.get("page") ?? "1"));

    const [categoryMeta, setCategoryMeta] = useState<{ name: string; slug: string; parent?: { _id: string; name: string; slug: string } | null } | null>(null);
    const [categoryLoaded, setCategoryLoaded] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);

    // Updates the query string in place (used by every filter control except category,
    // which navigates instead since it's part of the path). Clears `page` on any
    // filter change so a stale page number from a larger result set can't strand the user.
    function updateParams(patch: Record<string, string | null>, opts: { resetPage?: boolean } = { resetPage: true }){
        const next = new URLSearchParams(searchParams);
        Object.entries(patch).forEach(([key, value]) => {
            if (value === null || value === "") next.delete(key);
            else next.set(key, value);
        });
        if (opts.resetPage) next.delete("page");
        setSearchParams(next);
    }

    function buildCategoryHref(category: CategoryRef | null): string {
        const qs = searchParams.toString();
        const path = category ? buildCategoryUrl(category) : "/shop";
        return qs ? `${path}?${qs}` : path;
    }

    useEffect(() => {
        if (!categorySlug) { setCategoryMeta(null); setCategoryLoaded(true); return; }
        setCategoryLoaded(false);
        fetchCategory(categorySlug)
            .then(setCategoryMeta)
            .catch(() => setCategoryMeta(null))
            .finally(() => setCategoryLoaded(true));
    }, [categorySlug]);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            const params: Record<string, string> = { status: "publish", limit: String(PAGE_SIZE), page: String(page) };
            if (categorySlug) params.category = categorySlug;
            if (selectedTags.length) params.tags = selectedTags.join(",");
            if (search) params.search = search;
            if (minPriceParam) params.minPrice = minPriceParam;
            if (maxPriceParam) params.maxPrice = maxPriceParam;
            if (selectedColor) params.color = selectedColor;
            if (selectedSize) params.size = selectedSize;
            if (selectedBrands.length) params.brand = selectedBrands.join(",");
            fetchProducts(params)
                .then((data) => {
                    const items = Array.isArray(data) ? data : data.products || []
                    setProducts(items.map((p: any, i: number) => {
                        // `price` is 0 on some synced products where only salePrice/regularPrice
                        // were populated — fall back so the card never shows ₹0 for an item that
                        // actually has a real price.
                        const effectivePrice = p.price || p.salePrice || p.regularPrice || 0
                        return {
                            _id: p._id,
                            slug: p.slug,
                            image: p.images?.[0]?.src || '',
                            name: p.name,
                            price: formatPrice(getPriceRange(p).min),
                            priceNum: effectivePrice,
                            primaryCategory: p.primaryCategory,
                            regularPrice: p.regularPrice || 0,
                            onSale: !!p.onSale,
                            shortDescription: p.shortDescription || '',
                            inputtype: `fav_${p._id || i}`,
                        }
                    }))
                    setTotal(data.total ?? items.length);
                    setPages(data.pages ?? 1);
                })
                .catch(() => { setProducts([]); setTotal(0); setPages(1); })
                .finally(() => setLoading(false));
        }, 300);
        return () => clearTimeout(timer);
        // searchParams.toString() collapses the whole query string to one comparable
        // value so this effect re-runs exactly once per actual filter change.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categorySlug, searchParams.toString()])

    function toggleTag(tag: string){
        const next = selectedTags.includes(tag) ? selectedTags.filter(t => t !== tag) : [...selectedTags, tag];
        updateParams({ tags: next.length ? next.join(",") : null });
    }

    function toggleBrand(brandSlug: string){
        const next = selectedBrands.includes(brandSlug) ? selectedBrands.filter(b => b !== brandSlug) : [...selectedBrands, brandSlug];
        updateParams({ brand: next.length ? next.join(",") : null });
    }

    function resetAll(){
        setSearchParams({});
        if (categorySlug) navigate("/shop");
    }

    // On the /category/:parentSlug/:categorySlug route, confirm the category
    // actually has that parent — otherwise a mismatched URL would "succeed"
    // with a misleading page instead of 404ing.
    if (categoryLoaded && categorySlug) {
        if (!categoryMeta) return <NotFound />;
        const parentMatches = parentSlug ? categoryMeta.parent?.slug === parentSlug : !categoryMeta.parent;
        if (!parentMatches) return <NotFound />;
    }

    const categoryName = categoryMeta?.name ?? categorySlug ?? null;
    const canonicalPath = categoryMeta ? buildCategoryUrl(categoryMeta) : "/shop";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const collectionPageJsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: categoryName ?? "Shop",
        url: `${origin}${canonicalPath}`,
        numberOfItems: total,
    };
    // Category pages skip the "Shop" crumb entirely (Home > Category), while
    // the plain /shop listing still shows "Shop" as the current page.
    const breadcrumbItems = categoryName
        ? [
            ...(categoryMeta?.parent?.slug ? [{ label: categoryMeta.parent.name, href: buildCategoryUrl(categoryMeta.parent) }] : []),
            { label: categoryName },
        ]
        : [{ label: "Shop" }];

    return(
        <div className="page-content bg-light">
            <link rel="canonical" href={`${origin}${canonicalPath}`} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }} />
            <div className="dz-bnr-inr bg-secondary overlay-black-light" style={{ backgroundImage: `url(${IMAGES.BackBg1})` }}>
                <div className="container">
                    <div className="dz-bnr-inr-entry">
                        <h1>{categoryName ?? "Shop Standard"}</h1>
                    </div>
                </div>
            </div>
            <Breadcrumbs items={breadcrumbItems} />
            <section className="content-inner-3 pt-3 z-index-unset">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-20 col-xl-3">
                            <div className="sticky-xl-top">
                                <Link to={"#"} className="panel-close-btn">																	
                                    <svg width="35" height="35" viewBox="0 0 51 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M37.748 12.5L12.748 37.5" stroke="white" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M12.748 12.5L37.748 37.5" stroke="white" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </Link>
                                <div className="shop-filter mt-xl-2 mt-0">
                                    <aside>
                                        <div className="d-flex align-items-center justify-content-between m-b30">
                                            <h6 className="title mb-0 fw-normal d-flex">
                                                <i className="flaticon-filter me-3"/>
                                                Filter
                                            </h6>
                                        </div>
                                        <ShopSidebar
                                            selectedCategorySlug={categorySlug}
                                            selectedTags={selectedTags}
                                            selectedColor={selectedColor}
                                            selectedSize={selectedSize}
                                            selectedMinPrice={selectedMinPrice}
                                            selectedMaxPrice={selectedMaxPrice}
                                            selectedBrands={selectedBrands}
                                            buildCategoryHref={buildCategoryHref}
                                            onTagToggle={toggleTag}
                                            onSearchChange={(q) => updateParams({ q: q || null })}
                                            onPriceChange={(min, max) => updateParams({ minPrice: String(min), maxPrice: max === null ? null : String(max) })}
                                            onColorChange={(color) => updateParams({ color })}
                                            onSizeChange={(size) => updateParams({ size })}
                                            onBrandToggle={toggleBrand}
                                        />
                                        <Link to="#" className="btn btn-sm font-14 btn-secondary btn-sharp"
                                            onClick={(e) => { e.preventDefault(); resetAll(); }}>
                                            RESET
                                        </Link>
                                    </aside>
                                </div>
                            </div>
                        </div>
                        <div className="col-80 col-xl-9">
                            <Tab.Container defaultActiveKey={'Grid'}>
                                <div className="filter-wrapper">
                                    <div className="filter-left-area">								
                                        <ul className="filter-tag">
                                            {categoryName && (
                                                <li>
                                                    <Link to={buildCategoryHref(null)} className="tag-btn">
                                                        {categoryName}
                                                        <i className="icon feather icon-x tag-close"/>
                                                    </Link>
                                                </li>
                                            )}
                                            {selectedTags.map((tag) => (
                                                <li key={tag}>
                                                    <Link to={"#"} className="tag-btn" onClick={(e)=>{e.preventDefault(); toggleTag(tag);}}>
                                                        {tag}
                                                        <i className="icon feather icon-x tag-close"/>
                                                    </Link>
                                                </li>
                                            ))}
                                            {selectedColor && (
                                                <li>
                                                    <Link to={"#"} className="tag-btn" onClick={(e)=>{e.preventDefault(); updateParams({ color: null });}}>
                                                        {selectedColor}
                                                        <i className="icon feather icon-x tag-close"/>
                                                    </Link>
                                                </li>
                                            )}
                                            {selectedSize && (
                                                <li>
                                                    <Link to={"#"} className="tag-btn" onClick={(e)=>{e.preventDefault(); updateParams({ size: null });}}>
                                                        {selectedSize}
                                                        <i className="icon feather icon-x tag-close"/>
                                                    </Link>
                                                </li>
                                            )}
                                            {selectedBrands.map((brandSlug) => (
                                                <li key={brandSlug}>
                                                    <Link to={"#"} className="tag-btn" onClick={(e)=>{e.preventDefault(); toggleBrand(brandSlug);}}>
                                                        {brandSlug}
                                                        <i className="icon feather icon-x tag-close"/>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                        <span>{loading ? "Loading…" : `Showing ${products.length} Of ${total} Results`}</span>
                                    </div>
                                    <div className="filter-right-area">
                                        <Link to={"#"} className="panel-btn me-2">
                                            <svg className="me-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" width="20" height="20"><g id="Layer_28" data-name="Layer 28"><path d="M2.54,5H15v.5A1.5,1.5,0,0,0,16.5,7h2A1.5,1.5,0,0,0,20,5.5V5h2.33a.5.5,0,0,0,0-1H20V3.5A1.5,1.5,0,0,0,18.5,2h-2A1.5,1.5,0,0,0,15,3.5V4H2.54a.5.5,0,0,0,0,1ZM16,3.5a.5.5,0,0,1,.5-.5h2a.5.5,0,0,1,.5.5v2a.5.5,0,0,1-.5.5h-2a.5.5,0,0,1-.5-.5Z"></path><path d="M22.4,20H18v-.5A1.5,1.5,0,0,0,16.5,18h-2A1.5,1.5,0,0,0,13,19.5V20H2.55a.5.5,0,0,0,0,1H13v.5A1.5,1.5,0,0,0,14.5,23h2A1.5,1.5,0,0,0,18,21.5V21h4.4a.5.5,0,0,0,0-1ZM17,21.5a.5.5,0,0,1-.5.5h-2a.5.5,0,0,1-.5-.5v-2a.5.5,0,0,1,.5-.5h2a.5.5,0,0,1,.5.5Z"></path><path d="M8.5,15h2A1.5,1.5,0,0,0,12,13.5V13H22.45a.5.5,0,1,0,0-1H12v-.5A1.5,1.5,0,0,0,10.5,10h-2A1.5,1.5,0,0,0,7,11.5V12H2.6a.5.5,0,1,0,0,1H7v.5A1.5,1.5,0,0,0,8.5,15ZM8,11.5a.5.5,0,0,1,.5-.5h2a.5.5,0,0,1,.5.5v2a.5.5,0,0,1-.5.5h-2a.5.5,0,0,1-.5-.5Z"></path></g></svg>
                                            Filter
                                        </Link>
                                        <div className="form-group">
                                            <SelectBoxOne />
                                        </div>                                        
                                        {/* <div className="form-group Category">
                                            <SelectBoxTwo />                                           
                                        </div>  */}
                                        <div className="shop-tab">
                                            <TabData />
                                        </div>
                                    </div>
                                </div>                                
                                <div className="row">
                                    <Tab.Content className="col-12 tab-content shop-" id="pills-tabContent">
                                        <Tab.Pane  eventKey={"Coloumn"}>
                                            <div className="row gx-xl-4 g-3 mb-xl-0 mb-md-0 mb-3">
                                                {products.map((item, ind)=>(
                                                    <div className="col-6 col-xl-4 col-lg-6 col-md-6 col-sm-6 m-md-b15 m-sm-b0 m-b30" key={ind}>
                                                        <ShopGridCard id={(item as any)._id} slug={(item as any).slug} image={item.image} title={item.name} price={item.price} priceNum={(item as any).priceNum} regularPrice={(item as any).regularPrice} onSale={(item as any).onSale} primaryCategory={(item as any).primaryCategory}/>
                                                    </div>
                                                ))}
                                            </div>
                                        </Tab.Pane>
                                        <Tab.Pane  eventKey={"Grid"} aria-labelledby="tab-list-grid-btn">
                                            <div className="row gx-xl-4 g-3">
                                                {products.map((item, ind)=>(
                                                    <div className="col-6 col-xl-3 col-lg-4 col-md-4 col-sm-6 m-md-b15 m-b30" key={ind}>
                                                        <ShopGridCard id={(item as any)._id} slug={(item as any).slug} image={item.image} title={item.name} price={item.price} priceNum={(item as any).priceNum} regularPrice={(item as any).regularPrice} onSale={(item as any).onSale} primaryCategory={(item as any).primaryCategory} shortDescription={(item as any).shortDescription} showdetailModal={(p) => { setSelectedProduct(p || null); setDetailModal(true); }}/>
                                                    </div>
                                                ))}
                                            </div>
                                        </Tab.Pane>
                                    </Tab.Content>
                                </div>
                            </Tab.Container>
                            <div className="row page mt-0">
                                <div className="col-md-6">
                                    <p className="page-text">{loading ? "Loading…" : `Showing ${(page - 1) * PAGE_SIZE + (products.length ? 1 : 0)}–${(page - 1) * PAGE_SIZE + products.length} of ${total} Results`}</p>
                                </div>
                                <div className="col-md-6">
                                    <nav aria-label="Shop Pagination">
                                        <ul className="pagination style-1">
                                            <li className={`page-item${page <= 1 ? " disabled" : ""}`}>
                                                <button type="button" className="page-link" disabled={page <= 1}
                                                    onClick={() => updateParams({ page: String(page - 1) }, { resetPage: false })}>
                                                    Prev
                                                </button>
                                            </li>
                                            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                                                <li className={`page-item${n === page ? " active" : ""}`} key={n}>
                                                    <button type="button" className="page-link"
                                                        onClick={() => updateParams({ page: String(n) }, { resetPage: false })}>
                                                        {n}
                                                    </button>
                                                </li>
                                            ))}
                                            <li className={`page-item${page >= pages ? " disabled" : ""}`}>
                                                <button type="button" className="page-link" disabled={page >= pages}
                                                    onClick={() => updateParams({ page: String(page + 1) }, { resetPage: false })}>
                                                    Next
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Modal className="quick-view-modal" centered
                show={detailModal} onHide={()=>setDetailModal(false)}
            >                
               
                <button type="button" className="btn-close" onClick={()=>setDetailModal(false)}>
                    <i className="icon feather icon-x"/>
                </button>
                <div className="modal-body">
                    <div className="row g-xl-4 g-3">
                        <div className="col-xl-6 col-md-6">
                            <div className="dz-product-detail mb-0">
                                <div className="swiper-btn-center-lr">
                                    <ModalSlider images={selectedProduct?.image ? [selectedProduct.image] : undefined} />
                                </div>	
                            </div>	
                        </div>
                        <div className="col-xl-6 col-md-6">
                            <BasicModalData product={selectedProduct || undefined} />
                        </div>
                    </div>
                </div>
                               
            </Modal>
        </div>
    )
}
