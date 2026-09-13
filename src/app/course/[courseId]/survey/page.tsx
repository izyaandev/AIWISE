'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SurveyPage({ params }: { params: Promise<{ courseId: string }> }) {
  const router = useRouter();
  const [courseId, setCourseId] = useState('');
  const [survey, setSurvey] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    params.then(p => {
      setCourseId(p.courseId);
      // Fetch survey data
      fetch(`/api/course/survey?courseId=${p.courseId}`)
        .then(res => res.json())
        .then(data => {
          if (data.survey) {
            setSurvey(data.survey);
          }
          setLoading(false);
        });
    });
  }, [params]);

  const handleChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/course/submit-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          surveyId: survey.id,
          answers
        })
      });
      const data = await res.json();
      if (data.success) {
        // Redirect to dashboard to view certificate
        router.refresh();
        router.push('/dashboard');
      } else {
        alert(data.error || 'Failed to submit survey');
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '64px', textAlign: 'center' }}>Loading survey...</div>;
  if (!survey) return <div style={{ padding: '64px', textAlign: 'center' }}>No survey found for this course.</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '64px 32px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 className="heading-2" style={{ marginBottom: '16px' }}>Post-Course Survey</h1>
        <p className="body-lg" style={{ color: 'var(--color-slate)' }}>
          Please complete this short survey to unlock your certificate. Your feedback helps us improve!
        </p>
      </div>

      <Card variant="base">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {survey.questions.map((q: any) => (
            <div key={q.id}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '12px' }}>
                {q.order}. {q.text}
              </label>
              {q.type === 'RATING' ? (
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map(num => (
                    <label key={num} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name={q.id} 
                        value={num.toString()}
                        required
                        onChange={(e) => handleChange(q.id, e.target.value)}
                      />
                      {num}
                    </label>
                  ))}
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-slate)', marginLeft: '8px' }}>
                    (1 = Poor, 5 = Excellent)
                  </span>
                </div>
              ) : (
                <textarea 
                  required
                  rows={4}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    border: '1px solid var(--color-hairline)',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                />
              )}
            </div>
          ))}

          <Button type="submit" variant="primary" style={{ marginTop: '16px' }} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Survey & Claim Certificate'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
