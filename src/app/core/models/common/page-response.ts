/**
 * Generic pagination response interface matching the backend PageResponse schema.
 * Used for all paginated endpoints (productos, clientes, ordenes, empleados, usuarios).
 */
export interface PageResponse<T> {
  /** Array of items for the current page */
  content: T[];
  
  /** Current page number (0-based indexing) */
  pageNumber: number;
  
  /** Number of items per page */
  pageSize: number;
  
  /** Total number of items across all pages */
  totalElements: number;
  
  /** Total number of pages */
  totalPages: number;
  
  /** Whether this is the last page */
  last: boolean;
}
