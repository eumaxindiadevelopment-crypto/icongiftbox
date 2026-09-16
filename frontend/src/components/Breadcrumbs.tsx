import { Link } from "react-router-dom";

export type BreadcrumbItem = {
    label: string;
    href?: string; // omit on the last (current-page) item
};

type Props = {
    items: BreadcrumbItem[];
};

// Renders both the visible breadcrumb trail and its schema.org BreadcrumbList
// JSON-LD, so every page using it gets structured data for free instead of
// each page inlining its own (as ShopStandard.tsx used to).
export default function Breadcrumbs({ items }: Props) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const trail: BreadcrumbItem[] = [{ label: "Home", href: "/" }, ...items];

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: trail.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.label,
            item: item.href ? `${origin}${item.href}` : undefined,
        })),
    };

    return (
        <div className="d-sm-flex justify-content-between container-fluid py-3">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <nav aria-label="breadcrumb" className="breadcrumb-row">
                <ul className="breadcrumb mb-0">
                    {trail.map((item, i) => (
                        <li className="breadcrumb-item" key={i}>
                            {item.href && i < trail.length - 1 ? <Link to={item.href}>{item.label}</Link> : item.label}
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}
