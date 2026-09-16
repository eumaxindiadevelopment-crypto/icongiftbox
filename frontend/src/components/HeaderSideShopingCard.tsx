import { Tab, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";
import { buildProductUrl } from "../lib/seoUrl";

interface propType {
  tabactive: string;
}

export default function HeaderSideShoppingCard(props: propType) {
  const { cartItems, removeFromCart, updateQuantity, cartCount, cartTotal } = useCart();
  const { formatPrice } = useCurrency();

  return (
    <div className="dz-tabs">
      <Tab.Container defaultActiveKey={props.tabactive}>
        <Nav as="ul" className="nav nav-tabs center">
          <Nav.Item as="li">
            <Nav.Link as="button" className="nav-link" eventKey="ShoppingCart">
              Shopping Cart
              <span className="badge badge-light">{cartCount}</span>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item as="li">
            <Nav.Link as="button" eventKey="Wishlist">
              Wishlist
              <span className="badge badge-light">0</span>
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <Tab.Content className="pt-4" id="dz-shopcart-sidebar">
          <Tab.Pane eventKey="ShoppingCart">
            <div className="shop-sidebar-cart">
              {cartItems.length === 0 ? (
                <div className="text-center py-4 text-muted" style={{ fontSize: 14 }}>
                  Your cart is empty
                </div>
              ) : (
                <ul className="sidebar-cart-list">
                  {cartItems.map((elem) => (
                    <li key={`${elem.id}:${elem.variationId ?? ''}`}>
                      <div className="cart-widget">
                        <div className="dz-media me-3">
                          <img src={elem.image} alt="card" />
                        </div>
                        <div className="cart-content">
                          <h6 className="title">
                            <Link to={buildProductUrl({ slug: elem.slug, _id: elem.id?.toString(), primaryCategory: elem.primaryCategory })}>{elem.title}</Link>
                          </h6>
                          {elem.attributes && Object.keys(elem.attributes).length > 0 && (
                            <p className="mb-1" style={{ fontSize: 12, color: '#888' }}>
                              {Object.values(elem.attributes).join(' / ')}
                            </p>
                          )}
                          <div className="d-flex align-items-center">
                            <div className="btn-quantity light quantity-sm me-3">
                              <div className="input-group bootstrap-touchspin">
                                <span className="input-group-addon bootstrap-touchspin-prefix" style={{ display: "none" }} />
                                <input
                                  type="text"
                                  value={elem.quantity}
                                  name="demo_vertical2"
                                  className="form-control"
                                  style={{ display: "block" }}
                                  readOnly
                                />
                                <span className="input-group-addon bootstrap-touchspin-postfix" style={{ display: "none" }} />
                                <span className="input-group-btn-vertical">
                                  <button className="btn btn-default bootstrap-touchspin-up" type="button"
                                    onClick={() => updateQuantity(elem.id, elem.quantity + 1, elem.variationId)}>
                                    <i className="fa-solid fa-plus" />
                                  </button>
                                  <button className="btn btn-default bootstrap-touchspin-down" type="button"
                                    onClick={() => updateQuantity(elem.id, elem.quantity - 1, elem.variationId)}>
                                    <i className="fa-solid fa-minus" />
                                  </button>
                                </span>
                              </div>
                            </div>
                            <h6 className="dz-price mb-0">{formatPrice(elem.price * elem.quantity)}</h6>
                          </div>
                        </div>
                        <Link to="#" className="dz-close" onClick={(e) => { e.preventDefault(); removeFromCart(elem.id, elem.variationId); }}>
                          <i className="ti-close" />
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="cart-total">
                <h5 className="mb-0">Subtotal:</h5>
                <h5 className="mb-0">{formatPrice(cartTotal)}</h5>
              </div>
              <div className="mt-auto">
                <div className="shipping-time">
                  <div className="dz-icon">
                    <i className="flaticon flaticon-ship" />
                  </div>
                  <div className="shipping-content">
                    <h6 className="title pe-4">Congratulations, you've got free shipping!</h6>
                    <div className="progress">
                      <div className="progress-bar progress-animated border-0" style={{ width: "75%" }}>
                        <span className="sr-only">75% Complete</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Link to="/checkout" className="btn btn-outline-secondary btn-block m-b20">Checkout</Link>
                <Link to="/cart" className="btn btn-secondary btn-block">View Cart</Link>
              </div>
            </div>
          </Tab.Pane>
          <Tab.Pane eventKey="Wishlist">
            <div className="shop-sidebar-cart">
              <div className="text-center py-4 text-muted" style={{ fontSize: 14 }}>
                No items in wishlist
              </div>
              <div className="mt-auto">
                <Link to="/shop-wishlist" className="btn btn-secondary btn-block">Check Your Favourite</Link>
              </div>
            </div>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
}
