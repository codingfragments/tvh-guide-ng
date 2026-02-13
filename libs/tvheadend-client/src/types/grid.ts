/**
 * Grid response pattern used across TVHeadend API for paginated data
 */

/** Base grid response structure */
export interface GridResponse<T> {
  /** Array of items */
  entries: T[];
  /** Total count across all pages */
  total: number;
  /** Starting offset */
  start: number;
  /** Page size limit */
  limit: number;
}

/** Grid query parameters */
export interface GridParams {
  /** Starting offset */
  start?: number;
  /** Maximum number of items to return */
  limit?: number;
  /** Field to sort by */
  sort?: string;
  /** Sort direction */
  dir?: 'ASC' | 'DESC';
  /** Filter expression (string or complex filter object) */
  filter?: string | FilterCondition | FilterCondition[];
}

/** Filter condition for advanced filtering */
export interface FilterCondition {
  /** Field name to filter on */
  field: string;
  /** Filter type */
  type: 'string' | 'numeric' | 'boolean';
  /** Value to filter by */
  value: string | number | boolean;
  /** Comparison operator */
  comparison?: 'eq' | 'ne' | 'lt' | 'le' | 'gt' | 'gte' | 'regex';
}
