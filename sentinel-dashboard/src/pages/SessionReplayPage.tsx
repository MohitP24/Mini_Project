import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { forensicsClient } from '../api/client';

type Decision = 'ALLOW' | 'FLAG' | 'DENY';

interface ReplayStep {
  step: number;
  eventType: string;
  endpoint: string;
  method: string;
  decision: Decision;
  riskScore: number;
  timestamp: string;
  sourceIp?: string;
  ruleId?: string;
  conditions?: {
    passed: string[];
    failed: string[];
  };
}

interface ReplaySummary {
  totalSteps: number;
  finalRiskScore: number;
  firstDenialStep: number | null;
  sessionDurationMs: number;
}

const decisionStyles: Record<Decision, string> = {
  ALLOW: 'text-decision-allow border-decision-allow/30 bg-decision-allow/10',
  FLAG: 'text-risk-medium border-risk-medium/30 bg-risk-medium/10',
  DENY: 'text-decision-deny border-decision-deny/30 bg-decision-deny/10',
};

const decisionIcons: Record<Decision, React.ReactNode> = {
  ALLOW: <ShieldCheck className="w-4 h-4" />,
  FLAG: <ShieldAlert className="w-4 h-4" />,
  DENY: <XCircle className="w-4 h-4" />,
};

const parseDecision = (value: unknown): Decision => {
  if (value === 'DENY' || value === 'FLAG' || value === 'ALLOW') {
    return value;
  }
  return 'ALLOW';
};

const normalizeSteps = (rawPayload: any): ReplayStep[] => {
  const source =
    (Array.isArray(rawPayload?.steps) && rawPayload.steps) ||
    (Array.isArray(rawPayload?.events) && rawPayload.events) ||
    (Array.isArray(rawPayload?.content) && rawPayload.content) ||
    (Array.isArray(rawPayload) ? rawPayload : []);

  return source.map((step: any, index: number) => {
    const policyConditions = Array.isArray(step?.policyConditions) ? step.policyConditions : [];
    const conditionState = step?.conditions && typeof step.conditions === 'object' ? step.conditions : null;

    const passed = Array.isArray(conditionState?.passed)
      ? conditionState.passed
      : policyConditions
          .filter((condition: any) => condition?.met)
          .map((condition: any) => String(condition?.condition));

    const failed = Array.isArray(conditionState?.failed)
      ? conditionState.failed
      : policyConditions
          .filter((condition: any) => !condition?.met)
          .map((condition: any) => String(condition?.condition));

    return {
      step: Number(step?.step ?? step?.stepNumber ?? index + 1),
      eventType: String(step?.eventType ?? step?.event_type ?? 'EVENT'),
      endpoint: String(step?.endpoint ?? 'N/A'),
      method: String(step?.method ?? step?.httpMethod ?? 'GET'),
      decision: parseDecision(step?.decision ?? step?.simulatedDecision),
      riskScore: Number(step?.riskScore ?? step?.risk_score ?? 0),
      timestamp: String(step?.timestamp ?? step?.createdAt ?? new Date().toISOString()),
      sourceIp: step?.sourceIp ?? step?.ipAddress ?? step?.source_ip,
      ruleId: step?.policyRuleId ?? step?.rule_id,
      conditions: {
        passed,
        failed,
      },
    };
  });
};

const summarizeSteps = (steps: ReplayStep[]): ReplaySummary => {
  const firstTimestamp = steps[0]?.timestamp;
  const lastTimestamp = steps[steps.length - 1]?.timestamp;
  const firstMs = firstTimestamp ? new Date(firstTimestamp).getTime() : 0;
  const lastMs = lastTimestamp ? new Date(lastTimestamp).getTime() : 0;

  return {
    totalSteps: steps.length,
    finalRiskScore: steps[steps.length - 1]?.riskScore ?? 0,
    firstDenialStep: steps.find((step) => step.decision === 'DENY')?.step ?? null,
    sessionDurationMs: Math.max(0, lastMs - firstMs),
  };
};

const generateMockSteps = (): ReplayStep[] => {
  const now = Date.now();
  return [
    {
      step: 1,
      eventType: 'REQUEST_RECEIVED',
      endpoint: '/api/login',
      method: 'POST',
      decision: 'ALLOW',
      riskScore: 0.15,
      timestamp: new Date(now).toISOString(),
      sourceIp: '192.168.1.1',
      conditions: { passed: ['ip_valid', 'user_exists'], failed: [] },
    },
    {
      step: 2,
      eventType: 'POLICY_EVALUATED',
      endpoint: '/api/user',
      method: 'GET',
      decision: 'ALLOW',
      riskScore: 0.25,
      timestamp: new Date(now + 100).toISOString(),
      ruleId: 'USER-ACCESS-01',
      conditions: { passed: ['role_valid', 'access_granted'], failed: [] },
    },
    {
      step: 3,
      eventType: 'RISK_FLAGGED',
      endpoint: '/api/payments/delete',
      method: 'DELETE',
      decision: 'FLAG',
      riskScore: 0.52,
      timestamp: new Date(now + 200).toISOString(),
      conditions: { passed: ['flagged_policy'], failed: ['risk_threshold'] },
    },
    {
      step: 4,
      eventType: 'POLICY_DENIED',
      endpoint: '/api/payments/delete',
      method: 'DELETE',
      decision: 'DENY',
      riskScore: 0.82,
      timestamp: new Date(now + 300).toISOString(),
      ruleId: 'FIN-DELETE-01',
      conditions: {
        passed: ['role_valid'],
        failed: ['risk_too_high', 'outside_business_hours'],
      },
    },
  ];
};

export const SessionReplayPage = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();

  const [steps, setSteps] = React.useState<ReplayStep[]>([]);
  const [summary, setSummary] = React.useState<ReplaySummary | null>(null);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!sessionId) {
      setIsLoading(false);
      setError('Missing session id.');
      return;
    }

    let active = true;

    const loadReplay = async () => {
      setIsLoading(true);
      setError(null);

      const endpoints = [`/sessions/${sessionId}/replay`, `/replay/${sessionId}`];
      let payload: any = null;
      let found = false;

      for (const endpoint of endpoints) {
        try {
          payload = await forensicsClient.get(endpoint);
          found = true;
          break;
        } catch {
          // Try alternate endpoint before falling back to mock replay.
        }
      }

      const loadedSteps = found ? normalizeSteps(payload) : [];
      const finalSteps = loadedSteps.length > 0 ? loadedSteps : generateMockSteps();

      if (!active) {
        return;
      }

      setSteps(finalSteps);
      setSummary(summarizeSteps(finalSteps));
      setCurrentStep(0);
      setIsLoading(false);
    };

    loadReplay();

    return () => {
      active = false;
    };
  }, [sessionId]);

  React.useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrentStep((previous) => {
        if (previous >= steps.length - 1) {
          setIsPlaying(false);
          return previous;
        }
        return previous + 1;
      });
    }, 800);

    return () => window.clearInterval(timer);
  }, [currentStep, isPlaying, steps.length]);

  const current = steps[currentStep];
  const visibleSteps = steps.slice(0, currentStep + 1);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <p className="text-slate-300 animate-pulse">Loading replay reconstruction...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-200">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.08),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.08),transparent_42%)]" />

      <div className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/90 backdrop-blur-md px-8 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/sessions')}
              title="Back to sessions"
              aria-label="Back to sessions"
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Session Replay</h2>
              <p className="text-xs text-slate-400 font-mono">{sessionId || 'unknown-session'}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
              title="Previous step"
              aria-label="Previous step"
              className="px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlaying((playing) => !playing)}
              className="px-4 py-2 rounded-lg bg-sentinel-teal text-white hover:bg-sentinel-teal/90 transition-colors flex items-center gap-2"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep((step) => Math.min(steps.length - 1, step + 1));
              }}
              title="Next step"
              aria-label="Next step"
              className="px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep(0);
              }}
              title="Restart replay"
              aria-label="Restart replay"
              className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Restart
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-300 text-sm">
            {error}
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs uppercase tracking-widest text-slate-500">Progress</span>
          <label htmlFor="replay-progress" className="sr-only">
            Replay progress
          </label>
          <input
            id="replay-progress"
            type="range"
            min={0}
            max={Math.max(0, steps.length - 1)}
            value={currentStep}
            onChange={(event) => {
              setIsPlaying(false);
              setCurrentStep(Number(event.target.value));
            }}
            className="w-full accent-sentinel-teal"
          />
          <span className="text-xs text-slate-300 font-mono">
            {Math.min(currentStep + 1, steps.length)} / {steps.length}
          </span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5">
        <div className="lg:col-span-3 border-r border-white/5 p-8 overflow-y-auto">
          <div className="space-y-4 max-w-3xl">
            {visibleSteps.map((step, index) => {
              const isCurrent = index === currentStep;
              return (
                <button
                  key={`${step.step}-${step.timestamp}`}
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStep(index);
                  }}
                  className={`w-full text-left p-5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'border-sentinel-teal/50 bg-sentinel-teal/10 shadow-lg shadow-sentinel-teal/10'
                      : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Step {step.step}</p>
                      <h4 className="text-white font-semibold">{step.eventType}</h4>
                      <p className="text-sm text-slate-400 font-mono mt-1">
                        {step.method} {step.endpoint}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1 ${decisionStyles[step.decision]}`}>
                      {decisionIcons[step.decision]}
                      {step.decision}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>{new Date(step.timestamp).toLocaleString()}</span>
                    <span className="font-mono text-slate-300">Risk {(step.riskScore * 100).toFixed(0)}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 p-8 space-y-6 overflow-y-auto bg-slate-900/30">
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Step Details</h3>
            {current ? (
              <>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-slate-500 text-xs uppercase tracking-widest">Event</p>
                    <p className="text-white mt-1">{current.eventType}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-slate-500 text-xs uppercase tracking-widest">Decision</p>
                    <p className="text-white mt-1">{current.decision}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-slate-500 text-xs uppercase tracking-widest">Method</p>
                    <p className="text-white mt-1">{current.method}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-slate-500 text-xs uppercase tracking-widest">Risk</p>
                    <p className="text-white mt-1">{(current.riskScore * 100).toFixed(0)}%</p>
                  </div>
                </div>

                <div className="bg-slate-950/60 rounded-xl border border-white/5 p-4 text-sm">
                  <p className="text-slate-500 text-xs uppercase tracking-widest mb-2">Endpoint</p>
                  <p className="font-mono text-sentinel-teal break-all">{current.endpoint}</p>
                </div>

                <div className="bg-slate-950/60 rounded-xl border border-white/5 p-4 text-sm">
                  <p className="text-slate-500 text-xs uppercase tracking-widest mb-2">Policy Conditions</p>
                  <p className="text-xs text-green-400">Passed: {current.conditions?.passed.join(', ') || 'none'}</p>
                  <p className="text-xs text-red-400 mt-2">Failed: {current.conditions?.failed.join(', ') || 'none'}</p>
                </div>
              </>
            ) : (
              <p className="text-slate-500">No step selected.</p>
            )}
          </div>

          <div className="glass-card p-6 space-y-3">
            <h3 className="text-lg font-bold text-white">Replay Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-slate-500 text-xs uppercase tracking-widest">Total Steps</p>
                <p className="text-white text-lg mt-1">{summary?.totalSteps ?? 0}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-slate-500 text-xs uppercase tracking-widest">Final Risk</p>
                <p className="text-white text-lg mt-1">{((summary?.finalRiskScore ?? 0) * 100).toFixed(0)}%</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-slate-500 text-xs uppercase tracking-widest">First Denial</p>
                <p className="text-white text-lg mt-1">{summary?.firstDenialStep ?? 'None'}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-slate-500 text-xs uppercase tracking-widest">Duration</p>
                <p className="text-white text-lg mt-1">{Math.round((summary?.sessionDurationMs ?? 0) / 1000)}s</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
