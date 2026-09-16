import CommanBanner from "../../components/CommanBanner";
import IMAGES from "../../constant/theme";
import CommanSidebar from "../../elements/MyAccount/CommanSidebar";

export default function AccountDownloads() {
    return (
        <div className="page-content bg-light">
            <CommanBanner image={IMAGES.BackBg1} mainText="Downloads" parentText="Home" currentText="Downloads" />
            <div className="content-inner-1">
                <div className="container">
                    <div className="row">
                        <CommanSidebar />
                        <section className="col-xl-9 account-wrapper">
                            <div className="account-card">
                                <p className="text-muted mb-0">You have no downloadable products. All our products are physical corporate gifts shipped to your address.</p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
