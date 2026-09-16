import IMAGES from "../../constant/theme";
import {motion} from 'framer-motion'

const AboutImageData = [
    { image: IMAGES.AboutPic4, coloun: 'col-xl-8 col-lg-8 col-sm-8 col-8'},
    { image: IMAGES.AboutPic5, coloun: 'col-xl-4 col-lg-4 col-sm-4 col-4 '},
    { image: IMAGES.AboutPic6, coloun: 'col-lg-12'},
    { image: IMAGES.AboutPic7, coloun: 'col-lg-12'},
];

const AboutImageBlog = () => {
    return (
        <div className="row g-xl-4 g-md-4 g-3">
            {AboutImageData.map((data, ind)=>(
                <motion.div className={`${data.coloun}`}  key={ind}>
                    <div className="about-thumb">
                        <img src={data.image} alt="" className="rounded" />
                    </div>
                </motion.div>
            ))}            
        </div>
    );
};

export default AboutImageBlog;