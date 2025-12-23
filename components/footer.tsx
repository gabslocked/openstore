import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-black/80 backdrop-blur-md border-t border-yellow-800/20 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0 flex flex-col items-center md:items-start">
            <img
              src="/ezpods-logo.png"
              alt="EzPods Logo"
              className="w-auto filter brightness-0 invert mb-3 h-16 py-0"
            />
            <p className="text-white/80 text-sm mt-2 max-w-xs">
              Pods premium para uma experiência única. Qualidade e variedade para todos os gostos.
            </p>
          </div>

          <div className="text-center md:text-right">
            <p className="text-white/90 text-sm">© {new Date().getFullYear()} EZPods. Todos os direitos reservados.</p>
            <p className="text-white/90 text-sm mt-1">Proibida a venda para menores de 18 anos.</p>
            <div className="mt-3 text-xs text-white/80">
              <Link href="/terms" className="hover:text-[#2017C2] transition-colors">
                Termos de Uso
              </Link>
              {" • "}
              <Link href="/privacy" className="hover:text-[#2017C2] transition-colors">
                Política de Privacidade
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
