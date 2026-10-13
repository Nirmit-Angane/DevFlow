import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { NodeData } from '../../store/useStore';

export default function DevFlowNode({ data, selected }: NodeProps<Node<NodeData>>) {
    const title = data?.title || (data as any)?.label || 'Component';
    const type = data?.type || 'Feature';
    const color = data?.color || '';

    const colorMap: Record<string, string> = {
        'textPrimary': '#ffffff',
        'signal': '#00ffff',
        'accent1': '#ff8a00',
        'accent2': '#b300ff',
        'Page': '#00ffff',
        'Feature': '#ff8a00',
        'API': '#b300ff',
        'Database': '#ffffff',
        'Logic': '#38bdf8',
    };

    const actualColor = colorMap[color] || colorMap[type] || '#ff8a00';

    return (
        <div
            className={`relative min-w-[200px] max-w-[260px] rounded-xl px-4 py-3 select-none transition-all bg-[hsl(273,35%,14%)] ${selected ? 'ring-2 ring-offset-2 ring-offset-[hsl(273,35%,16%)]' : ''}`}
            style={{
                border: `2px solid ${selected ? actualColor : `${actualColor}88`}`,
                boxShadow: selected ? `0 0 20px ${actualColor}55` : `0 4px 16px rgba(0,0,0,0.4)`,
            }}
        >
            {/* Handles on all 4 sides for seamless multi-directional routing */}
            <Handle type="target" position={Position.Left} id="left" className="w-2.5 h-2.5 !bg-[hsl(275,39%,82%)] !border-none !left-[-5px]" />
            <Handle type="target" position={Position.Top} id="top" className="w-2.5 h-2.5 !bg-[hsl(275,39%,82%)] !border-none !top-[-5px]" />
            <Handle type="source" position={Position.Right} id="right" className="w-2.5 h-2.5 !bg-[hsl(275,39%,82%)] !border-none !right-[-5px]" />
            <Handle type="source" position={Position.Bottom} id="bottom" className="w-2.5 h-2.5 !bg-[hsl(275,39%,82%)] !border-none !bottom-[-5px]" />

            <div className="flex items-center gap-2 mb-1.5 pointer-events-none">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: actualColor, boxShadow: `0 0 8px ${actualColor}` }} />
                <span className="font-display font-bold text-sm truncate text-white" title={title}>{title}</span>
            </div>

            <div className="flex items-center gap-2 pointer-events-none mb-1">
                <span
                    className="font-display text-[9px] tracking-widest uppercase px-1.5 py-0.5 rounded font-bold"
                    style={{ background: `${actualColor}22`, color: actualColor, border: `1px solid ${actualColor}44` }}
                >
                    {type}
                </span>
            </div>

            {/* Render Node Description */}
            <div className="mt-1.5 pointer-events-none">
                {data?.description ? (
                    <p className="text-[11px] text-[hsl(275,39%,75%)] leading-tight font-body line-clamp-2" title={data.description}>
                        {data.description}
                    </p>
                ) : (
                    <div className="space-y-1 py-0.5">
                        <div className="h-1.5 rounded-full" style={{ background: actualColor, opacity: 0.18, width: "75%" }} />
                        <div className="h-1.5 rounded-full" style={{ background: actualColor, opacity: 0.12, width: "50%" }} />
                    </div>
                )}
            </div>
        </div>
    );
}
