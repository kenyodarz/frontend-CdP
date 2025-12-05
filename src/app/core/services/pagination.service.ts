import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';

/**
 * Utility service for handling pagination logic across the application.
 * Provides helper methods for creating pagination parameters and calculations.
 */
@Injectable({
  providedIn: 'root'
})
export class PaginationService {

  /**
   * Creates HttpParams with pagination parameters.
   * @param page Page number (0-based indexing)
   * @param size Number of items per page
   * @returns HttpParams with page and size parameters
   */
  createPaginationParams(page: number = 0, size: number = 10): HttpParams {
    return new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
  }

  /**
   * Calculates the total number of pages.
   * @param totalElements Total number of items
   * @param pageSize Number of items per page
   * @returns Total number of pages
   */
  calculateTotalPages(totalElements: number, pageSize: number): number {
    if (pageSize <= 0) {
      return 0;
    }
    return Math.ceil(totalElements / pageSize);
  }

  /**
   * Checks if there is a next page available.
   * @param currentPage Current page number (0-based)
   * @param totalPages Total number of pages
   * @returns True if there is a next page
   */
  hasNextPage(currentPage: number, totalPages: number): boolean {
    return currentPage < totalPages - 1;
  }

  /**
   * Checks if there is a previous page available.
   * @param currentPage Current page number (0-based)
   * @returns True if there is a previous page
   */
  hasPreviousPage(currentPage: number): boolean {
    return currentPage > 0;
  }

  /**
   * Calculates the starting item number for display (1-based).
   * @param pageNumber Current page number (0-based)
   * @param pageSize Number of items per page
   * @returns Starting item number for display
   */
  getStartItem(pageNumber: number, pageSize: number): number {
    return pageNumber * pageSize + 1;
  }

  /**
   * Calculates the ending item number for display (1-based).
   * @param pageNumber Current page number (0-based)
   * @param pageSize Number of items per page
   * @param totalElements Total number of items
   * @returns Ending item number for display
   */
  getEndItem(pageNumber: number, pageSize: number, totalElements: number): number {
    const end = (pageNumber + 1) * pageSize;
    return Math.min(end, totalElements);
  }
}
