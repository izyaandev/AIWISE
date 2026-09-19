'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

export default function LessonViewer({ lesson, courseId, initialCompletion, nextLessonId }: any) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initialCompletion?.isCompleted || false);
  const [saving, setSaving] = useState(false);
  
  // Dwell time tracking
  const [dwellTime, setDwellTime] = useState(initialCompletion?.dwellTimeSeconds || 0);
  const targetDwellTime = lesson.minimumDwellTime || 0;
  
  useEffect(() => {
    if (completed || targetDwellTime === 0) return;
    
    const interval = setInterval(() => {
      setDwellTime((prev: number) => {
        const newTime = prev + 1;
        if (newTime >= targetDwellTime) {
          handleComplete(0, newTime);
          clearInterval(interval);
        }
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [completed, targetDwellTime]);

  // Video tracking
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const handleVideoTimeUpdate = () => {
    if (completed || !videoRef.current) return;
    
    const video = videoRef.current;
    if (video.duration > 0) {
      const percentage = (video.currentTime / video.duration) * 100;
      if (percentage >= 90) { // 90% threshold as per spec
        handleComplete(percentage);
      }
    }
  };

  const handleComplete = async (percentageWatched = 0, currentDwellTime = dwellTime) => {
    if (completed) return;
    setSaving(true);
    
    try {
      const res = await fetch('/api/course/complete-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          lessonId: lesson.id,
          courseId,
          percentageWatched,
          dwellTimeSeconds: currentDwellTime
        }),
      });
      
      if (res.ok) {
        setCompleted(true);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Link href={`/course/${courseId}`} aria-label="Back to Syllabus" style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '32px', color: 'var(--color-slate)', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid var(--color-hairline)' }}>
        ← Back to Syllabus
      </Link>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px', borderBottom: '1px solid var(--color-hairline)', paddingBottom: '16px' }}>
        <h1 className="heading-2" style={{ color: 'var(--color-ink)' }}>{lesson.title}</h1>
        {completed && <Badge style={{ padding: '6px 16px', fontSize: '0.9rem', backgroundColor: 'var(--color-success)', color: 'white', border: 'none' }}>Completed ✓</Badge>}
      </div>

      <Card variant="base" style={{ marginBottom: '48px', padding: '48px' }}>
        {lesson.mediaType === 'VIDEO' && lesson.mediaUrl && (
          <div style={{ marginBottom: '32px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-hairline-strong)', boxShadow: 'var(--shadow-sm)' }}>
            <video 
              ref={videoRef}
              src={lesson.mediaUrl} 
              controls 
              onTimeUpdate={handleVideoTimeUpdate}
              style={{ width: '100%', display: 'block' }}
              aria-label={`Video lesson: ${lesson.title}`}
            />
          </div>
        )}
        
        {lesson.content && (
          <div className="body-md markdown-content" style={{ color: 'var(--color-ink)', lineHeight: '1.7' }}>
            <ReactMarkdown>{lesson.content}</ReactMarkdown>
          </div>
        )}
      </Card>

      {!completed && targetDwellTime > 0 && lesson.mediaType !== 'VIDEO' && (
        <Card variant="base" style={{ marginBottom: '48px', textAlign: 'center', backgroundColor: '#fcfcfc', border: '1px dashed var(--color-slate)' }}>
          <p className="body-lg" style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
            Read this material. Minimum time: {targetDwellTime}s
          </p>
          <div style={{ marginTop: '24px', height: '8px', backgroundColor: 'var(--color-surface)', width: '100%', position: 'relative', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--color-hairline)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', backgroundColor: 'var(--color-primary)', width: `${Math.min(100, (dwellTime / targetDwellTime) * 100)}%`, transition: 'width 1s linear' }} />
          </div>
          <p className="body-sm" style={{ color: 'var(--color-slate)', marginTop: '16px' }}>
            Time spent: {dwellTime}s
          </p>
        </Card>
      )}

      {/* Basic Assessment UI Integration Placeholder */}
      {!completed && lesson.assessments?.length > 0 && (
        <Card variant="base" style={{ marginBottom: '48px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-hairline-strong)' }}>
          <h3 className="heading-3" style={{ marginBottom: '16px', color: 'var(--color-ink)' }}>Assessment Required</h3>
          <p className="body-md" style={{ marginBottom: '32px', color: 'var(--color-slate)' }}>Take the quiz to complete this lesson.</p>
          {dwellTime < targetDwellTime ? (
            <Button variant="secondary" className="lg" disabled style={{ padding: '12px 32px' }}>Please finish reading first</Button>
          ) : (
            <Link href={`/course/${courseId}/lesson/${lesson.id}/quiz/${lesson.assessments[0].id}`}>
              <Button variant="primary" className="lg" style={{ padding: '12px 32px' }}>Start Quiz</Button>
            </Link>
          )}
        </Card>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '64px' }}>
        {completed ? (
          nextLessonId ? (
            <a href={`/course/${courseId}/lesson/${nextLessonId}`} style={{ textDecoration: 'none' }}>
              <Button variant="primary" className="lg">Next Lesson →</Button>
            </a>
          ) : (
            <a href={`/course/${courseId}`} style={{ textDecoration: 'none' }}>
              <Button variant="primary" className="lg">Finish Course ★</Button>
            </a>
          )
        ) : (
          <Button 
            variant="secondary" 
            className="lg"
            disabled={true} 
            title="Complete the lesson requirements to continue"
          >
            Incomplete
          </Button>
        )}
      </div>
    </div>
  );
}
