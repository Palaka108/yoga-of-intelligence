import 'server-only';

/** Template copied when someone joins. Override with TEMPLATE_AGENT_ID. */
export const DEFAULT_TEMPLATE_AGENT_ID = 'agent_2901m4hrxsemfj0thpsyxfqxr54f';

export function templateAgentId(): string {
  return process.env.TEMPLATE_AGENT_ID?.trim() || DEFAULT_TEMPLATE_AGENT_ID;
}

export function hasElevenLabsKey(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY?.trim());
}

export function isSignupReady(): boolean {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return Boolean(url && token && hasElevenLabsKey());
}

/**
 * POST /v1/convai/agents/{agent_id}/duplicate
 * https://elevenlabs.io/docs/api-reference/agents/duplicate
 * The new agent_id comes back on the response. The API key stays on the server.
 */
export async function duplicateTemplateAgent(displayName: string): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) throw new Error('Missing ELEVENLABS_API_KEY');

  const templateId = templateAgentId();
  const response = await fetch(
    `https://api.elevenlabs.io/v1/convai/agents/${encodeURIComponent(templateId)}/duplicate`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: `Untherapy 5-Day — ${displayName}` }),
      signal: AbortSignal.timeout(20_000),
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    console.error(`ElevenLabs duplicate failed (${response.status})`);
    throw new Error(`ElevenLabs duplicate failed (${response.status})`);
  }

  const body = (await response.json()) as { agent_id?: unknown };
  if (typeof body.agent_id !== 'string' || !body.agent_id.trim()) {
    throw new Error('ElevenLabs duplicate response did not include agent_id');
  }
  return body.agent_id.trim();
}

/** Best-effort cleanup when a profile could not be saved after a duplicate. */
export async function deleteAgent(agentId: string): Promise<void> {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey || !agentId) return;

  try {
    await fetch(`https://api.elevenlabs.io/v1/convai/agents/${encodeURIComponent(agentId)}`, {
      method: 'DELETE',
      headers: { 'xi-api-key': apiKey },
      signal: AbortSignal.timeout(15_000),
      cache: 'no-store',
    });
  } catch (error) {
    console.error('ElevenLabs agent cleanup failed', error instanceof Error ? error.name : 'unknown');
  }
}
