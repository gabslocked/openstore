export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8 text-center text-white">
          Termos de <span className="text-white">Serviço</span>
        </h1>

        <div className="prose prose-invert max-w-none">
          <div className="bg-gradient-to-br from-[#0a0800] to-black p-8 rounded-lg border border-yellow-800/30 shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-white">1. Aceitação dos Termos</h2>
            <p className="text-gray-300 mb-8">
              Ao acessar e utilizar este site, você concorda em cumprir e estar vinculado aos seguintes termos e
              condições de uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nosso site.
            </p>

            <h2 className="text-2xl font-semibold mb-6 text-white">2. Produtos e Serviços</h2>
            <p className="text-gray-300 mb-4">
              Todos os produtos são destinados exclusivamente para maiores de 18 anos.
            </p>
            <ul className="list-disc pl-6 text-gray-300 mb-8">
              <li>É necessário apresentar documento de identificação na entrega</li>
              <li>Não realizamos vendas para menores de idade</li>
              <li>Reservamo-nos o direito de recusar pedidos suspeitos</li>
            </ul>

            <h2 className="text-2xl font-semibold mb-6 text-white">3. Pedidos e Pagamentos</h2>
            <p className="text-gray-300 mb-4">Ao realizar um pedido em nossa loja:</p>
            <ul className="list-disc pl-6 text-gray-300 mb-8">
              <li>Você confirma que todas as informações fornecidas são precisas</li>
              <li>Os preços podem ser alterados sem aviso prévio</li>
              <li>A confirmação do pedido será enviada por WhatsApp</li>
              <li>Pagamentos são processados de forma segura</li>
            </ul>

            <h2 className="text-2xl font-semibold mb-6 text-white">4. Entrega</h2>
            <p className="text-gray-300 mb-4">Nossa política de entrega inclui:</p>
            <ul className="list-disc pl-6 text-gray-300 mb-8">
              <li>Verificação de idade no momento da entrega</li>
              <li>Entrega apenas para o titular do pedido</li>
              <li>Prazos de entrega estimados não são garantidos</li>
              <li>Taxas de entrega podem variar por região</li>
            </ul>

            <h2 className="text-2xl font-semibold mb-6 text-white">5. Devoluções</h2>
            <p className="text-gray-300 mb-4">Nossa política de devoluções:</p>
            <ul className="list-disc pl-6 text-gray-300 mb-8">
              <li>Produtos com defeito podem ser trocados em até 7 dias</li>
              <li>O produto deve estar em sua embalagem original</li>
              <li>Custos de devolução são de responsabilidade do cliente</li>
              <li>Reembolsos são processados após a inspeção do produto</li>
            </ul>

            <h2 className="text-2xl font-semibold mb-6 text-white">6. Alterações nos Termos</h2>
            <p className="text-gray-300">
              Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entram em vigor
              imediatamente após sua publicação no site. O uso continuado de nossos serviços após tais modificações
              constitui sua aceitação dos novos termos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
