export type EvolutionStage = 'baby' | 'apprentice' | 'tycoon' | 'potus' | 'legend';

export type ShellColor = 'gold' | 'red' | 'navy' | 'black' | 'palm';

export type LcdColorTheme = 'classic-green' | 'amber-glow' | 'ice-blue' | 'matrix-green';

export type MenuCategory = 
  | 'feed' 
  | 'dance'
  | 'tv'
  | 'lights' 
  | 'games' 
  | 'medicine' 
  | 'clean' 
  | 'ratings' 
  | 'pep' 
  | 'groom';

export type ActiveMiniGame = 'none' | 'golf' | 'rally' | 'deal';

export type GameScreenMode = 'TITLE' | 'PLAYING' | 'MINIGAME' | 'PAUSED' | 'EVOLUTION_FANFARE' | 'GAME_OVER';

export interface PetStats {
  hunger: number;       // 0-100 (100 is full)
  happiness: number;    // 0-100 (100 is ecstatic)
  energy: number;       // 0-100 (100 is fully rested)
  cleanliness: number;  // 0-100 (100 is clean)
  hairStyle: number;    // 0-100 (100 is majestic golden comb-over)
  health: number;       // 0-100 (100 is peak stamina)
  ratings: number;      // 0-100 (approval poll numbers)
  
  // Progression
  ageMinutes: number;   // In-game age
  evolutionStage: EvolutionStage;
  growthProgress: number; // 0-100% to next evolution stage!
  netWorthBillion: number; // Fun metric (e.g. $10B)
  ralliesHeld: number;
  golfTrophies: number;
  burgersEaten: number;
  dealsStruck: number;
  dancesDone: number;
  tvYellsCount: number;
  
  // State flags
  isSleeping: boolean;
  isSick: boolean;
  messCount: number;    // Number of scattered classified documents on floor (0-4)
  attentionNeeded: boolean;
  lastFedTimestamp: number;
  lastActionTimestamp: number;
}

export interface FoodItem {
  id: string;
  name: string;
  icon: string;
  hungerBoost: number;
  happinessBoost: number;
  description: string;
}

export const FOOD_MENU: FoodItem[] = [
  { id: 'burger', name: 'Golden Double Burger', icon: '🍔', hungerBoost: 35, happinessBoost: 20, description: 'The absolute greatest burger. Many people are saying this.' },
  { id: 'fries', name: 'Crispy Crinkle Fries', icon: '🍟', hungerBoost: 20, happinessBoost: 15, description: 'Crisped to golden perfection. Tremendous crunch.' },
  { id: 'steak', name: 'Well-Done Prime Steak', icon: '🥩', hungerBoost: 50, happinessBoost: 25, description: 'Prime cut with a generous swirl of ketchup.' },
  { id: 'soda', name: 'Silver Goblet Diet Soda', icon: '🥤', hungerBoost: 10, happinessBoost: 15, description: 'Served ice cold by pressing the famous desk button.' },
  { id: 'icecream', name: 'Two Scoops Ice Cream', icon: '🍨', hungerBoost: 25, happinessBoost: 30, description: 'Two big scoops for Donald. Everyone else gets one scoop!' },
  { id: 'pizza', name: 'Manhattan Fork Pizza', icon: '🍕', hungerBoost: 30, happinessBoost: 20, description: 'Eaten with a gold fork and knife, pure class.' },
];

export type TrumpMood =
  | 'happy' | 'rallied' | 'feisty' | 'golf' | 'sleepy' | 'hungry'
  | 'baby' | 'dance' | 'fake_news' | 'lonely' | 'bored' | 'sick' | 'proud';

export interface TrumpQuote {
  /** Words from the recording(s), not a fabricated full spoken sentence. */
  text: string;
  mood: TrumpMood;
  audioClip?: string;
  /** In-order original MP3 recordings, combined for longer actual voice reactions. */
  audioClips?: string[];
  /** In-game emotion label, not represented as an actual spoken quote. */
  feeling?: string;
}

/** Existing Trump recordings. No voice cloning or artificial speech is used here.
 * Multi-clip reactions play these originals sequentially at normal speed/pitch. */
const RECORDED_VOICE = {
  wrong: { file: 'wrong.mp3', words: 'WRONG!' },
  believe: { file: 'can_you_believe_this.mp3', words: 'CAN YOU BELIEVE THIS?' },
  losers: { file: 'we_have_losers.mp3', words: 'WE HAVE LOSERS!' },
  happening: { file: 'whats_going_on.mp3', words: "WHAT'S GOING ON?" },
  politicians: { file: 'incompetent_politicians.mp3', words: 'INCOMPETENT POLITICIANS!' },
  suing: { file: 'you_know_were_going_to_be_suing_them_anyway.mp3', words: "YOU KNOW WE'RE GOING TO BE SUING THEM ANYWAY!" },
  stupid: { file: 'united_states_is_run_by_stupid_people.mp3', words: 'THE UNITED STATES IS RUN BY STUPID PEOPLE!' },
  problems: { file: 'nothing_but_problem.mp3', words: 'NOTHING BUT PROBLEMS!' },
  lots: { file: 'lots_of_problems.mp3', words: 'LOTS OF PROBLEMS!' },
  bing: { file: 'bingbong.mp3', words: 'BING BING BING BONG!' },
  better: { file: 'better_than_ever_before.mp3', words: 'BETTER THAN EVER BEFORE!' },
  amazing: { file: 'so_amazing.mp3', words: 'SO AMAZING!' },
  phenomenal: { file: 'phenomenal.mp3', words: 'PHENOMENAL!' },
  enjoy: { file: 'i_actually_enjoy_that.mp3', words: 'I ACTUALLY ENJOY THAT!' },
  enjoying: { file: 'im_enjoying_it.mp3', words: "I'M ENJOYING IT!" },
  keep: { file: 'we_have_to_keep_going.mp3', words: 'WE HAVE TO KEEP GOING!' },
  maybe: { file: 'maybe_winning.mp3', words: 'MAYBE WINNING!' },
  meat: { file: 'i_think_ive_been_showing_a_lot_of_meat.mp3', words: "I THINK I'VE BEEN SHOWING A LOT OF MEAT!" },
  rich: { file: 'im_really_rich.mp3', words: "I'M REALLY RICH!" },
  fine: { file: 'thats_fine.mp3', words: "THAT'S FINE!" },
  richShort: { file: 'rich.mp3', words: 'RICH!' },
  golf: { file: 'golf.mp3', words: 'GOLF!' },
  courses: { file: 'i_have_the_best_courses_in_the_world.mp3', words: 'I HAVE THE BEST COURSES IN THE WORLD!' },
  fantastic: { file: 'were_going_to_do_a_fantastic_job.mp3', words: "WE'RE GOING TO DO A FANTASTIC JOB!" },
  dollars: { file: 'well_over_ten_billion_dollars.mp3', words: 'WELL OVER TEN BILLION DOLLARS!' },
  tremendous: { file: 'tremendous_amounts_of_dollars.mp3', words: 'TREMENDOUS AMOUNTS OF DOLLARS!' },
  deal: { file: 'its_a_five_year_deal.mp3', words: "IT'S A FIVE-YEAR DEAL!" },
  country: { file: 'i_want_to_make_our_country_great_again.mp3', words: 'I WANT TO MAKE OUR COUNTRY GREAT AGAIN!' },
  china: { file: 'china.mp3', words: 'CHINA!' },
  beatChina: { file: 'beatchina.mp3', words: 'BEAT CHINA!' },
  big: { file: 'bigleague.mp3', words: 'BIG LEAGUE!' },
  believeIt: { file: 'believe_it_or_not.mp3', words: 'BELIEVE IT OR NOT!' },
  potential: { file: 'this_country_has_so_much_potential.mp3', words: 'THIS COUNTRY HAS SO MUCH POTENTIAL!' },
  without: { file: 'without_question.mp3', words: 'WITHOUT QUESTION!' },
  whiteHouse: { file: 'the_white_house.mp3', words: 'THE WHITE HOUSE!' },
  liability: { file: 'hes_got_tremendous_liability.mp3', words: "HE'S GOT TREMENDOUS LIABILITY!" },
  corporate: { file: 'corportate_inversion_is_a_huge_problem.mp3', words: 'CORPORATE INVERSION IS A HUGE PROBLEM!' },
  bye: { file: 'bye.mp3', words: 'BYE!' },
} as const;

type RecordedKey = keyof typeof RECORDED_VOICE;
type MoodMix = { mood: TrumpMood; feeling: string; combinations: RecordedKey[][] };

/** Different action / feeling pools keep the speech context appropriate.
 * Every spoken word shown is based on the corresponding recorded phrase;
 * emotions are separate game narration. */
const MOOD_MIXES: MoodMix[] = [
  { mood: 'happy', feeling: 'delighted with himself', combinations: [
    ['enjoying', 'amazing'], ['better', 'phenomenal'], ['enjoy', 'fantastic'],
    ['believeIt', 'amazing'], ['better', 'enjoy'], ['phenomenal', 'better'],
    ['whiteHouse', 'enjoying'], ['potential', 'fantastic'], ['rich', 'amazing'],
    ['fine', 'enjoying'], ['without', 'phenomenal'], ['big', 'better'],
    ['enjoy', 'amazing', 'phenomenal'], ['believeIt', 'better', 'enjoying'],
  ] },
  { mood: 'proud', feeling: 'extremely proud', combinations: [
    ['big', 'fantastic'], ['dollars', 'tremendous'], ['rich', 'dollars'],
    ['deal', 'phenomenal'], ['without', 'fantastic'], ['whiteHouse', 'big'],
    ['potential', 'amazing'], ['better', 'big'], ['richShort', 'rich'],
    ['believeIt', 'tremendous'], ['deal', 'rich', 'phenomenal'],
  ] },
  { mood: 'rallied', feeling: 'fired up and ready for a rally', combinations: [
    ['country', 'fantastic'], ['keep', 'big'], ['potential', 'better'],
    ['fantastic', 'phenomenal'], ['big', 'country'], ['china', 'beatChina'],
    ['keep', 'country'], ['believeIt', 'fantastic'], ['big', 'amazing'],
    ['better', 'keep'], ['potential', 'keep'], ['beatChina', 'big'],
    ['fantastic', 'big', 'keep'], ['country', 'potential', 'fantastic'],
  ] },
  { mood: 'dance', feeling: 'in full dance mode', combinations: [
    ['bing', 'enjoying'], ['bing', 'phenomenal'], ['enjoy', 'bing'],
    ['better', 'bing'], ['enjoying', 'better'], ['amazing', 'bing'],
    ['keep', 'enjoying'], ['phenomenal', 'enjoy'], ['bing', 'keep'],
    ['enjoying', 'fantastic'], ['amazing', 'phenomenal'], ['maybe', 'bing'],
    ['bing', 'enjoy', 'phenomenal'], ['enjoying', 'bing', 'better'],
    ['keep', 'bing', 'amazing'], ['better', 'enjoying', 'phenomenal'],
  ] },
  { mood: 'hungry', feeling: 'hungry and demanding a snack', combinations: [
    ['meat', 'amazing'], ['meat', 'enjoy'], ['rich', 'meat'],
    ['fine', 'meat'], ['meat', 'phenomenal'], ['richShort', 'meat'],
    ['meat', 'better'], ['enjoying', 'meat'], ['believeIt', 'meat'],
    ['meat', 'fine'], ['rich', 'meat', 'enjoying'], ['meat', 'amazing', 'phenomenal'],
  ] },
  { mood: 'golf', feeling: 'obsessed with golf', combinations: [
    ['golf', 'courses'], ['courses', 'phenomenal'], ['golf', 'fantastic'],
    ['courses', 'better'], ['golf', 'amazing'], ['courses', 'enjoy'],
    ['big', 'golf'], ['golf', 'enjoying'], ['golf', 'without'],
    ['courses', 'big'], ['golf', 'courses', 'phenomenal'],
  ] },
  { mood: 'fake_news', feeling: 'arguing with the television', combinations: [
    ['wrong', 'believe'], ['losers', 'wrong'], ['happening', 'lots'],
    ['politicians', 'wrong'], ['stupid', 'problems'], ['believe', 'losers'],
    ['wrong', 'suing'], ['happening', 'politicians'], ['lots', 'wrong'],
    ['problems', 'stupid'], ['suing', 'wrong'], ['corporate', 'problems'],
    ['believe', 'politicians', 'wrong'], ['happening', 'lots', 'losers'],
    ['wrong', 'believe', 'suing'],
  ] },
  { mood: 'feisty', feeling: 'grumbling about the mess', combinations: [
    ['wrong', 'lots'], ['happening', 'wrong'], ['problems', 'politicians'],
    ['believe', 'wrong'], ['lots', 'suing'], ['losers', 'problems'],
    ['politicians', 'happening'], ['wrong', 'stupid'], ['lots', 'happening'],
    ['problems', 'wrong', 'lots'], ['happening', 'believe', 'wrong'],
  ] },
  { mood: 'sleepy', feeling: 'ready for a nap', combinations: [
    ['bye'], ['fine', 'bye'], ['enjoying', 'bye'],
    ['bye', 'fine'], ['better', 'bye'],
  ] },
  { mood: 'baby', feeling: 'an excited tiny mogul', combinations: [
    ['bing', 'amazing'], ['better', 'bing'], ['fine', 'bing'],
    ['bing', 'richShort'], ['bye'], ['rich', 'bing'],
    ['amazing', 'fine'], ['bing', 'phenomenal'], ['wrong', 'bing'],
  ] },
  { mood: 'lonely', feeling: 'lonely and looking for attention', combinations: [
    ['happening', 'believe'], ['fine', 'bye'], ['lots', 'happening'],
    ['believe', 'enjoy'], ['happening', 'fine'],
  ] },
  { mood: 'bored', feeling: 'bored and wants to play', combinations: [
    ['happening', 'keep'], ['believe', 'happening'], ['maybe', 'keep'],
    ['fine', 'amazing'], ['keep', 'phenomenal'],
  ] },
  { mood: 'sick', feeling: 'feeling under the weather', combinations: [
    ['lots', 'problems'], ['happening', 'fine'], ['wrong', 'lots'],
    ['fine', 'bye'], ['problems', 'fine'],
  ] },
];

export const TRUMP_QUOTES: TrumpQuote[] = MOOD_MIXES.flatMap(({ mood, feeling, combinations }) => {
  // One-clip reactions create rhythm and variety amid fuller multi-clip ones.
  const soloKeys = Array.from(new Set(combinations.flat())).slice(0, 8);
  const versions: RecordedKey[][] = [
    ...soloKeys.map(key => [key] as RecordedKey[]),
    ...combinations,
  ];
  return versions.map(keys => ({
    mood,
    feeling,
    text: keys.map(key => RECORDED_VOICE[key].words).join(' '),
    audioClip: RECORDED_VOICE[keys[0]].file,
    audioClips: keys.map(key => RECORDED_VOICE[key].file),
  }));
});

