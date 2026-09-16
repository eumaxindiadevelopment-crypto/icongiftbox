import { Link } from "react-router-dom";
import CommanBanner from "../../components/CommanBanner";
import IMAGES from "../../constant/theme";
import { useState, useEffect } from "react";
import api from "../../lib/api";
import { useCurrency } from "../../context/CurrencyContext";
import { getPriceRange } from "../../lib/productPricing";

interface shirtStyletype{
    image: string;
    name: string;
    price?: string;
}

const shirtStyleData : shirtStyletype[] = [
    { image : IMAGES.ShartShop1, name:'Printed Spread Collar Casual Shirt', price: '₹80'},
    { image : IMAGES.ShartShop2, name:'Checkered Slim Collar Casual Shirt', price: '₹80'},
    { image : IMAGES.ShartShop3, name:'Solid Cut Away Collar Casual Shirt', price: '₹80'},
    { image : IMAGES.ShartShop4, name:'Printed Spread Collar Casual Shirt', price: '₹80'},
    { image : IMAGES.ShartShop5, name:'Checkered Spread Collar Casual Shirt', price: '₹80'},
];

export default function ShopStyle2(){
    const { formatPrice } = useCurrency();
    const [products, setProducts] = useState<shirtStyletype[]>(
        shirtStyleData.map(s => ({ ...s, price: formatPrice(80) }))
    )

    useEffect(() => {
        api.get('/products?status=publish&limit=100')
            .then(({ data }) => {
                const items = Array.isArray(data) ? data : data.products || []
                if (items.length > 0) {
                    setProducts(items.map((p: any) => ({
                        image: p.images?.[0]?.src || '',
                        name: p.name,
                        price: formatPrice(getPriceRange(p).min),
                    })))
                }
            })
            .catch(() => {})
    }, [])

    return(
        <div className="page-content bg-light">
            <CommanBanner mainText="Shop Style 2" parentText="Home" currentText="Shop Style 2" image={IMAGES.BackBg1}/>
            <section className="content-inner-1">
                <div className="container">
                    <div className="row m-auto gx-xl-4 g-3 mb-xl-0 mb-md-0 mb-3 justify-content-center">
                        {products.map((item, index)=>(
                            <div className=" col-xl-4 col-lg-4 col-md-4 col-sm-6 m-md-b50 m-sm-b0 m-b70" key={index}>
                                <div className="shop-card style-2 ">
                                    <div className="dz-media">
                                        <img src={item.image} alt="shop" />
                                    </div>
                                    <div className="dz-content">
                                        <div>
                                            <span className="sale-title">up to 79% off</span>
                                            <h5 className="title"><Link to="/shop-list">{item.name}</Link></h5>
                                        </div>
                                        <h6 className="price">
                                            {item.price}
                                        </h6>
                                    </div>
                                </div>
                            </div>
                        ))}                       
                    </div>
                </div>
            </section>
        </div>
    )
}