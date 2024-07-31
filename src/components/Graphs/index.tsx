import React, { useState, useEffect } from 'react';
import { getVideoStats, getChannelStats } from './data';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { VideoStatInterface } from '../Interfaces';
import {GraphProps} from '../Interfaces'


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const Graph: React.FC<GraphProps> = ({ video_id, channel_id }) => {
  const [graphData, setGraphData] = useState<VideoStatInterface[]>([]);
  const [graphLabels, setLabels] = useState<string[]>([]);
  const [graphValues, setValues] = useState<number[]>([]);

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 10,
        },
        min: 0,
      },
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      if (video_id) {
        const response = await getVideoStats(video_id);
        if (response) {
          setGraphData(response);
        }
      } else if (channel_id) {
        const response = await getChannelStats(channel_id);
        if (response) {
          setGraphData(response);
        }
      }
    };
    fetchData();
  }, [video_id, channel_id]);

  useEffect(() => {
    const lab = graphData.map((object) => object.date);
    const val = graphData.map((object) => object.viewCount);
    setLabels(lab);
    setValues(val);
  }, [graphData]);

  const data = {
    labels: graphLabels,
    datasets: [
      {
        label: 'Views',
        data: graphValues,
        borderColor: '#2288ff',
        backgroundColor: '#2288ff',
        yAxisID: 'y',
      },
    ],
  };

  return (
    <div style={{ width: '800px', height: '250px' }}>
      <Line options={options} data={data} />
    </div>
  )
};
