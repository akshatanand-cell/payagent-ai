'use client';

import React, { useState } from 'react';
import AgentChat from '@/components/AgentChat';
import TransactionsGrid, { TransactionRecord } from '@/components/TransactionsGrid';
import { DollarSign, ShieldAlert, Cpu, Sparkles, Layers, Sliders, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([
    {
      id: 'tx_init_1',
      timestamp: '18:30',
      agentIntent: 'Automated renewal for Cloud Search Cluster',
      vendor: 'DataStream Cloud',
      category: 'DEV_TOOLS',
      amount: 85.00,
      paypalOrderId: 'MOCK-ORD-89213',
      status: 'COMPLETED',
      riskScore: 28,
    },
    {
      id: 'tx_init_2',
      timestamp: '18:42',
      agentIntent: 'Office Ergonomic Mechanical Keyboards',
      vendor: 'ApexHardware Direct',
      category: 'OFFICE_SUPPLIES',
      amount: 129.00,
      paypalOrderId: 'MOCK-ORD-91104',
      status: 'PENDING_APPROVAL',
      riskScore: 65,
    },
  ]);

  const handleNewTransaction = (newTx: TransactionRecord) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleUpdateStatus = (orderId: string, status: 'COMPLETED' | 'REJECTED') => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.paypalOrderId === orderId ? { ...tx, status } : tx))
    );
  };

  const totalSpent = transactions
    .filter((t) => t.status === 'COMPLETED')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">
                  Pay<span className="text-sky-400">Agent</span>.ai
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  PayPal AI Hackathon 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Autonomous Agentic Commerce & Spending Guardrails</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300">PayPal REST v2 Sandbox: Connected</span>
            </div>
            <a
              href="https://paypalaihackathon.devpost.com/"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-md transition-all"
            >
              Devpost Project
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-8 flex-1">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Autonomous Spend Today</p>
              <h4 className="text-xl font-bold text-white tracking-tight">${totalSpent.toFixed(2)}</h4>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Daily Spending Cap</p>
              <h4 className="text-xl font-bold text-white tracking-tight">$500.00</h4>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Agent Tool Protocol</p>
              <h4 className="text-xl font-bold text-white tracking-tight">PayPal MCP / Orders v2</h4>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Human Approval Gate</p>
              <h4 className="text-xl font-bold text-white tracking-tight">&gt; $80.00 USD</h4>
            </div>
          </div>
        </div>

        {/* Core Agent Console */}
        <section className="w-full">
          <AgentChat
            onNewTransaction={handleNewTransaction}
            onUpdateTransactionStatus={handleUpdateStatus}
          />
        </section>

        {/* AG Grid Financial Telemetry Section */}
        <section className="w-full pb-8">
          <TransactionsGrid transactions={transactions} />
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <p>Built for the PayPal AI Hackathon 2026. Empowered by PayPal Developer Platform & AG Grid.</p>
      </footer>
    </main>
  );
}
