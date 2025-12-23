<div align="center">

# 🛒 OpenStore

### Modern Open Source E-commerce Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-blue)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)](https://www.docker.com/)

**[English](#-english)** · **[Português](#-português)** · **[Español](#-español)**

</div>

---

<a name="-english"></a>
## 🇺🇸 English

### What is OpenStore?

OpenStore is a **production-ready, fully customizable e-commerce platform** built with modern technologies. Deploy your online store in minutes with a beautiful setup wizard, multiple payment gateways, and complete admin dashboard.

### ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🎨 **Visual Customization** | Configure colors, logo, hero banner/video via admin interface |
| 💳 **Multiple Payment Gateways** | GreenPag, Stripe, MercadoPago - easily add more |
| 🏗️ **Hexagonal Architecture** | Clean, maintainable, and testable code |
| 🚀 **Onboarding Wizard** | Beautiful step-by-step initial setup |
| 📱 **Responsive Design** | Works perfectly on mobile and desktop |
| 🐳 **Docker Ready** | Deploy anywhere with Docker Compose |
| 🔐 **Secure by Default** | JWT auth, encrypted API keys, HMAC webhooks |

### 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/openstore.git
cd openstore

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL, JWT_SECRET, ENCRYPTION_KEY

# Run migrations
pnpm db:migrate

# Start development server
pnpm dev
```

Visit [http://localhost:3000/onboarding](http://localhost:3000/onboarding) to start the setup wizard!

### 🐳 Docker Deployment

```bash
docker-compose up -d
```

This starts PostgreSQL (port 5432), the Next.js app (port 3000), and Adminer (port 8080).

### 📁 Project Structure

```
openstore/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard & settings
│   ├── api/               # API routes
│   ├── onboarding/        # Setup wizard
│   └── checkout/          # Checkout flow
├── components/            # React components
├── lib/                   # Core business logic
│   ├── adapters/         # Payment gateway adapters
│   ├── core/             # Domain logic (hexagonal)
│   └── infrastructure/   # Database, Auth
├── migrations/            # SQL migrations
└── docker-compose.yml
```

### 💳 Payment Gateways

| Gateway | Methods | Status |
|---------|---------|--------|
| **GreenPag** | PIX | ✅ Ready |
| **Stripe** | Card, PIX, Boleto | ✅ Ready |
| **MercadoPago** | Card, PIX, Boleto | ✅ Ready |

Configure via Admin → Integrations with visual interface (no code needed!).

---

<a name="-português"></a>
## 🇧🇷 Português

### O que é o OpenStore?

OpenStore é uma **plataforma de e-commerce pronta para produção e totalmente customizável**, construída com tecnologias modernas. Implante sua loja online em minutos com um wizard de configuração bonito, múltiplos gateways de pagamento e painel admin completo.

### ✨ Principais Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| 🎨 **Customização Visual** | Configure cores, logo, banner/vídeo via interface admin |
| 💳 **Múltiplos Gateways** | GreenPag, Stripe, MercadoPago - adicione mais facilmente |
| 🏗️ **Arquitetura Hexagonal** | Código limpo, manutenível e testável |
| 🚀 **Wizard de Onboarding** | Setup inicial bonito passo a passo |
| 📱 **Design Responsivo** | Funciona perfeitamente em mobile e desktop |
| 🐳 **Docker Ready** | Deploy em qualquer lugar com Docker Compose |
| 🔐 **Seguro por Padrão** | Auth JWT, API keys criptografadas, webhooks HMAC |

### 🚀 Início Rápido

```bash
# Clone o repositório
git clone https://github.com/your-username/openstore.git
cd openstore

# Instale as dependências
pnpm install

# Configure o ambiente
cp .env.example .env.local
# Edite .env.local com DATABASE_URL, JWT_SECRET, ENCRYPTION_KEY

# Execute as migrations
pnpm db:migrate

# Inicie o servidor de desenvolvimento
pnpm dev
```

Acesse [http://localhost:3000/onboarding](http://localhost:3000/onboarding) para iniciar o wizard!

### 🐳 Deploy com Docker

```bash
docker-compose up -d
```

Isso inicia PostgreSQL (porta 5432), a aplicação Next.js (porta 3000) e Adminer (porta 8080).

### 📦 Funcionalidades Detalhadas

#### Sistema de Customização
- **Cores do Tema**: Escolha cores primárias, secundárias e de destaque
- **Logo**: Configure logo para tema claro e escuro
- **Hero Section**: Banner de imagem ou vídeo na homepage
- **SEO**: Meta tags, Open Graph, sitemap automático

#### Gateways de Pagamento
Configure via Admin → Integrações com interface visual (sem código!):
- **GreenPag**: Pagamentos PIX para o Brasil
- **Stripe**: Cartões, PIX, Boleto
- **MercadoPago**: Cartões, PIX, Boleto

#### Painel Admin
- Gerenciamento de produtos e categorias
- Gerenciamento de pedidos
- Configurações da loja
- Integrações de pagamento

---

<a name="-español"></a>
## 🇪🇸 Español

### ¿Qué es OpenStore?

OpenStore es una **plataforma de e-commerce lista para producción y totalmente personalizable**, construida con tecnologías modernas. Despliega tu tienda online en minutos con un wizard de configuración hermoso, múltiples pasarelas de pago y panel admin completo.

### ✨ Características Principales

| Característica | Descripción |
|----------------|-------------|
| 🎨 **Personalización Visual** | Configura colores, logo, banner/video vía interfaz admin |
| 💳 **Múltiples Pasarelas** | GreenPag, Stripe, MercadoPago - añade más fácilmente |
| 🏗️ **Arquitectura Hexagonal** | Código limpio, mantenible y testeable |
| 🚀 **Wizard de Onboarding** | Configuración inicial paso a paso |
| 📱 **Diseño Responsivo** | Funciona perfectamente en móvil y escritorio |
| 🐳 **Docker Ready** | Despliega en cualquier lugar con Docker Compose |
| 🔐 **Seguro por Defecto** | Auth JWT, API keys encriptadas, webhooks HMAC |

### 🚀 Inicio Rápido

```bash
# Clona el repositorio
git clone https://github.com/your-username/openstore.git
cd openstore

# Instala las dependencias
pnpm install

# Configura el ambiente
cp .env.example .env.local
# Edita .env.local con DATABASE_URL, JWT_SECRET, ENCRYPTION_KEY

# Ejecuta las migraciones
pnpm db:migrate

# Inicia el servidor de desarrollo
pnpm dev
```

Visita [http://localhost:3000/onboarding](http://localhost:3000/onboarding) para iniciar el wizard!

### 🐳 Despliegue con Docker

```bash
docker-compose up -d
```

Esto inicia PostgreSQL (puerto 5432), la aplicación Next.js (puerto 3000) y Adminer (puerto 8080).

---

## 🤝 Contributing / Contribuindo / Contribuyendo

We love contributions! Here's how you can help:

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Areas We Need Help

| Area | Description |
|------|-------------|
| 🌍 **Translations** | Help translate the UI to more languages |
| 💳 **Payment Gateways** | Add support for more payment providers |
| 📚 **Documentation** | Improve docs and add tutorials |
| 🧪 **Testing** | Add unit and integration tests |
| 🎨 **UI/UX** | Improve the design and user experience |
| 🐛 **Bug Fixes** | Help fix issues and improve stability |

### Development Setup

```bash
pnpm install      # Install dependencies
pnpm dev          # Start development server
pnpm type-check   # Type checking
pnpm lint         # Linting
pnpm build        # Build for production
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [PostgreSQL](https://www.postgresql.org/) - The World's Most Advanced Database
- [Lucide](https://lucide.dev/) - Beautiful icons

---

<div align="center">

**Built with ❤️ for the open source community**

[⬆ Back to top](#-openstore)

</div>
