import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    Connection,
    Edge,
    EdgeChange,
    Node,
    NodeChange,
    addEdge,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
    applyNodeChanges,
    applyEdgeChanges,
} from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { ProjectDetails } from '../services/aiService';

export type NodeData = {
    title: string;
    type: string;
    description: string;
    color: string;
};

export type DevFlowNode = Node<NodeData>;

const initialNodes: DevFlowNode[] = [
    { id: '1', type: 'devflow', position: { x: 50, y: 100 }, data: { title: 'Login Page', type: 'Page', description: 'Handles user authentication', color: 'textPrimary' } },
    { id: '2', type: 'devflow', position: { x: 350, y: 100 }, data: { title: 'Auth Required', type: 'Logic', description: 'Check session token', color: 'accent2' } },
    { id: '3', type: 'devflow', position: { x: 650, y: 50 }, data: { title: 'Dashboard', type: 'Page', description: 'Main user dashboard', color: 'textPrimary' } },
    { id: '4', type: 'devflow', position: { x: 650, y: 200 }, data: { title: 'User API', type: 'API', description: 'Fetch user profile', color: 'signal' } },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true, style: { stroke: 'hsl(28, 100%, 50%)', strokeWidth: 2 } },
    { id: 'e2-3', source: '2', target: '3', type: 'smoothstep', animated: true, style: { stroke: 'hsl(180, 100%, 50%)', strokeWidth: 2 } },
    { id: 'e3-4', source: '3', target: '4', type: 'smoothstep', animated: true, style: { stroke: 'hsl(282, 100%, 50%)', strokeWidth: 2, strokeDasharray: '5 5' } }
];

export type StoreState = {
    projectDetails: ProjectDetails | null;
    nodes: DevFlowNode[];
    edges: Edge[];
    selectedNode: DevFlowNode | null;
    selectedEdge: Edge | null;
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;

    // Project Actions
    setProjectDetails: (details: ProjectDetails) => void;
    clearProject: () => void;
    setArchitecture: (nodes: DevFlowNode[], edges: Edge[]) => void;

    // Node/Edge Actions
    addNode: (type: string, typeName: string, color: string) => void;
    updateNodeData: (id: string, data: Partial<NodeData>) => void;
    deleteNode: (id: string) => void;
    deleteEdge: (id: string) => void;
    setSelectedNode: (node: DevFlowNode | null) => void;
    setSelectedEdge: (edge: Edge | null) => void;
};

const useStore = create<StoreState>()(
    persist(
        (set, get) => ({
            projectDetails: null,
            nodes: initialNodes,
            edges: initialEdges,
            selectedNode: null,
            selectedEdge: null,

            // Project Methods
            setProjectDetails: (details: ProjectDetails) => set({ projectDetails: details }),
            clearProject: () => set({ projectDetails: null, nodes: [], edges: [], selectedNode: null, selectedEdge: null }),
            setArchitecture: (nodes: DevFlowNode[], edges: Edge[]) => set({ nodes, edges }),

            onNodesChange: (changes: NodeChange[]) => {
                set({
                    nodes: applyNodeChanges(changes, get().nodes) as DevFlowNode[],
                });
            },
            onEdgesChange: (changes: EdgeChange[]) => {
                set({
                    edges: applyEdgeChanges(changes, get().edges),
                });
            },
            onConnect: (connection: Connection) => {
                set({
                    edges: addEdge({ ...connection, type: 'smoothstep', style: { stroke: 'hsl(28, 100%, 50%)', strokeWidth: 2 }, animated: true }, get().edges),
                });
            },
            addNode: (type: string, typeName: string, color: string) => {
                const newNode: DevFlowNode = {
                    id: uuidv4(),
                    type: 'devflow',
                    position: { x: 100 + Math.random() * 50, y: 100 + Math.random() * 50 },
                    data: {
                        title: `New ${typeName}`,
                        type: typeName,
                        description: '',
                        color: color,
                    },
                };
                set({ nodes: [...get().nodes, newNode] });
            },
            updateNodeData: (id: string, data: Partial<NodeData>) => {
                set({
                    nodes: get().nodes.map((node) => {
                        if (node.id === id) {
                            node.data = { ...node.data, ...data };
                        }
                        return node;
                    }),
                });

                // update selected node reference if it's the one being modified
                const currentSelectedNode = get().selectedNode;
                if (currentSelectedNode && currentSelectedNode.id === id) {
                    set({ selectedNode: { ...currentSelectedNode, data: { ...currentSelectedNode.data, ...data } } as DevFlowNode });
                }
            },
            deleteNode: (id: string) => {
                set({
                    nodes: get().nodes.filter((node) => node.id !== id),
                    edges: get().edges.filter((edge) => edge.source !== id && edge.target !== id),
                    selectedNode: get().selectedNode?.id === id ? null : get().selectedNode,
                    selectedEdge: null,
                });
            },
            deleteEdge: (id: string) => {
                set({
                    edges: get().edges.filter((edge) => edge.id !== id),
                    selectedEdge: get().selectedEdge?.id === id ? null : get().selectedEdge
                });
            },
            setSelectedNode: (node: DevFlowNode | null) => {
                set({ selectedNode: node, selectedEdge: null });
            },
            setSelectedEdge: (edge: Edge | null) => {
                set({ selectedEdge: edge, selectedNode: null });
            },
        }),
        {
            name: 'devflow-storage',
        }
    )
);

export default useStore;
