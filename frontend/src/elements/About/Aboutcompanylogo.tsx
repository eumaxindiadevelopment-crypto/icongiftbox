import React from 'react';
import {motion} from 'framer-motion'
import { Aboutcompanylogodata } from '../../constant/Alldata';
import { Link } from 'react-router-dom';

const Aboutcompanylogo = () => {    
    return (
        <React.Fragment>
            {Aboutcompanylogodata.map((data, ind)=>(
                <motion.div className="col-md-3 col-sm-4 col-6 p-lg-b30 p-b20" key={ind}
                    animate={{ y : '50%'}}
                    whileInView={{ y : 0}}
                    transition={{duration : data.duration }}
                >
                    <Link to={"#"} className="companies-wrapper">
                        <div className="companies-media">
                            <img src={data.image} alt="" /> 
                        </div>
                    </Link>
                </motion.div>
            ))} 
        </React.Fragment>
    );
};

export default Aboutcompanylogo;