import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, project, nodeStructure, nodes, edges } = body;

        if (!project || !project.name) {
            return NextResponse.json({ error: 'Project details required' }, { status: 400 });
        }

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

            const completion = await groq.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model: 'llama-3.1-8b-instant',
                temperature: 0.2,
                max_tokens: 2048,
                response_format: { type: "json_object" }
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) throw new Error("No response from Groq");

            return NextResponse.json(JSON.parse(content));

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

            const completion = await groq.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model: 'llama-3.1-8b-instant',
                temperature: 0.5,
                max_tokens: 4096,
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) throw new Error("No response from Groq");

            return NextResponse.json({ markdown: content });
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

    } catch (error: any) {
        console.error("Groq API Error:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
