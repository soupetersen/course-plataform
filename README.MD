# EduMy

Uma plataforma moderna de ensino online que permite criar, vender e consumir cursos de forma simples e eficiente.

## Principais Funcionalidades

- **Criação de Cursos**: Interface intuitiva para instrutores criarem e organizarem seu conteúdo
- **Player de Vídeo**: Reprodução otimizada com controle de progresso
- **Sistema de Avaliações**: Reviews e ratings para cursos
- **Pagamentos Integrados**: Suporte a PIX, cartão de crédito via Mercado Pago
- **Dashboard Completo**: Área administrativa para instrutores e alunos
- **Sistema de Cupons**: Descontos e promoções
- **Responsivo**: Funciona perfeitamente em mobile e desktop

## Tecnologias Utilizadas

### Backend
- **Node.js + TypeScript** - Base sólida para desenvolvimento backend moderno
- **Fastify** - Framework web rápido e eficiente, ideal para APIs
- **PostgreSQL** - Banco de dados robusto e confiável
- **Prisma** - ORM que simplifica operações no banco e migrações
- **Clean Architecture** - Organização em camadas para facilitar manutenção

### Frontend
- **React** - Biblioteca popular com grande comunidade
- **TypeScript** - Adiciona tipagem para prevenir erros
- **Vite** - Build tool moderna e super rápida
- **TailwindCSS** - Framework CSS utilitário para estilização ágil
- **TanStack Query** - Gerenciamento de estado e cache de dados da API

### Pagamentos e Outras Ferramentas
- **Mercado Pago** - Gateway de pagamento brasileiro com suporte a PIX
- **Stripe** - Preparado para expansão internacional
- **Docker** - Containerização para ambiente consistente
- **JWT** - Autenticação segura e stateless
- **Resend** - Envio de emails automáticos
- **Lucide Icons** - Biblioteca de ícones moderna
- **Zod** - Validação robusta de dados

## Estrutura do Projeto

```
EduMy/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Endpoints da API
│   │   ├── use-cases/       # Regras de negócio
│   │   ├── repositories/    # Acesso aos dados
│   │   ├── services/        # Serviços externos
│   │   └── models/          # Entidades do domínio
│   └── prisma/             # Schema e migrações do banco
└── frontend/
    └── src/
        ├── components/      # Componentes reutilizáveis
        ├── pages/          # Páginas da aplicação
        ├── hooks/          # Custom hooks
        └── services/       # Comunicação com API
```

## Configuração do Ambiente

### Pré-requisitos
- Node.js 18+
- PostgreSQL 15+
- Docker

### Instalação

1. Clone o repositório
2. Configure as variáveis de ambiente (copie os arquivos .env.example)
3. Execute as migrações do banco de dados
4. Instale as dependências e execute os projetos

### Executando com Docker (Recomendado)

O backend foi configurado para rodar completamente no Docker, incluindo banco de dados PostgreSQL e a API.

#### Configuração Inicial
1. Navegue até a pasta do backend:
```bash
cd backend
```

2. Copie o arquivo de exemplo das variáveis de ambiente:
```bash
cp .env.example .env
```

3. Edite o arquivo `.env` com suas configurações (mantenha as URLs do banco apontando para os containers)

#### Ambiente de Desenvolvimento
Para desenvolvimento com hot-reload e volumes montados:

```bash
docker-compose --profile development up -d
```

Isso irá iniciar:
- **PostgreSQL** na porta 5432
- **API em desenvolvimento** na porta 3000 (com hot-reload)
- **Prisma Studio** disponível na porta 5556 (opcional)

#### Ambiente de Produção
Para ambiente de produção otimizado:

```bash
docker-compose --profile production up -d
```

#### Comandos Úteis

```bash
docker-compose logs -f api-dev

docker-compose exec api-dev pnpm exec prisma migrate dev

docker-compose --profile development up prisma-studio-dev -d

docker-compose down

docker-compose down -v
```

### Instalação Manual (Alternativa)

Se preferir não usar Docker:

#### Backend
```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

#### Frontend  
```bash
cd frontend
npm install
npm run dev
```

## Licença

Este projeto está sob licença MIT. Veja o arquivo LICENSE para mais detalhes.