import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import CrosswordGrid from '../CrosswordGrid';
import type { Clue } from '../../types';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

// 7×7 grid:
//   Row 0: CAT.... (3-letter across clue 1)
//   Rows 1-5: all dots
//   Row 6: HELLO.. (5-letter across clue 2)
// The two clues have DIFFERENT lengths so deriveClueStarts finds each uniquely.
// Open cells: 3 (row 0) + 5 (row 6) = 8.  Black cells: 49 - 8 = 41.
// Cell indices (row * 7 + col):
//   Row 0: cells 0-6   → CAT at cells 0,1,2
//   Row 6: cells 42-48 → HELLO at cells 42,43,44,45,46
const GRID_7x7 = [
  'CAT....',
  '.......',
  '.......',
  '.......',
  '.......',
  '.......',
  'HELLO..',
];
const CLUES_7x7: Clue[] = [
  { number: 1, direction: 'across', text: 'Feline (3)',    answer: 'CAT',   length: 3 },
  { number: 2, direction: 'across', text: 'Greeting (5)', answer: 'HELLO', length: 5 },
];

// 3×3 grid: ABC across row 0, ADG down col 0
// Cell (0,0) is the start of BOTH clues → direction toggle possible
const GRID_3x3_MIXED = [
  'ABC',
  'D..',
  'G..',
];
const CLUES_3x3_MIXED: Clue[] = [
  { number: 1, direction: 'across', text: 'Across (3)', answer: 'ABC', length: 3 },
  { number: 2, direction: 'down',   text: 'Down (3)',   answer: 'ADG', length: 3 },
];

const noop = () => {};

function renderGrid(overrides: Partial<React.ComponentProps<typeof CrosswordGrid>> = {}) {
  const defaults: React.ComponentProps<typeof CrosswordGrid> = {
    gridData: GRID_7x7,
    gridSize: 7,
    clues: CLUES_7x7,
    answers: {},
    onCellChange: vi.fn(),
    selectedClue: null,
    onClueSelect: vi.fn(),
    submitted: false,
  };
  return render(<CrosswordGrid {...defaults} {...overrides} />);
}

/** All cell divs inside the inner grid container */
function getCells() {
  const grid = document.querySelector('[aria-label="Crossword grid"]')!;
  return Array.from(grid.querySelector('div')!.children) as HTMLElement[];
}

function getGridEl() {
  return document.querySelector('[aria-label="Crossword grid"]') as HTMLElement;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe('CrosswordGrid rendering', () => {
  it('renders gridSize² cells for a 7×7 grid', () => {
    renderGrid();
    expect(getCells().length).toBe(49);
  });

  it('renders gridSize² cells for a 3×3 grid', () => {
    renderGrid({ gridData: GRID_3x3_MIXED, gridSize: 3, clues: CLUES_3x3_MIXED });
    expect(getCells().length).toBe(9);
  });

  it('black (dot) cells have bg-slate-900 class', () => {
    renderGrid();
    // 49 total - 8 open (3 in row 0 + 5 in row 6) = 41 black cells
    const black = getCells().filter(el => el.classList.contains('bg-slate-900'));
    expect(black.length).toBe(41);
  });

  it('open cells do not have bg-slate-900', () => {
    renderGrid();
    // CAT (3) + HELLO (5) = 8 open cells
    const open = getCells().filter(el => !el.classList.contains('bg-slate-900'));
    expect(open.length).toBe(8);
  });

  it('renders clue number label "1" in the grid', () => {
    renderGrid();
    const labels = Array.from(
      document.querySelectorAll('[aria-label="Crossword grid"] span')
    ).map(el => el.textContent);
    expect(labels).toContain('1');
  });

  it('renders clue number label "2" in the grid', () => {
    renderGrid();
    const labels = Array.from(
      document.querySelectorAll('[aria-label="Crossword grid"] span')
    ).map(el => el.textContent);
    expect(labels).toContain('2');
  });

  it('displays the letter from answers in the correct cell', () => {
    renderGrid({ answers: { 1: 'H' } });
    const letterSpans = Array.from(
      document.querySelectorAll('[aria-label="Crossword grid"] span')
    ).filter(el => /^[A-Z]$/.test(el.textContent ?? ''));
    expect(letterSpans.some(el => el.textContent === 'H')).toBe(true);
  });

  it('renders without crashing for an all-dot grid with no clues', () => {
    expect(() =>
      renderGrid({ gridData: ['...', '...', '...'], gridSize: 3, clues: [] })
    ).not.toThrow();
  });

  it('renders a 1×1 open grid as a single cell', () => {
    renderGrid({
      gridData: ['A'],
      gridSize: 1,
      clues: [{ number: 1, direction: 'across', text: 'Single (1)', answer: 'A', length: 1 }],
    });
    expect(getCells().length).toBe(1);
  });

  it('all open cells are white (bg-white) when nothing is selected', () => {
    renderGrid({ selectedClue: null });
    const open = getCells().filter(el => !el.classList.contains('bg-slate-900'));
    open.forEach(cell => expect(cell.classList.contains('bg-white')).toBe(true));
  });
});

// ---------------------------------------------------------------------------
// Cell click interactions
// ---------------------------------------------------------------------------

describe('CrosswordGrid cell clicks', () => {
  it('calls onClueSelect when a white cell (clue 1) is clicked', () => {
    const onClueSelect = vi.fn();
    renderGrid({ onClueSelect });

    fireEvent.click(getCells()[0]); // (0,0) → start of clue 1 across

    expect(onClueSelect).toHaveBeenCalledTimes(1);
    expect(onClueSelect).toHaveBeenCalledWith(1, 'across');
  });

  it('calls onClueSelect for clue 2 when its row is clicked', () => {
    const onClueSelect = vi.fn();
    renderGrid({ onClueSelect });

    // Clue 2 (HELLO) is at row 6, col 0 → cell index = 6*7 + 0 = 42
    fireEvent.click(getCells()[42]);

    expect(onClueSelect).toHaveBeenCalledWith(2, 'across');
  });

  it('does NOT call onClueSelect for a black cell', () => {
    const onClueSelect = vi.fn();
    renderGrid({ onClueSelect });

    fireEvent.click(getCells()[5]); // (0,5) = dot in row 0

    expect(onClueSelect).not.toHaveBeenCalled();
  });

  it('toggles direction on second click of a cell with both across and down clues', () => {
    const onClueSelect = vi.fn();
    renderGrid({
      gridData: GRID_3x3_MIXED,
      gridSize: 3,
      clues: CLUES_3x3_MIXED,
      onClueSelect,
    });

    const cell00 = getCells()[0]; // (0,0) — start of both across and down
    fireEvent.click(cell00); // first click → selects one direction
    fireEvent.click(cell00); // second click → toggles direction

    const directions = onClueSelect.mock.calls.map(([, dir]) => dir);
    // Should have called both directions at some point
    expect(directions).toContain('across');
    expect(directions).toContain('down');
  });
});

// ---------------------------------------------------------------------------
// Keyboard interactions
// ---------------------------------------------------------------------------

describe('CrosswordGrid keyboard navigation', () => {
  it('calls onCellChange with the correct args on a letter keypress', () => {
    const onCellChange = vi.fn();
    renderGrid({ onCellChange });

    fireEvent.click(getCells()[0]);           // cursor → (0,0), clue 1 across, idx 0
    fireEvent.keyDown(getGridEl(), { key: 'A' });

    expect(onCellChange).toHaveBeenCalledTimes(1);
    expect(onCellChange).toHaveBeenCalledWith(1, 'across', 0, 'A');
  });

  it('uppercases lowercase letter input', () => {
    const onCellChange = vi.fn();
    renderGrid({ onCellChange });

    fireEvent.click(getCells()[0]);
    fireEvent.keyDown(getGridEl(), { key: 'z' });

    expect(onCellChange).toHaveBeenCalledWith(1, 'across', 0, 'Z');
  });

  it('calls onCellChange with " " on Backspace', () => {
    const onCellChange = vi.fn();
    // Clue 1 is CAT (3 letters), so use CAT as the answer for clue 1
    renderGrid({ onCellChange, answers: { 1: 'CAT' } });

    fireEvent.click(getCells()[0]);
    fireEvent.keyDown(getGridEl(), { key: 'Backspace' });

    expect(onCellChange).toHaveBeenCalledWith(1, 'across', 0, ' ');
  });

  it('calls onCellChange with " " on Delete', () => {
    const onCellChange = vi.fn();
    // Clue 1 is CAT (3 letters), so use CAT as the answer for clue 1
    renderGrid({ onCellChange, answers: { 1: 'CAT' } });

    fireEvent.click(getCells()[0]);
    fireEvent.keyDown(getGridEl(), { key: 'Delete' });

    expect(onCellChange).toHaveBeenCalledWith(1, 'across', 0, ' ');
  });

  it('does not call onCellChange for Tab, Escape, Enter, digits', () => {
    const onCellChange = vi.fn();
    renderGrid({ onCellChange });

    fireEvent.click(getCells()[0]);
    ['Tab', 'Escape', 'Enter', '1', '9'].forEach(key =>
      fireEvent.keyDown(getGridEl(), { key })
    );

    expect(onCellChange).not.toHaveBeenCalled();
  });

  it('arrow keys do not trigger onCellChange', () => {
    const onCellChange = vi.fn();
    renderGrid({ onCellChange });

    fireEvent.click(getCells()[0]);
    ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].forEach(key =>
      fireEvent.keyDown(getGridEl(), { key })
    );

    expect(onCellChange).not.toHaveBeenCalled();
  });

  it('advances charIndex on each successive letter typed', () => {
    const onCellChange = vi.fn();
    renderGrid({ onCellChange });

    fireEvent.click(getCells()[0]);                      // cursor at (0,0) = idx 0
    fireEvent.keyDown(getGridEl(), { key: 'H' });        // fills idx 0, cursor → idx 1
    fireEvent.keyDown(getGridEl(), { key: 'E' });        // fills idx 1

    expect(onCellChange).toHaveBeenNthCalledWith(1, 1, 'across', 0, 'H');
    expect(onCellChange).toHaveBeenNthCalledWith(2, 1, 'across', 1, 'E');
  });

  it('does nothing on keyDown when no cursor is set', () => {
    const onCellChange = vi.fn();
    renderGrid({ onCellChange });

    // No cell clicked → cursor is null
    fireEvent.keyDown(getGridEl(), { key: 'A' });

    expect(onCellChange).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Submitted state — visual feedback
// ---------------------------------------------------------------------------

describe('CrosswordGrid submitted state', () => {
  it('correct cells get bg-emerald-100', () => {
    // Clue 1 is CAT (3 letters) at row 0 cols 0-2 → cells 0,1,2
    renderGrid({ answers: { 1: 'CAT' }, submitted: true });

    const cells = getCells();
    [0, 1, 2].forEach(i =>
      expect(cells[i].classList.contains('bg-emerald-100')).toBe(true)
    );
  });

  it('wrong cells get bg-red-100', () => {
    // Clue 1 is CAT: X ≠ C at index 0, A = A at index 1
    renderGrid({ answers: { 1: 'XAT' }, submitted: true });

    const cells = getCells();
    expect(cells[0].classList.contains('bg-red-100')).toBe(true);    // X ≠ C → wrong
    expect(cells[1].classList.contains('bg-emerald-100')).toBe(true); // A = A → correct
  });

  it('empty cells are not marked red when submitted', () => {
    renderGrid({ answers: {}, submitted: true });

    const openCells = getCells().filter(el => !el.classList.contains('bg-slate-900'));
    openCells.forEach(cell =>
      expect(cell.classList.contains('bg-red-100')).toBe(false)
    );
  });

  it('all cells in a fully correct second clue are green', () => {
    // Clue 2 is HELLO (5 letters) at row 6 cols 0-4 → cells 42,43,44,45,46
    renderGrid({ answers: { 2: 'HELLO' }, submitted: true });

    const cells = getCells();
    [42, 43, 44, 45, 46].forEach(i =>
      expect(cells[i].classList.contains('bg-emerald-100')).toBe(true)
    );
  });

  it('renders without crashing when submitted with no answers', () => {
    expect(() => renderGrid({ submitted: true, answers: {} })).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// selectedClue prop — highlighting
// ---------------------------------------------------------------------------

describe('CrosswordGrid selectedClue highlighting', () => {
  it('cells of selected clue get indigo highlighting (cursor=300, rest=100)', () => {
    renderGrid({ selectedClue: { number: 1, direction: 'across' } });

    const cells = getCells();
    // useEffect moves cursor to (0,0) → bg-indigo-300
    expect(cells[0].classList.contains('bg-indigo-300')).toBe(true);
    // Remaining cells of clue 1 (CAT: cols 1 and 2) → bg-indigo-100
    [1, 2].forEach(i =>
      expect(cells[i].classList.contains('bg-indigo-100')).toBe(true)
    );
  });

  it('cells outside the selected clue are not highlighted', () => {
    renderGrid({ selectedClue: { number: 1, direction: 'across' } });

    const cells = getCells();
    // Clue 2 cells (HELLO at row 6): cells 42-46 should not be highlighted
    [42, 43, 44, 45, 46].forEach(i => {
      expect(cells[i].classList.contains('bg-indigo-100')).toBe(false);
      expect(cells[i].classList.contains('bg-indigo-300')).toBe(false);
    });
  });

  it('switches highlighted cells when selectedClue prop changes', () => {
    const { rerender } = renderGrid({ selectedClue: { number: 1, direction: 'across' } });

    // Switch to clue 2 (HELLO at row 6, cols 0-4 → cells 42-46)
    rerender(
      <CrosswordGrid
        gridData={GRID_7x7} gridSize={7} clues={CLUES_7x7} answers={{}}
        onCellChange={noop}
        selectedClue={{ number: 2, direction: 'across' }}
        onClueSelect={noop}
        submitted={false}
      />
    );

    const cells = getCells();
    // Clue 2 (row 6): cursor at (6,0) = cell 42
    expect(cells[42].classList.contains('bg-indigo-300')).toBe(true);
    [43, 44, 45, 46].forEach(i =>
      expect(cells[i].classList.contains('bg-indigo-100')).toBe(true)
    );
    // Clue 1 (CAT at row 0): cells 0,1,2 no longer highlighted
    [0, 1, 2].forEach(i => {
      expect(cells[i].classList.contains('bg-indigo-100')).toBe(false);
      expect(cells[i].classList.contains('bg-indigo-300')).toBe(false);
    });
  });

  it('renders without crashing when selectedClue is null', () => {
    expect(() => renderGrid({ selectedClue: null })).not.toThrow();
  });
});
