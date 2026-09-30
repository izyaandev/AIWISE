'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function QuizClient({ assessment, courseId, lessonId }: any) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSelect = (questionId: string, option: string) => {
    if (result) return;
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < assessment.questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }
    setSubmitting(true);
    
    try {
      const res = await fetch('/api/course/submit-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: assessment.id,
          lessonId,
          courseId,
          answers,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <Card variant="base" style={{ textAlign: 'center', padding: '64px', backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-hairline-strong)' }}>
        <h2 className="heading-1" style={{ marginBottom: '24px', color: result.passed ? 'var(--color-success)' : 'var(--color-error)' }}>
          {result.passed ? 'Quiz Passed!' : 'Quiz Failed'}
        </h2>
        <p className="body-lg" style={{ marginBottom: '48px', color: 'var(--color-slate)' }}>
          You scored <strong style={{ color: 'var(--color-ink)' }}>{result.score}%</strong>. A passing score is 80%.
        </p>
        
        {result.passed ? (
          <Button variant="primary" className="lg" onClick={() => {
            window.location.href = `/course/${courseId}`;
          }}>
            Continue Course
          </Button>
        ) : (
          <Button variant="secondary" className="lg" onClick={() => { setResult(null); setAnswers({}); }}>
            Retry Quiz
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div>
      <h1 className="heading-2" style={{ marginBottom: '48px', borderBottom: '1px solid var(--color-hairline)', paddingBottom: '24px', color: 'var(--color-ink)' }}>{assessment.title}</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
        {assessment.questions.map((q: any, i: number) => {
          const options = JSON.parse(q.options);
          return (
            <Card key={q.id} variant="base" style={{ padding: '32px', border: '1px solid var(--color-hairline)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 className="heading-3" style={{ marginBottom: '24px', color: 'var(--color-ink)' }}>
                {i + 1}. {q.text}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} role="radiogroup" aria-labelledby={`question-${q.id}`}>
                {options.map((opt: string) => (
                  <label 
                    key={opt}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '16px',
                      padding: '16px 24px',
                      border: answers[q.id] === opt ? '2px solid var(--color-primary)' : '1px solid var(--color-hairline-strong)',
                      backgroundColor: answers[q.id] === opt ? 'rgba(168, 139, 105, 0.05)' : 'var(--color-surface)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontWeight: answers[q.id] === opt ? 600 : 400
                    }}
                  >
                    <input 
                      type="radio" 
                      name={q.id} 
                      value={opt} 
                      checked={answers[q.id] === opt}
                      onChange={() => handleSelect(q.id, opt)}
                      style={{ transform: 'scale(1.2)', accentColor: 'var(--color-primary)' }}
                      aria-label={opt}
                    />
                    <span className="body-md" style={{ color: 'var(--color-ink)', margin: 0 }}>{opt}</span>
                  </label>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <div style={{ marginTop: '64px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--color-hairline)', paddingTop: '32px' }}>
        <Button variant="primary" className="lg" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Answers'}
        </Button>
      </div>
    </div>
  );
}
