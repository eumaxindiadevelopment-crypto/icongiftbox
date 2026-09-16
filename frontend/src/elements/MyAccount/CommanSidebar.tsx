import { Link, useNavigate } from "react-router-dom";
import IMAGES from "../../constant/theme";
import { useCustomerAuth } from "../../context/CustomerAuthContext";


type MenuItem = {
    title: string;
    url: string;
  };

  const accountMenu: MenuItem[] = [
    { title: "Dashboard", url: "/account-dashboard" },
    { title: "Orders", url: "/account-orders" },
    { title: "Downloads", url: "/account-downloads" },
    { title: "Return request", url: "/account-return-request" },
  ];

  const accountSettingsMenu: MenuItem[] = [
    { title: "Profile", url: "/account-profile" },
    { title: "Address", url: "/account-address" },
    { title: "Shipping methods", url: "/account-shipping-methods" },
    { title: "Payment Methods", url: "/account-payment-methods" },
    { title: "Review", url: "/account-review" },
];

export default function CommanSidebar(){
    const { customer, logout } = useCustomerAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const fullName = customer ? `${customer.firstName} ${customer.lastName}`.trim() : "";

    return(
        <aside className="col-xl-3">
            <div className="toggle-info">
                <h5 className="title mb-0">Account Navbar</h5>
                <a className="toggle-btn" href="#accountSidebar">Account Menu</a>
            </div>
            <div className="sticky-top account-sidebar-wrapper">
                <div className="account-sidebar" id="accountSidebar">
                    <div className="profile-head">
                        <div className="user-thumb">
                            <img className="rounded-circle" src={IMAGES.ProfilePic} alt={fullName || "Account"} />
                        </div>
                        <h5 className="title mb-0">{fullName || "My Account"}</h5>
                        <span className="text text-primary">{customer?.email}</span>
                    </div>
                    <div className="account-nav">
                        <div className="nav-title bg-light">DASHBOARD</div>
                        <ul>
                            {accountMenu.map((elem, index)=>(
                                <li key={index}><Link to={elem.url}>{elem.title}</Link></li>
                            ))}
                        </ul>
                        <div className="nav-title bg-light">ACCOUNT SETTINGS</div>
                        <ul className="account-info-list">
                            {accountSettingsMenu.map((elem, ind)=>(
                                <li key={ind}><Link to={elem.url}>{elem.title}</Link></li>
                            ))}
                            <li><button type="button" className="btn-link p-0 border-0 bg-transparent" onClick={handleLogout}>Logout</button></li>
                        </ul>
                    </div>
                </div>
            </div>
        </aside>
    )
}