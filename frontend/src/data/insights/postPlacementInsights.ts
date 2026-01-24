export const postPlacementInsights = [
    {
        id: "STILL_APPLYING_PRESSURE",
        when: { placedStatus: "still_applying" },
        message:
            "Many students continue to feel pressure after getting placed. Relief and anxiety often coexist, especially due to comparison and upgrade pressure.",
        source: "Post-placement pressure analysis"
    },
    {
        id: "REJECTION_RESIDUE",
        when: { rejectionCount: "high" },
        message:
            "Multiple rejections before placement often leave a lasting emotional impact, even after receiving an offer.",
        source: "Rejection vs anxiety analysis"
    }
];
