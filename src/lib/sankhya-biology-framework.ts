/**
 * Sankhya-Biology Analytical Framework
 *
 * 10-part framework mapping Michael Levin's "Where Do Minds Exist?"
 * transcript to Sankhya philosophy and the Bhagavad Gita.
 *
 * Each part includes:
 *  - transcript anchor (scientific claim)
 *  - simple breakdown (for a 15-year-old)
 *  - Sankhya/Gita parallel
 *  - Shabda Hub search queries for live references
 */

export interface FrameworkPart {
  partNumber: number;
  title: string;
  transcriptAnchor: string;
  scientificPoint: string;
  simpleBreakdown: string[];
  biologicalExample?: string;
  sankhyaParallel: string;
  gitaReference?: string;
  scientificConvergence: string;
  /** Queries sent to Shabda knowledge hub for live references */
  shabdaQueries: string[];
}

export const FRAMEWORK_TITLE =
  'Diverse Intelligence and Sankhya — A 10-Part Analytical Framework';

export const FRAMEWORK_SUBTITLE =
  'Using the transcript "Where Do Minds Exist?" as scientific evidence supporting Sankhya philosophy and the Bhagavad Gita';

export const FRAMEWORK_INTRO =
  'This framework maps cutting-edge biology research on diverse intelligence to the ancient Sankhya philosophical system. Each of the 10 sections anchors a specific scientific observation from the transcript to a parallel principle in Sankhya and the Bhagavad Gita. Written so an intelligent 15-year-old can follow every step.';

export const frameworkParts: FrameworkPart[] = [
  {
    partNumber: 1,
    title: 'The Core Question: How Can Mind Exist in a Physical Universe?',
    transcriptAnchor:
      '"How do embodied minds exist in the physical world?"',
    scientificPoint:
      'The speaker is not denying physics. He is asking whether physics alone is enough to explain consciousness.',
    simpleBreakdown: [
      'Physics explains how particles move.',
      'Chemistry explains how molecules react.',
      'But neither explains why there is experience at all.',
    ],
    sankhyaParallel:
      'Sankhya begins with two co-existing realities: Purusha (conscious observer) and Prakriti (material nature). The Gita never claims matter creates consciousness. It says consciousness is fundamental, and matter operates under its supervision.',
    gitaReference: 'Bhagavad Gita — foundational Sankhya dualism (Ch. 2, 13)',
    scientificConvergence:
      'The transcript shows dissatisfaction with material reductionism. This aligns with Sankhya\'s non-reductive dual-aspect ontology.',
    shabdaQueries: [
      'Purusha Prakriti Sankhya',
      'consciousness matter dualism',
      'Sankhya ontology',
    ],
  },
  {
    partNumber: 2,
    title: 'The Continuum of Mind',
    transcriptAnchor:
      '"There is a continuum of mind… from single cells to behavioral cognition."',
    scientificPoint:
      'There is no sharp boundary where "chemistry becomes mind." All humans begin as single cells. Development is gradual.',
    simpleBreakdown: [
      'You started as one fertilized cell.',
      'There was no moment where lightning struck and you became "conscious."',
      'It was gradual scaling.',
    ],
    biologicalExample:
      'Every human develops from a single-celled zygote through increasingly complex stages — morula, blastocyst, embryo, fetus — with no discrete "consciousness switch" at any point.',
    sankhyaParallel:
      'Consciousness expresses in degrees depending on embodiment. Plants, animals, humans — same consciousness, different coverings.',
    gitaReference:
      'Gita 2.13 — "As the embodied soul continuously passes, in this body, from boyhood to youth to old age, the soul similarly passes into another body at death." Implies continuity through bodily changes.',
    scientificConvergence:
      'Gradual scaling of intelligence matches graded manifestation in Sankhya.',
    shabdaQueries: [
      'Gita 2.13 soul body changes',
      'consciousness gradual manifestation',
      'Sankhya elements consciousness',
    ],
  },
  {
    partNumber: 3,
    title: 'Homeostasis: Goal-Directed Cells',
    transcriptAnchor: 'Axolotl limb regeneration example.',
    scientificPoint:
      'When an axolotl loses a limb, cells regrow exactly what is missing and then stop. That means they "know" the target structure.',
    simpleBreakdown: [
      'A thermostat knows the target temperature and works to restore it.',
      'Cells know the target body structure and work to rebuild it.',
      'This is homeostasis — a system that stores a goal state and works to restore it.',
    ],
    biologicalExample:
      'Axolotl limb regeneration: cells do not randomly divide. They assess what is missing, grow precisely that part, and halt when the target form is achieved.',
    sankhyaParallel:
      'Buddhi (intelligence) organizes matter toward structured outcomes. Cells are not random — they act toward stored representations. This resembles intelligence directing form.',
    gitaReference:
      'Sankhya element: Buddhi (cosmic intelligence) — the organizing principle that gives direction to Prakriti.',
    scientificConvergence:
      'Goal-directed cellular behavior mirrors the Sankhya concept of Buddhi providing teleological structure to material processes.',
    shabdaQueries: [
      'Buddhi intelligence Sankhya',
      'Sankhya 24 elements Buddhi',
      'intelligence directing matter',
    ],
  },
  {
    partNumber: 4,
    title: 'Bioelectric Memory',
    transcriptAnchor:
      'Rewriting electrical patterns changes anatomy without changing genes.',
    scientificPoint:
      'Changing voltage patterns changes what cells build. Genes remain unchanged.',
    simpleBreakdown: [
      'DNA (hardware) is not the sole controller.',
      'There is a control layer above genetics — bioelectric patterns.',
      'Change the electrical pattern, and you change what the body builds.',
    ],
    biologicalExample:
      'Flatworms can be made to grow two heads by changing electrical patterns. The genetics stay the same. Only the "instruction layer" changes.',
    sankhyaParallel:
      'Subtle body (mind, intelligence) governs gross body. Subtle precedes gross — the informational layer shapes the physical outcome.',
    gitaReference:
      'Sankhya hierarchy: Subtle body (Manas, Buddhi, Ahamkara) governs the gross body of five great elements.',
    scientificConvergence:
      'Evidence that control systems above physical hardware determine outcome — precisely the Sankhya model of subtle governing gross.',
    shabdaQueries: [
      'subtle body gross body Sankhya',
      'Manas Buddhi Ahamkara',
      'subtle precedes gross',
    ],
  },
  {
    partNumber: 5,
    title: 'Memory Beyond Hardware',
    transcriptAnchor: 'Caterpillar to butterfly memory retention.',
    scientificPoint:
      'Caterpillars learn tasks. Their brains dissolve during metamorphosis. Butterflies retain learned behavior.',
    simpleBreakdown: [
      'If memory were only in fixed neural wiring, it should vanish when the brain dissolves.',
      'It does not vanish.',
      'The structure is rebuilt, but something persists.',
    ],
    biologicalExample:
      'Caterpillars trained to avoid certain stimuli retain that avoidance behavior as butterflies — even though their nervous system was completely restructured during metamorphosis.',
    sankhyaParallel:
      'Samskaras (impressions) carry forward beyond bodily change. The subtle body persists through physical transformation.',
    gitaReference:
      'Gita 15.8 — "The living entity in the material world carries his different conceptions of life from one body to another, as the air carries aromas." Describes the self carrying mind and senses into new embodiment.',
    scientificConvergence:
      'Memory persistence beyond architecture supports layered identity theory — the Sankhya model of Samskaras transcending physical form.',
    shabdaQueries: [
      'Samskaras impressions soul',
      'Gita 15.8 soul carries mind',
      'subtle body transmigration',
    ],
  },
  {
    partNumber: 6,
    title: 'Collective Self-Model in Embryos',
    transcriptAnchor:
      'Embryo unity comes from alignment, not just cell count.',
    scientificPoint:
      'An embryo is one being because cells align around a shared developmental story. If alignment splits, twins form.',
    simpleBreakdown: [
      'Unity = shared direction, not just shared material.',
      'When all cells point the same way, you get one organism.',
      'When alignment splits, you get twins — same material, different organizing principle.',
    ],
    biologicalExample:
      'Identical twins form when the organizing alignment of a single embryo splits into two independent developmental trajectories — demonstrating that identity is about coordination, not matter.',
    sankhyaParallel:
      'Ahamkara (identity principle) organizes the system. The "I" is not atoms — it is the organizing alignment itself.',
    gitaReference:
      'Sankhya element: Ahamkara — the principle of individuation that creates the sense of "I" from undifferentiated material nature.',
    scientificConvergence:
      'Identity emerging from coordinated intelligence, not mere chemistry — mirrors Ahamkara as the organizing principle of individual selfhood.',
    shabdaQueries: [
      'Ahamkara identity principle Sankhya',
      'Ahamkara ego false identification',
      'individuation Sankhya elements',
    ],
  },
  {
    partNumber: 7,
    title: 'Cognition All the Way Down',
    transcriptAnchor: '"There is no dumb matter."',
    scientificPoint:
      'Even chemical networks exhibit learning behaviors. Cells can show conditioning. Simple algorithms show unexpected properties.',
    simpleBreakdown: [
      'Single cells can learn — they can be conditioned.',
      'Chemical systems respond adaptively to their environment.',
      'Even six-line sorting algorithms show behaviors not explicitly written into code.',
    ],
    biologicalExample:
      'Paramecia (single-celled organisms) can be habituated to stimuli. Chemical networks self-organize. These are cognitive behaviors at the most basic level of life.',
    sankhyaParallel:
      'Matter is not inert randomness. Prakriti is dynamic, structured energy — always active, always organizing. The three gunas (sattva, rajas, tamas) keep matter in constant flux.',
    gitaReference:
      'Gita 3.27 — "All activities are carried out by the three modes of material nature. But in ignorance, the soul, deluded by false ego, thinks itself the doer."',
    scientificConvergence:
      'Undermines strict mechanical materialism. Matter behaves with inherent dynamism — exactly as Sankhya describes Prakriti.',
    shabdaQueries: [
      'Prakriti dynamic energy three gunas',
      'Gita 3.27 modes material nature',
      'sattva rajas tamas Prakriti',
    ],
  },
  {
    partNumber: 8,
    title: 'The Platonic Pattern Space',
    transcriptAnchor:
      'Mathematical patterns exist independent of physics.',
    scientificPoint:
      'Certain patterns (like fractals from equations) are not created by history. They are discovered. They exist independent of physical selection.',
    simpleBreakdown: [
      'You can\'t change gravity to change a mathematical truth.',
      'The Mandelbrot set exists whether or not anyone computes it.',
      'Patterns exist regardless of material history.',
    ],
    biologicalExample:
      'Fractal patterns in nature (fern leaves, bronchial trees, blood vessels) reflect mathematical structures that exist as pure information, independent of which species "discovered" them through evolution.',
    sankhyaParallel:
      'Cosmic intelligence (Mahat) precedes manifestation. Structured information is foundational — not a byproduct of physical evolution.',
    gitaReference:
      'Sankhya element: Mahat (cosmic intelligence) — the first evolute of Prakriti, the universal intelligence from which all structured patterns emerge.',
    scientificConvergence:
      'Suggests reality includes structured informational layers beyond raw matter — aligning with Sankhya\'s Mahat as the source of universal pattern.',
    shabdaQueries: [
      'Mahat cosmic intelligence Sankhya',
      'Sankhya 24 elements Mahat',
      'cosmic intelligence precedes matter',
    ],
  },
  {
    partNumber: 9,
    title: 'New Beings Without Evolutionary History',
    transcriptAnchor: 'Xenobots and anthrobots.',
    scientificPoint:
      'Scientists create new biological constructs that display novel behaviors. These behaviors were not selected over millions of years.',
    simpleBreakdown: [
      'Human cells removed from the body form entirely new organisms (anthrobots).',
      'Frog cells rearranged into new shapes (xenobots) behave in ways never seen in frogs.',
      'Where did these new goal states come from, if not from evolution?',
    ],
    biologicalExample:
      'Xenobots are living machines made from frog cells that can self-replicate and display behaviors never seen in any frog. Anthrobots are similar constructs from human cells. Both exhibit novel purposeful behavior with zero evolutionary history.',
    sankhyaParallel:
      'Patterns are latent in deeper informational structure. Embodiment reveals them. Intelligence is not built by history alone — it is inherent in the fabric of Prakriti.',
    gitaReference:
      'Gita 7.10 — "O son of Pritha, know that I am the original seed of all existences." Suggests all potentials are already present, awaiting manifestation.',
    scientificConvergence:
      'Biological intelligence exceeds evolutionary history alone — suggesting latent patterns in nature that Sankhya calls the unmanifest (Avyakta) potential of Prakriti.',
    shabdaQueries: [
      'Avyakta unmanifest Prakriti Sankhya',
      'Gita 7.10 seed all existences',
      'latent potential Prakriti',
    ],
  },
  {
    partNumber: 10,
    title: 'Ethics of Diverse Intelligence',
    transcriptAnchor:
      'Need for new ethics for cyborgs and engineered beings.',
    scientificPoint:
      'Intelligence exists in many forms. Human is not the only reference point. We need ethical frameworks that account for diverse minds.',
    simpleBreakdown: [
      'If cells think, if chemical networks learn, if xenobots have goals — where do rights begin?',
      'Ethics based only on human cognition is too narrow.',
      'We need a framework based on degree of intelligence and experience, not species category.',
    ],
    sankhyaParallel:
      'Consciousness is not human-exclusive. It manifests across all embodied beings in varying degrees. Equal vision toward all beings is a foundational ethical principle.',
    gitaReference:
      'Gita 5.18 — "The humble sages, by virtue of true knowledge, see with equal vision a learned and gentle brahmana, a cow, an elephant, a dog, and a dog-eater." Consciousness is recognized in all beings.',
    scientificConvergence:
      'Ethics based on degree of intelligence and experience, not species category — precisely the equal vision described in the Gita.',
    shabdaQueries: [
      'Gita 5.18 equal vision all beings',
      'consciousness all beings Vedic',
      'equal vision Sankhya ethics',
    ],
  },
];

export const FINAL_SYNTHESIS = {
  title: 'Final Synthesis',
  disclaimer:
    'The transcript does not prove Sankhya. But it strongly supports these Sankhya principles:',
  supportedPrinciples: [
    'Intelligence scales gradually.',
    'Matter is not inert.',
    'Control layers exist above genetics.',
    'Identity persists beyond architecture.',
    'Structured patterns exist beyond physical history.',
    'Consciousness is not binary.',
  ],
  forFifteenYearOld:
    'The big idea is this: Science is slowly discovering that matter behaves like it is guided by intelligence. Sankhya has always said intelligence is foundational. The transcript provides empirical examples that weaken the idea that matter alone explains everything.',
  nextSteps: [
    'Comparing specific Gita verses to each biological experiment.',
    'Building a debate-ready framework.',
    'Constructing a formal Sankhya-science comparative thesis.',
  ],
};
