-- ============================================================
-- Sankhya-Biology Analytical Framework Schema
-- ============================================================
-- Stores the 10-part framework mapping Michael Levin's
-- "Where Do Minds Exist?" transcript to Sankhya philosophy
-- and the Bhagavad Gita. Designed for the Yoga of Intelligence
-- portal with Shabda knowledge hub cross-references.
-- ============================================================

-- ============================================================
-- 1. FRAMEWORK TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS yoi_frameworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. FRAMEWORK PARTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS yoi_framework_parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  framework_id UUID NOT NULL REFERENCES yoi_frameworks(id) ON DELETE CASCADE,
  part_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  transcript_anchor TEXT NOT NULL,
  scientific_point TEXT NOT NULL,
  simple_breakdown TEXT[] NOT NULL DEFAULT '{}',
  biological_example TEXT,
  sankhya_parallel TEXT NOT NULL,
  gita_reference TEXT,
  scientific_convergence TEXT NOT NULL,
  shabda_queries TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (framework_id, part_number)
);

-- ============================================================
-- 3. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_yoi_framework_parts_framework
  ON yoi_framework_parts(framework_id, part_number);
CREATE INDEX IF NOT EXISTS idx_yoi_frameworks_slug
  ON yoi_frameworks(slug);

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE yoi_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE yoi_framework_parts ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view published frameworks
CREATE POLICY "Anyone authenticated can view published frameworks"
  ON yoi_frameworks FOR SELECT
  USING (status = 'published' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage frameworks"
  ON yoi_frameworks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM yoi_users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can view framework parts"
  ON yoi_framework_parts FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage framework parts"
  ON yoi_framework_parts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM yoi_users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- 5. SEED DATA — Sankhya-Biology Framework
-- ============================================================

INSERT INTO yoi_frameworks (id, slug, title, subtitle, description, status)
VALUES (
  'f0000000-0000-0000-0000-000000000001',
  'sankhya-biology',
  'Diverse Intelligence and Sankhya — A 10-Part Analytical Framework',
  'Using "Where Do Minds Exist?" as scientific evidence supporting Sankhya philosophy and the Bhagavad Gita',
  'This framework maps cutting-edge biology research on diverse intelligence to the ancient Sankhya philosophical system. Each of the 10 sections anchors a specific scientific observation from the transcript to a parallel principle in Sankhya and the Bhagavad Gita. Written so an intelligent 15-year-old can follow every step.',
  'published'
) ON CONFLICT (slug) DO NOTHING;

-- Part 1
INSERT INTO yoi_framework_parts (framework_id, part_number, title, transcript_anchor, scientific_point, simple_breakdown, sankhya_parallel, gita_reference, scientific_convergence, shabda_queries)
VALUES (
  'f0000000-0000-0000-0000-000000000001', 1,
  'The Core Question: How Can Mind Exist in a Physical Universe?',
  '"How do embodied minds exist in the physical world?"',
  'The speaker is not denying physics. He is asking whether physics alone is enough to explain consciousness.',
  ARRAY['Physics explains how particles move.', 'Chemistry explains how molecules react.', 'But neither explains why there is experience at all.'],
  'Sankhya begins with two co-existing realities: Purusha (conscious observer) and Prakriti (material nature). The Gita never claims matter creates consciousness. It says consciousness is fundamental, and matter operates under its supervision.',
  'Bhagavad Gita — foundational Sankhya dualism (Ch. 2, 13)',
  'The transcript shows dissatisfaction with material reductionism. This aligns with Sankhya''s non-reductive dual-aspect ontology.',
  ARRAY['Purusha Prakriti Sankhya', 'consciousness matter dualism', 'Sankhya ontology']
) ON CONFLICT (framework_id, part_number) DO NOTHING;

-- Part 2
INSERT INTO yoi_framework_parts (framework_id, part_number, title, transcript_anchor, scientific_point, simple_breakdown, biological_example, sankhya_parallel, gita_reference, scientific_convergence, shabda_queries)
VALUES (
  'f0000000-0000-0000-0000-000000000001', 2,
  'The Continuum of Mind',
  '"There is a continuum of mind… from single cells to behavioral cognition."',
  'There is no sharp boundary where "chemistry becomes mind." All humans begin as single cells. Development is gradual.',
  ARRAY['You started as one fertilized cell.', 'There was no moment where lightning struck and you became "conscious."', 'It was gradual scaling.'],
  'Every human develops from a single-celled zygote through increasingly complex stages — morula, blastocyst, embryo, fetus — with no discrete "consciousness switch" at any point.',
  'Consciousness expresses in degrees depending on embodiment. Plants, animals, humans — same consciousness, different coverings.',
  'Gita 2.13 — implies continuity through bodily changes.',
  'Gradual scaling of intelligence matches graded manifestation in Sankhya.',
  ARRAY['Gita 2.13 soul body changes', 'consciousness gradual manifestation', 'Sankhya elements consciousness']
) ON CONFLICT (framework_id, part_number) DO NOTHING;

-- Part 3
INSERT INTO yoi_framework_parts (framework_id, part_number, title, transcript_anchor, scientific_point, simple_breakdown, biological_example, sankhya_parallel, gita_reference, scientific_convergence, shabda_queries)
VALUES (
  'f0000000-0000-0000-0000-000000000001', 3,
  'Homeostasis: Goal-Directed Cells',
  'Axolotl limb regeneration example.',
  'When an axolotl loses a limb, cells regrow exactly what is missing and then stop. That means they "know" the target structure.',
  ARRAY['A thermostat knows the target temperature and works to restore it.', 'Cells know the target body structure and work to rebuild it.', 'This is homeostasis — a system that stores a goal state and works to restore it.'],
  'Axolotl limb regeneration: cells do not randomly divide. They assess what is missing, grow precisely that part, and halt when the target form is achieved.',
  'Buddhi (intelligence) organizes matter toward structured outcomes. Cells are not random — they act toward stored representations. This resembles intelligence directing form.',
  'Sankhya element: Buddhi (cosmic intelligence) — the organizing principle that gives direction to Prakriti.',
  'Goal-directed cellular behavior mirrors the Sankhya concept of Buddhi providing teleological structure to material processes.',
  ARRAY['Buddhi intelligence Sankhya', 'Sankhya 24 elements Buddhi', 'intelligence directing matter']
) ON CONFLICT (framework_id, part_number) DO NOTHING;

-- Part 4
INSERT INTO yoi_framework_parts (framework_id, part_number, title, transcript_anchor, scientific_point, simple_breakdown, biological_example, sankhya_parallel, gita_reference, scientific_convergence, shabda_queries)
VALUES (
  'f0000000-0000-0000-0000-000000000001', 4,
  'Bioelectric Memory',
  'Rewriting electrical patterns changes anatomy without changing genes.',
  'Changing voltage patterns changes what cells build. Genes remain unchanged.',
  ARRAY['DNA (hardware) is not the sole controller.', 'There is a control layer above genetics — bioelectric patterns.', 'Change the electrical pattern, and you change what the body builds.'],
  'Flatworms can be made to grow two heads by changing electrical patterns. The genetics stay the same. Only the "instruction layer" changes.',
  'Subtle body (mind, intelligence) governs gross body. Subtle precedes gross — the informational layer shapes the physical outcome.',
  'Sankhya hierarchy: Subtle body (Manas, Buddhi, Ahamkara) governs the gross body of five great elements.',
  'Evidence that control systems above physical hardware determine outcome — precisely the Sankhya model of subtle governing gross.',
  ARRAY['subtle body gross body Sankhya', 'Manas Buddhi Ahamkara', 'subtle precedes gross']
) ON CONFLICT (framework_id, part_number) DO NOTHING;

-- Part 5
INSERT INTO yoi_framework_parts (framework_id, part_number, title, transcript_anchor, scientific_point, simple_breakdown, biological_example, sankhya_parallel, gita_reference, scientific_convergence, shabda_queries)
VALUES (
  'f0000000-0000-0000-0000-000000000001', 5,
  'Memory Beyond Hardware',
  'Caterpillar to butterfly memory retention.',
  'Caterpillars learn tasks. Their brains dissolve during metamorphosis. Butterflies retain learned behavior.',
  ARRAY['If memory were only in fixed neural wiring, it should vanish when the brain dissolves.', 'It does not vanish.', 'The structure is rebuilt, but something persists.'],
  'Caterpillars trained to avoid certain stimuli retain that avoidance behavior as butterflies — even though their nervous system was completely restructured during metamorphosis.',
  'Samskaras (impressions) carry forward beyond bodily change. The subtle body persists through physical transformation.',
  'Gita 15.8 — describes the self carrying mind and senses into new embodiment.',
  'Memory persistence beyond architecture supports layered identity theory — the Sankhya model of Samskaras transcending physical form.',
  ARRAY['Samskaras impressions soul', 'Gita 15.8 soul carries mind', 'subtle body transmigration']
) ON CONFLICT (framework_id, part_number) DO NOTHING;

-- Part 6
INSERT INTO yoi_framework_parts (framework_id, part_number, title, transcript_anchor, scientific_point, simple_breakdown, biological_example, sankhya_parallel, gita_reference, scientific_convergence, shabda_queries)
VALUES (
  'f0000000-0000-0000-0000-000000000001', 6,
  'Collective Self-Model in Embryos',
  'Embryo unity comes from alignment, not just cell count.',
  'An embryo is one being because cells align around a shared developmental story. If alignment splits, twins form.',
  ARRAY['Unity = shared direction, not just shared material.', 'When all cells point the same way, you get one organism.', 'When alignment splits, you get twins — same material, different organizing principle.'],
  'Identical twins form when the organizing alignment of a single embryo splits into two independent developmental trajectories — demonstrating that identity is about coordination, not matter.',
  'Ahamkara (identity principle) organizes the system. The "I" is not atoms — it is the organizing alignment itself.',
  'Sankhya element: Ahamkara — the principle of individuation that creates the sense of "I" from undifferentiated material nature.',
  'Identity emerging from coordinated intelligence, not mere chemistry — mirrors Ahamkara as the organizing principle of individual selfhood.',
  ARRAY['Ahamkara identity principle Sankhya', 'Ahamkara ego false identification', 'individuation Sankhya elements']
) ON CONFLICT (framework_id, part_number) DO NOTHING;

-- Part 7
INSERT INTO yoi_framework_parts (framework_id, part_number, title, transcript_anchor, scientific_point, simple_breakdown, biological_example, sankhya_parallel, gita_reference, scientific_convergence, shabda_queries)
VALUES (
  'f0000000-0000-0000-0000-000000000001', 7,
  'Cognition All the Way Down',
  '"There is no dumb matter."',
  'Even chemical networks exhibit learning behaviors. Cells can show conditioning. Simple algorithms show unexpected properties.',
  ARRAY['Single cells can learn — they can be conditioned.', 'Chemical systems respond adaptively to their environment.', 'Even six-line sorting algorithms show behaviors not explicitly written into code.'],
  'Paramecia (single-celled organisms) can be habituated to stimuli. Chemical networks self-organize. These are cognitive behaviors at the most basic level of life.',
  'Matter is not inert randomness. Prakriti is dynamic, structured energy — always active, always organizing. The three gunas (sattva, rajas, tamas) keep matter in constant flux.',
  'Gita 3.27 — "All activities are carried out by the three modes of material nature."',
  'Undermines strict mechanical materialism. Matter behaves with inherent dynamism — exactly as Sankhya describes Prakriti.',
  ARRAY['Prakriti dynamic energy three gunas', 'Gita 3.27 modes material nature', 'sattva rajas tamas Prakriti']
) ON CONFLICT (framework_id, part_number) DO NOTHING;

-- Part 8
INSERT INTO yoi_framework_parts (framework_id, part_number, title, transcript_anchor, scientific_point, simple_breakdown, biological_example, sankhya_parallel, gita_reference, scientific_convergence, shabda_queries)
VALUES (
  'f0000000-0000-0000-0000-000000000001', 8,
  'The Platonic Pattern Space',
  'Mathematical patterns exist independent of physics.',
  'Certain patterns (like fractals from equations) are not created by history. They are discovered. They exist independent of physical selection.',
  ARRAY['You can''t change gravity to change a mathematical truth.', 'The Mandelbrot set exists whether or not anyone computes it.', 'Patterns exist regardless of material history.'],
  'Fractal patterns in nature (fern leaves, bronchial trees, blood vessels) reflect mathematical structures that exist as pure information, independent of which species "discovered" them through evolution.',
  'Cosmic intelligence (Mahat) precedes manifestation. Structured information is foundational — not a byproduct of physical evolution.',
  'Sankhya element: Mahat (cosmic intelligence) — the first evolute of Prakriti, the universal intelligence from which all structured patterns emerge.',
  'Suggests reality includes structured informational layers beyond raw matter — aligning with Sankhya''s Mahat as the source of universal pattern.',
  ARRAY['Mahat cosmic intelligence Sankhya', 'Sankhya 24 elements Mahat', 'cosmic intelligence precedes matter']
) ON CONFLICT (framework_id, part_number) DO NOTHING;

-- Part 9
INSERT INTO yoi_framework_parts (framework_id, part_number, title, transcript_anchor, scientific_point, simple_breakdown, biological_example, sankhya_parallel, gita_reference, scientific_convergence, shabda_queries)
VALUES (
  'f0000000-0000-0000-0000-000000000001', 9,
  'New Beings Without Evolutionary History',
  'Xenobots and anthrobots.',
  'Scientists create new biological constructs that display novel behaviors. These behaviors were not selected over millions of years.',
  ARRAY['Human cells removed from the body form entirely new organisms (anthrobots).', 'Frog cells rearranged into new shapes (xenobots) behave in ways never seen in frogs.', 'Where did these new goal states come from, if not from evolution?'],
  'Xenobots are living machines made from frog cells that can self-replicate and display behaviors never seen in any frog. Anthrobots are similar constructs from human cells. Both exhibit novel purposeful behavior with zero evolutionary history.',
  'Patterns are latent in deeper informational structure. Embodiment reveals them. Intelligence is not built by history alone — it is inherent in the fabric of Prakriti.',
  'Gita 7.10 — "O son of Pritha, know that I am the original seed of all existences."',
  'Biological intelligence exceeds evolutionary history alone — suggesting latent patterns in nature that Sankhya calls the unmanifest (Avyakta) potential of Prakriti.',
  ARRAY['Avyakta unmanifest Prakriti Sankhya', 'Gita 7.10 seed all existences', 'latent potential Prakriti']
) ON CONFLICT (framework_id, part_number) DO NOTHING;

-- Part 10
INSERT INTO yoi_framework_parts (framework_id, part_number, title, transcript_anchor, scientific_point, simple_breakdown, sankhya_parallel, gita_reference, scientific_convergence, shabda_queries)
VALUES (
  'f0000000-0000-0000-0000-000000000001', 10,
  'Ethics of Diverse Intelligence',
  'Need for new ethics for cyborgs and engineered beings.',
  'Intelligence exists in many forms. Human is not the only reference point. We need ethical frameworks that account for diverse minds.',
  ARRAY['If cells think, if chemical networks learn, if xenobots have goals — where do rights begin?', 'Ethics based only on human cognition is too narrow.', 'We need a framework based on degree of intelligence and experience, not species category.'],
  'Consciousness is not human-exclusive. It manifests across all embodied beings in varying degrees. Equal vision toward all beings is a foundational ethical principle.',
  'Gita 5.18 — "The humble sages, by virtue of true knowledge, see with equal vision a learned and gentle brahmana, a cow, an elephant, a dog, and a dog-eater."',
  'Ethics based on degree of intelligence and experience, not species category — precisely the equal vision described in the Gita.',
  ARRAY['Gita 5.18 equal vision all beings', 'consciousness all beings Vedic', 'equal vision Sankhya ethics']
) ON CONFLICT (framework_id, part_number) DO NOTHING;
