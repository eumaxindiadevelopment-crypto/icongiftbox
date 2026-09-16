import { Link } from "react-router-dom";

export default function SocialIcon(){
    return(
        <ul>
            <li className="me-1">
                <Link to="https://www.facebook.com/dexignzone" target="_blank">
                    <i className="fa-brands fa-facebook-f"/>
                </Link>
            </li>
            <li className="me-1">
                <Link to="https://twitter.com/dexignzones" target="_blank">
                    <i className="fa-brands fa-twitter"/>
                </Link>
            </li>
            <li className="me-1">
                <Link to="https://www.linkedin.com/showcase/3686700/admin/" target="_blank">
                    <i className="fa-brands fa-linkedin"/>
                </Link>
            </li>
            <li>
                <Link to="https://www.instagram.com/dexignzone/" target="_blank">
                    <i className="fa-brands fa-instagram"/>
                </Link>
            </li>
        </ul>
    )
}