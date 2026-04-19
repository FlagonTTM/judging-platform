import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ScoreSlider } from './ScoreSlider';

describe('ScoreSlider', () => {
  it('показывает текущее значение и максимум', () => {
    render(<ScoreSlider value={7} max={10} onChange={() => {}} />);
    expect(screen.getByText('7 / 10')).toBeInTheDocument();
  });

  it('вызывает onChange с новым числом при сдвиге', () => {
    const onChange = vi.fn();
    render(<ScoreSlider value={0} max={10} onChange={onChange} />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '4' } });
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('блокируется в disabled-режиме', () => {
    render(<ScoreSlider value={3} max={10} onChange={() => {}} disabled />);
    expect(screen.getByRole('slider')).toBeDisabled();
  });
});
