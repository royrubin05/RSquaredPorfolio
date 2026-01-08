
export const INITIAL_FUNDS = [
    { id: 1, name: "Fund I", vintage: "2020", committed: 10000000, deployed: 8500000, currency: "USD" },
    { id: 2, name: "Fund II", vintage: "2023", committed: 30000000, deployed: 12500000, currency: "USD" },
    { id: 3, name: "Fund III", vintage: "2025", committed: 50000000, deployed: 0, currency: "USD" },
];

export const INITIAL_INDUSTRIES = [
    { id: 1, name: "Artificial Intelligence", companies: 12 },
    { id: 2, name: "Fintech", companies: 8 },
    { id: 3, name: "Cybersecurity", companies: 5 },
    { id: 4, name: "Healthcare", companies: 4 },
    { id: 5, name: "Infrastructure", companies: 7 },
];

export const INITIAL_ROUND_LABELS = [
    { id: 1, name: "Pre-Seed", order: 1 },
    { id: 2, name: "Seed", order: 2 },
    { id: 3, name: "Series A", order: 3 },
    { id: 4, name: "Series B", order: 4 },
    { id: 5, name: "Series C", order: 5 },
    { id: 6, name: "Bridge", order: 6 },
    { id: 7, name: "Growth", order: 7 },
];

export const MOCK_INVESTORS = [
    { id: 1, name: "Insight Partners", deals: ["Alpha AI", "Databricks", "SentinelOne", "Wiz"] },
    { id: 2, name: "Index Ventures", deals: ["Plaid", "Figma", "Notion"] },
    { id: 3, name: "Sequoia", deals: ["Stripe", "SpaceX"] },
    { id: 4, name: "Naval Ravikant", deals: ["Uber", "Twitter", "Notion", "Stack Overflow", "Yammer"] },
    { id: 5, name: "Salesforce Ventures", deals: ["Snowflake"] },
    { id: 6, name: "Andreessen Horowitz", deals: ["Coinbase", "Substack"] },
    { id: 7, name: "Benchmark", deals: ["Elastic"] },
    { id: 8, name: "Founders Fund", deals: ["Palantir"] },
    { id: 9, name: "Lightspeed", deals: ["Snap"] },
    { id: 10, name: "Accel", deals: ["Slack"] },
    { id: 11, name: "Kleiner Perkins", deals: ["DoorDash"] },
    { id: 12, name: "Greylock", deals: ["Airbnb"] },
    { id: 13, name: "Khosla Ventures", deals: ["OpenAI"] },
    { id: 14, name: "Y Combinator", deals: ["Stripe"] },
    { id: 15, name: "First Round", deals: ["Uber"] },
    { id: 16, name: "Union Square Ventures", deals: ["Cloudflare"] },
    { id: 17, name: "Bessemer", deals: ["Twilio"] },
    { id: 18, name: "General Catalyst", deals: ["Stripe"] },
    { id: 19, name: "Tiger Global", deals: ["ByteDance"] },
    { id: 20, name: "SoftBank", deals: ["WeWork"] },
    { id: 21, name: "Coatue", deals: ["Instacart"] },
    { id: 22, name: "Ribbit Capital", deals: ["Coinbase"] },
];


export const INITIAL_COMPANIES = [
    { id: '1', name: "Nimble Types", status: "Active", industry: "AI / Legal", stage: "Series B", invested: 3700000, ownership: "12.5%", funds: ["Fund I", "Fund II"], country: "USA", oneLiner: "Legal AI automation platform.", category: "AI" },
    { id: '2', name: "Blue Ocean", status: "Active", industry: "Robotics", stage: "Series A", invested: 1500000, ownership: "8.2%", funds: ["Fund I"], country: "Denmark", oneLiner: "Autonomous underwater drones.", category: "Infra" },
    { id: '3', name: "Vertex AI", status: "Active", industry: "Infrastructure", stage: "Seed", invested: 1200000, ownership: "15.0%", funds: ["Fund II"], country: "Israel", oneLiner: "Next-gen GPU orchestration.", category: "AI" },
    { id: '4', name: "Darktrace", status: "Exit", industry: "Cybersecurity", stage: "IPO", invested: 5000000, ownership: "0.0%", funds: ["Fund I"], country: "UK", oneLiner: "AI-powered cyber defense.", category: "SaaS" },
];
