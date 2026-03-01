'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { searchShabdaArticles, getShabdaChunks } from '@/lib/knowledge-hub';
import type { KnowledgeArticle, KnowledgeChunk } from '@/lib/knowledge-hub';

interface ShabdaReferenceProps {
  queries: string[];
  partNumber: number;
}

interface ReferenceResult {
  article: KnowledgeArticle;
  chunks: KnowledgeChunk[];
}

export default function ShabdaReference({ queries, partNumber }: ShabdaReferenceProps) {
  const [references, setReferences] = useState<ReferenceResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchReferences() {
      try {
        setLoading(true);
        setError(null);

        // Search across all provided queries
        const articleSets = await Promise.all(
          queries.map((q) => searchShabdaArticles(q, 2))
        );

        // Deduplicate articles by id
        const seen = new Set<string>();
        const uniqueArticles: KnowledgeArticle[] = [];
        for (const articles of articleSets) {
          for (const article of articles) {
            if (!seen.has(article.id)) {
              seen.add(article.id);
              uniqueArticles.push(article);
            }
          }
        }

        // Fetch chunks for top articles (limit to 3 articles)
        const topArticles = uniqueArticles.slice(0, 3);
        const results: ReferenceResult[] = await Promise.all(
          topArticles.map(async (article) => {
            const chunks = await getShabdaChunks(article.id, 2);
            return { article, chunks };
          })
        );

        if (!cancelled) {
          setReferences(results);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Unable to load Shabda references');
          setLoading(false);
        }
      }
    }

    fetchReferences();
    return () => { cancelled = true; };
  }, [queries]);

  if (loading) {
    return (
      <div className="mt-4 flex items-center gap-2 text-white/20 text-xs">
        <div className="w-3 h-3 border border-sacred-gold/30 border-t-sacred-gold rounded-full animate-spin" />
        <span>Loading Shabda references...</span>
      </div>
    );
  }

  if (error || references.length === 0) {
    return (
      <div className="mt-4 flex items-center gap-2 text-white/15 text-xs">
        <BookOpen size={12} />
        <span>
          {error ?? 'No Shabda references found for this topic.'}
        </span>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sacred-gold/60 hover:text-sacred-gold/90 transition-colors text-xs uppercase tracking-widest font-body"
      >
        <BookOpen size={13} />
        <span>Shabda Hub References ({references.length})</span>
        {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3">
              {references.map((ref) => (
                <div
                  key={ref.article.id}
                  className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm text-white/70 font-display">
                        {ref.article.title}
                      </h4>
                      {ref.article.author && (
                        <p className="text-[10px] text-white/30 mt-0.5">
                          by {ref.article.author}
                        </p>
                      )}
                    </div>
                    <ExternalLink size={12} className="text-white/15 shrink-0 mt-1" />
                  </div>

                  {ref.article.tags && ref.article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {ref.article.tags.slice(0, 5).map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] px-2 py-0.5 rounded-full bg-sacred-gold/5 text-sacred-gold/40 border border-sacred-gold/10"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {ref.chunks.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {ref.chunks.map((chunk) => (
                        <div
                          key={chunk.id}
                          className="text-xs text-white/30 leading-relaxed border-l-2 border-sacred-gold/10 pl-3"
                        >
                          {chunk.sectionHeading && (
                            <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">
                              {chunk.sectionHeading}
                            </p>
                          )}
                          <p className="line-clamp-4">{chunk.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
