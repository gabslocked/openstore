/**
 * Utilitários para busca de CEP
 */

export interface AddressData {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

/**
 * Busca endereço pelo CEP usando ViaCEP
 */
export async function fetchAddressByCEP(cep: string): Promise<AddressData | null> {
  try {
    const cleanCEP = cep.replace(/\D/g, '')
    
    if (cleanCEP.length !== 8) {
      throw new Error('CEP inválido')
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
    
    if (!response.ok) {
      throw new Error('Erro ao buscar CEP')
    }

    const data: AddressData = await response.json()
    
    if (data.erro) {
      throw new Error('CEP não encontrado')
    }

    return data
  } catch (error) {
    console.error('Erro ao buscar CEP:', error)
    return null
  }
}

/**
 * Formata CEP para exibição (00000-000)
 */
export function formatCEP(cep: string): string {
  const cleanCEP = cep.replace(/\D/g, '')
  if (cleanCEP.length !== 8) return cep
  return `${cleanCEP.slice(0, 5)}-${cleanCEP.slice(5)}`
}
