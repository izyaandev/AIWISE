'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { createCourse } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';

export default function CreateCourseForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [syllabus, setSyllabus] = useState('');
  
  const [modules, setModules] = useState([
    { title: '', lessons: [{ title: '', content: '' }] }
  ]);

  const addModule = () => {
    setModules([...modules, { title: '', lessons: [{ title: '', content: '' }] }]);
  };

  const addLesson = (moduleIndex: number) => {
    const newModules = [...modules];
    newModules[moduleIndex].lessons.push({ title: '', content: '' });
    setModules(newModules);
  };

  const updateModule = (index: number, val: string) => {
    const newModules = [...modules];
    newModules[index].title = val;
    setModules(newModules);
  };

  const updateLesson = (mIndex: number, lIndex: number, field: 'title' | 'content', val: string) => {
    const newModules = [...modules];
    newModules[mIndex].lessons[lIndex][field] = val;
    setModules(newModules);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('syllabus', syllabus);
    formData.append('modulesJson', JSON.stringify(modules));

    try {
      await createCourse(formData);
      router.push('/admin');
    } catch (err) {
      console.error(err);
      alert('Failed to create course');
    }
  };

  return (
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label className="body-md" style={{ fontWeight: 600 }}>Course Title</label>
        <input 
          type="text" required 
          value={title} onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Advanced AI Safety"
          style={{ padding: '12px 16px', fontSize: '1rem', border: '1px solid var(--color-hairline-strong)', borderRadius: '6px', background: 'var(--color-surface)' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label className="body-md" style={{ fontWeight: 600 }}>Description</label>
        <textarea 
          required rows={3}
          value={description} onChange={e => setDescription(e.target.value)}
          placeholder="Provide a detailed overview of the curriculum..."
          style={{ padding: '12px 16px', fontSize: '1rem', border: '1px solid var(--color-hairline-strong)', borderRadius: '6px', background: 'var(--color-surface)', resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label className="body-md" style={{ fontWeight: 600 }}>Syllabus (Markdown)</label>
        <textarea 
          rows={6}
          value={syllabus} onChange={e => setSyllabus(e.target.value)}
          placeholder="Course syllabus..."
          style={{ padding: '12px 16px', fontSize: '1rem', border: '1px solid var(--color-hairline-strong)', borderRadius: '6px', background: 'var(--color-surface)', resize: 'vertical', fontFamily: 'monospace' }}
        />
      </div>

      <div style={{ borderTop: '1px solid var(--color-hairline)', paddingTop: '32px', marginTop: '16px' }}>
        <h2 className="heading-3" style={{ marginBottom: '24px' }}>Curriculum Builder</h2>
        {modules.map((mod, mIndex) => (
          <div key={mIndex} style={{ padding: '24px', border: '1px solid var(--color-hairline)', borderRadius: '8px', marginBottom: '24px', backgroundColor: '#fdfcfb' }}>
            <label className="body-md" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Module {mIndex + 1} Title</label>
            <input 
              type="text" required 
              value={mod.title} onChange={e => updateModule(mIndex, e.target.value)}
              placeholder="Module Title"
              style={{ padding: '12px 16px', width: '100%', marginBottom: '24px', border: '1px solid var(--color-hairline-strong)', borderRadius: '6px' }}
            />
            
            <div style={{ marginLeft: '16px', paddingLeft: '24px', borderLeft: '2px solid var(--color-primary)' }}>
              {mod.lessons.map((lesson, lIndex) => (
                <div key={lIndex} style={{ marginBottom: '24px' }}>
                  <label className="body-md" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Lesson {lIndex + 1} Title</label>
                  <input 
                    type="text" required 
                    value={lesson.title} onChange={e => updateLesson(mIndex, lIndex, 'title', e.target.value)}
                    style={{ padding: '8px 12px', width: '100%', marginBottom: '12px', border: '1px solid var(--color-hairline-strong)', borderRadius: '6px' }}
                  />
                  <label className="body-md" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Lesson {lIndex + 1} Content (Markdown)</label>
                  <textarea 
                    required rows={3}
                    value={lesson.content} onChange={e => updateLesson(mIndex, lIndex, 'content', e.target.value)}
                    style={{ padding: '8px 12px', width: '100%', border: '1px solid var(--color-hairline-strong)', borderRadius: '6px' }}
                  />
                </div>
              ))}
              <Button type="button" variant="secondary" className="sm" onClick={() => addLesson(mIndex)}>+ Add Lesson</Button>
            </div>
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={addModule}>+ Add Module</Button>
      </div>

      <Button type="submit" variant="primary" className="lg" style={{ alignSelf: 'flex-start', marginTop: '16px' }}>Launch Course →</Button>
    </form>
  );
}
