import { Link } from "react-router-dom";
import CommanBanner from "../../components/CommanBanner";
import IMAGES from "../../constant/theme";
import { useCart } from "../../context/CartContext";
import { useCurrency } from "../../context/CurrencyContext";

export default function ShopCart() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { formatPrice } = useCurrency();

  return (
    <div className="page-content bg-light">
      <CommanBanner parentText="Home" currentText="Shop Cart" mainText="Shop Cart" image={IMAGES.BackBg1} />
      <section className="content-inner shop-account">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              {cartItems.length === 0 ? (
                <div className="text-center py-5">
                  <i className="flaticon flaticon-basket" style={{ fontSize: 48, color: '#ccc' }} />
                  <h5 className="mt-3 text-muted">Your cart is empty</h5>
                  <Link to="/shop" className="btn btn-secondary mt-3">Continue Shopping</Link>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table check-tbl">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th></th>
                          <th>Price</th>
                          <th>Quantity</th>
                          <th>Subtotal</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((data) => (
                          <tr key={`${data.id}:${data.variationId ?? ''}`}>
                            <td className="product-item-img">
                              <img src={data.image} alt="/" />
                            </td>
                            <td className="product-item-name">
                              {data.title}
                              {data.attributes && Object.keys(data.attributes).length > 0 && (
                                <p className="mb-0" style={{ fontSize: 12, color: '#888' }}>
                                  {Object.values(data.attributes).join(' / ')}
                                </p>
                              )}
                            </td>
                            <td className="product-item-price">{formatPrice(data.price)}</td>
                            <td className="product-item-quantity">
                              <div className="quantity btn-quantity style-1 me-3">
                                <div className="input-group bootstrap-touchspin">
                                  <span className="input-group-addon bootstrap-touchspin-prefix" style={{ display: "none" }} />
                                  <input
                                    type="text"
                                    value={data.quantity}
                                    name="demo_vertical2"
                                    className="form-control"
                                    style={{ display: "block" }}
                                    readOnly
                                  />
                                  <span className="input-group-addon bootstrap-touchspin-postfix" style={{ display: "none" }} />
                                  <span className="input-group-btn-vertical">
                                    <button className="btn btn-default bootstrap-touchspin-up" type="button"
                                      onClick={() => updateQuantity(data.id, data.quantity + 1, data.variationId)}>
                                      <i className="fa-solid fa-plus" />
                                    </button>
                                    <button className="btn btn-default bootstrap-touchspin-down" type="button"
                                      onClick={() => updateQuantity(data.id, data.quantity - 1, data.variationId)}>
                                      <i className="fa-solid fa-minus" />
                                    </button>
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="product-item-totle">{formatPrice(data.price * data.quantity)}</td>
                            <td className="product-item-close">
                              <Link to="#" onClick={(e) => { e.preventDefault(); removeFromCart(data.id, data.variationId); }}>
                                <i className="ti-close" />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="row shop-form m-t30">
                    <div className="col-md-6">
                      <div className="form-group">
                        <div className="input-group mb-0">
                          <input name="dzEmail" required type="text" className="form-control" placeholder="Coupon Code" />
                          <div className="input-group-addon">
                            <button type="button" className="btn coupon">Apply Coupon</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 text-end">
                      <Link to="/cart" className="btn btn-secondary">UPDATE CART</Link>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="col-lg-4">
              <h4 className="title mb15">Cart Total</h4>
              <div className="cart-detail">
                <Link to="#" className="btn btn-outline-secondary w-100 m-b20">Bank Offer 5% Cashback</Link>
                <div className="icon-bx-wraper style-4 m-b15">
                  <div className="icon-bx">
                    <i className="flaticon flaticon-ship" />
                  </div>
                  <div className="icon-content">
                    <span className="font-14">FREE</span>
                    <h6 className="dz-title">Enjoy The Product</h6>
                  </div>
                </div>
                <div className="icon-bx-wraper style-4 m-b30">
                  <div className="icon-bx">
                    <img src={IMAGES.ShopIconBox} alt="/" />
                  </div>
                  <div className="icon-content">
                    <h6 className="dz-title">Enjoy The Product</h6>
                    <p>Lorem Ipsum is simply dummy text of the printing and typesetting</p>
                  </div>
                </div>
                <table>
                  <tbody>
                    <tr className="total">
                      <td><h6 className="mb-0">Total</h6></td>
                      <td className="price">{formatPrice(cartTotal)}</td>
                    </tr>
                  </tbody>
                </table>
                <Link to="/checkout" className="btn btn-secondary w-100">PLACE ORDER</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

