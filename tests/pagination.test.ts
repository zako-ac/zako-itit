import { paginateIssues, PaginatedResult } from '../src/utils/pagination';
import { Issue, IssueTag, IssueStatus } from '../src/types/issue';

describe('paginateIssues', () => {
  const createMockIssue = (id: number): Issue => ({
    id,
    name: `Issue ${id}`,
    detail: `Detail for issue ${id}`,
    tag: IssueTag.Bug,
    status: IssueStatus.Proposed,
    userId: `user${id}`
  });

  const createMockIssues = (count: number): Issue[] => {
    return Array.from({ length: count }, (_, i) => createMockIssue(i + 1));
  };

  describe('with empty array', () => {
    it('should return empty items with correct metadata', () => {
      const result = paginateIssues([], 1, 10);

      expect(result.items).toEqual([]);
      expect(result.totalCount).toBe(0);
      expect(result.totalPages).toBe(0);
      expect(result.currentPage).toBe(1);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrevious).toBe(false);
    });
  });

  describe('with single page of results', () => {
    it('should return all items when count is less than page size', () => {
      const issues = createMockIssues(3);
      const result = paginateIssues(issues, 1, 10);

      expect(result.items).toHaveLength(3);
      expect(result.totalCount).toBe(3);
      expect(result.totalPages).toBe(1);
      expect(result.currentPage).toBe(1);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrevious).toBe(false);
    });

    it('should return all items when count equals page size', () => {
      const issues = createMockIssues(10);
      const result = paginateIssues(issues, 1, 10);

      expect(result.items).toHaveLength(10);
      expect(result.totalCount).toBe(10);
      expect(result.totalPages).toBe(1);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrevious).toBe(false);
    });
  });

  describe('with multiple pages', () => {
    it('should return first page correctly', () => {
      const issues = createMockIssues(25);
      const result = paginateIssues(issues, 1, 10);

      expect(result.items).toHaveLength(10);
      expect(result.items[0].id).toBe(1);
      expect(result.items[9].id).toBe(10);
      expect(result.totalCount).toBe(25);
      expect(result.totalPages).toBe(3);
      expect(result.currentPage).toBe(1);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrevious).toBe(false);
    });

    it('should return middle page correctly', () => {
      const issues = createMockIssues(25);
      const result = paginateIssues(issues, 2, 10);

      expect(result.items).toHaveLength(10);
      expect(result.items[0].id).toBe(11);
      expect(result.items[9].id).toBe(20);
      expect(result.currentPage).toBe(2);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrevious).toBe(true);
    });

    it('should return last page correctly', () => {
      const issues = createMockIssues(25);
      const result = paginateIssues(issues, 3, 10);

      expect(result.items).toHaveLength(5);
      expect(result.items[0].id).toBe(21);
      expect(result.items[4].id).toBe(25);
      expect(result.currentPage).toBe(3);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrevious).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should clamp page number to 1 when page is 0 or negative', () => {
      const issues = createMockIssues(10);

      const result0 = paginateIssues(issues, 0, 5);
      expect(result0.currentPage).toBe(1);
      expect(result0.items[0].id).toBe(1);

      const resultNeg = paginateIssues(issues, -5, 5);
      expect(resultNeg.currentPage).toBe(1);
      expect(resultNeg.items[0].id).toBe(1);
    });

    it('should clamp page number to max when page exceeds total pages', () => {
      const issues = createMockIssues(10);
      const result = paginateIssues(issues, 100, 5);

      expect(result.currentPage).toBe(2);
      expect(result.items[0].id).toBe(6);
    });

    it('should handle page size of 1', () => {
      const issues = createMockIssues(3);
      const result = paginateIssues(issues, 2, 1);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe(2);
      expect(result.totalPages).toBe(3);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrevious).toBe(true);
    });
  });
});
