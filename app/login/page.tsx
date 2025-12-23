import { UserLoginForm } from "./user-login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4">
      <div className="container mx-auto max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Entrar na sua conta</h1>
          <p className="text-gray-400">Digite suas credenciais para acessar</p>
        </div>
        <UserLoginForm />
      </div>
    </div>
  )
}
