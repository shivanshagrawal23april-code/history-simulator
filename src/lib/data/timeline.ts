export type EventCategory =
  | 'war'
  | 'politics'
  | 'science'
  | 'religion'
  | 'economics'
  | 'culture'
  | 'technology'
  | 'exploration';

export interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  category: EventCategory;
  region: string;
}

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  war: 'War',
  politics: 'Politics',
  science: 'Science',
  religion: 'Religion',
  economics: 'Economics',
  culture: 'Culture',
  technology: 'Technology',
  exploration: 'Exploration',
};

export const TIMELINE_EVENTS: TimelineEvent[] = [
  { id: 'writing', year: -3200, title: 'Invention of writing', description: 'Cuneiform emerges in Sumer, beginning recorded history.', category: 'technology', region: 'Mesopotamia' },
  { id: 'pyramid', year: -2560, title: 'Great Pyramid completed', description: 'Khufu\'s pyramid at Giza — tallest structure on Earth for 3,800 years.', category: 'culture', region: 'Egypt' },
  { id: 'hammurabi', year: -1754, title: 'Code of Hammurabi', description: 'One of the earliest complete legal codes is inscribed in Babylon.', category: 'politics', region: 'Mesopotamia' },
  { id: 'kadesh', year: -1274, title: 'Battle of Kadesh', description: 'Egypt and the Hittites fight the largest chariot battle in history; first recorded peace treaty follows.', category: 'war', region: 'Levant' },
  { id: 'olympics', year: -776, title: 'First Olympic Games', description: 'Panhellenic games begin at Olympia, dating the Greek calendar.', category: 'culture', region: 'Greece' },
  { id: 'buddha', year: -528, title: 'Enlightenment of the Buddha', description: 'Siddhartha Gautama founds one of the world\'s great religions.', category: 'religion', region: 'India' },
  { id: 'marathon', year: -490, title: 'Battle of Marathon', description: 'Athens repels the first Persian invasion of Greece.', category: 'war', region: 'Greece' },
  { id: 'parthenon', year: -447, title: 'Parthenon begun', description: 'Athens raises the defining monument of classical architecture.', category: 'culture', region: 'Greece' },
  { id: 'alexander-d', year: -323, title: 'Death of Alexander', description: 'His empire fragments into the Hellenistic kingdoms.', category: 'politics', region: 'Near East' },
  { id: 'qin', year: -221, title: 'Qin unifies China', description: 'Qin Shi Huang creates the first centralized Chinese empire.', category: 'politics', region: 'China' },
  { id: 'caesar-d', year: -44, title: 'Assassination of Caesar', description: 'The Ides of March trigger the final collapse of the Roman Republic.', category: 'politics', region: 'Rome' },
  { id: 'jesus', year: 30, title: 'Crucifixion of Jesus', description: 'The founding event of Christianity in Roman Judaea.', category: 'religion', region: 'Levant' },
  { id: 'paper', year: 105, title: 'Papermaking perfected', description: 'Cai Lun standardizes paper production in Han China.', category: 'technology', region: 'China' },
  { id: 'constantine', year: 313, title: 'Edict of Milan', description: 'Constantine legalizes Christianity across the Roman Empire.', category: 'religion', region: 'Rome' },
  { id: 'rome-falls', year: 476, title: 'Fall of Western Rome', description: 'Odoacer deposes Romulus Augustulus; antiquity gives way to the medieval world.', category: 'politics', region: 'Rome' },
  { id: 'hijra', year: 622, title: 'The Hijra', description: 'Muhammad\'s migration to Medina marks year one of the Islamic calendar.', category: 'religion', region: 'Arabia' },
  { id: 'talas', year: 751, title: 'Battle of Talas', description: 'Abbasids defeat Tang China; papermaking spreads west.', category: 'war', region: 'Central Asia' },
  { id: 'charlemagne', year: 800, title: 'Charlemagne crowned', description: 'A new "Roman" empire is proclaimed in the West.', category: 'politics', region: 'Europe' },
  { id: 'gunpowder', year: 850, title: 'Gunpowder discovered', description: 'Tang alchemists record the formula that will remake warfare.', category: 'technology', region: 'China' },
  { id: 'hastings', year: 1066, title: 'Battle of Hastings', description: 'Norman conquest transforms England\'s language, law, and aristocracy.', category: 'war', region: 'England' },
  { id: 'crusade1', year: 1095, title: 'First Crusade called', description: 'Urban II launches two centuries of holy war for the Levant.', category: 'religion', region: 'Europe/Levant' },
  { id: 'genghis-k', year: 1206, title: 'Genghis Khan proclaimed', description: 'The Mongol conquests — history\'s largest land empire — begin.', category: 'war', region: 'Mongolia' },
  { id: 'magna', year: 1215, title: 'Magna Carta', description: 'English barons force limits on royal power at Runnymede.', category: 'politics', region: 'England' },
  { id: 'blackdeath', year: 1347, title: 'Black Death reaches Europe', description: 'Plague kills a third to half of Europe, reshaping economy and society.', category: 'economics', region: 'Europe' },
  { id: 'constantinople', year: 1453, title: 'Fall of Constantinople', description: 'Mehmed II ends the Byzantine Empire; cannon breach ancient walls.', category: 'war', region: 'Anatolia' },
  { id: 'printing', year: 1455, title: 'Gutenberg Bible printed', description: 'Movable type ignites an information revolution in Europe.', category: 'technology', region: 'Europe' },
  { id: 'columbus', year: 1492, title: 'Columbus reaches the Americas', description: 'The Columbian exchange links two hemispheres forever.', category: 'exploration', region: 'Atlantic' },
  { id: 'reformation', year: 1517, title: 'Protestant Reformation', description: 'Luther\'s 95 Theses split Western Christendom.', category: 'religion', region: 'Europe' },
  { id: 'tenochtitlan', year: 1521, title: 'Fall of Tenochtitlan', description: 'Cortés and allies destroy the Aztec Empire.', category: 'war', region: 'Mexico' },
  { id: 'copernicus', year: 1543, title: 'Copernican revolution', description: 'De Revolutionibus places the sun at the center of the cosmos.', category: 'science', region: 'Europe' },
  { id: 'armada', year: 1588, title: 'Spanish Armada defeated', description: 'England\'s survival opens the age of British sea power.', category: 'war', region: 'Atlantic' },
  { id: 'westphalia', year: 1648, title: 'Peace of Westphalia', description: 'The modern system of sovereign states is born.', category: 'politics', region: 'Europe' },
  { id: 'newton', year: 1687, title: 'Newton\'s Principia', description: 'Universal gravitation unifies the heavens and the earth.', category: 'science', region: 'England' },
  { id: 'steam', year: 1769, title: 'Watt\'s steam engine', description: 'Efficient steam power ignites the Industrial Revolution.', category: 'technology', region: 'Britain' },
  { id: 'usa', year: 1776, title: 'American Declaration of Independence', description: 'Thirteen colonies assert the rights of self-government.', category: 'politics', region: 'North America' },
  { id: 'french-rev', year: 1789, title: 'French Revolution', description: 'The storming of the Bastille begins the age of modern politics.', category: 'politics', region: 'France' },
  { id: 'waterloo', year: 1815, title: 'Battle of Waterloo', description: 'Napoleon\'s final defeat; a century of British-led order follows.', category: 'war', region: 'Europe' },
  { id: 'darwin', year: 1859, title: 'On the Origin of Species', description: 'Darwin publishes the theory of evolution by natural selection.', category: 'science', region: 'Britain' },
  { id: 'meiji', year: 1868, title: 'Meiji Restoration', description: 'Japan industrializes at unprecedented speed.', category: 'politics', region: 'Japan' },
  { id: 'ww1', year: 1914, title: 'World War I begins', description: 'Industrial total war destroys four empires and 17 million lives.', category: 'war', region: 'Global' },
  { id: 'october', year: 1917, title: 'Russian Revolution', description: 'The Bolsheviks seize power; the communist century begins.', category: 'politics', region: 'Russia' },
  { id: 'depression', year: 1929, title: 'Great Depression', description: 'The Wall Street crash triggers a global economic catastrophe.', category: 'economics', region: 'Global' },
  { id: 'ww2', year: 1939, title: 'World War II begins', description: 'The deadliest conflict in history — 70+ million dead.', category: 'war', region: 'Global' },
  { id: 'hiroshima', year: 1945, title: 'Atomic bombings', description: 'Nuclear weapons end WWII and open the atomic age.', category: 'war', region: 'Japan' },
  { id: 'india-ind', year: 1947, title: 'Indian independence', description: 'Partition creates India and Pakistan; decolonization accelerates.', category: 'politics', region: 'South Asia' },
  { id: 'dna', year: 1953, title: 'Structure of DNA', description: 'Watson, Crick, and Franklin\'s work reveals the code of life.', category: 'science', region: 'Britain' },
  { id: 'sputnik', year: 1957, title: 'Sputnik launched', description: 'The space age and the space race begin.', category: 'technology', region: 'USSR' },
  { id: 'moon', year: 1969, title: 'Apollo 11 Moon landing', description: 'Humans walk on another world for the first time.', category: 'exploration', region: 'Global' },
  { id: 'berlin-wall', year: 1989, title: 'Fall of the Berlin Wall', description: 'The Cold War order collapses in a single autumn.', category: 'politics', region: 'Europe' },
  { id: 'www', year: 1991, title: 'World Wide Web public', description: 'Berners-Lee\'s invention begins rewiring civilization.', category: 'technology', region: 'Global' },
];

export function eventsSorted(): TimelineEvent[] {
  return [...TIMELINE_EVENTS].sort((a, b) => a.year - b.year);
}
