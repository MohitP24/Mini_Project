import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  Play, 
  RotateCcw, 
  ChevronRight, 
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Code,
  Zap,
  Activity
} from 'lucide-react';
import { adminClient } from '../api/client';
import toast from 'react-hot-toast';

const DiffRow = ({ step }: any) => {
  const diverged = step.originalDecision !== step.simulatedDecision;
  
  return (
    <div className={`p-4 rounded-xl border transition-all animate-in slide-in-from-right duration-500 ${diverged ? 'bg-red-500/5 border-red-500/20 shadow-lg shadow-red-500/5' : 'bg-white/5 border-white/5'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-slate-900 px-3 py-1 rounded text-[10px] font-mono text-slate-500 border border-white/5">
            STEP {step.stepNumber}
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-tight">{step.endpoint}</p>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{step.eventId.split('-')[0]}</p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Original</p>
            <span className={`text-xs font-bold ${step.originalDecision === 'ALLOW' ? 'text-green-500' : 'text-red-500'}`}>
              {step.originalDecision}
            </span>
          </div>
          <ArrowRight className={`w-4 h-4 ${diverged ? 'text-red-500' : 'text-slate-700'}`} />
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Simulated</p>
            <span className={`text-xs font-bold px-2 py-1 rounded ${
              step.simulatedDecision === 'ALLOW' ? 'text-green-500' : 'bg-red-500 text-white shadow-lg shadow-red-500/20'
            }`}>
              {step.simulatedDecision}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const WhatIfSimulationPage = () => {
  const [conditions, setConditions] = React.useState('[{"type":"ip","value":"192.168.1.12"}]');
  const [scope, setScope] = React.useState('192.168.1.12');
  const [replayResult, setReplayResult] = React.useState<any>(null);
  const [displayedSteps, setDisplayedSteps] = React.useState<any[]>([]);
  const [isReplaying, setIsReplaying] = React.useState(false);

  const simulateMutation = useMutation({
    mutationFn: async () => {
      const resp = await adminClient.post('/policies/simulate', { 
        conditions, 
        scope 
      });
      return resp;
    },
    onSuccess: (data) => {
      setReplayResult(data);
      setDisplayedSteps([]);
      setIsReplaying(true);
      
      // Progressively add steps to the UI for "storyline" feel
      data.steps.forEach((step: any, index: number) => {
        setTimeout(() => {
          setDisplayedSteps(prev => [...prev, step]);
          if (index === data.steps.length - 1) {
            setIsReplaying(false);
            toast.success('Simulation Analysis Complete');
          }
        }, index * 400); // 400ms delay between steps
      });
    }
  });

  const reset = () => {
    setReplayResult(null);
    setDisplayedSteps([]);
    setIsReplaying(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">What-If Simulation</h2>
          <p className="text-slate-400 mt-1">Test new policy rules against historical event batches before deployment.</p>
        </div>
        <button 
          onClick={reset}
          className="flex items-center space-x-3 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset Environment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Policy Editor */}
        <div className="glass-card p-8 space-y-6">
          <div className="flex items-center space-x-2 text-sentinel-teal mb-2">
            <Code className="w-5 h-5" />
            <h3 className="font-bold uppercase tracking-widest text-sm">Draft Policy Conditions</h3>
          </div>
          
          <div className="space-y-4">
            <textarea 
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              className="w-full h-48 bg-slate-950 border border-white/10 rounded-xl p-4 font-mono text-xs text-sentinel-teal focus:outline-none focus:border-sentinel-teal/50 transition-all"
              placeholder='[{"type":"role","value":"ROLE_ADMIN"}]'
            />
            <div className="p-4 bg-sentinel-teal/5 border border-sentinel-teal/10 rounded-xl">
              <p className="text-[10px] text-sentinel-teal font-bold uppercase tracking-widest flex items-center mb-2">
                <Zap className="w-3 h-3 mr-2" /> Simulation Scope
              </p>
              <input 
                type="text" 
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="bg-transparent border-b border-white/10 text-xs text-slate-300 focus:outline-none focus:border-sentinel-teal/50 w-full pb-1"
                placeholder="IP or Endpoint Scope"
              />
              <p className="text-[10px] text-slate-500 mt-2 italic">Evaluating against historical events matching this scope.</p>
            </div>
            <button 
              onClick={() => simulateMutation.mutate()}
              disabled={simulateMutation.isPending || isReplaying}
              className="w-full py-4 bg-sentinel-teal text-white rounded-xl font-bold shadow-lg shadow-sentinel-teal/20 hover:bg-sentinel-teal/90 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {simulateMutation.isPending ? 'Processing...' : isReplaying ? 'Replaying...' : (
                <>
                  <Play className="w-4 h-4 mr-2" /> Start Simulation
                </>
              )}
            </button>
          </div>
        </div>

        {/* Replay Results */}
        <div className="lg:col-span-2 glass-card p-8 min-h-[500px]">
          {!replayResult && !isReplaying ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <Activity className="w-16 h-16 text-slate-700 mb-4 animate-pulse" />
              <p className="text-slate-500 font-medium">Ready to start simulation.<br/>Select a batch to evaluate.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-white/5">
                <div className="flex items-center space-x-8">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Evaluated</p>
                    <p className="text-2xl font-bold text-white">{displayedSteps.length} / {replayResult?.totalEventsEvaluated || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Diverged</p>
                    <p className="text-2xl font-bold text-red-500">
                      {displayedSteps.filter(s => s.originalDecision !== s.simulatedDecision).length}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Success Rate</p>
                    <p className="text-2xl font-bold text-green-500">
                      {displayedSteps.length > 0 
                        ? (100 - (displayedSteps.filter(s => s.originalDecision !== s.simulatedDecision).length / displayedSteps.length * 100)).toFixed(0) 
                        : '100'}%
                    </p>
                  </div>
                </div>
                {replayResult?.divergedCount > 0 && !isReplaying && (
                  <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg">
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Risk Warning</p>
                    <p className="text-xs text-red-200">Proposed rule would change {replayResult.divergedCount} historical decisions.</p>
                  </div>
                )}
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {displayedSteps.map((step: any) => (
                  <DiffRow key={step.stepNumber} step={step} />
                ))}
                {isReplaying && (
                  <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <div className="w-8 h-8 border-2 border-sentinel-teal border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-500 animate-pulse font-mono uppercase tracking-widest">Scanning History...</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
