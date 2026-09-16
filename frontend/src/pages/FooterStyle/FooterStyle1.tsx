import { Fragment } from "react/jsx-runtime";
import CommanBanner from "../../components/CommanBanner";
import IMAGES from "../../constant/theme";
import { FooterStyleCode1 } from "../../constant/Alldata";
import CopySectionText from "../../constant/CopySectionText";

export default function FooterStyle1(){
    return(
        <Fragment>
            <div className="page-content bg-light">
                <CommanBanner currentText="Footer Style 1" mainText="Footer Style 1" parentText="Home" image={IMAGES.BackBg1} />
                <div className="content-inner">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="code-copy">
                               <CopySectionText code={FooterStyleCode1} />
                                <pre className="code-box" id="copyTarget">
{FooterStyleCode1}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}