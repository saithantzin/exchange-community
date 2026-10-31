import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Users,
  Package,
  Repeat,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  ShieldAlert,
  MapPin,
  ExternalLink,
  RefreshCw,
  CreditCard,
  Wallet,
  ShieldCheck
} from 'lucide-react';
import StatCard from '../../components/admin/StatCard';
import {
  ADMIN_MEMBERS,
  ADMIN_CATEGORIES,
  ADMIN_AUDIT_LOGS,
  ADMIN_REGISTRATION_DATA
} from '../../data/adminMockData';

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [logs, setLogs] = useState(ADMIN_AUDIT_LOGS);
  const [dynamicStats, setDynamicStats] = useState(null);

  const fetchStats = () => {
    setRefreshing(true);
    api.get('/admin/dashboard-stats')
      .then((res) => {
        if (res.data?.success && res.data.data) {
          setDynamicStats(res.data.data);
        }
      })
      .catch((err) => {
        console.warn('Could not load dynamic admin stats:', err?.message);
      })
      .finally(() => {
        setTimeout(() => setRefreshing(false), 300);
      });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const activeMembers = dynamicStats?.members?.active ?? ADMIN_MEMBERS.filter(m => m.status === 'Active').length;
  const totalMembers = dynamicStats?.members?.total ?? 1420;
  const totalItems = dynamicStats?.items?.total ?? 2840;
  const activeExchanges = dynamicStats?.exchanges?.active ?? 45;
  const openDisputes = dynamicStats?.disputes?.open ?? 3;
  const escrowHeldMMK = dynamicStats?.escrow?.funds_held_mmk ?? 4850000;
  const pendingDeposits = dynamicStats?.escrow?.pending_deposit_reviews ?? 1;
  const pendingRefunds = dynamicStats?.escrow?.pending_refund_payouts ?? 2;

  const handleRefresh = () => {
    fetchStats();
  };

  const maxReg = ADMIN_REGISTRATION_DATA.reduce((max, d) => Math.max(max, d.members), 0);
  const maxCat = ADMIN_CATEGORIES.reduce((max, d) => Math.max(max, d.itemCount), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Bar */}
      <div className="bg-[#DDD1BF]/40 border border-[#EBE2D8] rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#2C1D15]">Community Platform Operations</h2>
          <p className="text-sm text-[#5C4033] mt-0.5">
            Real-time monitoring across 15 States and Regions throughout Myanmar.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-[#EBE2D8] text-[#2C1D15] hover:bg-[#F9F6F0] transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#5C4033] ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Feed'}</span>
          </button>
          <Link
            to="/admin/exchanges"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#5C4033] text-white hover:bg-[#2C1D15] transition-colors shadow-xs"
          >
            <span>Live Exchanges</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Members"
          value={totalMembers.toLocaleString()}
          subtitle={`${activeMembers} active accounts`}
          icon={Users}
          color="emerald"
          trend="+12.4% this month"
          trendUp={true}
        />
        <StatCard
          title="Catalog Items"
          value={totalItems.toLocaleString()}
          subtitle="Available for swaps"
          icon={Package}
          color="amber"
          trend="+8.1% listings"
          trendUp={true}
        />
        <StatCard
          title="Active Exchanges"
          value={activeExchanges.toLocaleString()}
          subtitle="Transit, dispatch & pending"
          icon={Repeat}
          color="blue"
          trend="In-transit & meeting"
        />
        <StatCard
          title="Disputes & Reports"
          value={openDisputes.toLocaleString()}
          subtitle="Requires moderation"
          icon={AlertTriangle}
          color="rose"
          trend="Action required"
          trendUp={false}
        />
      </div>

      {/* Secondary Metrics & Quick Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-[#EBE2D8] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider">Completed Swaps</span>
            <p className="text-2xl font-bold text-[#2C1D15] mt-1">1,280</p>
            <span className="text-xs text-emerald-700 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> Two-sided verified
            </span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-[#EBE2D8] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider">Nationwide Coverage</span>
            <p className="text-2xl font-bold text-[#2C1D15] mt-1">15 Regions</p>
            <span className="text-xs text-[#5C4033] flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 text-[#5C4033]" /> Yangon, Mandalay, Shan+
            </span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-[#DDD1BF]/40 border border-[#EBE2D8] flex items-center justify-center text-[#5C4033]">
            <MapPin className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-[#EBE2D8] rounded-xl p-4 flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <span className="text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider">Platform Integrity</span>
            <p className="text-2xl font-bold text-[#2C1D15] mt-1">99.8%</p>
            <span className="text-xs text-emerald-700 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> Zero fraud incidents
            </span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-800">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Intercity Escrow Funds & Operations Custody */}
      <div className="bg-[#5C4033] text-white rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#DDD1BF]/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 text-amber-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Intercity Escrow & Deposit Security</h3>
              <p className="text-xs text-[#DDD1BF] mt-0.5">
                Funds held in platform escrow custody to guarantee intercity exchange fulfillment across Myanmar.
              </p>
            </div>
          </div>
          <Link
            to="/admin/exchanges"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#2C1D15] text-xs font-bold hover:bg-[#F9F6F0] transition-colors"
          >
            <span>Review Escrow Slips</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="bg-white/10 rounded-xl p-4 border border-white/10">
            <span className="text-[11px] font-medium text-[#DDD1BF] uppercase tracking-wider block">Escrow Custody Funds</span>
            <div className="text-2xl font-bold text-white mt-1">{escrowHeldMMK.toLocaleString()} MMK</div>
            <span className="text-[11px] text-amber-200 mt-1 flex items-center gap-1">
              <CreditCard className="w-3 h-3" /> Safe escrow holding
            </span>
          </div>

          <div className="bg-white/10 rounded-xl p-4 border border-white/10">
            <span className="text-[11px] font-medium text-[#DDD1BF] uppercase tracking-wider block">Pending Deposit Slips</span>
            <div className="text-2xl font-bold text-amber-300 mt-1">{pendingDeposits} Slip Reviews</div>
            <span className="text-[11px] text-[#DDD1BF] mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Awaiting admin approval
            </span>
          </div>

          <div className="bg-white/10 rounded-xl p-4 border border-white/10">
            <span className="text-[11px] font-medium text-[#DDD1BF] uppercase tracking-wider block">Deposit Refund Payouts</span>
            <div className="text-2xl font-bold text-emerald-300 mt-1">{pendingRefunds} Ready for Payout</div>
            <span className="text-[11px] text-emerald-200 mt-1 flex items-center gap-1">
              <Wallet className="w-3 h-3" /> Parcels received
            </span>
          </div>
        </div>
      </div>

      {/* Analytics & Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Trends */}
        <div className="bg-white border border-[#EBE2D8] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm text-[#2C1D15]">Member Registration Growth</h3>
              <p className="text-xs text-[#8C7A6B]">Monthly new verified user onboarding</p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 bg-[#DDD1BF]/40 text-[#5C4033] rounded-full">
              Last 6 Months
            </span>
          </div>

          <div className="h-56 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-[#EBE2D8]">
            {ADMIN_REGISTRATION_DATA.map((item, idx) => {
              const heightPct = Math.round((item.members / maxReg) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] font-bold text-[#5C4033] opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.members}
                  </div>
                  <div className="w-full bg-[#DDD1BF]/40 rounded-t-sm relative flex items-end overflow-hidden h-40">
                    <div
                      className="w-full bg-[#5C4033] group-hover:bg-[#2C1D15] transition-all rounded-t-sm"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-[#8C7A6B]">{item.month}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-[#8C7A6B]">
            <span>Initial: 420 (May)</span>
            <span className="font-semibold text-emerald-800">+238% Overall Growth</span>
            <span>Current: 1,420 (Oct)</span>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="bg-white border border-[#EBE2D8] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm text-[#2C1D15]">Inventory by Category</h3>
              <p className="text-xs text-[#8C7A6B]">Distribution across active platform listings</p>
            </div>
            <Link
              to="/admin/categories"
              className="text-xs font-semibold text-[#5C4033] hover:text-[#2C1D15] inline-flex items-center gap-1"
            >
              Manage <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {ADMIN_CATEGORIES.map((cat, idx) => {
              const pct = Math.round((cat.itemCount / maxCat) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-[#2C1D15]">{cat.name}</span>
                    <span className="text-[#8C7A6B] font-semibold">{cat.itemCount} listings</span>
                  </div>
                  <div className="w-full bg-[#DDD1BF]/40 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#5C4033] rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Platform Activity & Audit Log */}
      <div className="bg-white border border-[#EBE2D8] rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#EBE2D8] flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-[#2C1D15]">Administrative Audit Trail</h3>
            <p className="text-xs text-[#8C7A6B]">Recorded moderator actions, system events & dispute resolutions</p>
          </div>
          <Link
            to="/admin/history"
            className="text-xs font-semibold text-[#5C4033] hover:text-[#2C1D15] flex items-center gap-1"
          >
            Full Audit Logs <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="divide-y divide-[#EBE2D8]">
          {logs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-[#F9F6F0]/60 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#DDD1BF]/40 text-[#5C4033] flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#2C1D15]">{log.action.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] bg-[#DDD1BF]/40 text-[#5C4033] px-2 py-0.5 rounded font-mono">
                      {log.id}
                    </span>
                  </div>
                  <p className="text-xs text-[#5C4033] mt-0.5">{log.details}</p>
                  <div className="text-[11px] text-[#8C7A6B] mt-1 flex items-center gap-2">
                    <span>By: <strong className="text-[#2C1D15]">{log.admin}</strong></span>
                    <span>•</span>
                    <span>IP: {log.ip || '127.0.0.1'}</span>
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-[#8C7A6B] shrink-0 font-medium">
                {log.timestamp}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
