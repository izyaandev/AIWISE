'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { bulkCreateUsers } from '@/app/actions/admin';

export function BulkCreateUsers() {
  const [rawInput, setRawInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ created: string[]; skipped: string[]; errors: string[] } | null>(null);
  const [parseError, setParseError] = useState('');

  // Parse lines of "email , password"
  const parseEntries = (raw: string) => {
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    const entries: { email: string; password: string }[] = [];
    const bad: string[] = [];

    for (const line of lines) {
      const commaIdx = line.indexOf(',');
      if (commaIdx === -1) {
        bad.push(line);
        continue;
      }
      const email = line.slice(0, commaIdx).trim();
      const password = line.slice(commaIdx + 1).trim();
      entries.push({ email, password });
    }

    return { entries, bad };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setParseError('');
    setResult(null);

    const { entries, bad } = parseEntries(rawInput);

    if (bad.length > 0) {
      setParseError(`These lines are missing a comma separator: ${bad.join(', ')}`);
      return;
    }

    if (entries.length === 0) {
      setParseError('Please enter at least one entry.');
      return;
    }

    setLoading(true);
    try {
      const res = await bulkCreateUsers(entries);
      setResult(res);
      if (res.created.length > 0) setRawInput(''); // clear on success
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '32px', borderBottom: '1px solid var(--color-hairline)', paddingBottom: '16px' }}>
        <h2 className="heading-3" style={{ color: 'var(--color-ink)', marginBottom: '8px' }}>Bulk Create Students</h2>
        <p className="body-sm" style={{ color: 'var(--color-slate)' }}>
          One entry per line in the format: <code style={{ backgroundColor: '#f4f1ec', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.9rem' }}>email , password</code>
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '620px' }}>
        <div>
          <label htmlFor="bulk-input" className="body-sm" style={{ display: 'block', color: 'var(--color-ink)', fontWeight: 600, marginBottom: '8px' }}>
            Students (email , password)
          </label>
          <textarea
            id="bulk-input"
            value={rawInput}
            onChange={e => { setRawInput(e.target.value); setParseError(''); }}
            rows={10}
            placeholder={
              'student1@school.ae , Welcome2024\nstudent2@school.ae , Hello1234\nstudent3@school.ae , Secure@99'
            }
            style={{
              width: '100%',
              padding: '16px',
              border: `1px solid ${parseError ? 'var(--color-error)' : 'var(--color-hairline-strong)'}`,
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              lineHeight: '1.7',
              backgroundColor: 'var(--color-canvas)',
              color: 'var(--color-ink)',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            required
          />
          {parseError && (
            <p className="body-sm" style={{ color: 'var(--color-error)', marginTop: '8px' }}>⚠ {parseError}</p>
          )}
          <p className="body-sm" style={{ color: 'var(--color-slate)', marginTop: '8px' }}>
            {rawInput.split('\n').filter(l => l.trim()).length} entries detected
          </p>
        </div>

        <div>
          <Button type="submit" variant="primary" disabled={loading} style={{ padding: '14px 32px' }}>
            {loading ? 'Creating accounts...' : 'Create All Accounts'}
          </Button>
        </div>
      </form>

      {result && (
        <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {result.created.length > 0 && (
            <Card variant="base" style={{ padding: '24px', borderLeft: '4px solid var(--color-success)' }}>
              <p className="body-md" style={{ fontWeight: 700, color: 'var(--color-success)', marginBottom: '12px' }}>
                ✓ {result.created.length} account{result.created.length !== 1 ? 's' : ''} created
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {result.created.map(e => (
                  <span key={e} style={{ padding: '4px 12px', backgroundColor: '#f0fdf4', color: '#166534', borderRadius: '999px', fontSize: '0.85rem', border: '1px solid #bbf7d0' }}>
                    {e}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {result.skipped.length > 0 && (
            <Card variant="base" style={{ padding: '24px', borderLeft: '4px solid var(--color-primary)' }}>
              <p className="body-md" style={{ fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: '12px' }}>
                ⊘ {result.skipped.length} already existed (skipped)
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {result.skipped.map(e => (
                  <span key={e} style={{ padding: '4px 12px', backgroundColor: '#fffbeb', color: '#92400e', borderRadius: '999px', fontSize: '0.85rem', border: '1px solid #fde68a' }}>
                    {e}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {result.errors.length > 0 && (
            <Card variant="base" style={{ padding: '24px', borderLeft: '4px solid var(--color-error)' }}>
              <p className="body-md" style={{ fontWeight: 700, color: 'var(--color-error)', marginBottom: '12px' }}>
                ✗ {result.errors.length} failed or invalid
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {result.errors.map(e => (
                  <span key={e} style={{ padding: '4px 12px', backgroundColor: '#fef2f2', color: '#991b1b', borderRadius: '999px', fontSize: '0.85rem', border: '1px solid #fecaca' }}>
                    {e}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
