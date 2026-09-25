'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { AnalyticsChart } from './AnalyticsChart';

export type ImpactData = {
  totalTargeted: number;
  completedCourse: number;
  earnedCertificates: number;
  completedSurvey: number;
  gradeWiseCompletion: { name: string; completed: number }[];
  studentImpact: { metric: string; score: number }[];
  behaviouralImpact: { metric: string; score: number }[];
  comparativeGradeGroup: { name: string; completed: number; positiveSurvey: number }[];
};

export function SurveyImpactDashboard({ data }: { data: ImpactData }) {
  const completedCoursePct = data.totalTargeted > 0 ? Math.round((data.completedCourse / data.totalTargeted) * 100) : 0;
  const completedSurveyPct = data.totalTargeted > 0 ? Math.round((data.completedSurvey / data.totalTargeted) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', marginTop: '64px' }}>
      
      {/* Overall Reach & Engagement */}
      <div>
        <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--color-hairline)', paddingBottom: '16px' }}>
          <h2 className="heading-2" style={{ color: 'var(--color-ink)' }}>Overall Reach & Engagement</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          {[
            { label: 'Total Targeted Students', value: data.totalTargeted, color: 'var(--color-ink)' },
            { label: 'Completed AI WISE Course', value: `${data.completedCourse} (${completedCoursePct}%)`, color: 'var(--color-primary-dark)' },
            { label: 'Certificates Earned', value: data.earnedCertificates, color: 'var(--color-success)' },
            { label: 'Completed Survey', value: `${data.completedSurvey} (${completedSurveyPct}%)`, color: 'var(--color-primary-dark)' },
          ].map(stat => (
            <Card key={stat.label} variant="base" style={{ padding: '28px' }}>
              <p className="body-sm" style={{ color: 'var(--color-slate)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.8rem', fontWeight: 600 }}>
                {stat.label}
              </p>
              <p className="heading-1" style={{ color: stat.color, margin: 0, fontSize: '2rem' }}>{stat.value}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        
        {/* Grade-wise/phase-wise completion */}
        <div style={{ minHeight: '400px' }}>
          <AnalyticsChart 
            title="Grade-wise Completion" 
            type="bar" 
            data={data.gradeWiseCompletion.length ? data.gradeWiseCompletion : [{ name: 'No Data', completed: 0 }]}
            bars={[{ key: 'completed', color: 'var(--color-primary)', name: 'Students Completed' }]}
          />
        </div>

        {/* Comparative Insights (Grades 5-8 vs 9-12) */}
        <div style={{ minHeight: '400px' }}>
          <AnalyticsChart 
            title="Grades 5-8 vs 9-12 Impact" 
            type="bar" 
            data={data.comparativeGradeGroup.length ? data.comparativeGradeGroup : [{ name: 'No Data', completed: 0, positiveSurvey: 0 }]}
            bars={[
              { key: 'completed', color: 'var(--color-primary)', name: 'Course Completions' },
              { key: 'positiveSurvey', color: 'var(--color-success)', name: 'Positive Survey Responses' }
            ]}
          />
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        
        {/* Student Impact */}
        <div style={{ minHeight: '400px' }}>
          <AnalyticsChart 
            title="Student Impact (% Positive)" 
            type="bar" 
            data={data.studentImpact.length ? data.studentImpact : [{ metric: 'No Data', score: 0 }]}
            bars={[{ key: 'score', color: 'var(--color-success)', name: '% Agree / Strongly Agree' }]}
          />
        </div>

        {/* Behavioural Impact */}
        <div style={{ minHeight: '400px' }}>
          <AnalyticsChart 
            title="Behavioural Impact (% Positive)" 
            type="bar" 
            data={data.behaviouralImpact.length ? data.behaviouralImpact : [{ metric: 'No Data', score: 0 }]}
            bars={[{ key: 'score', color: '#A28DFF', name: '% Agree / Strongly Agree' }]}
          />
        </div>

      </div>
    </div>
  );
}
