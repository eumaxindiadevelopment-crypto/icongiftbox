import { Link } from "react-router-dom";
import CommanBanner from "../components/CommanBanner";
import { voucherBlogData } from "../constant/Alldata";
import IMAGES from "../constant/theme";

const OurGiftVouchers = () => {
    return (
        <div className="page-content bg-light">
            <CommanBanner mainText="Our Gift Vouchers" currentText="Our Gift Vouchers" parentText="Home" image={IMAGES.BackBg1} />
            <section className="content-inner">
                <div className="container">
                    <div className="row">
                        {voucherBlogData.map((item, ind)=>(
                            <div className="col-lg-4 col-md-6 col-sm-6"  key={ind}>
                                <div className="gift-bx">
                                    <div className="gift-media">
                                        <img src={item.image} alt="" />
                                    </div>
                                    <div className="gift-content">
                                        <h6 className="title"><Link to="/shop-list">{item.name}</Link></h6> 
                                        <p className="text">Our gift cards are available in a range of denominations, so you can choose the perfect amount for any occasion.</p> 
                                    </div>
                                </div>
                            </div>
                        ))}					
                    </div>
                </div>
            </section>
        </div>
    );
};

export default OurGiftVouchers;