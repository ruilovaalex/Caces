export interface PageRequest {
  page: number;
  pageSize: number;
}

export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export const MAX_PAGE_SIZE = 100;

export const normalizePage = (page?: number, pageSize?: number): PageRequest => ({
  page: Math.max(1, Math.floor(page || 1)),
  pageSize: Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(pageSize || 20))),
});
