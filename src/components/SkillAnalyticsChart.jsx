import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function SkillAnalyticsChart({ data }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    try {
      if (data && data.length > 0) {
        // Handle skill growth data structure
        const labels = data.map(item => item.month);
        const userData = data.map(item => item.users);

        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        if (chartRef.current) {
          const ctx = chartRef.current.getContext('2d');
          chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
              labels: labels,
              datasets: [{
                label: 'Users with Skills',
                data: userData,
                backgroundColor: 'rgba(167, 139, 250, 0.2)',
                borderColor: 'rgba(167, 139, 250, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
              }]
            },
            options: {
              responsive: true,
              scales: {
                x: { 
                  grid: { color: 'rgba(255, 255, 255, 0.1)' }, 
                  ticks: { color: '#d1d5db' } 
                },
                y: { 
                  grid: { color: 'rgba(255, 255, 255, 0.1)' }, 
                  ticks: { color: '#d1d5db' } 
                }
              },
              plugins: { 
                legend: { 
                  display: true,
                  labels: { color: '#d1d5db' }
                } 
              }
            }
          });
        }
      } else {
        // Show empty state
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
      }
    } catch (error) {
      console.error('Error creating chart:', error);
      // Clean up on error
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    }
  }, [data]);

  return (
    <div>
      <canvas ref={chartRef}></canvas>
      {(!data || data.length === 0) && (
        <div className="text-center py-8 text-gray-400">
          <p>No skill growth data available</p>
        </div>
      )}
    </div>
  );
}