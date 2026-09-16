import { Link } from "react-router-dom";
import CommanBanner from "../../components/CommanBanner";
import IMAGES from "../../constant/theme";
import BlogSidebar from "../../elements/Blog/BlogSidebar";

interface BlogDark2Type{
    dealy : string;
    image: string;
    date: string;
    text : string;
}

const BlogDark2SidebarData : BlogDark2Type[] = [
    {dealy : "0.1s", image: IMAGES.BlogPost5Pic1, date:'25 Jan, 2025', text:"Trendsetter Chronicles: Unveiling the Latest in Fashion"},
    {dealy : "0.2s", image: IMAGES.BlogPost5Pic2, date:'30 Jan, 2025', text:"Runway Rundown: Decoding Fashion Week’s Best Looks"},
    {dealy : "0.3s", image: IMAGES.BlogPost5Pic3, date:'17 Jan, 2025', text:"Closet Confidential: Behind-the-Scenes of a Fashionista"},
    {dealy : "0.4s", image: IMAGES.BlogPost5Pic4, date:'10 Jan, 2025', text:"Fashion Forward: Spotlight on Emerging Designers"},
    {dealy : "0.5s", image: IMAGES.BlogPost5Pic5, date:'19 Jan, 2025', text:"Accessorize Me: The Power of Statement Pieces"},
    {dealy : "0.6s", image: IMAGES.BlogPost5Pic6, date:'26 Jan, 2025', text:"DIY Couture: Crafting Your Own Fashion Masterpieces"},
]; 

export default function BlogDark2Sidebar(){
    return(
        <div className="page-content bg-light">
            <CommanBanner parentText="Home" currentText="Blog Dark 2 Column Sidebar" mainText="Blog Dark 2 Column Sidebar" image={IMAGES.BackBg1} />
            <section className="content-inner-1 z-index-unset">
                <div className="container">
                    <div className="row">
                        <div className="col-xl-8 col-lg-8">
                            <div className="row">
                                {BlogDark2SidebarData.map((elem, i)=>(
                                    <div className="col-lg-6 col-md-6 m-b30 wow fadeInUp" data-wow-delay={elem.dealy} key={i}>
                                        <div className="dz-card style-5">                                            
                                            <div className="dz-media">
                                                <img src={elem.image} alt="/" />
                                            </div>
                                            <div className="dz-info">
                                                <div className="dz-meta">
                                                    <ul>
                                                        <li className="post-date">{elem.date}</li>
                                                    </ul>
                                                </div>
                                                <h4 className="dz-title">
                                                    <Link className="text-white" to="/blogs">{elem.text}</Link>
                                                </h4>
                                                <Link to="/blogs" className="font-14 read-btn">Read More 
                                                    <i className="icon feather icon-chevron-right"/>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                <div className="col-12 text-center mt-sm-4 mt-2 wow fadeInUp" data-wow-delay="0.7s">
                                    <Link to="/blogs" className="btn btn-secondary">
                                        Load More
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-lg-4 m-b30">
                            <aside className="side-bar sticky-top">
                                <BlogSidebar />
                            </aside>
                        </div>
                    </div>
                </div>
            </section>
        </div> 
    )
}

