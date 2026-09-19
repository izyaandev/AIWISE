'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SurveyPage({ params }: { params: Promise<{ courseId: string }> }) {
  const [courseId, setCourseId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [surveyOpened, setSurveyOpened] = useState(false);

  useEffect(() => {
    params.then(p => {
      setCourseId(p.courseId);
    });
  }, [params]);

  const handleOpenSurvey = () => {
    window.open('https://forms.cloud.microsoft/r/7FNfUa3HED', '_blank');
    setSurveyOpened(true);
  };

  const handleClaimCertificate = async () => {
    if (!surveyOpened) {
      alert("Please open and complete the survey first before claiming your certificate!");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/course/submit-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
      });
      const data = await res.json();
      if (data.success) {
        // Redirect to certificate preview page
        window.location.href = `/course/${courseId}/certificate`;
      } else {
        alert(data.error || 'Failed to claim certificate');
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '64px 32px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 className="heading-2" style={{ marginBottom: '16px' }}>Post-Course Feedback</h1>
        <p className="body-lg" style={{ color: 'var(--color-slate)' }}>
          Please complete our official Microsoft Forms survey. Your feedback is essential for us to improve the curriculum!
        </p>
      </div>

      <Card variant="base" style={{ padding: '48px', textAlign: 'center' }}>
        
        <div style={{ marginBottom: '48px' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: '#e0f2fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
            <span style={{ fontSize: '32px' }}>📝</span>
          </div>
          <h2 className="heading-3" style={{ marginBottom: '16px' }}>Step 1: Complete the Survey</h2>
          <p className="body-md" style={{ color: 'var(--color-slate)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px auto' }}>
            Click the button below to open the survey in a new tab. Answer all questions honestly and click Submit.
          </p>
          <Button variant="primary" className="lg" onClick={handleOpenSurvey}>
            Open Survey in New Tab ↗
          </Button>
        </div>

        <div style={{ borderTop: '1px solid var(--color-hairline)', paddingTop: '48px' }}>
          <h2 className="heading-3" style={{ marginBottom: '16px' }}>Step 2: Claim Your Certificate</h2>
          <p className="body-md" style={{ color: 'var(--color-slate)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px auto' }}>
            Once you have submitted the survey, click the button below to instantly generate your verifiable certificate!
          </p>
          <Button 
            variant="secondary" 
            className="lg" 
            onClick={handleClaimCertificate} 
            disabled={submitting || !surveyOpened}
            style={{ 
              backgroundColor: surveyOpened ? 'var(--color-success)' : undefined,
              color: surveyOpened ? 'white' : undefined,
              borderColor: surveyOpened ? 'var(--color-success)' : undefined,
            }}
          >
            {submitting ? 'Generating...' : 'I have submitted the survey ➔ Claim Certificate'}
          </Button>
        </div>

      </Card>
    </div>
  );
}
