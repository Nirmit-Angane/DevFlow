import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Preferred generation models in priority order
const PREFERRED_MODELS = [
    'openai/gpt-oss-120b',
    'qwen/qwen3.8-27b',
    'openai/gpt-oss-20b',
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'llama-3.1-70b-versatile',
    'llama3-70b-8192',
    'llama3-8b-8192',
];

// In-memory cache for available models to avoid calling models.list on every single request
let cachedModels: { models: string[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getGroqClient(): Groq {
    const apiKey = process.env.GROQ_API_KEY?.trim();
    if (!apiKey) {
        throw new Error('GROQ_API_KEY is not configured. Please set GROQ_API_KEY in your environment variables (e.g. on Vercel or in .env.local).');
    }
    return new Groq({ apiKey });
}

async function getCandidateModels(groq: Groq): Promise<string[]> {
    const userModel = process.env.GROQ_MODEL?.trim();
    const now = Date.now();

    if (cachedModels && (now - cachedModels.timestamp < CACHE_TTL_MS)) {
        return userModel ? [userModel, ...cachedModels.models.filter(m => m !== userModel)] : cachedModels.models;
    }

    try {
        const response = await groq.models.list();
        const activeTextModels = response.data
            .filter(m => m.active !== false && m.output_modalities?.includes('text'))
            .map(m => m.id);

        const prioritized: string[] = [];

        // 1. Add preferred models supported on this account
        for (const pref of PREFERRED_MODELS) {
            if (activeTextModels.includes(pref) && !prioritized.includes(pref)) {
                prioritized.push(pref);
            }
        }

        // 2. Add other active text models (excluding moderation prompt-guard models)
        for (const id of activeTextModels) {
            if (!id.includes('prompt-guard') && !prioritized.includes(id)) {
                prioritized.push(id);
            }
        }

        if (prioritized.length > 0) {
            cachedModels = { models: prioritized, timestamp: now };
            return userModel ? [userModel, ...prioritized.filter(m => m !== userModel)] : prioritized;
        }
    } catch (err: any) {
        console.warn('[Groq API] Could not dynamically fetch model list, using fallback defaults:', err?.message || err);
    }

    return userModel ? [userModel, ...PREFERRED_MODELS] : PREFERRED_MODELS;
}

async function createChatCompletionWithFallback(
    groq: Groq,
    params: Omit<Groq.Chat.CompletionCreateParams, 'model'>
) {
    const candidates = await getCandidateModels(groq);
    let lastError: any = null;

    for (const model of candidates) {
        try {
            console.log(`[Groq API] Attempting model: ${model}`);
            const completion = await groq.chat.completions.create({
                ...params,
                model,
            });
            return { completion, modelUsed: model };
        } catch (err: any) {
            console.warn(`[Groq API] Model ${model} failed:`, err?.message || err);
            lastError = err;

            const isModelUnavailable =
                err?.status === 404 ||
                err?.error?.code === 'model_not_found' ||
                (err?.message && (err.message.includes('does not exist') || err.message.includes('model_not_found')));

            if (isModelUnavailable) {
                // Invalidate cache and try next candidate
                cachedModels = null;
                continue;
            }

            // If it's another fatal error (e.g. invalid API key 401, or prompt validation), rethrow immediately
            throw err;
        }
    }

    throw lastError || new Error('All candidate Groq models failed.');
}

function parseJSONSafely(text: string): any {
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }
    return JSON.parse(cleaned);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, project, nodeStructure, nodes, edges } = body;

        if (!project || !project.name) {
            return NextResponse.json({ error: 'Project details required' }, { status: 400 });
        }

        const groq = getGroqClient();

        if (type === 'workflow') {
            const systemPrompt = `You are a strict architecture generator that MUST return a valid raw JSON object. Do NOT wrap it in Markdown \`\`\`json blocks. Do NOT include any other text.
You will generate a system architecture component diagram based on the user's project parameters.
Return exactly this shape:
{
  "nodes": [
    { "id": "string", "type": "Page|Feature|API|Database|Logic", "title": "string", "description": "short string" }
  ],
  "connections": [
    { "source": "node_id", "target": "node_id" }
  ]
}`;
            const userPrompt = `Project Name: ${project.name}
Project Type: ${project.type}
Description: ${project.description}
Requested Structure: ${nodeStructure || 'Derive automatically from description'}
Generate the architecture diagram in the requested JSON format.`;

            const { completion, modelUsed } = await createChatCompletionWithFallback(groq, {
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.2,
                max_tokens: 2048,
                response_format: { type: 'json_object' }
            });

            console.log(`[Groq API] Successfully generated workflow using ${modelUsed}`);
            const content = completion.choices[0]?.message?.content;
            if (!content) throw new Error('No response content from Groq');

            return NextResponse.json(parseJSONSafely(content));

        } else if (type === 'sop') {
            const systemPrompt = `You are an expert technical writer computing a Standard Operating Procedure (SOP) and Architecture Document from a node-based architecture graph.
Output standard Markdown only. Make it comprehensive. Include sections on: Overview, Architecture, Data Flow, and Components.`;

            const userPrompt = `Project Name: ${project.name}
Project Type: ${project.type}
Description: ${project.description}

Here are the nodes defined in the architecture:
${JSON.stringify(nodes.map((n: any) => ({ id: n.id, title: n.data.title, type: n.data.type, description: n.data.description })), null, 2)}

Here are the connections (edges) mapping the data flow:
${JSON.stringify(edges.map((e: any) => ({ source: e.source, target: e.target })), null, 2)}

Generate a detailed and professional SOP Markdown document.`;

            const { completion, modelUsed } = await createChatCompletionWithFallback(groq, {
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.5,
                max_tokens: 4096,
            });

            console.log(`[Groq API] Successfully generated SOP using ${modelUsed}`);
            const content = completion.choices[0]?.message?.content;
            if (!content) throw new Error('No response content from Groq');

            return NextResponse.json({ markdown: content });
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

    } catch (error: any) {
        console.error('Groq API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: error.status || 500 });
    }
}

