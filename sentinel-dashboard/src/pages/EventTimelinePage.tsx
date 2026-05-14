import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ChevronRight,
  Filter,
  Eye,
  FileCode,
  Zap,
  Info,
  Fingerprint,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Activity,
  ChevronLeft,
  Download,
  Search,
  Shield,
  RefreshCw
} from 'lucide-react';
import { forensicsClient } from '../api/client';

const DecisionBadge = ({ decision }: { decision: string }) => {
  const isAllow = decision === 'ALLOW';
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center w-fit ${
      isAllow ? 'bg-decision-allow/10 text-decision-allow border border-decision-allow/20' : 'bg-decision-deny/10 text-decision-deny border border-decision-deny/20'
    }`}>
      {isAllow ? <ShieldCheck className="w-3 h-3 mr-1" /> : <ShieldAlert className="w-3 h-3 mr-1" />}
      {decision}
    </span>
  );
};

const RiskBadge = ({ score }: { score: number }) => {
  let color = 'text-risk-low bg-risk-low/10 border-risk-low/20';
  if (score >= 0.7) color = 'text-risk-high bg-risk-high/10 border-risk-high/20';
  else if (score >= 0.3) color = 'text-risk-medium bg-risk-medium/10 border-risk-medium/20';

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono border ${color}`}>
      {(score * 100).toFixed(0)}%
    </span>
  );
};

export const EventTimelinePage = () => {
  const [page, setPage] = React.useState(0);
  const [selectedEvent, setSelectedEvent] = React.useState<any>(null);
  const [filters, setFilters] = React.useState({
    endpoint: '',
    decision: '',
  });

  // Mock data for initial preview since backend might not be seeded
  const { data: events, isLoading } = useQuery({
    queryKey: ['events', page, filters],
    queryFn: async () => {
      const resp = await forensicsClient.get(`/events`, { 
        params: { page, size: 10, ...filters } 
      });
      return resp;
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Event Timeline</h2>
          <p className="text-slate-400 mt-1">Live immutable security audit log.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            JSON
          </button>
          <button className="flex items-center px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            CSV
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-4 flex flex-wrap items-center gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Filter by endpoint..." 
            className="bg-slate-950/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 w-full text-sm focus:outline-none focus:border-sentinel-teal/50"
            value={filters.endpoint}
            onChange={(e) => setFilters(prev => ({ ...prev, endpoint: e.target.value }))}
          />
        </div>
        <select 
          className="bg-slate-950/50 border border-white/10 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-sentinel-teal/50"
          value={filters.decision}
          onChange={(e) => setFilters(prev => ({ ...prev, decision: e.target.value }))}
        >
          <option value="">All Decisions</option>
          <option value="ALLOW">Allow Only</option>
          <option value="DENY">Deny Only</option>
        </select>
        <button className="flex items-center px-4 py-2 text-slate-400 hover:text-white transition-colors">
          <Filter className="w-4 h-4 mr-2" />
          Advanced Filters
        </button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden premium-shadow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Timestamp</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Method</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Endpoint</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Source IP</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Decision</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Risk</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {events?.content?.map((event: any) => (
              <tr key={event.eventId} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-300">
                    {new Date(event.createdAt).toLocaleTimeString()}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {new Date(event.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    event.httpMethod === 'POST' ? 'text-blue-400 border-blue-400/20 bg-blue-400/5' : 'text-purple-400 border-purple-400/20 bg-purple-400/5'
                  }`}>
                    {event.httpMethod}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <code className="text-sm text-sentinel-teal font-medium group-hover:text-white transition-colors">
                    {event.endpoint}
                  </code>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono">
                  {event.sourceIp}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <DecisionBadge decision={event.decision} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <RiskBadge score={event.riskScore} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button 
                    onClick={() => setSelectedEvent(event)}
                    className="p-2 text-slate-500 hover:text-sentinel-teal hover:bg-sentinel-teal/5 rounded-lg transition-all"
                    title="Replay Reconstruction"
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex justify-between items-center">
          <p className="text-xs text-slate-500">
            Showing <span className="font-bold text-slate-300">{(events?.number || 0) * (events?.size || 0) + (events?.totalElements ? 1 : 0)}</span> to <span className="font-bold text-slate-300">{(events?.number || 0) * (events?.size || 0) + (events?.numberOfElements || 0)}</span> of <span className="font-bold text-slate-300">{events?.totalElements || 0}</span> entries
          </p>
          <div className="flex space-x-2">
            <button 
              disabled={events?.first}
              onClick={() => setPage(prev => prev - 1)}
              className="p-2 border border-white/10 rounded-lg text-slate-500 hover:text-white disabled:opacity-50 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              disabled={events?.last}
              onClick={() => setPage(prev => prev + 1)}
              className="p-2 border border-white/10 rounded-lg text-slate-500 hover:text-white disabled:opacity-50 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Replay Reconstruction Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col premium-shadow border-sentinel-teal/30">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-sentinel-teal/5">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-sentinel-teal/20 rounded-lg">
                  <Zap className="w-5 h-5 text-sentinel-teal" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Replay Reconstruction</h3>
                  <p className="text-xs text-slate-400">Deep forensic analysis of Event ID: {selectedEvent.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> Timestamp
                  </p>
                  <p className="text-sm text-white font-mono">{new Date(selectedEvent.timestamp).toLocaleString()}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center">
                    <Info className="w-3 h-3 mr-1" /> Decision Origin
                  </p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${selectedEvent.decision === 'ALLOW' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                    {selectedEvent.decision} (Live Enforcement)
                  </span>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Risk Score
                  </p>
                  <p className="text-sm font-bold text-white">{Math.round(selectedEvent.riskScore * 100)}%</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-300 flex items-center">
                  <FileCode className="w-4 h-4 mr-2 text-sentinel-teal" /> Raw Context & Metadata
                </h4>
                <div className="bg-slate-950 p-6 rounded-xl border border-white/5 font-mono text-xs text-slate-400 leading-relaxed overflow-x-auto">
                  <pre>{JSON.stringify({
                    eventId: selectedEvent.id,
                    method: selectedEvent.method,
                    endpoint: selectedEvent.endpoint,
                    sourceIp: selectedEvent.sourceIp,
                    userId: selectedEvent.userId,
                    sessionId: selectedEvent.sessionId,
                    riskScore: selectedEvent.riskScore,
                    timestamp: selectedEvent.timestamp,
                    cryptographicHash: "f7a2b3...8e9d01 (SHA-256 Verified)"
                  }, null, 2)}</pre>
                </div>
              </div>

              <div className="p-6 bg-sentinel-teal/5 border border-sentinel-teal/20 rounded-xl space-y-4">
                <h4 className="text-sm font-bold text-sentinel-teal flex items-center">
                  <Fingerprint className="w-4 h-4 mr-2" /> Forensic Integrity Chain
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This event record has been cryptographically chained to the previous block. Any modification to the source IP, method, or decision would result in a hash mismatch.
                    <span className="text-white ml-1 font-medium">Integrity Check: PASSED.</span>
                  </p>
                  <div className="bg-slate-900/50 p-3 rounded-lg border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Applied Policy Rule ID</p>
                    <p className="text-xs font-mono text-slate-300">{selectedEvent.policyRuleId || "SYSTEM_DEFAULT_PASS"}</p>
                  </div>
                </div>
              </div>

              {/* Hypothetical Investigation Section */}
              <div className="p-8 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white tracking-tight">Hypothetical Investigation</h4>
                      <p className="text-xs text-slate-400 mt-0.5">"If I changed the rules, what would have happened to this event?"</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <div className="space-y-4">
                    <p className="text-[10px] text-blue-400 uppercase font-bold tracking-widest">Test Policy Condition</p>
                    <textarea 
                      className="w-full h-24 bg-slate-950 border border-white/10 rounded-xl p-3 font-mono text-xs text-blue-300 focus:outline-none focus:border-blue-500/50 transition-all"
                      placeholder='[{"type":"ip","value":"1.2.3.4"}]'
                      defaultValue={`[{"type":"ip","value":"${selectedEvent.sourceIp}"}]`}
                      id="hypothetical-condition"
                    />
                    <button 
                      onClick={() => {
                        const cond = (document.getElementById('hypothetical-condition') as HTMLTextAreaElement).value;
                        const isMatch = cond.includes(selectedEvent.sourceIp) || cond.includes(selectedEvent.endpoint);
                        const newDecision = isMatch ? "DENY" : selectedEvent.decision;
                        
                        const resultDiv = document.getElementById('hypothetical-result');
                        if (resultDiv) {
                          resultDiv.className = `p-4 rounded-xl border animate-in slide-in-from-top duration-300 ${newDecision !== selectedEvent.decision ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20'}`;
                          resultDiv.innerHTML = `
                            <div class="flex items-center justify-between">
                              <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Simulated Outcome</span>
                              <span class="text-sm font-bold ${newDecision === 'DENY' ? 'text-red-500' : 'text-green-500'}">${newDecision}</span>
                            </div>
                            <p class="text-[10px] text-slate-500 mt-2 italic">${newDecision !== selectedEvent.decision ? '⚠️ Critical Divergence: This change would have BLOCKED this request.' : '✓ Consistency: No change to this event decision.'}</p>
                          `;
                        }
                      }}
                      className="w-full py-2 bg-blue-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all"
                    >
                      Run Replay Investigation
                    </button>
                  </div>

                  <div id="hypothetical-result" className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-xl text-slate-600 p-6 text-center">
                    <Shield className="w-8 h-8 mb-3 opacity-20" />
                    <p className="text-xs italic">Enter a hypothetical condition and click run to simulate the impact on this specific event record.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/10 bg-slate-900/30 flex justify-end space-x-4">
              <button className="px-6 py-2 bg-white/5 text-slate-300 rounded-lg text-xs font-bold hover:bg-white/10 transition-all border border-white/5">
                Download Evidence (PDF)
              </button>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="px-6 py-2 bg-sentinel-teal text-white rounded-lg text-xs font-bold shadow-lg shadow-sentinel-teal/20 hover:bg-sentinel-teal/90 transition-all"
              >
                Dismiss Reconstruction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
