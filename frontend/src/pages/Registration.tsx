import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import IMAGES from "../constant/theme";
import PasswordInputBox from "../components/PasswordInputBox";
import { useCustomerAuth } from "../context/CustomerAuthContext";

export default function Registration(){
    const { register } = useCustomerAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (form.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setSubmitting(true);
        try {
            await register({
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                password: form.password,
            });
            navigate("/account-dashboard");
        } catch (err: any) {
            setError(err?.response?.data?.error || "Registration failed. Please try again.");
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
                            <h1>Registration</h1>
                            <nav aria-label="breadcrumb text-align-start" className="breadcrumb-row">
                                <ul className="breadcrumb">
                                    <li className="breadcrumb-item"><Link to="/"> Home</Link></li>
                                    <li className="breadcrumb-item">Registration</li>
                                </ul>
                            </nav>
                        </div>
                        <div className="registration-media">
                            <img src={IMAGES.RegistrationPng3} alt="/" />
                        </div>
                    </div>
                    <div className="col-xxl-6 col-xl-6 col-lg-6 end-side-content justify-content-center">
                        <div className="login-area">
							<h2 className="text-secondary text-center">Registration Now</h2>
							<p className="text-center m-b30">Welcome please registration to your account</p>
							<form onSubmit={handleSubmit}>
								{error && <div className="alert alert-danger py-2">{error}</div>}
								<div className="m-b25">
									<label className="label-title">First Name</label>
									<input name="firstName" required className="form-control" placeholder="First Name" type="text" value={form.firstName} onChange={handleChange} />
								</div>
								<div className="m-b25">
									<label className="label-title">Last Name</label>
									<input name="lastName" required className="form-control" placeholder="Last Name" type="text" value={form.lastName} onChange={handleChange} />
								</div>
								<div className="m-b25">
									<label className="label-title">Email Address</label>
									<input name="email" required className="form-control" placeholder="Email Address" type="email" value={form.email} onChange={handleChange} />
								</div>
								<div className="m-b25">
									<label className="label-title">Password</label>
									<div className="secure-input ">
										<PasswordInputBox placeholder="Password" name="password" value={form.password} onChange={handleChange} />
									</div>
								</div>
								<div className="m-b40">
									<label className="label-title">Confirm Password</label>
									<div className="secure-input ">
										<PasswordInputBox placeholder="Confirm Password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} />
									</div>
								</div>
								<div className="text-center">
									<button type="submit" className="btn btn-secondary btnhover text-uppercase me-2" disabled={submitting}>
										{submitting ? "Registering..." : "Register"}
									</button>
									<Link to="/login" className="btn btn-outline-secondary btnhover text-uppercase">Sign In</Link>
								</div>
							</form>
						</div>
                    </div>
                </div>
            </section>
        </div>
    )
}
