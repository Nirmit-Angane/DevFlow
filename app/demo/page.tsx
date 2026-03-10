"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
    ReactFlow,
    ReactFlowProvider,
    Background,
    Controls,
    MiniMap,
    NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import DevFlowNode from "../../execution/components/nodes/DevFlowNode";
import useStore from "../../execution/store/useStore";
import { v4 as uuidv4 } from "uuid";
import { aiService } from "../../execution/services/aiService";
import { marked } from "marked";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const nodeTypes: any = {
    devflow: DevFlowNode,
};

function Flow() {
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setSelectedNode } = useStore();
    const setSelectedEdge = useStore(state => state.setSelectedEdge);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            const typeStr = event.dataTransfer.getData('application/reactflow');
            if (typeof typeStr === 'undefined' || !typeStr) return;

            const parsed = JSON.parse(typeStr);
            const position = reactFlowInstance?.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            }) || { x: 0, y: 0 };

            const newNode = {
                id: uuidv4(),
                type: 'devflow',
                position,
                data: {
                    title: `New ${parsed.type}`,
                    type: parsed.type,
                    description: '',
                    color: parsed.color,
                },
            };

            useStore.setState((state) => ({ nodes: state.nodes.concat(newNode as any) }));
        },
        [reactFlowInstance]
    );

    const onNodeClick: NodeMouseHandler = (event, node) => {
        setSelectedNode(node as any);
    };

    const onEdgeClick = (event: React.MouseEvent, edge: any) => {
        setSelectedEdge(edge);
    };

    const onPaneClick = () => {
        setSelectedNode(null);
        setSelectedEdge(null);
    };

    return (
        <div className="flex-1 h-full relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                onEdgeClick={onEdgeClick}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background color="hsl(282,100%,30%)" gap={30} size={1.5} />
                <Controls
                    className="!bg-[hsl(273,35%,14%)] !border !border-[#311f42] !rounded-lg overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.5)] [&_button]:!bg-transparent [&_button]:!border-b-[#311f42] [&_button]:!fill-[hsl(275,39%,82%)] hover:[&_button]:!fill-[hsl(340,100%,98%)] hover:[&_button]:!bg-[hsl(270,30%,20%)] transition-colors"
                />
            </ReactFlow>
        </div>
    );
}

function Toolbox() {
    const onDragStart = (event: React.DragEvent, typeInfo: any) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify(typeInfo));
        event.dataTransfer.effectAllowed = 'move';
    };

    const tools = [
        { type: 'Page', label: 'Page Node', color: 'signal' },
        { type: 'Feature', label: 'Feature Node', color: 'accent1' },
        { type: 'API', label: 'API Node', color: 'accent2' },
        { type: 'Database', label: 'Database Node', color: 'textPrimary' },
        { type: 'Logic', label: 'Logic Node', color: 'signal' },
    ];

    const borderMap: Record<string, string> = {
        'textPrimary': 'border-textPrimary bg-textPrimary/10 shadow-[0_0_8px_rgba(255,240,245,0.2)]',
        'signal': 'border-signal bg-signal/10 shadow-[0_0_8px_rgba(0,255,255,0.2)]',
        'accent1': 'border-accent1 bg-accent1/10 shadow-[0_0_8px_rgba(255,138,0,0.2)]',
        'accent2': 'border-accent2 bg-accent2/10 shadow-[0_0_8px_rgba(179,0,255,0.2)]',
    };

    return (
        <aside className="w-16 md:w-64 border-r border-[#311f42] bg-[hsl(273,35%,14%)] flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.5)] overflow-y-auto">
            <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-[#311f42]">
                <Link href="/">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-accent1 to-accent2 shadow-[0_0_10px_rgba(255,138,0,0.5)] cursor-pointer"></div>
                </Link>
                <span className="hidden md:block ml-3 font-display font-bold tracking-wider text-sm text-[hsl(340,100%,98%)]">DevFlow Canvas</span>
            </div>
            <div className="p-4 flex-1">
                <h3 className="text-xs uppercase text-[hsl(275,39%,60%)] mb-4 hidden md:block font-bold tracking-wider">Drag to Add Nodes</h3>
                <div className="space-y-3">
                    {tools.map((tool, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-grab border border-transparent hover:border-[#311f42] transition-colors"
                            draggable
                            onDragStart={(e) => onDragStart(e, { type: tool.type, color: tool.color })}
                        >
                            <div className={`w-8 h-8 rounded border ${borderMap[tool.color]}`}></div>
                            <span className="hidden md:block text-sm font-display text-[hsl(275,39%,82%)] group-hover:text-[hsl(340,100%,98%)]">{tool.label}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-4 border-t border-[#311f42]">
                <button className="w-full py-2.5 bg-gradient-to-r from-accent1 to-accent2 text-[hsl(273,35%,16%)] font-display font-bold tracking-wide rounded hover:opacity-90 transition shadow-[0_0_15px_rgba(179,0,255,0.4)] text-sm">
                    <span className="hidden md:inline">Export To Code</span>
                    <span className="md:hidden">{'</>'}</span>
                </button>
            </div>
        </aside>
    );
}

function PropertiesPanel() {
    const selectedNode = useStore(state => state.selectedNode);
    const selectedEdge = useStore(state => state.selectedEdge);
    const updateNodeData = useStore(state => state.updateNodeData);
    const deleteNode = useStore(state => state.deleteNode);
    const deleteEdge = useStore(state => state.deleteEdge);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("");

    // Sync state when selectedNode changes
    useEffect(() => {
        if (selectedNode) {
            setTitle(selectedNode.data.title);
            setDescription(selectedNode.data.description || "");
            setType(selectedNode.data.type);
        }
    }, [selectedNode]);

    if (!selectedNode && !selectedEdge) return null;

    if (selectedEdge && !selectedNode) {
        return (
            <aside className="w-72 border-l border-[#311f42] bg-[hsl(273,35%,13%)] flex flex-col z-10 shadow-[-4px_0_24px_rgba(0,0,0,0.5)]">
                <div className="h-16 flex items-center px-5 border-b border-[#311f42] bg-[hsl(273,35%,12%)]">
                    <span className="font-display font-bold text-sm text-[hsl(340,100%,98%)] tracking-wider">Connection</span>
                    <div className="ml-auto w-2 h-2 rounded-full bg-signal animate-pulse shadow-[0_0_8px_rgba(0,255,255,0.6)]"></div>
                </div>
                <div className="p-5 flex-1 overflow-y-auto">
                    <p className="text-xs text-[hsl(275,39%,60%)] font-display uppercase tracking-wider mb-3">Selected Path</p>
                    <p className="text-sm text-[hsl(275,39%,82%)] font-body leading-relaxed">This connection represents building data flow or a logic sequence between two nodes.</p>
                </div>
                <div className="p-5 border-t border-[#311f42] bg-[hsl(273,35%,12%)]">
                    <button
                        onClick={() => deleteEdge(selectedEdge.id)}
                        className="w-full py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 font-display font-bold tracking-wide rounded-md hover:bg-red-500/20 hover:border-red-500/60 transition-all text-sm shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                    >
                        Delete Connection
                    </button>
                </div>
            </aside>
        );
    }

    const handleSave = () => {
        updateNodeData(selectedNode!.id, { title, description, type });
    };

    const handleDelete = () => {
        deleteNode(selectedNode!.id);
    };

    return (
        <aside className="w-72 border-l border-[#311f42] bg-[hsl(273,35%,13%)] flex flex-col z-10 shadow-[-4px_0_24px_rgba(0,0,0,0.5)]">
            <div className="h-16 flex items-center px-5 border-b border-[#311f42] bg-[hsl(273,35%,12%)]">
                <span className="font-display font-bold text-sm text-[hsl(340,100%,98%)] tracking-wider">Properties</span>
                <div className="ml-auto w-2 h-2 rounded-full bg-signal animate-pulse shadow-[0_0_8px_rgba(0,255,255,0.6)]"></div>
            </div>
            <div className="p-5 flex-1 overflow-y-auto space-y-6">
                <div>
                    <label className="block text-xs font-display text-[hsl(275,39%,60%)] uppercase tracking-wider mb-2">Node Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-[hsl(270,30%,20%)] border border-[#311f42] rounded-md px-3 py-2 text-sm text-[hsl(340,100%,98%)] focus:outline-none focus:border-accent1 focus:shadow-[0_0_10px_rgba(255,138,0,0.2)] transition-shadow font-display focus:ring-1 focus:ring-accent1"
                    />
                </div>
                <div>
                    <label className="block text-xs font-display text-[hsl(275,39%,60%)] uppercase tracking-wider mb-2">Node Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full bg-[hsl(270,30%,20%)] border border-[#311f42] rounded-md px-3 py-2 text-sm text-[hsl(340,100%,98%)] focus:outline-none focus:border-accent2 focus:shadow-[0_0_10px_rgba(179,0,255,0.2)] transition-shadow font-display appearance-none cursor-pointer focus:ring-1 focus:ring-accent2"
                    >
                        <option value="Page">Page</option>
                        <option value="Feature">Feature</option>
                        <option value="API">API</option>
                        <option value="Database">Database</option>
                        <option value="Logic">Logic</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-display text-[hsl(275,39%,60%)] uppercase tracking-wider mb-2">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={5}
                        placeholder="What does this component do?"
                        className="w-full bg-[hsl(270,30%,20%)] border border-[#311f42] rounded-md px-3 py-2 text-sm text-[hsl(340,100%,98%)] focus:outline-none focus:border-signal focus:shadow-[0_0_10px_rgba(0,255,255,0.2)] transition-shadow font-body resize-none focus:ring-1 focus:ring-signal placeholder-[hsl(275,39%,40%)]"
                    />
                </div>
            </div>
            <div className="p-5 border-t border-[#311f42] bg-[hsl(273,35%,12%)] space-y-3">
                <button
                    onClick={handleSave}
                    className="w-full py-2.5 bg-[#422c5a] border border-[#5a3f7a] text-[hsl(340,100%,98%)] font-display font-bold tracking-wide rounded-md hover:bg-[#5a3f7a] hover:border-signal/50 transition-all text-sm shadow-[0_0_10px_rgba(179,0,255,0.2)]"
                >
                    Save Changes
                </button>
                <button
                    onClick={handleDelete}
                    className="w-full py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 font-display font-bold tracking-wide rounded-md hover:bg-red-500/20 hover:border-red-500/60 transition-all text-sm shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                >
                    Delete Node
                </button>
            </div>
        </aside>
    );
}

export default function DemoWorkspace() {
    const projectDetails = useStore(state => state.projectDetails);
    const nodes = useStore(state => state.nodes);
    const edges = useStore(state => state.edges);
    const [isExporting, setIsExporting] = useState(false);

    const handleExportSOP = async () => {
        setIsExporting(true);
        try {
            // 1. Generate Markdown from AI Mock
            const markdown = await aiService.generateSOP(
                projectDetails || { name: 'Untitled', description: '', type: 'Web Application' },
                nodes,
                edges
            );

            // 2. Parse Markdown to HTML
            const htmlContent = await marked.parse(markdown);

            // 3. Create a temporary container for rendering the PDF layout
            const container = document.createElement("div");
            container.innerHTML = htmlContent;

            // Apply some basic styling for the print output
            Object.assign(container.style, {
                width: '800px',
                padding: '40px',
                background: 'white',
                color: 'black',
                fontFamily: 'sans-serif',
                position: 'absolute',
                top: '-9999px',
                left: '-9999px',
            });

            // Style headers and paragraphs inside the container
            const style = document.createElement('style');
            style.textContent = `
                h1 { color: #2d1b38; border-bottom: 2px solid #ff8a00; padding-bottom: 10px; }
                h2 { color: #422c5a; margin-top: 30px; }
                h4 { color: #2d1b38; margin-top: 20px; font-weight: bold; }
                p { line-height: 1.6; color: #333; }
            `;
            container.appendChild(style);
            document.body.appendChild(container);

            // 4. Capture and Generate PDF
            const canvas = await html2canvas(container, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            // Basic check for multipage (very naive approach)
            let heightLeft = pdfHeight;
            let position = 0;
            const pageHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`${(projectDetails?.name || 'DevFlow_Blueprint').replace(/\\s+/g, '_')}_SOP.pdf`);

            // Cleanup
            document.body.removeChild(container);

        } catch (error) {
            console.error("Failed to export SOP:", error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex h-screen bg-[hsl(273,35%,11%)] text-textPrimary overflow-hidden font-body">
            <ReactFlowProvider>
                <Toolbox />

                <main className="flex-1 relative flex flex-col">
                    <header className="w-full h-16 border-b border-[#311f42] bg-[hsl(273,35%,14%,0.8)] backdrop-blur z-20 flex items-center justify-between px-6 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
                        <div className="font-display">
                            <span className="text-[hsl(275,39%,60%)] text-sm mr-2 tracking-wider">Project:</span>
                            <span className="text-[hsl(340,100%,98%)] tracking-wide font-bold">{projectDetails?.name || 'Untitled Blueprint'}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleExportSOP}
                                disabled={isExporting}
                                className={`text-xs font-display tracking-widest px-4 py-2 rounded-md border border-[hsl(28,100%,50%,0.5)] text-accent1 bg-accent1/10 shadow-[0_0_12px_rgba(255,138,0,0.2)] hover:shadow-[0_0_20px_rgba(255,138,0,0.4)] hover:bg-accent1/20 transition-all uppercase flex items-center gap-2 ${isExporting ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                {isExporting ? "Generating PDF..." : "Export SOP"}
                            </button>
                            <div className="text-xs font-display tracking-widest px-3 py-1.5 rounded-full border border-signal text-signal bg-signal/10 shadow-[0_0_8px_rgba(0,255,255,0.2)] uppercase flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse"></div>
                                Auto-saving
                            </div>
                        </div>
                    </header>

                    <div className="flex-1 relative w-full h-full">
                        <Flow />
                    </div>
                </main>

                <PropertiesPanel />
            </ReactFlowProvider>
        </div>
    );
}
