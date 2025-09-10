export interface Product {
  _id: string
  id: number
  sku: string
  en_name: string
  ar_name: string
  en_description: string
  en_long_description: string
  ar_long_description: string
  en_category: string
  price: number
  image: string
  quantity_on_hand: number
  sold_quantity: number
  visible_in_catalog: number
  visible_in_search: number
  discount?: number
  ar_brand?: string
  en_brand?: string
  ave_cost?: number
}

export interface CartItem {
  product: Product
  quantity: number
}

// New: ProjectCartItem for project bundles
export interface ProjectCartItem {
  type: 'project-bundle';
  projectId: string;
  projectName: string;
  engineerNames: string[];
  engineerEmails: string[]; // <-- Add this line
  bundleIds: string[];
  products: Product[];
  quantity: number;
}

// ProjectBundleItem for orders (similar to ProjectCartItem but for order items)
export interface ProjectBundleItem {
  type: 'project-bundle';
  projectId: string;
  projectName: string;
  engineerNames: string[];
  engineerEmails: string[]; // <-- Add this line
  bundleIds: string[];
  products: Product[];
  quantity: number;
}

export interface PromoCode {
  _id: string
  code: string
  percentage: number
  expiry: Date
  active: boolean
}

export interface Order {
  _id?: string;
  items: (CartItem | ProjectBundleItem)[];
  customerInfo: CustomerInfo;
  total: number;
  discount: number;
  promoCode?: string;
  status: string;
  createdAt: Date;
  shippingFee?: number;
  paymentMethod?: string;
  projectBundle?: {
    type: 'project-bundle';
    projectId: string;
    projectName: string;
    engineerIndex: number;
    bundleIndex: number;
    engineerNames: string[];
    engineerEmails: string[]; // <-- Add this line
    bundleIds: string[];
  };
}

export interface CustomerInfo {
  name: string
  phone: string
  email: string
  country: string
  city: string
  area: string
  block: string
  street: string
  house: string
}
