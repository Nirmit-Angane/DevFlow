import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { NodeData } from '../../store/useStore';

export default function DevFlowNode({ data, selected }: NodeProps<Node<NodeData>>) {
    const { title, type, color } = data;

    const colorMap: Record<string, string> = {
        'textPrimary': 'hsl(340,100%,98%)',
        'signal': 'hsl(180,100%,50%)',
        'accent1': 'hsl(28,100%,50%)',
        'accent2': 'hsl(282,100%,50%)',
    };

    const actualColor = colorMap[color] || colorMap['textPrimary'];

    return (
        <div
            className={`relative w-48 rounded-lg px-4 py-3 select-none transition-shadow bg-[hsl(273,35%,14%)] ${selected ? 'ring-2 ring-offset-2 ring-offset-[hsl(273,35%,16%)]' : ''}`}
            style={{
                border: `1.5px solid ${actualColor}77`,
                boxShadow: `0 0 ${selected ? '20px' : '14px'} ${actualColor}33`,
                borderColor: selected ? actualColor : `${actualColor}77`,
            }}
        >
            <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-textSecondary border-none !left-[-5px]" />

            <div className="flex items-center gap-2 mb-1.5 pointer-events-none">
                <div className="w-2 h-2 rounded-full" style={{ background: actualColor, opacity: 0.9 }} />
                <span className="font-display font-bold text-sm truncate" style={{ color: 'hsl(340,100%,98%)' }}>{title}</span>
            </div>
            <span className="font-display text-[10px] tracking-widest uppercase pointer-events-none" style={{ color: actualColor, opacity: 0.65 }}>{type}</span>

            {/* Render Node Note */}
            <div className="mt-2 space-y-1.5 pointer-events-none min-h-[12px]">
                {data.description ? (
                    <p className="text-[10px] text-[hsl(275,39%,65%)] leading-tight font-body line-clamp-2" title={data.description}>
                        {data.description.length > 50 ? data.description.substring(0, 50) + "..." : data.description}
                    </p>
                ) : (
                    <>
                        <div className="h-1.5 rounded-full" style={{ background: actualColor, opacity: 0.18, width: "75%" }} />
                        <div className="h-1.5 rounded-full" style={{ background: actualColor, opacity: 0.12, width: "55%" }} />
                    </>
                )}
            </div>

            <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-textSecondary border-none !right-[-5px]" />
        </div>
    );
}
