export type Stage = {
    id: string;
    title: string;
    description: string;
    challenges: string[];
    reframing: string;
    actions: string[];
};

export const guidanceData: Stage[] = [
    {
        id: "online-tests",
        title: "Online Assessment Stage",
        description: "The initial filter. Often feels like a black box where effort doesn't always equal results.",
        challenges: [
            "Time pressure and anxiety during the test.",
            "Uncertainty about cut-offs and criteria.",
            "Feeling unlucky if questions were particularly hard.",
        ],
        reframing: "This stage is a high-volume filter, not a holistic judgment of your worth. Rejection here often means 'system mismatch' rather than 'skill issue'.",
        actions: [
            "Practice purely for speed on easy/medium problems.",
            "Simulate test environments (timer on, no music).",
            "Detach from the outcome immediately after submitting.",
        ]
    },
    {
        id: "technical-interview",
        title: "Technical Interviews",
        description: "Face-to-face evaluation of your problem-solving skills and core knowledge.",
        challenges: [
            "Brain freeze when asked a question.",
            "Pressure to be perfect in front of an interviewer.",
            "Fear of being exposed as an 'imposter'.",
        ],
        reframing: "Interviews are conversations, not interrogations. The interviewer usually wants you to succeed so they can close the position.",
        actions: [
            "Practice 'thinking aloud' even when solving alone.",
            "Prepare for 'I don't know' scenarios - it's okay to ask for hints.",
            "Mock interviews with peers are more valuable than LeetCode at this stage.",
        ]
    },
    {
        id: "hr-round",
        title: "HR & Managerial",
        description: "The final hurdle. Assessing cultural fit, communication, and long-term alignment.",
        challenges: [
            "Unexpected behavioral questions.",
            "Fear of saying the 'wrong' thing.",
            "Burnout peaking just before the finish line.",
        ],
        reframing: "They are checking if they can work with you every day. Be human, be honest, and show interest in them.",
        actions: [
            "Prepare stories using the STAR method (Situation, Task, Action, Result).",
            "Research the company's recent news or values.",
            "Rest well before this round - tired eyes hide enthusiasm.",
        ]
    },
    {
        id: "rejection",
        title: "Dealing with Rejection",
        description: "An inevitable part of the process for almost everyone. It hurts, but it's not the end.",
        challenges: [
            "Loss of confidence.",
            "Comparing yourself to friends who got placed.",
            "Spiral of negative thoughts ('I'll never get a job').",
        ],
        reframing: "Rejection is redirection. It’s data, not a definition. Every 'no' clears the path for the right 'yes'.",
        actions: [
            "Allow yourself to feel sad for a fixed time (e.g., 1 hour), then reset.",
            "Avoid social media immediately after a rejection.",
            "Review what you learned from the experience, but don't over-analyze.",
        ]
    }
];
