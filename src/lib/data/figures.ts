export interface HistoricalFigure {
  id: string;
  name: string;
  lived: string;
  role: string;
  civilization: string;
  bio: string;
  achievements: string[];
  failures: string[];
  quote: string;
  legacy: string;
}

export const FIGURES: HistoricalFigure[] = [
  {
    id: 'alexander',
    name: 'Alexander the Great',
    lived: '356 – 323 BCE',
    role: 'King of Macedon, conqueror',
    civilization: 'Ancient Greece',
    bio: 'Tutored by Aristotle, king at 20, Alexander conquered the Persian Empire in a decade and never lost a battle.',
    achievements: [
      'Conquered the Achaemenid Empire from the Aegean to the Indus',
      'Founded 20+ cities including Alexandria',
      'Spread Hellenistic culture across three continents',
    ],
    failures: [
      'Failed to establish a stable succession — empire fractured at his death',
      'Increasing autocracy and execution of loyal officers',
    ],
    quote: 'There is nothing impossible to him who will try.',
    legacy: 'The Hellenistic age he created shaped science, religion, and politics for centuries.',
  },
  {
    id: 'cleopatra',
    name: 'Cleopatra VII',
    lived: '69 – 30 BCE',
    role: 'Last pharaoh of Egypt',
    civilization: 'Ancient Egypt',
    bio: 'A polyglot diplomat and strategist who allied with Caesar and Antony to preserve Egyptian independence.',
    achievements: [
      'Restored Egyptian prosperity and navy',
      'Held Rome at bay for two decades through diplomacy',
      'First Ptolemy in 300 years to speak Egyptian',
    ],
    failures: ['Defeat at Actium (31 BCE) ended Ptolemaic Egypt'],
    quote: 'I will not be triumphed over.',
    legacy: 'An icon of political intelligence whose death made Egypt a Roman province.',
  },
  {
    id: 'caesar',
    name: 'Julius Caesar',
    lived: '100 – 44 BCE',
    role: 'Roman general and dictator',
    civilization: 'Roman Empire',
    bio: 'Conqueror of Gaul and victor of the civil war who ended the Republic and was assassinated on the Ides of March.',
    achievements: [
      'Conquest of Gaul (58–50 BCE)',
      'Calendar reform — the Julian calendar',
      'Centralized reforms of debt, land, and citizenship',
    ],
    failures: ['Accumulation of monarchic power provoked his assassination'],
    quote: 'Alea iacta est — the die is cast.',
    legacy: 'His name became the very title of emperors: Caesar, Kaiser, Tsar.',
  },
  {
    id: 'genghis',
    name: 'Genghis Khan',
    lived: 'c. 1162 – 1227',
    role: 'Founder of the Mongol Empire',
    civilization: 'Mongol Empire',
    bio: 'Rose from tribal outcast to unify the steppe and build the largest contiguous empire in history.',
    achievements: [
      'Unified the Mongol tribes under the Yassa code',
      'Conquered Khwarezmia and northern China',
      'Built the yam postal-relay network and promoted meritocracy',
    ],
    failures: ['Campaigns caused demographic catastrophe across Central Asia'],
    quote: 'If you\'re afraid — don\'t do it. If you\'re doing it — don\'t be afraid.',
    legacy: 'Reconnected Eurasia; his empire moved goods, ideas, and technologies between East and West.',
  },
  {
    id: 'napoleon',
    name: 'Napoleon Bonaparte',
    lived: '1769 – 1821',
    role: 'Emperor of the French',
    civilization: 'French Empire',
    bio: 'Corsican artillery officer who mastered revolutionary France, dominated Europe, and died in exile on St. Helena.',
    achievements: [
      'Napoleonic Code — foundation of civil law in dozens of nations',
      'Victories at Austerlitz, Jena, Wagram',
      'Modernized administration, education, and finance',
    ],
    failures: ['Invasion of Russia (1812) destroyed his Grande Armée', 'Final defeat at Waterloo (1815)'],
    quote: 'Imagination rules the world.',
    legacy: 'His legal code and nationalist shockwave shaped modern Europe.',
  },
  {
    id: 'elizabeth1',
    name: 'Elizabeth I',
    lived: '1533 – 1603',
    role: 'Queen of England',
    civilization: 'British Empire',
    bio: 'The Virgin Queen steered England through religious strife, defeated the Armada, and presided over a golden age.',
    achievements: [
      'Defeat of the Spanish Armada (1588)',
      'Religious settlement stabilizing the Church of England',
      'Patronage of the Elizabethan renaissance — Shakespeare, Marlowe, Drake',
    ],
    failures: ['Left no heir, ending the Tudor dynasty', 'Brutal suppression of Ireland'],
    quote: 'I know I have the body of a weak and feeble woman, but I have the heart and stomach of a king.',
    legacy: 'Laid the maritime and cultural foundations of the British Empire.',
  },
  {
    id: 'akbar',
    name: 'Akbar the Great',
    lived: '1542 – 1605',
    role: 'Mughal Emperor',
    civilization: 'Indian Empires',
    bio: 'Illiterate yet brilliant, Akbar tripled the Mughal realm and pursued an unprecedented policy of religious pluralism.',
    achievements: [
      'Abolished the jizya tax and promoted Hindu-Muslim integration',
      'Created the mansabdari administrative system',
      'Founded the syncretic Din-i Ilahi and the Ibadat Khana debates',
    ],
    failures: ['Din-i Ilahi found almost no followers', 'Succession conflict with son Jahangir'],
    quote: 'A monarch should be ever intent on conquest, otherwise his neighbours rise in arms against him.',
    legacy: 'His pluralist statecraft remains the touchstone of Indian imperial history.',
  },
  {
    id: 'lincoln',
    name: 'Abraham Lincoln',
    lived: '1809 – 1865',
    role: '16th President of the United States',
    civilization: 'United States',
    bio: 'Self-taught prairie lawyer who preserved the Union through civil war and ended American slavery.',
    achievements: [
      'Preserved the Union in the Civil War',
      'Emancipation Proclamation and push for the 13th Amendment',
      'Gettysburg Address — redefinition of American democracy',
    ],
    failures: ['Suspension of habeas corpus drew constitutional criticism', 'Early war leadership marked by failed generals'],
    quote: 'Government of the people, by the people, for the people, shall not perish from the earth.',
    legacy: 'The moral refounding of the United States.',
  },
  {
    id: 'curie',
    name: 'Marie Curie',
    lived: '1867 – 1934',
    role: 'Physicist and chemist',
    civilization: 'Modern Europe',
    bio: 'Polish-born pioneer of radioactivity, the first person to win Nobel Prizes in two sciences.',
    achievements: [
      'Discovered polonium and radium',
      'Nobel Prizes in Physics (1903) and Chemistry (1911)',
      'Founded mobile X-ray units in WWI and the Radium Institute',
    ],
    failures: ['Radiation exposure ultimately caused her death'],
    quote: 'Nothing in life is to be feared, it is only to be understood.',
    legacy: 'Opened the atomic age and shattered barriers for women in science.',
  },
  {
    id: 'churchill',
    name: 'Winston Churchill',
    lived: '1874 – 1965',
    role: 'British Prime Minister',
    civilization: 'British Empire',
    bio: 'Soldier, historian, and orator who led Britain alone against Nazi Germany in 1940.',
    achievements: [
      'Led Britain through WWII and refused peace with Hitler in 1940',
      'Forged the Grand Alliance with Roosevelt and Stalin',
      'Nobel Prize in Literature (1953)',
    ],
    failures: ['Gallipoli campaign (1915)', 'Policies during the 1943 Bengal famine remain deeply criticized'],
    quote: 'Never in the field of human conflict was so much owed by so many to so few.',
    legacy: 'The defining voice of democratic resistance in the twentieth century.',
  },
  {
    id: 'mandela',
    name: 'Nelson Mandela',
    lived: '1918 – 2013',
    role: 'Anti-apartheid leader, President of South Africa',
    civilization: 'Modern Africa',
    bio: 'Spent 27 years in prison, then negotiated the peaceful end of apartheid and led a reconciled South Africa.',
    achievements: [
      'Negotiated end of apartheid without civil war',
      'First democratically elected President of South Africa (1994)',
      'Truth and Reconciliation Commission',
    ],
    failures: ['Slow progress on economic inequality during his term'],
    quote: 'It always seems impossible until it\'s done.',
    legacy: 'The global model of reconciliation over vengeance.',
  },
  {
    id: 'hatshepsut',
    name: 'Hatshepsut',
    lived: 'c. 1507 – 1458 BCE',
    role: 'Pharaoh of Egypt',
    civilization: 'Ancient Egypt',
    bio: 'One of the few female pharaohs, she ruled for two decades of peace, trade, and monumental building.',
    achievements: [
      'Expedition to Punt reopening luxury trade routes',
      'Mortuary temple at Deir el-Bahri — a masterpiece of ancient architecture',
      'Two decades of prosperity and stability',
    ],
    failures: ['Her memory was systematically erased by successors'],
    quote: 'Now my heart turns this way and that, as I think what the people will say.',
    legacy: 'Proof of female sovereignty at the height of Egyptian power.',
  },
];

export function getFigure(id: string): HistoricalFigure | undefined {
  return FIGURES.find((f) => f.id === id);
}
