import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { fetchCategory } from "../../lib/api";
import ShopStandard from "./ShopStandard";
import ShopProductDefault from "./ShopProductDefault";

// The 2-segment URL /:slug1/:slug2 is ambiguous by design: it's either a
// subcategory listing (/parent-slug/child-slug/) or a top-level-category
// product page (/category-slug/product-slug). Both are real, SEO-facing
// schemes (see seoUrl.ts), so this resolves the ambiguity at runtime by
// checking whether slug2 is a category whose parent is slug1.
export default function SeoUrlLevel2(){
    const { slug1, slug2 } = useParams<{ slug1: string; slug2: string }>();
    const [resolved, setResolved] = useState<"loading" | "category" | "product">("loading");

    useEffect(() => {
        let cancelled = false;
        setResolved("loading");
        if (!slug2) { setResolved("product"); return; }
        fetchCategory(slug2)
            .then((cat) => { if (!cancelled) setResolved(cat.parent?.slug === slug1 ? "category" : "product"); })
            .catch(() => { if (!cancelled) setResolved("product"); });
        return () => { cancelled = true; };
    }, [slug1, slug2]);

    if (resolved === "loading") {
        return <div className="d-flex justify-content-center py-5"><Spinner animation="border" /></div>;
    }
    if (resolved === "category") {
        return <ShopStandard categorySlugOverride={slug2} parentSlugOverride={slug1} />;
    }
    return <ShopProductDefault />;
}
