import { Link } from "react-router-dom";
import ShopSidebar from "../elements/Shop/ShopSidebar";
import { buildCategoryUrl } from "../lib/seoUrl";

export default function HeaderSidbar(){
    return(
        <div className="product-description">
            <ShopSidebar buildCategoryHref={(category) => category ? buildCategoryUrl(category) : "/shop"} />
            <Link to="#" className="btn btn-sm font-14 btn-secondary btn-sharp">RESET</Link>
        </div>
    )
}