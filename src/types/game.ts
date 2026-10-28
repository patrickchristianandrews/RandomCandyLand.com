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
  /** Caption for the single original recording, never stitched or invented dialogue. */
  text: string;
  mood: TrumpMood;
  audioClip?: string;
  /** Optional game-status text, not claimed to be part of the recording. */
  feeling?: string;
}

/** The complete built-in library: one unmodified recording per reaction.
 * No spliced phrases, synthetic narration, or reassembled quotes.
 * Additional authorized recordings can be imported in the personal voice library. */
const RECORDED_VOICE = {
  wrong: { file: 'wrong.mp3', words: 'WRONG!', mood: 'feisty' },
  believe: { file: 'can_you_believe_this.mp3', words: 'CAN YOU BELIEVE THIS?', mood: 'lonely' },
  losers: { file: 'we_have_losers.mp3', words: 'WE HAVE LOSERS!', mood: 'fake_news' },
  happening: { file: 'whats_going_on.mp3', words: "WHAT'S GOING ON?", mood: 'bored' },
  politicians: { file: 'incompetent_politicians.mp3', words: 'INCOMPETENT POLITICIANS!', mood: 'fake_news' },
  suing: { file: 'you_know_were_going_to_be_suing_them_anyway.mp3', words: "YOU KNOW WE'RE GOING TO BE SUING THEM ANYWAY!", mood: 'feisty' },
  stupid: { file: 'united_states_is_run_by_stupid_people.mp3', words: 'THE UNITED STATES IS RUN BY STUPID PEOPLE!', mood: 'fake_news' },
  problems: { file: 'nothing_but_problem.mp3', words: 'NOTHING BUT PROBLEMS!', mood: 'sick' },
  lots: { file: 'lots_of_problems.mp3', words: 'LOTS OF PROBLEMS!', mood: 'sick' },
  bing: { file: 'bingbong.mp3', words: 'BING BING BING BONG!', mood: 'baby' },
  better: { file: 'better_than_ever_before.mp3', words: 'BETTER THAN EVER BEFORE!', mood: 'proud' },
  amazing: { file: 'so_amazing.mp3', words: 'SO AMAZING!', mood: 'happy' },
  phenomenal: { file: 'phenomenal.mp3', words: 'PHENOMENAL!', mood: 'dance' },
  enjoy: { file: 'i_actually_enjoy_that.mp3', words: 'I ACTUALLY ENJOY THAT!', mood: 'dance' },
  enjoying: { file: 'im_enjoying_it.mp3', words: "I'M ENJOYING IT!", mood: 'dance' },
  keep: { file: 'we_have_to_keep_going.mp3', words: 'WE HAVE TO KEEP GOING!', mood: 'rallied' },
  maybe: { file: 'maybe_winning.mp3', words: 'MAYBE WINNING!', mood: 'rallied' },
  meat: { file: 'i_think_ive_been_showing_a_lot_of_meat.mp3', words: "I THINK I'VE BEEN SHOWING A LOT OF MEAT!", mood: 'hungry' },
  rich: { file: 'im_really_rich.mp3', words: "I'M REALLY RICH!", mood: 'proud' },
  fine: { file: 'thats_fine.mp3', words: "THAT'S FINE!", mood: 'sleepy' },
  richShort: { file: 'rich.mp3', words: 'RICH!', mood: 'proud' },
  golf: { file: 'golf.mp3', words: 'GOLF!', mood: 'golf' },
  courses: { file: 'i_have_the_best_courses_in_the_world.mp3', words: 'I HAVE THE BEST COURSES IN THE WORLD!', mood: 'golf' },
  fantastic: { file: 'were_going_to_do_a_fantastic_job.mp3', words: "WE'RE GOING TO DO A FANTASTIC JOB!", mood: 'happy' },
  dollars: { file: 'well_over_ten_billion_dollars.mp3', words: 'WELL OVER TEN BILLION DOLLARS!', mood: 'proud' },
  tremendous: { file: 'tremendous_amounts_of_dollars.mp3', words: 'TREMENDOUS AMOUNTS OF DOLLARS!', mood: 'proud' },
  deal: { file: 'its_a_five_year_deal.mp3', words: "IT'S A FIVE-YEAR DEAL!", mood: 'proud' },
  country: { file: 'i_want_to_make_our_country_great_again.mp3', words: 'I WANT TO MAKE OUR COUNTRY GREAT AGAIN!', mood: 'rallied' },
  china: { file: 'china.mp3', words: 'CHINA!', mood: 'fake_news' },
  beatChina: { file: 'beatchina.mp3', words: 'BEAT CHINA!', mood: 'rallied' },
  big: { file: 'bigleague.mp3', words: 'BIG LEAGUE!', mood: 'rallied' },
  believeIt: { file: 'believe_it_or_not.mp3', words: 'BELIEVE IT OR NOT!', mood: 'happy' },
  potential: { file: 'this_country_has_so_much_potential.mp3', words: 'THIS COUNTRY HAS SO MUCH POTENTIAL!', mood: 'rallied' },
  without: { file: 'without_question.mp3', words: 'WITHOUT QUESTION!', mood: 'proud' },
  whiteHouse: { file: 'the_white_house.mp3', words: 'THE WHITE HOUSE!', mood: 'proud' },
  liability: { file: 'hes_got_tremendous_liability.mp3', words: "HE'S GOT TREMENDOUS LIABILITY!", mood: 'fake_news' },
  corporate: { file: 'corportate_inversion_is_a_huge_problem.mp3', words: 'CORPORATE INVERSION IS A HUGE PROBLEM!', mood: 'fake_news' },
  bye: { file: 'bye.mp3', words: 'BYE!', mood: 'sleepy' },
} as const;

export const TRUMP_QUOTES: TrumpQuote[] = Object.values(RECORDED_VOICE).map(({ file, words, mood }) => ({
  text: words,
  mood,
  audioClip: file,
}));
