export const languages = {
  "pt-BR": "Português",
  "en-US": "English",
};

export const translations = {
  "pt-BR": {
    common: {
      appTagline: "Análise inteligente de vagas",
      language: "Idioma",
      menu: "Menu",
      closeMenu: "Fechar menu",
      loadingDashboard: "Carregando dashboard...",
      notInformed: "Não informada",
      notInformedMale: "Não informado",
      notAvailable: "Não disponível",
      unavailableId: "ID não disponível",
      total: "Total",
      score: "Score",
      date: "Data",
      status: "Status",
      company: "Empresa",
      job: "Vaga",
      salary: "Salário",
      contact: "Contato",
      link: "Link",
      mode: "Modo",
      details: "Detalhes",
      reason: "Motivo",
      recommendation: "Recomendação:",
      email: "E-mail",
      password: "Senha",
      name: "Nome",
      back: "Voltar",
      close: "Fechar",
      view: "Ver",
      clearFields: "Limpar campos",
      sendEmail: "Enviar por e-mail",
      sending: "Enviando...",
      downloadPdf: "Baixar relatório em PDF",
      rules: "Regras",
      localRules: "Regras locais",
      rulesAi: "Regras + IA",
      localRulesAi: "Regras locais + IA",
      analyses: "análise(s)",
      jobs: "vaga(s)",
      records: "registros",
      point: "ponto(s)",
      selected: "Selecionado:",
    },
    risk: {
      safe: "Confiável",
      suspicious: "Suspeita",
      fraudulent: "Fraudulenta",
      critical: "Risco crítico",
      criticalShort: "Crítica",
      lowRisk: "Baixo risco",
      attention: "Atenção",
      highRisk: "Alto risco",
      safeDescription: "Baixo risco aparente.",
      suspiciousDescription: "Exige atenção antes de avançar.",
      fraudulentDescription: "Indícios fortes de fraude.",
      criticalDescription: "Risco grave. Recomenda-se evitar.",
    },
    landing: {
      navHow: "Como funciona",
      navRisk: "Classificações",
      login: "Entrar",
      heroTitle:
        "Descubra se uma vaga é confiável antes de avançar no processo.",
      heroText:
        "O EmpregaSafe analisa oportunidades de emprego e identifica sinais como cobrança antecipada, pedido de documentos sensíveis, links suspeitos e urgência artificial.",
      accessPlatform: "Acessar plataforma",
      seeHow: "Ver como funciona",
      example: "EXEMPLO DE RESULTADO",
      exampleTitle: "Potencialmente fraudulenta",
      exampleText:
        "Indícios de cobrança antecipada, pedido de documentos sensíveis, urgência artificial e link suspeito.",
      cardAnalyzeTitle: "Analisa a oportunidade",
      cardAnalyzeText:
        "Avalia título, empresa, salário, contato, link e descrição da oportunidade.",
      cardRiskTitle: "Identifica sinais de risco",
      cardRiskText:
        "Detecta cobrança antecipada, pedido de documentos, links suspeitos e promessas incompatíveis.",
      cardRecommendationTitle: "Gera uma recomendação",
      cardRecommendationText:
        "Apresenta pontuação, classificação, motivos encontrados e orientação para o candidato.",
      howEyebrow: "Como funciona",
      howTitle: "Como o EmpregaSafe avalia uma vaga",
      step1Title: "Informe a vaga",
      step1Text: "Preencha título, descrição e dados disponíveis da oportunidade.",
      step2Title: "Execute a análise",
      step2Text: "O sistema aplica regras automáticas e pode usar apoio de IA.",
      step3Title: "Receba o resultado",
      step3Text: "Veja score, classificação, motivos de risco e recomendação.",
      riskEyebrow: "Classificações",
      riskTitle: "Entenda os níveis de risco",
      finalText:
        "Antes de enviar documentos, dados pessoais ou dinheiro, analise a vaga no EmpregaSafe.",
    },
    auth: {
      loginTitle: "Acessar plataforma",
      loginText:
        "Entre para analisar vagas, acompanhar histórico e registrar denúncias de oportunidades suspeitas.",
      emailPlaceholder: "Digite seu e-mail",
      passwordPlaceholder: "Digite sua senha",
      hidePassword: "Ocultar senha",
      showPassword: "Mostrar senha",
      forgotPassword: "Esqueci minha senha",
      loggingIn: "Entrando...",
      loginButton: "Entrar",
      noAccount: "Ainda não tem conta?",
      createAccountLink: "Criar conta",
      loginSessionError:
        "Login realizado, mas a sessão não foi retornada corretamente.",
      loginError:
        "Não foi possível acessar. Confira o e-mail e a senha.",
      registerTitle: "Criar conta",
      registerText:
        "Cadastre-se para analisar vagas, acompanhar histórico e registrar denúncias de oportunidades suspeitas.",
      namePlaceholder: "Digite seu nome",
      minPasswordPlaceholder: "Mínimo 6 caracteres",
      confirmPassword: "Confirmar senha",
      confirmPasswordPlaceholder: "Repita sua senha",
      creatingAccount: "Criando conta...",
      createAccount: "Criar conta",
      alreadyHaveAccount: "Já tem conta?",
      accountCreated: "Conta criada com sucesso. Faça login para acessar.",
      createAccountError: "Erro ao criar conta.",
      informName: "Informe seu nome.",
      informEmail: "Informe seu e-mail.",
      informPassword: "Informe sua senha.",
      minPasswordError: "A senha deve ter no mínimo 6 caracteres.",
      confirmPasswordError: "Confirme sua senha.",
      passwordMismatch: "As senhas não conferem.",
      verifyTitle: "Verificar acesso",
      verifyText:
        "Enviamos um código de 6 dígitos para o e-mail cadastrado. Informe o código para acessar a plataforma.",
      verificationCode: "Código de verificação",
      digitAria: "Dígito {{number}} do código de verificação",
      validating: "Validando...",
      validateCode: "Validar código",
      backToLogin: "Voltar para login",
      missingEmail: "E-mail não encontrado. Faça login novamente.",
      verifiedMissingSession:
        "Código validado, mas a sessão não foi retornada.",
      invalidCode: "Código inválido ou expirado.",
      resetTitle: "Redefinir senha",
      resetText:
        "Informe seu e-mail cadastrado para receber um código de segurança e criar uma nova senha.",
      registeredEmail: "Informe o e-mail cadastrado.",
      sentCode: "Código enviado para o e-mail informado.",
      sendCode: "Enviar código",
      rememberedPassword: "Lembrou a senha?",
      sixDigitCode: "Código de 6 dígitos",
      sixDigitCodePlaceholder: "Digite o código recebido",
      informSixDigitCode: "Informe o código de 6 dígitos.",
      newPassword: "Nova senha",
      confirmNewPassword: "Confirmar nova senha",
      confirmNewPasswordPlaceholder: "Repita a nova senha",
      newPasswordMinError: "A nova senha deve ter pelo menos 6 caracteres.",
      resetting: "Redefinindo...",
      resetPassword: "Redefinir senha",
      passwordResetSuccess: "Senha redefinida com sucesso. Faça login.",
      useAnotherEmail: "Usar outro e-mail",
      enterRegisteredEmail: "Insira o e-mail cadastrado.",
      invalidEmail: "Informe um e-mail válido.",
      emailDomainTypo:
        "Verifique o domínio do e-mail. Você quis dizer .com?",
    },
    sidebar: {
      dashboard: "Painel de segurança",
      analyze: "Analisar vaga",
      history: "Histórico",
      reports: "Denúncias",
      about: "Sobre",
      cardTitle: "Análise inteligente",
      cardText:
        "Regras automáticas com apoio de IA para avaliar sinais de risco.",
    },
    topbar: {
      dashboardTitle: "Painel de segurança das vagas",
      dashboardSubtitle:
        "Acompanhe quais vagas parecem confiáveis, suspeitas ou com alto risco antes de enviar dados pessoais.",
      analyzeTitle: "Analisar vaga",
      analyzeSubtitle:
        "Informe os dados da oportunidade para verificar sinais de risco antes de avançar no processo.",
      historyTitle: "Histórico de análises",
      historySubtitle:
        "Consulte as vagas já analisadas e acompanhe os resultados anteriores.",
      reportsTitle: "Denúncias",
      reportsSubtitle:
        "Registre oportunidades suspeitas para ajudar a identificar possíveis golpes.",
      aboutTitle: "Sobre o EmpregaSafe",
      aboutSubtitle:
        "Entenda como o sistema ajuda a identificar sinais de risco em vagas de emprego.",
      logout: "Sair",
    },
    dashboard: {
      totalJobs: "Total de vagas",
      totalJobsDescription: "Análises feitas no sistema",
      suspiciousJobs: "Vagas suspeitas",
      suspiciousJobsDescription: "Precisam de atenção",
      highRisk: "Risco alto",
      highRiskDescription: "Possíveis golpes identificados",
      sentReports: "Denúncias enviadas",
      sentReportsDescription: "Registros enviados por usuários",
      summaryTitle: "Resumo do painel",
      summaryText:
        "Este painel mostra a situação das vagas analisadas pelo EmpregaSafe. Vagas em verde indicam menor risco. Vagas em amarelo, vermelho ou vermelho escuro exigem atenção antes de enviar dados pessoais, documentos ou realizar qualquer pagamento.",
      communityAlerts: "Alertas da comunidade",
      topReportedTitle: "Empresas mais denunciadas",
      topReportedText:
        "Ranking agregado de denúncias registradas no sistema. Os dados individuais dos usuários permanecem privados.",
      topReportedEmpty:
        "Ainda não há volume suficiente de denúncias para formar um ranking.",
      reportCount: "{{count}} denúncia{{plural}} registrada{{plural}}",
      methodTitle: "Método usado nas análises",
      methodText:
        "Mostra quantas vagas foram avaliadas apenas por regras do sistema ou com apoio de IA.",
      withAi: "Com apoio de IA",
      localRules: "Regras locais",
      howInterpret: "Como interpretar:",
      methodHelp:
        "Regras locais são critérios automáticos do sistema, como salário suspeito, pedido de pagamento ou contato informal. Com apoio de IA indica análises que também usam inteligência artificial para interpretar melhor o texto da vaga.",
      statusTitle: "Situação das vagas",
      statusText:
        "Mostra quantas vagas foram classificadas em cada nível de risco.",
      statusHelp:
        "Verde indica menor risco. Amarelo exige atenção antes de avançar. Vermelho indica possível fraude. Crítica representa risco grave e deve ser evitada.",
      latestTitle: "Últimas análises",
      averageRisk: "Risco médio das análises: {{score}}/100",
    },
    analyze: {
      eyebrow: "Nova análise",
      title: "Analisar confiabilidade da vaga",
      hint:
        "Campos marcados com * são obrigatórios. Os demais campos ajudam a melhorar a precisão da análise.",
      jobTitle: "Título da vaga *",
      jobTitlePlaceholder: "Ex: Auxiliar Administrativo",
      companyPlaceholder: "Nome da empresa",
      salaryPlaceholder: "Ex: 2.500,00",
      currency: "Moeda",
      brl: "Real brasileiro — R$",
      usd: "Dólar — US$",
      eur: "Euro — €",
      contactPlaceholder: "E-mail, telefone ou WhatsApp",
      attachment: "Arquivo da vaga",
      attachmentHint:
        "Demonstração de melhoria futura: print da vaga, ainda sem envio.",
      jobLink: "Link da vaga",
      description: "Descrição da vaga *",
      descriptionPlaceholder: "Cole aqui a descrição completa da vaga...",
      analyzing: "Analisando...",
      analyzeButton: "Analisar vaga",
      loadingLocalAi: "Analisando vaga com regras locais e IA...",
      loadingDelay:
        "A análise com IA ainda está em andamento. Isso pode levar até 30 segundos.",
      error: "Erro ao analisar vaga.",
      resultTitle: "Resultado da análise",
      emptyTextStart: "Preencha os campos obrigatórios e clique em",
      emptyTextEnd:
        "O sistema mostrará a pontuação de risco, a classificação da vaga, os principais sinais encontrados e uma recomendação para o candidato.",
      loadingTitle: "Analisando vaga com IA",
      loadingText:
        "O EmpregaSafe está verificando sinais de risco, padrões suspeitos e indícios de fraude.",
      loadingSmall: "Isso pode levar até 30 segundos.",
    },
    result: {
      eyebrow: "Resultado da análise",
      reasons: "Motivos identificados",
    },
    history: {
      filtersAll: "Todas",
      filtersSafe: "Confiável",
      filtersSuspicious: "Suspeita",
      filtersFraudulent: "Fraudulenta",
      filtersCritical: "Crítica",
      eyebrow: "Base de análises",
      title: "Registros de análise",
      text:
        "Consulte as vagas analisadas, seus scores, classificações e modo de verificação.",
      searchPlaceholder: "Buscar por vaga, empresa, status ou ID",
      sortBy: "Ordenar por",
      recent: "Mais recentes",
      old: "Mais antigas",
      highestScore: "Maior score",
      lowestScore: "Menor score",
      highestRisk: "Maior risco",
      jobCompany: "Vaga / Empresa",
      risk: "Risco",
      noRecords:
        "Nenhum registro encontrado para a busca ou filtro selecionado.",
      showing:
        "Exibindo {{start}}–{{end}} de {{total}} registros",
      previous: "Anterior",
      next: "Próxima",
      page: "Página {{page}} de {{total}}",
      reportEyebrow: "Relatório da análise",
      copiedId: "ID copiado",
      copyId: "Copiar ID",
    },
    reports: {
      eyebrow: "Registro de denúncia",
      title: "Denunciar vaga suspeita",
      hint:
        "Selecione uma análise já registrada para vincular a denúncia. O sistema preencherá automaticamente os dados principais da vaga.",
      analysisId: "ID da análise",
      searchPlaceholder: "Clique para buscar",
      defaultReason: "Denúncia relacionada a uma vaga suspeita",
      defaultDetails:
        "Denúncia relacionada à vaga \"{{title}}\" classificada como {{classification}} com score {{score}}/100.",
      linkedReason: "Denúncia vinculada à análise {{id}}",
      success: "Denúncia registrada com sucesso.",
      submitError: "Não foi possível registrar a denúncia.",
      companyPlaceholder: "Nome da empresa ou anunciante",
      reasonPlaceholder:
        "Ex: Cobrança antecipada, pedido de documentos, golpe",
      detailsPlaceholder:
        "Descreva o que aconteceu, quais sinais chamaram atenção e como foi o contato.",
      registering: "Registrando...",
      register: "Registrar denúncia",
      recentTitle: "Denúncias recentes",
      sentRecords: "{{count}} registro(s) enviado(s)",
      linkedAnalysis: "Análise vinculada",
      suspiciousJobReported: "Vaga suspeita denunciada",
      noAnalysis: "Nenhuma análise encontrada com esse termo.",
      noReports: "Nenhuma denúncia registrada ainda.",
      untitledJob: "Vaga sem título",
      detailsEyebrow: "Detalhes da denúncia",
      emailError: "Não foi possível enviar o e-mail.",
      emailSubject: "Denúncia de vaga suspeita - {{company}}",
      emailGreeting: "Olá,",
      emailIntro: "Segue denúncia registrada no EmpregaSafe:",
      emailLinkedAnalysis: "Análise vinculada:",
      emailDetails: "Detalhes:",
      emailJobLink: "Link da vaga:",
      emailFooter: "Relatório gerado pelo EmpregaSafe.",
    },
    about: {
      eyebrow: "Sobre o projeto",
      text:
        "O EmpregaSafe é uma plataforma para analisar vagas de emprego e identificar sinais de risco, possíveis golpes e tentativas de engenharia social contra candidatos.",
      collectTitle: "Coleta os dados da vaga",
      collectText:
        "O sistema analisa informações como título, empresa, salário, contato, link e descrição da oportunidade.",
      riskTitle: "Identifica sinais de risco",
      riskText:
        "Detecta cobrança indevida, pedido de dados sensíveis, urgência falsa, links suspeitos e comunicação informal.",
      aiTitle: "Apoio com IA",
      aiText:
        "Quando ativada, a IA complementa as regras do sistema e ajuda a interpretar melhor o texto da vaga.",
      historyTitle: "Registra histórico",
      historyText:
        "As análises e denúncias ficam armazenadas para consulta, acompanhamento e geração de relatórios.",
      scoreTitle: "Como a pontuação funciona",
      scoreText:
        "Cada vaga recebe uma pontuação de risco de 0 a 100. Quanto maior a pontuação, maior a chance de a vaga apresentar comportamento suspeito.",
      objectiveTitle: "Objetivo do sistema",
      objectiveText:
        "O objetivo do EmpregaSafe é apoiar candidatos antes que enviem documentos, dados pessoais, dinheiro ou avancem em processos seletivos com sinais de risco.",
    },
    pdf: {
      title: "Relatório de análise de confiabilidade",
      subtitle:
        "Documento gerado para apoiar a avaliação de risco de uma vaga de emprego.",
      generatedAtConnector: " às ",
      summary: "Resumo da vaga",
      aiComparison: "Comparação com IA:",
      ruleScore: "Regras locais:",
      aiScore: "IA:",
      difference: "Diferença:",
      usedMode: "Modo usado:",
      footerTitle: "EmpregaSafe - Relatório de análise de confiabilidade",
      page: "Página {{page}}",
      classificationMissing: "Classificação não informada",
      reasonsContinuation: "Motivos identificados (continuação)",
      noReason: "Nenhum motivo foi informado para esta análise.",
      reasonMissing: "Motivo não informado.",
      noRecommendation:
        "Nenhuma recomendação foi informada para esta análise.",
      footer:
        "Este relatório é um apoio à decisão. Ele não confirma fraude por si só; recomenda-se validar empresa, domínio, canal de contato e condições da vaga antes de compartilhar dados pessoais ou realizar pagamentos.",
    },
    dynamic: {
      classifications: {
        "Confiável": "Confiável",
        "Suspeita": "Suspeita",
        "Fraudulenta": "Fraudulenta",
        "Potencialmente fraudulenta": "Fraudulenta",
        "Risco crítico": "Risco crítico",
        "Crítica": "Crítica",
      },
      reasons: {
        "Há indício de cobrança, pagamento, curso obrigatório ou transferência para participar do processo seletivo.":
          "Há indício de cobrança, pagamento, curso obrigatório ou transferência para participar do processo seletivo.",
        "A empresa não está claramente identificada.":
          "A empresa não está claramente identificada.",
        "A remuneração informada está muito acima do padrão comum e exige validação adicional.":
          "A remuneração informada está muito acima do padrão comum e exige validação adicional.",
        "O salário informado está abaixo do esperado e precisa de conferência com a descrição da vaga.":
          "O salário informado está abaixo do esperado e precisa de conferência com a descrição da vaga.",
        "A vaga solicita dados pessoais sensíveis antes de uma validação formal da empresa.":
          "A vaga solicita dados pessoais sensíveis antes de uma validação formal da empresa.",
        "O texto usa gatilhos de urgência ou promessas irreais para pressionar o candidato.":
          "O texto usa gatilhos de urgência ou promessas irreais para pressionar o candidato.",
        "A vaga não informa link verificável da empresa ou do anúncio.":
          "A vaga não informa link verificável da empresa ou do anúncio.",
        "O link informado usa encurtadores ou canais menos confiáveis.":
          "O link informado usa encurtadores ou canais menos confiáveis.",
        "O recrutamento usa e-mail genérico em vez de domínio corporativo.":
          "O recrutamento usa e-mail genérico em vez de domínio corporativo.",
        "O contato informado não segue um padrão profissional claro.":
          "O contato informado não segue um padrão profissional claro.",
        "A combinação de e-mail genérico com link encurtado reduz a rastreabilidade do recrutador.":
          "A combinação de e-mail genérico com link encurtado reduz a rastreabilidade do recrutador.",
        "O texto contém informalidade excessiva, pressão comercial ou possível apelo enganoso.":
          "O texto contém informalidade excessiva, pressão comercial ou possível apelo enganoso.",
        "A descrição da vaga é curta demais e fornece poucas informações verificáveis.":
          "A descrição da vaga é curta demais e fornece poucas informações verificáveis.",
        "A descrição não apresenta informações comuns de uma vaga formal, como requisitos, atividades ou benefícios.":
          "A descrição não apresenta informações comuns de uma vaga formal, como requisitos, atividades ou benefícios.",
        "Nenhum sinal crítico foi identificado na análise automática inicial.":
          "Nenhum sinal crítico foi identificado na análise automática inicial.",
        "A vaga apresenta sinais positivos, como e-mail corporativo, link oficial e ausência de cobrança antecipada.":
          "A vaga apresenta sinais positivos, como e-mail corporativo, link oficial e ausência de cobrança antecipada.",
      },
      recommendations: {
        "Mesmo com baixo risco, confirme CNPJ, domínio oficial e dados da empresa antes de enviar documentos.":
          "Mesmo com baixo risco, confirme CNPJ, domínio oficial e dados da empresa antes de enviar documentos.",
        "Antes de avançar, valide CNPJ, domínio oficial, canal de contato e condições da vaga.":
          "Antes de avançar, valide CNPJ, domínio oficial, canal de contato e condições da vaga.",
        "Evite avançar no contato, não realize pagamentos e confirme a vaga em canais oficiais da empresa.":
          "Evite avançar no contato, não realize pagamentos e confirme a vaga em canais oficiais da empresa.",
        "Interrompa o contato, não envie documentos, não realize pagamentos e considere registrar denúncia.":
          "Interrompa o contato, não envie documentos, não realize pagamentos e considere registrar denúncia.",
      },
    },
  },
  "en-US": {
    common: {
      appTagline: "Smart job posting analysis",
      language: "Language",
      menu: "Menu",
      closeMenu: "Close menu",
      loadingDashboard: "Loading dashboard...",
      notInformed: "Not provided",
      notInformedMale: "Not provided",
      notAvailable: "Not available",
      unavailableId: "ID not available",
      total: "Total",
      score: "Score",
      date: "Date",
      status: "Status",
      company: "Company",
      job: "Job",
      salary: "Salary",
      contact: "Contact",
      link: "Link",
      mode: "Mode",
      details: "Details",
      reason: "Reason",
      recommendation: "Recommendation:",
      email: "Email",
      password: "Password",
      name: "Name",
      back: "Back",
      close: "Close",
      view: "View",
      clearFields: "Clear fields",
      sendEmail: "Send by email",
      sending: "Sending...",
      downloadPdf: "Download PDF report",
      rules: "Rules",
      localRules: "Local rules",
      rulesAi: "Rules + AI",
      localRulesAi: "Local rules + AI",
      analyses: "analysis(es)",
      jobs: "job(s)",
      records: "records",
      point: "point(s)",
      selected: "Selected:",
    },
    risk: {
      safe: "Reliable",
      suspicious: "Suspicious",
      fraudulent: "Fraudulent",
      critical: "Critical risk",
      criticalShort: "Critical",
      lowRisk: "Low risk",
      attention: "Attention",
      highRisk: "High risk",
      safeDescription: "Low apparent risk.",
      suspiciousDescription: "Requires attention before moving forward.",
      fraudulentDescription: "Strong signs of fraud.",
      criticalDescription: "Severe risk. Avoid proceeding.",
    },
    landing: {
      navHow: "How it works",
      navRisk: "Classifications",
      login: "Sign in",
      heroTitle: "Find out whether a job posting is reliable before moving forward.",
      heroText:
        "EmpregaSafe analyzes job opportunities and identifies signs such as upfront payment requests, sensitive document requests, suspicious links and artificial urgency.",
      accessPlatform: "Access platform",
      seeHow: "See how it works",
      example: "SAMPLE RESULT",
      exampleTitle: "Potentially fraudulent",
      exampleText:
        "Signs of upfront payment, sensitive document requests, artificial urgency and suspicious link.",
      cardAnalyzeTitle: "Analyzes the opportunity",
      cardAnalyzeText:
        "Evaluates title, company, salary, contact, link and opportunity description.",
      cardRiskTitle: "Identifies risk signals",
      cardRiskText:
        "Detects upfront payment, document requests, suspicious links and unrealistic promises.",
      cardRecommendationTitle: "Generates a recommendation",
      cardRecommendationText:
        "Shows score, classification, identified reasons and guidance for the candidate.",
      howEyebrow: "How it works",
      howTitle: "How EmpregaSafe evaluates a job posting",
      step1Title: "Enter the job details",
      step1Text: "Fill in the title, description and available opportunity data.",
      step2Title: "Run the analysis",
      step2Text: "The system applies automatic rules and may use AI support.",
      step3Title: "Receive the result",
      step3Text: "View score, classification, risk reasons and recommendation.",
      riskEyebrow: "Classifications",
      riskTitle: "Understand the risk levels",
      finalText:
        "Before sending documents, personal data or money, analyze the job posting with EmpregaSafe.",
    },
    auth: {
      loginTitle: "Access platform",
      loginText:
        "Sign in to analyze jobs, track history and report suspicious opportunities.",
      emailPlaceholder: "Enter your email",
      passwordPlaceholder: "Enter your password",
      hidePassword: "Hide password",
      showPassword: "Show password",
      forgotPassword: "Forgot my password",
      loggingIn: "Signing in...",
      loginButton: "Sign in",
      noAccount: "Don't have an account yet?",
      createAccountLink: "Create account",
      loginSessionError:
        "Login completed, but the session was not returned correctly.",
      loginError: "Could not sign in. Check your email and password.",
      registerTitle: "Create account",
      registerText:
        "Register to analyze jobs, track history and report suspicious opportunities.",
      namePlaceholder: "Enter your name",
      minPasswordPlaceholder: "Minimum 6 characters",
      confirmPassword: "Confirm password",
      confirmPasswordPlaceholder: "Repeat your password",
      creatingAccount: "Creating account...",
      createAccount: "Create account",
      alreadyHaveAccount: "Already have an account?",
      accountCreated: "Account created successfully. Sign in to continue.",
      createAccountError: "Error creating account.",
      informName: "Enter your name.",
      informEmail: "Enter your email.",
      informPassword: "Enter your password.",
      minPasswordError: "Password must be at least 6 characters long.",
      confirmPasswordError: "Confirm your password.",
      passwordMismatch: "Passwords do not match.",
      verifyTitle: "Verify access",
      verifyText:
        "We sent a 6-digit code to the registered email. Enter the code to access the platform.",
      verificationCode: "Verification code",
      digitAria: "Digit {{number}} of the verification code",
      validating: "Validating...",
      validateCode: "Validate code",
      backToLogin: "Back to login",
      missingEmail: "Email not found. Please sign in again.",
      verifiedMissingSession:
        "Code validated, but the session was not returned.",
      invalidCode: "Invalid or expired code.",
      resetTitle: "Reset password",
      resetText:
        "Enter your registered email to receive a security code and create a new password.",
      registeredEmail: "Enter the registered email.",
      sentCode: "Code sent to the provided email.",
      sendCode: "Send code",
      rememberedPassword: "Remembered your password?",
      sixDigitCode: "6-digit code",
      sixDigitCodePlaceholder: "Enter the received code",
      informSixDigitCode: "Enter the 6-digit code.",
      newPassword: "New password",
      confirmNewPassword: "Confirm new password",
      confirmNewPasswordPlaceholder: "Repeat the new password",
      newPasswordMinError: "The new password must be at least 6 characters long.",
      resetting: "Resetting...",
      resetPassword: "Reset password",
      passwordResetSuccess: "Password reset successfully. Sign in.",
      useAnotherEmail: "Use another email",
      enterRegisteredEmail: "Enter the registered email.",
      invalidEmail: "Enter a valid email.",
      emailDomainTypo: "Check the email domain. Did you mean .com?",
    },
    sidebar: {
      dashboard: "Security dashboard",
      analyze: "Analyze job",
      history: "History",
      reports: "Reports",
      about: "About",
      cardTitle: "Smart analysis",
      cardText: "Automatic rules with AI support to assess risk signals.",
    },
    topbar: {
      dashboardTitle: "Job security dashboard",
      dashboardSubtitle:
        "Track which jobs appear reliable, suspicious or high risk before sending personal data.",
      analyzeTitle: "Analyze job",
      analyzeSubtitle:
        "Enter the opportunity details to check risk signals before moving forward.",
      historyTitle: "Analysis history",
      historySubtitle: "Review previously analyzed jobs and past results.",
      reportsTitle: "Reports",
      reportsSubtitle:
        "Register suspicious opportunities to help identify possible scams.",
      aboutTitle: "About EmpregaSafe",
      aboutSubtitle:
        "Understand how the system helps identify risk signals in job postings.",
      logout: "Sign out",
    },
    dashboard: {
      totalJobs: "Total jobs",
      totalJobsDescription: "Analyses performed in the system",
      suspiciousJobs: "Suspicious jobs",
      suspiciousJobsDescription: "Require attention",
      highRisk: "High risk",
      highRiskDescription: "Possible scams identified",
      sentReports: "Reports sent",
      sentReportsDescription: "Records submitted by users",
      summaryTitle: "Dashboard summary",
      summaryText:
        "This dashboard shows the status of jobs analyzed by EmpregaSafe. Green jobs indicate lower risk. Yellow, red or dark red jobs require attention before sending personal data, documents or making any payment.",
      communityAlerts: "Community alerts",
      topReportedTitle: "Most reported companies",
      topReportedText:
        "Aggregated ranking of reports registered in the system. Individual user data remains private.",
      topReportedEmpty:
        "There is not enough report volume yet to create a ranking.",
      reportCount: "{{count}} report{{plural}} registered",
      methodTitle: "Method used in analyses",
      methodText:
        "Shows how many jobs were evaluated only by system rules or with AI support.",
      withAi: "With AI support",
      localRules: "Local rules",
      howInterpret: "How to interpret:",
      methodHelp:
        "Local rules are automatic system criteria, such as suspicious salary, payment request or informal contact. AI support indicates analyses that also use artificial intelligence to better interpret the job text.",
      statusTitle: "Job status",
      statusText: "Shows how many jobs were classified at each risk level.",
      statusHelp:
        "Green indicates lower risk. Yellow requires attention before moving forward. Red indicates possible fraud. Critical represents severe risk and should be avoided.",
      latestTitle: "Latest analyses",
      averageRisk: "Average analysis risk: {{score}}/100",
    },
    analyze: {
      eyebrow: "New analysis",
      title: "Analyze job reliability",
      hint:
        "Fields marked with * are required. The other fields help improve analysis accuracy.",
      jobTitle: "Job title *",
      jobTitlePlaceholder: "Example: Administrative Assistant",
      companyPlaceholder: "Company name",
      salaryPlaceholder: "Example: 2,500.00",
      currency: "Currency",
      brl: "Brazilian real — R$",
      usd: "Dollar — US$",
      eur: "Euro — €",
      contactPlaceholder: "Email, phone or WhatsApp",
      attachment: "Job file",
      attachmentHint:
        "Future improvement demo: job posting screenshot, not uploaded yet.",
      jobLink: "Job link",
      description: "Job description *",
      descriptionPlaceholder: "Paste the full job description here...",
      analyzing: "Analyzing...",
      analyzeButton: "Analyze job",
      loadingLocalAi: "Analyzing job with local rules and AI...",
      loadingDelay:
        "The AI analysis is still running. This can take up to 30 seconds.",
      error: "Error analyzing job.",
      resultTitle: "Analysis result",
      emptyTextStart: "Fill in the required fields and click",
      emptyTextEnd:
        "The system will show the risk score, job classification, main identified signals and a recommendation for the candidate.",
      loadingTitle: "Analyzing job with AI",
      loadingText:
        "EmpregaSafe is checking risk signals, suspicious patterns and signs of fraud.",
      loadingSmall: "This can take up to 30 seconds.",
    },
    result: {
      eyebrow: "Analysis result",
      reasons: "Identified reasons",
    },
    history: {
      filtersAll: "All",
      filtersSafe: "Reliable",
      filtersSuspicious: "Suspicious",
      filtersFraudulent: "Fraudulent",
      filtersCritical: "Critical",
      eyebrow: "Analysis base",
      title: "Analysis records",
      text:
        "Review analyzed jobs, their scores, classifications and verification mode.",
      searchPlaceholder: "Search by job, company, status or ID",
      sortBy: "Sort by",
      recent: "Most recent",
      old: "Oldest",
      highestScore: "Highest score",
      lowestScore: "Lowest score",
      highestRisk: "Highest risk",
      jobCompany: "Job / Company",
      risk: "Risk",
      noRecords: "No records found for the selected search or filter.",
      showing: "Showing {{start}}–{{end}} of {{total}} records",
      previous: "Previous",
      next: "Next",
      page: "Page {{page}} of {{total}}",
      reportEyebrow: "Analysis report",
      copiedId: "ID copied",
      copyId: "Copy ID",
    },
    reports: {
      eyebrow: "Report record",
      title: "Report suspicious job",
      hint:
        "Select an existing analysis to link the report. The system will automatically fill in the main job data.",
      analysisId: "Analysis ID",
      searchPlaceholder: "Click to search",
      defaultReason: "Report related to a suspicious job",
      defaultDetails:
        "Report related to job \"{{title}}\" classified as {{classification}} with score {{score}}/100.",
      linkedReason: "Report linked to analysis {{id}}",
      success: "Report registered successfully.",
      submitError: "Could not register the report.",
      companyPlaceholder: "Company or advertiser name",
      reasonPlaceholder:
        "Example: Upfront payment, document request, scam",
      detailsPlaceholder:
        "Describe what happened, which signals drew attention and how the contact occurred.",
      registering: "Registering...",
      register: "Register report",
      recentTitle: "Recent reports",
      sentRecords: "{{count}} record(s) submitted",
      linkedAnalysis: "Linked analysis",
      suspiciousJobReported: "Suspicious job reported",
      noAnalysis: "No analysis found with this term.",
      noReports: "No reports registered yet.",
      untitledJob: "Untitled job",
      detailsEyebrow: "Report details",
      emailError: "Could not send the email.",
      emailSubject: "Suspicious job report - {{company}}",
      emailGreeting: "Hello,",
      emailIntro: "Here is the report registered in EmpregaSafe:",
      emailLinkedAnalysis: "Linked analysis:",
      emailDetails: "Details:",
      emailJobLink: "Job link:",
      emailFooter: "Report generated by EmpregaSafe.",
    },
    about: {
      eyebrow: "About the project",
      text:
        "EmpregaSafe is a platform for analyzing job postings and identifying risk signals, possible scams and social engineering attempts against candidates.",
      collectTitle: "Collects job data",
      collectText:
        "The system analyzes information such as title, company, salary, contact, link and opportunity description.",
      riskTitle: "Identifies risk signals",
      riskText:
        "Detects improper charges, sensitive data requests, false urgency, suspicious links and informal communication.",
      aiTitle: "AI support",
      aiText:
        "When enabled, AI complements the system rules and helps better interpret the job text.",
      historyTitle: "Stores history",
      historyText:
        "Analyses and reports are stored for consultation, tracking and report generation.",
      scoreTitle: "How scoring works",
      scoreText:
        "Each job receives a risk score from 0 to 100. The higher the score, the greater the chance that the job shows suspicious behavior.",
      objectiveTitle: "System objective",
      objectiveText:
        "EmpregaSafe aims to support candidates before they send documents, personal data, money or move forward in selection processes with risk signals.",
    },
    pdf: {
      title: "Reliability analysis report",
      subtitle:
        "Document generated to support the risk assessment of a job posting.",
      generatedAtConnector: " at ",
      summary: "Job summary",
      aiComparison: "AI comparison:",
      ruleScore: "Local rules:",
      aiScore: "AI:",
      difference: "Difference:",
      usedMode: "Mode used:",
      footerTitle: "EmpregaSafe - Reliability analysis report",
      page: "Page {{page}}",
      classificationMissing: "Classification not provided",
      reasonsContinuation: "Identified reasons (continued)",
      noReason: "No reason was provided for this analysis.",
      reasonMissing: "Reason not provided.",
      noRecommendation:
        "No recommendation was provided for this analysis.",
      footer:
        "This report supports decision-making. It does not confirm fraud by itself; validate the company, domain, contact channel and job conditions before sharing personal data or making payments.",
    },
    dynamic: {
      classifications: {
        "Confiável": "Reliable",
        "Suspeita": "Suspicious",
        "Fraudulenta": "Fraudulent",
        "Potencialmente fraudulenta": "Fraudulent",
        "Risco crítico": "Critical risk",
        "Crítica": "Critical",
      },
      reasons: {
        "Há indício de cobrança, pagamento, curso obrigatório ou transferência para participar do processo seletivo.":
          "There is evidence of a charge, payment, mandatory course or transfer to participate in the selection process.",
        "A empresa não está claramente identificada.":
          "The company is not clearly identified.",
        "A remuneração informada está muito acima do padrão comum e exige validação adicional.":
          "The stated compensation is far above the usual range and requires additional validation.",
        "O salário informado está abaixo do esperado e precisa de conferência com a descrição da vaga.":
          "The stated salary is below expectations and should be checked against the job description.",
        "A vaga solicita dados pessoais sensíveis antes de uma validação formal da empresa.":
          "The job requests sensitive personal data before formal company validation.",
        "O texto usa gatilhos de urgência ou promessas irreais para pressionar o candidato.":
          "The text uses urgency triggers or unrealistic promises to pressure the candidate.",
        "A vaga não informa link verificável da empresa ou do anúncio.":
          "The job does not provide a verifiable company or posting link.",
        "O link informado usa encurtadores ou canais menos confiáveis.":
          "The provided link uses shorteners or less reliable channels.",
        "O recrutamento usa e-mail genérico em vez de domínio corporativo.":
          "Recruitment uses a generic email instead of a corporate domain.",
        "O contato informado não segue um padrão profissional claro.":
          "The provided contact does not follow a clear professional pattern.",
        "A combinação de e-mail genérico com link encurtado reduz a rastreabilidade do recrutador.":
          "The combination of generic email and shortened link reduces recruiter traceability.",
        "O texto contém informalidade excessiva, pressão comercial ou possível apelo enganoso.":
          "The text contains excessive informality, commercial pressure or possible misleading appeal.",
        "A descrição da vaga é curta demais e fornece poucas informações verificáveis.":
          "The job description is too short and provides little verifiable information.",
        "A descrição não apresenta informações comuns de uma vaga formal, como requisitos, atividades ou benefícios.":
          "The description does not include common formal job information such as requirements, duties or benefits.",
        "Nenhum sinal crítico foi identificado na análise automática inicial.":
          "No critical signal was identified in the initial automatic analysis.",
        "A vaga apresenta sinais positivos, como e-mail corporativo, link oficial e ausência de cobrança antecipada.":
          "The job shows positive signals, such as corporate email, official link and no upfront charge.",
      },
      recommendations: {
        "Mesmo com baixo risco, confirme CNPJ, domínio oficial e dados da empresa antes de enviar documentos.":
          "Even with low risk, confirm company registration, official domain and company data before sending documents.",
        "Antes de avançar, valide CNPJ, domínio oficial, canal de contato e condições da vaga.":
          "Before moving forward, validate company registration, official domain, contact channel and job conditions.",
        "Evite avançar no contato, não realize pagamentos e confirme a vaga em canais oficiais da empresa.":
          "Avoid continuing the contact, do not make payments and confirm the job through official company channels.",
        "Interrompa o contato, não envie documentos, não realize pagamentos e considere registrar denúncia.":
          "Stop the contact, do not send documents, do not make payments and consider filing a report.",
      },
    },
  },
};
