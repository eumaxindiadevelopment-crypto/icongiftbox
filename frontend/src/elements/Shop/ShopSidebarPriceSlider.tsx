type Props = {
    selectedMin?: number | null;
    // null means open-ended (the "Above ₹5,000" bucket has no upper bound).
    selectedMax?: number | null;
    onChange?: (min: number, max: number | null) => void;
};

const PRICE_RANGES: { label: string; min: number; max: number | null }[] = [
    { label: "Gifts Under ₹500", min: 0, max: 500 },
    { label: "₹500 – ₹1,000", min: 500, max: 1000 },
    { label: "₹1,000 – ₹2,500", min: 1000, max: 2500 },
    { label: "₹2,500 – ₹5,000", min: 2500, max: 5000 },
    { label: "Above ₹5,000", min: 5000, max: null },
];

export default function ShopSidebarPriceSlider({ selectedMin = null, selectedMax = null, onChange }: Props){
    return(
        <ul className="price-range-list">
            {PRICE_RANGES.map((range, ind) => {
                const active = selectedMin === range.min && selectedMax === range.max;
                return (
                    <li className="cat-item" key={ind}>
                        <a href="#" className={active ? "fw-bold" : ""}
                            onClick={(e) => { e.preventDefault(); onChange?.(range.min, range.max); }}>
                            {range.label}
                        </a>
                    </li>
                );
            })}
        </ul>
    )
}
