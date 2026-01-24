export const prepInsights = [
    {
        id: "OVER_PREP_BURNOUT",
        when: { prepHours: "high" },
        message:
            "Students preparing for long hours every day often report higher anxiety and burnout. Beyond a point, studying more does not reduce stress and can make it worse.",
        source: "Placement stress survey (n≈130)"
    },
    {
        id: "CONSISTENCY_OVER_INTENSITY",
        when: { prepHours: "moderate", prepConsistency: "high" },
        message:
            "Moderate but consistent preparation is associated with lower anxiety and burnout compared to heavy, prolonged grinding.",
        source: "Placement stress survey (n≈130)"
    }
];
