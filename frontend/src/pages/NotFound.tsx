import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="page-content bg-light">
            <div className="text-center py-5" style={{ minHeight: '50vh' }}>
                <h1 className="mb-3">404</h1>
                <h5 className="text-muted mb-4">Page not found</h5>
                <Link to="/shop" className="btn btn-secondary">Back to Shop</Link>
            </div>
        </div>
    );
}
