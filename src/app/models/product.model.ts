export interface IProduct {
  id: string;
  name: string;
  status: EStatus;
  category: ECategory;
  createAt: Date;
  material: string;
  imgUrl: string;
  description: string;
  stock: number;
  price: number;
}

export enum EStatus {
  active = 'Active',
  suspended = 'Suspended',
  expriring = 'Expriring',
}

export enum ECategory {
  men = 'Men',
  ladies = 'Ladies',
  unisex = 'Unisex',
}

export interface GetProductsPaginatedOption {
  page: number;
  limit: number;
  sort?: string;
  order?: 'desc' | 'asc';
  search?: string;
}

export type ProductsQueries = Partial<GetProductsPaginatedOption>;

export type ProductCreated = Omit<IProduct, 'id'>;
