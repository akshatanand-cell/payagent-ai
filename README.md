# 💳 PayAgent AI — Autonomous Commerce & Procurement Protocol
> **Winner Track**: Grand Prize & Best Use of Agentic Commerce | **Sponsor Prize**: Best Use of AG Grid  
> Built for the **PayPal AI Hackathon 2026**

---

## 🌟 Overview
**PayAgent AI** is an autonomous agentic commerce protocol that bridges LLM reasoning with PayPal's global financial infrastructure. Rather than simply recommending products or static links, PayAgent AI acts as an autonomous procurement officer:
- Parses complex commercial procurement requests from natural language.
- Evaluates multi-vendor price matrices and terms.
- Validates purchases against strict budgetary safety constraints and risk scores.
- Dispatches and settles transactions through the **PayPal REST Orders v2 API**.
- Enforces **Human-in-the-Loop** checkpoints for out-of-policy or high-value orders.
- Streams live telemetry to an **AG Grid** financial command ledger for full auditability.

---

## 🚀 Key Features

### 1. Autonomous Agentic Procurement
- **Tool-Calling Architecture**: The agent queries vendor catalogs, runs multi-criteria matching, and interacts directly with PayPal APIs.
- **Spending Guardrails**: Configurable limits on single-transaction spend ($200 max), daily budgets ($500), and auto-approval thresholds ($80).
- **Dynamic Risk Scoring**: Assesses vendor trust, item category, and budget impact (0–100 risk score) before authorizing payments.

### 2. Deep PayPal Developer Platform Integration
- **PayPal Orders v2 API**: Programmatic creation of capture orders with item breakdown and customized purchase unit identifiers.
- **Human-in-the-Loop Consent**: When an order exceeds the safety threshold, the agent prompts for one-click human authorization with instant capture.
- **PayPal Sandbox Ready**: Plug-and-play sandbox keys or mock offline testing for reviewers.

### 3. Financial Telemetry with AG Grid (Sponsor Prize Contender)
- **Real-Time Audit Ledger**: Powered by `ag-grid-react` with sortable columns, risk filtering, and status badges.
- **Instant Row Animation**: New agent decisions are appended and animated in real-time.
- **Enterprise-Grade UI**: Dark quartz theme tailored for CFOs and finance operations teams.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 14+ (App Router, Turbopack, TypeScript)
- **Styling**: Tailwind CSS, Lucide Icons, Framer Motion
- **Payments**: PayPal REST API (v2 Checkout Orders & Capture), `@paypal/react-paypal-js`
- **Grid Telemetry**: AG Grid Community (`ag-grid-react`, `ag-grid-community`)
- **Agent Intelligence**: Natural language intent parser, policy validator, and tool dispatcher

---

## ⚡ Quick Start for Judges & Evaluators

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/payagent-ai.git
cd payagent-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_secret
PAYPAL_API_BASE=https://api-m.sandbox.paypal.com
```
*(Note: If left empty, PayAgent AI runs in offline deterministic sandbox mode so you can test all features immediately without entering credentials).*

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Testing the Agent

Try asking PayAgent in the interactive console:
- **Autonomous Approval Flow**: *"Provision GPU Cloud Instance under $60 for AI inference"* (Costs $49.99 → Autonomously approved & order prepared under $80 limit).
- **Human-in-the-Loop Flow**: *"Procure 2 ergonomic mechanical keyboards for the office"* (Costs $129.00 → Exceeds $80 threshold → Agent requests human authorization).
- **Policy Violation Flow**: Ask for an item exceeding the $200 single limit or $500 daily budget → Agent halts transaction and displays policy rejection.

---

## 📜 License
This project is licensed under the [MIT License](LICENSE).
