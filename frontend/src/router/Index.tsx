import { Outlet, Route, Routes } from "react-router-dom";

//header and footer
import Header from "../components/Header";
import Footer from "../components/Footer";
import ScrollTop from "../constant/ScrollTop";
import SubscribeModal from "../constant/SubscribeModal";
import EnquiryPopup from "../constant/EnquiryPopup";
import RequireCustomerAuth from "../components/RequireCustomerAuth";

// Index/Home Pages
import Home from "../pages/Home";

//About
import AboutUs from "../pages/About/AboutUs";

//Other
import PricingTable from "../pages/PricingTable";
import OurGiftVouchers from "../pages/OurGiftVouchers";
import WhatWeDo from "../pages/WhatWeDo";
import Faq from "../pages/Faq/Faq";
import OurTeam from "../pages/OurTeam";
import ShopCompare from "../pages/Shop/ShopCompare";
import ComingSoon from "../pages/ComingSoon";

// Auth Pages
import LoginPage from "../pages/LoginPage";
import ForgetPassword from "../pages/ForgetPassword";
import Registration from "../pages/Registration";

//Baner Style
import BannerWithColor from "../pages/BannerStyle/BannerWithColor";
import BannerWithImage from "../pages/BannerStyle/BannerWithImage";
import BannerWithVideo from "../pages/BannerStyle/BannerWithVideo";
import BannerWithKanbern from "../pages/BannerStyle/BannerWithKanbern";
import BannerSmall from "../pages/BannerStyle/BannerSmall";
import BannerMedium from "../pages/BannerStyle/BannerMedium";
import BannerLarge from "../pages/BannerStyle/BannerLarge";


import ContactUs from "../pages/Contact/ContactUs";

// Error pages
import ErrorPage1 from "../pages/Error/ErrorPage1";
import ErrorPage2 from "../pages/Error/ErrorPage2";
import UnderConstruction from "../pages/UnderConstruction";

//My Account Pages
import DashboardPage from "../pages/Account/DashboardPage";
import AccountOrder from "../pages/Account/AccountOrder";
import AccountOrderDetails from "../pages/Account/AccountOrderDetails";
import AccountOrderConfirm from "../pages/Account/AccountOrderConfirm";
import AccountDownloads from "../pages/Account/AccountDownloads";
import AccountReturnRequest from "../pages/Account/AccountReturnRequest";
import AccountReturnRequestDetails from "../pages/Account/AccountReturnRequestDetails";
import AccountReturnRequestConfirm from "../pages/Account/AccountReturnRequestConfirm";
import AccountProfile from "../pages/Account/AccountProfile";
import AccountAddress from "../pages/Account/AccountAddress";
import AccountShippingMethods from "../pages/Account/AccountShippingMethods";
import AccountPaymentMethods from "../pages/Account/AccountPaymentMethods";
import AccountReview from "../pages/Account/AccountReview";
import AccountBillingAddress from "../pages/Account/AccountBillingAddress";
import AccountShippingAddress from "../pages/Account/AccountShippingAddress";
import AccountCancellationRequests from "../pages/Account/AccountCancellationRequests";

// Portfolio Pages
import PortfolioDetails1 from "../pages/PortfolioDetails/PortfolioDetails1";
import PortfolioTiles from "../pages/PortfolioDetails/PortfolioTiles";
import PortfolioThumbsSlider from "../pages/PortfolioDetails/PortfolioThumbsSlider";
import PortfolioFilmStrip from "../pages/PortfolioDetails/PortfolioFilmStrip";
import PortfolioSplitSlider from "../pages/PortfolioDetails/PortfolioSplitSlider";
import CarouselShowcase from "../pages/PortfolioDetails/CarouselShowcase";
import CollageStyleOne from "../pages/PortfolioDetails/CollageStyleOne";
import CollageStyleTwo from "../pages/PortfolioDetails/CollageStyleTwo";
import CobbleStyleTwo from "../pages/PortfolioDetails/CobbleStyleTwo";
import CobbleStyleOne from "../pages/PortfolioDetails/CobbleStyleOne";
import MasonryGrid from "../pages/PortfolioDetails/MasonryGrid";

// Blog
import BlogDark2Sidebar from "../pages/Blog/BlogDark2Sidebar";

// Shop Pages
import ShopStyle2 from "../pages/Shop/ShopStyle2";
import ShopStyle1 from "../pages/Shop/ShopStyle1";
import ShopStandard from "../pages/Shop/ShopStandard";
import ShopList from "../pages/Shop/ShopList";
import ShopWithCategory from "../pages/Shop/ShopWithCategory";
import ShopFiltersTop from "../pages/Shop/ShopFiltersTop";
import ShopSidebarPage from "../pages/Shop/ShopSidebarPage";
import ShopProductDefault from "../pages/Shop/ShopProductDefault";
import SeoUrlLevel2 from "../pages/Shop/SeoUrlLevel2";
import ShopProductThumbnail from "../pages/Shop/ShopProductThumbnail";
import ShopProductGridMedia from "../pages/Shop/ShopProductGridMedia";
import ShopProductCarousel from "../pages/Shop/ShopProductCarousel";
import ShopProductFullWidth from "../pages/Shop/ShopProductFullWidth";
import ShopWishlist from "../pages/Shop/ShopWishlist";
import ShopCart from "../pages/Shop/ShopCart";
import ShopCheckout from "../pages/Shop/ShopCheckout";
import ShopOrderTracking from "../pages/Shop/ShopOrderTracking";
import ShopOrderSuccess from "../pages/Shop/ShopOrderSuccess";

// Header Style
import HeaderStyleOne from "../pages/HeaderStyle/HeaderStyleOne";


// Footer Style
import FooterStyle1 from "../pages/FooterStyle/FooterStyle1";

// SEO: hierarchical category/product URLs + 404
import NotFound from "../pages/NotFound";


const Index = () => {
    function MainLayout(){
        return(
            <div className="page-wraper">
                <Header design="style-1 header-transparent"/>
                <Outlet />
                <Footer />
            </div>
        )
    }
    function CommanLayout2(){
        return(
            <div className="page-wraper">
                <Header design=""/>
                <Outlet />
                <Footer />
            </div>
        )
    }
    function WithoutFooterLayout(){
        return(
            <div className="page-wraper">
                <Header design=""/>
                <Outlet />
            </div>
        )
    }
    function Layout3Out(){
        return(
            <div className="page-wraper">
                <Header design="style-1 header-transparent"/>
                <Outlet />
            </div>
        )
    }

    return (
        <>
            <Routes>
                <Route path="/error-2" element={<ErrorPage2 />}/>
                <Route path="/coming-soon" element={<ComingSoon />}/>
                <Route path="/under-construction" element={<UnderConstruction />}/>
                <Route path="/banner-with-video" element={<BannerWithVideo />} />
                <Route path="/banner-with-kanbern" element={<BannerWithKanbern />} />
                <Route path="/banner-small" element={<BannerSmall />} />
                <Route path="/banner-medium" element={<BannerMedium />} />
                <Route path="/banner-large" element={<BannerLarge />} />
                <Route path="/shop-compare" element={<ShopCompare />} />

                <Route element={<MainLayout/>}>
                    <Route path="/" element={<Home />}/>
                    <Route path="/shop-order-tracking" element={<ShopOrderTracking />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/registration" element={<Registration />} />
                    <Route path="/forget-password" element={<ForgetPassword />} />
                </Route>
                <Route element={<CommanLayout2/>}>
                    <Route path="/about-us" element={<AboutUs />}/>
                    <Route path="/pricing-table" element={<PricingTable />}/>
                    <Route path="/our-gift-vouchers" element={<OurGiftVouchers />}/>
                    <Route path="/what-we-do" element={<WhatWeDo />} />
                    <Route path="/faq" element={<Faq />} />
                    <Route path="/our-team" element={<OurTeam />} />
                    <Route path="/contact-us" element={<ContactUs />} />
                    <Route path="/error-1" element={<ErrorPage1 />} />
                    <Route path="/banner-with-bg-color" element={<BannerWithColor />} />
                    <Route path="/banner-with-image" element={<BannerWithImage />} />
                    <Route element={<RequireCustomerAuth />}>
                        <Route path="/account-dashboard" element={<DashboardPage />} />
                        <Route path="/account-orders" element={<AccountOrder />} />
                        <Route path="/account-order-details" element={<AccountOrderDetails />} />
                        <Route path="/account-order-details/:id" element={<AccountOrderDetails />} />
                        <Route path="/account-order-confirmation" element={<AccountOrderConfirm />} />
                        <Route path="/account-downloads" element={<AccountDownloads />} />
                        <Route path="/account-return-request" element={<AccountReturnRequest />} />
                        <Route path="/account-return-request-detail" element={<AccountReturnRequestDetails />} />
                        <Route path="/account-refund-requests-confirmed" element={<AccountReturnRequestConfirm />} />
                        <Route path="/account-profile" element={<AccountProfile />} />
                        <Route path="/account-address" element={<AccountAddress />} />
                        <Route path="/account-shipping-methods" element={<AccountShippingMethods />} />
                        <Route path="/account-payment-methods" element={<AccountPaymentMethods />} />
                        <Route path="/account-review" element={<AccountReview />} />
                        <Route path="/account-billing-address" element={<AccountBillingAddress />} />
                        <Route path="/account-shipping-address" element={<AccountShippingAddress />} />
                        <Route path="/account-cancellation-requests" element={<AccountCancellationRequests />} />
                    </Route>
                    <Route path="/footer-style-1" element={<FooterStyle1 />} />
                    {/* Portfolio Pages */}
                    <Route path="/portfolio-details-1" element={<PortfolioDetails1 />} />
                    <Route path="/portfolio-tiles" element={<PortfolioTiles />} />
                    <Route path="/collage-style-1" element={<CollageStyleOne />} />
                    <Route path="/collage-style-2" element={<CollageStyleTwo />} />
                    <Route path="/masonry-grid" element={<MasonryGrid />} />
                    <Route path="/cobble-style-1" element={<CobbleStyleOne />} />
                    <Route path="/cobble-style-2" element={<CobbleStyleTwo />} />
                    {/* Blog */}
                    <Route path="/blogs" element={<BlogDark2Sidebar />} />
                    {/* Shop Standard */}
                    <Route path="/shop" element={<ShopStandard />} />
                    <Route path="/shop/category/:categorySlug" element={<ShopStandard />} />
                    {/* SEO category URLs — top-level and subcategory. The /category/
                    prefixed routes are kept as backward-compatible aliases for
                    any previously-shared links; canonical links now use the bare
                    /:parentSlug/:categorySlug scheme, resolved via SeoUrlLevel2
                    below since it's ambiguous with the 2-segment product URL. */}
                    <Route path="/category/:categorySlug" element={<ShopStandard />} />
                    <Route path="/category/:parentSlug/:categorySlug" element={<ShopStandard />} />
                    <Route path="/:categorySlug" element={<ShopStandard />} />
                    <Route path="/shop-list" element={<ShopList />} />
                    <Route path="/shop-style-1" element={<ShopStyle1 />} />
                    <Route path="/shop-style-2" element={<ShopStyle2 />} />
                    <Route path="/shop-with-category" element={<ShopWithCategory />} />
                    <Route path="/shop-filters-top-bar" element={<ShopFiltersTop />} />
                    <Route path="/shop-sidebar" element={<ShopSidebarPage />} />
                    <Route path="/product-default" element={<ShopProductDefault />} />
                    <Route path="/product/:id" element={<ShopProductDefault />} />
                    {/* SEO product URLs — adaptive depth based on the product's primary category.
                    The 2-segment shape is ambiguous with a subcategory URL
                    (/parent-slug/child-slug/), so SeoUrlLevel2 resolves it at
                    runtime before delegating to ShopStandard or ShopProductDefault. */}
                    <Route path="/:slug1/:slug2" element={<SeoUrlLevel2 />} />
                    <Route path="/:slug1/:slug2/:slug3" element={<ShopProductDefault />} />
                    <Route path="/product-thumbnail" element={<ShopProductThumbnail />} />
                    <Route path="/product-grid-media" element={<ShopProductGridMedia />} />
                    <Route path="/product-carousel" element={<ShopProductCarousel />} />
                    <Route path="/product-full-width" element={<ShopProductFullWidth />} />
                    <Route path="/shop-wishlist" element={<ShopWishlist />} />
                    <Route path="/cart" element={<ShopCart />} />
                    <Route path="/checkout" element={<ShopCheckout />} />
                    <Route path="/shop-order-success" element={<ShopOrderSuccess />} />
                    <Route path="/header-style-1" element={<HeaderStyleOne />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
                <Route element={<WithoutFooterLayout />}>
                    <Route path="/contact-us-1" element={<ContactUs />} />
                    <Route path="/portfolio-thumbs-slider" element={<PortfolioThumbsSlider />} />
                    <Route path="/carousel-showcase" element={<CarouselShowcase />} />
                    <Route path="/portfolio-film-strip" element={<PortfolioFilmStrip />} />
                    <Route path="/portfolio-split-slider" element={<PortfolioSplitSlider />} />
                </Route>
                <Route element={<Layout3Out />}>
                    <Route path="/contact-us-2" element={<ContactUs />} />
                </Route>

            </Routes>
            <ScrollTop />
            <SubscribeModal />
            <EnquiryPopup />

        </>
    );
};

export default Index;
