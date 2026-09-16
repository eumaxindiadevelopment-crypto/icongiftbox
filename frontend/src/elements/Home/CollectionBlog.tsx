import React, { useState, useEffect } from 'react';
import IMAGES from '../../constant/theme';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

const staticImages = [
    { image: IMAGES.CollectionPng1, design: 'collection1' },
    { image: IMAGES.CollectionPng2, design: 'collection2' },
    { image: IMAGES.CollectionPng3, design: 'collection3' },
    { image: IMAGES.CollectionPng4, design: 'collection4' },
    { image: IMAGES.CollectionPng5, design: 'collection5' },
]

const CollectionBlog = () => {
    const [images, setImages] = useState<any[]>(staticImages)
    const [title, setTitle] = useState('Upgrade your style with our top-notch collection.')
    const [btnText, setBtnText] = useState('All Collections')
    const [btnLink, setBtnLink] = useState('/shop-list')

    useEffect(() => {
        api.get('/collection').then(({ data }) => {
            if (data?.images?.length > 0) setImages(data.images)
            if (data?.sectionTitle) setTitle(data.sectionTitle)
            if (data?.btnText) setBtnText(data.btnText)
            if (data?.btnLink) setBtnLink(data.btnLink)
        }).catch(() => {})
    }, [])

    return (
        <React.Fragment>
            <div className="container">
                <h2 className="title wow fadeInUp" data-wow-delay="0.2s">{title}</h2>
                <div className="text-center">
                    <Link to={btnLink} className="btn btn-secondary btn-lg wow fadeInUp m-b30" data-wow-delay="0.4s">{btnText}</Link>
                </div>
            </div>
            {images.map(({ image, design }, ind) => (
                <div className={design} key={ind}><img src={image} alt="" /></div>
            ))}
        </React.Fragment>
    );
};

export default CollectionBlog;