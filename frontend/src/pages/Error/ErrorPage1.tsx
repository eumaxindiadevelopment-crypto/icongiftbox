import { Link } from "react-router-dom"
import IMAGES from "../../constant/theme"

const ErrorPage1 = () =>{
    return(
        <div className="page-content bg-light">
            <section className="content-inner-1">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-xl-8 col-lg-10 col-md-12">
                            <div className="error-page style-1">
                                <div className="dz-error-media">
                                    <img src={IMAGES.ErrorPic4}   alt="error" />
                                </div>
                                <div className="error-inner">
                                    <h1 className="dz_error">404</h1>
                                    <p className="error-head">Oh, no! This page does not exist.</p>
                                    <Link to="/" className="btn btn-secondary  text-uppercase">Go to Main Page</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>                
        </div>
    )
}
export default ErrorPage1