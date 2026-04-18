import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EventTimer } from '../EventTimer';

describe('EventTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-19T10:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('показывает оставшееся время в формате Hч Mм Sс', () => {
    render(<EventTimer deadline="2026-04-19T13:00:00Z" />);
    expect(screen.getByText('3ч 00м 00с')).toBeInTheDocument();
  });

  it("показывает 'дедлайн прошёл' если deadline в прошлом", () => {
    render(<EventTimer deadline="2026-04-19T09:00:00Z" />);
    expect(screen.getByText(/дедлайн прошёл/i)).toBeInTheDocument();
  });

  it('ничего не рендерит без deadline', () => {
    const { container } = render(<EventTimer deadline={null} />);
    expect(container.firstChild).toBeNull();
  });
});
