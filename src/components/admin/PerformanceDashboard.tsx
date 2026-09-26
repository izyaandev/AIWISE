'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { AnalyticsChart } from './AnalyticsChart';

export type PerformanceData = {
  firstAttemptPassRate: number;
  averageEngagementDepth: number;
  perfectScoreRate: number;
  knowledgeRetentionRate: number;

  moduleMastery: { name: string; score: number }[];
  knowledgeGrowth: { name: string; score: number }[];
  gradeConsistency: { name: string; score: number }[];
  engagementVsPerformance: { name: string; time: number; score: number }[];
  timeInModule: { name: string; minutes: number }[];
  scoreBreakdown: { name: string; value: number }[];
};

export function PerformanceDashboard({ data }: { data: PerformanceData }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '64px', marginTop: '64px' }}>
      
      {/* 4 Core High-Impact Metrics */}
      <div>
        <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--color-hairline)', paddingBottom: '16px' }}>
          <h2 className="heading-2" style={{ color: 'var(--color-ink)' }}>Course Efficiency & Impact</h2>
          <p className="body-md" style={{ color: 'var(--color-slate)', marginTop: '8px' }}>
            Key performance indicators demonstrating the positive impact and efficiency of the curriculum.
          </p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          {[
            { label: 'First-Attempt Pass Rate', value: `${data.firstAttemptPassRate}%`, color: 'var(--color-success)' },
            { label: 'Average Engagement Depth', value: `${data.averageEngagementDepth}%`, color: 'var(--color-primary-dark)' },
            { label: 'Perfect Score Rate', value: `${data.perfectScoreRate}%`, color: '#A28DFF' },
            { label: 'Knowledge Retention (Recovery)', value: `${data.knowledgeRetentionRate}%`, color: 'var(--color-ink)' },
          ].map(stat => (
            <Card key={stat.label} variant="base" style={{ padding: '28px' }}>
              <p className="body-sm" style={{ color: 'var(--color-slate)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.8rem', fontWeight: 600 }}>
                {stat.label}
              </p>
              <p className="heading-1" style={{ color: stat.color, margin: 0, fontSize: '2.5rem' }}>{stat.value}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Graphs Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div style={{ minHeight: '400px' }}>
          <AnalyticsChart 
            title="Module-wise Mastery" 
            type="bar" 
            data={data.moduleMastery.length ? data.moduleMastery : [{ name: 'No Data', score: 0 }]}
            bars={[{ key: 'score', color: 'var(--color-success)', name: 'Average Score (%)' }]}
          />
        </div>

        <div style={{ minHeight: '400px' }}>
          <AnalyticsChart 
            title="Knowledge Acquisition Growth" 
            type="line" 
            data={data.knowledgeGrowth.length ? data.knowledgeGrowth : [{ name: 'No Data', score: 0 }]}
            lines={[{ key: 'score', color: '#A28DFF', name: 'Avg Score Trend' }]}
          />
        </div>
      </div>

      {/* Graphs Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div style={{ minHeight: '400px' }}>
          <AnalyticsChart 
            title="Grade-wise Performance Consistency" 
            type="bar" 
            data={data.gradeConsistency.length ? data.gradeConsistency : [{ name: 'No Data', score: 0 }]}
            bars={[{ key: 'score', color: 'var(--color-primary-dark)', name: 'Average Score (%)' }]}
          />
        </div>

        <div style={{ minHeight: '400px' }}>
          <AnalyticsChart 
            title="Assessment Success Breakdown" 
            type="pie" 
            data={data.scoreBreakdown.length ? data.scoreBreakdown : [{ name: 'No Data', value: 1 }]}
          />
        </div>
      </div>

      {/* Graphs Row 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div style={{ minHeight: '400px' }}>
          <AnalyticsChart 
            title="Time-in-Module Engagement" 
            type="bar" 
            data={data.timeInModule.length ? data.timeInModule : [{ name: 'No Data', minutes: 0 }]}
            bars={[{ key: 'minutes', color: 'var(--color-ink)', name: 'Avg Minutes Spent' }]}
          />
        </div>

        <div style={{ minHeight: '400px' }}>
          <AnalyticsChart 
            title="Engagement vs Performance" 
            type="bar" 
            data={data.engagementVsPerformance.length ? data.engagementVsPerformance : [{ name: 'No Data', time: 0, score: 0 }]}
            bars={[
              { key: 'time', color: 'var(--color-slate)', name: 'Avg Minutes' },
              { key: 'score', color: 'var(--color-success)', name: 'Avg Score' }
            ]}
          />
        </div>
      </div>

    </div>
  );
}
