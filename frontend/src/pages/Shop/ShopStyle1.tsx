import { Link } from "react-router-dom";
import CommanBanner from "../../components/CommanBanner";
import IMAGES from "../../constant/theme";
import { shopStyleData } from "../../constant/Alldata";
import ShopGridCard from "../../elements/Shop/ShopGridCard";
import BasicModalData from "../../components/BasicModalData";
import ModalSlider from "../../components/ModalSlider";
import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import api from "../../lib/api";
import { useCurrency } from "../../context/CurrencyContext";
import { getPriceRange } from "../../lib/productPricing";



export default function ShopStyle1(){
    const { formatPrice } = useCurrency();
    const  [detailModal, setDetailModal] = useState<boolean>(false)
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [products, setProducts] = useState(shopStyleData)

    useEffect(() => {
        api.get('/products?status=publish&limit=100')
            .then(({ data }) => {
                const items = Array.isArray(data) ? data : data.products || []
                if (items.length > 0) {
                    setProducts(items.map((p: any, i: number) => ({
                        _id: p._id,
                        slug: p.slug,
                        image: p.images?.[0]?.src || '',
                        name: p.name,
                        price: formatPrice(getPriceRange(p).min),
                        inputtype: `fav_${p._id || i}`,
                    })))
                }
            })
            .catch(() => {})
    }, [])

    return(
        <div className="page-content bg-light">
            <CommanBanner mainText="Shop Style 1" parentText="Home" currentText="Shop Style 1" image={IMAGES.BackBg1}/>
            <section className="content-inner-1 z-index-unset">
                <div className="container">
                    <div className="row m-auto gx-xl-4 g-3 mb-xl-0 mb-md-0 mb-3">
                        {products.map((item, index)=>(
                            <div className="col-6 col-xl-4 col-lg-4 col-md-4 col-sm-6 m-md-b15 m-sm-b0 m-b30" key={index}>
                                <ShopGridCard id={(item as any)._id} slug={(item as any).slug} image={item.image} title={item.name} price={item.price} showdetailModal={(p) => { setSelectedProduct(p || null); setDetailModal(true); }}/>
                            </div>
                        ))}                       
                    </div>
                    <div className="row page mt-0">
                        <div className="col-md-6">
                            <p className="page-text">Showing 1–5 Of 50 Results</p>
                        </div>
                        <div className="col-md-6">
                            <nav aria-label="Blog Pagination">
                                <ul className="pagination style-1">
                                    <li className="page-item"><Link className="page-link active" to={"#"}>1</Link></li>
                                    <li className="page-item"><Link className="page-link" to={"#"}>2</Link></li>
                                    <li className="page-item"><Link className="page-link" to={"#"}>3</Link></li>
                                    <li className="page-item"><Link className="page-link next" to={"#"}>Next</Link></li>
                                </ul>
                            </nav>
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
