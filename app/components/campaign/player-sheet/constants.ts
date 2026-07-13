export interface LabeledValue {
  key: string
  name: string
}

const DEFAULT_DISCIPLINE_ICON_PATH = 'M13 10V3L4 14h7v7l9-11h-7z'

export const sectOptions = ['Camarilla', 'Sabá', 'Anarquistas', 'Independente']

export const predatorDescriptions: Record<string, string> = {
  Consensualista: 'Você se alimenta apenas de voluntários que oferecem seu sangue conscientemente, cultivando relacionamentos íntimos baseados em confiança mútua e consentimento.',
  Fazendeiro: 'Você prefere se alimentar de animais ao invés de humanos, cultivando uma conexão especial com criaturas e evitando ferir mortais.',
  Osiris: 'Você cultiva um culto de mortais devotos que o veneram como uma divindade, oferecendo seu sangue em rituais de adoração e submissão.',
  Sacoleiro: 'Você rouba sangue de bancos de sangue, hospitais e fontes médicas, evitando contato direto com vítimas vivas.',
  Sandman: 'Você se alimenta de vítimas adormecidas, invadindo lares e infiltrando-se sorrateiramente para sugar sangue sem ser notado.',
  Sanguessuga: 'Você se alimenta de outros vampiros, drenando vitae de seus companheiros Cainitas em atos de diablerie parcial ou roubo vampírico.',
  'Scene Queen': 'Você domina clubes noturnos, festas e cenas sociais, manipulando e seduzindo vítimas em ambientes de êxtase e caos.',
  Sereia: 'Você seduz e atrai vítimas através de charme sobrenatural, criando relacionamentos íntimos que mascaram sua natureza predatória.',
  Trinchador: 'Você caça violentamente nas ruas, atacando vítimas aleatórias com ferocidade brutal e selvagem.',
  'Vira-Lata': 'Você se alimenta dos marginalizados da sociedade – sem-teto, viciados e esquecidos – caçando nas sombras da miséria urbana.'
}

export const disciplineDescriptions: Record<string, string> = {
  Animalismo: 'Comunhão sobrenatural com animais, controlando bestas e convocando criaturas.',
  Auspícios: 'Percepção sobre-humana que revela verdades ocultas e premonições do futuro.',
  Celeridade: 'Velocidade e reflexos vampíricos que transcendem os limites mortais.',
  Dominação: 'Controle mental absoluto, quebrando vontades e reescrevendo memórias.',
  'Feitiçaria de Sangue': 'Magia ritual alimentada por vitae, manipulando a própria essência vampírica.',
  Fortitude: 'Resistência sobrenatural, até o ponto de resistir ao fogo e à luz solar.',
  Metamorfose: 'Transformação corporal em formas bestiais e névoa.',
  Ofuscação: 'Capacidade de permanecer obscuro e invisivel, mesmo em meio a multidões',
  Potência: 'Força monstruosa capaz de esmagar ossos e rasgar aço.',
  Presença: 'Magnetismo sobrenatural que inspira terror, adoração ou desejo.',
  Proteanismo: 'Transformação física em garras, forma bestial ou névoa, moldando o corpo vampírico.',
  Tenebrosidade: 'Controle sobre trevas vivas que devoram luz e carne.',
  Serpentis: 'Poderes ofídicos ancestrais dos seguidores de Set.',
  Quietus: 'Assassinato silencioso através de venenos de sangue mortais.',
  Quimerismo: 'Ilusões sensoriais que enganam mente e corpo.',
  Vicissitude: 'Manipulação grotesca de carne e osso, moldando corpos como argila.'
}

const disciplineIconPaths: Record<string, string> = {
  Animalismo: 'M8 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm8 0c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zM8 8c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm8 0c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-4 4c2.2 0 4 1.8 4 4v4H8v-4c0-2.2 1.8-4 4-4z',
  Auspícios: 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z',
  Celeridade: DEFAULT_DISCIPLINE_ICON_PATH,
  Dominação: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z',
  'Feitiçaria de Sangue': 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  Fortitude: 'M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83-3.45-1.13-6-4.82-6-8.83V6.31l6-2.12 6 2.12v4.78z',
  Metamorfose: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z',
  Ofuscação: 'M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z',
  Potência: 'M7 24h2v-2H7v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2zm-8-4h2v-2H7v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2zm-4-8H9v6h2v-2h2v-2h-2V12zm-2-2h2V8h2V6h-2V4h-2v2H9v2h2v2zm10 10h2v-2h-2v2z',
  Presença: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
  Proteanismo: 'M21 5v6.59l-2.29-2.3c-1.54 1.54-3.6 2.39-5.83 2.39-2.23 0-4.29-.85-5.83-2.39L4.76 11.6C6.77 13.61 9.54 14.88 12.64 15v.02c.17 0 .34-.01.51-.02V19H9v2h6v-2h-1.64v-4.03c3.1-.17 5.88-1.44 7.89-3.46L23 13.24V5h-2zm-9 3c.83 0 1.5-.67 1.5-1.5S12.83 5 12 5s-1.5.67-1.5 1.5S11.17 8 12 8zm5-1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5S19.33 5 18.5 5 17 5.67 17 6.5z',
  Tenebrosidade: 'M9 2c-1.05 0-2.05.16-3 .46 4.06 1.27 7 5.06 7 9.54 0 4.48-2.94 8.27-7 9.54.95.3 1.95.46 3 .46 5.52 0 10-4.48 10-10S14.52 2 9 2z',
  Serpentis: 'M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 1.89.52 3.65 1.42 5.17C5.16 20.26 8.35 22 12 22s6.84-1.74 8.58-4.83c.9-1.52 1.42-3.28 1.42-5.17zM12 20c-2.76 0-5.24-1.4-6.71-3.53.76-.77 1.64-1.41 2.61-1.88.19-.09.38-.17.57-.24C9.45 13.63 10.67 13 12 13c1.33 0 2.55.63 3.53 1.35.19.07.38.15.57.24.97.47 1.85 1.11 2.61 1.88C17.24 18.6 14.76 20 12 20zm0-9c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z',
  Quietus: 'M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.47-.47-1.12-.29-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83zM3 17.25L13.06 7.18l3.75 3.75L6.75 21H3v-3.75z',
  Quimerismo: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8.5 8c.83 0 1.5.67 1.5 1.5S9.33 11 8.5 11 7 10.33 7 9.5 7.67 8 8.5 8zm7 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5S14 10.33 14 9.5 14.67 8 15.5 8zM12 17.5c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z',
  Vicissitude: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
}

export const vampireDisciplines = [
  'Animalismo',
  'Auspícios',
  'Celeridade',
  'Dominação',
  'Feitiçaria de Sangue',
  'Fortitude',
  'Metamorfose',
  'Ofuscação',
  'Potência',
  'Presença',
  'Proteanismo',
  'Tenebrosidade',
  'Serpentis',
  'Quietus',
  'Quimerismo',
  'Vicissitude'
]

export const physicalAttributes: LabeledValue[] = [
  { key: 'strength', name: 'Força' },
  { key: 'dexterity', name: 'Destreza' },
  { key: 'stamina', name: 'Vigor' }
]

export const socialAttributes: LabeledValue[] = [
  { key: 'charisma', name: 'Carisma' },
  { key: 'manipulation', name: 'Manipulação' },
  { key: 'composure', name: 'Autocontrole' }
]

export const mentalAttributes: LabeledValue[] = [
  { key: 'intelligence', name: 'Inteligência' },
  { key: 'wits', name: 'Raciocínio' },
  { key: 'resolve', name: 'Determinação' }
]

export const talents: LabeledValue[] = [
  { key: 'melee', name: 'Corpo a Corpo' },
  { key: 'firearms', name: 'Armas de Fogo' },
  { key: 'athletics', name: 'Atletismo' },
  { key: 'brawl', name: 'Briga' },
  { key: 'drive', name: 'Condução' },
  { key: 'stealth', name: 'Furtividade' },
  { key: 'larceny', name: 'Ladroagem' },
  { key: 'craft', name: 'Ofícios' },
  { key: 'survival', name: 'Sobrevivência' }
]

export const skills: LabeledValue[] = [
  { key: 'animalKen', name: 'Empatia com Animais' },
  { key: 'etiquette', name: 'Etiqueta' },
  { key: 'intimidation', name: 'Intimidação' },
  { key: 'leadership', name: 'Liderança' },
  { key: 'streetwise', name: 'Manha' },
  { key: 'performance', name: 'Performance' },
  { key: 'persuasion', name: 'Persuasão' },
  { key: 'awareness', name: 'Sagacidade' },
  { key: 'subterfuge', name: 'Subterfúgio' }
]

export const knowledges: LabeledValue[] = [
  { key: 'science', name: 'Ciência' },
  { key: 'academics', name: 'Acadêmicos' },
  { key: 'finance', name: 'Finanças' },
  { key: 'investigation', name: 'Investigação' },
  { key: 'medicine', name: 'Medicina' },
  { key: 'occult', name: 'Ocultismo' },
  { key: 'perception', name: 'Percepção' },
  { key: 'politics', name: 'Política' },
  { key: 'technology', name: 'Tecnologia' }
]

export const getDisciplineIconPath = (discipline: string): string => {
  return disciplineIconPaths[discipline] || DEFAULT_DISCIPLINE_ICON_PATH
}
