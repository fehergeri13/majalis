import React from "react";
import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { api } from "~/utils/api";
import { calcScore, useNow } from "~/components/score/SimpleScore";
import { eachMinuteOfInterval, format } from "date-fns";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

export function SimpleChart({ gameToken }: { gameToken: string }) {
  const game = api.example.getGame.useQuery({ gameToken });
  const scoreInputQuery = api.example.getScoreInput.useQuery({ gameToken }, { refetchInterval: 100_000 });

  const now = useNow();
  const start = game.isSuccess ? game.data.startedAt ?? new Date(now) : new Date(now);
  const end = game.isSuccess ? game.data.stoppedAt ?? new Date(now + 1) : new Date(now + 1);

  if (!scoreInputQuery.isSuccess) return null;

  const eachMinute = eachMinuteOfInterval({ start, end }).filter((time) => time.valueOf() > start.valueOf());

  const labels = eachMinute.map((date) => format(date, "HH: mm"));
  const scoreForMinutes = eachMinute.map((end) => calcScore({ ...scoreInputQuery.data, start, end }));
  const datasets = scoreInputQuery.data.teams.map((team) => {
    const hex = team.color;
    const a = 0.5;
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);

    return {
      label: team.name,
      data: scoreForMinutes.map((score) => score.find((item) => item.team.id === team.id)?.score ?? 0),
      borderColor: `rgb(${r}, ${g}, ${b})`,
      backgroundColor: `rgba(${r}, ${g}, ${b}, ${a})`,
    };
  });

  return (
    <Line
      options={{
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: false,
          },
        },
      }}
      data={{
        labels,
        datasets,
      }}
    />
  );
}
