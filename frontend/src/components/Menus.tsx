import { Link } from "react-router-dom";
import { Fragment, useReducer } from "react";
import { accountMenuItem, CorporateGiftsMenu, menuData4, portfolioMenu, FestiveGiftsMenuItem, EcoFriendlyGiftsMenuItem } from "../constant/Alldata";

interface reduType{
    type : string;        
    index : number;
}

interface stateType {
    home: boolean;
    openMenu: number | null; 
}

const initialState = {
    home: false,
    openMenu: null,
};

const reducer = (state: stateType, action: reduType) => {
    switch (action.type) {
        case 'home':
            return { ...state, home: !state.home };
        case 'toggleMenu':            
            return {
                ...state,
                openMenu: state.openMenu === action.index ? null : action.index,
            };
        default:
            return state;
    }
};
export default function Menus(){    
    const [state, dispatch] = useReducer(reducer, initialState);
       
    return(
        <ul className="nav navbar-nav">
            {/* <li className={`has-mega-menu sub-menu-down auto-width menu-left ${state.openMenu === 0 ? 'open' : ''}`}                
                onClick={() => dispatch({ type: 'toggleMenu', index: 0 })}
            >
                <Link to="#"><span>Home</span><i className="fas fa-chevron-down tabindex" /></Link>
                <div className="mega-menu ">
                    <ul className="demo-menu mb-0">
                        <li>
                            <Link to="/">
                                <img src={IMAGES.demo1} alt="/" />
                                <span className="menu-title">01 Home Page</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/index-2">
                                <img src={IMAGES.demo2} alt="/" />
                                <span className="menu-title">02 Home Page</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/index-3">
                                <img src={IMAGES.demo3} alt="/" />
                                <span className="menu-title">03 Home Page</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </li> */}
          
{/* 
             <li className={`has-mega-menu sub-menu-down auto-width ${state.openMenu === 3 ? "open" : ""}`}
                onClick={() => dispatch({ type: 'toggleMenu', index: 3 })}
            >
                <Link to="#"><span>Corporate Gifts</span><i className="fas fa-chevron-down tabindex"/></Link>
                <div className="mega-menu">
                    <ul>
                        {CorporateGiftsMenu.map((item, index) => (
                            <li key={index}>
                                {
                                    item.mainmenu && item.mainmenu.map((item, ind)=>(
                                        <Fragment key={ind}>
                                            <Link to="#" className="menu-title">{item.title}</Link>
                                            <ul>
                                                {item.subMenu && item.subMenu.map((elem, ind)=>(
                                                    <li key={ind}><Link to={elem.link}>{elem.title}</Link></li>
                                                ))}                                                    
                                            </ul>
                                        </Fragment>
                                    ))    
                                } 
                            </li>
                        ))}    
                    </ul>                   
                </div>
            </li>  */}

             <li className={`sub-menu-down ${state.openMenu === 6 ? "open" : ""}`}
                onClick={() => dispatch({ type: 'toggleMenu', index: 6 })}
            >
                <Link to="/corporate-gifts/"><span>Corporate Gifts</span> <i className="fas fa-chevron-down tabindex"/></Link>
                <ul className="sub-menu">						
                    {CorporateGiftsMenu.map((data,index)=>(
                        <li key={index}><Link to={data.link}>{data.title}</Link></li>
                    ))}                    
                </ul>
            </li>
            
              {/* <li>
                <Link to="/shop"><span>Shop</span></Link>
            </li> */}

            
          <li className={`sub-menu-down ${state.openMenu === 6 ? "open" : ""}`}
                onClick={() => dispatch({ type: 'toggleMenu', index: 6 })}
            >
                <Link to="/festive-gifts/"><span>Festive Gifts</span> <i className="fas fa-chevron-down tabindex"/></Link>
                <ul className="sub-menu">						
                    {FestiveGiftsMenuItem.map((data,index)=>(
                        <li key={index}><Link to={data.url}>{data.name}</Link></li>
                    ))}                    
                </ul>
            </li>

            <li className={`sub-menu-down ${state.openMenu === 6 ? "open" : ""}`}
                onClick={() => dispatch({ type: 'toggleMenu', index: 6 })}
            >
                <Link to="/eco-friendly-gifts/"><span>Eco-Friendly Gifts</span> <i className="fas fa-chevron-down tabindex"/></Link>
                <ul className="sub-menu">						
                    {EcoFriendlyGiftsMenuItem.map((data,index)=>(
                        <li key={index}><Link to={data.url}>{data.name}</Link></li>
                    ))}                    
                </ul>
            </li>


            {/* <li>
                <Link to="/about-us"><span>About Us</span></Link>
            </li> */}
            {/* <li>
                <Link to="/faq"><span>Faq</span></Link>
            </li> */}
             {/* <li>
                <Link to="/blogs"><span>Blog</span></Link>
            </li> */}

            {/* <li className={`has-mega-menu sub-menu-down ${state.openMenu === 4 ? "open" : ""}`}
                onClick={() => dispatch({ type: 'toggleMenu', index: 4 })}
            >
                <Link to="#"><span>Portfolio</span><i className="fas fa-chevron-down tabindex"/></Link>
                <div className="mega-menu portfolio-menu">
                    <ul>
                        <li className="side-left">
                            <ul className="portfolio-nav-link">
                                {portfolioMenu.map((elem , ind)=>(
                                    <li key={ind}>
                                        <Link to={elem.url}>
                                            <img src={elem.image} alt="/" />
                                            <span>{elem.title}</span>
                                        </Link>
                                    </li>
                                ))}                                
                            </ul>
                        </li>
                        <li className="side-right line-left">
                            <Link to="#" className="menu-title">Portfolio Details</Link>
                            <ul>
                                <li><Link to="/portfolio-details-1">Portfolio Details 1</Link></li>
                                <li><Link to="/portfolio-details-2">Portfolio Details 2</Link></li>
                                <li><Link to="/portfolio-details-3">Portfolio Details 3</Link></li>
                                <li><Link to="/portfolio-details-4">Portfolio Details 4</Link></li>
                                <li><Link to="/portfolio-details-5">Portfolio Details 5</Link></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </li> */}

            
             <li className={`has-mega-menu sub-menu-down auto-width ${state.openMenu === 3 ? "open" : ""}`}
                onClick={() => dispatch({ type: 'toggleMenu', index: 3 })}
            >
                <Link to="#"><span>Categories</span><i className="fas fa-chevron-down tabindex"/></Link>
                <div className="mega-menu">
                    <ul>
                        {menuData4.map((item, index) => (
                            <li key={index}>
                                {
                                    item.mainMenu && item.mainMenu.map((item, ind)=>(
                                        <Fragment key={ind}>
                                            <Link to={item.link} className="menu-title">{item.title}</Link>
                                            <ul>
                                                {item.subMenu && item.subMenu.map((elem, ind)=>(
                                                    <li key={ind}><Link to={elem.path}>{elem.name}</Link></li>
                                                ))}                                                    
                                            </ul>
                                        </Fragment>
                                    ))    
                                } 
                            </li>
                        ))}    
                    </ul>                   
                </div>
            </li> 


             {/* <li>
                <Link to="/contact-us"><span>Contact us</span></Link>
            </li> */}
            {/* <li className={`sub-menu-down ${state.openMenu === 6 ? "open" : ""}`}
                onClick={() => dispatch({ type: 'toggleMenu', index: 6 })}
            >
                <Link to="#"><span>My Account</span> <i className="fas fa-chevron-down tabindex"/></Link>
                <ul className="sub-menu">						
                    {accountMenuItem.map((data,index)=>(
                        <li key={index}><Link to={data.url}>{data.name}</Link></li>
                    ))}                    
                </ul>
            </li> */}
        </ul>
    )
}


