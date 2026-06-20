// scripts/seedQuestions.js
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// ✅ Import your questions
//const { sampleQuestions } = require('../src/data/sampleQuestions');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ─────────────────────────────────────────────────────
// 📦 ALL 100 QUESTIONS EMBEDDED HERE (no import needed)
// ─────────────────────────────────────────────────────
const questions = [
  // QA
  { text: "Simple interest on Rs. 800 for 3 years at a certain rate is Rs. 144. What is the rate per annum?", options: ["4%", "5%", "6%", "7%"], correct: 2, section: "QA", year: 2022, difficulty: "easy", explanation: "Rate = (SI × 100) / (P × T) = (144 × 100) / (800 × 3) = 6%", tags: ["simple interest"] },
  { text: "A shopkeeper sells an article at a profit of 20%. Cost price is Rs. 500. Find the selling price.", options: ["Rs. 550", "Rs. 580", "Rs. 600", "Rs. 620"], correct: 2, section: "QA", year: 2021, difficulty: "easy", explanation: "SP = CP × 1.20 = 500 × 1.20 = Rs. 600", tags: ["profit and loss"] },
  { text: "The average of 5 numbers is 27. If one number is excluded, average becomes 25. Find the excluded number.", options: ["30", "35", "37", "40"], correct: 1, section: "QA", year: 2023, difficulty: "easy", explanation: "Sum = 135; remaining = 100; excluded = 35", tags: ["average"] },
  { text: "A train 200m long passes a pole in 20 seconds. Find its speed in km/hr.", options: ["30", "36", "40", "45"], correct: 1, section: "QA", year: 2022, difficulty: "easy", explanation: "Speed = 200/20 = 10 m/s = 36 km/hr", tags: ["speed distance time"] },
  { text: "If 12 men complete a work in 15 days, in how many days can 20 men finish it?", options: ["7", "8", "9", "10"], correct: 2, section: "QA", year: 2020, difficulty: "easy", explanation: "Work = 180 man-days; 180/20 = 9 days", tags: ["time and work"] },
  { text: "What is 15% of 240?", options: ["30", "32", "36", "38"], correct: 2, section: "QA", year: null, difficulty: "easy", explanation: "15/100 × 240 = 36", tags: ["percentage"] },
  { text: "The ratio of two numbers is 3:5 and their sum is 96. Find the larger number.", options: ["36", "48", "60", "72"], correct: 2, section: "QA", year: 2021, difficulty: "easy", explanation: "Larger = (5/8) × 96 = 60", tags: ["ratio"] },
  { text: "A number when increased by 20% gives 72. Find the original number.", options: ["56", "58", "60", "62"], correct: 2, section: "QA", year: 2022, difficulty: "easy", explanation: "x × 1.20 = 72 → x = 60", tags: ["percentage"] },
  { text: "The HCF of 12, 18, and 24 is:", options: ["3", "4", "6", "8"], correct: 2, section: "QA", year: null, difficulty: "easy", explanation: "Common factors: HCF = 6", tags: ["HCF LCM"] },
  { text: "Find the area of a rectangle with length 15m and breadth 8m.", options: ["100 m²", "110 m²", "120 m²", "130 m²"], correct: 2, section: "QA", year: null, difficulty: "easy", explanation: "Area = 15 × 8 = 120 m²", tags: ["mensuration"] },
  { text: "If A:B = 2:3 and B:C = 4:5, then A:C = ?", options: ["8:15", "6:10", "2:5", "4:9"], correct: 0, section: "QA", year: 2023, difficulty: "medium", explanation: "A:B:C = 8:12:15 → A:C = 8:15", tags: ["ratio"] },
  { text: "A sum doubles itself in 10 years at simple interest. What is the rate per annum?", options: ["5%", "8%", "10%", "12%"], correct: 2, section: "QA", year: 2020, difficulty: "medium", explanation: "SI = P → R = 100/T = 10%", tags: ["simple interest"] },
  { text: "The LCM of 8, 12, and 16 is:", options: ["24", "36", "48", "96"], correct: 2, section: "QA", year: null, difficulty: "easy", explanation: "LCM = 2⁴ × 3 = 48", tags: ["HCF LCM"] },
  { text: "A person walks at 5 km/hr for 2 hours then 4 km/hr for 1 hour. Find average speed.", options: ["4.3 km/hr", "4.5 km/hr", "4.67 km/hr", "5 km/hr"], correct: 2, section: "QA", year: 2021, difficulty: "medium", explanation: "Total = 14 km in 3 hrs = 4.67 km/hr", tags: ["average", "speed"] },
  { text: "If x + y = 10 and xy = 21, find x² + y².", options: ["58", "60", "62", "64"], correct: 0, section: "QA", year: 2022, difficulty: "medium", explanation: "x²+y² = (x+y)² - 2xy = 100 - 42 = 58", tags: ["algebra"] },
  { text: "The perimeter of a square is 56 cm. Find its area.", options: ["144 cm²", "169 cm²", "196 cm²", "225 cm²"], correct: 2, section: "QA", year: null, difficulty: "easy", explanation: "Side = 14 cm; Area = 196 cm²", tags: ["mensuration"] },
  { text: "Selling price is Rs. 480 and loss is 20%. Find the cost price.", options: ["Rs. 560", "Rs. 580", "Rs. 600", "Rs. 620"], correct: 2, section: "QA", year: 2023, difficulty: "medium", explanation: "CP = 480 / 0.80 = Rs. 600", tags: ["profit and loss"] },
  { text: "√0.0064 = ?", options: ["0.08", "0.8", "0.008", "8"], correct: 0, section: "QA", year: null, difficulty: "easy", explanation: "√(64/10000) = 8/100 = 0.08", tags: ["square root"] },
  { text: "Find the value of (2³ × 3²) / 6².", options: ["1", "2", "3", "4"], correct: 1, section: "QA", year: null, difficulty: "easy", explanation: "(8 × 9) / 36 = 72/36 = 2", tags: ["number system"] },
  { text: "Pipe A fills in 4 hrs, Pipe B in 6 hrs. How long together?", options: ["2 hours", "2.4 hours", "2.8 hours", "3 hours"], correct: 1, section: "QA", year: 2020, difficulty: "medium", explanation: "1/4 + 1/6 = 5/12 → 12/5 = 2.4 hrs", tags: ["pipes and cisterns"] },
  { text: "Diagonal of a square is 10√2 cm. Find its area.", options: ["50 cm²", "100 cm²", "150 cm²", "200 cm²"], correct: 1, section: "QA", year: 2021, difficulty: "medium", explanation: "Side = 10 cm; Area = 100 cm²", tags: ["mensuration"] },
  { text: "A number is 25% more than another. Their ratio is:", options: ["4:3", "4:5", "5:4", "3:4"], correct: 2, section: "QA", year: 2022, difficulty: "easy", explanation: "If smaller = 4, larger = 5. Ratio = 5:4", tags: ["percentage", "ratio"] },
  { text: "Compound interest on Rs. 1000 at 10% per annum for 2 years:", options: ["Rs. 200", "Rs. 210", "Rs. 220", "Rs. 230"], correct: 1, section: "QA", year: 2023, difficulty: "medium", explanation: "1000 × 1.1² - 1000 = Rs. 210", tags: ["compound interest"] },
  { text: "If 3x − 7 = 11, then x = ?", options: ["4", "5", "6", "7"], correct: 2, section: "QA", year: null, difficulty: "easy", explanation: "3x = 18 → x = 6", tags: ["algebra"] },
  { text: "The volume of a cube with side 5 cm is:", options: ["25 cm³", "75 cm³", "100 cm³", "125 cm³"], correct: 3, section: "QA", year: null, difficulty: "easy", explanation: "5³ = 125 cm³", tags: ["mensuration"] },

  // GIR
  { text: "ACEG : BDFH :: IKMO : ?", options: ["JLNP", "JLMP", "KLNP", "JKNP"], correct: 0, section: "GIR", year: 2022, difficulty: "medium", explanation: "Alternate letters shifted +1", tags: ["alphabet series"] },
  { text: "Find the odd one out: 2, 3, 5, 7, 9, 11", options: ["3", "5", "7", "9"], correct: 3, section: "GIR", year: 2021, difficulty: "easy", explanation: "9 = 3×3 is not prime", tags: ["odd one out"] },
  { text: "If BOOK = 43 (sum of letter positions), then COOK = ?", options: ["44", "45", "46", "47"], correct: 0, section: "GIR", year: 2020, difficulty: "easy", explanation: "C(3)+O(15)+O(15)+K(11) = 44", tags: ["coding decoding"] },
  { text: "Find the missing number: 2, 6, 12, 20, 30, ?", options: ["38", "40", "42", "44"], correct: 2, section: "GIR", year: 2022, difficulty: "medium", explanation: "Differences: 4,6,8,10,12 → 30+12=42", tags: ["number series"] },
  { text: "A is B's brother. C is A's mother. D is C's father. E is D's wife. How is B related to E?", options: ["Grandchild", "Child", "Great-grandchild", "Nephew/Niece"], correct: 0, section: "GIR", year: 2021, difficulty: "medium", explanation: "E → D's wife → C's mother → A & B's grandmother", tags: ["blood relations"] },
  { text: "If South-East becomes North, then North-East becomes?", options: ["West", "South", "North-West", "East"], correct: 0, section: "GIR", year: 2023, difficulty: "medium", explanation: "135° anticlockwise rotation: SE→N, NE→W", tags: ["direction sense"] },
  { text: "In a row of 40 students, Rahul is 15th from the left. Position from the right?", options: ["24th", "25th", "26th", "27th"], correct: 2, section: "GIR", year: null, difficulty: "easy", explanation: "40 - 15 + 1 = 26", tags: ["ranking"] },
  { text: "All roses are flowers. Some flowers are red. Conclusion: Some roses are red.", options: ["Definitely True", "Definitely False", "Cannot be determined", "Partially true"], correct: 2, section: "GIR", year: 2022, difficulty: "medium", explanation: "Red flowers may or may not include roses", tags: ["syllogism"] },
  { text: "FLOUR : FLOWER :: PLUM : ?", options: ["PLUME", "PLUMB", "PLAIN", "PLUS"], correct: 0, section: "GIR", year: 2020, difficulty: "easy", explanation: "FLOUR + E = FLOWER; PLUM + E = PLUME", tags: ["analogy"] },
  { text: "Find the odd one out: Triangle, Square, Circle, Cube, Rectangle", options: ["Circle", "Cube", "Triangle", "Rectangle"], correct: 1, section: "GIR", year: null, difficulty: "easy", explanation: "Cube is the only 3D shape", tags: ["odd one out"] },
  { text: "What comes next: 1, 4, 9, 16, 25, ?", options: ["30", "34", "36", "40"], correct: 2, section: "GIR", year: null, difficulty: "easy", explanation: "Perfect squares: 6² = 36", tags: ["number series"] },
  { text: "Pointing to a girl, Ram said 'She is the only daughter of my grandfather's only son.' How is she related to Ram?", options: ["Sister", "Cousin", "Niece", "Daughter"], correct: 0, section: "GIR", year: 2021, difficulty: "medium", explanation: "Grandfather's son = father; father's daughter = sister", tags: ["blood relations"] },
  { text: "Angle between clock hands at 3:15?", options: ["0°", "7.5°", "15°", "22.5°"], correct: 1, section: "GIR", year: 2023, difficulty: "hard", explanation: "Hour hand moves 7.5° in 15 mins past 3; minute hand at 90°; diff = 7.5°", tags: ["clocks"] },
  { text: "PAPER : WRITE :: BOARD : ?", options: ["CHALK", "BLACK", "CLASS", "DRAW"], correct: 0, section: "GIR", year: 2020, difficulty: "easy", explanation: "You write on paper with pen; on board with chalk", tags: ["analogy"] },
  { text: "In a series: Z, X, V, T, R, ?", options: ["O", "P", "Q", "N"], correct: 1, section: "GIR", year: 2022, difficulty: "easy", explanation: "Each letter -2: Z(26), X(24), V(22), T(20), R(18), P(16)", tags: ["alphabet series"] },
  { text: "Find the odd one out: 144, 169, 196, 225, 250", options: ["169", "196", "225", "250"], correct: 3, section: "GIR", year: 2021, difficulty: "easy", explanation: "12²,13²,14²,15² are perfect squares but 250 ≠ 16²(256)", tags: ["odd one out"] },
  { text: "Two dice thrown. Probability of sum = 7?", options: ["1/6", "5/36", "7/36", "1/4"], correct: 0, section: "GIR", year: 2023, difficulty: "medium", explanation: "6 favourable outcomes out of 36 = 1/6", tags: ["probability"] },
  { text: "A > B, C > A, D > C. Who is shortest?", options: ["A", "B", "C", "D"], correct: 1, section: "GIR", year: null, difficulty: "easy", explanation: "D>C>A>B so B is shortest", tags: ["ranking"] },
  { text: "If FACE = 15 (sum of positions), what is BACK?", options: ["14", "15", "16", "17"], correct: 3, section: "GIR", year: 2020, difficulty: "easy", explanation: "B(2)+A(1)+C(3)+K(11) = 17", tags: ["coding decoding"] },
  { text: "Find next: 3, 7, 13, 21, 31, ?", options: ["41", "43", "45", "47"], correct: 1, section: "GIR", year: 2022, difficulty: "medium", explanation: "Differences 4,6,8,10,12 → 31+12=43", tags: ["number series"] },
  { text: "Find the wrong term: 2, 5, 10, 17, 26, 37, 50, 64", options: ["37", "50", "64", "26"], correct: 2, section: "GIR", year: 2023, difficulty: "hard", explanation: "Pattern +3,+5,+7... → after 50 should be 65 not 64", tags: ["number series"] },
  { text: "If CALM → DBNM (each +1), then FADE → ?", options: ["GBEF", "GBFE", "GCEF", "GBBF"], correct: 0, section: "GIR", year: 2021, difficulty: "medium", explanation: "F→G, A→B, D→E, E→F = GBEF", tags: ["coding decoding"] },
  { text: "P is Q's husband. R is P's sister. S is R's mother. T is S's husband. T is related to Q as?", options: ["Father-in-law", "Uncle", "Father", "Brother-in-law"], correct: 0, section: "GIR", year: 2022, difficulty: "hard", explanation: "T → S's husband → P's father → Q's father-in-law", tags: ["blood relations"] },
  { text: "Find the missing: 6, 11, 21, 36, 56, ?", options: ["76", "81", "86", "91"], correct: 1, section: "GIR", year: 2020, difficulty: "medium", explanation: "Differences 5,10,15,20,25 → 56+25=81", tags: ["number series"] },
  { text: "A is 40m south of B. C is 30m east of A. Distance between B and C?", options: ["40m", "50m", "60m", "70m"], correct: 1, section: "GIR", year: 2021, difficulty: "medium", explanation: "Pythagoras: √(40²+30²) = 50m", tags: ["direction sense"] },

  // GA
  { text: "Who is known as the 'Father of the Nation' in India?", options: ["Jawaharlal Nehru", "Mahatma Gandhi", "Subhas Chandra Bose", "B.R. Ambedkar"], correct: 1, section: "GA", year: null, difficulty: "easy", explanation: "Mahatma Gandhi led India's independence movement.", tags: ["history"] },
  { text: "The Indian Parliament consists of how many houses?", options: ["1", "2", "3", "4"], correct: 1, section: "GA", year: null, difficulty: "easy", explanation: "Lok Sabha and Rajya Sabha", tags: ["polity"] },
  { text: "Which river is known as the 'Ganga of South India'?", options: ["Krishna", "Kaveri", "Godavari", "Mahanadi"], correct: 2, section: "GA", year: 2021, difficulty: "easy", explanation: "Godavari is revered like Ganga in South India.", tags: ["geography"] },
  { text: "The chemical formula of water is:", options: ["HO", "H₂O₂", "H₂O", "HO₂"], correct: 2, section: "GA", year: null, difficulty: "easy", explanation: "2 hydrogen + 1 oxygen = H₂O", tags: ["chemistry"] },
  { text: "Which planet is closest to the Sun?", options: ["Venus", "Mars", "Mercury", "Earth"], correct: 2, section: "GA", year: null, difficulty: "easy", explanation: "Mercury is closest to the Sun.", tags: ["space"] },
  { text: "The Constitution of India came into effect on:", options: ["15 Aug 1947", "26 Jan 1950", "26 Nov 1949", "2 Oct 1952"], correct: 1, section: "GA", year: 2022, difficulty: "easy", explanation: "Republic Day — 26 January 1950", tags: ["polity", "history"] },
  { text: "Who wrote the Indian National Anthem 'Jana Gana Mana'?", options: ["Rabindranath Tagore", "Bankim Chandra Chatterjee", "Sarojini Naidu", "Subramanya Bharati"], correct: 0, section: "GA", year: null, difficulty: "easy", explanation: "Written by Rabindranath Tagore.", tags: ["history"] },
  { text: "Headquarters of the United Nations is in:", options: ["London", "Paris", "Geneva", "New York"], correct: 3, section: "GA", year: null, difficulty: "easy", explanation: "UN HQ is in New York City, USA.", tags: ["world affairs"] },
  { text: "The Battle of Plassey (1757) was fought between the British and:", options: ["Marathas", "Siraj ud-Daulah", "Hyder Ali", "Tipu Sultan"], correct: 1, section: "GA", year: 2020, difficulty: "medium", explanation: "British vs Siraj ud-Daulah, Nawab of Bengal", tags: ["history"] },
  { text: "Which gas is most abundant in Earth's atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], correct: 2, section: "GA", year: null, difficulty: "easy", explanation: "Nitrogen = ~78% of atmosphere", tags: ["science"] },
  { text: "Rajya Sabha maximum members:", options: ["245", "250", "252", "260"], correct: 1, section: "GA", year: 2023, difficulty: "medium", explanation: "Max 250: 238 elected + 12 nominated", tags: ["polity"] },
  { text: "India's first satellite was:", options: ["INSAT-1A", "Aryabhata", "GSAT-1", "Rohini"], correct: 1, section: "GA", year: 2021, difficulty: "medium", explanation: "Aryabhata, launched 19 April 1975", tags: ["space", "India"] },
  { text: "Which Indian state has the longest coastline?", options: ["Maharashtra", "Tamil Nadu", "Andhra Pradesh", "Gujarat"], correct: 3, section: "GA", year: 2022, difficulty: "medium", explanation: "Gujarat ~1600 km coastline", tags: ["geography"] },
  { text: "Unit of electric current:", options: ["Volt", "Watt", "Ampere", "Ohm"], correct: 2, section: "GA", year: null, difficulty: "easy", explanation: "Current measured in Amperes (A)", tags: ["physics"] },
  { text: "Who was the first Prime Minister of India?", options: ["Sardar Patel", "Jawaharlal Nehru", "Rajendra Prasad", "C. Rajagopalachari"], correct: 1, section: "GA", year: null, difficulty: "easy", explanation: "Jawaharlal Nehru, 1947–1964", tags: ["history"] },
  { text: "The Strait of Hormuz connects the Persian Gulf and:", options: ["Red Sea", "Arabian Sea", "Gulf of Oman", "Bay of Bengal"], correct: 2, section: "GA", year: 2021, difficulty: "medium", explanation: "Persian Gulf → Gulf of Oman", tags: ["geography"] },
  { text: "Photosynthesis takes place in:", options: ["Mitochondria", "Nucleus", "Chloroplasts", "Ribosomes"], correct: 2, section: "GA", year: null, difficulty: "easy", explanation: "Chloroplasts contain chlorophyll for photosynthesis", tags: ["biology"] },
  { text: "Which city is known as the 'Pink City' of India?", options: ["Jaipur", "Jodhpur", "Udaipur", "Bikaner"], correct: 0, section: "GA", year: null, difficulty: "easy", explanation: "Jaipur is called the Pink City.", tags: ["geography"] },
  { text: "Which Article of the Indian Constitution abolishes untouchability?", options: ["Article 14", "Article 17", "Article 19", "Article 21"], correct: 1, section: "GA", year: 2023, difficulty: "medium", explanation: "Article 17 abolishes untouchability.", tags: ["polity"] },
  { text: "Speed of light in vacuum is approximately:", options: ["3 × 10⁶ m/s", "3 × 10⁸ m/s", "3 × 10¹⁰ m/s", "3 × 10⁴ m/s"], correct: 1, section: "GA", year: null, difficulty: "easy", explanation: "~3 × 10⁸ m/s", tags: ["physics"] },
  { text: "Who discovered Penicillin?", options: ["Louis Pasteur", "Alexander Fleming", "Edward Jenner", "Robert Koch"], correct: 1, section: "GA", year: 2020, difficulty: "easy", explanation: "Alexander Fleming, 1928", tags: ["science", "history"] },
  { text: "'Operation Flood' in India was related to:", options: ["Flood Control", "Milk Production", "Food Distribution", "Water Conservation"], correct: 1, section: "GA", year: 2022, difficulty: "medium", explanation: "World's largest dairy development programme", tags: ["economy"] },
  { text: "Which instrument measures atmospheric pressure?", options: ["Thermometer", "Hygrometer", "Barometer", "Anemometer"], correct: 2, section: "GA", year: null, difficulty: "easy", explanation: "Barometer measures atmospheric pressure", tags: ["instruments"] },
  { text: "Nobel Prize in Economics first awarded in:", options: ["1901", "1945", "1969", "1971"], correct: 2, section: "GA", year: 2021, difficulty: "medium", explanation: "First awarded in 1969", tags: ["world affairs"] },
  { text: "Which Amendment lowered voting age from 21 to 18?", options: ["42nd", "52nd", "61st", "73rd"], correct: 2, section: "GA", year: 2023, difficulty: "hard", explanation: "61st Constitutional Amendment (1988)", tags: ["polity"] },

  // EN
  { text: "Meaning of the idiom 'Break the ice':", options: ["Start a conversation", "Destroy something", "Freeze water", "End a relationship"], correct: 0, section: "EN", year: 2022, difficulty: "easy", explanation: "Initiate conversation and ease tension", tags: ["idioms"] },
  { text: "Synonym of 'Benevolent':", options: ["Cruel", "Kind", "Strict", "Indifferent"], correct: 1, section: "EN", year: null, difficulty: "easy", explanation: "Benevolent = well-meaning and kind", tags: ["synonyms"] },
  { text: "Antonym of 'Loquacious':", options: ["Talkative", "Noisy", "Silent", "Cheerful"], correct: 2, section: "EN", year: 2021, difficulty: "medium", explanation: "Loquacious = very talkative; antonym = Silent", tags: ["antonyms"] },
  { text: "Fill in the blank: She _____ to the market every day.", options: ["go", "going", "goes", "gone"], correct: 2, section: "EN", year: null, difficulty: "easy", explanation: "Third person singular present = goes", tags: ["grammar"] },
  { text: "Identify the error: 'He do not like to play cricket.'", options: ["He", "do not", "like to", "play cricket"], correct: 1, section: "EN", year: 2022, difficulty: "easy", explanation: "Should be 'does not' for third person singular", tags: ["error spotting"] },
  { text: "One word for 'A person who cannot be corrected':", options: ["Introvert", "Incorrigible", "Insolvent", "Infallible"], correct: 1, section: "EN", year: 2020, difficulty: "medium", explanation: "Incorrigible = unable to be reformed", tags: ["one word substitution"] },
  { text: "Choose the correctly spelled word:", options: ["Accomodate", "Accommodate", "Accomadate", "Acomodate"], correct: 1, section: "EN", year: null, difficulty: "easy", explanation: "Double 'c' and double 'm': Accommodate", tags: ["spelling"] },
  { text: "Passive voice of 'She wrote a letter':", options: ["A letter is written by her", "A letter was written by her", "A letter has been written by her", "A letter will be written by her"], correct: 1, section: "EN", year: 2022, difficulty: "medium", explanation: "Simple past → A letter was written by her", tags: ["active passive"] },
  { text: "Synonym of 'Obstinate':", options: ["Flexible", "Stubborn", "Gentle", "Humble"], correct: 1, section: "EN", year: 2021, difficulty: "easy", explanation: "Obstinate = stubbornly refusing to change", tags: ["synonyms"] },
  { text: "Fill in the blank: He is _____ honest man.", options: ["a", "an", "the", "no article"], correct: 1, section: "EN", year: null, difficulty: "easy", explanation: "'Honest' starts with vowel sound /ɒ/ → use 'an'", tags: ["articles"] },
  { text: "Antonym of 'Magnanimous':", options: ["Generous", "Selfish", "Brave", "Kind"], correct: 1, section: "EN", year: 2022, difficulty: "medium", explanation: "Magnanimous = generous; antonym = Selfish", tags: ["antonyms"] },
  { text: "Figure of speech in: 'The wind whispered through the trees.'", options: ["Simile", "Metaphor", "Personification", "Hyperbole"], correct: 2, section: "EN", year: 2023, difficulty: "medium", explanation: "Giving human quality to wind = Personification", tags: ["figures of speech"] },
  { text: "Choose the correct sentence:", options: ["He has went to school", "He has gone to school", "He have gone to school", "He had went to school"], correct: 1, section: "EN", year: null, difficulty: "easy", explanation: "has + past participle (gone, not went)", tags: ["grammar"] },
  { text: "Meaning of 'At the drop of a hat':", options: ["Very slowly", "Immediately without hesitation", "Carelessly", "With great effort"], correct: 1, section: "EN", year: 2020, difficulty: "medium", explanation: "Do something immediately, without hesitation", tags: ["idioms"] },
  { text: "Antonym of 'Verbose':", options: ["Wordy", "Concise", "Lengthy", "Elaborate"], correct: 1, section: "EN", year: 2021, difficulty: "medium", explanation: "Verbose = using too many words; antonym = Concise", tags: ["antonyms"] },
  { text: "One word for 'Fear of heights':", options: ["Claustrophobia", "Acrophobia", "Agoraphobia", "Hydrophobia"], correct: 1, section: "EN", year: 2022, difficulty: "medium", explanation: "Acrophobia = extreme fear of heights", tags: ["one word substitution"] },
  { text: "Fill in: Neither he nor I _____ responsible.", options: ["are", "am", "is", "were"], correct: 1, section: "EN", year: 2023, difficulty: "hard", explanation: "Verb agrees with subject closest to it (I → am)", tags: ["grammar"] },
  { text: "Synonym of 'Ephemeral':", options: ["Eternal", "Transient", "Permanent", "Enduring"], correct: 1, section: "EN", year: 2021, difficulty: "hard", explanation: "Ephemeral = short-lived; synonym = Transient", tags: ["synonyms"] },
  { text: "Identify the error: 'The news are shocking.'", options: ["The", "news", "are", "shocking"], correct: 2, section: "EN", year: 2022, difficulty: "easy", explanation: "'News' is singular uncountable; use 'is'", tags: ["error spotting"] },
  { text: "Indirect speech: He said, 'I am happy.'", options: ["He said that he was happy", "He said that I was happy", "He said that he is happy", "He told that he was happy"], correct: 0, section: "EN", year: 2020, difficulty: "medium", explanation: "'am' → 'was', 'I' → 'he'", tags: ["direct indirect speech"] },
  { text: "Meaning of 'Exonerate':", options: ["To blame", "To free from blame", "To punish", "To ignore"], correct: 1, section: "EN", year: 2023, difficulty: "medium", explanation: "Exonerate = officially clear someone from blame", tags: ["vocabulary"] },
  { text: "Plural of 'Criterion':", options: ["Criterions", "Criteria", "Criterias", "Criteries"], correct: 1, section: "EN", year: null, difficulty: "medium", explanation: "Greek origin: criterion → criteria", tags: ["grammar"] },
  { text: "Correct preposition: She is good _____ mathematics.", options: ["in", "at", "on", "with"], correct: 1, section: "EN", year: null, difficulty: "easy", explanation: "'Good at' is the correct phrase for skills", tags: ["prepositions"] },
  { text: "Synonym of 'Garrulous':", options: ["Silent", "Talkative", "Shy", "Aggressive"], correct: 1, section: "EN", year: 2021, difficulty: "medium", explanation: "Garrulous = excessively talkative", tags: ["synonyms"] },
  { text: "Meaning of the idiom 'Bite the bullet':", options: ["Eat quickly", "Endure a painful situation bravely", "Make a hasty decision", "Avoid responsibility"], correct: 1, section: "EN", year: 2022, difficulty: "medium", explanation: "Endure pain or difficulty with courage", tags: ["idioms"] },
];

async function seedQuestions() {
  console.log(`\n🚀 Starting seed: ${questions.length} questions...\n`);

  const existingSnap = await db.collection('quiz_questions').limit(1).get();
  if (!existingSnap.empty) {
    console.log('⚠️  Questions already exist in Firestore!');
    const args = process.argv.slice(2);
    if (!args.includes('--force')) {
      console.log('\n   Run with --force to overwrite: node scripts/seedQuestions.cjs --force\n');
      process.exit(0);
    }
    console.log('   --force detected, continuing...\n');
  }

  const BATCH_SIZE = 400;
  let totalUploaded = 0;

  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const chunk = questions.slice(i, i + BATCH_SIZE);
    const batch = db.batch();

    chunk.forEach((q) => {
      const docRef = db.collection('quiz_questions').doc();
      batch.set(docRef, {
        ...q,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    totalUploaded += chunk.length;
    console.log(`✅ Uploaded ${totalUploaded}/${questions.length} questions`);
  }

  const sections = ['QA', 'GIR', 'GA', 'EN'];
  console.log('\n📊 Summary:');
  sections.forEach((s) => {
    const count = questions.filter((q) => q.section === s).length;
    console.log(`   ${s}: ${count} questions`);
  });

  console.log('\n🎉 Seed complete!\n');
  process.exit(0);
}

seedQuestions().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});