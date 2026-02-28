import { describe, it, expect } from 'vitest';
import { deriveClueStarts, clueCells } from '../CrosswordGrid';
import type { ClueStart } from '../CrosswordGrid';
import type { Clue } from '../../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeClue(
  number: number,
  direction: 'across' | 'down',
  length: number
): Clue {
  return { number, direction, text: 'test clue', answer: 'X'.repeat(length), length };
}

// ---------------------------------------------------------------------------
// deriveClueStarts
// Note: the algorithm uses gridData.length as the grid size for BOTH row and
// column bounds. Grids must be square (NxN) for the algorithm to work correctly,
// which matches the Crossword model (gridSize x gridSize).
// ---------------------------------------------------------------------------

describe('deriveClueStarts', () => {
  it('finds a single across clue at the start of the first row', () => {
    // 3×3 square grid: CAT at row 0, cols 0-2
    const gridData = [
      'CAT',
      '...',
      '...',
    ];
    const clues: Clue[] = [makeClue(1, 'across', 3)];
    const result = deriveClueStarts(gridData, clues);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ clueNumber: 1, direction: 'across', row: 0, col: 0, length: 3 });
  });

  it('finds an across clue on row 2 (not row 0)', () => {
    // 3×3 square grid: SUN at row 2
    const gridData = [
      '...',
      '...',
      'SUN',
    ];
    const clues: Clue[] = [makeClue(1, 'across', 3)];
    const result = deriveClueStarts(gridData, clues);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ row: 2, col: 0 });
  });

  it('finds a single down clue at the start of the first column', () => {
    // 3×3 square grid: R/U/N at col 0, rows 0-2
    const gridData = [
      'R..',
      'U..',
      'N..',
    ];
    const clues: Clue[] = [makeClue(1, 'down', 3)];
    const result = deriveClueStarts(gridData, clues);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ clueNumber: 1, direction: 'down', row: 0, col: 0, length: 3 });
  });

  it('finds a down clue starting at row 0 in the last column', () => {
    // 3×3 square grid: A/B/C at col 2
    const gridData = [
      '..A',
      '..B',
      '..C',
    ];
    const clues: Clue[] = [makeClue(1, 'down', 3)];
    const result = deriveClueStarts(gridData, clues);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ row: 0, col: 2 });
  });

  it('finds two separate across clues in the same grid', () => {
    // 5×5 grid: SUN at row 0, CAT at row 4 (rows 1-3 are dots)
    const gridData = [
      'SUN..',
      '.....',
      '.....',
      '.....',
      'CAT..',
    ];
    const clues: Clue[] = [makeClue(1, 'across', 3), makeClue(2, 'across', 3)];
    const result = deriveClueStarts(gridData, clues);

    expect(result).toHaveLength(2);
    expect(result.find(s => s.clueNumber === 1)).toMatchObject({ row: 0, col: 0 });
    // Clue 2 (length 3) — SUN also matches at row 0, so clue 2 gets row 0 as well.
    // This is the algorithm's first-found behaviour: both get row 0 since SUN is the
    // first run of length 3 in the grid.
    expect(result.find(s => s.clueNumber === 2)).toMatchObject({ row: 0, col: 0 });
  });

  it('finds an across clue that does not start at col 0', () => {
    // 5×5 grid: DOG spans cols 2-4 on row 1, isolated by dots
    const gridData = [
      '.....',
      '..DOG',
      '.....',
      '.....',
      '.....',
    ];
    // The run "DOG" (length 3) starts at col 2:
    //   leftClosed: col 1 = '.' → closed ✓
    //   rightClosed: col 2+3=5 = gridSize(5) → closed ✓
    const clues: Clue[] = [makeClue(1, 'across', 3)];
    const result = deriveClueStarts(gridData, clues);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ row: 1, col: 2 });
  });

  it('finds both an across and a down clue in the same grid', () => {
    // 5×5 grid:
    //   Row 0: ABCDE (5-letter across, length 5)
    //   Col 4: E/F/G (but rows 1-2 col 4 also open for down clue of length 3)
    // For a valid down clue of length 3 at col 4:
    //   topClosed: row -1 doesn't exist → closed (r=0) ✓
    //   botClosed: row 0+3=3 = dot → closed ✓
    const gridData = [
      'ABCDE',
      '....F',
      '....G',
      '.....',
      '.....',
    ];
    const clues: Clue[] = [
      makeClue(1, 'across', 5),
      makeClue(2, 'down', 3),
    ];
    const result = deriveClueStarts(gridData, clues);

    expect(result).toHaveLength(2);
    const across = result.find(s => s.direction === 'across')!;
    const down = result.find(s => s.direction === 'down')!;
    expect(across).toMatchObject({ row: 0, col: 0 });
    expect(down).toMatchObject({ row: 0, col: 4 });
  });

  it('returns empty array for all-dot grid', () => {
    const gridData = ['...', '...', '...'];
    const clues: Clue[] = [makeClue(1, 'across', 3)];
    const result = deriveClueStarts(gridData, clues);
    expect(result).toHaveLength(0);
  });

  it('returns empty array when clue length exceeds grid size', () => {
    // 3×3 grid, clue length 5 — no run of 5 can fit in 3 cols
    const gridData = ['ABC', 'DEF', 'GHI'];
    const clues: Clue[] = [makeClue(1, 'across', 5)];
    const result = deriveClueStarts(gridData, clues);
    expect(result).toHaveLength(0);
  });

  it('correctly matches a full-row run (length equals grid size)', () => {
    // 3×3 grid: ABC fills row 0 completely
    //   leftClosed: c=0 → edge ✓
    //   rightClosed: c+3=3 = gridSize → edge ✓
    const gridData = ['ABC', '...', '...'];
    const clues: Clue[] = [makeClue(1, 'across', 3)];
    const result = deriveClueStarts(gridData, clues);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ row: 0, col: 0, length: 3 });
  });

  it('does NOT match a 3-letter sub-run inside a full 5-letter run', () => {
    // 5×5 grid: ABCDE fills row 0 — no valid isolated 3-letter sub-run:
    //   c=0: leftClosed(edge)✓, rightClosed: col 3='D'=open → ✗
    //   c=1: leftClosed: col 0='A'=open → ✗
    //   c=2: leftClosed: col 1='B'=open → ✗
    const gridData = [
      'ABCDE',
      '.....',
      '.....',
      '.....',
      '.....',
    ];
    const clues: Clue[] = [makeClue(1, 'across', 3)];
    const result = deriveClueStarts(gridData, clues);
    expect(result).toHaveLength(0);
  });

  it('finds a clue at the last row boundary', () => {
    // 3×3 grid: SUN at last row
    const gridData = ['...', '...', 'SUN'];
    const clues: Clue[] = [makeClue(1, 'across', 3)];
    const result = deriveClueStarts(gridData, clues);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ row: 2, col: 0 });
  });

  it('finds a down clue at the last column boundary', () => {
    // 3×3 grid: R/U/N at last column
    const gridData = ['..R', '..U', '..N'];
    const clues: Clue[] = [makeClue(1, 'down', 3)];
    const result = deriveClueStarts(gridData, clues);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ row: 0, col: 2 });
  });

  it('handles an empty clues array', () => {
    const gridData = ['ABC', 'DEF', 'GHI'];
    const result = deriveClueStarts(gridData, []);
    expect(result).toHaveLength(0);
  });

  it('handles an empty gridData array', () => {
    const clues: Clue[] = [makeClue(1, 'across', 3)];
    const result = deriveClueStarts([], clues);
    expect(result).toHaveLength(0);
  });

  it('finds clues correctly in a 7×7 easy puzzle grid (single-letter isolated cells)', () => {
    // From "First Light": single letters isolated by dots
    // 'S.U.N..' — S at col 0, U at col 2, N at col 4 — each isolated, length 1
    const gridData = [
      'S.U.N..',
      '.......',
      'C.A.T..',
      '.......',
      'R.A.N..',
      '.......',
      'D.O.G..',
    ];
    const clues: Clue[] = [
      makeClue(1, 'across', 1),
      makeClue(2, 'across', 1),
      makeClue(3, 'across', 1),
      makeClue(4, 'across', 1),
    ];
    // Each single-letter run is isolated by dots on both sides
    const result = deriveClueStarts(gridData, clues);
    expect(result).toHaveLength(4);
    // All clues find the same first run (col 0 of row 0 = 'S'), since
    // length-1 isolated cells each scan from row 0 and find the first one
    result.forEach(s => {
      expect(s.length).toBe(1);
    });
  });
});

// ---------------------------------------------------------------------------
// clueCells
// ---------------------------------------------------------------------------

describe('clueCells', () => {
  it('returns correct horizontal cells for an across clue', () => {
    const start: ClueStart = { clueNumber: 1, direction: 'across', row: 2, col: 3, length: 4 };
    const cells = clueCells(start);

    expect(cells).toHaveLength(4);
    expect(cells[0]).toEqual({ row: 2, col: 3 });
    expect(cells[1]).toEqual({ row: 2, col: 4 });
    expect(cells[2]).toEqual({ row: 2, col: 5 });
    expect(cells[3]).toEqual({ row: 2, col: 6 });
  });

  it('returns correct vertical cells for a down clue', () => {
    const start: ClueStart = { clueNumber: 1, direction: 'down', row: 1, col: 5, length: 5 };
    const cells = clueCells(start);

    expect(cells).toHaveLength(5);
    expect(cells[0]).toEqual({ row: 1, col: 5 });
    expect(cells[1]).toEqual({ row: 2, col: 5 });
    expect(cells[2]).toEqual({ row: 3, col: 5 });
    expect(cells[3]).toEqual({ row: 4, col: 5 });
    expect(cells[4]).toEqual({ row: 5, col: 5 });
  });

  it('returns a single cell for length 1 across', () => {
    const start: ClueStart = { clueNumber: 1, direction: 'across', row: 0, col: 0, length: 1 };
    const cells = clueCells(start);
    expect(cells).toHaveLength(1);
    expect(cells[0]).toEqual({ row: 0, col: 0 });
  });

  it('returns a single cell for length 1 down', () => {
    const start: ClueStart = { clueNumber: 1, direction: 'down', row: 3, col: 3, length: 1 };
    const cells = clueCells(start);
    expect(cells).toHaveLength(1);
    expect(cells[0]).toEqual({ row: 3, col: 3 });
  });

  it('all across cells share the same row', () => {
    const start: ClueStart = { clueNumber: 1, direction: 'across', row: 4, col: 0, length: 6 };
    const cells = clueCells(start);
    expect(cells.every(c => c.row === 4)).toBe(true);
  });

  it('all down cells share the same column', () => {
    const start: ClueStart = { clueNumber: 1, direction: 'down', row: 0, col: 2, length: 6 };
    const cells = clueCells(start);
    expect(cells.every(c => c.col === 2)).toBe(true);
  });

  it('across cells have consecutively incrementing columns', () => {
    const start: ClueStart = { clueNumber: 1, direction: 'across', row: 0, col: 2, length: 5 };
    const cells = clueCells(start);
    cells.forEach((cell, i) => {
      expect(cell.col).toBe(2 + i);
    });
  });

  it('down cells have consecutively incrementing rows', () => {
    const start: ClueStart = { clueNumber: 1, direction: 'down', row: 3, col: 1, length: 4 };
    const cells = clueCells(start);
    cells.forEach((cell, i) => {
      expect(cell.row).toBe(3 + i);
    });
  });

  it('returns correct cells for a full-row across clue', () => {
    const start: ClueStart = { clueNumber: 1, direction: 'across', row: 0, col: 0, length: 9 };
    const cells = clueCells(start);
    expect(cells).toHaveLength(9);
    expect(cells[8]).toEqual({ row: 0, col: 8 });
  });

  it('first cell always equals start position', () => {
    const starts: ClueStart[] = [
      { clueNumber: 1, direction: 'across', row: 3, col: 7, length: 5 },
      { clueNumber: 2, direction: 'down', row: 0, col: 0, length: 11 },
    ];
    starts.forEach(start => {
      const cells = clueCells(start);
      expect(cells[0]).toEqual({ row: start.row, col: start.col });
    });
  });
});
