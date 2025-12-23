import { RegistrationForm } from "./registration-form"

export default function CadastroPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Criar Nova Conta</h1>
          <p className="text-gray-400">Preencha os dados abaixo para se cadastrar</p>
        </div>
        <RegistrationForm />
      </div>
    </div>
  )
}
