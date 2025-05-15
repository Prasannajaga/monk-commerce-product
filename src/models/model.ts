export type productVariant = {
  id: number;
  index: number;
  product_id: number;
  title: string;
  inventory_policy: string;
  price: number;
  inventory_management: string;
  created_at: string;
  updated_at: string;
  admin_graphql_api_id: string;
  selected ?: boolean,
  discount : string
  discountType : string,
  inventory_quantity: number;
}

export type Product  = {
  id: number;
  title: string;
  vendor: string;
  handle: string;
  created_at: string;
  updated_at: string;
  published_at: string;
  image: Record<string, any>; // or a specific type if you know the structure
  admin_graphql_api_id: string;
  status: string;
  variants: productVariant[]; 
  selected ?: boolean,
}
