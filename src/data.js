export const USER = {
  username: 'StudentPro',
  password: 'Password@12',
  name: 'Student',
  classLabel: 'WBCHSE Class 12 • Semester 4'
}

export const MENTORS = [
  { id: 'stranger', name: 'Stranger Dada', bn: 'জাদু দাদা', role: 'Lead mentor', tone: 'Calm, cinematic, exam-first', color: 'var(--pink)' },
  { id: 'mahi', name: 'Mahi Didi', bn: 'মাহি দিদি', role: 'WBCHSE mentor', tone: 'Warm, syllabus-tight, encouraging', color: 'var(--yellow)' },
  { id: 'anjali', name: 'Anjali Didi', bn: 'অঞ্জলি দিদি', role: 'Biology peer', tone: 'Friendly, ecology & biotechnology', color: 'var(--lime)' },
  { id: 'zoya', name: 'Zoya Didi', bn: 'জয়া দিদি', role: 'Classmate coach', tone: 'Fast, quiz energy, English & Computer', color: 'var(--teal)' },
  { id: 'rohan', name: 'Rohan Dada', bn: 'রোহন দাদা', role: 'Math & Physics Lead', tone: 'Calculus, Vectors, Optics & Circuits', color: 'var(--peach)' }
]

export const TOOLS = [
  { id: 'mock', to: '/app/mock', title: 'Mock Test AI', desc: 'Semester 4 full exam simulation', tag: 'Exam Sim', color: 'var(--yellow)' },
  { id: 'doubt', to: '/app/doubt', title: 'AI Doubt Solver', desc: 'Instant step-by-step solutions for Sem 4', tag: 'AI Mentor', color: 'var(--teal)' },
  { id: 'math', to: '/app/formulas', title: 'Math Lab (LaTeX)', desc: 'Forward 1-2 question solver & Answer Key PDF', tag: 'Math Lab', color: 'var(--lime)' },
  { id: 'voice', to: '/app/voice', title: 'Voice Tutor', desc: 'Real-time voice discussions for Semester 4', tag: 'Voice AI', color: 'var(--lime)' },
  { id: 'flash', to: '/app/flashcards', title: '3D Flashcards', desc: 'Spaced-repetition concept cards for Sem 4', tag: 'Flashcards', color: 'var(--pink)' },
  { id: 'notes', to: '/app/notes', title: 'Revision Notes', desc: 'Bengali, English, Physics, Chem, Math & CS Notes', tag: 'Notes Hub', color: 'var(--peach)' },
  { id: 'mind', to: '/app/mindmap', title: 'Concept Mind Maps', desc: 'Interactive visual knowledge trees', tag: 'Visualizer', color: 'var(--blue)' },
  { id: 'mcq', to: '/app/mcq', title: 'WBCHSE MCQ Bank', desc: 'Sem 4 MCQs with Bengali explanations', tag: 'MCQ Bank', color: 'var(--teal)' },
  { id: 'blitz', to: '/app/blitz', title: 'Speed Blitz', desc: '60-second rapid fire MCQ sprints', tag: 'Fast Quiz', color: 'var(--peach)' },
  { id: 'focus', to: '/app/focus', title: 'Focus Study Room', desc: 'Pomodoro timer + binaural study audio', tag: 'Focus', color: 'var(--yellow)' },
  { id: 'notices', to: '/app/notices', title: 'Notice Board PDFs', desc: 'WBCHSE official notices & routine PDFs', tag: 'PDF Board', color: 'var(--lime)' },
  { id: 'scanner', to: '/app/scanner', title: 'Question Scanner', desc: 'Scan textbook pages & photos instantly', tag: 'OCR AI', color: 'var(--pink)' },
  { id: 'mistakes', to: '/app/mistakes', title: 'Mistake Bank', desc: 'Review incorrect answers & fix errors', tag: 'Fix Errors', color: 'var(--peach)' },
  { id: 'syllabus', to: '/app/syllabus', title: 'Class 12 Roadmap', desc: 'Semester 4 official syllabus checklist', tag: 'Syllabus', color: 'var(--teal)' },
  { id: 'memory', to: '/app/memory', title: 'AI Memory Vault', desc: 'Persistent account-synced study memory', tag: 'Vault', color: 'var(--pink)' },
  { id: 'lab', to: '/app/lab', title: '3D Science Lab', desc: 'Interactive Chemistry, Physics, Math in 3D', tag: '3D Studio', color: 'var(--blue)' },
  { id: 'autopsy', to: '/app/autopsy', title: 'AI Weak Area Autopsy', desc: 'Diagnostic mistake analysis & 5-min fix', tag: 'Diagnostic', color: 'var(--peach)' },
  { id: 'voicequiz', to: '/app/voice-quiz', title: 'Voice MCQ Challenge', desc: 'Speak answers aloud to AI mentor', tag: 'Voice AI', color: 'var(--teal)' },
  { id: 'duel', to: '/app/duel', title: '1v1 Friend Quiz Duel', desc: 'Battle classmates on chat rooms', tag: '1v1 Arena', color: 'var(--yellow)' },
  { id: 'pdf', to: '/app/model-paper', title: 'Model Paper OMR PDF', desc: '1-click printable question & OMR sheet', tag: 'Printable', color: 'var(--lime)' },
  { id: 'diary', to: '/app/diary', title: 'Formula Quote Diary', desc: 'Personal sticky equations & literary quotes', tag: 'Bookmarks', color: 'var(--pink)' },
  { id: 'telegram', to: '/app/telegram', title: 'Telegram AI Bot', desc: 'Study reminders & quizzes on Telegram', tag: 'Bot Hub', color: 'var(--blue)' },
  { id: 'calls', to: '/app/vigilance', title: 'Daily Calls & Parent Vigilance', desc: 'Morning/night calls and study proof reports', tag: 'Vigilance', color: 'var(--peach)' },
  { id: 'mentors', to: '/app/mentors', title: 'AI Mentors', desc: 'Stranger, Mahi, Anjali and Zoya on call', tag: 'Companions', color: 'var(--yellow)' }
]

export const FEATURES = [
  {
    kicker: 'Semester 4 Study Plan',
    title: 'Complete WBCHSE Sem 4 Board Roadmap',
    body: 'Stranger covers every single Unit and Topic across Bengali A, English B, Mathematics, Physics, Chemistry, Computer Application & Biology for Semester 4.',
    color: 'var(--pink)'
  },
  {
    kicker: 'AI Math Lab & Answer Key PDF',
    title: 'Step-by-Step LaTeX Problem Solver',
    body: 'Solve single or multi-question exam photos with forward 1-2 numbering, KaTeX formulas, and export clean, branded Answer Key PDFs.',
    color: 'var(--lime)'
  },
  {
    kicker: 'Voice AI Mentors',
    title: 'Learn Semester 4 with Real-Time Audio',
    body: 'Mahi Didi, Stranger Dada and Anjali explain Optics, Calculus, Coordination Chemistry, DBMS, and literary themes in sweet, encouraging Bengali.',
    color: 'var(--yellow)'
  },
  {
    kicker: 'Official Syllabus Precision',
    title: 'Zero Distraction, 100% Board Syllabus',
    body: 'All study tools, mocks, flashcards and voice models are strictly synchronized to the WBCHSE Semester IV curriculum.',
    color: 'var(--teal)'
  }
]

export const SYLLABUS = [
  {
    subject: 'Mathematics',
    color: 'var(--blue)',
    code: 'MATH',
    fullMarks: 40,
    contactHours: 80,
    chapters: [
      {
        unit: 'Unit-I',
        name: 'Vectors and Three-Dimensional Geometry',
        bn: 'ভেক্টর এবং ত্রিমাত্রিক স্থানাঙ্ক জ্যামিতি',
        marks: 15,
        hours: 30,
        topics: [
          'Vectors and scalars, magnitude and direction',
          'Direction cosines and direction ratios of a vector',
          'Types of vectors (equal, unit, zero, parallel, collinear)',
          'Position vector, addition of vectors, multiplication by scalar',
          'Dot (scalar) product and cross (vector) product',
          '3D Coordinate axes and coordinate planes',
          'Distance between two points in 3D',
          'Direction cosines & ratios of a line joining points',
          'Cartesian & vector equation of a line',
          'Skew lines, shortest distance between two skew lines',
          'Angle between two lines, equations of planes'
        ],
        done: false
      },
      {
        unit: 'Unit-II',
        name: 'Calculus: Integrals',
        bn: 'কলনবিদ্যা: সমাকলন (Integrals)',
        marks: 9,
        hours: 20,
        topics: [
          'Integration as inverse process of differentiation',
          'Integration by substitution, partial fractions, parts',
          'Special integrals: dx/(x²±a²), dx/√(x²±a²), dx/√(a²-x²)',
          'Quadratic integrals: dx/(ax²+bx+c), dx/√(ax²+bx+c)',
          'Linear/quadratic: (px+q)/(ax²+bx+c) dx, (px+q)/√(ax²+bx+c) dx',
          'Root forms: √(a²±x²) dx, √(x²-a²) dx, √(ax²+bx+c) dx',
          'Fundamental theorem of Calculus (without proof)',
          'Properties of definite integrals and evaluations'
        ],
        done: false
      },
      {
        unit: 'Unit-II',
        name: 'Calculus: Applications of Integrals',
        bn: 'সমাকলনের প্রয়োগ (ক্ষেত্রফল নির্ণয়)',
        marks: 6,
        hours: 10,
        topics: [
          'Area under simple curves',
          'Area bounded by lines, circles, parabolas, and ellipses in standard form'
        ],
        done: false
      },
      {
        unit: 'Unit-II',
        name: 'Calculus: Differential Equations',
        bn: 'অবকল সমীকরণ (Differential Equations)',
        marks: 5,
        hours: 10,
        topics: [
          'Definition, order and degree of a differential equation',
          'General and particular solutions',
          'Solution by method of separation of variables',
          'Homogeneous differential equations of 1st order and 1st degree',
          'Linear differential equations: dy/dx + py = q & dx/dy + px = q'
        ],
        done: false
      },
      {
        unit: 'Unit-III',
        name: 'Linear Programming (LPP)',
        bn: 'রৈখিক প্রোগ্রামিং (LPP)',
        marks: 5,
        hours: 10,
        topics: [
          'Constraints, objective function, optimization',
          'Graphical method of solution for two variables',
          'Feasible and infeasible regions (bounded/unbounded)',
          'Optimal feasible solutions (up to 3 non-trivial constraints)'
        ],
        done: false
      }
    ]
  },
  {
    subject: 'Physics',
    color: 'var(--peach)',
    code: 'PHYS',
    fullMarks: 35,
    contactHours: 60,
    chapters: [
      {
        unit: 'Unit 6',
        name: 'Optics: Ray Optics and Optical Instruments',
        bn: 'আলোকবিজ্ঞান: জ্যামিতিক আলোকবিজ্ঞান ও আলোকীয় যন্ত্র',
        marks: 14,
        hours: 25,
        topics: [
          'Reflection, spherical mirrors, mirror formula',
          'Refraction, total internal reflection (TIR) and optical fibers',
          'Refraction at spherical surfaces, lenses, thin lens formula, Lens Maker’s Formula',
          'Displacement method to find image position, magnification',
          'Combination of thin lenses in contact, combination of lens & mirror',
          'Refraction and dispersion of light through a prism',
          'Scattering of light (blue color of sky, red sunrise/sunset)',
          'Human eye: defects (myopia, hypermetropia) & corrections',
          'Microscopes and astronomical telescopes (reflecting & refracting) with magnifying powers'
        ],
        done: false
      },
      {
        unit: 'Unit 6',
        name: 'Optics: Wave Optics',
        bn: 'আলোকবিজ্ঞান: তরঙ্গ আলোকবিজ্ঞান (Wave Optics)',
        marks: 14,
        hours: 25,
        topics: [
          'Wavefront and Huygens’ principle',
          'Reflection and refraction of plane wave using Huygens’ principle',
          'Interference: Young’s double slit experiment, coherent sources',
          'Conditions for sustained interference, fringe width expression',
          'Diffraction: Fraunhofer single slit diffraction, width of central maximum',
          'Resolving power of microscope and astronomical telescope',
          'Polarization, plane polarized light, Brewster’s law, uses of polaroids'
        ],
        done: false
      },
      {
        unit: 'Unit 7',
        name: 'Dual Nature of Radiation and Matter',
        bn: 'পদার্থ ও বিকিরণের দ্বৈত সত্তা',
        marks: 4,
        hours: 7,
        topics: [
          'Dual nature of radiation, Photoelectric effect',
          'Hertz and Lenard’s observations, Einstein’s Photoelectric equation',
          'Particle nature of light (photons)',
          'Matter waves: de Broglie relation and its simple applications'
        ],
        done: false
      },
      {
        unit: 'Unit 8',
        name: 'Atoms and Nuclei',
        bn: 'পরমাণু ও নিউক্লিয়াস',
        marks: 6,
        hours: 10,
        topics: [
          'Alpha-particle scattering experiment, Rutherford’s model of atom',
          'Bohr model of hydrogen-like atoms, energy levels, hydrogen spectrum',
          'Elementary theory of X-ray production, continuous and characteristic X-rays, Moseley’s law',
          'Nuclei: composition & size, isotope, isobar, isotone',
          'Radioactivity: alpha, beta, gamma decay law, half-life',
          'Mass defect, binding energy per nucleon and its variation with mass number',
          'Nuclear fission and nuclear fusion'
        ],
        done: false
      },
      {
        unit: 'Unit 9',
        name: 'Electronic Devices',
        bn: 'ইলেকট্রনিক ডিভাইস (অর্ধপরিবাহী ও লজিক গেট)',
        marks: 8,
        hours: 15,
        topics: [
          'Thermal emission of electrons, vacuum diode and triodes basic concept',
          'Energy bands in solids (conductors, insulators, semiconductors)',
          'Intrinsic and extrinsic semiconductors, band diagram',
          'P-N junction diode: forward and reverse bias, I-V characteristics',
          'Special diodes: LED, photodiode, solar cell, Zener diode as voltage regulator',
          'Junction transistor (npn and pnp action, CE characteristics, transistor as switch)',
          'Elementary idea of analogue and digital signals, binary numbers',
          'Logic gates: OR, AND, NOT, NAND, NOR (symbols, truth table, Boolean equations, combinations)'
        ],
        done: false
      },
      {
        unit: 'Unit 10',
        name: 'Communication System',
        bn: 'যোগাযোগ ব্যবস্থা (Communication System)',
        marks: 3,
        hours: 5,
        topics: [
          'Elements of communication system (block diagram)',
          'Concepts of amplitude modulation (AM) and frequency modulation (FM)',
          'Bandwidth of signals (speech, TV, digital) and transmission medium',
          'Propagation of EM waves: ground, sky, and space wave propagation'
        ],
        done: false
      }
    ]
  },
  {
    subject: 'Chemistry',
    color: 'var(--yellow)',
    code: 'CHEM',
    fullMarks: 35,
    contactHours: 60,
    chapters: [
      {
        unit: 'Unit-1',
        name: 'Electrochemistry',
        bn: 'তড়িৎ রসায়ন (Electrochemistry)',
        marks: 5,
        hours: 8,
        topics: [
          'Redox reactions, conductance in electrolytic solutions',
          'Specific and molar conductivity, variation with concentration',
          'Kohlrausch’s law, electrolysis and laws of electrolysis',
          'Dry cell, electrolytic cells and Galvanic cells, EMF of a cell',
          'Standard electrode potential, Nernst equation and application to chemical cells',
          'Relation between Gibbs free energy change and EMF of a cell',
          'Fuel cells, Li-ion battery'
        ],
        done: false
      },
      {
        unit: 'Unit-2',
        name: 'Chemical Kinetics',
        bn: 'রাসায়নিক গতিবিদ্যা (Chemical Kinetics)',
        marks: 7,
        hours: 10,
        topics: [
          'Rate of a reaction (average and instantaneous)',
          'Factors affecting rate: concentration, temperature, catalyst',
          'Order and molecularity of a reaction, rate law and specific rate constant',
          'Integrated rate equations and half-life (zero and first order reactions)',
          'Collision theory (elementary concept, no mathematical treatment)',
          'Activation energy, Arrhenius equation',
          'Catalysis: homogeneous, heterogeneous, enzyme catalysis'
        ],
        done: false
      },
      {
        unit: 'Unit-3',
        name: 'd and f Block Elements',
        bn: 'd এবং f ব্লকের মৌলসমূহ',
        marks: 6,
        hours: 10,
        topics: [
          'General introduction, electronic configuration, occurrence and trends in first-row transition metals',
          'Ionic radii, ionization enthalpy, oxidation states, color, catalytic & magnetic property',
          'Preparation and properties of K₂Cr₂O₇ and KMnO₄',
          'Lanthanoids: electronic config, oxidation states, chemical reactivity, lanthanoid contraction & consequences',
          'Actinoids: electronic config, oxidation states, comparison with lanthanoids'
        ],
        done: false
      },
      {
        unit: 'Unit-4',
        name: 'Coordination Compounds',
        bn: 'জটিল বা কোঅর্ডিনেশন যৌগ (Coordination Compounds)',
        marks: 5,
        hours: 8,
        topics: [
          'Introduction, ligands, classification based on denticity and field intensity',
          'Coordination number, color, magnetic properties and shape',
          'IUPAC nomenclature of mononuclear coordination compounds',
          'EAN rule, Werner’s theory, VBT (Valence Bond Theory) and CFT (Crystal Field Theory)',
          'CFSE, structural isomerism and stereo-isomerism',
          'Importance in qualitative analysis, extraction of metals, biological systems'
        ],
        done: false
      },
      {
        unit: 'Unit-5',
        name: 'Aldehydes, Ketones and Carboxylic Acids',
        bn: 'অ্যালডিহাইড, কিটোন এবং কার্বক্সিলিক অ্যাসিড',
        marks: 5,
        hours: 10,
        topics: [
          'Aldehydes and Ketones: nomenclature, nature of carbonyl group, methods of preparation',
          'Physical and chemical properties, mechanism of nucleophilic addition, reactivity of alpha-hydrogen',
          'Carboxylic Acids: nomenclature, acidic nature, methods of preparation, physical and chemical properties'
        ],
        done: false
      },
      {
        unit: 'Unit-6',
        name: 'Organic Compounds Containing Nitrogen',
        bn: 'নাইট্রোজেনযুক্ত জৈব যৌগ (Amines & Diazonium Salts)',
        marks: 7,
        hours: 14,
        topics: [
          'Nitro compounds: general methods of preparation and reduction reactions',
          'Amines: nomenclature, classification, structure, preparation, physical & chemical properties',
          'Identification of primary, secondary, and tertiary amines',
          'Cyanides and Isocyanides: nomenclature, preparation, chemical reactions',
          'Diazonium salts: preparation, chemical reactions, and synthetic importance in organic chemistry'
        ],
        done: false
      }
    ]
  },
  {
    subject: 'Computer Science',
    color: 'var(--teal)',
    code: 'COMS',
    fullMarks: 35,
    contactHours: 80,
    chapters: [
      {
        unit: 'Unit 1',
        name: 'Database Management System (DBMS)',
        bn: 'ডেটাবেস ম্যানেজমেন্ট সিস্টেম (DBMS & SQL)',
        marks: 20,
        hours: 50,
        topics: [
          'Introduction: Drawbacks of legacy systems, advantages of DBMS',
          'Layered architecture of database, data independence, data models, schemas & instances',
          'Database languages (DDL, DML), Database users, DBA, data dictionary',
          'Entity Relationship (ER) Modelling: entities, attributes, relationships, structural constraints',
          'Keys: Super Key, Candidate Key, Primary Key, Alternate Key',
          'ER diagrams, weak and strong entity sets, specialization, generalization, aggregation',
          'Relational Model: basic concepts of relational model, relational algebra',
          'Integrity Constraints: domain constraints, referential integrity, views',
          'SQL: DDL and DML commands, data types (char, varchar, int, float, date)',
          'Constraints: not null, unique, primary key',
          'Database/Table commands: create, drop, alter, use, describe, show',
          'Record manipulation: insert, delete, select, where, order by, distinct, like, between, in, null handling',
          'Aggregate functions: max, min, avg, sum, count',
          'Clauses: group by, having',
          'Joins: Cartesian product, equi-join, natural join'
        ],
        done: false
      },
      {
        unit: 'Unit 2',
        name: 'Foundation of Artificial Intelligence (AI)',
        bn: 'কৃত্রিম বুদ্ধিমত্তার ভিত্তি (Foundations of AI)',
        marks: 15,
        hours: 30,
        topics: [
          'Introduction: Definition and scope of AI, historical overview and key milestones',
          'Differentiating AI from human intelligence',
          'AI Subfields & Technologies: Supervised, unsupervised, and reinforcement learning',
          'Deep learning and neural networks',
          'Natural language processing (NLP) and computer vision',
          'Search as Optimization: Strategies for state space search, data-driven and goal-driven search',
          'Heuristic search: Breadth First Search (BFS), Depth First Search (DFS), A* Search',
          'Applications of AI: Finance (fraud detection, algorithmic trading), Customer service (chatbots), Education (intelligent tutoring systems)',
          'Ethical and Social Implications: Bias and fairness in AI systems, impact on employment and workforce, AI and social inequality'
        ],
        done: false
      }
    ]
  },
  {
    subject: 'Biological Science',
    color: 'var(--lime)',
    code: 'BIOS',
    fullMarks: 35,
    contactHours: 60,
    chapters: [
      {
        unit: 'UNIT-VIII',
        name: 'Human Health and Diseases',
        bn: 'মানব স্বাস্থ্য ও রোগব্যাধি',
        marks: 20,
        hours: 13,
        topics: [
          'Basic concept of immunology, immune system, antigen, antibody, antigen-antibody reaction',
          'Types of immunity, vaccines and vaccinations',
          'Pathogens & parasites: Malaria, Filariasis, Chikungunya, Dengue, Ascariasis, Typhoid, Pneumonia, Common Cold, Amoebiasis, Ringworm, SARS (COVID)',
          'Allergy and Autoimmune disorders',
          'Cancer, HIV and AIDS: symptoms, causative agents, transmission, preventive measures',
          'Adolescence: Drug and alcohol abuse'
        ],
        done: false
      },
      {
        unit: 'UNIT-VIII',
        name: 'Improvement in Food Production & Microbes',
        bn: 'খাদ্য উৎপাদনে উন্নতি ও মানব কল্যাণে অণুজীব',
        marks: 20,
        hours: 7,
        topics: [
          'Plant breeding, tissue culture, Single Cell Protein (SCP)',
          'Microbes in food processing, industrial production, sewage treatment, energy generation (biogas)',
          'Microbes as bio-control agents and biofertilizers',
          'Antibiotics: production and judicious use'
        ],
        done: false
      },
      {
        unit: 'UNIT-IX',
        name: 'Biotechnology and its Applications',
        bn: 'বায়োটেকনোলজি ও তার প্রয়োগ',
        marks: 15,
        hours: 15,
        topics: [
          'Principle and process of genetic engineering (Recombinant DNA technology)',
          'Application of biotechnology in health and agriculture',
          'Human insulin and vaccine production, stem cell therapy, gene therapy',
          'Genetically modified organisms: Bt Crops, Transgenic animals',
          'Biosafety issues, biopiracy and patents'
        ],
        done: false
      },
      {
        unit: 'UNIT-X',
        name: 'Ecology and Environment',
        bn: 'বাস্তুবিদ্যা ও পরিবেশ (Ecology & Environment)',
        marks: 23,
        hours: 23,
        topics: [
          'Organisms and Populations: meaning of environment, habitat and niche',
          'Population interactions: Mutualism, Competition, Predation, Parasitism',
          'Population attributes: growth, birth rate, death rate, age distribution',
          'Ecosystem: pattern, productivity, decomposition, energy flow, ecological pyramids, ecological succession',
          'Biodiversity: concept, patterns, importance, loss of biodiversity, conservation (Hotspots, Red Data book, sacred groves, biosphere reserves, sanctuaries, Ramsar sites)',
          'Environmental issues: solid waste, radioactive waste management, success stories (Chipko movement, DGSM Silent Valley, Amrita Devi Bishnoi)'
        ],
        done: false
      }
    ]
  },
  {
    subject: 'Bengali A',
    color: 'var(--peach)',
    code: 'BNGA',
    fullMarks: 40,
    contactHours: 60,
    chapters: [
      {
        unit: 'গল্প',
        name: 'হলুদ পোঁড়া ও হারুণ সালেমের মাসি',
        bn: 'ছোটগল্প (হলুদ পোঁড়া ও হারুণ সালেমের মাসি)',
        marks: 5,
        hours: 10,
        topics: [
          'হলুদ পোঁড়া — মানিক বন্দ্যোপাধ্যায় (বিষয়বস্তু, চরিত্র, মনস্তত্ত্ব ও সমাজবাস্তবতা)',
          'হারুণ সালেমের মাসি — মহাশ্বেতা দেবী (আঞ্চলিক পটভূমি, প্রতিবাদ ও মানবিক সংকট)'
        ],
        done: false
      },
      {
        unit: 'কবিতা',
        name: 'প্রার্থনা, তিমির হননের গান ও কেন এলনা',
        bn: 'কবিতা সংকলন (প্রার্থনা, তিমির হননের গান, কেন এলনা)',
        marks: 5,
        hours: 9,
        topics: [
          'প্রার্থনা — রবীন্দ্রনাথ ঠাকুর (আধ্যাত্মিক ব্যাকুলতা ও ভাবসত্য)',
          'তিমির হননের গান — জীবনানন্দ দাশ (ইতিহাসচেতনা, অস্তিত্ব সংকট ও আলোর অন্বেষণ)',
          'কেন এলনা — সুভাষ মুখোপাধ্যায় (গণমুখী চেতনা, বিপ্লব ও সামাজিক আকুতি)'
        ],
        done: false
      },
      {
        unit: 'নাটক',
        name: 'নানা রঙের দিন',
        bn: 'নাটক: নানা রঙের দিন (অজিতেশ বন্দ্যোপাধ্যায়)',
        marks: 5,
        hours: 6,
        topics: [
          'নানা রঙের দিন — অজিতেশ বন্দ্যোপাধ্যায়',
          'রজনীকান্ত চট্টোপাধ্যায়ের জীবনের ট্র্যাজেডি, নাট্যপ্রেম, স্মৃতিচারণ ও মঞ্চজীবন',
          'কালীনাথ সেনের ভূমিকা ও একাকীত্বের গভীর দ্বন্দ্ব'
        ],
        done: false
      },
      {
        unit: 'পূর্ণাঙ্গ সহায়ক গ্রন্থ',
        name: 'ডাকঘর',
        bn: 'পূর্ণাঙ্গ সহায়ক নাটক: ডাকঘর (রবীন্দ্রনাথ ঠাকুর)',
        marks: 10,
        hours: 15,
        topics: [
          'ডাকঘর — রবীন্দ্রনাথ ঠাকুর',
          'অমল চরিত্র: তার জানালার ধারের মুক্তিপিপাসা, অচেনাকে জানার আনন্দ',
          'ঠাকুরদা, মোড়ল, দইওয়ালা, সুধা ও রাজার চিঠি/চিকিৎসকের আগমন রূপক অর্থ'
        ],
        done: false
      },
      {
        unit: 'শিল্প-সাহিত্য-সংস্কৃতি',
        name: 'বাঙালির চিত্রকলা ও চলচ্চিত্র',
        bn: 'বাংলা শিল্প সাহিত্য ও সংস্কৃতির ইতিহাস',
        marks: 5,
        hours: 10,
        topics: [
          'বাংলা চিত্রকলার ইতিহাস সংক্ষিপ্ত রূপরেখা (অবনীন্দ্রনাথ, নন্দলাল বসু, যামিনী রায়, রামকিঙ্কর বেইজ)',
          'বাঙালির চলচ্চিত্রের ইতিহাস সংক্ষিপ্ত রূপরেখা (হীরালাল সেন, প্রমথেশ বড়ুয়া, সত্যজিৎ রায়, ঋত্বিক ঘটক, মৃণাল সেন)'
        ],
        done: false
      },
      {
        unit: 'প্রবন্ধ রচনা',
        name: 'প্রস্তাবনা ও তথ্যভিত্তিক প্রবন্ধ রচনা',
        bn: 'উচ্চমাধ্যমিক প্রবন্ধ রচনা',
        marks: 10,
        hours: 10,
        topics: [
          'লেখকের অংশের মূল প্রস্তাবনা বা ভূমিকা অবলম্বনে প্রবন্ধ বিস্তার',
          'প্রদত্ত সূত্র ও তথ্য (মানস মানচিত্র/জীবনী/সমসাময়িক বিজ্ঞান ও সমাজ) অবলম্বনে সম্পূর্ণ প্রবন্ধ রচনা'
        ],
        done: false
      }
    ]
  },
  {
    subject: 'English B',
    color: 'var(--teal)',
    code: 'ENGB',
    fullMarks: 40,
    contactHours: 90,
    chapters: [
      {
        unit: 'Unit 1: Prose',
        name: 'Prose Selections',
        bn: 'Prose: Alice in Wonderland & Three Questions',
        marks: 10,
        hours: 10,
        topics: [
          '‘Alice in Wonderland – Down the Rabbit Hole’ by Lewis Carroll (Wonder, curiosity, dream logic)',
          '‘Three Questions’ by Leo Tolstoy (The right time, right person, most important thing; hermit’s wisdom)'
        ],
        done: false
      },
      {
        unit: 'Unit 2: Verse',
        name: 'Poetry Selections',
        bn: 'Verse: Hawk Roosting, Sonnet 73 & The Greenhouse Effect',
        marks: 10,
        hours: 10,
        topics: [
          '‘Hawk Roosting’ by Ted Hughes (Arrogance, natural power, totalitarian nature metaphor)',
          '‘That time of year...’ - Sonnet 73 by William Shakespeare (Aging, autumn imagery, glowing embers, love strengthened)',
          '‘The Greenhouse Effect’ by Carl Dennis (Ecological vulnerability, human responsibility, planetary warmth)'
        ],
        done: false
      },
      {
        unit: 'Unit 3: Drama',
        name: 'Riders to the Sea',
        bn: 'Drama: Riders to the Sea by J.M. Synge',
        marks: 5,
        hours: 20,
        topics: [
          '‘Riders to the Sea’ by J.M. Synge',
          'Maurya’s tragic grief, the relentless cruelty of the sea, Irish island life, dignity in loss'
        ],
        done: false
      },
      {
        unit: 'Unit 4: Grammar',
        name: 'Non-Textual Grammar',
        bn: 'Non-Textual Grammar & Transformation',
        marks: 5,
        hours: 20,
        topics: [
          'Synthesis and Splitting of Sentences',
          'Change of Narration (Direct to Indirect reporting)',
          'Correction of Errors',
          'Fill in the blanks to report a paragraph or conversation'
        ],
        done: false
      },
      {
        unit: 'Unit 5: Writing',
        name: 'Writing Skills & Projects',
        bn: 'Writing: Essay, Email, Blog & ALS Project',
        marks: 10,
        hours: 30,
        topics: [
          'Essay Writing (150 words)',
          'Drafting Email (75 words)',
          'Blog Writing (75 words)',
          'Project & Assessment of Listening and Speaking (ALS) (20 Marks)'
        ],
        done: false
      }
    ]
  }
]

export const NOTES = [
  {
    id: 'phys-1',
    subject: 'Physics',
    title: 'Lens Maker’s Formula & Wave Optics',
    bn: 'লেন্স মেকার্স সূত্র ও হাইগেনসের নীতি',
    points: [
      'Lens Maker’s Formula: 1/f = (μ - 1)(1/R₁ - 1/R₂). Converging in air turns diverging if medium index > lens index.',
      'Young’s Double Slit fringe width β = (λD)/d. Maxima condition: Δx = nλ, Minima: Δx = (2n - 1)λ/2.',
      'Brewster’s Law: tan(i_p) = μ. At Brewster angle, reflected light is 100% plane-polarized perpendicular to incident plane.'
    ]
  },
  {
    id: 'chem-1',
    subject: 'Chemistry',
    title: 'Electrochemistry & Chemical Kinetics',
    bn: 'তড়িৎ রসায়ন ও রাসায়নিক গতিবিদ্যা',
    points: [
      'Nernst Equation: E_cell = E°_cell - (0.0591/n) log Q at 298 K. ΔG° = -nFE°_cell.',
      'Integrated First Order Rate: k = (2.303/t) log([A]₀/[A]). Half-life t₁/₂ = 0.693/k, completely independent of initial concentration.',
      'Lanthanoid Contraction causes Zr and Hf to have nearly identical atomic radii (0.160 nm vs 0.159 nm).'
    ]
  },
  {
    id: 'math-1',
    subject: 'Mathematics',
    title: 'Vectors, Skew Lines & Standard Integrals',
    bn: 'ভেক্টর, স্কিউ সরলরেখা ও বিশেষ সমাকলন',
    points: [
      'Shortest distance between skew lines r = a₁ + λb₁ and r = a₂ + μb₂ is d = |(a₂ - a₁) · (b₁ × b₂)| / |b₁ × b₂|.',
      'Integration formula: ∫ dx/(x² + a²) = (1/a) tan⁻¹(x/a) + C; ∫ dx/√(a² - x²) = sin⁻¹(x/a) + C.',
      'Linear Diff Eq: dy/dx + Py = Q solved via Integrating Factor IF = e^(∫ P dx); y · IF = ∫ (Q · IF) dx + C.'
    ]
  },
  {
    id: 'coms-1',
    subject: 'Computer Science',
    title: 'DBMS Keys, Normalization & SQL Queries',
    bn: 'DBMS কী (Keys), রিলেশনাল অ্যালজেব্রা ও SQL',
    points: [
      'Primary Key uniquely identifies a record and CANNOT contain NULL values. Candidate keys are minimal super keys.',
      'Referential Integrity: Foreign key in child table must match a valid primary key in parent table or be null.',
      'SQL Group By & Having: HAVING filters groups after aggregation, while WHERE filters individual rows before grouping.'
    ]
  },
  {
    id: 'bio-1',
    subject: 'Biological Science',
    title: 'Recombinant DNA & Monoclonal Antibodies',
    bn: 'রিকম্বিন্যান্ট DNA প্রযুক্তি ও প্রতিরোধ ব্যবস্থা',
    points: [
      'Recombinant DNA technology uses restriction endonucleases (molecular scissors) to produce sticky ends and DNA ligase to seal genes into plasmids.',
      'Human insulin (Humulin) was synthesized by Eli Lilly using separate A and B chains in E. coli linked via disulfide bonds.',
      'Humoral immunity involves B-lymphocytes producing antibodies (IgG, IgA, IgM, IgE, IgD), while cell-mediated immunity is driven by T-lymphocytes.'
    ]
  },
  {
    id: 'ben-1',
    subject: 'Bengali A',
    title: 'হলুদ পোঁড়া ও ডাকঘর ভাববস্তু',
    bn: 'হলুদ পোঁড়া ও ডাকঘর — মূল ভাবনা ও চরিত্রায়ন',
    points: [
      'মানিক বন্দ্যোপাধ্যায়ের ‘হলুদ পোঁড়া’: সামাজিক কুসংস্কার, ভীতি ও মানুষের অন্তর্জগতের অবচেতন সংঘাতের বাস্তব চিত্র।',
      'রবীন্দ্রনাথ ঠাকুরের ‘ডাকঘর’: অমল শারীরিক অসুস্থতায় গৃহবন্দী হলেও তার মন মুক্ত দিগন্তের সন্ধানী; রাজার চিঠি ও পরলোকযাত্রার রূপক মুক্তি।',
      'অজিতেশ বন্দ্যোপাধ্যায়ের ‘নানা রঙের দিন’: মঞ্চের আলোকোজ্জ্বল অতীতের বিপরীতে একাকী বৃদ্ধ অভিনেতা রজনীকান্তের অন্তর্বেদনা।'
    ]
  },
  {
    id: 'eng-1',
    subject: 'English B',
    title: 'Three Questions & Hawk Roosting',
    bn: 'Three Questions & Hawk Roosting Analysis',
    points: [
      'Leo Tolstoy’s ‘Three Questions’: The most important time is NOW, the most important person is the one you are with, and the most important deed is to do them good.',
      'Ted Hughes’s ‘Hawk Roosting’: Monologue of ruthless supreme authority; the hawk embodies pure nature without moral dilemma or repentance.',
      'J.M. Synge’s ‘Riders to the Sea’: Maurya’s stoic resignation ("No man at all can be living forever, and we must be satisfied").'
    ]
  }
]

export const FLASHCARDS = [
  { q: 'What is Lens Maker’s Formula?', a: '1/f = (μ - 1)(1/R₁ - 1/R₂). It relates focal length, refractive index, and radii of curvature.', subject: 'Physics' },
  { q: 'Einstein Photoelectric equation?', a: 'hν = Φ₀ + (1/2)m v_max², where Φ₀ is the work function.', subject: 'Physics' },
  { q: 'Nernst equation at 298 K?', a: 'E_cell = E°_cell - (0.0591/n) log Q.', subject: 'Chemistry' },
  { q: 'Half-life for first order kinetics?', a: 't₁/₂ = 0.693 / k. It is independent of the initial reactant concentration.', subject: 'Chemistry' },
  { q: 'Shortest distance between two skew lines?', a: 'd = |(a₂ - a₁) · (b₁ × b₂)| / |b₁ × b₂|.', subject: 'Mathematics' },
  { q: 'In Tolstoy’s Three Questions, who gives the true answers?', a: 'The wise hermit living in the woods through practical living acts.', subject: 'English B' },
  { q: '‘ডাকঘর’ নাটকে অমল সুধাকে কী আনতে বলেছিল?', a: 'বন থেকে ফুল তুলে এনে দিতে বলেছিল।', subject: 'Bengali A' },
  { q: 'Primary Key in DBMS rules?', a: 'Unique values only, cannot contain NULL, one primary key per table.', subject: 'Computer Science' },
  { q: 'Bt toxin mechanism in insects?', a: 'Alkaline pH in insect gut activates protoxin, creating pores in midgut epithelial cells causing lysis.', subject: 'Biological Science' }
]

export const BANK = [
  {
    id: 1,
    subject: 'Physics',
    q: 'At Brewster angle of incidence i_p, the angle between reflected and refracted rays is',
    options: ['45°', '90°', '180°', '0°'],
    ans: 1,
    why: 'By Brewster law, reflected and refracted rays are perpendicular (i_p + r = 90°).',
    bn: 'ব্রুস্টার কোণে প্রতিফলিত ও প্রতিসৃত রশ্মির অন্তর্ভুক্ত কোণ ৯০°।'
  },
  {
    id: 2,
    subject: 'Chemistry',
    q: 'The unit of rate constant for a zero order reaction is',
    options: ['s⁻¹', 'mol L⁻¹ s⁻¹', 'L mol⁻¹ s⁻¹', 'L² mol⁻² s⁻¹'],
    ans: 1,
    why: 'Rate = k [A]⁰ = k, so unit of k = unit of rate = mol L⁻¹ s⁻¹.',
    bn: 'শূন্য ক্রমের বিক্রিয়ার হার ধ্রুবকের একক mol L⁻¹ s⁻¹।'
  },
  {
    id: 3,
    subject: 'Mathematics',
    q: 'The value of ∫ dx / (x² + 16) is',
    options: ['(1/4) tan⁻¹(x/4) + C', 'tan⁻¹(x/4) + C', '(1/16) tan⁻¹(x/16) + C', 'ln|x² + 16| + C'],
    ans: 0,
    why: 'Using standard integral ∫ dx/(x² + a²) = (1/a) tan⁻¹(x/a) + C with a = 4.',
    bn: 'আদর্শ সমাকলন সূত্রানুসারে উত্তর (1/4) tan⁻¹(x/4) + C।'
  },
  {
    id: 4,
    subject: 'English B',
    q: 'In ‘Three Questions’, the bearded wounded man had intended to kill the king because',
    options: ['The king levied taxes', 'The king executed his brother and seized his property', 'The king imprisoned him', 'He was a bandit'],
    ans: 1,
    why: 'The king had executed his brother and confiscated his property in a previous war.',
    bn: 'রাজা তার ভাইকে মৃত্যুদণ্ড দিয়েছিলেন ও সম্পত্তি বাজেয়াপ্ত করেছিলেন।'
  },
  {
    id: 5,
    subject: 'Bengali A',
    q: '‘ডাকঘর’ নাটকে অমল কোন স্থানটির ডাকহরকরার স্বপ্ন দেখত?',
    options: ['কলিকাতা', 'রাজার নতুন ডাকঘর', 'শামলী নদীপাড়', 'কাঞ্চনজঙ্ঘা'],
    ans: 1,
    why: 'অমল রাজার নতুন ডাকঘরের চিঠি বহনকারী হওয়ার ব্যাকুল স্বপ্ন দেখত।',
    bn: 'অমল রাজার ডাকঘর থেকে চিঠি পাওয়ার ও ডাকহরকরা হওয়ার স্বপ্ন দেখত।'
  },
  {
    id: 6,
    subject: 'Computer Science',
    q: 'Which SQL clause is used to filter groups created by GROUP BY?',
    options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'],
    ans: 1,
    why: 'HAVING is applied after grouping to filter aggregate results, whereas WHERE filters before grouping.',
    bn: 'গ্রুপ ফিল্টার করার জন্য HAVING ক্লজ ব্যবহৃত হয়।'
  }
]

export const FORMULAS = [
  { sub: 'Physics', name: 'Lens Maker’s Formula', body: '1/f = (μ - 1)(1/R₁ - 1/R₂)' },
  { sub: 'Physics', name: 'de Broglie wavelength', body: 'λ = h / p = h / √(2mE)' },
  { sub: 'Chemistry', name: 'Nernst Equation', body: 'E = E° - (RT/nF) ln Q = E° - (0.0591/n) log Q' },
  { sub: 'Chemistry', name: 'Arrhenius Equation', body: 'k = A · e^(-Ea / RT)' },
  { sub: 'Math', name: 'Shortest Distance (Skew Lines)', body: 'd = |(a₂ - a₁) · (b₁ × b₂)| / |b₁ × b₂|' },
  { sub: 'Math', name: 'Special Integral', body: '∫ dx/√(a² - x²) = sin⁻¹(x/a) + C' },
  { sub: 'Biology', name: 'Logistic Growth', body: 'dN/dt = rN(1 - N/K)' }
]

export const NOTICES = [
  { date: '15 Oct 2026', title: 'WBCHSE Class 12 Semester 4 Official Syllabus & Pattern', type: 'Syllabus' },
  { date: '28 Oct 2026', title: 'Semester 4 Project & Practical Guidelines (PHYS, CHEM, BIOS, COMS)', type: 'Notice' },
  { date: '01 Nov 2026', title: 'Model Question Pattern — Semester 4 SAQ + DQ Framework', type: 'Paper' },
  { date: '05 Nov 2026', title: 'Semester 4 Final Board Routine (Provisional)', type: 'Routine' }
]

export const FAQ = [
  { q: 'What is the syllabus scope in Study Stranger Pro?', a: '100% West Bengal Board (WBCHSE) Class 12 Semester 4 — covering Bengali A, English B, Mathematics, Physics, Chemistry, Computer Science/Applications & Biology.' },
  { q: 'How does the Math Lab (LaTeX) solver work?', a: 'You can type formulas or upload photos of test papers with one or multiple questions. The AI identifies every question and delivers forward sequential step-by-step LaTeX solutions with printable Answer Key PDFs.' },
  { q: 'How many free Math Lab problems can I solve?', a: 'You get 5 free solves powered by the Admin API key. After 5 solves, simply enter your own free Google Gemini API key from Settings for unlimited solves!' },
  { q: 'Are voice mentors trained on Semester 4 topics?', a: 'Yes! Stranger Dada, Mahi Didi, Anjali Didi, and Rohan Dada focus strictly on the official Semester 4 chapters, equations, and literature.' },
  { q: 'Can I export answer sheets and study materials?', a: 'Yes, 1-click high-resolution PDF download is available for all Math Lab solutions, revision notes, and model test papers.' }
]

export const QUOTES = [
  { name: 'Sayan, HS Science (Sem 4)', text: 'The Semester 4 Math Lab with step-by-step LaTeX and vector distance formulas cleared my 3D geometry doubts completely!' },
  { name: 'Priyanka, HS Arts (Sem 4)', text: 'Mahi Didi helped me master ‘ডাকঘর’ and ‘হলুদ পোঁড়া’ with high-scoring 5-mark answer structures in pure Bengali.' },
  { name: 'Sourav, HS Computer Science (Sem 4)', text: 'Having SQL joins, ER models and AI search algorithms right in the revision notes and mock tests made Sem 4 effortless.' }
]

export function loadStore() {
  try {
    return JSON.parse(localStorage.getItem('ss-store') || '{}')
  } catch {
    return {}
  }
}

export function saveStore(partial) {
  const next = { ...loadStore(), ...partial }
  localStorage.setItem('ss-store', JSON.stringify(next))
  return next
}
