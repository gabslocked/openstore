export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8 text-center text-white">
          Política de <span className="text-white">Privacidade</span>
        </h1>

        <div className="prose prose-invert max-w-none">
          <div className="bg-gradient-to-br from-[#0a0800] to-black p-8 rounded-lg border border-yellow-800/30 shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-white">1. Informações Coletadas</h2>
            <p className="text-gray-300 mb-4">
              Coletamos apenas as informações necessárias para processar seus pedidos e melhorar sua experiência de
              compra:
            </p>
            <ul className="list-disc pl-6 text-gray-300 mb-8">
              <li>Nome e informações de contato para entrega</li>
              <li>Endereço de entrega</li>
              <li>Histórico de pedidos</li>
              <li>Preferências de produtos</li>
            </ul>

            <h2 className="text-2xl font-semibold mb-6 text-white">2. Uso das Informações</h2>
            <p className="text-gray-300 mb-4">Suas informações são utilizadas exclusivamente para:</p>
            <ul className="list-disc pl-6 text-gray-300 mb-8">
              <li>Processar e entregar seus pedidos</li>
              <li>Comunicar o status do pedido</li>
              <li>Melhorar nossos produtos e serviços</li>
              <li>Enviar atualizações sobre produtos (mediante sua autorização)</li>
            </ul>

            <h2 className="text-2xl font-semibold mb-6 text-white">3. Proteção de Dados</h2>
            <p className="text-gray-300 mb-4">
              Mantemos rigorosos padrões de segurança para proteger suas informações:
            </p>
            <ul className="list-disc pl-6 text-gray-300 mb-8">
              <li>Criptografia de dados sensíveis</li>
              <li>Acesso restrito a informações pessoais</li>
              <li>Monitoramento regular de segurança</li>
              <li>Atualizações constantes de nossos sistemas de proteção</li>
            </ul>

            <h2 className="text-2xl font-semibold mb-6 text-white">4. Seus Direitos</h2>
            <p className="text-gray-300 mb-4">Você tem direito a:</p>
            <ul className="list-disc pl-6 text-gray-300 mb-8">
              <li>Acessar suas informações pessoais</li>
              <li>Solicitar correções em seus dados</li>
              <li>Solicitar a exclusão de seus dados</li>
              <li>Optar por não receber comunicações de marketing</li>
            </ul>

            <h2 className="text-2xl font-semibold mb-6 text-white">5. Contato</h2>
            <p className="text-gray-300">
              Para questões relacionadas à sua privacidade, entre em contato conosco através do WhatsApp ou email.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
