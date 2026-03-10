import { Node, Edge } from '@xyflow/react';
import { NodeData } from '../store/useStore';

/**
 * AI Service Placeholder
 * To be replaced with actual Groq API implementation.
 */

export interface ProjectDetails {
    name: string;
    description: string;
    type: string;
}

export interface GeneratedArchitecture {
    nodes: any[]; // Raw JSON nodes from AI
    connections: { source: string; target: string }[];
}

export const aiService = {
    /**
     * Proxies generating a workflow blueprint from a user description to the Groq API.
     */
    generateWorkflow: async (
        project: ProjectDetails,
        structureDescription: string
    ): Promise<GeneratedArchitecture> => {
        console.log(`[AI Service] Generating workflow for ${project.name}...`);

        const response = await fetch('/api/groq', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'workflow',
                project,
                nodeStructure: structureDescription
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to generate workflow');
        }

        const data = await response.json();
        return data as GeneratedArchitecture;
    },

    /**
     * Proxies generating an extensive Markdown SOP Document to the Groq API.
     */
    generateSOP: async (
        project: ProjectDetails,
        nodes: Node<NodeData>[],
        edges: Edge[]
    ): Promise<string> => {
        console.log(`[AI Service] Generating SOP for ${project.name}...`);

        const response = await fetch('/api/groq', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'sop',
                project,
                nodes,
                edges
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to generate SOP');
        }

        const data = await response.json();
        return data.markdown as string;
    }
};
