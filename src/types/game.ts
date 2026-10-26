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

export interface TrumpQuote {
  text: string;
  mood: 'happy' | 'rallied' | 'feisty' | 'golf' | 'sleepy' | 'hungry' | 'baby' | 'dance' | 'fake_news';
  audioClip?: string;
}

export const TRUMP_QUOTES: TrumpQuote[] = [
  // --- TV NEWS & FAKE NEWS YELLING (Authentic Real Trump Voice Clips!) ---
  { text: "WRONG! The failing media is at it again! Total fabrication, believe me!", mood: 'fake_news', audioClip: 'wrong.mp3' },
  { text: "CAN YOU BELIEVE THIS?! Dishonest television anchors, nobody is watching them!", mood: 'fake_news', audioClip: 'can_you_believe_this.mp3' },
  { text: "WE HAVE LOSERS! Lowest ratings in television history on channel 4!", mood: 'fake_news', audioClip: 'we_have_losers.mp3' },
  { text: "WHAT'S GOING ON?! Fake news anchors making up ridiculous stories!", mood: 'fake_news', audioClip: 'whats_going_on.mp3' },
  { text: "INCOMPETENT POLITICIANS! They have ruined cable television news!", mood: 'fake_news', audioClip: 'incompetent_politicians.mp3' },
  { text: "YOU KNOW WE'RE GOING TO BE SUING THEM ANYWAY! A complete hit job!", mood: 'fake_news', audioClip: 'you_know_were_going_to_be_suing_them_anyway.mp3' },
  { text: "UNITED STATES IS RUN BY STUPID PEOPLE! But Donald is fixing it all!", mood: 'fake_news', audioClip: 'united_states_is_run_by_stupid_people.mp3' },
  { text: "NOTHING BUT PROBLEMS! They don't want to report my magnificent rally crowds!", mood: 'fake_news', audioClip: 'nothing_but_problem.mp3' },
  { text: "LOTS OF PROBLEMS! The corrupt media is going down the drain, so sad!", mood: 'fake_news', audioClip: 'lots_of_problems.mp3' },

  // --- CLEANING PAPERS & FEISTY (Authentic Real Trump Voice Clips!) ---
  { text: "INCOMPETENT POLITICIANS! Who left these classified papers on the floor?! Clean it up!", mood: 'feisty', audioClip: 'incompetent_politicians.mp3' },
  { text: "YOU KNOW WE'RE GOING TO BE SUING THEM ANYWAY! A complete hit job!", mood: 'feisty', audioClip: 'you_know_were_going_to_be_suing_them_anyway.mp3' },
  { text: "WRONG! Clean desk, clean floors, pure five-star executive order!", mood: 'feisty', audioClip: 'wrong.mp3' },

  // --- TRUMP DANCING & YMCA FIST PUMP (Authentic Real Trump Voice Clips!) ---
  { text: "BING BING BING BONG! Look at that rhythm! Nobody dances like Donald!", mood: 'dance', audioClip: 'bingbong.mp3' },
  { text: "BETTER THAN EVER BEFORE! The double fist pump is sweeping the nation!", mood: 'dance', audioClip: 'better_than_ever_before.mp3' },
  { text: "SO AMAZING! 60,000 people dancing in unison, unbelievable energy!", mood: 'dance', audioClip: 'so_amazing.mp3' },
  { text: "PHENOMENAL! Watch the footwork, tremendous balance, pure stamina!", mood: 'dance', audioClip: 'phenomenal.mp3' },
  { text: "I ACTUALLY ENJOY THAT! Feel the groove, pump the fists left and right!", mood: 'dance', audioClip: 'i_actually_enjoy_that.mp3' },
  { text: "I'M ENJOYING IT! Look at the golden comb-over bouncing to the beat!", mood: 'dance', audioClip: 'im_enjoying_it.mp3' },
  { text: "WE HAVE TO KEEP GOING! Music up, hands up, dancing all the way to victory!", mood: 'dance', audioClip: 'we_have_to_keep_going.mp3' },
  { text: "MAYBE WINNING! The fake news could never dance like this, believe me!", mood: 'dance', audioClip: 'maybe_winning.mp3' },

  // --- FOOD & WINNING APPETITE ---
  { text: "I THINK I'VE BEEN SHOWING A LOT OF MEAT! Golden double cheeseburger time!", mood: 'hungry', audioClip: 'i_think_ive_been_showing_a_lot_of_meat.mp3' },
  { text: "I'M REALLY RICH! Only top prime steak and extra crispy crinkle fries!", mood: 'hungry', audioClip: 'im_really_rich.mp3' },
  { text: "THAT'S FINE! Two big scoops of vanilla ice cream for Donald!", mood: 'hungry', audioClip: 'thats_fine.mp3' },
  { text: "RICH! Pizza eaten with a gold fork and knife, pure class!", mood: 'hungry', audioClip: 'rich.mp3' },

  // --- GOLF & SPORTS EXCELLENCE ---
  { text: "I HAVE THE BEST COURSES IN THE WORLD! Perfect hole-in-one on the 18th!", mood: 'golf', audioClip: 'i_have_the_best_courses_in_the_world.mp3' },
  { text: "GOLF! 340-yard drive straight down the middle, pure muscle!", mood: 'golf', audioClip: 'golf.mp3' },

  // --- RALLIES, ARENA HYPE, EXECUTIVE ACTION & SHARPIE ---
  { text: "WE'RE GOING TO DO A FANTASTIC JOB! Greatest movement in American history!", mood: 'rallied', audioClip: 'were_going_to_do_a_fantastic_job.mp3' },
  { text: "WELL OVER TEN BILLION DOLLARS! The net worth is through the roof!", mood: 'happy', audioClip: 'well_over_ten_billion_dollars.mp3' },
  { text: "TREMENDOUS AMOUNTS OF DOLLARS! The Art of the Deal in action!", mood: 'happy', audioClip: 'tremendous_amounts_of_dollars.mp3' },
  { text: "IT'S A FIVE-YEAR DEAL! Signed with the thick black Sharpie!", mood: 'happy', audioClip: 'its_a_five_year_deal.mp3' },
  { text: "I WANT TO MAKE OUR COUNTRY GREAT AGAIN! An ocean of red hats!", mood: 'rallied', audioClip: 'i_want_to_make_our_country_great_again.mp3' },
  { text: "CHINA! We are beating them on trade, big league!", mood: 'rallied', audioClip: 'china.mp3' },
  { text: "BEAT CHINA! Historic economic victory for the American worker!", mood: 'rallied', audioClip: 'beatchina.mp3' },
  { text: "BIG LEAGUE! Our poll numbers are 99% in virtual pet land!", mood: 'rallied', audioClip: 'bigleague.mp3' },
  { text: "BELIEVE IT OR NOT! Many people are calling, saying 'Sir, you are the best!'", mood: 'happy', audioClip: 'believe_it_or_not.mp3' },
  { text: "THIS COUNTRY HAS SO MUCH POTENTIAL! We are unleashing it all!", mood: 'happy', audioClip: 'this_country_has_so_much_potential.mp3' },
  { text: "WITHOUT QUESTION! The golden hair comb-over is 100% real and majestic!", mood: 'happy', audioClip: 'without_question.mp3' },
  { text: "THE WHITE HOUSE! Beautiful Oval Office, greatest desk in the world!", mood: 'happy', audioClip: 'the_white_house.mp3' },
  { text: "HE'S GOT TREMENDOUS LIABILITY! But Donald is totally undefeated!", mood: 'happy', audioClip: 'hes_got_tremendous_liability.mp3' },
  { text: "CORPORTATE INVERSION IS A HUGE PROBLEM! Donald alone can fix it!", mood: 'happy', audioClip: 'corportate_inversion_is_a_huge_problem.mp3' },

  // --- SLEEP & NAP TIME ---
  { text: "BYE! Four hours of power sleep in the Lincoln bedroom! Zzz...", mood: 'sleepy', audioClip: 'bye.mp3' },

  // --- BABY DONALD COOS & TODDLER MOGUL (Authentic Trump voice with toddler pitch!) ---
  { text: "BA-BA! BING BING BING BONG! Baby Donald builds a golden nursery skyscraper!", mood: 'baby', audioClip: 'bingbong.mp3' },
  { text: "BETTER THAN EVER BEFORE! Even in the crib, the golden hair is majestic!", mood: 'baby', audioClip: 'better_than_ever_before.mp3' },
  { text: "SO AMAZING! Baby Donald takes the best nap and burp, totally undefeated!", mood: 'baby', audioClip: 'so_amazing.mp3' },
  { text: "WRONG! Fake news baby stories, Donald wants a gold rattle!", mood: 'baby', audioClip: 'wrong.mp3' },
  { text: "CAN YOU BELIEVE THIS?! First small loan was a million baby blocks!", mood: 'baby', audioClip: 'can_you_believe_this.mp3' },
  { text: "I'M REALLY RICH! Cleanest warm milk in Manhattan! Ba-ba!", mood: 'baby', audioClip: 'im_really_rich.mp3' },
  { text: "TREMENDOUS AMOUNTS OF DOLLARS! Toddler mogul closes first million-dollar contract!", mood: 'baby', audioClip: 'tremendous_amounts_of_dollars.mp3' },
  { text: "BYE BYE! Nap time in the golden crib! Zzz...", mood: 'baby', audioClip: 'bye.mp3' },
];
