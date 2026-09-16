import CommanBanner from "../components/CommanBanner";
import IMAGES from "../constant/theme";
import TeamCreators from "../elements/About/TeamCreators";

const OurTeam = () => {
    return (
        <div className="page-content bg-light">
            <CommanBanner currentText="Our Team" mainText="Our Team"  parentText="Home" image={IMAGES.BackBg1} />
            <section className="content-inner">
                <div className="container">                    
                    <TeamCreators />                    
                </div>
            </section>
        </div>
    );
};

export default OurTeam;