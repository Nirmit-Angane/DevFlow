import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { NodeData } from '../../store/useStore';

export default function DevFlowNode({ data, selected }: NodeProps<Node<NodeData>>) {
    const title = data?.title || (data as any)?.label || 'Component';
    const type = data?.type || 'Feature';
    const color = data?.color || '';

    // Retro-Futurism Type Palettes
    const typeConfig: Record<string, { bg: string; text: string; dot: string }> = {
        'Page': { bg: '#0f756e18', text: '#0f756e', dot: '#0f756e' },
        'Feature': { bg: '#dc5c1c18', text: '#dc5c1c', dot: '#dc5c1c' },
        'API': { bg: '#2b6cb018', text: '#2b6cb0', dot: '#2b6cb0' },
        'Database': { bg: '#0c141c14', text: '#0c141c', dot: '#0c141c' },
        'Logic': { bg: '#b4530918', text: '#b45309', dot: '#b45309' },
    };

    const currentConfig = typeConfig[type] || typeConfig[color] || { bg: '#dc5c1c18', text: '#dc5c1c', dot: '#dc5c1c' };

    return (
        <div
            className={`relative min-w-[210px] max-w-[270px] rounded-2xl px-4 py-3.5 select-none transition-all bg-[#fcf8ed] border-[2.5px] ${
                selected 
                    ? 'border-[#dc5c1c] ring-2 ring-[#dc5c1c] shadow-[6px_6px_0_#dc5c1c] -translate-y-0.5' 
                    : 'border-[#0c141c] shadow-[4px_4px_0_#0c141c] hover:shadow-[5px_5px_0_#0c141c]'
            }`}
        >
            {/* Retro Connection Handles (Tactile ports on all 4 sides) */}
            <Handle 
                type="target" 
                position={Position.Left} 
                id="left" 
                className="!w-3.5 !h-3.5 !rounded-full !border-2 !border-[#0c141c] !bg-[#fbf0e6] hover:!bg-[#dc5c1c] hover:!scale-125 transition-all shadow-[1px_1px_0_#0c141c] !left-[-7px]" 
            />
            <Handle 
                type="target" 
                position={Position.Top} 
                id="top" 
                className="!w-3.5 !h-3.5 !rounded-full !border-2 !border-[#0c141c] !bg-[#fbf0e6] hover:!bg-[#dc5c1c] hover:!scale-125 transition-all shadow-[1px_1px_0_#0c141c] !top-[-7px]" 
            />
            <Handle 
                type="source" 
                position={Position.Right} 
                id="right" 
                className="!w-3.5 !h-3.5 !rounded-full !border-2 !border-[#0c141c] !bg-[#fbf0e6] hover:!bg-[#dc5c1c] hover:!scale-125 transition-all shadow-[1px_1px_0_#0c141c] !right-[-7px]" 
            />
            <Handle 
                type="source" 
                position={Position.Bottom} 
                id="bottom" 
                className="!w-3.5 !h-3.5 !rounded-full !border-2 !border-[#0c141c] !bg-[#fbf0e6] hover:!bg-[#dc5c1c] hover:!scale-125 transition-all shadow-[1px_1px_0_#0c141c] !bottom-[-7px]" 
            />

            {/* Header: Indicator Dial + Title */}
            <div className="flex items-center gap-2 mb-1.5 pointer-events-none">
                <div 
                    className="w-3 h-3 rounded-full border-2 border-[#0c141c] shrink-0" 
                    style={{ backgroundColor: currentConfig.dot }} 
                />
                <span className="font-display font-black text-xs sm:text-sm tracking-wide text-[#0c141c] uppercase truncate" title={title}>
                    {title}
                </span>
            </div>

            {/* Type Pill Badge */}
            <div className="flex items-center gap-2 pointer-events-none mb-2">
                <span
                    className="font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-full font-bold border border-[#0c141c]"
                    style={{ backgroundColor: currentConfig.bg, color: currentConfig.text }}
                >
                    {type}
                </span>
            </div>

            {/* Node Description */}
            <div className="pointer-events-none">
                {data?.description ? (
                    <p className="text-[11px] text-[#4a5568] leading-snug font-body line-clamp-2" title={data.description}>
                        {data.description}
                    </p>
                ) : (
                    <div className="space-y-1.5 py-1">
                        <div className="h-1.5 rounded-full bg-[#0c141c]/15 w-3/4" />
                        <div className="h-1.5 rounded-full bg-[#0c141c]/10 w-1/2" />
                    </div>
                )}
            </div>
        </div>
    );
}
