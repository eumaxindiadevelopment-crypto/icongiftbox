import { Nav, Tab } from "react-bootstrap";
import IMAGES from "../../constant/theme";
import ProductTabStyleOne from "./ProductTabStyleOne";
import ProductReviews from "./ProductReviews";

export default function ProductDescription({ productId }: { productId: string }){
    return(
        <div className="dz-tabs">
            <Tab.Container defaultActiveKey={"description"}>
                <Nav as="ul" className="nav-tabs center">
                    <Nav.Item as="li">
                        <Nav.Link as="button" eventKey={"description"}>Description</Nav.Link>
                    </Nav.Item>
                    <Nav.Item as="li">
                        <Nav.Link as="button" eventKey={"review"}>Reviews</Nav.Link>
                    </Nav.Item>
                </Nav>
                <Tab.Content>
                    <Tab.Pane eventKey={"description"}>
                        <ProductTabStyleOne image1 = {IMAGES.ProductFeaturePng1} image2={IMAGES.ProductFeaturePng2} image3={IMAGES.ProductFeaturePng3}  />
                    </Tab.Pane>
                    <Tab.Pane eventKey={"review"}>
                        <ProductReviews productId={productId} />
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </div>
    )
}