import { Link } from "react-router-dom";

interface dataType {
    image :  string
    name :  string
    post :  string
}

const TeamImageCard = ({image,name,post} : dataType) => {
    return (
        <div className="dz-team style-1 m-md-b0 m-sm-b0 m-b30">
            <div className="dz-media">
                <Link to="#"><img src={image} alt="" /></Link>
                <ul className="team-social-icon">
                    <li><Link to="https://www.facebook.com/dexignzone" target="_blank"><i className="fab fa-facebook-f" /></Link></li>
                    <li><Link to="https://twitter.com/dexignzone" target="_blank"><i className="fab fa-twitter" /></Link></li>
                    <li><Link to="https://www.instagram.com/dexignzone/" target="_blank"><i className="fab fa-instagram" /></Link></li>
                    <li><Link to="https://www.linkedin.com/in/dexignzone/" target="_blank"><i className="fa-brands fa-linkedin-in" /></Link></li>
                </ul>
            </div>
            <div className="dz-content">
                <h5 className="title"><Link to="/our-team">{name}</Link></h5>
                <span>{post}</span>
            </div>
        </div>
    );
};

export default TeamImageCard;