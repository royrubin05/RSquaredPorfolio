"use client";

import { Building2, PieChart, FileText, CheckCircle2, HelpCircle, Wallet, ArrowRight, Info } from "lucide-react";

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-8 py-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <HelpCircle size={24} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Help & Documentation</h1>
                    </div>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        A guide to using the R-Squared Portfolio OS. Learn how to manage funds, track companies, and log complex financing rounds.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-8 py-12 space-y-12">

                {/* Section 1: Funds */}
                <section id="funds" className="scroll-mt-24">
                    <SectionHeader icon={Wallet} title="1. Managing Funds" description="Setting up the investment vehicles that hold your positions." />
                    <div className="grid gap-6 mt-6">
                        <Card>
                            <h3 className="text-base font-semibold text-gray-900 mb-2">Creating a New Fund</h3>
                            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                Before you can log any investments, you need to define the "Funds" (or entities) that made them.
                                This could be your main venture fund, an SPV, or a personal entity.
                            </p>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <li>Navigate to <strong>Settings</strong> in the sidebar.</li>
                                <li>Click on the <strong>Funds</strong> tab.</li>
                                <li>Click <strong>+ Add Fund</strong>.</li>
                                <li>Enter the Fund Name (e.g., "R-Squared Ventures I") and Total Capital (optional, for deployment tracking).</li>
                            </ol>
                        </Card>
                    </div>
                </section>

                {/* Section 2: Companies */}
                <section id="companies" className="scroll-mt-24">
                    <SectionHeader icon={Building2} title="2. Portfolio Companies" description="Adding new potential or active investments to your tracker." />
                    <div className="grid gap-6 mt-6">
                        <Card>
                            <h3 className="text-base font-semibold text-gray-900 mb-2">Adding a Company</h3>
                            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                You can add a company at any time, whether you've invested in it or are just tracking it.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex-shrink-0">1</div>
                                    <p className="text-sm text-gray-700 pt-0.5">Click <strong>+ New Investment</strong> on the Dashboard or Companies page.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex-shrink-0">2</div>
                                    <p className="text-sm text-gray-700 pt-0.5">Fill in the <strong>Company Name</strong> and basic details.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex-shrink-0">3</div>
                                    <div>
                                        <p className="text-sm text-gray-700 pt-0.5 font-medium">Initial Investment Status:</p>
                                        <ul className="mt-2 space-y-2 text-xs text-gray-600 pl-1">
                                            <li className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                                                <span><strong>Tracking:</strong> You haven't invested yet. Select "Tracking" status.</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                <span><strong>Active:</strong> You have invested. Select "Active" (and log the round next).</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </section>

                {/* Section 3: Rounds */}
                <section id="rounds" className="scroll-mt-24">
                    <SectionHeader icon={PieChart} title="3. Logging Rounds (The Core Workflow)" description="Recording financing events and your participation." />

                    <div className="space-y-8 mt-6">
                        {/* Concept: Participation */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                <Info size={20} />
                                Key Concept: "Participated" vs. "Tracking"
                            </h3>
                            <p className="text-sm text-blue-800/80 mb-4 leading-relaxed">
                                When logging a financing round, you must tell the system whether R-Squared invested in this specific round or just observed it.
                            </p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                                    <div className="font-semibold text-green-700 mb-1 flex items-center gap-2"><CheckCircle2 size={16} /> We Participated</div>
                                    <p className="text-xs text-gray-600">
                                        Use this when you deployed capital (new check or pro-rata).
                                        <br /><br />
                                        <strong>Action:</strong> Toggle "Did R-Squared Participate?" to ON. You *must* then add allocation details (Fund, Amount).
                                    </p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                                    <div className="font-semibold text-gray-700 mb-1 flex items-center gap-2"><FileText size={16} /> Tracking Only</div>
                                    <p className="text-xs text-gray-600">
                                        Use this when the company raised money (e.g., Series B) but you did not invest.
                                        <br /><br />
                                        <strong>Action:</strong> Keep "Did R-Squared Participate?" OFF. This updates the company's valuation and share price (mark-to-market) without adding new cost basis.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Card title="Logging a New Deal (Check)">
                                <ol className="list-decimal list-inside space-y-3 text-sm text-gray-600">
                                    <li>Go to the Company Page.</li>
                                    <li>Click <strong>Log Round</strong>.</li>
                                    <li><strong>Round Terms:</strong> Enter the Date, Stage (Seed, Series A), and Terms (Valuation, etc.).</li>
                                    <li><strong>Position:</strong> Toggle "Participated" ON.</li>
                                    <li><strong>Allocations:</strong> Click "Add Fund Split". Select "Ventures I" and enter the amount ($500k).</li>
                                    <li><strong>Save:</strong> The system calculates your shares and ownership automatically.</li>
                                </ol>
                            </Card>

                            <Card title="Logging a SAFE">
                                <ol className="list-decimal list-inside space-y-3 text-sm text-gray-600">
                                    <li>In the "Log Round" modal → Round Terms tab.</li>
                                    <li>Select <strong>Structure: SAFE / Convertible</strong>.</li>
                                    <li>Enter the <strong>Cap</strong> (e.g., $15M) and <strong>Discount</strong> (e.g., 20%).</li>
                                    <li>Enter your investment amount in the Position tab.</li>
                                    <li><strong>Note:</strong> SAFE ownership is estimated based on the Cap until it converts.</li>
                                </ol>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Section 4: SAFE Conversions */}
                <section id="conversions" className="scroll-mt-24">
                    <SectionHeader icon={ArrowRight} title="4. SAFE Conversions" description="When a priced round triggers SAFE conversion." />
                    <div className="grid gap-6 mt-6">
                        <Card>
                            <p className="text-sm text-gray-600 mb-4">
                                When you log a new Priced Round (e.g., Series A), existing SAFEs often convert into equity.
                            </p>
                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-sm text-amber-900">
                                <strong>Manual Conversion Workflow:</strong>
                                <ul className="list-disc list-inside mt-2 space-y-1 text-amber-800">
                                    <li>Go to the Company Page financing history grid.</li>
                                    <li>Find the SAFE round row.</li>
                                    <li>Click the <strong>Convert</strong> button (Icon).</li>
                                    <li>Enter the conversion terms (Shadow Class PPS usually differs from the new money PPS).</li>
                                    <li>This marks the SAFE as "Converted" and creates a new Equity line item.</li>
                                </ul>
                            </div>
                        </Card>
                    </div>
                </section>

            </div>
        </div>
    );
}

// Component Helpers
function SectionHeader({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <Icon className="text-blue-600" size={24} />
                {title}
            </h2>
            <p className="text-sm text-muted-foreground mt-1 ml-9">{description}</p>
        </div>
    );
}

function Card({ children, title }: { children: React.ReactNode, title?: string }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            {title && <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3>}
            {children}
        </div>
    );
}
