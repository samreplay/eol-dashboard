/**
 * Filter Evaluation Utility
 * Logic for evaluating filter conditions against product data
 */

import type { ProductWithCalculations } from '~/types/database';
import type { FilterCondition, FilterGroup } from '~/types/filters';

/**
 * Evaluate a single filter condition against a product
 */
export function evaluateCondition(
  product: ProductWithCalculations,
  condition: FilterCondition
): boolean {
  const value = product[condition.field];

  // Handle null/undefined values
  if (value === null || value === undefined) {
    return false;
  }

  switch (condition.type) {
    case 'text':
      return evaluateTextCondition(String(value), condition);

    case 'number':
      return evaluateNumberCondition(Number(value), condition);

    case 'date':
      return evaluateDateCondition(String(value), condition);

    default:
      return false;
  }
}

/**
 * Evaluate text field condition
 */
function evaluateTextCondition(value: string, condition: FilterCondition): boolean {
  const searchValue = String(condition.value).toLowerCase();
  const fieldValue = value.toLowerCase();

  switch (condition.operator) {
    case 'contains':
      return fieldValue.includes(searchValue);

    case 'equals':
      return fieldValue === searchValue;

    case 'starts_with':
      return fieldValue.startsWith(searchValue);

    case 'ends_with':
      return fieldValue.endsWith(searchValue);

    case 'not_contains':
      return !fieldValue.includes(searchValue);

    default:
      return false;
  }
}

/**
 * Evaluate number field condition
 */
function evaluateNumberCondition(value: number, condition: FilterCondition): boolean {
  const compareValue = Number(condition.value);

  if (isNaN(compareValue)) {
    return false;
  }

  switch (condition.operator) {
    case 'equals':
      return value === compareValue;

    case 'not_equals':
      return value !== compareValue;

    case 'greater_than':
      return value > compareValue;

    case 'greater_than_or_equal':
      return value >= compareValue;

    case 'less_than':
      return value < compareValue;

    case 'less_than_or_equal':
      return value <= compareValue;

    case 'between': {
      const min = Number(condition.value);
      const max = Number(condition.value2);
      if (isNaN(min) || isNaN(max)) {
        return false;
      }
      return value >= min && value <= max;
    }

    default:
      return false;
  }
}

/**
 * Evaluate date field condition
 */
function evaluateDateCondition(value: string, condition: FilterCondition): boolean {
  const fieldDate = new Date(value);
  const compareDate = new Date(condition.value);

  if (isNaN(fieldDate.getTime()) || isNaN(compareDate.getTime())) {
    return false;
  }

  // Reset time to midnight for date-only comparison
  fieldDate.setHours(0, 0, 0, 0);
  compareDate.setHours(0, 0, 0, 0);

  switch (condition.operator) {
    case 'equals':
      return fieldDate.getTime() === compareDate.getTime();

    case 'before':
      return fieldDate.getTime() < compareDate.getTime();

    case 'after':
      return fieldDate.getTime() > compareDate.getTime();

    case 'between': {
      const startDate = new Date(condition.value);
      const endDate = new Date(condition.value2);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return false;
      }

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      const time = fieldDate.getTime();
      return time >= startDate.getTime() && time <= endDate.getTime();
    }

    default:
      return false;
  }
}

/**
 * Evaluate a filter group with AND/OR logic
 */
export function evaluateGroup(
  product: ProductWithCalculations,
  group: FilterGroup
): boolean {
  if (!group.conditions || group.conditions.length === 0) {
    return true; // Empty group = no filtering
  }

  const results = group.conditions.map((condition) =>
    evaluateCondition(product, condition)
  );

  if (group.logic === 'AND') {
    return results.every((result) => result === true);
  } else {
    // OR logic
    return results.some((result) => result === true);
  }
}

/**
 * Evaluate multiple filter groups (for future multi-group support)
 */
export function evaluateFilters(
  product: ProductWithCalculations,
  groups: FilterGroup[],
  groupLogic: 'AND' | 'OR' = 'AND'
): boolean {
  if (!groups || groups.length === 0) {
    return true;
  }

  const results = groups.map((group) => evaluateGroup(product, group));

  if (groupLogic === 'AND') {
    return results.every((result) => result === true);
  } else {
    return results.some((result) => result === true);
  }
}
