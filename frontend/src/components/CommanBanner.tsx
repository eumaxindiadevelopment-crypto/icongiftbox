import { Link } from "react-router-dom";

interface texttype {
    image: string
    mainText : string
    parentText : string
    currentText : string
}

const CommanBanner = ({image,mainText,parentText,currentText} : texttype) => {
    return (
        <div className="dz-bnr-inr bg-secondary overlay-black-light" style={{backgroundImage:`url(${image})`}}>
            <div className="container">
                <div className="dz-bnr-inr-entry">
                    <h1>{mainText}</h1>
                    <nav className="breadcrumb-row">
                        <ul className="breadcrumb">
                            <li className="breadcrumb-item"><Link to="#"> {parentText}</Link></li>
                            <li className="breadcrumb-item">{currentText}</li>
                        </ul>
                    </nav>
                </div>
            </div>	
        </div>
    );
};

export default CommanBanner;