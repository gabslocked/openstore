/**
 * Base error class for domain errors
 * All domain-specific errors should extend this class
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}

/**
 * Error thrown when a required entity is not found
 */
export class NotFoundError extends DomainError {
  constructor(entity: string, identifier?: string) {
    super(identifier ? `${entity} not found: ${identifier}` : `${entity} not found`);
    this.name = 'NotFoundError';
  }
}

/**
 * Error thrown when a validation fails
 */
export class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
