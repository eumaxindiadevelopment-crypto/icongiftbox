import { Link } from "react-router-dom";
import CommanBanner from "../../components/CommanBanner";
import { ShopProductItem } from "../../constant/Alldata";
import IMAGES from "../../constant/theme";
import { useState } from "react";
import { useCurrency } from "../../context/CurrencyContext";

export default function ShopWishlist(){
    const { formatPrice } = useCurrency();
    const [listItem, setListItem] = useState(ShopProductItem);
    function handleDelete(e : number) {
        let filteredArray = listItem.filter((_, index) => index !== e)
        setListItem(filteredArray);
    }
   
    return(
        <div className="page-content bg-light">
            <CommanBanner parentText="Home" currentText="Wishlist" mainText="Wishlist" image={IMAGES.BackBg1} />
            <div className="content-inner-1">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-9">
                            <div className="table-responsive">
                                <table className="table check-tbl style-1">
                                    <thead>
                                        <tr>                                            
                                            <th>Product</th>
                                            <th></th>
                                            <th>Price</th>
                                            <th>Stock</th>
                                            <th></th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {listItem.map((elem, ind)=>(
                                            <tr key={ind}>
                                                <td className="product-item-img"><img src={elem.image} alt="/" /></td>
                                                <td className="product-item-name">{elem.title}</td>
                                                <td className="product-item-price"><span>{formatPrice(elem.price)}</span><strong>{formatPrice(elem.cutprice)}</strong></td>
                                                <td className="product-item-stock">In Stock</td>
                                                <td className="product-item-totle"><Link to="/cart" className="btn btn-secondary btnhover text-nowrap">Add To Cart</Link></td>
                                                <td className="product-item-close"><Link to="#" onClick={()=>handleDelete(ind)}><i className="ti-close"/></Link></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}