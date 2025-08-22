import { describe, it, expect } from 'vitest';

function calcNextBadge(xp) {
  if (xp < 100) return 'Rookie Coder';
  if (xp < 300) return 'Apprentice';
  if (xp < 600) return 'Problem Solver';
  return 'Champion';
}

describe('calcNextBadge', () => {
  it('returns Rookie for <100', () => {
    expect(calcNextBadge(50)).toBe('Rookie Coder');
  });
  it('progresses through tiers', () => {
    expect(calcNextBadge(120)).toBe('Apprentice');
    expect(calcNextBadge(320)).toBe('Problem Solver');
    expect(calcNextBadge(900)).toBe('Champion');
  });
});
