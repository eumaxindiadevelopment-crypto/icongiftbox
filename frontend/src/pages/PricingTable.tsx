
import CommanBanner from "../components/CommanBanner";
import GetInTouch from "../components/GetInTouch";
import IMAGES from "../constant/theme";
import PricingBlog from "../elements/PricingBlog";



const PricingTable = () => {
    return (
       <div className="page-content bg-light">
            <CommanBanner mainText="Pricing Table" parentText="Home" currentText="Pricing Table"  image={IMAGES.BackBg1} />
            <section className="dz-pricingtable ">
                <div className="container">
                    <div className="row pricingtable-wraper">
                        <PricingBlog />
                    </div>
                </div>
            </section>            
            <GetInTouch />
        </div>
    );
};

export default PricingTable;