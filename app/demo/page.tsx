"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
    ReactFlow,
    ReactFlowProvider,
    Background,
    Controls,
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
    custom: DevFlowNode,
    default: DevFlowNode,
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
                    label: `New ${parsed.type}`,
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
        <div className="flex-1 h-full relative bg-[#dfbe9b]">
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
                defaultEdgeOptions={{
                    type: 'smoothstep',
                    animated: true,
                    style: { stroke: '#0c141c', strokeWidth: 2.5 },
                }}
                fitView
            >
                <Background color="#0c141c" gap={28} size={1.2} style={{ opacity: 0.16 }} />
                <Controls
                    className="!bg-[#fbf0e6] !border-2 !border-[#0c141c] !rounded-xl overflow-hidden !shadow-[3px_3px_0_#0c141c] [&_button]:!bg-transparent [&_button]:!border-b-2 [&_button]:!border-[#0c141c] [&_button]:!fill-[#0c141c] hover:[&_button]:!bg-[#eedecf] transition-colors"
                />
            </ReactFlow>
        </div>
    );
}

function Toolbox() {
    const nodes = useStore(state => state.nodes);
    const edges = useStore(state => state.edges);
    const projectDetails = useStore(state => state.projectDetails);
    const [copied, setCopied] = useState(false);

    const onDragStart = (event: React.DragEvent, typeInfo: any) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify(typeInfo));
        event.dataTransfer.effectAllowed = 'move';
    };

    const tools = [
        { type: 'Page', label: 'Page Node', color: 'Page', badgeColor: '#0f756e', badgeBg: '#0f756e20' },
        { type: 'Feature', label: 'Feature Node', color: 'Feature', badgeColor: '#dc5c1c', badgeBg: '#dc5c1c20' },
        { type: 'API', label: 'API Node', color: 'API', badgeColor: '#2b6cb0', badgeBg: '#2b6cb020' },
        { type: 'Database', label: 'Database Node', color: 'Database', badgeColor: '#0c141c', badgeBg: '#0c141c15' },
        { type: 'Logic', label: 'Logic Node', color: 'Logic', badgeColor: '#b45309', badgeBg: '#b4530920' },
    ];

    const handleExportCode = () => {
        const schema = {
            project: projectDetails || { name: "Untitled Blueprint", type: "Web Application" },
            components: nodes.map(n => ({
                id: n.id,
                type: n.data.type,
                title: n.data.title,
                description: n.data.description,
                position: n.position,
            })),
            connections: edges.map(e => ({
                id: e.id,
                from: e.source,
                to: e.target,
            })),
            generatedAt: new Date().toISOString(),
        };

        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(schema, null, 2))}`;
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", jsonString);
        downloadAnchor.setAttribute("download", `${(projectDetails?.name || 'DevFlow_Schema').replace(/\s+/g, '_')}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <aside className="w-20 md:w-64 border-r-[2.5px] border-[#0c141c] bg-[#fbf0e6] flex flex-col z-10 shadow-[4px_0_0_#0c141c] overflow-y-auto select-none">
            {/* Brand Header */}
            <div className="h-16 flex items-center justify-center md:justify-start md:px-5 border-b-[2.5px] border-[#0c141c] bg-[#f5e7d8]">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-full bg-[#dc5c1c] border-2 border-[#0c141c] flex items-center justify-center shadow-[2px_2px_0_#0c141c] group-hover:bg-[#e66627] transition-all">
                        <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-white">
                            <circle cx="6" cy="6" r="2.5" fill="currentColor" />
                            <circle cx="14" cy="6" r="2.5" fill="currentColor" />
                            <circle cx="10" cy="14" r="2.5" fill="currentColor" />
                            <line x1="6" y1="6" x2="14" y2="6" stroke="currentColor" strokeWidth="2" />
                            <line x1="6" y1="6" x2="10" y2="14" stroke="currentColor" strokeWidth="2" />
                            <line x1="14" y1="6" x2="10" y2="14" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    </div>
                    <div className="hidden md:flex flex-col">
                        <span className="font-display font-black tracking-wider text-sm text-[#0c141c]">DevFlow</span>
                        <span className="font-mono text-[8px] tracking-[0.2em] font-bold text-[#63707c] uppercase -mt-1">CANVAS // ARC-75</span>
                    </div>
                </Link>
            </div>

            {/* Draggable Components */}
            <div className="p-4 flex-1">
                <h3 className="font-mono text-[10px] uppercase text-[#63707c] mb-3.5 hidden md:block font-bold tracking-[0.2em]">
                    COMPONENT PALETTE
                </h3>
                <div className="space-y-2.5">
                    {tools.map((tool, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-[#fcf8ed] border-2 border-[#0c141c] shadow-[2px_2px_0_#0c141c] hover:shadow-[3px_3px_0_#0c141c] hover:translate-x-[2px] cursor-grab active:cursor-grabbing transition-all select-none group"
                            draggable
                            onDragStart={(e) => onDragStart(e, { type: tool.type, color: tool.color })}
                        >
                            <div
                                className="w-7 h-7 rounded-lg border-2 border-[#0c141c] flex items-center justify-center shrink-0 shadow-[1px_1px_0_#0c141c]"
                                style={{ backgroundColor: tool.badgeBg }}
                            >
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tool.badgeColor }} />
                            </div>
                            <div className="hidden md:flex flex-col">
                                <span className="text-xs font-display font-bold text-[#0c141c] tracking-wide">{tool.label}</span>
                                <span className="font-mono text-[8px] font-bold text-[#63707c] uppercase tracking-wider">{tool.type} TYPE</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Export Code CTA */}
            <div className="p-4 border-t-[2.5px] border-[#0c141c] bg-[#f5e7d8]">
                <button
                    onClick={handleExportCode}
                    className="retro-btn w-full py-2.5 text-xs tracking-wider shadow-[0_3px_0_#0c141c]"
                >
                    <span className="hidden md:inline">{copied ? "Schema Downloaded!" : "Export Schema JSON"}</span>
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
            setTitle(selectedNode.data.title || "");
            setDescription(selectedNode.data.description || "");
            setType(selectedNode.data.type || "Feature");
        }
    }, [selectedNode]);

    if (!selectedNode && !selectedEdge) return null;

    if (selectedEdge && !selectedNode) {
        return (
            <aside className="w-80 border-l-[2.5px] border-[#0c141c] bg-[#fbf0e6] flex flex-col z-10 shadow-[-4px_0_0_#0c141c]">
                <div className="h-16 flex items-center px-5 border-b-[2.5px] border-[#0c141c] bg-[#f5e7d8]">
                    <span className="font-display font-black text-sm text-[#0c141c] tracking-wider uppercase">CONNECTION // PATH</span>
                    <div className="ml-auto w-2.5 h-2.5 rounded-full bg-[#0f756e] border border-[#0c141c] animate-pulse"></div>
                </div>
                <div className="p-5 flex-1 overflow-y-auto">
                    <p className="font-mono text-[10px] text-[#63707c] uppercase tracking-wider mb-2 font-bold">ROUTE SPECS</p>
                    <p className="text-xs text-[#4a5568] font-body leading-relaxed bg-[#fcf8ed] border-2 border-[#0c141c] rounded-xl p-3.5 shadow-[2px_2px_0_#0c141c]">
                        This tactile telemetry path links data exchange and flow dependencies between the selected system components.
                    </p>
                </div>
                <div className="p-5 border-t-[2.5px] border-[#0c141c] bg-[#f5e7d8]">
                    <button
                        onClick={() => deleteEdge(selectedEdge.id)}
                        className="w-full py-2.5 bg-[#fee2e2] text-[#991b1b] border-2 border-[#0c141c] font-display font-bold text-xs uppercase tracking-wider rounded-full shadow-[0_3px_0_#0c141c] hover:bg-[#fecaca] active:translate-y-1 active:shadow-[0_1px_0_#0c141c] transition-all"
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
        <aside className="w-80 border-l-[2.5px] border-[#0c141c] bg-[#fbf0e6] flex flex-col z-10 shadow-[-4px_0_0_#0c141c]">
            <div className="h-16 flex items-center px-5 border-b-[2.5px] border-[#0c141c] bg-[#f5e7d8]">
                <span className="font-display font-black text-sm text-[#0c141c] tracking-wider uppercase">PROPERTIES // INSPECTOR</span>
                <div className="ml-auto w-2.5 h-2.5 rounded-full bg-[#0f756e] border border-[#0c141c] animate-pulse"></div>
            </div>
            <div className="p-5 flex-1 overflow-y-auto space-y-5">
                <div>
                    <label className="block font-mono text-[10px] font-bold text-[#63707c] uppercase tracking-wider mb-1.5">
                        Component Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-[#fcf8ed] border-2 border-[#0c141c] rounded-xl px-3.5 py-2.5 text-sm text-[#0c141c] font-display font-bold shadow-[2px_2px_0_#0c141c] focus:outline-none focus:border-[#dc5c1c] focus:ring-1 focus:ring-[#dc5c1c]"
                    />
                </div>
                <div>
                    <label className="block font-mono text-[10px] font-bold text-[#63707c] uppercase tracking-wider mb-1.5">
                        Architecture Type
                    </label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full bg-[#fcf8ed] border-2 border-[#0c141c] rounded-xl px-3.5 py-2.5 text-sm text-[#0c141c] font-display font-bold shadow-[2px_2px_0_#0c141c] focus:outline-none focus:border-[#0f756e] focus:ring-1 focus:ring-[#0f756e] cursor-pointer"
                    >
                        <option value="Page">Page</option>
                        <option value="Feature">Feature</option>
                        <option value="API">API</option>
                        <option value="Database">Database</option>
                        <option value="Logic">Logic</option>
                    </select>
                </div>
                <div>
                    <label className="block font-mono text-[10px] font-bold text-[#63707c] uppercase tracking-wider mb-1.5">
                        Role & Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={5}
                        placeholder="What function does this component execute?"
                        className="w-full bg-[#fcf8ed] border-2 border-[#0c141c] rounded-xl px-3.5 py-2.5 text-sm text-[#0c141c] font-body shadow-[2px_2px_0_#0c141c] focus:outline-none focus:border-[#dc5c1c] focus:ring-1 focus:ring-[#dc5c1c] resize-none"
                    />
                </div>
            </div>
            <div className="p-5 border-t-[2.5px] border-[#0c141c] bg-[#f5e7d8] space-y-3">
                <button
                    onClick={handleSave}
                    className="retro-btn-teal w-full py-2.5 text-xs tracking-wider shadow-[0_3px_0_#0c141c]"
                >
                    Save Changes
                </button>
                <button
                    onClick={handleDelete}
                    className="w-full py-2.5 bg-[#fee2e2] text-[#991b1b] border-2 border-[#0c141c] font-display font-bold text-xs uppercase tracking-wider rounded-full shadow-[0_3px_0_#0c141c] hover:bg-[#fecaca] active:translate-y-1 active:shadow-[0_1px_0_#0c141c] transition-all"
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
            // 1. Generate Markdown from AI
            const markdown = await aiService.generateSOP(
                projectDetails || { name: 'Untitled Blueprint', description: '', type: 'Web Application' },
                nodes,
                edges
            );

            // 2. Parse Markdown to HTML
            const htmlContent = await marked.parse(markdown);

            // 3. Create a temporary container for rendering the PDF layout
            const container = document.createElement("div");
            container.innerHTML = htmlContent;

            // Apply Retro-Futuristic styling for print output
            Object.assign(container.style, {
                width: '800px',
                padding: '40px',
                background: '#fcf8ed',
                color: '#0c141c',
                fontFamily: 'sans-serif',
                position: 'absolute',
                top: '-9999px',
                left: '-9999px',
                border: '3px solid #0c141c',
            });

            // Style headers and paragraphs inside the container
            const style = document.createElement('style');
            style.textContent = `
                h1 { color: #0c141c; border-bottom: 3px solid #dc5c1c; padding-bottom: 12px; font-weight: 800; text-transform: uppercase; }
                h2 { color: #0f756e; margin-top: 28px; font-weight: 700; border-bottom: 1px solid #0c141c33; padding-bottom: 6px; }
                h4 { color: #0c141c; margin-top: 20px; font-weight: 700; }
                p { line-height: 1.6; color: #2d3748; }
                ul { padding-left: 20px; }
                li { margin-bottom: 6px; color: #2d3748; }
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

            pdf.save(`${(projectDetails?.name || 'DevFlow_Blueprint').replace(/\s+/g, '_')}_SOP.pdf`);

            // Cleanup
            document.body.removeChild(container);

        } catch (error) {
            console.error("Failed to export SOP:", error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#dfbe9b] text-[#0c141c] overflow-hidden font-body select-none relative">
            <ReactFlowProvider>
                <Toolbox />

                <main className="flex-1 relative flex flex-col">
                    {/* Retro Top Header */}
                    <header className="w-full h-16 border-b-[2.5px] border-[#0c141c] bg-[#fbf0e6] z-20 flex items-center justify-between px-6 shadow-[0_4px_0_#0c141c]">
                        <div className="flex items-center gap-3 font-display">
                            <span className="font-mono text-[10px] tracking-[0.2em] font-bold text-[#63707c] uppercase">SYSTEM:</span>
                            <span className="text-[#0c141c] tracking-wide font-black text-sm uppercase">
                                {projectDetails?.name || 'SPORT MANAGEMENT'}
                            </span>
                            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full border border-[#0c141c] bg-[#dc5c1c]/15 text-[#dc5c1c] font-mono text-[9px] font-bold uppercase tracking-wider">
                                {projectDetails?.type || 'WEB APPLICATION'}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/"
                                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-[#0c141c] bg-[#fcf8ed] text-xs font-display font-bold text-[#0c141c] hover:text-[#dc5c1c] hover:bg-[#eedecf] shadow-[2px_2px_0_#0c141c] transition-all uppercase tracking-wider"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                                Return Home
                            </Link>
                            <button
                                onClick={handleExportSOP}
                                disabled={isExporting}
                                className={`retro-btn text-xs tracking-wider px-4 py-2 shadow-[0_3px_0_#0c141c] flex items-center gap-2 ${isExporting ? "opacity-60 cursor-not-allowed" : ""}`}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                {isExporting ? "Exporting SOP..." : "Export SOP"}
                            </button>
                            <div className="text-[10px] font-mono tracking-widest px-3 py-1.5 rounded-full border-2 border-[#0c141c] text-[#0f756e] bg-[#fcf8ed] shadow-[2px_2px_0_#0c141c] uppercase flex items-center gap-2 font-bold">
                                <div className="w-2 h-2 rounded-full bg-[#0f756e] animate-pulse"></div>
                                Auto-saving
                            </div>
                        </div>
                    </header>

                    {/* Canvas Area */}
                    <div className="flex-1 relative w-full h-full">
                        <Flow />
                    </div>
                </main>

                <PropertiesPanel />
            </ReactFlowProvider>
        </div>
    );
}
