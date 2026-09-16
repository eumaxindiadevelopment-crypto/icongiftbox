import { useEffect,  useReducer } from "react";
import IMAGES from "../constant/theme";
import { Link, useNavigate } from "react-router-dom";
import Menus from "./Menus";
import HeadSearchBar from "./HeadSearchBar";
import { Offcanvas } from "react-bootstrap";
import HeaderSidbar from "./HeaderSidbar";
import HeaderSideShoppingCard from "./HeaderSideShopingCard";
import { useCart } from "../context/CartContext";
import { useCustomerAuth } from "../context/CustomerAuthContext";

interface DesignType{
    design:  string
}

interface State {
    headerFix: boolean;
    isBottom: boolean;
    isActive: boolean;
    previousScroll: number;
    openSidebar: boolean;
    openSearchBar: boolean;
    headSideBar: boolean;
    headShoppingSidebar: boolean;
    basketShoppingCard: boolean;
}

type Action =
    | { type: 'FIX_HEADER'; payload: boolean }
    | { type: 'FIX_BOTTOM'; payload: boolean }
    | { type: 'SET_IS_ACTIVE'; payload: boolean }
    | { type: 'SET_PREVIOUS_SCROLL'; payload: number }
    | { type: 'TOGGLE_SIDEBAR' }
    | { type: 'TOGGLE_SEARCH_BAR' }
    | { type: 'TOGGLE_HEAD_SIDEBAR' }
    | { type: 'TOGGLE_HEAD_SHOPPING_SIDEBAR' }
    | { type: 'TOGGLE_BASKET_SHOPPING_CARD' };


const initialState = {
    headerFix: false,
    isBottom: false,
    isActive: false,
    previousScroll: 0,
    openSidebar: false,
    openSearchBar: false,
    headSideBar: false,
    headShoppingSidebar: false,
    basketShoppingCard: false,
};

function reducer(state : State, action : Action) : State {
    switch (action.type) {
        case 'FIX_HEADER':
            return { ...state, headerFix: action.payload };
        case 'FIX_BOTTOM':
            return { ...state, isBottom: action.payload };
        case 'SET_IS_ACTIVE':
            return { ...state, isActive: action.payload };
        case 'SET_PREVIOUS_SCROLL':
            return { ...state, previousScroll: action.payload };
        case 'TOGGLE_SIDEBAR':
            return { ...state, openSidebar: !state.openSidebar };
        case 'TOGGLE_SEARCH_BAR':
            return { ...state, openSearchBar: !state.openSearchBar };
        case 'TOGGLE_HEAD_SIDEBAR':
            return { ...state, headSideBar: !state.headSideBar };
        case 'TOGGLE_HEAD_SHOPPING_SIDEBAR':
            return { ...state, headShoppingSidebar: !state.headShoppingSidebar };
        case 'TOGGLE_BASKET_SHOPPING_CARD':
            return { ...state, basketShoppingCard: !state.basketShoppingCard };
        default:
            throw new Error();
    }
}

const Header = ({design}:DesignType) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { cartCount } = useCart();
    const { isAuthenticated, customer, logout } = useCustomerAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };
    const scrollHandler = () => {
        if (window.scrollY > 80) {
            dispatch({ type: 'FIX_HEADER', payload: true });
        } else {
            dispatch({ type: 'FIX_HEADER', payload: false });
        }
    };
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerWidth <= 768) {
                const currentScroll = window.scrollY;
                const bodyHeight = document.body.scrollHeight;
                const windowHeight = window.innerHeight;
                dispatch({ type: 'FIX_BOTTOM', payload: currentScroll + windowHeight >= bodyHeight });
                dispatch({ type: 'SET_IS_ACTIVE', payload: currentScroll > state.previousScroll });
                dispatch({ type: 'SET_PREVIOUS_SCROLL', payload: currentScroll });
            }
        };

        const combinedHandler = () => {
            scrollHandler();
            handleScroll();
        };

        window.addEventListener("scroll", combinedHandler);
        return () => {
            window.removeEventListener("scroll", combinedHandler);
        };
    }, [state.previousScroll]);
    return (
        <>
            <header className={`site-header mo-left header ${design}`}>		
                {/*  Main Header  */}
                <div className={`sticky-header main-bar-wraper navbar-expand-lg ${state.headerFix ? 'is-fixed' : ''}`}>
                    <div className="main-bar clearfix">
                        <div className="container-fluid clearfix d-lg-flex d-block">                            
                            {design === "header-text-white header-transparent" ? 
                                ''
                                :
                                <div className="logo-header logo-dark me-md-5">
                                    <Link to="/"><img src={IMAGES.logo} alt="logo" /></Link>
                                </div>
                            }
                            {design === "header-text-white header-transparent" ? 
                                <div className="logo-header me-md-5">
                                    <Link to="/" className=" logo-light"><img src={IMAGES.LogoWhite} alt="logo-white" /></Link>
                                    <Link to="/" className="logo-dark"><img src={IMAGES.logopng} alt="logo" /></Link>
                                </div>                      
                                :
                                ''
                            }
                            <button className={`navbar-toggler collapsed navicon justify-content-end ${state.openSidebar ? "open" : ""}`} 
                                onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
                            >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                            
                        {/*  Main Nav  */}
                        <div className={`header-nav w3menu navbar-collapse collapse justify-content-start ${state.openSidebar ? "show" : ""}`} 
                            id="navbarNavDropdown"                            
                        >
                            <div className="logo-header logo-dark">
                                <Link to="/"><img src={IMAGES.logo} alt="logo" /></Link>
                            </div>
                            {/* All menus item */}
                                <Menus />
                            {/* All menus item end*/}
                            <div className="dz-social-icon">
                                <ul>
                                    <li><Link className="fab fa-facebook-f" target="_blank" to="https://www.facebook.com/dexignzone"></Link></li>
                                    <li><Link className="fab fa-twitter" target="_blank" to="https://twitter.com/dexignzones"></Link></li>
                                    <li><Link className="fab fa-linkedin-in" target="_blank" to="https://www.linkedin.com/showcase/3686700/admin/"></Link></li>
                                    <li><Link className="fab fa-instagram" target="_blank" to="https://www.instagram.com/dexignzone/"></Link></li>
                                </ul>
                            </div>
                        </div>
                        {/* EXTRA NAV  */}
                        <div className={`extra-nav ${state.isBottom ? "bottom-end" : ""} ${state.isActive ? "active" : ""}`}>
                            <div className="extra-cell">						
                                <ul className="header-right">
                                    {isAuthenticated ? (
                                        <li className="nav-item login-link dropdown">
                                            <Link className="nav-link dropdown-toggle" to="/account-dashboard" data-bs-toggle="dropdown">
                                                {customer?.firstName || "My Account"}
                                            </Link>
                                            <ul className="dropdown-menu dropdown-menu-end">
                                                <li><Link className="dropdown-item" to="/account-dashboard">My Account</Link></li>
                                                <li><button type="button" className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                                            </ul>
                                        </li>
                                    ) : (
                                        <li className="nav-item login-link">
                                            <Link className="nav-link" to="/login">
                                                Login / Register
                                            </Link>
                                        </li>
                                    )}
                                    <li className="nav-item search-link">
                                        <Link className="nav-link" to="#" 
                                            onClick={() => dispatch({ type: 'TOGGLE_SEARCH_BAR' })}
                                        >
                                            <i className="iconly-Light-Search"/>
                                        </Link>
                                    </li>
                                    <li className="nav-item wishlist-link">
                                        <Link className="nav-link" to="#" 
                                            onClick={() => dispatch({ type: 'TOGGLE_HEAD_SHOPPING_SIDEBAR' })}
                                        >
                                            <i className="iconly-Light-Heart2"/>
                                        </Link>
                                    </li>
                                    <li className="nav-item cart-link">
                                        <Link to="#" className="nav-link cart-btn"  
                                            onClick={() => dispatch({ type: 'TOGGLE_BASKET_SHOPPING_CARD' })}
                                        >
                                            <i className="iconly-Broken-Buy"/>
                                            <span className="badge badge-circle">{cartCount}</span>
                                        </Link>
                                    </li>
                                    <li className="nav-item filte-link">
                                        <Link to="#" className="nav-link filte-btn"
                                            onClick={() => dispatch({ type: 'TOGGLE_HEAD_SIDEBAR' })}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 13" fill="none">
                                                <rect y="11" width="30" height="2" fill="black"/>
                                                <rect width="30" height="2" fill="black"/>
                                            </svg>
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
                {/*  Main Header End  */}
            </header>   
            {/*  SearchBar  */}
            <Offcanvas className="dz-search-area dz-offcanvas offcanvas-top"
                    show={state.openSearchBar} onHide={() => dispatch({ type: 'TOGGLE_SEARCH_BAR' })}
                    placement={'top'}
                >
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"
                    onClick={() => dispatch({ type: 'TOGGLE_SEARCH_BAR' })}
                >
                    &times;
                </button>
                <HeadSearchBar />
            </Offcanvas>
            {/*  SearchBar  */}

            {/* - Sidebar finter */}
             <Offcanvas className="dz-offcanvas offcanvas-end" placement="end" show={state.headSideBar} 
                onHide={() => dispatch({ type: 'TOGGLE_HEAD_SIDEBAR' })}
            >
                <button type="button" className="btn-close" 
                    onClick={() => dispatch({ type: 'TOGGLE_HEAD_SIDEBAR' })}
                >
                    &times;
                </button>
                <div className="offcanvas-body">
                    <HeaderSidbar />
                </div>
            </Offcanvas>  
            {/*  Sidebar cart  */}
            <Offcanvas className="dz-offcanvas offcanvas-end" placement="end" tabIndex={-1} show={state.headShoppingSidebar} 
                onHide={() => dispatch({ type: 'TOGGLE_HEAD_SHOPPING_SIDEBAR' })}
            >
                <button type="button" className="btn-close" 
                    onClick={() => dispatch({ type: 'TOGGLE_HEAD_SHOPPING_SIDEBAR' })}
                >
                    &times;
                </button>
                <div className="offcanvas-body">
                    <div className="product-description">
                        <HeaderSideShoppingCard tabactive="Wishlist" />
                    </div>
                </div>
            </Offcanvas>

             {/*  Shopping Sidebar Basket   */}
            <Offcanvas className="dz-offcanvas offcanvas-end" placement="end" tabIndex={-1} show={state.basketShoppingCard}                 
                onHide={() => dispatch({ type: 'TOGGLE_BASKET_SHOPPING_CARD' })}
            >
                <button type="button" className="btn-close"                     
                    onClick={() => dispatch({ type: 'TOGGLE_BASKET_SHOPPING_CARD' })}
                >
                    &times;
                </button>
                <div className="offcanvas-body">
                    <div className="product-description">
                        <HeaderSideShoppingCard tabactive="ShoppingCart" />
                    </div>
                </div>
            </Offcanvas>
        </>
    );
};

export default Header;