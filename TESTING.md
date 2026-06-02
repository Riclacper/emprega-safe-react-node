# Testes profissionais do EmpregaSafe

O projeto possui cinco suítes complementares.

## 1. Testes unitários

Validam regras de risco, limites de classificação, recomendações e validação de
payloads sem acessar banco de dados ou serviços externos.

```bash
npm run test:unit
```

## 2. API e segurança

Validam cabeçalhos HTTP do Helmet, CORS, rejeição de JWT inválido, limite de
payload JSON, bloqueio de tentativas repetidas de login e regressões de
isolamento de dados por usuário autenticado.

```bash
npm run test:security
```

## 3. E2E, interface e acessibilidade

Usam Playwright em desktop e celular. Cobrem retorno da tela de login, código
de seis dígitos, colagem do código, estados visuais, capturas da interface e
violações sérias de acessibilidade com axe-core. Também validam a aplicação
automática do tema escuro quando o dispositivo informa essa preferência.

Na primeira execução local, instale o Chromium:

```bash
cd frontend
npx playwright install chromium
cd ..
npm run test:e2e
```

Para abrir o modo interativo:

```bash
npm run test:e2e:ui
```

## 4. Avaliação de regras e IA

Executa vagas legítimas, suspeitas e fraudulentas versionadas em
`backend/tests/ai/fixtures.js`. O modo padrão avalia regras locais e gera
`backend/artifacts/ai-evaluation.json`.

```bash
npm run test:ai
```

Para comparar com uma IA real, configure `backend/.env`, exporte as variáveis
no terminal e execute:

```bash
npm run test:ai:live
```

Esse modo pode consumir créditos do provedor configurado.

## 5. CI e auditoria

O workflow `.github/workflows/quality.yml` executa build, testes, Playwright,
auditoria de dependências e verificação de segredos a cada pull request e push
na branch `main`.

Comandos locais úteis:

```bash
npm run test:all
npm test
npm run build
npm run test:secrets
npm run audit
```

`npm run test:all` executa a validação completa usada antes de uma entrega.
