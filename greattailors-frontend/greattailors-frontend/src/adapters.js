// Normalize Customer
export function mapCustomer(b) {
  if (!b) return null;
  return {
    id: b._id || b.id,
    name: b.name || b.fullName || "",
    phone: b.phone || b.mobile || "",
    orders: Array.isArray(b.orders) ? b.orders.map(mapOrder) : [],
    createdAt: b.createdAt || null,
    updatedAt: b.updatedAt || null,
  };
}

// Normalize Order
export function mapOrder(b) {
  if (!b) return null;
  return {
    id: b._id || b.id,
    customer: b.customer ? mapCustomerBrief(b.customer) : null,
    items: Array.isArray(b.items) ? b.items.map(mapItem) : [],
    totalAmount: Number(b.totalAmount ?? b.total ?? 0),
    dueDate: b.dueDate || b.due_date || null,
    paymentStatus: b.paymentStatus || b.payment_status || "Unpaid",
    deliveryStatus: b.deliveryStatus || b.delivery_status || "Pending",
    createdAt: b.createdAt || null,
  };
}

function mapCustomerBrief(c) {
  return {
    id: c._id || c.id,
    name: c.name || c.fullName || "",
    phone: c.phone || c.mobile || "",
  };
}

function mapItem(it) {
  return {
    itemName: it.itemName || it.item_name || "",
    service: it.service || it.service_name || "",
    quantity: Number(it.quantity ?? 0),
    price: Number(it.price ?? 0),
  };
}

// Normalize Payment
export function mapPayment(b) {
  if (!b) return null;
  return {
    id: b.paymentId || b._id || b.id,
    orderId: b.orderId || b.order?._id || b.order?.id || null,
    customerId: b.customerId || b.customer?._id || null,
    customerName: b.customerName || b.customer?.name || "",
    customerPhone: b.customerPhone || b.customer?.phone || "",
    amount: Number(b.amount ?? 0),
    method: b.method || "Cash",
    status: b.status || "Paid",
    receiptNumber: b.receiptNumber || "",
    paidAt: b.paidAt || b.createdAt || null,
  };
}
