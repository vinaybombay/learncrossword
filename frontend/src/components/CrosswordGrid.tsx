import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Clue } from '../types';

interface CrosswordGridProps {
  gridData: string[];
  gridSize: number;
  clues: Clue[];
  answers: Record<number, string>;
  onCellChange: (clueNumber: number, direction: 'across' | 'down', charIndex: number, char: string) => void;
  selectedClue: { number: number; direction: 'across' | 'down' } | null;
  onClueSelect: (clueNumber: number, direction: 'across' | 'down') => void;
  submitted: boolean;
}

interface CellPos {
  row: number;
  col: number;
}

interface ClueStart {
  clueNumber: number;
  direction: 'across' | 'down';
  row: number;
  col: number;
  length: number;
}

// Derive the starting cell for each clue by scanning gridData.
// For 'across': scan each row for a run of non-dot cells matching the answer length.
// For 'down':   scan each column for a run of non-dot cells matching the answer length.
function deriveClueStarts(gridData: string[], clues: Clue[]): ClueStart[] {
  const size = gridData.length;
  const isOpen = (r: number, c: number) => r >= 0 && r < size && c >= 0 && c < size && gridData[r][c] !== '.';

  const starts: ClueStart[] = [];

  for (const clue of clues) {
    if (clue.direction === 'across') {
      outer: for (let r = 0; r < size; r++) {
        for (let c = 0; c <= size - clue.length; c++) {
          // Check the run [c, c+length) is all open, and the cell before/after is closed/edge
          const runOk = Array.from({ length: clue.length }, (_, i) => isOpen(r, c + i)).every(Boolean);
          const leftClosed = c === 0 || !isOpen(r, c - 1);
          const rightClosed = c + clue.length === size || !isOpen(r, c + clue.length);
          if (runOk && leftClosed && rightClosed) {
            starts.push({ clueNumber: clue.number, direction: 'across', row: r, col: c, length: clue.length });
            break outer;
          }
        }
      }
    } else {
      outer: for (let c = 0; c < size; c++) {
        for (let r = 0; r <= size - clue.length; r++) {
          const runOk = Array.from({ length: clue.length }, (_, i) => isOpen(r + i, c)).every(Boolean);
          const topClosed = r === 0 || !isOpen(r - 1, c);
          const botClosed = r + clue.length === size || !isOpen(r + clue.length, c);
          if (runOk && topClosed && botClosed) {
            starts.push({ clueNumber: clue.number, direction: 'down', row: r, col: c, length: clue.length });
            break outer;
          }
        }
      }
    }
  }

  return starts;
}

// Return all cells covered by a clue given its start position.
function clueCells(start: ClueStart): CellPos[] {
  return Array.from({ length: start.length }, (_, i) =>
    start.direction === 'across'
      ? { row: start.row, col: start.col + i }
      : { row: start.row + i, col: start.col }
  );
}

const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  gridData,
  gridSize,
  clues,
  answers,
  onCellChange,
  selectedClue,
  onClueSelect,
  submitted,
}) => {
  const [cursor, setCursor] = useState<CellPos | null>(null);
  const [direction, setDirection] = useState<'across' | 'down'>('across');
  const gridRef = useRef<HTMLDivElement>(null);

  const clueStarts = useCallback(() => deriveClueStarts(gridData, clues), [gridData, clues])();

  // Build lookup: "row,col" -> array of ClueStart (a cell can be start of across + down)
  const startMap = new Map<string, ClueStart[]>();
  for (const cs of clueStarts) {
    const key = `${cs.row},${cs.col}`;
    if (!startMap.has(key)) startMap.set(key, []);
    startMap.get(key)!.push(cs);
  }

  // Build lookup: "row,col" -> array of ClueStart that cover this cell
  const coverMap = new Map<string, ClueStart[]>();
  for (const cs of clueStarts) {
    for (const cell of clueCells(cs)) {
      const key = `${cell.row},${cell.col}`;
      if (!coverMap.has(key)) coverMap.set(key, []);
      coverMap.get(key)!.push(cs);
    }
  }

  const isOpen = (r: number, c: number) =>
    r >= 0 && r < gridSize && c >= 0 && c < gridSize && gridData[r]?.[c] !== '.';

  // Find the clue start for the given cursor + direction
  const findClueForCell = (r: number, c: number, dir: 'across' | 'down'): ClueStart | null => {
    const covers = coverMap.get(`${r},${c}`) ?? [];
    return covers.find((cs) => cs.direction === dir) ?? null;
  };

  // Get the letter stored in answers for a given cell
  const getLetterAt = (r: number, c: number): string => {
    const covers = coverMap.get(`${r},${c}`) ?? [];
    for (const cs of covers) {
      const cells = clueCells(cs);
      const idx = cells.findIndex((p) => p.row === r && p.col === c);
      if (idx >= 0) {
        const ans = answers[cs.clueNumber] ?? '';
        return ans[idx] ?? '';
      }
    }
    return '';
  };

  // Get correct letter from gridData for submitted validation
  const getCorrectLetter = (r: number, c: number): string => gridData[r]?.[c] ?? '.';

  const handleCellClick = (r: number, c: number) => {
    if (!isOpen(r, c)) return;

    const isSameCell = cursor?.row === r && cursor?.col === c;
    let newDir = direction;

    if (isSameCell) {
      // Toggle direction on repeated click
      const covers = coverMap.get(`${r},${c}`) ?? [];
      const hasBoth = covers.some((cs) => cs.direction === 'across') && covers.some((cs) => cs.direction === 'down');
      if (hasBoth) {
        newDir = direction === 'across' ? 'down' : 'across';
        setDirection(newDir);
      }
    } else {
      setCursor({ row: r, col: c });
    }

    const cs = findClueForCell(r, c, newDir) ?? findClueForCell(r, c, newDir === 'across' ? 'down' : 'across');
    if (cs) {
      onClueSelect(cs.clueNumber, cs.direction);
      if (cs.direction !== newDir) {
        setDirection(cs.direction);
      }
    }

    gridRef.current?.focus();
  };

  // Sync external selectedClue → internal direction
  useEffect(() => {
    if (selectedClue) {
      setDirection(selectedClue.direction);
      // Move cursor to start of the selected clue
      const cs = clueStarts.find(
        (s) => s.clueNumber === selectedClue.number && s.direction === selectedClue.direction
      );
      if (cs) setCursor({ row: cs.row, col: cs.col });
    }
  }, [selectedClue]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!cursor) return;
    const { row, col } = cursor;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setDirection('across');
      for (let dc = 1; dc < gridSize; dc++) {
        if (isOpen(row, col + dc)) { setCursor({ row, col: col + dc }); break; }
      }
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setDirection('across');
      for (let dc = 1; dc < gridSize; dc++) {
        if (isOpen(row, col - dc)) { setCursor({ row, col: col - dc }); break; }
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setDirection('down');
      for (let dr = 1; dr < gridSize; dr++) {
        if (isOpen(row + dr, col)) { setCursor({ row: row + dr, col }); break; }
      }
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setDirection('down');
      for (let dr = 1; dr < gridSize; dr++) {
        if (isOpen(row - dr, col)) { setCursor({ row: row - dr, col }); break; }
      }
      return;
    }

    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      const cs = findClueForCell(row, col, direction);
      if (cs) {
        const cells = clueCells(cs);
        const idx = cells.findIndex((p) => p.row === row && p.col === col);
        onCellChange(cs.clueNumber, cs.direction, idx, ' ');
        // Move cursor back
        if (idx > 0) setCursor(cells[idx - 1]);
      }
      return;
    }

    if (/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
      const letter = e.key.toUpperCase();
      const cs = findClueForCell(row, col, direction);
      if (cs) {
        const cells = clueCells(cs);
        const idx = cells.findIndex((p) => p.row === row && p.col === col);
        onCellChange(cs.clueNumber, cs.direction, idx, letter);
        // Advance cursor
        if (idx < cells.length - 1) {
          setCursor(cells[idx + 1]);
        }
      }
    }
  };

  // Determine cell background class
  const getCellClass = (r: number, c: number): string => {
    if (!isOpen(r, c)) return 'bg-slate-900';

    const isCursor = cursor?.row === r && cursor?.col === c;
    const isHighlighted = (() => {
      if (!selectedClue) return false;
      const cs = clueStarts.find(
        (s) => s.clueNumber === selectedClue.number && s.direction === selectedClue.direction
      );
      if (!cs) return false;
      return clueCells(cs).some((p) => p.row === r && p.col === c);
    })();

    if (submitted) {
      const letter = getLetterAt(r, c);
      const correct = getCorrectLetter(r, c);
      if (letter && letter !== ' ') {
        if (letter === correct) return 'bg-emerald-100 border border-emerald-400';
        return 'bg-red-100 border border-red-400';
      }
    }

    if (isCursor) return 'bg-indigo-300 border border-indigo-500';
    if (isHighlighted) return 'bg-indigo-100 border border-indigo-300';
    return 'bg-white border border-slate-300';
  };

  // Cell size adapts to grid size
  const cellPx = gridSize <= 7 ? 48 : gridSize <= 9 ? 40 : 32;

  return (
    <div
      ref={gridRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="focus:outline-none select-none"
      aria-label="Crossword grid"
    >
      <div
        className="inline-grid gap-px bg-slate-400 border border-slate-400 rounded overflow-hidden mx-auto block"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, ${cellPx}px)`,
          gridTemplateRows: `repeat(${gridSize}, ${cellPx}px)`,
        }}
      >
        {Array.from({ length: gridSize }, (_, r) =>
          Array.from({ length: gridSize }, (_, c) => {
            const open = isOpen(r, c);
            const letter = open ? getLetterAt(r, c) : '';
            const clueLabel = startMap.get(`${r},${c}`)?.[0]?.clueNumber;

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`relative flex items-center justify-center ${getCellClass(r, c)} ${
                  open ? 'cursor-pointer' : 'cursor-default'
                }`}
                style={{ width: cellPx, height: cellPx }}
              >
                {open && clueLabel !== undefined && (
                  <span
                    className="absolute top-0.5 left-0.5 text-slate-600 leading-none font-medium"
                    style={{ fontSize: Math.max(8, cellPx / 5) }}
                  >
                    {clueLabel}
                  </span>
                )}
                {open && letter && letter !== ' ' && (
                  <span
                    className="font-bold text-slate-900 uppercase"
                    style={{ fontSize: Math.max(12, cellPx / 2.8) }}
                  >
                    {letter}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CrosswordGrid;
