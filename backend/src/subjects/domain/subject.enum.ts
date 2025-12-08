/**
 * SubjectType Enum
 * Defines all valid subject/topic names for message publishing
 */
export enum SubjectType {
  SPORTS = 'sports',
  HEALTHY = 'healthy',
  NEWS = 'news',
  FOOD = 'food',
  AUTOS = 'autos',
}

/**
 * Get all valid subject types
 */
export const VALID_SUBJECTS = Object.values(SubjectType);

/**
 * Check if a subject is valid
 */
export function isValidSubject(subject: string): subject is SubjectType {
  return VALID_SUBJECTS.includes(subject as SubjectType);
}
