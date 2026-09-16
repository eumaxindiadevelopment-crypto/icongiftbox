import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import IMAGES from "../constant/theme";

import PasswordInputBox from "../components/PasswordInputBox";
import { useCustomerAuth } from "../context/CustomerAuthContext";

export default function LoginPage(){
    const { login } = useCustomerAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as { from?: Location })?.from?.pathname || "/account-dashboard";

    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            await login(form);
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err?.response?.data?.error || "Invalid email or password");
        } finally {
            setSubmitting(false);
        }
    };

    return(
        <div className="page-content bg-light">
            <section className="px-3">
                <div className="row">
                    <div className="col-xxl-6 col-xl-6 col-lg-6 start-side-content">
                        <div className="dz-bnr-inr-entry">
                            <h1>Login</h1>
                            <nav aria-label="breadcrumb text-align-start" className="breadcrumb-row">
                                <ul className="breadcrumb">
                                    <li className="breadcrumb-item"><Link to="/"> Home</Link></li>
                                    <li className="breadcrumb-item">Login</li>
                                </ul>
                            </nav>
                        </div>
                        <div className="registration-media">
                            <img src={IMAGES.RegistrationPng3} alt="/" />
                        </div>
                    </div>
                    <div className="col-xxl-6 col-xl-6 col-lg-6 end-side-content justify-content-center">
                        <div className="login-area">
                            <h2 className="text-secondary text-center">Login</h2>
                            <p className="text-center m-b25">welcome please login to your account</p>
                            <form onSubmit={handleSubmit}>
                                {error && <div className="alert alert-danger py-2">{error}</div>}
                                <div className="m-b30">
                                    <label className="label-title">Email Address</label>
                                    <input name="email" required className="form-control" placeholder="Email Address" type="email" value={form.email} onChange={handleChange} />
                                </div>
                                <div className="m-b15">
                                    <label className="label-title">Password</label>
                                    <div className="secure-input ">
                                        <PasswordInputBox placeholder="Password" name="password" value={form.password} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="form-row d-flex justify-content-between m-b30">
                                    <div className="form-group">
                                    <div className="custom-control custom-checkbox">
                                            <input type="checkbox" className="form-check-input" id="basic_checkbox_1" />
                                            <label className="form-check-label" htmlFor="basic_checkbox_1">Remember Me</label>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <Link className="text-primary" to="/forget-password">Forgot Password</Link>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <button type="submit" className="btn btn-secondary btnhover text-uppercase me-2 sign-btn" disabled={submitting}>
                                        {submitting ? "Signing In..." : "Sign In"}
                                    </button>
                                    <Link to="/registration" className="btn btn-outline-secondary btnhover text-uppercase">Register</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
