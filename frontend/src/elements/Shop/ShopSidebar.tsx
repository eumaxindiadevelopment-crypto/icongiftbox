import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCategories, fetchProductAttributes, fetchProductBrands, fetchProductTags } from "../../lib/api";
import ShopSidebarPriceSlider from "./ShopSidebarPriceSlider";
import type { CategoryRef } from "../../lib/seoUrl";

type Category = { _id: string; name: string; slug: string; count: number; parent?: { _id: string; name: string; slug: string } | null };
type Tag = { name: string; count: number };
type Attribute = { name: string; options: string[] };
type Brand = { _id: string; name: string; slug: string; count: number };

type Props = {
    selectedCategorySlug?: string | null;
    selectedTags?: string[];
    selectedColor?: string | null;
    selectedSize?: string | null;
    selectedMinPrice?: number | null;
    selectedMaxPrice?: number | null;
    selectedBrands?: string[];
    // Builds the real, crawlable href for a category link (or "All Categories" when category is null).
    // Left to the parent page so it can decide the URL scheme and preserve the other filters
    // already in the query string.
    buildCategoryHref: (category: CategoryRef | null) => string;
    onTagToggle?: (tag: string) => void;
    onSearchChange?: (search: string) => void;
    // max is null for the open-ended "Above ₹5,000" bucket.
    onPriceChange?: (min: number, max: number | null) => void;
    onColorChange?: (color: string | null) => void;
    onSizeChange?: (size: string | null) => void;
    onBrandToggle?: (brandSlug: string) => void;
};

export default function ShopSidebar({
    selectedCategorySlug = null,
    selectedTags = [],
    selectedColor = null,
    selectedSize = null,
    selectedMinPrice = null,
    selectedMaxPrice = null,
    selectedBrands = [],
    buildCategoryHref,
    onTagToggle,
    onSearchChange,
    onPriceChange,
    onColorChange,
    onSizeChange,
    onBrandToggle,
}: Props){
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchCategories().then(setCategories).catch(() => {});
        fetchProductTags().then(setTags).catch(() => {});
        fetchProductAttributes().then(setAttributes).catch(() => {});
    }, []);

    // Brands are scoped to the category being browsed — same reasoning as the
    // category widget above: a brand with zero products in this category is
    // just noise, so re-fetch whenever the selected category changes.
    useEffect(() => {
        fetchProductBrands(selectedCategorySlug).then(setBrands).catch(() => {});
    }, [selectedCategorySlug]);

    const colorOptions = attributes.find((a) => /^colou?r$/i.test(a.name))?.options ?? [];
    const sizeOptions = attributes.find((a) => /^size$/i.test(a.name))?.options ?? [];

    // Scope the category widget to the current context instead of dumping every
    // category (top-level + all subcategories) into one flat list: with nothing
    // selected, show the top-level categories; once one is selected, show only
    // the subcategories under that same parent (siblings, if the selection is
    // itself a subcategory) so the list stays relevant to where the user is.
    const selectedCategory = categories.find((c) => c.slug === selectedCategorySlug) ?? null;
    const currentParentSlug = selectedCategory ? (selectedCategory.parent?.slug ?? selectedCategory.slug) : null;
    let displayedCategories = currentParentSlug
        ? categories.filter((c) => c.parent?.slug === currentParentSlug)
        : categories.filter((c) => !c.parent);
    if (selectedCategory && displayedCategories.length === 0) displayedCategories = [selectedCategory];

    function handleSearchSubmit(e: React.FormEvent){
        e.preventDefault();
        onSearchChange?.(search);
    }

    return(
        <Fragment>
            <div className="widget widget_search">
                <form className="form-group" onSubmit={handleSearchSubmit}>
                    <div className="input-group">
                        <input name="dzSearch" required type="search" className="form-control" placeholder="Search Product"
                            value={search} onChange={(e)=>setSearch(e.target.value)} />
                        <div className="input-group-addon">
                            <button name="submit" value="Submit" type="submit" className="btn">
                                <i className="icon feather icon-search"/>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            <div className="widget">
                <h6 className="widget-title">Price</h6>
                <div className="price-slide range-slider">
                    <div className="price">
                        <ShopSidebarPriceSlider selectedMin={selectedMinPrice} selectedMax={selectedMaxPrice} onChange={onPriceChange} />
                    </div>
                </div>
            </div>
            {colorOptions.length > 0 && (
                <div className="widget">
                    <h6 className="widget-title">Color</h6>
                    <div className="d-flex align-items-center flex-wrap color-filter ps-2">
                        {colorOptions.map((option, ind)=>(
                            <div className="form-check" key={ind} title={option}>
                                <input className="form-check-input" type="radio" name="radioNoLabel" id={`color-${ind}`} value={option}
                                    checked={selectedColor === option}
                                    onChange={()=>onColorChange?.(selectedColor === option ? null : option)}/>
                                <span style={{backgroundColor : option}} onClick={()=>onColorChange?.(selectedColor === option ? null : option)}></span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {sizeOptions.length > 0 && (
                <div className="widget">
                    <h6 className="widget-title">Size</h6>
                    <div className="btn-group product-size">
                        {sizeOptions.map((option, ind)=>(
                            <Fragment key={ind}>
                                <input type="radio" className="btn-check" name="btnradio1" id={`size-${ind}`}
                                    checked={selectedSize === option}
                                    onChange={()=>onSizeChange?.(selectedSize === option ? null : option)} />
                                <label className="btn" htmlFor={`size-${ind}`}>{option}</label>
                            </Fragment>
                        ))}
                    </div>
                </div>
            )}

            {brands.length > 0 && (
                <div className="widget">
                    <h6 className="widget-title">Brands</h6>
                    <ul className="brand-filter">
                        {brands.map((b)=>(
                            // Not wrapped in Bootstrap's `.form-check` — this theme repurposes that
                            // class for a custom round radio look (`.form-check-input{opacity:0}` +
                            // a sibling <span> drawn via :checked+span:after), which made the checkbox
                            // invisible here. The bare `.form-check-input` rule (_form.scss) already
                            // renders a plain visible square box, so we use just that.
                            <li className="d-flex align-items-center" key={b._id}>
                                <input className="form-check-input" type="checkbox" id={`brand-${b._id}`}
                                    checked={selectedBrands.includes(b.slug)}
                                    onChange={()=>onBrandToggle?.(b.slug)} />
                                <label className="ms-2 mb-0" style={{ color: "var(--title)" }} htmlFor={`brand-${b._id}`}>{b.name}</label>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="widget widget_categories">
                <h6 className="widget-title">Category</h6>
                <ul>
                    <li className="cat-item">
                        <Link to={buildCategoryHref(null)} className={!selectedCategorySlug ? "fw-bold" : ""}>All Categories</Link>
                    </li>
                    {displayedCategories.map((cat)=>(
                        <li className="cat-item" key={cat._id}>
                            <Link to={buildCategoryHref(cat)} className={selectedCategorySlug === cat.slug ? "fw-bold" : ""}>
                                {cat.name}
                            </Link> ({cat.count})
                        </li>
                    ))}
                </ul>
            </div>

            {/* <div className="widget widget_tag_cloud">
                <h6 className="widget-title">Tags</h6>
                <div className="tagcloud">
                    {tags.map((tag, ind)=>(
                        <a href="#" key={ind} className={selectedTags.includes(tag.name) ? "fw-bold" : ""}
                            onClick={(e)=>{e.preventDefault(); onTagToggle?.(tag.name);}}>
                            {tag.name}
                        </a>
                    ))}
                </div>
            </div> */}
        </Fragment>
    )
}
