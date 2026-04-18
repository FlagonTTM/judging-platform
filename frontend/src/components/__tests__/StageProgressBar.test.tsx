import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StageProgressBar } from '../StageProgressBar';
import type { TeamProgressItem } from '@/lib/types';

const items: TeamProgressItem[] = [
  { stage_id: '1', stage_name: 'Идея', order: 0, status: 'done', updated_at: null },
  { stage_id: '2', stage_name: 'MVP', order: 1, status: 'in_progress', updated_at: null },
  { stage_id: '3', stage_name: 'Демо', order: 2, status: 'pending', updated_at: null },
];

describe('StageProgressBar', () => {
  it('рендерит все этапы по порядку', () => {
    render(<StageProgressBar items={items} />);
    const labels = screen.getAllByTestId('stage-label').map((n) => n.textContent);
    expect(labels).toEqual(['Идея', 'MVP', 'Демо']);
  });

  it('отмечает этапы статусами через aria-label', () => {
    render(<StageProgressBar items={items} />);
    expect(screen.getByLabelText('Идея: done')).toBeInTheDocument();
    expect(screen.getByLabelText('MVP: in_progress')).toBeInTheDocument();
    expect(screen.getByLabelText('Демо: pending')).toBeInTheDocument();
  });

  it('показывает заглушку, если этапов нет', () => {
    render(<StageProgressBar items={[]} />);
    expect(screen.getByText(/нет этапов/i)).toBeInTheDocument();
  });
});
