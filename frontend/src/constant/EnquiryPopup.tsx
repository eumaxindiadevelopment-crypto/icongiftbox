import { useEffect, useRef, useState } from "react";
import { submitEnquiry, fetchEnquirySettings } from "../lib/api";

const GIFTING_FOR_OPTIONS = ["Employees", "Clients", "Festivals & Events", "Corporate Events", "Others"];
const BUDGET_OPTIONS = ["Under ₹500", "₹500 - ₹1,000", "₹1,000 - ₹2,500", "₹2,500 - ₹5,000", "Above ₹5,000"];
const QUANTITY_OPTIONS = ["1 - 10", "11 - 50", "51 - 100", "101 - 500", "500+"];

const EMPTY_FORM = {
    fullName: "", phone: "", email: "", city: "",
    giftingFor: "", budgetPerGift: "", quantityRequired: "", additionalInfo: "",
};

export default function EnquiryPopup() {
    const [open, setOpen] = useState(false);
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState(EMPTY_FORM);

    useEffect(() => {
        // Shows on every page load by design (no dismissal persistence) —
        // only the admin's enabled/delay settings gate whether/when it appears.
        let timer: ReturnType<typeof setTimeout>;
        fetchEnquirySettings()
            .then(({ enabled, delaySeconds }) => {
                if (!enabled) return;
                timer = setTimeout(() => {
                    setOpen(true);
                    document.body.classList.add("overflow-hidden");
                }, Math.max(0, (delaySeconds ?? 1) * 1000));
            })
            .catch(() => {
                // Settings endpoint unreachable — fall back to showing after 1s
                // rather than silently never showing the popup at all.
                timer = setTimeout(() => {
                    setOpen(true);
                    document.body.classList.add("overflow-hidden");
                }, 1000);
            });
        return () => clearTimeout(timer);
    }, []);

    function handleClose() {
        setOpen(false);
        document.body.classList.remove("overflow-hidden");
    }

    function set(key: keyof typeof EMPTY_FORM, value: string) {
        setForm(f => ({ ...f, [key]: value }));
    }

    async function handleSubmit(e: any) {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            await submitEnquiry(form);
            setSubmitted(true);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    if (!open) return null;

    return (
        <>
            <div className="modal fade inquiry-modal no-image show d-block" tabIndex={-1} aria-labelledby="enquiryModalTitle" aria-hidden="true">
                <div className="modal-dialog" role="document" ref={dialogRef}>
                    <div className="modal-content">
                        <button type="button" className="btn-close" aria-label="Close" onClick={handleClose}>
                            <span aria-hidden="true"><i className="icon feather icon-x" /></span>
                        </button>
                        <div>
                            <div className="modal-header text-center">
                                <h3 className="modal-title w-100" id="enquiryModalTitle">Talk to Our Corporate Gifting Experts</h3>
                            </div>
                            <div className="modal-body">
                                {submitted ? (
                                    <p className="text-center py-4 mb-0">Thank you! Our team will get back to you shortly.</p>
                                ) : (
                                    <form onSubmit={handleSubmit}>
                                        {error && <p className="text-danger font-14 mb-3">{error}</p>}
                                        <div className="form-group">
                                            <input type="text" className="form-control" required placeholder="Enter Your Full Name *"
                                                value={form.fullName} onChange={e => set("fullName", e.target.value)} />
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6 form-group">
                                                <input type="tel" className="form-control" required placeholder="Enter Your Phone Number *"
                                                    value={form.phone} onChange={e => set("phone", e.target.value)} />
                                            </div>
                                            <div className="col-md-6 form-group">
                                                <input type="email" className="form-control" placeholder="Enter Your Business Email Address"
                                                    value={form.email} onChange={e => set("email", e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6 form-group">
                                                <input type="text" className="form-control" required placeholder="Enter Your City *"
                                                    value={form.city} onChange={e => set("city", e.target.value)} />
                                            </div>
                                            <div className="col-md-6 form-group">
                                                <select className="form-control" required value={form.giftingFor} onChange={e => set("giftingFor", e.target.value)}>
                                                    <option value="" disabled>Gifting For *</option>
                                                    {GIFTING_FOR_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6 form-group">
                                                <select className="form-control" required value={form.budgetPerGift} onChange={e => set("budgetPerGift", e.target.value)}>
                                                    <option value="" disabled>Budget Per Gift *</option>
                                                    {BUDGET_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                                </select>
                                            </div>
                                            <div className="col-md-6 form-group">
                                                <select className="form-control" required value={form.quantityRequired} onChange={e => set("quantityRequired", e.target.value)}>
                                                    <option value="" disabled>Quantity Required *</option>
                                                    {QUANTITY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <textarea className="form-control" rows={3} placeholder="Additional Information"
                                                value={form.additionalInfo} onChange={e => set("additionalInfo", e.target.value)} />
                                        </div>
                                        <button type="submit" disabled={submitting} className="btn btn-quote w-100 text-uppercase">
                                            {submitting ? "Submitting..." : "Get Quote"}
                                        </button>
                                        <p className="recaptcha-note">
                                            This site is protected by reCAPTCHA and the Google
                                            {" "}<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and
                                            {" "}<a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> apply.
                                        </p>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show" onClick={handleClose}></div>
        </>
    );
}
