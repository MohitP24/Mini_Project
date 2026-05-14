import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  ArrowUpRight,
  Activity
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { forensicsClient } from '../api/client';
import toast from 'react-hot-toast';

// Remove hardcoded data constant

const MetricCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="glass-card p-6 flex flex-col justify-between premium-shadow hover:translate-y-[-4px] transition-all duration-300">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center ${trend > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {trend > 0 ? '+' : ''}{trend}%
          <ArrowUpRight className="w-3 h-3 ml-1" />
        </span>
      )}
    </div>
    <div className="mt-4">
      <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-white mt-1">{value}</p>
    </div>
  </div>
);

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const resp = await forensicsClient.get('/stats');
      return resp;
    },
    refetchInterval: 5000
  });

  const { data: trends } = useQuery({
    queryKey: ['trends'],
    queryFn: async () => {
      const resp = await forensicsClient.get('/trends');
      return resp;
    },
    refetchInterval: 10000
  });

  const { data: recentEvents } = useQuery({
    queryKey: ['recent-events'],
    queryFn: async () => {
      const resp = await forensicsClient.get('/events', { params: { size: 4 } });
      return resp.content;
    },
    refetchInterval: 5000
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Security Overview</h2>
          <p className="text-slate-400 mt-1">Real-time gateway telemetry and risk distribution.</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
            Last 24 Hours
          </button>
          <button 
            onClick={() => forensicsClient.get('/stats').then(() => toast.success('Report generation started'))}
            className="px-4 py-2 bg-sentinel-teal text-white rounded-lg text-sm font-semibold shadow-lg shadow-sentinel-teal/20 hover:bg-sentinel-teal/90 transition-colors"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Requests" 
          value={stats?.totalRequests?.toLocaleString() || '0'} 
          icon={Activity} 
          trend={12} 
          color="bg-blue-500" 
        />
        <MetricCard 
          title="Security Blocks" 
          value={stats?.securityBlocks?.toLocaleString() || '0'} 
          icon={ShieldAlert} 
          trend={-5} 
          color="bg-red-500" 
        />
        <MetricCard 
          title="Active Sessions" 
          value={stats?.activeSessions?.toLocaleString() || '0'} 
          icon={TrendingUp} 
          trend={18} 
          color="bg-sentinel-teal" 
        />
        <MetricCard 
          title="Avg Risk Score" 
          value={stats?.avgRiskScore?.toFixed(2) || '0.00'} 
          icon={ShieldCheck} 
          color="bg-green-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-card p-8 h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Event Volume & Risk Trend</h3>
            <div className="flex items-center space-x-4 text-xs font-medium uppercase tracking-widest text-slate-500">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-sentinel-teal rounded-full mr-2"></div>
                <span>Requests</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span>Risk Score</span>
              </div>
            </div>
          </div>
          <div className="w-full">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trends || []}>
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d7377" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0d7377" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="events" 
                  stroke="#0d7377" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorEvents)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Mini List */}
        <div className="glass-card p-8">
          <h3 className="text-lg font-semibold text-white mb-6">Security Alerts</h3>
          <div className="space-y-6">
            {recentEvents?.filter((e: any) => e.decision === 'DENY').map((event: any) => (
              <div key={event.eventId} className="flex items-start space-x-4 group cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-red-500/20 transition-all">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-semibold text-white">Security Block</p>
                  <p className="text-xs text-slate-400">{event.endpoint} from {event.sourceIp}</p>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">{new Date(event.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            {(!recentEvents || recentEvents.filter((e: any) => e.decision === 'DENY').length === 0) && (
              <p className="text-sm text-slate-500 italic">No recent alerts</p>
            )}
          </div>
          <button 
            onClick={() => navigate('/events')}
            className="w-full mt-8 py-3 bg-white/5 border border-white/5 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors"
          >
            View All Alerts
          </button>
        </div>
      </div>
    </div>
  );
};
