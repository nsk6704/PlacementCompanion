export const cgpaInsights = [
    {
        id: "CGPA_EXPECTATION_TRAP",
        when: { cgpa: "8-9" },
        message:
            "Students with strong academic performance often experience higher anxiety due to expectation pressure and fear of falling short, not lack of preparation.",
        source: "CGPA vs anxiety analysis"
    },
    {
        id: "CGPA_CONFIDENCE_BUFFER",
        when: { cgpa: "9+" },
        message:
            "Very high CGPA students tend to report lower anxiety, suggesting confidence and predictability reduce emotional pressure.",
        source: "CGPA vs anxiety analysis"
    }
];
