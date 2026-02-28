/**
 * Knowledge Hub Integration Layer
 *
 * Provides an abstraction for fetching conceptual references from:
 * - Shabda.co Supabase repository (Vedic/Sanskrit knowledge)
 * - Stephen Hicks / Objectivist repository (Western philosophy)
 *
 * Used for:
 * - Western philosophical bridging
 * - Sankhya 24 elements breakdown
 * - Six opulences framing
 */

import { createClient } from '@/lib/supabase-client';

export interface KnowledgeChunk {
  id: string;
  articleId: string;
  articleTitle: string;
  sectionHeading: string | null;
  content: string;
  source: 'shabda' | 'objectivist';
  similarity?: number;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  author: string | null;
  category: string | null;
  tags: string[] | null;
  themes: string[] | null;
  source: 'shabda' | 'objectivist';
}

/**
 * Search Shabda articles by full-text search
 */
export async function searchShabdaArticles(
  query: string,
  limit = 5
): Promise<KnowledgeArticle[]> {
  const supabase = createClient();

  const { data: rawData } = await supabase
    .from('shabda_articles')
    .select('id, title, author, category, tags, themes')
    .textSearch('tsv', query, { type: 'websearch' })
    .limit(limit);

  const data = rawData as unknown as {
    id: string;
    title: string;
    author: string | null;
    category: string | null;
    tags: string[] | null;
    themes: string[] | null;
  }[] | null;

  return (
    data?.map((a) => ({
      ...a,
      source: 'shabda' as const,
    })) ?? []
  );
}

/**
 * Search Objectivist/Stephen Hicks articles by full-text search
 */
export async function searchObjectivistArticles(
  query: string,
  limit = 5
): Promise<KnowledgeArticle[]> {
  const supabase = createClient();

  const { data: rawData } = await supabase
    .from('objectivist_articles')
    .select('id, title, author, category, tags, themes')
    .textSearch('tsv', query, { type: 'websearch' })
    .limit(limit);

  const data = rawData as unknown as {
    id: string;
    title: string;
    author: string | null;
    category: string | null;
    tags: string[] | null;
    themes: string[] | null;
  }[] | null;

  return (
    data?.map((a) => ({
      ...a,
      source: 'objectivist' as const,
    })) ?? []
  );
}

/**
 * Get chunks from a specific Shabda article
 */
export async function getShabdaChunks(
  articleId: string,
  limit = 10
): Promise<KnowledgeChunk[]> {
  const supabase = createClient();

  const { data: rawArticle } = await supabase
    .from('shabda_articles')
    .select('title')
    .eq('id', articleId)
    .single();

  const { data: rawChunks } = await supabase
    .from('shabda_article_chunks')
    .select('id, article_id, chunk_index, section_heading, chunk_text')
    .eq('article_id', articleId)
    .order('chunk_index')
    .limit(limit);

  const article = rawArticle as unknown as { title: string } | null;
  const chunks = rawChunks as unknown as {
    id: string;
    article_id: string;
    chunk_index: number;
    section_heading: string | null;
    chunk_text: string;
  }[] | null;

  return (
    chunks?.map((c) => ({
      id: c.id,
      articleId: c.article_id,
      articleTitle: article?.title ?? 'Unknown',
      sectionHeading: c.section_heading,
      content: c.chunk_text,
      source: 'shabda' as const,
    })) ?? []
  );
}

/**
 * Get chunks from a specific Objectivist article
 */
export async function getObjectivistChunks(
  articleId: string,
  limit = 10
): Promise<KnowledgeChunk[]> {
  const supabase = createClient();

  const { data: rawArticle } = await supabase
    .from('objectivist_articles')
    .select('title')
    .eq('id', articleId)
    .single();

  const { data: rawChunks } = await supabase
    .from('objectivist_article_chunks')
    .select('id, article_id, chunk_index, section_heading, chunk_text')
    .eq('article_id', articleId)
    .order('chunk_index')
    .limit(limit);

  const article = rawArticle as unknown as { title: string } | null;
  const chunks = rawChunks as unknown as {
    id: string;
    article_id: string;
    chunk_index: number;
    section_heading: string | null;
    chunk_text: string;
  }[] | null;

  return (
    chunks?.map((c) => ({
      id: c.id,
      articleId: c.article_id,
      articleTitle: article?.title ?? 'Unknown',
      sectionHeading: c.section_heading,
      content: c.chunk_text,
      source: 'objectivist' as const,
    })) ?? []
  );
}

/**
 * Search across both knowledge hubs simultaneously
 */
export async function searchAllKnowledge(
  query: string,
  limit = 5
): Promise<KnowledgeArticle[]> {
  const [shabda, objectivist] = await Promise.all([
    searchShabdaArticles(query, limit),
    searchObjectivistArticles(query, limit),
  ]);

  return [...shabda, ...objectivist];
}

/**
 * Get Sankhya-specific content from Shabda
 */
export async function getSankhyaContent(
  element?: string
): Promise<KnowledgeChunk[]> {
  const query = element
    ? `Sankhya ${element}`
    : 'Sankhya 24 elements Purusha Prakriti';

  const articles = await searchShabdaArticles(query, 3);

  if (articles.length === 0) return [];

  const chunks = await Promise.all(
    articles.map((a) => getShabdaChunks(a.id, 3))
  );

  return chunks.flat();
}

/**
 * Get Six Opulences framing content
 */
export async function getSixOpulencesContent(): Promise<KnowledgeChunk[]> {
  const query = 'six opulences wealth strength fame beauty knowledge renunciation';
  const articles = await searchShabdaArticles(query, 3);

  if (articles.length === 0) return [];

  const chunks = await Promise.all(
    articles.map((a) => getShabdaChunks(a.id, 3))
  );

  return chunks.flat();
}

/**
 * Get Western philosophical bridging content from Stephen Hicks
 */
export async function getWesternPhilosophyBridge(
  concept: string
): Promise<KnowledgeChunk[]> {
  const articles = await searchObjectivistArticles(concept, 3);

  if (articles.length === 0) return [];

  const chunks = await Promise.all(
    articles.map((a) => getObjectivistChunks(a.id, 3))
  );

  return chunks.flat();
}

/**
 * Retrieves knowledge hub stats
 */
export async function getKnowledgeHubStats() {
  const supabase = createClient();

  const [shabdaResult, objectivistResult, shabdaChunksResult, objectivistChunksResult] =
    await Promise.all([
      supabase.from('shabda_articles').select('*', { count: 'exact', head: true }),
      supabase.from('objectivist_articles').select('*', { count: 'exact', head: true }),
      supabase.from('shabda_article_chunks').select('*', { count: 'exact', head: true }),
      supabase.from('objectivist_article_chunks').select('*', { count: 'exact', head: true }),
    ]);

  const shabdaCount = shabdaResult.count as unknown as number | null;
  const objectivistCount = objectivistResult.count as unknown as number | null;
  const shabdaChunksCount = shabdaChunksResult.count as unknown as number | null;
  const objectivistChunksCount = objectivistChunksResult.count as unknown as number | null;

  return {
    shabda: { articles: shabdaCount ?? 0, chunks: shabdaChunksCount ?? 0 },
    objectivist: {
      articles: objectivistCount ?? 0,
      chunks: objectivistChunksCount ?? 0,
    },
    total: {
      articles: (shabdaCount ?? 0) + (objectivistCount ?? 0),
      chunks: (shabdaChunksCount ?? 0) + (objectivistChunksCount ?? 0),
    },
  };
}
