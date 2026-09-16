import { Link } from "react-router-dom";
import CommanBanner from "../../components/CommanBanner";
import { tabList } from "../../constant/Alldata";
import IMAGES from "../../constant/theme";
import { useEffect, useRef, useState } from "react";

import Isotope from "isotope-layout";
import imagesLoaded from "imagesloaded";

interface CollageStyleType{
    image:string;
    name: string;
    filter : string;
    category : string;
    coloumStyle : string;
}
const CollageStyleBlog : CollageStyleType[]= [
    {coloumStyle: "col-xl-3 col-lg-3 col-md-6 col-sm-6 order-lg-3 order-4", filter : 'Outerwear', image : IMAGES.Portfolio4Pic3, name:'Suede Ankle Booties Collection', category:"Collection"},
    {coloumStyle: "col-xl-6 col-lg-6", filter : 'Dresses', image : IMAGES.Portfolio4Pic4, name:'Sophisticated Swagger Suit', category:"Suit"},
    {coloumStyle: "col-xl-3 col-lg-3 col-md-6 col-sm-6", filter : 'Outerwear', image : IMAGES.Portfolio4Pic5, name:'Comfy Lounge Jogger Pants', category:"Pants"},    
    {coloumStyle: "col-xl-3 col-lg-3 col-md-6 col-sm-6", filter : 'Tops', image : IMAGES.Portfolio4Pic6, name:'Hiking Outdoor Gear Collection', category:"Collection"},
    {coloumStyle: "col-xl-3 col-lg-3 col-md-6 col-sm-6", filter : 'Tops Jacket', image : IMAGES.Portfolio4Pic7, name:'Athletic Mesh Sports Leggings', category:"Leggings"},
    {coloumStyle: "col-xl-3 col-lg-3 col-md-6 col-sm-6", filter : 'Tops Jacket', image : IMAGES.Portfolio4Pic8, name:'Vintage Denim Overalls Shorts', category:"Shorts"},
    {coloumStyle: "col-xl-3 col-lg-3 col-md-6 col-sm-6", filter : 'Formal-wear', image : IMAGES.Portfolio4Pic9, name:'Plaid Wool Winter Coat', category:"Coat"},
    {coloumStyle: "col-xl-6 col-lg-6 col-md-12 col-sm-12", filter : 'Tops Outerwear', image : IMAGES.Portfolio4Pic1, name:'Plaid Wool Winter Coat', category:"Coat"},
    {coloumStyle: "col-xl-6 col-lg-6 col-md-12 col-sm-12", filter : 'Dresses', image : IMAGES.Portfolio4Pic2, name:'Vintage Denim Overalls Shorts', category:"Shorts"},
]

export default function CollageStyleTwo(){
    const [currentFilter, setCurrentFilter] = useState<string | undefined>("*");
    const isotopContainer = useRef<HTMLUListElement | null>(null);
    const isotopeInstance = useRef<Isotope | null>(null);

    const initIsotope = () => {
        if (isotopContainer.current) {        
            isotopeInstance.current = new Isotope(isotopContainer.current, {
                itemSelector: ".card-container",
                layoutMode: "masonry",
            });
            imagesLoaded(isotopContainer.current).on("progress", () => {
                isotopeInstance.current?.layout();
            });
        }
    };

    const updateCategory = (val: string | undefined): void => {
        setCurrentFilter(val);        
        isotopeInstance.current?.arrange({
            filter: val,
        });
    };

    useEffect(() => {
        initIsotope();
        return () => {
            isotopeInstance.current?.destroy();
            isotopeInstance.current = null;
        };
    }, []);
    return(
        <div className="page-content bg-light">
            <CommanBanner currentText="Collage Style 2" parentText="Home" mainText="Collage Style 2" image={IMAGES.BackBg1}/>
            <section className="content-inner pt-0 z-index-unset">
                <div className="site-filters style-2 clearfix center">
                    <ul className="filters" data-bs-toggle="buttons">
                        {tabList.map((item, ind)=>(
                            <li  data-filter={item.filter} className={`btn ${ currentFilter == item.filter ? "active" : ""}`} key={ind}
                                onClick={() => updateCategory(item.filter)}
                            >
                                <Link to={"#"}>{item.name}</Link> 
                            </li>
                        ))}    
                    </ul>
                </div>
                <div className="container">
				    <div className="clearfix">
                        <ul id="masonry" className="lightgallery row" data-masonry='{"percentPosition": true}'
                            ref={isotopContainer}
                        >
                            {CollageStyleBlog.map((elem, ind)=>(
                                <li className={`card-container m-b30 All ${elem.coloumStyle} ${elem.filter}`} key={ind}>
                                    <div className="portfolio-box style-2">
                                        <div className="dz-media">
                                            <Link to="/portfolio-details-1">
                                                <img src={elem.image} alt="/" />
                                            </Link>
                                        </div>
                                        <div className="dz-content">
                                            <div className="product-tag">
                                                <Link to="/portfolio-details-1">
                                                    <span className="badge badge-secondary">{elem.category}</span>
                                                </Link>	
                                            </div>
                                            <h4 className="title"><Link to="/portfolio-details-1">{elem.name}</Link></h4>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>    
                    </div>
                </div>
            </section>
        </div>
    )
}