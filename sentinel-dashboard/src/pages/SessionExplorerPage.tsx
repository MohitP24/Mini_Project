import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Activity, 
  ShieldAlert, 
  Clock, 
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { forensicsClient } from '../api/client';

const SessionCard = ({ session }: any) => {
  const [expanded, setExpanded] = React.useState(false);
  const avgRisk = session.avgRiskScore || 0;
  const riskColor = avgRisk >= 0.7 ? 'bg-risk-high' : avgRisk >= 0.3 ? 'bg-risk-medium' : 'bg-risk-low';
  
  return (
    <div className="glass-card p-6 premium-shadow hover:translate-y-[-4px] hover:border-sentinel-teal/30 transition-all duration-300 group relative">
      <div className="absolute -top-2 -right-2 bg-sentinel-teal text-white text-[8px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-lg shadow-sentinel-teal/50">
        LIVE_SESSION
      </div>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center mr-3">
            <Users className="w-5 h-5 text-slate-400 group-hover:text-sentinel-teal transition-colors" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-mono truncate w-40">
              {session.sessionId.split('-')[0]}...
            </h4>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">
              {session.userId || 'Anonymous User'}
            </p>
          </div>
        </div>
        <div className={`h-2 w-2 rounded-full ${session.avgRiskScore >= 0.8 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total Events</p>
          <div className="flex items-center text-white">
            <Activity className="w-3 h-3 mr-2 text-sentinel-teal" />
            <span className="text-lg font-bold">{session.eventCount}</span>
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Avg Risk</p>
          <div className="flex items-center text-white">
            <ShieldAlert className={`w-3 h-3 mr-2 ${avgRisk >= 0.7 ? 'text-red-500' : 'text-yellow-500'}`} />
            <span className="text-lg font-bold">{(avgRisk * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-full ${riskColor} transition-all duration-1000`} 
            style={{ width: `${avgRisk * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-500">
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            <span>Last seen {new Date(session.lastActivity).toLocaleTimeString()}</span>
          </div>
          <button 
            onClick={() => setExpanded(!expanded)}
            className="flex items-center text-sentinel-teal hover:text-white transition-colors font-bold uppercase tracking-widest">
            {expanded ? 'Close' : 'Inspect'} <ChevronRight className={`w-3 h-3 ml-1 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
        </div>
        {expanded && (
          <div className="mt-4 pt-4 border-t border-white/10 text-xs text-slate-400 space-y-2 animate-in fade-in duration-300">
            <p><strong className="text-white">Full Session ID:</strong> {session.sessionId}</p>
            <p><strong className="text-white">Associated IPs:</strong> {session.associatedIps?.join(', ') || 'N/A'}</p>
            <p><strong className="text-white">Recent Violations:</strong> {session.violationsCount || 0}</p>
            <button className="mt-2 w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded transition-colors shadow-sm">
              View Complete Audit Trail
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const SessionExplorerPage = () => {
  const [search, setSearch] = React.useState('');
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const resp = await forensicsClient.get(`/sessions`, { params: { size: 12 } });
      return resp;
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Session Explorer</h2>
          <p className="text-slate-400 mt-1">Aggregated behavioral insights per security session.</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search User ID..." 
              className="bg-slate-900 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-sentinel-teal/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sessions?.filter((s: any) => s.userId?.toLowerCase().includes(search.toLowerCase()) || s.sessionId.includes(search)).map((session: any) => (
          <SessionCard key={session.sessionId} session={session} />
        ))}
        {(!sessions || sessions.length === 0) && !isLoading && (
          <div className="col-span-full py-20 text-center glass-card">
            <p className="text-slate-500 italic">No active sessions found.</p>
          </div>
        )}
      </div>
    </div>
  );
};
