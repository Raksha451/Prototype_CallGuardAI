
import React from 'react';
import { AnalysisResult } from '../types';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface AnalysisTooltipProps {
  analysis: AnalysisResult;
}

export const AnalysisTooltip: React.FC<AnalysisTooltipProps> = ({ analysis }) => {
  const isHighRisk = analysis.riskLevel === 'high';
  const isMediumRisk = analysis.riskLevel === 'medium';
  
  const icon = isHighRisk ? (
    <AlertTriangle size={14} className="text-red-400" />
  ) : isMediumRisk ? (
    <AlertTriangle size={14} className="text-yellow-400" />
  ) : (
    <CheckCircle size={14} className="text-green-400" />
  );

  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl opacity-0 invisible group-hover/risk:visible group-hover/risk:opacity-100 transition-all duration-300 translate-y-2 group-hover/risk:translate-y-0 pointer-events-none z-[100] border border-slate-700">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI Intelligence</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
          isHighRisk ? 'bg-red-500/20 text-red-400' : 
          isMediumRisk ? 'bg-yellow-500/20 text-yellow-400' : 
          'bg-green-500/20 text-green-400'
        }`}>
          {analysis.riskLevel}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Reasoning</div>
        <p className="text-xs text-slate-300 leading-relaxed italic">
          "{analysis.reasoning}"
        </p>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
         <span className="text-[9px] text-slate-500 font-medium italic">Behavioral Pattern Match</span>
         <Shield size={12} className="text-slate-600" />
      </div>

      {/* Triangle Caret */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-slate-900" />
    </div>
  );
};
