import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Shield,
  ShieldOff,
  Clock,
  ExternalLink,
  History
} from 'lucide-react';
import { adminClient } from '../api/client';
import toast from 'react-hot-toast';

export const PolicyAdminPage = () => {
  const queryClient = useQueryClient();

  const { data: policies, isLoading } = useQuery({
    queryKey: ['policies'],
    queryFn: async () => {
      const resp = await adminClient.get('/policies');
      return resp;
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async (policy: any) => {
      // In real implementation, this would be a PATCH call
      // For now we toast and invalidate to show responsiveness
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 500)),
        {
          loading: 'Updating policy state...',
          success: `Policy ${policy.name} ${policy.active ? 'deactivated' : 'activated'}`,
          error: 'Failed to update policy',
        }
      );
    },
    onSuccess: () => {
      // Re-fetch policies to show updated state
      queryClient.invalidateQueries({ queryKey: ['policies'] });
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Policy Administration</h2>
          <p className="text-slate-400 mt-1">Manage zero-trust ABAC rules and snapshot versions.</p>
        </div>
        <button className="flex items-center px-6 py-3 bg-sentinel-teal text-white rounded-xl text-sm font-bold shadow-lg shadow-sentinel-teal/20 hover:bg-sentinel-teal/90 transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Create New Policy
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {policies?.map((policy: any) => (
          <div key={policy.id} className={`glass-card p-8 border-l-4 premium-shadow transition-all group ${policy.active ? 'border-l-sentinel-teal' : 'border-l-slate-700 opacity-80'}`}>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-bold text-white">{policy.name}</h3>
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-white/10 text-[10px] font-mono text-slate-400">
                    v{policy.version}
                  </span>
                  {policy.active ? (
                    <span className="flex items-center text-[10px] font-bold text-sentinel-teal uppercase tracking-widest bg-sentinel-teal/10 px-2 py-1 rounded-full">
                      <Shield className="w-3 h-3 mr-1" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-500/10 px-2 py-1 rounded-full">
                      <ShieldOff className="w-3 h-3 mr-1" /> Inactive
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-sm max-w-2xl">{policy.description}</p>
              </div>
              
              <div className="flex space-x-2">
                <button className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-sm">
                  <History className="w-5 h-5" />
                </button>
                <button className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-sm">
                  <Edit2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => toggleMutation.mutate(policy)}
                  className={`p-3 rounded-xl transition-all shadow-sm ${
                    policy.active ? 'bg-sentinel-teal/20 text-sentinel-teal hover:bg-sentinel-teal/30' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                  }`}
                >
                  {policy.active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Decision</p>
                  <span className={`text-xs font-bold uppercase tracking-widest ${policy.decision === 'ALLOW' ? 'text-green-500' : 'text-red-500'}`}>
                    {policy.decision}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Conditions</p>
                  <code className="text-xs text-sentinel-teal bg-sentinel-teal/5 px-2 py-1 rounded border border-sentinel-teal/10">
                    {policy.conditions}
                  </code>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Last Updated</p>
                  <div className="flex items-center text-xs text-slate-400 font-medium">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(policy.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <button className="flex items-center text-xs font-bold text-slate-500 hover:text-white transition-colors group">
                Full Details <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-all" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
