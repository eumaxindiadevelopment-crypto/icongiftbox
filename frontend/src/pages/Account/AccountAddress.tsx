import { useEffect, useState } from "react";
import CommanBanner from "../../components/CommanBanner";
import IMAGES from "../../constant/theme";
import CommanSidebar from "../../elements/MyAccount/CommanSidebar";
import { fetchCurrentCustomer, updateMyProfile, OrderAddress } from "../../lib/api";

const EMPTY: OrderAddress = { firstName: '', lastName: '', address1: '', address2: '', city: '', state: '', postcode: '', country: 'India', phone: '', email: '' };

const FIELDS: { key: keyof OrderAddress; label: string }[] = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'address1', label: 'Address Line 1' },
    { key: 'address2', label: 'Address Line 2' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'postcode', label: 'Postal Code' },
    { key: 'country', label: 'Country' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
];

function AddressCard({ title, address, onEdit }: { title: string; address?: OrderAddress | null; onEdit: () => void }) {
    return (
        <div className="col-md-6 m-b30">
            <div className="address-card">
                <div className="account-address-box">
                    <h6 className="mb-3">{title}</h6>
                    {address && address.address1 ? (
                        <ul>
                            <li>{address.firstName} {address.lastName}</li>
                            <li>{address.address1}{address.address2 ? `, ${address.address2}` : ''}</li>
                            <li>{address.city}{address.state ? `, ${address.state}` : ''} {address.postcode}</li>
                            <li>{address.country}</li>
                            {address.phone && <li>Mo. {address.phone}</li>}
                            {address.email && <li>{address.email}</li>}
                        </ul>
                    ) : (
                        <p className="text-muted mb-0">No {title.toLowerCase()} saved yet.</p>
                    )}
                </div>
                <div className="account-address-bottom">
                    <a href="#" onClick={(e) => { e.preventDefault(); onEdit(); }} className="d-block me-3">
                        <i className="fa-solid fa-pen me-2" />{address?.address1 ? 'Edit' : 'Add'}
                    </a>
                </div>
            </div>
        </div>
    );
}

export default function AccountAddress() {
    const [billingAddress, setBillingAddress] = useState<OrderAddress | null>(null);
    const [shippingAddress, setShippingAddress] = useState<OrderAddress | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<'billing' | 'shipping' | null>(null);
    const [form, setForm] = useState<OrderAddress>(EMPTY);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCurrentCustomer()
            .then(c => {
                setBillingAddress(c.billingAddress || null);
                setShippingAddress(c.shippingAddress || null);
            })
            .finally(() => setLoading(false));
    }, []);

    const openEdit = (type: 'billing' | 'shipping') => {
        setForm((type === 'billing' ? billingAddress : shippingAddress) || EMPTY);
        setEditing(type);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const field = editing === 'billing' ? 'billingAddress' : 'shippingAddress';
            const updated = await updateMyProfile({ [field]: form });
            setBillingAddress(updated.billingAddress || null);
            setShippingAddress(updated.shippingAddress || null);
            setEditing(null);
        } catch {
            // keep the modal open so the user can retry
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-content bg-light">
            <CommanBanner image={IMAGES.BackBg1} mainText="Account Address" parentText="Home" currentText="Account Address" />
            <div className="content-inner-1">
                <div className="container">
                    <div className="row">
                        <CommanSidebar />
                        <section className="col-xl-9 account-wrapper">
                            {loading ? (
                                <p>Loading your addresses…</p>
                            ) : (
                                <div className="row">
                                    <div className="col-12 m-b30">
                                        <p className="m-b0">The following addresses will be used on the checkout page by default.</p>
                                    </div>
                                    <AddressCard title="Billing address" address={billingAddress} onEdit={() => openEdit('billing')} />
                                    <AddressCard title="Shipping address" address={shippingAddress} onEdit={() => openEdit('shipping')} />
                                </div>
                            )}

                            {editing && (
                                <div className="account-card mt-4">
                                    <h5 className="mb-3">{editing === 'billing' ? 'Billing' : 'Shipping'} Address</h5>
                                    <div className="row g-3">
                                        {FIELDS.map(f => (
                                            <div className="col-md-6" key={f.key}>
                                                <label className="label-title">{f.label}</label>
                                                <input
                                                    className="form-control"
                                                    name={f.key}
                                                    value={form[f.key] || ''}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3">
                                        <button className="btn btn-secondary me-2" disabled={saving} onClick={handleSave}>
                                            {saving ? 'Saving…' : 'Save Address'}
                                        </button>
                                        <button className="btn btn-outline-secondary" onClick={() => setEditing(null)}>Cancel</button>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
