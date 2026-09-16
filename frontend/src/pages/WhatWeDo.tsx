import CountUp from 'react-countup';
import {motion} from 'framer-motion';
import IMAGES from '../constant/theme';
import { Link } from 'react-router-dom';
import Aboutcompanylogo from '../elements/About/Aboutcompanylogo';

const counterData = [
    {number:40, name:'Happy Customer'},
    {number:21, name:'Years in Business'},
    {number:98, name:'Return Clients'},
];

const WhatWeDo = () => {
    return (
        <div className="page-content bg-light">            
            <div className="dz-bnr-inr dz-bnr-inr-lg style-2" style={{backgroundImage: `url(${IMAGES.BackBg7})`}}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-7 col-md-12 col-sm-12">
                            <div className="dz-bnr-inr-entry">
                                <h1>The Impact of What We Do How We Make a Difference</h1>
                                <nav aria-label="breadcrumb" className="breadcrumb-row">
                                    <ul className="breadcrumb">
                                        <li className="breadcrumb-item"><Link to="/"> Home</Link></li>
                                        <li className="breadcrumb-item">What We Do</li>
                                    </ul>
                                </nav>
                                <motion.div className="dz-media rounded"
                                    animate={{ y : '50%'}}
                                    whileInView={{ y : 0}}
                                    transition={{duration : 0.8}}
                                >
                                    <img src={IMAGES.AboutPic7} alt="" />
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <section className="content-inner about-style3">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-7 col-md-12 col-sm-12">
                            <div className="whatwedo-box">
                                <div className="about-content">
                                    <motion.div className="section-head style-1 d-block" 
                                        animate={{ y : '50%'}}
                                        whileInView={{ y : 0}}
                                        transition={{duration : 1}}
                                    >
                                        <h4 className="title">Our Mission</h4>
                                        <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,</p>
                                        
                                        <h4 className="title">Our Vision</h4>
                                        <p>All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.</p>
                                    </motion.div>
                                    <div className="row justify-content-center m-b30 text-lg-start text-center">
                                        {counterData.map(({number, name},ind)=>(
                                            <div className="col-lg-4 col-md-4 col-sm-4 col-4"
                                                key={ind}
                                            >
                                                <div className="exp-head">
                                                    <div className="counter-num">
                                                        <h2>                                                        
                                                            <CountUp end={number} duration={5} />
                                                            k+
                                                        </h2>
                                                    </div>
                                                    <span className="counter-title">{name}</span>
                                                </div>
                                            </div>
                                        ))}                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-5 col-md-12 col-sm-12">
                            <motion.div className="about-thumb"
                                animate={{ y : '50%'}}
                                whileInView={{ y : 0}}
                                transition={{duration : 1.2}}
                            >
                                <img src={IMAGES.Lady3Png} alt="" />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>	
            <section className="get-in-touch bg-secondary">
                <div className="m-r100 m-md-r0 m-sm-r0 wow fadeInUp" data-wow-delay="0.1s">
                    <h3 className="dz-title mb-lg-0 mb-3">Questions ?
                        <span>Our experts will help find the grar that’s right for you</span>
                    </h3>
                </div>
                <Link to="/contact-us-1" className="btn btn-light">Get In Touch</Link>
            </section>
            <section className="content-inner-1 companies bg-light ">
                <div className="container">
                    <div className="section-inner">
                        <motion.div className="section-head style-3"
                            animate={{ opacity : 0}}
                            whileInView={{ opacity : 1}}
                            transition={{duration : 1}}
                        >
                            <h2 className="title">We’re just keep growing with 6.3k trusted companies</h2>
                            <p>Nullam nec ipsum luctus, vehicula massa in, dictum sapien. Aenean quis luctus ert nulla quam augue.</p>	
                        </motion.div>
                        <div className="row gx-3 companies-inner">
                            <Aboutcompanylogo />
                        </div>
                    </div>
                </div>
            </section>
            
        </div>
    );
};

export default WhatWeDo;