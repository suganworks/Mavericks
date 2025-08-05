import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function SkillAnalyticsChart({ users }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (users.length > 0) {
      const skillCounts = {};
      users.forEach(user => {
        user.skills.forEach(skill => {
          skillCounts[skill.name] = (skillCounts[skill.name] || 0) + 1;
        });
      });

      const sortedSkills = Object.entries(skillCounts).sort(([,a],[,b]) => b-a).slice(0, 5);
      const labels = sortedSkills.map(([skill]) => skill);
      const data = sortedSkills.map(([,count]) => count);

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'User Count',
            data: data,
            backgroundColor: 'rgba(167, 139, 250, 0.4)',
            borderColor: 'rgba(167, 139, 250, 1)',
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          scales: {
            x: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#d1d5db' } },
            y: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#d1d5db' } }
          },
          plugins: { legend: { display: false } }
        }
      });
    }
  }, [users]);

  return <canvas ref={chartRef}></canvas>;
}