export type UserRole = "admin" | "manager" | "operator";

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  phone: string;
  avatar?: string;
  createdAt: string;
  active: boolean;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  minStock: number;
  maxStock: number;
  costPrice: number;
  sellPrice: number;
  supplierId: string;
  location: string;
  photo: string;
  description: string;
  barcode: string;
};

export type Supplier = {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  rating: number;
  totalOrders: number;
  active: boolean;
  createdAt: string;
};

export type ShipmentStatus = "draft" | "dispatched" | "delivered" | "cancelled";
export type DeliveryStatus = "expected" | "received" | "partial" | "cancelled";

export type StatusLog = {
  status: string;
  at: string;
};

export type Shipment = {
  id: string;
  ref: string;
  destination: string;
  carrier: string;
  trackingNumber: string;
  items: { productId: string; qty: number }[];
  status: ShipmentStatus;
  date: string;
  deliveredDate?: string;
  notes: string;
  managerId: string;
  history?: StatusLog[];
};

export type Delivery = {
  id: string;
  ref: string;
  supplierId: string;
  items: { productId: string; qty: number }[];
  status: DeliveryStatus;
  expectedDate: string;
  receivedDate?: string;
  invoiceNumber: string;
  notes: string;
  history?: StatusLog[];
};

export type AppState = {
  currentUser: User | null;
  users: User[];
  products: Product[];
  suppliers: Supplier[];
  shipments: Shipment[];
  deliveries: Delivery[];
  companyName: string;
  currency: string;
  categories: string[];
};

export type Page =
  | "dashboard"
  | "products"
  | "shipments"
  | "deliveries"
  | "analytics"
  | "suppliers"
  | "employees"
  | "reports"
  | "settings";
