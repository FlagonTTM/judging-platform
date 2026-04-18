import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StarRating } from './StarRating';

describe('StarRating', () => {
  it('рисует max звёзд', () => {
    render(<StarRating value={3} max={5} onChange={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(5);
  });

  it('подсвечивает первые value звёзд', () => {
    render(<StarRating value={3} max={5} onChange={() => {}} />);
    const stars = screen.getAllByRole('button');
    expect(stars[0]).toHaveAttribute('data-filled', 'true');
    expect(stars[2]).toHaveAttribute('data-filled', 'true');
    expect(stars[3]).toHaveAttribute('data-filled', 'false');
  });

  it('вызывает onChange с номером кликнутой звезды', async () => {
    const onChange = vi.fn();
    render(<StarRating value={0} max={5} onChange={onChange} />);
    const stars = screen.getAllByRole('button');
    await userEvent.click(stars[3]);
    expect(onChange).toHaveBeenCalledWith(4);
  });
});
