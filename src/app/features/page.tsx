
import { Lightbulb } from "lucide-react";
import { FeatureRequestManager } from "@/components/features/FeatureRequestManager";
import { getFeatureRequests } from "@/app/actions";

export const dynamic = 'force-dynamic';

export default async function FeaturesPage() {
    const featureRequests = await getFeatureRequests();

    return (
        <div className="flex-1 w-full p-6 md:p-8 max-w-5xl mx-auto min-h-screen">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                    <Lightbulb className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">
                        Roadmap, Bugs & Reporting
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Track feature requests, report bugs, and view system roadmap.
                    </p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                <FeatureRequestManager initialRequests={featureRequests} />
            </div>
        </div>
    );
}
