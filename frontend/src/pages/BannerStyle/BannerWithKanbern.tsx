import { Swiper, SwiperSlide } from 'swiper/react';
import IMAGES from "../../constant/theme";
import CommanSection from "./CommanSection";
import { Autoplay, Parallax, EffectFade } from 'swiper/modules';
import Header from '../../components/Header';
import { Link } from 'react-router-dom';
import Footer from '../../components/Footer';

export default function BannerWithKanbern(){
    return(
        <div className="page-wraper">            
            <Header design="header-text-white header-transparent"/>
            <div className="page-content bg-light">		
                <div className="dz-bnr-inr bg-secondary overlay-black-light">
                    <div className="container">
                        <div className="dz-bnr-inr-entry">
                            <h1>Banner Kanbern</h1>
                            <nav aria-label="breadcrumb" className="breadcrumb-row">
                                <ul className="breadcrumb">
                                    <li className="breadcrumb-item"><Link to="/"> Home</Link></li>
                                    <li className="breadcrumb-item">Banner With Video</li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                    <Swiper className="kanbern-bnr swiper"                    
                        loop={true}
                        spaceBetween={10}
                        slidesPerView={"auto"}
                        effect={'fade'}
                        parallax= {true}
                        speed= {1500}
                        autoplay={{
                            delay: 2000,
                        }}
                        modules={[Autoplay, Parallax, EffectFade]}
                    >                    
                        <SwiperSlide><div style={{backgroundImage:`url('${IMAGES.BackBg1}')`}}></div></SwiperSlide>
                        <SwiperSlide><div style={{backgroundImage:`url('${IMAGES.BackBg7}')`}}></div></SwiperSlide>
                        
                    </Swiper>
                </div>
                <CommanSection />
            </div>
            <Footer />
        </div>
    )
}