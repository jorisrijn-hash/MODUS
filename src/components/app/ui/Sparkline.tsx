"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";

export function Sparkline({
  data,
  positive = true,
  height = 32,
}: {
  data: number[];
  positive?: boolean;
  height?: number;
}) {
  const points = data.map((v, i) => ({ i, v }));
  return (
    <div style={{ height, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={positive ? "#123C2D" : "#E03A2E"}
            strokeWidth={1.75}
            dot={false}
            isAnimationActive
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
