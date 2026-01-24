"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { ComponentProps } from "react";
// We need to import the type but not the module during SSR
import type PlotlyPlot from "react-plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), {
    ssr: false,
    loading: () => <Skeleton className="w-full h-[300px] rounded-lg" />
});

export default function PlotWrapper(props: ComponentProps<typeof PlotlyPlot>) {
    return <Plot {...props} />;
}
