'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';

interface Student {
  id: string;
  name: string | null;
  email: string | null;
  className: string | null;
}

interface ClassAnalyticsProps {
  students: Student[];
}

export function ClassAnalytics({ students }: ClassAnalyticsProps) {
  const [selectedClass, setSelectedClass] = useState<string>('All');

  const classes = ['All', ...Array.from(new Set(students.map(s => s.className).filter(Boolean) as string[]))];

  const filteredStudents = selectedClass === 'All'
    ? students
    : students.filter(s => s.className === selectedClass);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="heading-3" style={{ fontSize: '1.2rem', color: 'var(--color-ink)' }}>Student Directory (Read Only)</h3>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid var(--color-hairline)',
            fontSize: '0.9rem',
            outline: 'none'
          }}
        >
          {classes.map(c => (
            <option key={c} value={c}>{c === 'All' ? 'All Classes' : c}</option>
          ))}
        </select>
      </div>

      <Card variant="base" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fcfcfc', zIndex: 1 }}>
              <tr style={{ borderBottom: '1px solid var(--color-hairline)' }}>
                {['Name', 'Email', 'Class/Grade'].map(h => (
                  <th key={h} style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < filteredStudents.length - 1 ? '1px solid var(--color-hairline)' : 'none' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-ink)', whiteSpace: 'nowrap' }}>{u.name || '—'}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--color-slate)', fontSize: '0.9rem' }}>{u.email}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--color-ink)', fontWeight: 600 }}>{u.className || '—'}</td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: '48px', textAlign: 'center', color: 'var(--color-slate)' }}>No students found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
