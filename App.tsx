
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Shield, Phone, AlertTriangle, RefreshCw, Upload, Info, CheckCircle, 
  ChevronRight, Camera, Plus, Trash2, Cpu, Globe, Zap, X, Search, 
  Filter, ShieldCheck, ShieldX, TrendingUp, BarChart3, Activity,
  Lock, ArrowUpRight, UserCircle2
} from 'lucide-react';
import { CallRecord, AnalysisResult } from './types';
import { MOCK_CALLS } from './constants';
import { analyzeCalls, analyzeScreenshot } from './services/geminiService';
import { RiskBadge } from './components/RiskBadge';
import { StatsChart } from './components/StatsChart';
import { AnalysisTooltip } from './components/AnalysisTooltip';

const App: React.FC = () => {
  const [calls, setCalls] = useState<CallRecord[]>(() => {
    const saved = localStorage.getItem('call_guard_logs');
    return saved ? JSON.parse(saved) : MOCK_CALLS.map(c => ({ ...c, source: 'system' }));
  });
  const [analysis, setAnalysis] = useState<Record<string, AnalysisResult>>(() => {
    const saved = localStorage.getItem('call_guard_analysis');
    return saved ? JSON.parse(saved) : {};
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [filter, setFilter] = useState<'all' | 'fraud' | 'genuine'>('all');
  
  useEffect(() => {
    localStorage.setItem('call_guard_logs', JSON.stringify(calls));
  }, [calls]);

  useEffect(() => {
    localStorage.setItem('call_guard_analysis', JSON.stringify(analysis));
  }, [analysis]);

  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const response = await analyzeCalls(calls);
      const mappedResults = response.results.reduce((acc, result) => {
        acc[result.id] = result;
        return acc;
      }, {} as Record<string, AnalysisResult>);
      setAnalysis(prev => ({ ...prev, ...mappedResults }));
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [calls]);

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      try {
        const result = await analyzeScreenshot(base64);
        const systemCalls = result.calls.map(c => ({ ...c, source: 'system' as const }));
        setCalls(prev => [...systemCalls, ...prev]);
        const mappedAnalysis = result.analysis.reduce((acc, res) => {
          acc[res.id] = res;
          return acc;
        }, {} as Record<string, AnalysisResult>);
        setAnalysis(prev => ({ ...prev, ...mappedAnalysis }));
        setFilter('all');
      } catch (err) {
        alert("Failed to process screenshot.");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const filteredCalls = useMemo(() => {
    return calls.filter(call => {
      const callAnalysis = analysis[call.id];
      if (filter === 'fraud') return callAnalysis?.isGenuine === false;
      if (filter === 'genuine') return callAnalysis?.isGenuine === true;
      return true;
    });
  }, [calls, analysis, filter]);

  const selectedCall = calls.find(c => c.id === selectedCallId);
  const selectedAnalysis = selectedCallId ? analysis[selectedCallId] : null;

  const stats = {
    total: calls.length,
    highRisk: Object.values(analysis).filter(a => a.riskLevel === 'high').length,
    verified: Object.values(analysis).filter(a => a.isGenuine).length,
    avgScore: Object.values(analysis).length > 0 
      ? Math.round(Object.values(analysis).reduce((acc, a) => acc + a.riskScore, 0) / Object.values(analysis).length)
      : 0
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-100/50 rounded-full blur-[120px]" />
      </div>

      <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-2.5 rounded-2xl text-white shadow-xl shadow-indigo-200 ring-4 ring-white">
                <Shield size={26} strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 tracking-tight leading-none block">
                  CallGuard <span className="text-indigo-600">AI</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Enterprise Shield</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || calls.length === 0}
                className="btn-hover-effect flex items-center gap-2 px-8 py-3.5 text-sm font-black text-white bg-indigo-600 rounded-[1.2rem] disabled:opacity-50 shadow-xl shadow-indigo-200 active:scale-95 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {isAnalyzing ? <RefreshCw size={18} className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
                {isAnalyzing ? 'SCANNING NEW NODES...' : 'INITIATE SECURITY AUDIT'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Dashboard Section */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* HERO STATS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Activity size={12} className="text-indigo-500" /> MONITORING
                  </p>
                  <h3 className="text-4xl font-black text-slate-900">{stats.total}</h3>
                  <div className="mt-4 flex items-center gap-1.5 text-indigo-600 text-[10px] font-bold">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    LIVE NETWORK
                  </div>
               </div>

               <div className="md:col-span-3 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-10 hover:shadow-xl transition-all duration-500 group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
                  
                  <div className="relative z-10 flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                      <BarChart3 size={12} /> Security Distribution
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 leading-tight">Threat Landscape Overview</h2>
                    <p className="text-slate-500 text-sm max-w-sm mb-8">
                      Real-time breakdown of all communication types across the monitored environment. Hover chart segments for details.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                        <p className="text-[9px] font-black text-rose-500 uppercase mb-1">High Risks</p>
                        <p className="text-xl font-black text-slate-800">{stats.highRisk}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                        <p className="text-[9px] font-black text-emerald-500 uppercase mb-1">Verified</p>
                        <p className="text-xl font-black text-slate-800">{stats.verified}</p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-[280px] h-[280px] relative z-10 flex items-center justify-center">
                    <StatsChart results={Object.values(analysis)} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-black text-slate-900">{stats.avgScore}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Risk Score</span>
                    </div>
                  </div>
               </div>
            </div>

            {/* Registry List */}
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
              <div className="px-10 py-10 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-xl">
                      <Phone size={22} className="text-slate-700" />
                    </div>
                    Registry Log
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-1 ml-11">Encrypted call history and identity verification.</p>
                </div>

                <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 w-full sm:w-auto">
                  {(['all', 'fraud', 'genuine'] as const).map((t) => (
                    <button 
                      key={t}
                      onClick={() => setFilter(t)} 
                      className={`btn-hover-effect flex-1 sm:flex-none px-6 py-2.5 rounded-[0.9rem] text-xs font-black transition-all uppercase tracking-widest ${
                        filter === t 
                        ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-100 ring-1 ring-slate-200' 
                        : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-50">
                  <thead>
                    <tr className="bg-slate-50/30">
                      <th className="pl-10 pr-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Communication Node</th>
                      <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Security Status</th>
                      <th className="pl-6 pr-10 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Threat Factor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCalls.length > 0 ? filteredCalls.map((call) => {
                      const callAnalysis = analysis[call.id];
                      const isHighRisk = callAnalysis?.riskLevel === 'high';
                      const isSelected = selectedCallId === call.id;
                      const isManual = call.source === 'manual';

                      return (
                        <tr 
                          key={call.id} 
                          onClick={() => setSelectedCallId(call.id)} 
                          className={`group transition-all cursor-pointer relative ${
                            isSelected ? 'bg-indigo-50/50' : isManual ? 'bg-violet-50/20' : 'hover:bg-slate-50'
                          }`}
                        >
                          {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600" />}
                          {isManual && !isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-400" />}
                          
                          <td className="pl-10 pr-6 py-7">
                            <div className="flex items-center gap-6">
                              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all shadow-sm ring-1 ring-inset ${
                                isHighRisk 
                                ? 'bg-rose-100 text-rose-600 ring-rose-200' 
                                : isManual
                                ? 'bg-violet-100 text-violet-600 ring-violet-200'
                                : 'bg-slate-100 text-slate-500 ring-slate-200 group-hover:bg-indigo-100 group-hover:text-indigo-600 group-hover:ring-indigo-200'
                              }`}>
                                {isManual ? <UserCircle2 size={24} /> : <Phone size={24} />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <div className={`text-base font-black leading-tight transition-colors ${isSelected || isManual ? 'text-indigo-900' : 'text-slate-900 group-hover:text-indigo-600'}`}>
                                    {call.callerName || 'Unknown Identity'}
                                  </div>
                                  {isManual && (
                                    <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-[8px] font-black rounded uppercase tracking-widest border border-violet-200 shadow-sm">
                                      Manual
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-mono text-slate-400">{call.phoneNumber}</span>
                                  <div className="w-1 h-1 rounded-full bg-slate-200" />
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{call.location || 'Roaming'}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-7 text-center relative group/risk">
                            {callAnalysis ? (
                              <div className="inline-block transform transition-transform group-hover:scale-105">
                                <RiskBadge level={callAnalysis.riskLevel} isGenuine={callAnalysis.isGenuine} />
                                <AnalysisTooltip analysis={callAnalysis} />
                              </div>
                            ) : (
                              <div className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-full border ${isManual ? 'bg-violet-50 border-violet-100' : 'bg-slate-100 border-slate-200'}`}>
                                <div className={`w-2 h-2 rounded-full animate-pulse ${isManual ? 'bg-violet-400' : 'bg-slate-300'}`} />
                                <span className={`text-[9px] font-black uppercase tracking-widest italic ${isManual ? 'text-violet-500' : 'text-slate-400'}`}>
                                  {isManual ? 'Pending Audit' : 'Inert'}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="pl-6 pr-10 py-7 text-right">
                            <div className="flex items-center justify-end gap-6">
                              {callAnalysis ? (
                                <div className="text-right">
                                  <div className={`text-xl font-black tracking-tight ${
                                    isHighRisk ? 'text-rose-600' : callAnalysis.isGenuine ? 'text-emerald-600' : 'text-slate-600'
                                  }`}>
                                    {callAnalysis.riskScore}
                                    <span className="text-[10px] text-slate-300 ml-1">/ 100</span>
                                  </div>
                                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Vector Rating</div>
                                </div>
                              ) : (
                                <div className={`h-10 w-24 rounded-xl border flex items-center justify-center italic text-[9px] font-bold uppercase ${isManual ? 'bg-violet-50/50 border-violet-100 text-violet-400' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                                  {isManual ? 'Audit Ready' : 'Ready'}
                                </div>
                              )}
                              <div className={`p-2 rounded-full transition-all ${isSelected ? 'bg-indigo-600 text-white' : 'text-slate-300 group-hover:text-indigo-500 group-hover:bg-indigo-50'}`}>
                                <ChevronRight size={18} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={3} className="py-20 text-center">
                          <div className="flex flex-col items-center opacity-30">
                            <Search size={48} className="text-slate-400 mb-4" />
                            <p className="text-lg font-black text-slate-500 uppercase tracking-widest">No matching records found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Audit Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white border border-slate-800 shadow-3xl sticky top-28 overflow-hidden min-h-[650px] flex flex-col group/sidebar">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover/sidebar:opacity-10 transition-opacity duration-1000">
                <Lock size={160} />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-10">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                  <h2 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Audit Intelligence Node</h2>
                </div>
              </div>
              
              {selectedAnalysis ? (
                <div className="space-y-10 relative z-10 flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-md">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl shadow-lg ${
                          selectedAnalysis.isGenuine ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {selectedAnalysis.isGenuine ? <ShieldCheck size={28} /> : <ShieldX size={28} />}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Final Verdict</p>
                          <h4 className="text-2xl font-black tracking-tight">{selectedAnalysis.threatCategory}</h4>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-4xl font-black ${selectedAnalysis.isGenuine ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {selectedAnalysis.riskScore}%
                        </span>
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Risk Level</p>
                      </div>
                    </div>
                    
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-8">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out ${
                          selectedAnalysis.riskScore > 70 ? 'bg-rose-500' : selectedAnalysis.riskScore > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${selectedAnalysis.riskScore}%` }}
                      />
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 relative overflow-hidden group">
                      <p className="text-sm text-slate-300 leading-relaxed font-medium italic relative z-10">
                        "{selectedAnalysis.reasoning}"
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-6 px-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Digital Fingerprint Markers</span>
                      <div className="h-px bg-slate-800 flex-1 ml-4" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedAnalysis.indicators?.map((tag, i) => (
                        <div 
                          key={i} 
                          className="btn-hover-effect px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-[10px] font-black text-slate-400 hover:text-white cursor-default transition-all shadow-sm"
                        >
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto pt-8 grid grid-cols-1 gap-4">
                    {!selectedAnalysis.isGenuine ? (
                      <button className="btn-hover-effect py-5 px-6 bg-rose-600 text-white rounded-[1.4rem] text-[11px] font-black hover:bg-rose-700 shadow-2xl shadow-rose-900/50 flex items-center justify-center gap-3 uppercase tracking-[0.1em]">
                        <ShieldX size={18} strokeWidth={3} />
                        BLACKLIST NODE PERMANENTLY
                      </button>
                    ) : (
                      <button className="btn-hover-effect py-5 px-6 bg-emerald-600 text-white rounded-[1.4rem] text-[11px] font-black hover:bg-emerald-700 shadow-2xl shadow-emerald-900/50 flex items-center justify-center gap-3 uppercase tracking-[0.1em]">
                        <ShieldCheck size={18} strokeWidth={3} />
                        MARK AS TRUSTED ASSET
                      </button>
                    )}
                    <button className="btn-hover-effect py-5 px-6 bg-slate-800 text-slate-300 rounded-[1.4rem] text-[11px] font-black hover:bg-slate-700 transition-all flex items-center justify-center gap-3 border border-slate-700 uppercase tracking-[0.1em]">
                      <RefreshCw size={18} />
                      RE-EVALUATE LOGS
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-12 opacity-30">
                  <div className={`w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mb-8 animate-pulse ${selectedCall?.source === 'manual' ? 'text-violet-500' : 'text-indigo-500'}`}>
                    {selectedCall?.source === 'manual' ? <UserCircle2 size={40} /> : <Activity size={40} />}
                  </div>
                  <h3 className="text-xl font-black mb-4 uppercase tracking-widest">
                    {selectedCall?.source === 'manual' ? 'User Asset Detected' : 'Awaiting Audit Target'}
                  </h3>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed max-w-[200px]">
                    {selectedCall?.source === 'manual' 
                      ? 'THIS NODE WAS ENTERED MANUALLY. CLICK "INITIATE SECURITY AUDIT" TO PERFORM A DEEP SECURITY SCAN.' 
                      : 'SELECT A CALL FROM THE LOG REGISTRY TO PERFORM DEEP PACKET INSPECTION AND IDENTITY VERIFICATION.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Menu */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-40 px-6 py-4 glass-panel border border-white/50 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-slate-900/5">
        <label className="btn-hover-effect cursor-pointer bg-white border border-slate-200 px-8 py-4 rounded-[1.5rem] shadow-xl shadow-slate-200/50 flex items-center gap-3 hover:bg-slate-50 transition-all text-xs font-black uppercase tracking-wider active:scale-95 group">
          <Camera size={20} className="text-indigo-600 group-hover:scale-110 transition-transform" />
          <span className="text-slate-700">Scan Screenshot</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleScreenshotUpload} />
        </label>
        
        <div className="w-px h-8 bg-slate-200 mx-2" />

        <button 
          onClick={() => setShowManualAdd(true)}
          className="btn-hover-effect bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] shadow-2xl shadow-slate-900/30 flex items-center gap-3 hover:bg-slate-800 transition-all text-xs font-black uppercase tracking-wider active:scale-95 group"
        >
          <Plus size={20} className="text-indigo-400 group-hover:rotate-90 transition-transform" />
          <span>Manual Entry</span>
        </button>
      </div>

      {/* Manual Add Modal */}
      {showManualAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] border border-white p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />
            
            <button 
              onClick={() => setShowManualAdd(false)}
              className="absolute top-8 right-8 p-2 text-slate-300 hover:text-slate-900 transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-3xl font-black mb-2 tracking-tight text-slate-900">New Communication Node</h2>
            <p className="text-slate-400 text-sm font-medium mb-8">Enter details for local identity verification.</p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const d = new FormData(e.currentTarget);
              const newId = 'manual-' + Math.random().toString(36).substr(2, 9);
              setCalls([{ 
                id: newId, 
                phoneNumber: d.get('phone') as string, 
                callerName: d.get('name') as string, 
                timestamp: new Date().toISOString(), 
                duration: 0, 
                type: 'incoming',
                source: 'manual'
              }, ...calls]);
              setFilter('all');
              setShowManualAdd(false);
              setSelectedCallId(newId);
            }} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Phone Number / Origin ID</label>
                <input 
                  required 
                  name="phone" 
                  placeholder="+1 (555) 000-0000" 
                  className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-violet-500 focus:bg-white transition-all outline-none font-mono text-lg font-bold text-slate-900 placeholder-slate-400 shadow-inner" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Display Identification</label>
                <input 
                  name="name" 
                  placeholder="John Doe or 'Amazon Support'" 
                  className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-violet-500 focus:bg-white transition-all outline-none font-bold text-slate-900 placeholder-slate-400 shadow-inner" 
                />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowManualAdd(false)} className="btn-hover-effect flex-1 py-5 text-[11px] font-black text-slate-500 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors uppercase tracking-widest border border-slate-200">CANCEL</button>
                <button type="submit" className="btn-hover-effect flex-1 py-5 text-[11px] font-black text-white bg-violet-600 rounded-2xl shadow-2xl shadow-violet-200 hover:bg-violet-700 transition-all uppercase tracking-widest">REGISTER ASSET</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
