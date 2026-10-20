'use client';

import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

export interface TransactionRecord {
  id: string;
  timestamp: string;
  agentIntent: string;
  vendor: string;
  category: string;
  amount: number;
  paypalOrderId: string;
  status: 'COMPLETED' | 'PENDING_APPROVAL' | 'REJECTED';
  riskScore: number;
}

interface TransactionsGridProps {
  transactions: TransactionRecord[];
  onApprove?: (id: string) => void;
}

export default function TransactionsGrid({ transactions, onApprove }: TransactionsGridProps) {
  const columnDefs = useMemo<ColDef<TransactionRecord>[]>(() => [
    {
      field: 'paypalOrderId',
      headerName: 'PayPal Order ID',
      width: 170,
      cellRenderer: (params: any) => (
        <span className="font-mono text-xs font-semibold text-sky-400">
          {params.value || 'N/A'}
        </span>
      ),
    },
    {
      field: 'agentIntent',
      headerName: 'Autonomous Agent Intent',
      flex: 1.5,
      minWidth: 220,
    },
    {
      field: 'vendor',
      headerName: 'Vendor / Deliverable',
      flex: 1,
      minWidth: 160,
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 150,
      cellRenderer: (params: any) => (
        <span className="px-2 py-0.5 text-xs rounded bg-slate-800 text-slate-300 border border-slate-700">
          {params.value}
        </span>
      ),
    },
    {
      field: 'amount',
      headerName: 'Amount (USD)',
      width: 130,
      valueFormatter: (params) => `$${Number(params.value).toFixed(2)}`,
      cellClass: 'font-semibold text-emerald-400',
    },
    {
      field: 'riskScore',
      headerName: 'Safety Risk',
      width: 130,
      cellRenderer: (params: any) => {
        const score = params.value;
        const color =
          score > 60
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            : score > 30
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
        return (
          <span className={`px-2 py-0.5 text-xs rounded-full border ${color}`}>
            {score}/100 Risk
          </span>
        );
      },
    },
    {
      field: 'status',
      headerName: 'State',
      width: 150,
      cellRenderer: (params: any) => {
        const status = params.value;
        if (status === 'COMPLETED') {
          return (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Settled
            </span>
          );
        }
        if (status === 'PENDING_APPROVAL') {
          return (
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Needs Consent
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Policy Blocked
          </span>
        );
      },
    },
    {
      field: 'timestamp',
      headerName: 'Time',
      width: 110,
      cellClass: 'text-xs text-slate-400',
    },
  ], []);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <span>Live Audit Telemetry</span>
            <span className="text-xs font-normal text-sky-400 bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 rounded-full">
              Powered by AG Grid
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time ledger of autonomous agent spending decisions, policy compliance, and PayPal settlement states.
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Total Logs: <span className="text-white font-bold">{transactions.length}</span>
        </div>
      </div>

      <div className="ag-theme-quartz-dark w-full h-[320px] rounded-xl overflow-hidden border border-slate-800 shadow-xl">
        <AgGridReact
          rowData={transactions}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          animateRows={true}
          pagination={true}
          paginationPageSize={5}
          paginationPageSizeSelector={[5, 10, 20]}
        />
      </div>
    </div>
  );
}
