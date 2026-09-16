import { Link } from "react-router-dom";

export default function PostTag(){
    return(
        <div className="post-tags">
            <strong>Tags:</strong>
            <Link to={"#"}>Dresses</Link>{" "}
            <Link to={"#"}>Boots</Link>{" "}
            <Link to={"#"}>Jewelry</Link>{" "}
            <Link to={"#"}>Jacket</Link>{" "}
            <Link to={"#"}>Coat</Link>{" "}
        </div>
    )
}