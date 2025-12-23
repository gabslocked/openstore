/**
 * Máscaras e formatadores para campos de formulário
 */

/**
 * Aplica máscara de CEP (00000-000)
 */
export function maskCEP(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{5})(\d)/, '$1-$2')
    .substring(0, 9)
}

/**
 * Aplica máscara de telefone (00) 00000-0000 ou (00) 0000-0000
 */
export function maskPhone(value: string): string {
  const numbers = value.replace(/\D/g, '')
  
  if (numbers.length <= 10) {
    // (00) 0000-0000
    return numbers
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 14)
  } else {
    // (00) 00000-0000
    return numbers
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 15)
  }
}

/**
 * Aplica máscara de CPF (000.000.000-00) ou CNPJ (00.000.000/0000-00)
 */
export function maskDocument(value: string): string {
  const numbers = value.replace(/\D/g, '')
  
  if (numbers.length <= 11) {
    // CPF: 000.000.000-00
    return numbers
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1-$2')
      .substring(0, 14)
  } else {
    // CNPJ: 00.000.000/0000-00
    return numbers
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 18)
  }
}

/**
 * Remove máscara deixando apenas números
 */
export function unmask(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Valida CEP (8 dígitos)
 */
export function isValidCEP(cep: string): boolean {
  const numbers = unmask(cep)
  return numbers.length === 8
}

/**
 * Valida telefone (10 ou 11 dígitos)
 */
export function isValidPhone(phone: string): boolean {
  const numbers = unmask(phone)
  return numbers.length >= 10 && numbers.length <= 11
}

/**
 * Valida CPF
 */
export function isValidCPF(cpf: string): boolean {
  const numbers = unmask(cpf)
  
  if (numbers.length !== 11) return false
  if (/^(\d)\1+$/.test(numbers)) return false // Todos os dígitos iguais
  
  // Validação do primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i)
  }
  let digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0
  if (digit !== parseInt(numbers.charAt(9))) return false
  
  // Validação do segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i)
  }
  digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0
  if (digit !== parseInt(numbers.charAt(10))) return false
  
  return true
}

/**
 * Valida CNPJ
 */
export function isValidCNPJ(cnpj: string): boolean {
  const numbers = unmask(cnpj)
  
  if (numbers.length !== 14) return false
  if (/^(\d)\1+$/.test(numbers)) return false // Todos os dígitos iguais
  
  // Validação do primeiro dígito verificador
  let sum = 0
  let weight = 5
  for (let i = 0; i < 12; i++) {
    sum += parseInt(numbers.charAt(i)) * weight
    weight = weight === 2 ? 9 : weight - 1
  }
  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (digit !== parseInt(numbers.charAt(12))) return false
  
  // Validação do segundo dígito verificador
  sum = 0
  weight = 6
  for (let i = 0; i < 13; i++) {
    sum += parseInt(numbers.charAt(i)) * weight
    weight = weight === 2 ? 9 : weight - 1
  }
  digit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (digit !== parseInt(numbers.charAt(13))) return false
  
  return true
}

/**
 * Valida CPF ou CNPJ
 */
export function isValidDocument(document: string): boolean {
  const numbers = unmask(document)
  
  if (numbers.length === 11) {
    return isValidCPF(document)
  } else if (numbers.length === 14) {
    return isValidCNPJ(document)
  }
  
  return false
}
