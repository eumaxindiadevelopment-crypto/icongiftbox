import { Link, useParams } from "react-router-dom";
import ProductDefaultSlider from "../../elements/Shop/ProductDefaultSlider";
import ProductDescription from "../../elements/Shop/ProductDescription";
import ShopProductRightContent, { Product, Variation } from "../../elements/Shop/ShopProductRightContent";
import TrandingSlider from "../../elements/Shop/TrandingSlider";
import Breadcrumbs from "../../components/Breadcrumbs";
import NotFound from "../NotFound";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import ModalSlider from "../../components/ModalSlider";
import BasicModalData from "../../components/BasicModalData";
import { fetchProduct } from "../../lib/api";
import { buildProductUrl, buildCategoryUrl } from "../../lib/seoUrl";
import { Spinner } from "react-bootstrap";

export default function ShopProductDefault(){
    const  [detailModal, setDetailModal] = useState<boolean>(false)
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    // Three route shapes point here: legacy /product/:id, and the new SEO
    // /:slug1/:slug2 (top-level category) / /:slug1/:slug2/:slug3 (subcategory)
    // — whichever matched, the last segment is always the product identifier.
    const { id, slug1, slug2, slug3 } = useParams();
    const identifier = slug3 || slug2 || id;
    const isSeoUrl = !!(slug1 && slug2);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(!!identifier);
    const [activeVariation, setActiveVariation] = useState<Variation | null>(null);
    const [selected, setSelected] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!identifier) return;
        setLoading(true);
        fetchProduct(identifier)
            .then(setProduct)
            .catch(() => setProduct(null))
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [identifier]);

    const displayProduct: Product = product || {
        _id: 'demo',
        name: 'Curly Girl Beautiful Dress',
        price: 40,
        regularPrice: 50,
        onSale: true,
        sku: 'PRT584E63A',
        shortDescription: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
        stockQuantity: 25,
        type: 'simple',
        images: [],
    };

    if (identifier && loading) {
        return <div className="d-flex justify-content-center py-5"><Spinner animation="border" /></div>;
    }
    if (identifier && !product) {
        return <div className="text-center py-5"><h5>Product not found</h5><Link to="/shop-sidebar">Back to shop</Link></div>;
    }

    // On the SEO URL shapes, confirm the category segment(s) in the path
    // actually match this product's real category chain — otherwise a URL
    // like /wrong-category/real-product-slug would "succeed" with a
    // misleading breadcrumb instead of 404ing. Which segment is "the
    // category" depends on which route matched: on the 3-segment route
    // slug2 is the category (slug3 is the product); on the 2-segment route
    // slug1 is the category (slug2 is the product).
    if (isSeoUrl && product) {
        const cat = product.primaryCategory;
        const categorySlugInUrl = slug3 ? slug2 : slug1;
        const categoryMatches = !!cat?.slug && cat.slug === categorySlugInUrl;
        // A 3-segment URL must match the category's real parent; a
        // 2-segment URL implies the category has no parent at all.
        const parentMatches = slug3 ? cat?.parent?.slug === slug1 : !cat?.parent;
        if (!categoryMatches || !parentMatches) {
            return <NotFound />;
        }
    }

    const baseImages = displayProduct.images?.map(img => img.src) || [];
    const galleryImages = activeVariation?.images?.length
        ? activeVariation.images.map(img => img.src)
        : baseImages;

    const cat = displayProduct.primaryCategory;
    const breadcrumbItems = [
        ...(cat?.parent?.slug ? [{ label: cat.parent.name || cat.parent.slug, href: buildCategoryUrl(cat.parent) }] : []),
        ...(cat?.slug ? [{ label: cat.name || cat.slug, href: buildCategoryUrl(cat) }] : []),
        { label: displayProduct.name },
    ];

    return(
        <>
            <div className="page-content bg-light">
                <Breadcrumbs items={breadcrumbItems} />
                <link rel="canonical" href={`${typeof window !== 'undefined' ? window.location.origin : ''}${buildProductUrl(displayProduct)}`} />
                <section className="content-inner py-0">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-xl-4 col-md-4">
                                <div className="dz-product-detail sticky-top">
                                    <ProductDefaultSlider key={activeVariation?._id ?? 'default'} images={galleryImages} />
                                </div>
                            </div>
                            <div className="col-xl-8 col-md-8">
                                <ShopProductRightContent product={displayProduct} selected={selected} onSelect={setSelected} onVariationChange={setActiveVariation} />
                            </div>
                        </div>
                    </div>
                </section>
                <section className="content-inner-3 pb-0"> 
                    <div className="container">
                        <div className="product-description">
                            <ProductDescription productId={displayProduct._id} />
                        </div>
                    </div>
                </section>
                <section className="content-inner-1  overflow-hidden">
                    <div className="container">
                        <div className="section-head style-2 d-md-flex justify-content-between align-items-center">
                            <div className="left-content">
                                <h2 className="title mb-0">Related products</h2>
                            </div>
                            <Link to="/shop-list" className="text-secondary font-14 d-flex align-items-center gap-1">See all products
                                <i className="icon feather icon-chevron-right font-18" />
                            </Link>			
                        </div>
                        <div className="swiper-btn-center-lr">
                            <TrandingSlider 
                                showdetailModal={(p) => { setSelectedProduct(p || null); setDetailModal(true); }}
                            />
                            <div className="pagination-align">
                                <div className="tranding-button-prev btn-prev">
                                    <i className="flaticon flaticon-left-chevron" />
                                </div>
                                <div className="tranding-button-next btn-next">
                                    <i className="flaticon flaticon-chevron" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
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
        </>
    )
}

