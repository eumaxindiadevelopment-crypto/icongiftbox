import { useState, useEffect } from "react";
import SaleDiscountShopCard from "../../components/SaleDiscountShopCard";
import { GreatSavindData } from "../../constant/Alldata";
import api from "../../lib/api";

const ShortListBlog = () => {
    const [cards, setCards] = useState<any[]>(GreatSavindData)

    useEffect(() => {
        api.get('/shortlist').then(({ data }) => {
            if (data?.cards?.length > 0) setCards(data.cards)
        }).catch(() => {})
    }, [])

    return (
        <div className="row">
            {cards.map((data, ind) => (
                <div className="col-lg-6 col-md-6 col-sm-6 m-b30" key={ind}>
                    <SaleDiscountShopCard
                        image={data.image}
                        name={data.name}
                        star={data.star}
                        saleTitle={data.saleTitle}
                        price={data.price}
                        originalPrice={data.originalPrice}
                        link={data.link}
                        showBadge={data.showBadge}
                    />
                </div>
            ))}
        </div>
    );
};

export default ShortListBlog;