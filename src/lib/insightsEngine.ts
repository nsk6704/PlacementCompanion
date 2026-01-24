import { cgpaInsights } from "@/data/insights/cgpaInsights";
import { copingInsights } from "@/data/insights/copingInsights";
import { departmentInsights } from "@/data/insights/departmentInsights";
import { postPlacementInsights } from "@/data/insights/postPlacementInsights";
import { prepInsights } from "@/data/insights/prepInsights";
import { stageInsights } from "@/data/insights/stageInsights"; // Assumed existing or will created
import { Stage } from "@/data/guidance";

// Aggregate all insights
const allInsights = [
    ...cgpaInsights,
    ...copingInsights,
    ...departmentInsights,
    ...postPlacementInsights,
    ...prepInsights,
    ...stageInsights,
];

export interface UserProfile {
    department?: string;
    cgpa?: string;
    stage?: string;
    prepHours?: "low" | "moderate" | "high";
    prepConsistency?: "low" | "moderate" | "high";
    stress?: number;
    coping?: string;
    placedStatus?: "placed" | "still_applying";
    rejectionCount?: "none" | "low" | "high";
}

export interface Insight {
    id: string;
    when: Partial<UserProfile>; // Simple exact match for now
    message: string;
    source: string;
}

export function getRelevantInsights(profile: UserProfile): Insight[] {
    return allInsights.filter((insight) => {
        // Check if every condition in 'when' matches the profile
        return Object.entries(insight.when).every(([key, requiredValue]) => {
            const profileValue = profile[key as keyof UserProfile];

            // Handle numeric ranges or special logic if needed later
            // For now, simple strict equality or "high" threshold check
            if (key === 'stress') {
                // Example: if insight says stress: "high", match if profile.stress > 7
                // But currently data/insights seem to use string keys mostly.
                // Let's assume the data files use strings for simplicity as seen in previous steps:
                // prepHours: "high", cgpa: "8-9" etc.
                return profileValue === requiredValue;
            }

            // Default string match
            return profileValue === requiredValue;
        });
    }) as Insight[];
}
