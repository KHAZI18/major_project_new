// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// Mock the public engine API so we assert the integration, not the BKT math.
const getNextDifficulty = vi.fn(() => 'hard');
const recordAttempt = vi.fn(() => Promise.resolve(0.5));
vi.mock('../engine/engineAPI', () => ({
  getNextDifficulty: (...a) => getNextDifficulty(...a),
  recordAttempt: (...a) => recordAttempt(...a),
}));

import ArithmeticGame from './ArithmeticGame';

function renderGame() {
  return render(
    <MemoryRouter>
      <ArithmeticGame />
    </MemoryRouter>
  );
}

describe('ArithmeticGame engine integration', () => {
  beforeEach(() => {
    getNextDifficulty.mockClear();
    recordAttempt.mockClear();
    getNextDifficulty.mockReturnValue('hard');
  });

  it('asks the engine for difficulty for the addition skill', () => {
    renderGame();
    expect(getNextDifficulty).toHaveBeenCalledWith('addition');
  });

  it('seeds the selected difficulty from the engine recommendation', () => {
    renderGame();
    // 'hard' -> the Hard button is the active (btn-primary) one on the start screen.
    const hardBtn = screen.getByRole('button', { name: /hard/i });
    expect(hardBtn.className).toContain('btn-primary');
  });

  it('records an attempt with the addition skill after an answer', async () => {
    const user = userEvent.setup();
    renderGame();
    await user.click(screen.getByRole('button', { name: /start match/i }));

    // After Start, the answer input is present; type any value and submit (Enter).
    const input = await screen.findByPlaceholderText('?');
    await user.type(input, '7{enter}');

    expect(recordAttempt).toHaveBeenCalledTimes(1);
    const arg = recordAttempt.mock.calls[0][0];
    expect(arg.skillId).toBe('addition');
    expect(typeof arg.correct).toBe('boolean');
    expect(typeof arg.responseTime).toBe('number');
  });
});
