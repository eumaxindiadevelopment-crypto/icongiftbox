import { Link } from "react-router-dom";
import IMAGES from "../../constant/theme";
import { Fragment } from "react/jsx-runtime";

interface postimage{
    image : boolean;
}

export default function PostTitleWithImage(props: postimage){
    return(
        <Fragment>
            <h1 className="dz-title">The Sustainable Wardrobe A Greener Approach to Fashion</h1>
            <div className="dz-meta">
                <ul>
                    <li className="post-date">22 Jan 2025</li>
                    <li className="dz-user">
                        <i className="fa-solid fa-user" />
                        By <Link to="#">KK Sharma</Link>
                    </li>
                    <li className="dz-comment">
                        <i className="fa-solid fa-message" />
                        <Link to="#">24 Comments</Link>
                    </li>
                </ul>
            </div>
            {props.image?
                <div className="dz-media rounded">
                    <img src={IMAGES.BlogDetailPic1} alt="/" />
                </div>
                :
                ""
            }
        </Fragment>
    )
}