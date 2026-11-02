export interface StateInfo {
  id: string; // e.g. 'up'
  name: string; // e.g. 'Uttar Pradesh'
  hindiName: string; // e.g. 'उत्तर प्रदेश'
  capital: string;
  cx: number;
  cy: number;
  totalSchemesCount?: number;
  focusAreas: string[];
  sampleSchemes: Array<{
    id: string;
    name: string;
    category: 'education' | 'health' | 'housing' | 'agriculture' | 'employment' | 'social_security' | 'women_children';
    summary: string;
    benefits: string[];
    isStateSpecific: boolean;
  }>;
}

export const INDIA_STATES_DATA: Record<string, StateInfo> = {
  up: {
    id: 'up',
    name: 'Uttar Pradesh',
    hindiName: 'उत्तर प्रदेश',
    capital: 'Lucknow',
    cx: 265,
    cy: 245,
    totalSchemesCount: 32,
    focusAreas: ['Agriculture', 'Girls Education', 'Rural Housing', 'Pensions'],
    sampleSchemes: [
      {
        id: 'up-kanya-sumangala',
        name: 'UP Mukhyamantri Kanya Sumangala Yojana',
        category: 'women_children',
        summary: 'Financial incentive of ₹15,000 to ₹25,000 paid across 6 educational and health developmental milestones of a girl child.',
        benefits: ['₹25,000 direct benefit transfer across 6 milestones', 'Free primary to higher secondary education support', 'Vaccination coverage grant'],
        isStateSpecific: true,
      },
      {
        id: 'up-pension-yojana',
        name: 'UP Vridhavastha & Divyangjan Pension',
        category: 'social_security',
        summary: 'Monthly social security allowance of ₹1,000 directly transferred to eligible senior citizens and differently-abled individuals.',
        benefits: ['₹1,000 per month DBT into bank accounts', 'Zero intermediary physical verification', 'Annual digital Jeevan Pramaan renewal'],
        isStateSpecific: true,
      },
    ],
  },
  mh: {
    id: 'mh',
    name: 'Maharashtra',
    hindiName: 'महाराष्ट्र',
    capital: 'Mumbai',
    cx: 180,
    cy: 435,
    focusAreas: ['Farmer Welfare', 'Health Assurance', 'Women Empowerment'],
    sampleSchemes: [
      {
        id: 'mh-mahatma-phule-arogya',
        name: 'Mahatma Jyotirao Phule Jan Arogya Yojana',
        category: 'health',
        summary: 'Cashless tertiary healthcare coverage up to ₹5,00,000 per family annually for critical illnesses and surgeries.',
        benefits: ['Up to ₹5 Lakh cashless hospitalisation across empaneled network', 'Covers 996 surgical and medical procedures', 'Pre and post-operative medications included'],
        isStateSpecific: true,
      },
      {
        id: 'mh-ladki-bahin',
        name: 'Mukhyamantri Majhi Ladki Bahin Yojana',
        category: 'women_children',
        summary: 'Direct financial assistance of ₹1,500 monthly for women aged 21-65 years from low-income households.',
        benefits: ['₹1,500 per month direct credit', 'Economic independence grant for self-help groups', 'Skill enhancement linkage'],
        isStateSpecific: true,
      },
    ],
  },
  ka: {
    id: 'ka',
    name: 'Karnataka',
    hindiName: 'कर्नाटक',
    capital: 'Bengaluru',
    cx: 171,
    cy: 519,
    focusAreas: ['Women Guarantee', 'Free Bus Travel', 'Youth Stipends'],
    sampleSchemes: [
      {
        id: 'ka-gruha-lakshmi',
        name: 'Karnataka Gruha Lakshmi Guarantee Scheme',
        category: 'social_security',
        summary: 'Monthly financial assistance of ₹2,000 provided to the female head of eligible BPL households.',
        benefits: ['₹2,000/month direct benefit transfer to women heads', 'Aadhaar-seeded bank delivery', 'Covers over 1.1 crore rural and urban families'],
        isStateSpecific: true,
      },
      {
        id: 'ka-yuva-nidhi',
        name: 'Karnataka Yuva Nidhi Unemployment Allowance',
        category: 'employment',
        summary: 'Monthly unemployment allowance of ₹3,000 for degree holders and ₹1,500 for diploma holders for up to two years.',
        benefits: ['₹3,000/mo for graduates, ₹1,500/mo for diploma holders', 'Free skill training and job fair access', 'Direct payment up to 24 months'],
        isStateSpecific: true,
      },
    ],
  },
  tn: {
    id: 'tn',
    name: 'Tamil Nadu',
    hindiName: 'तमिलनाडु',
    capital: 'Chennai',
    cx: 211,
    cy: 609,
    focusAreas: ['Higher Education', 'Nutrition Breakfast', 'Women Honorarium'],
    sampleSchemes: [
      {
        id: 'tn-pudhumai-penn',
        name: 'Pudhumai Penn Higher Education Grant Scheme',
        category: 'education',
        summary: 'Financial support of ₹1,000 per month for female students pursuing undergraduate degrees, diplomas, or ITI courses.',
        benefits: ['₹1,000 monthly study assistance', 'Aadhaar-enabled bank transfer till course completion', 'Incentivises college enrollment from govt schools'],
        isStateSpecific: true,
      },
      {
        id: 'tn-kalaignar-magalir',
        name: 'Kalaignar Magalir Urimai Thittam',
        category: 'women_children',
        summary: 'Basic income entitlement of ₹1,000 per month for women family heads to recognise uncompensated household labor.',
        benefits: ['₹1,000 per month directly deposited to bank accounts', 'Zero application fee', 'Smart card digital status tracking'],
        isStateSpecific: true,
      },
    ],
  },
  rj: {
    id: 'rj',
    name: 'Rajasthan',
    hindiName: 'राजस्थान',
    capital: 'Jaipur',
    cx: 119,
    cy: 257,
    focusAreas: ['Universal Health', 'Social Security', 'Subsidized Gas'],
    sampleSchemes: [
      {
        id: 'rj-chiranjeevi-health',
        name: 'Mukhyamantri Ayushman Arogya Yojana',
        category: 'health',
        summary: 'Comprehensive cashless health insurance providing secondary and tertiary care for hospitalization across Rajasthan.',
        benefits: ['Up to ₹25 Lakh family medical coverage', 'Cashless organ transplant & critical care', 'Free OPD & IPD medicines at government hospitals'],
        isStateSpecific: true,
      },
      {
        id: 'rj-annapurna-food',
        name: 'Mukhyamantri Nishulk Annapurna Food Packet',
        category: 'social_security',
        summary: 'Free monthly ration packets comprising pulses, edible oil, salt, sugar, and spices for NFSA beneficiaries.',
        benefits: ['Free monthly grocery essential pack', 'Quality-tested pulses and fortified edible oil', 'Distributed via fair price shops'],
        isStateSpecific: true,
      },
    ],
  },
  br: {
    id: 'br',
    name: 'Bihar',
    hindiName: 'बिहार',
    capital: 'Patna',
    cx: 369,
    cy: 275,
    focusAreas: ['Student Credit', 'Entrepreneurship', 'Women Employment'],
    sampleSchemes: [
      {
        id: 'br-student-credit-card',
        name: 'Bihar Student Credit Card Education Loan Scheme',
        category: 'education',
        summary: 'Collateral-free educational loan up to ₹4,00,000 at concessional interest rate (1% for girls/differently-abled).',
        benefits: ['Up to ₹4 Lakh interest-subsidised education loan', 'Zero collateral or third-party guarantee required', 'Moratorium period of 1 year post course completion'],
        isStateSpecific: true,
      },
      {
        id: 'br-udyami-yojana',
        name: 'Mukhyamantri Udyami Yojana (Industrial Seed Grant)',
        category: 'employment',
        summary: 'Project grant of up to ₹10,00,000 with 50% grant subsidy and 50% interest-free loan for young entrepreneurs.',
        benefits: ['₹5 Lakh non-refundable subsidy grant', '₹5 Lakh interest-free loan repayable in 84 installments', 'Free incubation and entrepreneurship training'],
        isStateSpecific: true,
      },
    ],
  },
  gj: {
    id: 'gj',
    name: 'Gujarat',
    hindiName: 'गुजरात',
    capital: 'Gandhinagar',
    cx: 66,
    cy: 355,
    focusAreas: ['Solar Power', 'Industrial Training', 'Farmer Subsidies'],
    sampleSchemes: [
      {
        id: 'gj-kisan-suryoday',
        name: 'Gujarat Kisan Suryoday Daytime Power Scheme',
        category: 'agriculture',
        summary: 'Supplies 3-phase reliable daytime electricity to farmers for irrigation, ending dangerous nighttime watering.',
        benefits: ['Daytime 3-phase power for agriculture pump-sets', 'Subsidized transmission line connections', 'Solar grid energy backup linkage'],
        isStateSpecific: true,
      },
    ],
  },
  wb: {
    id: 'wb',
    name: 'West Bengal',
    hindiName: 'पश्चिम बंगाल',
    capital: 'Kolkata',
    cx: 412,
    cy: 310,
    focusAreas: ['Girl Child Aid', 'Farmer Welfare', 'Health Insurance'],
    sampleSchemes: [
      {
        id: 'wb-kanyashree',
        name: 'Kanyashree Prakalpa (UN Award-winning Girl Aid)',
        category: 'education',
        summary: 'Annual scholarship of ₹1,000 and one-time endowment of ₹25,000 for unmarried girls continuing education.',
        benefits: ['Annual ₹1,000 study grant (K1) for classes 8 to 12', 'One-time ₹25,000 financial endowment (K2) at age 18', 'Direct bank credit with zero intermediary loss'],
        isStateSpecific: true,
      },
      {
        id: 'wb-swasthya-sathi',
        name: 'Swasthya Sathi Health Protection Scheme',
        category: 'health',
        summary: 'Basic cashless health cover of ₹5,00,000 per family annually issued in the name of the female family head.',
        benefits: ['₹5 Lakh cashless health cover per family', 'Smart card issued to the female head of the family', 'Paperless claims and IT-enabled monitoring'],
        isStateSpecific: true,
      },
    ],
  },
  dl: {
    id: 'dl',
    name: 'Delhi',
    hindiName: 'दिल्ली',
    capital: 'New Delhi',
    cx: 186,
    cy: 210,
    focusAreas: ['Free Public Transit', 'Electricity Subsidy', 'Senior Pilgrimage'],
    sampleSchemes: [
      {
        id: 'dl-pink-pass',
        name: 'Delhi Pink Pass Free Bus Travel for Women',
        category: 'social_security',
        summary: '100% free travel across DTC and Cluster bus fleets for women commuters using single-journey pink tickets.',
        benefits: ['Free bus travel across entire NCT Delhi public bus network', 'Enhances female labor force mobility and safety', 'GPS-tracked marshals on all buses'],
        isStateSpecific: true,
      },
      {
        id: 'dl-teerth-yatra',
        name: 'Mukhyamantri Tirth Yatra Elderly Pilgrimage Scheme',
        category: 'social_security',
        summary: 'Fully state-sponsored pilgrimage packages for senior citizens covering travel, AC accommodation, meals, and medical care.',
        benefits: ['100% free AC train travel, boarding, lodging and food', 'Doctor and escort accompanying every tour', 'Insurance coverage for all pilgrimage routes'],
        isStateSpecific: true,
      },
    ],
  },
  kl: {
    id: 'kl',
    name: 'Kerala',
    hindiName: 'केरल',
    capital: 'Thiruvananthapuram',
    cx: 166,
    cy: 615,
    focusAreas: ['Universal Healthcare', 'Social Pensions', 'Digital Literacy'],
    sampleSchemes: [
      {
        id: 'kl-karunya-health',
        name: 'Karunya Arogya Suraksha Padhathi (KASP)',
        category: 'health',
        summary: 'Comprehensive health assurance providing ₹5,00,000 per family per year for secondary and tertiary hospitalization.',
        benefits: ['₹5,00,000 annual family hospitalization cover', 'Coverage across all medical colleges and empaneled private hospitals', 'Special treatment packages for cancer and renal failure'],
        isStateSpecific: true,
      },
    ],
  },
  pb: {
    id: 'pb',
    name: 'Punjab',
    hindiName: 'पंजाब',
    capital: 'Chandigarh',
    cx: 151,
    cy: 152,
    focusAreas: ['Farmers Power', 'Aam Aadmi Clinics', 'Education Upgrade'],
    sampleSchemes: [
      {
        id: 'pb-aam-aadmi-clinics',
        name: 'Aam Aadmi Mohalla Clinics Network',
        category: 'health',
        summary: 'Free primary healthcare network providing 80+ essential medicines and 40+ diagnostic tests free of charge within neighborhoods.',
        benefits: ['Free primary diagnosis and consultations', '80+ medicines dispensed free of cost', '40+ blood and diagnostic clinical tests conducted free'],
        isStateSpecific: true,
      },
    ],
  },
  mp: {
    id: 'mp',
    name: 'Madhya Pradesh',
    hindiName: 'मध्य प्रदेश',
    capital: 'Bhopal',
    cx: 214,
    cy: 319,
    focusAreas: ['Ladli Behna', 'Wheat Procurement', 'Tribal Welfare'],
    sampleSchemes: [
      {
        id: 'mp-ladli-behna',
        name: 'Mukhyamantri Ladli Behna Yojana',
        category: 'women_children',
        summary: 'Monthly cash support of ₹1,250 provided to women aged 21-60 to foster economic self-reliance.',
        benefits: ['₹1,250 transferred directly to bank account on the 10th of every month', 'Covers married, widowed and divorced women', 'Direct Aadhaar DBT transfer'],
        isStateSpecific: true,
      },
    ],
  },
  tg: {
    id: 'tg',
    name: 'Telangana',
    hindiName: 'तेलंगाना',
    capital: 'Hyderabad',
    cx: 237,
    cy: 457,
    focusAreas: ['Rythu Bandhu', 'Mahalakshmi Free Bus', 'Griha Jyothi Power'],
    sampleSchemes: [
      {
        id: 'tg-mahalakshmi',
        name: 'Maha Lakshmi Women Empowerment Guarantee',
        category: 'women_children',
        summary: 'Free bus travel across TSRTC buses and subsidized LPG cylinders at ₹500 for eligible families.',
        benefits: ['100% free travel in TSRTC Palle Velugu & Express buses', 'Gas cylinder subsidy at ₹500', 'Direct financial aid for girl students'],
        isStateSpecific: true,
      },
    ],
  },
  ap: {
    id: 'ap',
    name: 'Andhra Pradesh',
    hindiName: 'आंध्र प्रदेश',
    capital: 'Amaravati',
    cx: 263,
    cy: 500,
    focusAreas: ['Aarogyasri Health', 'Mother Support', 'Agricultural Input'],
    sampleSchemes: [
      {
        id: 'ap-aarogyasri',
        name: 'Dr. YSR Aarogyasri Health Care Trust',
        category: 'health',
        summary: 'Comprehensive medical coverage covering treatments exceeding ₹1,000 up to ₹25,00,000 for low-income families.',
        benefits: ['Coverage up to ₹25 Lakh for catastrophic illnesses', 'Post-operative subsistence allowance during recovery', 'Free dialysis and cancer immunotherapy packages'],
        isStateSpecific: true,
      },
    ],
  },
  or: {
    id: 'or',
    name: 'Odisha',
    hindiName: 'ओडिशा',
    capital: 'Bhubaneswar',
    cx: 340,
    cy: 405,
    focusAreas: ['BSKY Health', 'Kalia Farmer Aid', 'Mission Shakti'],
    sampleSchemes: [
      {
        id: 'or-bsky',
        name: 'Biju Swasthya Kalyan Yojana (BSKY)',
        category: 'health',
        summary: 'Universal health coverage offering ₹5 Lakh cover per family and ₹10 Lakh cover for female members across India.',
        benefits: ['₹5 Lakh per family / ₹10 Lakh for women members', 'Cashless service at premier hospitals nationwide', 'No documentation hassle at hospital desks'],
        isStateSpecific: true,
      },
    ],
  },
  hr: {
    id: 'hr',
    name: 'Haryana',
    hindiName: 'हरियाणा',
    capital: 'Chandigarh',
    cx: 164,
    cy: 195,
    focusAreas: ['Parivar Pehchan Patra', 'Sports Awards', 'Old Age Samman'],
    sampleSchemes: [
      {
        id: 'hr-old-age-samman',
        name: 'Haryana Old Age Samman Allowance',
        category: 'social_security',
        summary: 'Monthly social pension of ₹3,000 granted automatically to senior citizens aged 60+ via Parivar Pehchan Patra verification.',
        benefits: ['₹3,000 per month pension (highest in northern India)', 'Automated enrollment through verified family ID', 'Zero paper application required'],
        isStateSpecific: true,
      },
    ],
  },
  ut: {
    id: 'ut',
    name: 'Uttarakhand',
    hindiName: 'उत्तराखंड',
    capital: 'Dehradun',
    cx: 232,
    cy: 175,
    totalSchemesCount: 15,
    focusAreas: ['Girl Child Support', 'Youth Self-Employment', 'Hilly Area Welfare'],
    sampleSchemes: [
      {
        id: 'ut-gaura-devi',
        name: 'Uttarakhand Gaura Devi Kanya Dhan Yojana',
        category: 'women_children',
        summary: 'Financial incentive of ₹50,000 for girl students completing class 12th from BPL and rural households.',
        benefits: ['₹50,000 one-time grant upon 12th pass', 'Promotes higher education enrollment among girls', 'Direct DBT to girl bank account'],
        isStateSpecific: true,
      },
      {
        id: 'ut-swarojgar',
        name: 'Uttarakhand Mukhyamantri Swarojgar Yojana (MSY)',
        category: 'employment',
        summary: 'Up to 25% capital subsidy on manufacturing and service venture loans up to ₹25 Lakh for local youth.',
        benefits: ['Up to 25% subsidy on micro and small enterprise loans', 'Repayment tenure up to 5 years', 'Encourages local entrepreneurship in hilly areas'],
        isStateSpecific: true,
      },
    ],
  },
  hp: {
    id: 'hp',
    name: 'Himachal Pradesh',
    hindiName: 'हिमाचल प्रदेश',
    capital: 'Shimla',
    cx: 191,
    cy: 133,
    totalSchemesCount: 14,
    focusAreas: ['Health Support', 'Youth Enterprises', 'Horticulture & Apples'],
    sampleSchemes: [
      {
        id: 'hp-swavalamban',
        name: 'Himachal Mukhyamantri Swavalamban Yojana',
        category: 'employment',
        summary: 'Capital subsidy of 25% to 35% on machinery investments up to ₹1 Crore for Himachali youth startups.',
        benefits: ['Up to 35% capital subsidy for women and youth entrepreneurs', 'Interest subvention of 5% for 3 years', 'Fast-track bank clearance'],
        isStateSpecific: true,
      },
      {
        id: 'hp-sahara',
        name: 'Himachal Sahara Yojana (Critical Health)',
        category: 'health',
        summary: 'Monthly financial assistance of ₹3,000 for patients suffering from Parkinson, Cancer, Renal failure, and muscular dystrophy.',
        benefits: ['₹3,000 monthly DBT for critical illness patient care', 'Covers bedridden and chronically ill patients', 'Zero income limit for severe cases'],
        isStateSpecific: true,
      },
    ],
  },
  jk: {
    id: 'jk',
    name: 'Jammu and Kashmir',
    hindiName: 'जम्मू और कश्मीर',
    capital: 'Srinagar / Jammu',
    cx: 173,
    cy: 61,
    totalSchemesCount: 16,
    focusAreas: ['Youth Livelihood', 'Universal Health Care', 'Artisan & Handicrafts'],
    sampleSchemes: [
      {
        id: 'jk-sehat-health',
        name: 'AB-PMJAY SEHAT Universal Health Insurance',
        category: 'health',
        summary: 'Universal cashless medical insurance providing up to ₹5,00,000 annual family coverage for all residents of Jammu and Kashmir.',
        benefits: ['100% universal cashless coverage up to ₹5 Lakh per family', 'Valid across 24,000+ empaneled hospitals across India', 'Portability across all states'],
        isStateSpecific: true,
      },
      {
        id: 'jk-mumkin',
        name: 'Mission Youth MUMKIN Commercial Vehicle Scheme',
        category: 'employment',
        summary: '100% on-road finance with 20% subsidy for youth to acquire commercial transport vehicles and start transport businesses.',
        benefits: ['Zero down payment for eligible youth', '10% capital subsidy from govt + 10% discount from manufacturer', 'Generates sustainable self-employment'],
        isStateSpecific: true,
      },
    ],
  },
  ct: {
    id: 'ct',
    name: 'Chhattisgarh',
    hindiName: 'छत्तीसगढ़',
    capital: 'Raipur',
    cx: 296,
    cy: 388,
    totalSchemesCount: 17,
    focusAreas: ['Women Assistance', 'Paddy Input Subsidies', 'Tribal Forest Produce'],
    sampleSchemes: [
      {
        id: 'ct-mahtari-vandan',
        name: 'Chhattisgarh Mahtari Vandan Yojana',
        category: 'women_children',
        summary: 'Monthly financial assistance of ₹1,000 directly transferred to married women aged 21 and above across Chhattisgarh.',
        benefits: ['₹1,000 per month direct credit to bank accounts (₹12,000/year)', 'Aadhaar-seeded direct benefit transfer', 'Promotes nutritional and economic independence'],
        isStateSpecific: true,
      },
      {
        id: 'ct-kisan-nyay',
        name: 'Chhattisgarh Rajiv Gandhi Kisan Nyay Yojana',
        category: 'agriculture',
        summary: 'Direct input support of up to ₹9,000 per acre provided to farmers growing paddy, pulses, and oilseeds.',
        benefits: ['Up to ₹9,000 per acre agricultural input subsidy', 'Transferred in 4 seasonal installments', 'Boosts crop diversification and farmer income'],
        isStateSpecific: true,
      },
    ],
  },
  jh: {
    id: 'jh',
    name: 'Jharkhand',
    hindiName: 'झारखण्ड',
    capital: 'Ranchi',
    cx: 366,
    cy: 327,
    totalSchemesCount: 18,
    focusAreas: ['Women Honorarium', 'Pucca Housing', 'Tribal Welfare'],
    sampleSchemes: [
      {
        id: 'jh-maiya-samman',
        name: 'Jharkhand Mukhyamantri Maiya Samman Yojana',
        category: 'women_children',
        summary: 'Monthly financial assistance of ₹1,000 (annual ₹12,000) for women aged 18 to 50 from low-income families.',
        benefits: ['₹1,000 monthly direct bank transfer', 'Direct application at Gram Panchayat camps', 'Comprehensive coverage of rural women'],
        isStateSpecific: true,
      },
      {
        id: 'jh-abua-awas',
        name: 'Jharkhand Abua Awas 3-Room Pucca Housing Scheme',
        category: 'housing',
        summary: 'Grant of ₹2,00,000 for constructing 3-room pucca houses with kitchen for homeless and kutcha-house families.',
        benefits: ['₹2,00,000 grant in 4 construction milestone installments', 'Mandatory 3 rooms with hygienic kitchen space', 'Prioritises vulnerable tribal and rural households'],
        isStateSpecific: true,
      },
    ],
  },
  as: {
    id: 'as',
    name: 'Assam',
    hindiName: 'असम',
    capital: 'Dispur',
    cx: 516,
    cy: 271,
    totalSchemesCount: 16,
    focusAreas: ['Direct Benefit Transfer', 'Girl Education', 'Tea Garden Welfare'],
    sampleSchemes: [
      {
        id: 'as-orunodoi',
        name: 'Assam Orunodoi 2.0 Poverty Alleviation Scheme',
        category: 'social_security',
        summary: 'Direct benefit transfer of ₹1,250 per month credited to the bank accounts of nominated female family members.',
        benefits: ['₹1,250 monthly DBT to purchase medicines, nutrition, and food', 'Nominated female head receives transfer directly', 'Zero paper hassle via digital Ration linkage'],
        isStateSpecific: true,
      },
      {
        id: 'as-pragyan-bharati',
        name: 'Assam Pragyan Bharati Higher Education & Scooty Award',
        category: 'education',
        summary: 'Merit award of scooters for meritorious students alongside free textbook grants and college fee waivers.',
        benefits: ['Free scooters for meritorious higher secondary students', '100% admission and tuition fee waivers in state colleges', 'Hostel mess fee subsidy support'],
        isStateSpecific: true,
      },
    ],
  },
};

/**
 * Standard complete mapping of every 2-letter state/UT code to its official full English name.
 */
export const STATE_NAMES_BY_ID: Record<string, string> = {
  an: 'Andaman and Nicobar Islands',
  ap: 'Andhra Pradesh',
  ar: 'Arunachal Pradesh',
  as: 'Assam',
  br: 'Bihar',
  ch: 'Chandigarh',
  ct: 'Chhattisgarh',
  dn: 'Dadra and Nagar Haveli',
  dd: 'Daman and Diu',
  dl: 'Delhi',
  ga: 'Goa',
  gj: 'Gujarat',
  hr: 'Haryana',
  hp: 'Himachal Pradesh',
  jk: 'Jammu and Kashmir',
  jh: 'Jharkhand',
  ka: 'Karnataka',
  kl: 'Kerala',
  ld: 'Lakshadweep',
  mp: 'Madhya Pradesh',
  mh: 'Maharashtra',
  mn: 'Manipur',
  ml: 'Meghalaya',
  mz: 'Mizoram',
  nl: 'Nagaland',
  or: 'Odisha',
  py: 'Puducherry',
  pb: 'Punjab',
  rj: 'Rajasthan',
  sk: 'Sikkim',
  tn: 'Tamil Nadu',
  tg: 'Telangana',
  tr: 'Tripura',
  up: 'Uttar Pradesh',
  ut: 'Uttarakhand',
  wb: 'West Bengal',
};

export const STATE_SCHEMES_META: Record<string, { cx: number; cy: number; totalSchemesCount: number; hindiName: string; capital: string }> = {
  up: { cx: 265, cy: 245, totalSchemesCount: 32, hindiName: 'उत्तर प्रदेश', capital: 'Lucknow' },
  mh: { cx: 180, cy: 435, totalSchemesCount: 28, hindiName: 'महाराष्ट्र', capital: 'Mumbai' },
  ka: { cx: 171, cy: 519, totalSchemesCount: 24, hindiName: 'कर्नाटक', capital: 'Bengaluru' },
  tn: { cx: 211, cy: 609, totalSchemesCount: 29, hindiName: 'तमिलनाडु', capital: 'Chennai' },
  rj: { cx: 119, cy: 257, totalSchemesCount: 22, hindiName: 'राजस्थान', capital: 'Jaipur' },
  br: { cx: 369, cy: 275, totalSchemesCount: 26, hindiName: 'बिहार', capital: 'Patna' },
  gj: { cx: 66, cy: 355, totalSchemesCount: 23, hindiName: 'गुजरात', capital: 'Gandhinagar' },
  wb: { cx: 412, cy: 310, totalSchemesCount: 27, hindiName: 'पश्चिम बंगाल', capital: 'Kolkata' },
  dl: { cx: 186, cy: 210, totalSchemesCount: 21, hindiName: 'दिल्ली', capital: 'New Delhi' },
  kl: { cx: 166, cy: 615, totalSchemesCount: 19, hindiName: 'केरल', capital: 'Thiruvananthapuram' },
  pb: { cx: 151, cy: 152, totalSchemesCount: 18, hindiName: 'पंजाब', capital: 'Chandigarh' },
  mp: { cx: 214, cy: 319, totalSchemesCount: 25, hindiName: 'मध्य प्रदेश', capital: 'Bhopal' },
  tg: { cx: 237, cy: 457, totalSchemesCount: 20, hindiName: 'तेलंगाना', capital: 'Hyderabad' },
  ap: { cx: 263, cy: 500, totalSchemesCount: 22, hindiName: 'आंध्र प्रदेश', capital: 'Amaravati' },
  or: { cx: 340, cy: 405, totalSchemesCount: 17, hindiName: 'ओडिशा', capital: 'Bhubaneswar' },
  hr: { cx: 164, cy: 195, totalSchemesCount: 19, hindiName: 'हरियाणा', capital: 'Chandigarh' },
  jh: { cx: 366, cy: 327, totalSchemesCount: 18, hindiName: 'झारखण्ड', capital: 'Ranchi' },
  ct: { cx: 296, cy: 388, totalSchemesCount: 17, hindiName: 'छत्तीसगढ़', capital: 'Raipur' },
  as: { cx: 516, cy: 271, totalSchemesCount: 16, hindiName: 'असम', capital: 'Dispur' },
  ut: { cx: 232, cy: 175, totalSchemesCount: 15, hindiName: 'उत्तराखंड', capital: 'Dehradun' },
  hp: { cx: 191, cy: 133, totalSchemesCount: 14, hindiName: 'हिमाचल प्रदेश', capital: 'Shimla' },
  jk: { cx: 173, cy: 61, totalSchemesCount: 16, hindiName: 'जम्मू और कश्मीर', capital: 'Srinagar / Jammu' },
  ga: { cx: 122, cy: 512, totalSchemesCount: 12, hindiName: 'गोवा', capital: 'Panaji' },
  sk: { cx: 425, cy: 235, totalSchemesCount: 12, hindiName: 'सिक्किम', capital: 'Gangtok' },
  ar: { cx: 550, cy: 224, totalSchemesCount: 11, hindiName: 'अरुणाचल प्रदेश', capital: 'Itanagar' },
  mn: { cx: 537, cy: 301, totalSchemesCount: 11, hindiName: 'मणिपुर', capital: 'Imphal' },
  ml: { cx: 484, cy: 283, totalSchemesCount: 12, hindiName: 'मेघालय', capital: 'Shillong' },
  mz: { cx: 516, cy: 337, totalSchemesCount: 10, hindiName: 'मिज़ोरम', capital: 'Aizawl' },
  nl: { cx: 546, cy: 270, totalSchemesCount: 10, hindiName: 'नागालैंड', capital: 'Kohima' },
  tr: { cx: 493, cy: 325, totalSchemesCount: 13, hindiName: 'त्रिपुरा', capital: 'Agartala' },
  ch: { cx: 179, cy: 160, totalSchemesCount: 11, hindiName: 'चंडीगढ़', capital: 'Chandigarh' },
  py: { cx: 268, cy: 546, totalSchemesCount: 9, hindiName: 'पुदुच्चेरी', capital: 'Puducherry' },
  an: { cx: 521, cy: 609, totalSchemesCount: 7, hindiName: 'अंडमान और निकोबार', capital: 'Port Blair' },
  ld: { cx: 99, cy: 627, totalSchemesCount: 6, hindiName: 'लक्षद्वीप', capital: 'Kavaratti' },
  dn: { cx: 102, cy: 405, totalSchemesCount: 8, hindiName: 'दादरा और नगर हवेली', capital: 'Silvassa' },
  dd: { cx: 54, cy: 391, totalSchemesCount: 8, hindiName: 'दमन और दीव', capital: 'Daman' },
};

/**
 * Fallback defaults for any state or UT without explicit custom schemes.
 * Guaranteed to return full state name, never 2-letter codes like 'ut', 'jk', 'hp', 'ct'.
 */
export function getStateDetails(stateIdOrName: string): StateInfo {
  const normalized = stateIdOrName.trim().toLowerCase();
  
  // 1. Check in full INDIA_STATES_DATA
  for (const info of Object.values(INDIA_STATES_DATA)) {
    if (info.id.toLowerCase() === normalized || info.name.toLowerCase() === normalized) {
      const meta = STATE_SCHEMES_META[info.id.toLowerCase()];
      const resolvedFullName = STATE_NAMES_BY_ID[info.id.toLowerCase()] || info.name;
      return {
        ...info,
        name: resolvedFullName,
        totalSchemesCount: info.totalSchemesCount ?? meta?.totalSchemesCount ?? 20,
      };
    }
  }

  // 2. Identify ID and official full English name
  const id = STATE_NAMES_BY_ID[normalized]
    ? normalized
    : Object.keys(STATE_NAMES_BY_ID).find((k) => STATE_NAMES_BY_ID[k].toLowerCase() === normalized)
      || Object.keys(STATE_SCHEMES_META).find((k) => k === normalized.slice(0, 2))
      || normalized;

  const fullName = STATE_NAMES_BY_ID[id] 
    || STATE_NAMES_BY_ID[normalized] 
    || (stateIdOrName.length > 3 ? stateIdOrName : STATE_NAMES_BY_ID[id] || stateIdOrName);

  const meta = STATE_SCHEMES_META[id] || STATE_SCHEMES_META[normalized];

  return {
    id,
    name: fullName,
    hindiName: meta?.hindiName ?? fullName,
    capital: meta?.capital ?? 'State Capital',
    cx: meta?.cx ?? 306,
    cy: meta?.cy ?? 348,
    totalSchemesCount: meta?.totalSchemesCount ?? 16,
    focusAreas: ['Education', 'Health', 'Rural Livelihood', 'Social Security'],
    sampleSchemes: [
      {
        id: `${id}-state-scholarship`,
        name: `${fullName} Higher Education & Merit Support Scheme`,
        category: 'education',
        summary: `Special financial and merit assistance provided to deserving students residing in ${fullName}.`,
        benefits: [
          'Direct benefit transfer into student bank accounts',
          'Fee concession across accredited colleges',
          'Annual renewal based on academic performance',
        ],
        isStateSpecific: true,
      },
      {
        id: `${id}-welfare-pension`,
        name: `${fullName} Social Security & Family Welfare Grant`,
        category: 'social_security',
        summary: `Direct monthly welfare assistance for elderly, widows, and vulnerable households across ${fullName}.`,
        benefits: [
          'Direct monthly DBT assistance',
          'Simplified digital verification',
          'Priority access to state welfare centers',
        ],
        isStateSpecific: true,
      },
    ],
  };
}
