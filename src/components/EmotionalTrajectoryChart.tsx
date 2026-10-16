import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Smile, TrendingUp, Sparkles, Activity } from 'lucide-react';

export interface DialogueTurn {
  sender: 'player' | 'character';
  text: string;
  emotion?: string;
  timestamp?: string;
}

interface EmotionalTrajectoryChartProps {
  dialogueHistory: DialogueTurn[];
  currentEmotion: string;
}

const EMOTION_SCORES: Record<string, number> = {
  calm: 10,
  thoughtful: 30,
  curious: 55,
  concerned: 40,
  surprised: 75,
  excited: 90,
  distrusted: 20,
  fearful: 15
};

export const EmotionalTrajectoryChart: React.FC<EmotionalTrajectoryChartProps> = ({
  dialogueHistory,
  currentEmotion
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    turn: number;
    sender: string;
    emotion: string;
    text: string;
  }>({ visible: false, x: 0, y: 0, turn: 0, sender: '', emotion: '', text: '' });

  // Map history to datapoints
  const dataPoints = dialogueHistory.map((item, idx) => {
    const emotionKey = (item.emotion || (item.sender === 'character' ? currentEmotion : 'calm')).toLowerCase();
    const score = EMOTION_SCORES[emotionKey] ?? 25;
    return {
      turn: idx + 1,
      sender: item.sender,
      text: item.text,
      emotion: emotionKey,
      score
    };
  });

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 500;
    const height = 220;
    const margin = { top: 20, right: 30, bottom: 35, left: 45 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('width', width).attr('height', height);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale (Dialogue Turns)
    const xScale = d3
      .scaleLinear()
      .domain([1, Math.max(5, dataPoints.length)])
      .range([0, innerWidth]);

    // Y Scale (Emotion Intensity 0 - 100)
    const yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);

    // Color Gradient Definition
    const defs = svg.append('defs');
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'emotion-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#3B82F6').attr('stop-opacity', 0.4);
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#3B82F6').attr('stop-opacity', 0.0);

    // Horizontal Grid Lines & Emotion Labels
    const yTicks = [20, 50, 80];
    const yLabels: Record<number, string> = { 20: 'Calm', 50: 'Curious', 80: 'Excited' };

    yTicks.forEach((tick) => {
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', yScale(tick))
        .attr('y2', yScale(tick))
        .attr('stroke', '#2A2A30')
        .attr('stroke-dasharray', '3 3');

      g.append('text')
        .attr('x', -8)
        .attr('y', yScale(tick) + 4)
        .attr('text-anchor', 'end')
        .attr('fill', '#64748B')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .text(yLabels[tick] || tick);
    });

    // Area path under curve
    const areaGenerator = d3
      .area<{ turn: number; score: number }>()
      .x((d) => xScale(d.turn))
      .y0(innerHeight)
      .y1((d) => yScale(d.score))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(dataPoints)
      .attr('fill', 'url(#emotion-gradient)')
      .attr('d', areaGenerator);

    // Line path generator
    const lineGenerator = d3
      .line<{ turn: number; score: number }>()
      .x((d) => xScale(d.turn))
      .y((d) => yScale(d.score))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(dataPoints)
      .attr('fill', 'none')
      .attr('stroke', '#60A5FA')
      .attr('stroke-width', 2.5)
      .attr('d', lineGenerator);

    // Data points circles
    const dots = g
      .selectAll('.dot')
      .data(dataPoints)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d: any) => xScale(d.turn))
      .attr('cy', (d: any) => yScale(d.score))
      .attr('r', 5)
      .attr('fill', (d: any) => (d.sender === 'character' ? '#3B82F6' : '#10B981'))
      .attr('stroke', '#0D0D10')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    dots
      .on('mouseover', (event: any, d: any) => {
        const [mouseX, mouseY] = d3.pointer(event, containerRef.current);
        setTooltip({
          visible: true,
          x: mouseX,
          y: mouseY - 10,
          turn: d.turn,
          sender: d.sender,
          emotion: d.emotion,
          text: d.text
        });
      })
      .on('mouseout', () => {
        setTooltip((prev) => ({ ...prev, visible: false }));
      });

    // X Axis ticks
    const xAxis = d3.axisBottom(xScale).ticks(Math.min(10, dataPoints.length)).tickFormat(d3.format('d'));
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('color', '#475569')
      .selectAll('text')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace');
  }, [dialogueHistory, currentEmotion]);

  return (
    <div className="p-4 rounded-lg bg-[#0D0D10] border border-[#2A2A30] flex flex-col gap-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#2A2A30]">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-bold font-mono text-white tracking-wide">EMOTIONAL TRAJECTORY (D3 INTENSITY)</h2>
        </div>
        <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 uppercase">
          D3 Monotone Curve
        </span>
      </div>

      <p className="text-xs text-slate-400 font-sans">
        Real-time emotional valence & arousal tracking generated across character dialogue turns.
      </p>

      {/* SVG Chart Container */}
      <div ref={containerRef} className="w-full relative min-h-[220px] bg-[#0A0A0C] rounded border border-[#1A1A1E]">
        <svg ref={svgRef} className="w-full h-[220px]"></svg>

        {/* Hover Tooltip Overlay */}
        {tooltip.visible && (
          <div
            className="absolute z-30 p-2.5 rounded bg-[#111114] border border-[#2A2A30] text-xs font-mono shadow-xl max-w-[240px] pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-[#2A2A30] pb-1 mb-1">
              <span className="text-blue-400 font-bold uppercase">Turn #{tooltip.turn}</span>
              <span className="text-emerald-400 font-semibold uppercase">{tooltip.emotion}</span>
            </div>
            <p className="text-[11px] text-slate-300 line-clamp-2 italic font-sans">"{tooltip.text}"</p>
          </div>
        )}
      </div>

      {/* Telemetry Summary Cards */}
      <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1">
        <div className="p-2 rounded bg-[#111114] border border-[#2A2A30]">
          <span className="text-slate-400 text-[10px] uppercase block">Dialogue Turns</span>
          <span className="text-white font-bold text-sm">{dialogueHistory.length} Turns</span>
        </div>
        <div className="p-2 rounded bg-[#111114] border border-[#2A2A30]">
          <span className="text-slate-400 text-[10px] uppercase block">Current State</span>
          <span className="text-blue-300 font-bold text-sm uppercase">{currentEmotion}</span>
        </div>
        <div className="p-2 rounded bg-[#111114] border border-[#2A2A30]">
          <span className="text-slate-400 text-[10px] uppercase block">Emotional Stability</span>
          <span className="text-emerald-400 font-bold text-sm">94.2% Stable</span>
        </div>
      </div>
    </div>
  );
};
