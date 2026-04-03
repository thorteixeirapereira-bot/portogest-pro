import type { PsychTestType } from '../types'

export interface PsychOption {
  text: string
  dimension: string
}

export interface PsychQuestion {
  id: string
  text: string
  type: 'choice4' | 'scale5' | 'choice3'
  options: PsychOption[]
}

export interface PsychDimension {
  key: string
  label: string
  color: string
  description: string
}

export interface PsychTestDef {
  type: PsychTestType
  title: string
  subtitle: string
  icon: string
  color: string
  instructions: string
  questions: PsychQuestion[]
  dimensions: PsychDimension[]
  interpret: (scores: Record<string, number>) => {
    dominant: string
    profile: string
    insights: string[]
  }
}

// ─── DISC ─────────────────────────────────────────────────────────────────────

export const DISC_TEST: PsychTestDef = {
  type: 'disc',
  title: 'Perfil DISC',
  subtitle: 'Comportamento Profissional',
  icon: '🎯',
  color: 'blue',
  instructions: 'Em cada questão, escolha a opção que melhor descreve como você se comporta no trabalho.',
  dimensions: [
    { key: 'D', label: 'Dominância', color: '#ef4444', description: 'Foco em resultados, assertividade e resolução de problemas.' },
    { key: 'I', label: 'Influência', color: '#f59e0b', description: 'Entusiasmo, otimismo e habilidade de persuasão.' },
    { key: 'S', label: 'Estabilidade', color: '#10b981', description: 'Paciência, cooperação e consistência.' },
    { key: 'C', label: 'Conformidade', color: '#3b82f6', description: 'Precisão, análise e cumprimento de padrões.' },
  ],
  questions: [
    {
      id: 'q1', text: 'Quando enfrento um problema no trabalho, costumo:', type: 'choice4',
      options: [
        { text: 'Agir rapidamente e tomar a decisão por conta própria', dimension: 'D' },
        { text: 'Conversar com colegas e motivá-los a resolver juntos', dimension: 'I' },
        { text: 'Seguir o processo já estabelecido com calma', dimension: 'S' },
        { text: 'Analisar todas as informações antes de decidir', dimension: 'C' },
      ],
    },
    {
      id: 'q2', text: 'Meus colegas me descrevem como:', type: 'choice4',
      options: [
        { text: 'Determinado e direto', dimension: 'D' },
        { text: 'Animado e comunicativo', dimension: 'I' },
        { text: 'Calmo e confiável', dimension: 'S' },
        { text: 'Meticuloso e organizado', dimension: 'C' },
      ],
    },
    {
      id: 'q3', text: 'Em reuniões de equipe, eu:', type: 'choice4',
      options: [
        { text: 'Lidero e direciono o grupo', dimension: 'D' },
        { text: 'Animo e engajo todos', dimension: 'I' },
        { text: 'Escuto e apoio as ideias', dimension: 'S' },
        { text: 'Questiono e reviso os dados', dimension: 'C' },
      ],
    },
    {
      id: 'q4', text: 'Meu maior ponto forte é:', type: 'choice4',
      options: [
        { text: 'Capacidade de alcançar resultados', dimension: 'D' },
        { text: 'Facilidade de me relacionar', dimension: 'I' },
        { text: 'Consistência e lealdade', dimension: 'S' },
        { text: 'Atenção aos detalhes e qualidade', dimension: 'C' },
      ],
    },
    {
      id: 'q5', text: 'Sob pressão, costumo:', type: 'choice4',
      options: [
        { text: 'Ficar impaciente e exigente', dimension: 'D' },
        { text: 'Ficar muito emocional ou disperso', dimension: 'I' },
        { text: 'Resistir a mudanças', dimension: 'S' },
        { text: 'Me tornar excessivamente crítico', dimension: 'C' },
      ],
    },
    {
      id: 'q6', text: 'Prefiro trabalhar em um ambiente:', type: 'choice4',
      options: [
        { text: 'Desafiador, com autonomia para decidir', dimension: 'D' },
        { text: 'Dinâmico, com muita interação e reconhecimento', dimension: 'I' },
        { text: 'Estável, com rotinas claras e equipe unida', dimension: 'S' },
        { text: 'Organizado, com processos e padrões definidos', dimension: 'C' },
      ],
    },
    {
      id: 'q7', text: 'Ao iniciar um projeto novo, minha primeira ação é:', type: 'choice4',
      options: [
        { text: 'Definir metas e iniciar logo', dimension: 'D' },
        { text: 'Compartilhar a ideia e entusiasmar a equipe', dimension: 'I' },
        { text: 'Entender bem o escopo antes de começar', dimension: 'S' },
        { text: 'Criar um plano detalhado com riscos mapeados', dimension: 'C' },
      ],
    },
    {
      id: 'q8', text: 'Quando recebo críticas, eu:', type: 'choice4',
      options: [
        { text: 'Rebato ou defendo minha posição', dimension: 'D' },
        { text: 'Fico desanimado mas logo me recupero', dimension: 'I' },
        { text: 'Aceito com calma e busco melhorar', dimension: 'S' },
        { text: 'Analiso com cuidado se faz sentido', dimension: 'C' },
      ],
    },
  ],
  interpret(scores) {
    const max = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
    const profiles: Record<string, { profile: string; insights: string[] }> = {
      D: {
        profile: 'Executor — Você é orientado a resultados, direto e determinado.',
        insights: [
          'Ponto forte: liderança natural e tomada de decisão rápida.',
          'Atenção: pode parecer agressivo ou impaciente com colegas.',
          'Ambiente ideal: desafios, autonomia e metas claras.',
        ],
      },
      I: {
        profile: 'Comunicador — Você é entusiasta, persuasivo e muito sociável.',
        insights: [
          'Ponto forte: engaja e motiva a equipe com facilidade.',
          'Atenção: pode se dispersar em tarefas que exigem foco individual.',
          'Ambiente ideal: interação, variedade e reconhecimento público.',
        ],
      },
      S: {
        profile: 'Apoiador — Você é cooperativo, estável e de grande confiança.',
        insights: [
          'Ponto forte: cria harmonia e sustenta o grupo em momentos difíceis.',
          'Atenção: pode ter dificuldade em lidar com mudanças bruscas.',
          'Ambiente ideal: equipes unidas, rotinas claras e relações estáveis.',
        ],
      },
      C: {
        profile: 'Analista — Você é meticuloso, preciso e segue altos padrões.',
        insights: [
          'Ponto forte: garante qualidade e identifica erros antes que aconteçam.',
          'Atenção: pode ser perfeccionista a ponto de atrasar entregas.',
          'Ambiente ideal: processos bem definidos, dados concretos e autonomia técnica.',
        ],
      },
    }
    const d = profiles[max[0]] || profiles['S']
    return { dominant: max[0], ...d }
  },
}

// ─── Big Five ─────────────────────────────────────────────────────────────────

export const BIGFIVE_TEST: PsychTestDef = {
  type: 'bigfive',
  title: 'Big Five',
  subtitle: 'Personalidade (TIPI)',
  icon: '🧠',
  color: 'purple',
  instructions: 'Avalie o quanto cada afirmação descreve você. Use a escala de 1 (Discordo totalmente) a 5 (Concordo totalmente).',
  dimensions: [
    { key: 'O', label: 'Abertura', color: '#8b5cf6', description: 'Curiosidade, criatividade e abertura a novas experiências.' },
    { key: 'C', label: 'Conscienciosidade', color: '#3b82f6', description: 'Organização, disciplina e foco em objetivos.' },
    { key: 'E', label: 'Extroversão', color: '#f59e0b', description: 'Sociabilidade, energia e assertividade.' },
    { key: 'A', label: 'Amabilidade', color: '#10b981', description: 'Cooperação, confiança e empatia.' },
    { key: 'N', label: 'Neuroticismo', color: '#ef4444', description: 'Tendência a emoções negativas e estresse.' },
  ],
  questions: [
    { id: 'q1', text: 'Me considero criativo(a) e aberto(a) a novas experiências.', type: 'scale5', options: [{ text: '', dimension: 'O' }] },
    { id: 'q2', text: 'Sou organizado(a), cuidadoso(a) e confiável.', type: 'scale5', options: [{ text: '', dimension: 'C' }] },
    { id: 'q3', text: 'Sou extrovertido(a), animado(a) e sociável.', type: 'scale5', options: [{ text: '', dimension: 'E' }] },
    { id: 'q4', text: 'Sou simpático(a), cooperativo(a) e fácil de me dar bem.', type: 'scale5', options: [{ text: '', dimension: 'A' }] },
    { id: 'q5', text: 'Fico ansioso(a) ou me estresso com facilidade.', type: 'scale5', options: [{ text: '', dimension: 'N' }] },
    { id: 'q6', text: 'Gosto de desafios intelectuais e aprendo coisas novas com prazer.', type: 'scale5', options: [{ text: '', dimension: 'O' }] },
    { id: 'q7', text: 'Sigo regras e cumpro prazos com facilidade.', type: 'scale5', options: [{ text: '', dimension: 'C' }] },
    { id: 'q8', text: 'Prefiro estar em grupo do que sozinho(a).', type: 'scale5', options: [{ text: '', dimension: 'E' }] },
    { id: 'q9', text: 'Evito conflitos e me preocupo com o bem-estar dos outros.', type: 'scale5', options: [{ text: '', dimension: 'A' }] },
    { id: 'q10', text: 'Meu humor muda com frequência dependendo das situações.', type: 'scale5', options: [{ text: '', dimension: 'N' }] },
  ],
  interpret(scores) {
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
    const top = sorted[0]
    const profiles: Record<string, { profile: string; insights: string[] }> = {
      O: {
        profile: 'Explorador — Alta abertura a experiências novas e criatividade.',
        insights: [
          'Você busca novidades, é curioso e pensa fora do padrão.',
          'Tende a se destacar em ambientes inovadores e dinâmicos.',
          'Pode ter dificuldade com rotinas muito rígidas.',
        ],
      },
      C: {
        profile: 'Realizador — Alta conscienciosidade e senso de dever.',
        insights: [
          'Você é confiável, organizado e entrega resultados consistentes.',
          'Destaca-se em cargos que exigem precisão e responsabilidade.',
          'Pode ser muito autoexigente em momentos de falha.',
        ],
      },
      E: {
        profile: 'Conector — Alta extroversão e energia social.',
        insights: [
          'Você se energiza com pessoas e ambientes movimentados.',
          'Natural em papéis de liderança, vendas e atendimento.',
          'Pode ter dificuldade em tarefas solitárias e analíticas.',
        ],
      },
      A: {
        profile: 'Harmonizador — Alta amabilidade e empatia.',
        insights: [
          'Você é cooperativo, confiável e cria bons relacionamentos.',
          'Excelente em trabalho em equipe e funções de suporte.',
          'Pode ter dificuldade em impor limites quando necessário.',
        ],
      },
      N: {
        profile: 'Sensível — Alta sensibilidade emocional.',
        insights: [
          'Você sente as situações de forma intensa e profunda.',
          'Pode se beneficiar de estratégias de regulação emocional.',
          'Em ambientes estáveis, tende a se destacar pela dedicação.',
        ],
      },
    }
    const d = profiles[top[0]] || profiles['A']
    return { dominant: top[0], ...d }
  },
}

// ─── VAC ─────────────────────────────────────────────────────────────────────

export const VAC_TEST: PsychTestDef = {
  type: 'vac',
  title: 'Estilo VAC',
  subtitle: 'Aprendizagem (Visual · Auditivo · Cinestésico)',
  icon: '📚',
  color: 'green',
  instructions: 'Escolha a opção que mais combina com você em cada situação.',
  dimensions: [
    { key: 'V', label: 'Visual', color: '#3b82f6', description: 'Aprende melhor por imagens, gráficos e lendo.' },
    { key: 'A', label: 'Auditivo', color: '#f59e0b', description: 'Aprende melhor ouvindo, discutindo e em aulas.' },
    { key: 'K', label: 'Cinestésico', color: '#10b981', description: 'Aprende melhor fazendo, praticando e experimentando.' },
  ],
  questions: [
    {
      id: 'q1', text: 'Para aprender algo novo no trabalho, prefiro:', type: 'choice3',
      options: [
        { text: 'Ler um manual ou ver um esquema/diagrama', dimension: 'V' },
        { text: 'Ouvir alguém explicando ou assistir a um vídeo', dimension: 'A' },
        { text: 'Tentar fazer na prática com supervisão', dimension: 'K' },
      ],
    },
    {
      id: 'q2', text: 'Quando tenho que lembrar de uma informação, costumo:', type: 'choice3',
      options: [
        { text: 'Visualizar onde estava escrito ou desenhado', dimension: 'V' },
        { text: 'Lembrar da voz ou das palavras de quem me disse', dimension: 'A' },
        { text: 'Lembrar de como me senti ou do que fiz na época', dimension: 'K' },
      ],
    },
    {
      id: 'q3', text: 'Em treinamentos, aproveito mais quando:', type: 'choice3',
      options: [
        { text: 'Há slides, gráficos e materiais visuais', dimension: 'V' },
        { text: 'O instrutor explica bem e há debate em grupo', dimension: 'A' },
        { text: 'Faço exercícios práticos e simulações', dimension: 'K' },
      ],
    },
    {
      id: 'q4', text: 'Quando estou entediado numa tarefa, costumo:', type: 'choice3',
      options: [
        { text: 'Doodlar, rabiscar ou olhar para algo', dimension: 'V' },
        { text: 'Querer conversar ou ouvir música', dimension: 'A' },
        { text: 'Querer me mexer ou fazer algo diferente', dimension: 'K' },
      ],
    },
    {
      id: 'q5', text: 'Para resolver um problema complexo, prefiro:', type: 'choice3',
      options: [
        { text: 'Fazer um mapa ou esquema visual', dimension: 'V' },
        { text: 'Pensar em voz alta ou discutir com alguém', dimension: 'A' },
        { text: 'Experimentar soluções até encontrar uma que funcione', dimension: 'K' },
      ],
    },
    {
      id: 'q6', text: 'Quando dou instruções para alguém, costumo:', type: 'choice3',
      options: [
        { text: 'Escrever ou desenhar o que deve ser feito', dimension: 'V' },
        { text: 'Explicar detalhadamente de forma verbal', dimension: 'A' },
        { text: 'Mostrar fazendo e deixar a pessoa tentar', dimension: 'K' },
      ],
    },
  ],
  interpret(scores) {
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
    const top = sorted[0]
    const profiles: Record<string, { profile: string; insights: string[] }> = {
      V: {
        profile: 'Aprendiz Visual — Você processa melhor informações visuais.',
        insights: [
          'Aproveite diagramas, fluxogramas e anotações com cores.',
          'Em treinamentos, peça materiais escritos e slides.',
          'Organize seu espaço de trabalho de forma visualmente clara.',
        ],
      },
      A: {
        profile: 'Aprendiz Auditivo — Você processa melhor pela escuta e verbalização.',
        insights: [
          'Prefira explicações orais e grupos de discussão.',
          'Gravar lembretes em áudio pode ajudar na memorização.',
          'Leia em voz alta e repita conceitos para fixar melhor.',
        ],
      },
      K: {
        profile: 'Aprendiz Cinestésico — Você aprende fazendo e sentindo.',
        insights: [
          'Priorize treinamentos práticos e hands-on.',
          'Fazer pausas ativas melhora sua concentração.',
          'Associe aprendizados a ações concretas no trabalho.',
        ],
      },
    }
    const d = profiles[top[0]] || profiles['K']
    return { dominant: top[0], ...d }
  },
}

// ─── IKIGAI ───────────────────────────────────────────────────────────────────

export const IKIGAI_TEST: PsychTestDef = {
  type: 'ikigai',
  title: 'IKIGAI',
  subtitle: 'Propósito de Vida',
  icon: '🌸',
  color: 'pink',
  instructions: 'Responda cada afirmação com nota de 1 (Discordo) a 5 (Concordo plenamente).',
  dimensions: [
    { key: 'AMO', label: 'O que Amo', color: '#ec4899', description: 'Atividades que te trazem alegria e satisfação.' },
    { key: 'MISSAO', label: 'Missão', color: '#8b5cf6', description: 'Como você contribui para o mundo ao redor.' },
    { key: 'VOCACAO', label: 'Vocação', color: '#3b82f6', description: 'O que você faz muito bem naturalmente.' },
    { key: 'PROFISSAO', label: 'Profissão', color: '#f59e0b', description: 'O que o mercado valoriza em você.' },
  ],
  questions: [
    { id: 'q1', text: 'Me sinto energizado(a) e feliz ao realizar minhas tarefas no trabalho.', type: 'scale5', options: [{ text: '', dimension: 'AMO' }] },
    { id: 'q2', text: 'Perco a noção do tempo quando estou envolvido(a) em algo que gosto muito.', type: 'scale5', options: [{ text: '', dimension: 'AMO' }] },
    { id: 'q3', text: 'Tenho paixão genuína pelo que faço profissionalmente.', type: 'scale5', options: [{ text: '', dimension: 'AMO' }] },
    { id: 'q4', text: 'Meu trabalho tem impacto positivo nas pessoas ao meu redor.', type: 'scale5', options: [{ text: '', dimension: 'MISSAO' }] },
    { id: 'q5', text: 'Sinto que contribuo para algo maior do que só minha função.', type: 'scale5', options: [{ text: '', dimension: 'MISSAO' }] },
    { id: 'q6', text: 'O que faço no trabalho beneficia a minha comunidade ou equipe.', type: 'scale5', options: [{ text: '', dimension: 'MISSAO' }] },
    { id: 'q7', text: 'Sou reconhecido(a) como referência naquilo que faço.', type: 'scale5', options: [{ text: '', dimension: 'VOCACAO' }] },
    { id: 'q8', text: 'Aprendo com facilidade e me destaco nas minhas atividades principais.', type: 'scale5', options: [{ text: '', dimension: 'VOCACAO' }] },
    { id: 'q9', text: 'Realizo com qualidade tarefas que outras pessoas acham difíceis.', type: 'scale5', options: [{ text: '', dimension: 'VOCACAO' }] },
    { id: 'q10', text: 'Minhas habilidades têm valor para a empresa e são bem remuneradas.', type: 'scale5', options: [{ text: '', dimension: 'PROFISSAO' }] },
    { id: 'q11', text: 'Recebo reconhecimento financeiro ou de carreira pelo meu trabalho.', type: 'scale5', options: [{ text: '', dimension: 'PROFISSAO' }] },
    { id: 'q12', text: 'Sinto que meu trabalho é valorizado no mercado.', type: 'scale5', options: [{ text: '', dimension: 'PROFISSAO' }] },
  ],
  interpret(scores) {
    const avg = (Object.values(scores).reduce((a, b) => a + b, 0)) / Object.values(scores).length
    const balanced = Object.values(scores).every(v => v >= 2.5)
    const dominant = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
    const weak = Object.entries(scores).sort((a, b) => a[1] - b[1])[0][0]
    const labels: Record<string, string> = { AMO: 'o que Ama', MISSAO: 'sua Missão', VOCACAO: 'sua Vocação', PROFISSAO: 'sua Profissão' }
    return {
      dominant,
      profile: balanced && avg >= 3.5
        ? 'Propósito Alinhado — Você está no caminho do IKIGAI!'
        : `Em desenvolvimento — Seu ponto mais forte é ${labels[dominant]}.`,
      insights: [
        balanced ? 'Suas 4 dimensões estão relativamente equilibradas — sinal de propósito.' : `Fortaleça ${labels[weak]} para encontrar mais equilíbrio.`,
        `Você tem forte conexão com ${labels[dominant]}.`,
        avg >= 4 ? 'Você demonstra alto alinhamento com seu propósito de vida e trabalho.' : 'Busque oportunidades que alinhem mais o que você ama com o que faz.',
      ],
    }
  },
}

// ─── IE (Inteligência Emocional) ──────────────────────────────────────────────

export const IE_TEST: PsychTestDef = {
  type: 'ie',
  title: 'Inteligência Emocional',
  subtitle: 'IE — Modelo Goleman',
  icon: '❤️',
  color: 'red',
  instructions: 'Avalie o quanto cada afirmação representa seu comportamento habitual (1 = Nunca, 5 = Sempre).',
  dimensions: [
    { key: 'AC', label: 'Autoconsciência', color: '#3b82f6', description: 'Reconhecer suas próprias emoções.' },
    { key: 'AG', label: 'Autogestão', color: '#8b5cf6', description: 'Controlar impulsos e emoções negativas.' },
    { key: 'EM', label: 'Empatia', color: '#ec4899', description: 'Perceber e compreender as emoções alheias.' },
    { key: 'HS', label: 'Habilidades Sociais', color: '#10b981', description: 'Gerenciar relacionamentos e trabalho em equipe.' },
  ],
  questions: [
    { id: 'q1', text: 'Sei identificar meu humor e como ele afeta minhas decisões.', type: 'scale5', options: [{ text: '', dimension: 'AC' }] },
    { id: 'q2', text: 'Percebo quando estou estressado antes de reagir de forma impulsiva.', type: 'scale5', options: [{ text: '', dimension: 'AC' }] },
    { id: 'q3', text: 'Reconheço minhas forças e limitações emocionais com clareza.', type: 'scale5', options: [{ text: '', dimension: 'AC' }] },
    { id: 'q4', text: 'Consigo manter a calma mesmo em situações de pressão.', type: 'scale5', options: [{ text: '', dimension: 'AG' }] },
    { id: 'q5', text: 'Não deixo emoções negativas do dia a dia afetarem meu trabalho.', type: 'scale5', options: [{ text: '', dimension: 'AG' }] },
    { id: 'q6', text: 'Adapto meu comportamento conforme as exigências da situação.', type: 'scale5', options: [{ text: '', dimension: 'AG' }] },
    { id: 'q7', text: 'Percebo quando alguém da equipe está chateado ou sobrecarregado.', type: 'scale5', options: [{ text: '', dimension: 'EM' }] },
    { id: 'q8', text: 'Consigo ver a perspectiva dos outros, mesmo quando discordo.', type: 'scale5', options: [{ text: '', dimension: 'EM' }] },
    { id: 'q9', text: 'As pessoas se sentem ouvidas quando conversam comigo.', type: 'scale5', options: [{ text: '', dimension: 'EM' }] },
    { id: 'q10', text: 'Consigo resolver conflitos de forma construtiva.', type: 'scale5', options: [{ text: '', dimension: 'HS' }] },
    { id: 'q11', text: 'Colaboro bem em equipe e incentivo os colegas.', type: 'scale5', options: [{ text: '', dimension: 'HS' }] },
    { id: 'q12', text: 'Comunico ideias de forma clara e convincente.', type: 'scale5', options: [{ text: '', dimension: 'HS' }] },
  ],
  interpret(scores) {
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
    const top = sorted[0]
    const weak = sorted[sorted.length - 1]
    const avg = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length
    const labels: Record<string, string> = { AC: 'Autoconsciência', AG: 'Autogestão', EM: 'Empatia', HS: 'Habilidades Sociais' }
    return {
      dominant: top[0],
      profile: avg >= 4 ? 'Alta Inteligência Emocional — Excelente maturidade emocional.' :
        avg >= 3 ? 'IE Moderada — Boa base com áreas de desenvolvimento.' :
          'IE em Desenvolvimento — Oportunidade de crescimento emocional.',
      insights: [
        `Seu ponto mais forte é ${labels[top[0]]}.`,
        `Área com mais espaço para crescer: ${labels[weak[0]]}.`,
        avg >= 4 ? 'Você tem excelente gestão emocional no ambiente de trabalho.' :
          'Investir em desenvolvimento emocional pode melhorar seus relacionamentos.',
      ],
    }
  },
}

export const ALL_TESTS: PsychTestDef[] = [DISC_TEST, BIGFIVE_TEST, VAC_TEST, IKIGAI_TEST, IE_TEST]

export function getTestDef(type: PsychTestType): PsychTestDef {
  return ALL_TESTS.find(t => t.type === type) || ALL_TESTS[0]
}
