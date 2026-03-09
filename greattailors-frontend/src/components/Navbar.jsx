import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <div className="top-menu">
      <NavLink to="/" className="tab">
        Dashboard
      </NavLink>

      <NavLink to="/customers" className="tab">
        Customers
      </NavLink>

      <NavLink to="/orders" className="tab">
        Orders
      </NavLink>

      <NavLink to="/payments" className="tab">
        Payments
      </NavLink>

      <NavLink to="/worker" className="tab">
        Worker
      </NavLink>

      <NavLink to="/vendors" className="tab">
        Vendors
      </NavLink>

      <NavLink to="/warehouse" className="tab">
        Warehouse
      </NavLink>

      {/* ✅ NEW DELIVERY TAB */}
      <NavLink to="/delivery" className="tab">
        Delivery
      </NavLink>
    </div>
  );
}

export default Navbar;
