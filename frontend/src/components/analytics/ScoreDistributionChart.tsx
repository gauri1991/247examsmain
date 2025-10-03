'use client';

import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ScoreDistributionChartProps {
  data: {
    correct_answers: number;
    wrong_answers: number;
    unanswered: number;
  };
}

export function ScoreDistributionChart({ data }: ScoreDistributionChartProps) {
  const chartData = {
    labels: ['Correct', 'Wrong', 'Unanswered'],
    datasets: [
      {
        data: [data.correct_answers, data.wrong_answers, data.unanswered],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(156, 163, 175, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Answer Distribution',
      },
    },
  };

  return (
    <div className="h-[300px] flex items-center justify-center">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}