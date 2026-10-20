import { createPayPalOrder } from './paypal';

export interface AgentPolicy {
  maxSingleTransactionUSD: number;
  dailyBudgetUSD: number;
  spentTodayUSD: number;
  requireApprovalAboveUSD: number;
  allowedCategories: string[];
}

export const defaultPolicy: AgentPolicy = {
  maxSingleTransactionUSD: 200,
  dailyBudgetUSD: 500,
  spentTodayUSD: 145.50,
  requireApprovalAboveUSD: 80,
  allowedCategories: ['CLOUD_COMPUTE', 'DEV_TOOLS', 'OFFICE_SUPPLIES', 'FREELANCE_SERVICES', 'API_CREDITS'],
};

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  vendor: string;
  priceUSD: number;
  rating: number;
  deliveryDays: number;
  description: string;
}

export const mockCatalog: CatalogItem[] = [
  {
    id: 'prod-001',
    name: 'High-Performance GPU Cloud Instance (16 vCPU, 64GB RAM)',
    category: 'CLOUD_COMPUTE',
    vendor: 'NebulaCompute Labs',
    priceUSD: 49.99,
    rating: 4.9,
    deliveryDays: 0,
    description: 'Instant provisioning for AI model fine-tuning and inference.',
  },
  {
    id: 'prod-002',
    name: 'Elastic Search & Analytics Cluster (30-day Managed)',
    category: 'DEV_TOOLS',
    vendor: 'DataStream Cloud',
    priceUSD: 85.00,
    rating: 4.8,
    deliveryDays: 0,
    description: 'Managed search indexing cluster with 99.99% uptime SLA.',
  },
  {
    id: 'prod-003',
    name: 'Premium Matte Black Ergonomic Mechanical Keyboards (Pack of 2)',
    category: 'OFFICE_SUPPLIES',
    vendor: 'ApexHardware Direct',
    priceUSD: 129.00,
    rating: 4.7,
    deliveryDays: 2,
    description: 'Hot-swappable tactile switches for engineering team workstations.',
  },
  {
    id: 'prod-004',
    name: 'Automated CI/CD Pipeline Security Audit & Penetration Report',
    category: 'FREELANCE_SERVICES',
    vendor: 'CyberGuard Certified Agents',
    priceUSD: 150.00,
    rating: 5.0,
    deliveryDays: 1,
    description: 'Comprehensive static and dynamic vulnerability analysis.',
  },
  {
    id: 'prod-005',
    name: 'Multi-Modal Vision API 1M Token Credit Voucher',
    category: 'API_CREDITS',
    vendor: 'CognitiveNet AI',
    priceUSD: 25.00,
    rating: 4.9,
    deliveryDays: 0,
    description: 'Direct API credit allocation for visual question answering.',
  },
];

export interface AgentDecision {
  type: 'ORDER_PREPARED' | 'APPROVAL_REQUIRED' | 'POLICY_VIOLATION' | 'INFORMATION_ONLY';
  message: string;
  reasoningSteps: string[];
  selectedItem?: CatalogItem;
  orderId?: string;
  amountUSD?: number;
  approvalToken?: string;
  policyStatus?: {
    withinDailyBudget: boolean;
    requiresHumanConsent: boolean;
    riskScore: number; // 0 - 100
  };
}

/**
 * Intelligent Agentic Commerce Core
 * Parses natural language user intent, executes semantic vendor matching,
 * validates against autonomous spending policies, and prepares PayPal payment orders.
 */
export async function processAgentIntent(
  userPrompt: string,
  currentPolicy: AgentPolicy = defaultPolicy
): Promise<AgentDecision> {
  const promptLower = userPrompt.toLowerCase();
  const reasoning: string[] = [];

  reasoning.push(`📥 Analyzing user prompt: "${userPrompt}"`);

  // 1. Semantic Catalog Lookup
  let bestMatch: CatalogItem | null = null;

  if (promptLower.includes('gpu') || promptLower.includes('cloud') || promptLower.includes('compute') || promptLower.includes('server')) {
    bestMatch = mockCatalog[0];
  } else if (promptLower.includes('search') || promptLower.includes('elastic') || promptLower.includes('data')) {
    bestMatch = mockCatalog[1];
  } else if (promptLower.includes('keyboard') || promptLower.includes('hardware') || promptLower.includes('office')) {
    bestMatch = mockCatalog[2];
  } else if (promptLower.includes('audit') || promptLower.includes('security') || promptLower.includes('penetration')) {
    bestMatch = mockCatalog[3];
  } else if (promptLower.includes('api') || promptLower.includes('token') || promptLower.includes('vision') || promptLower.includes('credit')) {
    bestMatch = mockCatalog[4];
  } else {
    // Default fallback to most versatile item
    bestMatch = mockCatalog[0];
  }

  reasoning.push(`🔍 Selected Vendor Deliverable: ${bestMatch.name} by ${bestMatch.vendor} ($${bestMatch.priceUSD.toFixed(2)})`);

  // 2. Spending Policy Verification
  const newProjectedDailyTotal = currentPolicy.spentTodayUSD + bestMatch.priceUSD;
  const withinDailyBudget = newProjectedDailyTotal <= currentPolicy.dailyBudgetUSD;
  const exceedsSingleMax = bestMatch.priceUSD > currentPolicy.maxSingleTransactionUSD;
  const requiresHumanConsent = bestMatch.priceUSD >= currentPolicy.requireApprovalAboveUSD;

  // AI Risk Score calculation
  const riskScore = Math.min(
    100,
    Math.round(
      (bestMatch.priceUSD / currentPolicy.maxSingleTransactionUSD) * 40 +
      (bestMatch.deliveryDays > 0 ? 15 : 5) +
      (requiresHumanConsent ? 25 : 0)
    )
  );

  reasoning.push(
    `🛡️ Policy Check: Single Limit ($${currentPolicy.maxSingleTransactionUSD}), Daily Budget Remaining ($${(
      currentPolicy.dailyBudgetUSD - currentPolicy.spentTodayUSD
    ).toFixed(2)}), Risk Score: ${riskScore}/100`
  );

  if (exceedsSingleMax || !withinDailyBudget) {
    reasoning.push(`❌ Policy Violation: Transaction exceeds authorized autonomous spending threshold.`);
    return {
      type: 'POLICY_VIOLATION',
      message: `Transaction halted by PayAgent Policy Engine: Amount $${bestMatch.priceUSD.toFixed(2)} exceeds authorized budget limit.`,
      reasoningSteps: reasoning,
      selectedItem: bestMatch,
      amountUSD: bestMatch.priceUSD,
      policyStatus: { withinDailyBudget, requiresHumanConsent, riskScore },
    };
  }

  // 3. PayPal Order Generation
  try {
    reasoning.push(`💳 Creating PayPal Sandbox Order for $${bestMatch.priceUSD.toFixed(2)} via PayPal REST v2 API...`);
    const paypalOrder = await createPayPalOrder({
      amount: bestMatch.priceUSD.toFixed(2),
      currency: 'USD',
      description: `PayAgent AI: ${bestMatch.name} from ${bestMatch.vendor}`,
      items: [
        {
          name: bestMatch.name,
          unit_amount: { currency_code: 'USD', value: bestMatch.priceUSD.toFixed(2) },
          quantity: '1',
          category: bestMatch.deliveryDays === 0 ? 'DIGITAL_GOODS' : 'PHYSICAL_GOODS',
        },
      ],
      customId: `AGENT_TASK_${Date.now()}`,
    });

    reasoning.push(`✅ PayPal Order #${paypalOrder.id} generated with status: ${paypalOrder.status}`);

    if (requiresHumanConsent) {
      reasoning.push(`⚠️ Amount $${bestMatch.priceUSD.toFixed(2)} is above approval threshold ($${currentPolicy.requireApprovalAboveUSD}). Human-in-the-loop authorization required.`);
      return {
        type: 'APPROVAL_REQUIRED',
        message: `I found the optimal supplier: "${bestMatch.name}" from ${bestMatch.vendor} for $${bestMatch.priceUSD.toFixed(2)}. Since this exceeds your $${currentPolicy.requireApprovalAboveUSD} threshold, please click approve to authorize PayPal payment.`,
        reasoningSteps: reasoning,
        selectedItem: bestMatch,
        orderId: paypalOrder.id,
        amountUSD: bestMatch.priceUSD,
        approvalToken: `TOK_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        policyStatus: { withinDailyBudget, requiresHumanConsent, riskScore },
      };
    }

    return {
      type: 'ORDER_PREPARED',
      message: `Procurement autonomous cycle complete! PayPal Sandbox Order prepared for ${bestMatch.name} ($${bestMatch.priceUSD.toFixed(2)}).`,
      reasoningSteps: reasoning,
      selectedItem: bestMatch,
      orderId: paypalOrder.id,
      amountUSD: bestMatch.priceUSD,
      policyStatus: { withinDailyBudget, requiresHumanConsent, riskScore },
    };
  } catch (err: any) {
    reasoning.push(`⚠️ Error creating PayPal order: ${err.message}`);
    return {
      type: 'POLICY_VIOLATION',
      message: `Failed to dispatch order with PayPal: ${err.message}`,
      reasoningSteps: reasoning,
      selectedItem: bestMatch,
      amountUSD: bestMatch.priceUSD,
    };
  }
}
