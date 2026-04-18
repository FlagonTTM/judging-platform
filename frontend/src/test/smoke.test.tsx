import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('smoke', () => {
  it('renders text', () => {
    render(<h1>привет</h1>);
    expect(screen.getByText('привет')).toBeInTheDocument();
  });
});
