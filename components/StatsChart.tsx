
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AnalysisResult } from '../types';

interface StatsChartProps {
  results: AnalysisResult[];
}

export const StatsChart: React.FC<StatsChartProps> = ({ results }) => {
  const data = [
    { name: 'Safe/Verified', value: results.filter(r => r.isGenuine).length, color: '#10b981' },
    { name: 'Low Risk', value: results.filter(r => r.riskLevel === 'low' && !r.isGenuine).length, color: '#34d399' },
    { name: 'Medium Risk', value: results.filter(r => r.riskLevel === 'medium').length, color: '#f59e0b' },
    { name: 'High Risk', value: results.filter(r => r.riskLevel === 'high').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Fallback data if empty
  const displayData = data.length > 0 ? data : [{ name: 'No Data', value: 1, color: '#e2e8f0' }];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-700 shadow-2xl text-xs font-bold">
          <p className="mb-1">{payload[0].name}</p>
          <p className="text-indigo-400">{payload[0].value} Records Detected</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full min-h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={displayData}
            cx="50%"
            cy="50%"
            innerRadius="65%"
            outerRadius="90%"
            paddingAngle={8}
            dataKey="value"
            animationBegin={0}
            animationDuration={1200}
            stroke="none"
          >
            {displayData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
