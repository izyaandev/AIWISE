'use client';

import React, { useRef } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/Button';

interface AnalyticsChartProps {
  title: string;
  type: 'bar' | 'line' | 'pie';
  data: any[];
  dataKey?: string; // used for pie chart value
  nameKey?: string; // used for pie chart name/label
  lines?: { key: string; color: string; name?: string }[];
  bars?: { key: string; color: string; name?: string }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF'];

export function AnalyticsChart({ title, type, data, dataKey, nameKey, lines, bars }: AnalyticsChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!chartRef.current) return;
    try {
      const canvas = await html2canvas(chartRef.current, { backgroundColor: '#ffffff' });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `${title.replace(/\s+/g, '_').toLowerCase()}_chart.png`;
      link.click();
    } catch (err) {
      console.error('Failed to download chart:', err);
    }
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {bars?.map((bar, idx) => (
                <Bar key={bar.key} dataKey={bar.key} name={bar.name || bar.key} fill={bar.color || COLORS[idx % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {lines?.map((line, idx) => (
                <Line key={line.key} type="monotone" dataKey={line.key} name={line.name || line.key} stroke={line.color || COLORS[idx % COLORS.length]} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey={dataKey || 'value'}
                nameKey={nameKey || 'name'}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="heading-3" style={{ fontSize: '1.2rem', color: 'var(--color-ink)' }}>{title}</h3>
        <Button variant="secondary" onClick={handleDownload} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
          Download Graph
        </Button>
      </div>
      <div ref={chartRef} style={{ width: '100%', height: '300px', backgroundColor: 'white', padding: '16px', borderRadius: '8px' }}>
        {renderChart()}
      </div>
    </div>
  );
}
