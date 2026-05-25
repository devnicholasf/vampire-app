/**
 * Dados de Vantagens, Defeitos e Loresheets para Vampiro: A Máscara V5
 */

export interface AdvantageItem {
  nome: string
  pontos: number
  fixo: boolean
  max?: number
}

export interface AdvantagesData {
  antecedentes: string[]
  meritos: {
    fisicos: AdvantageItem[]
    mentais: AdvantageItem[]
    sociais: AdvantageItem[]
    sobrenaturais: AdvantageItem[]
    sangue_ralo: AdvantageItem[]
  }
  defeitos: {
    fisicos: AdvantageItem[]
    mentais: AdvantageItem[]
    sociais: AdvantageItem[]
    sobrenaturais: AdvantageItem[]
    sangue_ralo: AdvantageItem[]
  }
  loresheets: string[]
}

export const vantagensDados: AdvantagesData = {
  antecedentes: [
    "Aliados",
    "Contatos",
    "Fama",
    "Influência",
    "Lacaios",
    "Mawla",
    "Rebanho",
    "Recursos",
    "Refúgio",
    "Status"
  ],
  
  meritos: {
    fisicos: [
      { nome: "Atraente", pontos: 2, fixo: true },
      { nome: "Impressionante", pontos: 4, fixo: true },
      { nome: "Estômago de Ferro", pontos: 2, fixo: true },
      { nome: "Resistência a Toxinas", pontos: 1, fixo: true },
      { nome: "Visual", pontos: 2, fixo: true },
      { nome: "Alimentação", pontos: 3, fixo: true }
    ],
    mentais: [
      { nome: "Linguista", pontos: 1, fixo: false },
      { nome: "Mente Alerta", pontos: 2, fixo: true }
    ],
    sociais: [
      { nome: "Identidade Falsa", pontos: 3, fixo: false, max: 3 },
      { nome: "Língua Afiada", pontos: 2, fixo: true }
    ],
    sobrenaturais: [
      { nome: "Médium", pontos: 2, fixo: true },
      { nome: "Sentido do Perigo", pontos: 2, fixo: true },
      { nome: "Vontade de Ferro", pontos: 2, fixo: true }
    ],
    sangue_ralo: [
      { nome: "Alquimista de Sangue Ralo", pontos: 1, fixo: false },
      { nome: "Caminhante do Dia", pontos: 1, fixo: false },
      { nome: "Disciplina de Sangue Ralo", pontos: 1, fixo: false },
      { nome: "Aparência Humana", pontos: 1, fixo: true },
      { nome: "Sede Reduzida", pontos: 1, fixo: true }
    ]
  },
  
  defeitos: {
    fisicos: [
      { nome: "Feio", pontos: 2, fixo: true },
      { nome: "Repulsivo", pontos: 4, fixo: true },
      { nome: "Carne Racha", pontos: 1, fixo: true },
      { nome: "Bebedor Ineficiente", pontos: 2, fixo: true },
      { nome: "Restrição Alimentar", pontos: 1, fixo: false, max: 3 },
      { nome: "Sede Metódica", pontos: 1, fixo: true },
      { nome: "Alimentação", pontos: 1, fixo: false, max: 2 }
    ],
    mentais: [
      { nome: "Amnésia", pontos: 1, fixo: false, max: 2 },
      { nome: "Vício", pontos: 1, fixo: true },
      { nome: "Pesadelos", pontos: 1, fixo: true }
    ],
    sociais: [
      { nome: "Segredo Sombrio", pontos: 1, fixo: false, max: 2 },
      { nome: "Desacreditado", pontos: 1, fixo: true },
      { nome: "Identidade Trocada", pontos: 1, fixo: true },
      { nome: "Submisso", pontos: 1, fixo: true },
      { nome: "Criminoso", pontos: 1, fixo: true },
      { nome: "Inimigo", pontos: 1, fixo: false },
      { nome: "Segregado", pontos: 2, fixo: true },
      { nome: "Influência", pontos: 1, fixo: false },
      { nome: "Inimigo Mítico", pontos: 1, fixo: false }
    ],
    sobrenaturais: [
      { nome: "Assombrado", pontos: 1, fixo: false, max: 2 },
      { nome: "Presença Repulsiva", pontos: 2, fixo: true },
      { nome: "Repulsa do Sangue", pontos: 2, fixo: true }
    ],
    sangue_ralo: [
      { nome: "Bebedor de Fluidos", pontos: 1, fixo: true },
      { nome: "Cicatrizes de Caine", pontos: 1, fixo: true },
      { nome: "Fragilidade de Sangue Ralo", pontos: 1, fixo: true },
      { nome: "Marca da Besta", pontos: 1, fixo: true },
      { nome: "Mordida de Bebê", pontos: 1, fixo: true },
      { nome: "Rejeitado pelos Anarquistas", pontos: 1, fixo: true },
      { nome: "Caçado pela Camarilla", pontos: 1, fixo: true }
    ]
  },
  
  loresheets: [
    "O Movimento Anarquista",
    "A Camarilla",
    "A Segunda Inquisição",
    "Primeira Luz",
    "A Semana dos Pesadelos",
    "Descendente de Hardestadt",
    "Descendente de Helena",
    "Descendente de Louhi",
    "Descendente de Villon",
    "Descendente de Xaviar",
    "O Ministério de Set",
    "A Rede Nosferatu",
    "A Pirâmide Tremere / Casa Carna",
    "A Pirâmide Tremere / Casa Goratrix",
    "Bahari",
    "Culto de Shalim",
    "A Cinza",
    "Golconda"
  ]
}

export const vampireClans = [
  'Banu Haqim',
  'Brujah',
  'Gangrel',
  'Hecata',
  'Lasombra',
  'Malkavian',
  'Nosferatu',
  'O Ministério',
  'Ravnos',
  'Salubri',
  'Toreador',
  'Tremere',
  'Tzimisce',
  'Ventrue',
  'Caitiff',
  'Sangue Fraco'
]
