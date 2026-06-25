"use client";
import { useEffect, useRef, useState } from "react";
import type { GraphData } from "@/types/math";

interface Props {
  data: GraphData;
  height?: number;
}

export function GraphDisplay({ data, height = 400 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [Plotly, setPlotly] = useState<typeof import("plotly.js") | null>(null);

  useEffect(() => {
    import("plotly.js").then((mod) => setPlotly(mod.default));
  }, []);

  useEffect(() => {
    if (!Plotly || !ref.current || !data) return;

    const layout = {
      ...data.layout,
      height,
      autosize: true,
      font: { family: "Inter, system-ui, sans-serif", size: 12 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(249,250,251,1)",
      margin: { l: 48, r: 24, t: 48, b: 48 },
    };

    Plotly.newPlot(ref.current, data.data as Plotly.Data[], layout as Plotly.Layout, {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToRemove: ["sendDataToCloud", "select2d", "lasso2d"],
      displaylogo: false,
      toImageButtonOptions: { format: "png", filename: "graph", scale: 2 },
    });

    return () => {
      if (ref.current) Plotly.purge(ref.current);
    };
  }, [Plotly, data, height]);

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50">
      <div ref={ref} style={{ width: "100%", height }} />
    </div>
  );
}
