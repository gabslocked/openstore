import { ValidationError } from '../errors/domain-error';

/**
 * Value Object representing a Brazilian document (CPF or CNPJ)
 */
export class Document {
  private constructor(
    private readonly value: string,
    private readonly type: 'CPF' | 'CNPJ'
  ) {}

  /**
   * Create a Document from a raw string (with or without formatting)
   */
  static create(raw: string): Document {
    const cleaned = raw.replace(/\D/g, '');

    if (cleaned.length === 11) {
      if (!Document.isValidCPF(cleaned)) {
        throw new ValidationError('Invalid CPF', 'document', raw);
      }
      return new Document(cleaned, 'CPF');
    }

    if (cleaned.length === 14) {
      if (!Document.isValidCNPJ(cleaned)) {
        throw new ValidationError('Invalid CNPJ', 'document', raw);
      }
      return new Document(cleaned, 'CNPJ');
    }

    throw new ValidationError('Document must be a valid CPF (11 digits) or CNPJ (14 digits)', 'document', raw);
  }

  /**
   * Get raw value (digits only)
   */
  get raw(): string {
    return this.value;
  }

  /**
   * Get document type
   */
  get documentType(): 'CPF' | 'CNPJ' {
    return this.type;
  }

  /**
   * Check if it's a CPF
   */
  isCPF(): boolean {
    return this.type === 'CPF';
  }

  /**
   * Check if it's a CNPJ
   */
  isCNPJ(): boolean {
    return this.type === 'CNPJ';
  }

  /**
   * Get formatted value (with punctuation)
   */
  get formatted(): string {
    if (this.type === 'CPF') {
      return this.value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return this.value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  /**
   * Check equality with another Document
   */
  equals(other: Document): boolean {
    return this.value === other.value;
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      value: this.value,
      type: this.type,
      formatted: this.formatted,
    };
  }

  /**
   * Validate CPF using the official algorithm
   */
  private static isValidCPF(cpf: string): boolean {
    // Check for known invalid patterns
    if (/^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    // Validate first check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;

    // Validate second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;

    return true;
  }

  /**
   * Validate CNPJ using the official algorithm
   */
  private static isValidCNPJ(cnpj: string): boolean {
    // Check for known invalid patterns
    if (/^(\d)\1{13}$/.test(cnpj)) {
      return false;
    }

    // Validate first check digit
    let length = cnpj.length - 2;
    let numbers = cnpj.substring(0, length);
    const digits = cnpj.substring(length);
    let sum = 0;
    let pos = length - 7;

    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    // Validate second check digit
    length = length + 1;
    numbers = cnpj.substring(0, length);
    sum = 0;
    pos = length - 7;

    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
  }
}
