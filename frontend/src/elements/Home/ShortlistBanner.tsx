import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import IMAGES from "../../constant/theme";
import api from "../../lib/api";

const DEFAULTS = {
    bannerImage: IMAGES.AboutPic2,
    bannerTitle: "Recent Additions to Your Shortlist",
    btnText: "Shop Now",
    btnLink: "/shop-list",
    animationText: "Shortlist",
};

export default function ShortlistBanner() {
    const [data, setData] = useState(DEFAULTS);

    useEffect(() => {
        api.get('/shortlist')
            .then(({ data: d }) => setData({
                bannerImage: d.bannerImage || DEFAULTS.bannerImage,
                bannerTitle: d.bannerTitle || DEFAULTS.bannerTitle,
                btnText: d.btnText || DEFAULTS.btnText,
                btnLink: d.btnLink || DEFAULTS.btnLink,
                animationText: d.animationText || DEFAULTS.animationText,
            }))
            .catch(() => {});
    }, []);

    return (
        <div className="about-box style-1 clearfix h-100">
            <div className="dz-media h-100">
                <img src={data.bannerImage} alt="" />
                <div className="media-contant">
                    <h2 className="title">{data.bannerTitle}</h2>
                    <Link to={data.btnLink} className="btn btn-white">{data.btnText}</Link>
                </div>
                <svg className="title animation-text" viewBox="0 0 1320 300">
                    <text x="0" y="">{data.animationText}</text>
                </svg>
            </div>
        </div>
    );
}
