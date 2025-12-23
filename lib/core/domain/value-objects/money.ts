import { ValidationError } from '../errors/domain-error';

/**
 * Value Object representing monetary values
 * Stores values in cents to avoid floating point issues
 */
export class Money {
  private constructor(
    private readonly cents: number,
    private readonly currency: string = 'BRL'
  ) {}

  /**
   * Create Money from cents (integer)
   */
  static fromCents(cents: number, currency = 'BRL'): Money {
    if (!Number.isInteger(cents)) {
      throw new ValidationError('Cents must be an integer', 'cents', cents);
    }
    if (cents < 0) {
      throw new ValidationError('Amount cannot be negative', 'cents', cents);
    }
    return new Money(cents, currency);
  }

  /**
   * Create Money from decimal value (e.g., 10.50)
   */
  static fromDecimal(amount: number, currency = 'BRL'): Money {
    if (amount < 0) {
      throw new ValidationError('Amount cannot be negative', 'amount', amount);
    }
    return Money.fromCents(Math.round(amount * 100), currency);
  }

  /**
   * Create Money with zero value
   */
  static zero(currency = 'BRL'): Money {
    return new Money(0, currency);
  }

  /**
   * Get value in decimal format (e.g., 10.50)
   */
  get value(): number {
    return this.cents / 100;
  }

  /**
   * Get value in cents
   */
  get inCents(): number {
    return this.cents;
  }

  /**
   * Get currency code
   */
  get currencyCode(): string {
    return this.currency;
  }

  /**
   * Add two Money values
   */
  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return Money.fromCents(this.cents + other.cents, this.currency);
  }

  /**
   * Subtract Money value
   */
  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    const result = this.cents - other.cents;
    if (result < 0) {
      throw new ValidationError('Subtraction would result in negative amount');
    }
    return Money.fromCents(result, this.currency);
  }

  /**
   * Multiply by a factor
   */
  multiply(factor: number): Money {
    return Money.fromCents(Math.round(this.cents * factor), this.currency);
  }

  /**
   * Check if equal to another Money
   */
  equals(other: Money): boolean {
    return this.cents === other.cents && this.currency === other.currency;
  }

  /**
   * Check if greater than another Money
   */
  greaterThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this.cents > other.cents;
  }

  /**
   * Check if less than another Money
   */
  lessThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this.cents < other.cents;
  }

  /**
   * Check if zero
   */
  isZero(): boolean {
    return this.cents === 0;
  }

  /**
   * Format as currency string (e.g., "R$ 10,50")
   */
  format(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: this.currency,
    }).format(this.value);
  }

  /**
   * Convert to JSON-serializable object
   */
  toJSON() {
    return {
      cents: this.cents,
      value: this.value,
      currency: this.currency,
      formatted: this.format(),
    };
  }

  private ensureSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new ValidationError(
        `Cannot operate on different currencies: ${this.currency} vs ${other.currency}`
      );
    }
  }
}
