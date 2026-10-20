'use client';

import React, { useState } from 'react';
import { Send, Bot, User, CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronRight, Sparkles, CreditCard, ShieldCheck } from 'lucide-react';
import { TransactionRecord } from './TransactionsGrid';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  reasoning?: string[];
  decision?: any;
}

interface AgentChatProps {
  onNewTransaction: (tx: TransactionRecord) => void;
  onUpdateTransactionStatus: (orderId: string, status: 'COMPLETED' | 'REJECTED') => void;
}

export default function AgentChat({ onNewTransaction, onUpdateTransactionStatus }: AgentChatProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});
  const [capturingOrderId, setCapturingOrderId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'agent',
      text: 'Hello! I am PayAgent AI, your autonomous procurement and commerce agent connected to the PayPal sandbox network. What deliverable or task would you like me to procure and settle?',
      timestamp: 'Just now',
    },
  ]);

  const toggleReasoning = (id: string) => {
    setExpandedReasoning((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || input;
    if (!promptToSend.trim() || loading) return;

    const userMsgId = 'msg-' + Date.now();
    const newUserMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    if (!customPrompt) setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptToSend }),
      });

      const data = await response.json();
      const agentMsgId = 'msg-' + (Date.now() + 1);

      const newAgentMsg: Message = {
        id: agentMsgId,
        sender: 'agent',
        text: data.message || 'Intent processed.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reasoning: data.reasoningSteps,
        decision: data,
      };

      setMessages((prev) => [...prev, newAgentMsg]);
      setExpandedReasoning((prev) => ({ ...prev, [agentMsgId]: true }));

      // Record in AG Grid Telemetry
      if (data.selectedItem) {
        const txStatus: 'COMPLETED' | 'PENDING_APPROVAL' | 'REJECTED' =
          data.type === 'APPROVAL_REQUIRED'
            ? 'PENDING_APPROVAL'
            : data.type === 'POLICY_VIOLATION'
            ? 'REJECTED'
            : 'COMPLETED';

        onNewTransaction({
          id: 'tx_' + Date.now(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          agentIntent: promptToSend,
          vendor: data.selectedItem.name + ' (' + data.selectedItem.vendor + ')',
          category: data.selectedItem.category,
          amount: data.amountUSD || data.selectedItem.priceUSD,
          paypalOrderId: data.orderId || 'POLICY_BLOCKED',
          status: txStatus,
          riskScore: data.policyStatus?.riskScore || 20,
        });
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'msg-' + Date.now(),
          sender: 'agent',
          text: `⚠️ Execution error: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorizePayment = async (orderId: string) => {
    setCapturingOrderId(orderId);
    try {
      const res = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();

      onUpdateTransactionStatus(orderId, 'COMPLETED');

      setMessages((prev) => [
        ...prev,
        {
          id: 'capture-' + Date.now(),
          sender: 'agent',
          text: `🎉 Payment authorization confirmed! PayPal Order #${orderId} was successfully settled. Deliverable provisioning is initiated with the vendor.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (error: any) {
      alert(`Capture failed: ${error.message}`);
    } finally {
      setCapturingOrderId(null);
    }
  };

  const presetQueries = [
    'Provision GPU Cloud Instance under $60 for AI inference',
    'Procure 2 ergonomic mechanical keyboards for the office',
    'Order CI/CD Security Audit & Penetration testing',
    'Purchase 1M Vision API Token credits',
  ];

  return (
    <div className="flex flex-col h-[650px] bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">PayAgent AI Assistant</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[11px] text-emerald-400 font-medium">PayPal Sandbox Active</span>
            </div>
            <p className="text-xs text-slate-400">Autonomous Spending Protocol & Policy Enforcer</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700/60 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Budget Guard: $500/day
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-start gap-3 max-w-[85%]">
              {msg.sender === 'agent' && (
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-sky-400" />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-tr-none shadow-lg shadow-sky-600/10'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none shadow-md'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Collapsible Reasoning Trace */}
                  {msg.reasoning && msg.reasoning.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-700/60">
                      <button
                        onClick={() => toggleReasoning(msg.id)}
                        className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors font-medium"
                      >
                        {expandedReasoning[msg.id] ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                        <span>Agent Reasoning Trace ({msg.reasoning.length} steps)</span>
                      </button>

                      {expandedReasoning[msg.id] && (
                        <div className="mt-2 space-y-1.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-300">
                          {msg.reasoning.map((step, idx) => (
                            <div key={idx} className="leading-snug">
                              {step}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Human-in-the-Loop Action Card */}
                  {msg.decision?.type === 'APPROVAL_REQUIRED' && msg.decision.orderId && (
                    <div className="mt-4 p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Human Authorization Required</span>
                        </div>
                        <span className="text-xs font-mono text-amber-400 font-bold">
                          ${msg.decision.amountUSD?.toFixed(2)} USD
                        </span>
                      </div>

                      <p className="text-xs text-amber-200/80">
                        PayPal Sandbox Order <strong className="font-mono text-white">#{msg.decision.orderId}</strong> was generated. Click authorize to settle directly through PayPal Sandbox.
                      </p>

                      <button
                        onClick={() => handleAuthorizePayment(msg.decision.orderId)}
                        disabled={capturingOrderId === msg.decision.orderId}
                        className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                      >
                        <CreditCard className="w-4 h-4" />
                        {capturingOrderId === msg.decision.orderId
                          ? 'Authorizing with PayPal...'
                          : `Authorize & Pay $${msg.decision.amountUSD?.toFixed(2)} via PayPal`}
                      </button>
                    </div>
                  )}

                  {/* Success Instant Settlement Card */}
                  {msg.decision?.type === 'ORDER_PREPARED' && msg.decision.orderId && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-300 text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Autonomous Order #{msg.decision.orderId} Ready</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">
                        ${msg.decision.amountUSD?.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-slate-500 px-1">
                  {msg.timestamp}
                </span>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-indigo-400" />
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-sky-400 animate-spin" />
            </div>
            <div className="bg-slate-800/80 p-3 rounded-2xl text-xs text-slate-400 flex items-center gap-2 border border-slate-700/40">
              <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span>PayAgent is querying vendor catalog and verifying PayPal policy...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-6 py-2 bg-slate-900/50 border-t border-slate-800/80 flex gap-2 overflow-x-auto no-scrollbar">
        {presetQueries.map((query, i) => (
          <button
            key={i}
            onClick={() => handleSend(query)}
            disabled={loading}
            className="text-[11px] whitespace-nowrap bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1 rounded-full border border-slate-700/50 transition-all shrink-0"
          >
            {query}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask PayAgent to procure supplies, cloud servers, or hire digital services..."
          disabled={loading}
          className="flex-1 bg-slate-950/70 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 text-white font-medium p-2.5 rounded-xl shadow-lg shadow-sky-500/20 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
