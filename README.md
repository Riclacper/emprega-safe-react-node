# EmpregaSafe — React + Node + MongoDB + IA opcional

Sistema web para analisar a confiabilidade de vagas de emprego, identificar sinais de risco, possíveis golpes e tentativas de engenharia social contra candidatos.

O EmpregaSafe apoia candidatos antes que enviem dados pessoais, documentos, dinheiro ou avancem em processos seletivos com sinais de baixa confiabilidade.

## Funcionalidades principais

- Landing page pública com apresentação do sistema.
- Cadastro de usuário com nome, e-mail e senha.
- Login com e-mail e senha.
- Verificação de acesso por código de 6 dígitos enviado por e-mail, com campos
  individuais e suporte a copiar e colar.
- Recuperação de senha por código enviado por e-mail.
- Sessão protegida com JWT.
- Encerramento de sessão por logout.
- Controle de sessão no frontend.
- Análise de confiabilidade de vagas por regras locais.
- Análise complementar com IA, quando ativada.
- Classificação da vaga por nível de risco.
- Exibição dos motivos identificados na análise.
- Recomendação objetiva para o candidato.
- Suporte a salários em Real, Dólar e Euro.
- Exportação do resultado da análise em PDF.
- Dashboard com métricas, gráficos e últimas análises.
- Histórico de análises com busca, filtros, paginação, relatório detalhado e
  exportação em PDF.
- Cópia do ID da análise para vincular denúncias.
- Registro de denúncias de vagas suspeitas.
- Busca de análise existente no formulário de denúncia.
- Preenchimento automático de empresa, link, motivo e detalhes ao selecionar uma análise.
- Listagem de denúncias recentes.
- Envio de denúncia por e-mail diretamente pela interface.
- Página Sobre com explicação do projeto, pontuação e objetivo do sistema.
- Layout responsivo com menu mobile.
- Tema claro ou escuro aplicado automaticamente conforme a preferência do
  dispositivo.
- Persistência dos dados no MongoDB Atlas.
- Suítes automatizadas de testes unitários, segurança, E2E, acessibilidade e
  comparação de regras com IA.
- Pipeline de qualidade no GitHub Actions.

## Stack

- **Frontend:** React, Vite, JSX, React Router, Recharts, Lucide React
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Nodemailer
- **Banco de dados:** MongoDB Atlas
- **Autenticação:** JWT, senha criptografada com bcrypt e verificação por e-mail
- **E-mail:** Nodemailer com Gmail via senha de app
- **IA opcional:** OpenRouter ou OpenAI
- **Deploy sugerido:** Render para API e Netlify/Vercel para frontend

## Estrutura do projeto

```txt
emprega-safe-react-node/
├── backend/
│   ├── scripts/
│   │   ├── evaluate-ai.js
│   │   ├── seed-hybrid-analyses.js
│   │   └── seed-professional-analyses.js
│   ├── tests/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   ├── seed.js
│   │   └── server.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── render.yaml
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tests/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── netlify.toml
│   └── playwright.config.js
├── scripts/
│   └── check-secrets.js
├── .github/workflows/
│   └── quality.yml
├── TESTING.md
└── package.json
```

## Páginas do frontend

| Rota               | Descrição                                   | Acesso    |
| ------------------ | ------------------------------------------- | --------- |
| `/`                | Landing page demonstrativa                  | Público   |
| `/login`           | Login da plataforma                         | Público   |
| `/register`        | Criar conta                                 | Público   |
| `/verify`          | Validar código de acesso enviado por e-mail | Público   |
| `/forgot-password` | Solicitar recuperação de senha              | Público   |
| `/reset-password`  | Criar nova senha com código válido          | Público   |
| `/app`             | Dashboard / Painel de segurança             | Protegido |
| `/app/analisar`    | Analisar confiabilidade de vaga             | Protegido |
| `/app/historico`   | Histórico de análises                       | Protegido |
| `/app/denuncias`   | Registrar e consultar denúncias             | Protegido |
| `/app/sobre`       | Sobre o sistema                             | Protegido |

## Fluxo de autenticação

### Criar conta

1. O usuário acessa `/register`.
2. Informa nome, e-mail, senha e confirmação de senha.
3. O backend valida os dados.
4. A senha é criptografada com `bcryptjs`.
5. O usuário é salvo no MongoDB com `active: true`.
6. Após o cadastro, o usuário é redirecionado para `/login`.

### Login com verificação por e-mail

1. O usuário acessa `/login`.
2. Informa e-mail e senha.
3. O backend valida a senha criptografada.
4. Se `EMAIL_ENABLED=false`, o login entra direto em modo desenvolvimento.
5. Se `EMAIL_ENABLED=true`, o sistema gera um código de 6 dígitos.
6. O código é salvo temporariamente no usuário com validade de 10 minutos.
7. O sistema envia o código para o e-mail cadastrado.
8. O usuário é redirecionado para `/verify`.
9. Após informar o código correto, o backend emite o JWT.
10. O frontend salva a sessão no navegador e libera o acesso à área protegida.

### Recuperação de senha

1. O usuário clica em **Esqueci minha senha**.
2. Informa o e-mail cadastrado.
3. O sistema envia um código de 6 dígitos para o e-mail.
4. O usuário informa o código recebido.
5. O usuário cria uma nova senha.
6. O backend criptografa a nova senha com `bcryptjs`.
7. O código de recuperação é removido do banco.
8. O usuário volta para `/login`.

## Análise de vagas

A análise funciona em modo local ou híbrido.

- **Regras locais:** critérios automáticos do sistema para identificar sinais de risco.
- **Regras + IA:** regras locais combinadas com interpretação da descrição por inteligência artificial.

A IA não substitui as regras. Ela complementa a avaliação e ajuda a interpretar contexto, negações e descrições mais longas.

O resultado salvo registra o modo usado (`rules` ou `hybrid`), a pontuação
local, a pontuação da IA e a diferença entre as duas avaliações. Pisos de
segurança locais continuam sendo aplicados quando a resposta da IA entra em
conflito com sinais fortes de fraude.

## Classificação das vagas

Cada vaga recebe uma pontuação de risco de 0 a 100. Quanto maior a pontuação, maior o risco.

| Pontuação | Classificação | Interpretação                    |
| --------- | ------------- | -------------------------------- |
| 0 a 25    | Confiável     | Baixo risco aparente             |
| 26 a 55   | Suspeita      | Exige atenção antes de avançar   |
| 56 a 80   | Fraudulenta   | Possível tentativa de golpe      |
| 81 a 100  | Risco crítico | Risco grave; recomenda-se evitar |

## Sinais analisados

O sistema avalia sinais como:

- cobrança antecipada;
- pedido de pagamento, curso obrigatório, taxa de ativação ou taxa cadastral;
- solicitação de documentos antes de proposta formal;
- solicitação de dados bancários, chave Pix, IBAN ou selfie com documento;
- uso de WhatsApp ou Telegram como canal principal;
- uso de e-mail genérico em vez de domínio corporativo;
- uso de link encurtado ou canal pouco confiável;
- ausência de informações comuns de uma vaga formal;
- promessa de remuneração incompatível com a função;
- urgência artificial para pressionar o candidato;
- falta de empresa, contato ou link verificável.

O sistema também considera sinais positivos, como:

- e-mail corporativo;
- link oficial da empresa;
- descrição clara de atividades e requisitos;
- ausência de cobrança antecipada;
- documentos solicitados apenas após proposta formal.

## IA opcional

A análise funciona com regras locais mesmo sem IA.

Quando ativada, a IA complementa a análise, ajudando a interpretar melhor a descrição da vaga e reforçando a avaliação de risco.

### OpenRouter

```env
AI_ENABLED=true
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=sua_chave
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openrouter/free
AI_TIMEOUT_MS=45000
```

Também é possível usar outro modelo compatível com OpenRouter, desde que esteja disponível para a sua conta.

### OpenAI

```env
AI_ENABLED=true
AI_PROVIDER=openai
OPENAI_API_KEY=sua_chave
OPENAI_MODEL=gpt-4.1-mini
AI_TIMEOUT_MS=45000
```

Para desativar IA:

```env
AI_ENABLED=false
```

## Variáveis de ambiente — Backend

Arquivo:

```txt
backend/.env
```

Exemplo:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/test
JWT_SECRET=sua_chave_jwt_forte
JWT_EXPIRES_IN=1h
CORS_ORIGIN=http://localhost:5173

ADMIN_NAME=Administrador
ADMIN_EMAIL=admin@empregasafe.com
ADMIN_PASSWORD=123456

EMAIL_ENABLED=true
EMAIL_SERVICE=gmail
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app_do_google
EMAIL_FROM=EmpregaSafe <seu_email@gmail.com>

AI_ENABLED=false
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openrouter/free
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
AI_TIMEOUT_MS=45000
```

> Para Gmail, use senha de app do Google. Não use a senha normal da conta.

## Variáveis de ambiente — Frontend

Arquivo:

```txt
frontend/.env
```

Exemplo local:

```env
VITE_API_URL=http://localhost:3000/api
```

Exemplo em produção:

```env
VITE_API_URL=https://sua-api.onrender.com/api
```

## Rotas principais da API

### Autenticação

| Método | Rota                        | Descrição                                       |
| ------ | --------------------------- | ----------------------------------------------- |
| POST   | `/api/auth/register`        | Cria uma nova conta                             |
| POST   | `/api/auth/login`           | Valida e-mail e senha                           |
| POST   | `/api/auth/verify`          | Valida o código de 6 dígitos enviado por e-mail |
| POST   | `/api/auth/forgot-password` | Solicita código para redefinir senha            |
| POST   | `/api/auth/reset-password`  | Redefine a senha com código válido              |
| GET    | `/api/auth/me`              | Retorna dados do usuário autenticado            |

### Análises

| Método | Rota                       | Descrição                       |
| ------ | -------------------------- | ------------------------------- |
| GET    | `/api/analyses`            | Lista análises do usuário autenticado |
| POST   | `/api/analyses`            | Cria uma nova análise de vaga   |
| GET    | `/api/analyses/:externalId`| Consulta uma análise pertencente ao usuário |

### Denúncias

| Método | Rota           | Descrição                   |
| ------ | -------------- | --------------------------- |
| GET    | `/api/reports` | Lista denúncias do usuário autenticado |
| POST   | `/api/reports` | Cria uma nova denúncia      |
| POST   | `/api/reports/:id/send-email` | Envia uma denúncia por e-mail |

### Estatísticas

| Método | Rota         | Descrição                     |
| ------ | ------------ | ----------------------------- |
| GET    | `/api/stats` | Retorna métricas do dashboard do usuário |

## Banco de dados

O projeto utiliza MongoDB Atlas.

Coleções principais:

```txt
users
analyses
reports
```

### `users`

Armazena usuários da plataforma.

Campos principais:

```txt
name
email
password
role
active
verificationCode
verificationExpires
passwordResetCode
passwordResetExpires
createdAt
updatedAt
```

### `analyses`

Armazena análises de vagas.

Campos principais:

```txt
externalId
user
title
company
salary
currency
contact
link
description
score
classification
badge
analysisMode
ruleScore
aiScore
scoreDifference
reasons
signals
recommendation
ai
createdAt
updatedAt
```

### `reports`

Armazena denúncias enviadas pelos usuários.

Campos principais:

```txt
externalId
user
analysis
company
link
reason
details
createdAt
updatedAt
```

## Como rodar localmente

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

A API deve iniciar em:

```txt
http://localhost:3000/api
```

O seed cria um usuário administrador com os dados definidos no `.env`:

```env
ADMIN_NAME=Administrador
ADMIN_EMAIL=admin@empregasafe.com
ADMIN_PASSWORD=123456
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Acesse:

```txt
http://localhost:5173
```

## Scripts úteis

### Raiz do projeto

```bash
npm run test:all
npm test
npm run build
npm run test:secrets
npm run audit
```

### Backend

```bash
npm run dev
npm start
npm run seed
npm run seed:analyses -- usuario@exemplo.com=100
npm run seed:analyses:hybrid -- usuario@exemplo.com=20
npm run test:unit
npm run test:security
npm run test:ai
npm run test:ai:live
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run test:e2e
npm run test:e2e:ui
```

## Dados demonstrativos

O backend possui seeds opcionais para preencher o histórico sem apagar análises
existentes. Os lotes são idempotentes: executar novamente o mesmo comando não
duplica registros.

### Análises com regras locais

```bash
cd backend
npm run seed:analyses -- usuario@exemplo.com=100
```

### Análises híbridas com IA

```bash
cd backend
npm run seed:analyses:hybrid -- usuario@exemplo.com=20
```

O seed híbrido exige `AI_ENABLED=true` e uma chave válida do provedor. Cada
registro é salvo somente quando a IA participa da avaliação. Esse comando pode
consumir créditos ou cotas do provedor configurado.

É possível preencher mais de uma conta no mesmo comando:

```bash
npm run seed:analyses -- usuario1@exemplo.com=80 usuario2@exemplo.com=20
```

> Os seeds modificam o MongoDB configurado em `backend/.env`. Use apenas em
> ambientes controlados e não envie senhas ou chaves como argumentos.

## Testes profissionais

O projeto possui cinco grupos complementares de validação:

1. Testes unitários das regras locais, classificações e validação de payloads.
2. Testes de API e segurança para Helmet, CORS, JWT, limite de payload, rate
   limit e isolamento de dados entre usuários.
3. Testes E2E com Playwright em desktop e celular, incluindo acessibilidade com
   axe-core e estados visuais da interface.
4. Cenários versionados para comparar vagas confiáveis, suspeitas e críticas,
   com modo opcional de consulta à IA real.
5. Pipeline no GitHub Actions com build, testes, auditoria de dependências e
   verificação de segredos.

Para instalar o navegador usado pelo Playwright na primeira execução:

```bash
cd frontend
npx playwright install chromium
cd ..
```

Para executar a validação completa antes de uma entrega:

```bash
npm run test:all
```

Detalhes adicionais estão em [`TESTING.md`](TESTING.md).

## Segurança

- Não envie `.env` para o GitHub.
- Use `JWT_SECRET` forte em produção.
- Use senha de app para envio de e-mail via Gmail.
- Não envie senhas por e-mail.
- As senhas são armazenadas com hash usando `bcryptjs`.
- O código de verificação expira em 10 minutos.
- O código de recuperação de senha expira em 10 minutos.
- Rotas internas são protegidas por JWT.
- Análises, denúncias e estatísticas são isoladas por usuário autenticado.
- A API aplica cabeçalhos de segurança com Helmet.
- O backend restringe origens permitidas por CORS e limita payloads JSON.
- A API possui limite global de requisições e limites menores para login,
  verificação e recuperação de senha.
- Códigos temporários são gerados com recursos criptográficos do Node.js.
- A recuperação de senha não revela se um e-mail está cadastrado.
- O repositório possui varredura automatizada para evitar versionamento de
  segredos e arquivos `.env`.
- Ao encerrar sessão, os dados locais de autenticação são removidos.
- Em produção, configure corretamente o `CORS_ORIGIN`.
- A IA deve ser tratada como apoio à análise, não como decisão absoluta.
- O usuário deve validar empresas e vagas em canais oficiais antes de enviar documentos ou dados pessoais.

## Deploy

### Render — Backend

Use o arquivo `backend/render.yaml` ou configure manualmente:

- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

Configure as variáveis de ambiente no painel do Render:

```txt
MONGODB_URI
JWT_SECRET
JWT_EXPIRES_IN
CORS_ORIGIN
EMAIL_ENABLED
EMAIL_SERVICE
EMAIL_USER
EMAIL_PASS
EMAIL_FROM
AI_ENABLED
AI_PROVIDER
AI_TIMEOUT_MS
OPENROUTER_API_KEY
OPENROUTER_BASE_URL
OPENROUTER_MODEL
OPENAI_API_KEY
OPENAI_MODEL
```

### Netlify/Vercel — Frontend

Configure:

- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`

Variável obrigatória:

```env
VITE_API_URL=https://sua-api.onrender.com/api
```

## Observações de uso

- O dashboard usa os dados salvos no MongoDB para montar métricas e gráficos.
- Dashboard, histórico e denúncias exibem apenas dados do usuário autenticado.
- A categoria **Potencialmente fraudulenta** é exibida de forma resumida como **Fraudulenta** em gráficos e filtros.
- O ID da análise pode ser copiado no histórico para vincular uma denúncia a uma análise específica.
- Na tela de denúncias, o usuário pode buscar uma análise existente e preencher os campos automaticamente.
- O sistema não garante que uma vaga seja verdadeira ou falsa; ele aponta sinais de risco para apoiar a tomada de decisão do candidato.

## Status do projeto

Versão atual com:

- frontend React com landing page e área protegida;
- layout responsivo com menu mobile;
- backend Node.js com autenticação JWT;
- cadastro, login, verificação por e-mail e recuperação de senha;
- análise de vagas por regras locais;
- IA opcional via OpenRouter ou OpenAI;
- dashboard com gráficos;
- histórico com filtros, paginação e relatório;
- denúncias vinculáveis por ID da análise;
- persistência no MongoDB Atlas;
- isolamento dos dados por usuário;
- seeds idempotentes para demonstração com regras locais ou modo híbrido;
- testes profissionais e workflow de qualidade no GitHub Actions.
