import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Puzzle, PuzzleClue } from '../types';

interface CellPos {
  row: number;
  col: number;
}

interface PuzzleGridProps {
  puzzle: Puzzle;
  /** Cell-based answers: key = "row,col", value = single uppercase letter */
  answers: Record<string, string>;
  onCellChange: (row: number, col: number, char: string) => void;
  selectedClue: { number: number; direction: 'across' | 'down' } | null;
  onClueSelect: (number: number, direction: 'across' | 'down') => void;
  submitted: boolean;
}

/** All cells covered by a clue */
function clueCells(clue: PuzzleClue): CellPos[] {
  return Array.from({ length: clue.length }, (_, i) =>
    clue.direction === 'across'
      ? { row: clue.startRow, col: clue.startCol + i }
      : { row: clue.startRow + i, col: clue.startCol }
  );
}

const PuzzleGrid: React.FC<PuzzleGridProps> = ({
  puzzle,
  answers,
  onCellChange,
  selectedClue,
  onClueSelect,
  submitted,
}) => {
  const { gridData, clues, solution } = puzzle;
  const { rows, cols, cells } = gridData;

  const [cursor, setCursor] = useState<CellPos | null>(null);
  const [direction, setDirection] = useState<'across' | 'down'>('across');
  const gridRef = useRef<HTMLDivElement>(null);

  // ── Build cover map: "row,col" → clues that include this cell ────────────
  const coverMap = useCallback((): Map<string, PuzzleClue[]> => {
    const map = new Map<string, PuzzleClue[]>();
    for (const clue of clues) {
      for (const cell of clueCells(clue)) {
        const key = `${cell.row},${cell.col}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(clue);
      }
    }
    return map;
  }, [clues])();

  const isOpen = (r: number, c: number) =>
    r >= 0 && r < rows && c >= 0 && c < cols && !cells[r]?.[c]?.isBlack;

  const getLetterAt = (r: number, c: number): string =>
    answers[`${r},${c}`] ?? '';

  const findClueForCell = (r: number, c: number, dir: 'across' | 'down'): PuzzleClue | null =>
    (coverMap.get(`${r},${c}`) ?? []).find((cl) => cl.direction === dir) ?? null;

  const isInSelectedWord = (r: number, c: number): boolean => {
    if (!selectedClue) return false;
    const clue = clues.find(
      (cl) => cl.number === selectedClue.number && cl.direction === selectedClue.direction
    );
    if (!clue) return false;
    return clueCells(clue).some((p) => p.row === r && p.col === c);
  };

  // ── Cell size — adapts to the largest grid dimension ─────────────────────
  const maxDim = Math.max(rows, cols);
  const cellPx = maxDim <= 8 ? 48 : maxDim <= 12 ? 40 : maxDim <= 16 ? 34 : maxDim <= 20 ? 30 : 26;
  const numFontSize = Math.max(7, Math.floor(cellPx * 0.28));
  const letterFontSize = Math.max(12, Math.floor(cellPx * 0.55));

  // ── Sync external selectedClue → cursor + direction ──────────────────────
  useEffect(() => {
    if (selectedClue) {
      setDirection(selectedClue.direction);
      const clue = clues.find(
        (cl) => cl.number === selectedClue.number && cl.direction === selectedClue.direction
      );
      if (clue) setCursor({ row: clue.startRow, col: clue.startCol });
    }
  }, [selectedClue]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Click handler ─────────────────────────────────────────────────────────
  const handleCellClick = (r: number, c: number) => {
    if (!isOpen(r, c)) return;

    const isSameCell = cursor?.row === r && cursor?.col === c;
    let newDir = direction;

    if (isSameCell) {
      const covers = coverMap.get(`${r},${c}`) ?? [];
      const hasAcross = covers.some((cl) => cl.direction === 'across');
      const hasDown = covers.some((cl) => cl.direction === 'down');
      if (hasAcross && hasDown) {
        newDir = direction === 'across' ? 'down' : 'across';
        setDirection(newDir);
      }
    } else {
      setCursor({ row: r, col: c });
      const covers = coverMap.get(`${r},${c}`) ?? [];
      const hasCurrentDir = covers.some((cl) => cl.direction === direction);
      if (!hasCurrentDir) {
        const available = covers[0]?.direction;
        if (available) { newDir = available; setDirection(available); }
      }
    }

    const cl = findClueForCell(r, c, newDir) ?? findClueForCell(r, c, newDir === 'across' ? 'down' : 'across');
    if (cl) {
      onClueSelect(cl.number, cl.direction);
      if (cl.direction !== newDir) setDirection(cl.direction);
    }

    gridRef.current?.focus();
  };

  // ── Keyboard handler ──────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!cursor) return;
    const { row, col } = cursor;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (direction !== 'across') {
        setDirection('across');
        const cl = findClueForCell(row, col, 'across');
        if (cl) onClueSelect(cl.number, 'across');
      } else {
        for (let dc = 1; dc < cols; dc++) {
          if (isOpen(row, col + dc)) {
            setCursor({ row, col: col + dc });
            const cl = findClueForCell(row, col + dc, 'across');
            if (cl) onClueSelect(cl.number, 'across');
            break;
          }
        }
      }
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (direction !== 'across') {
        setDirection('across');
        const cl = findClueForCell(row, col, 'across');
        if (cl) onClueSelect(cl.number, 'across');
      } else {
        for (let dc = 1; dc < cols; dc++) {
          if (isOpen(row, col - dc)) {
            setCursor({ row, col: col - dc });
            const cl = findClueForCell(row, col - dc, 'across');
            if (cl) onClueSelect(cl.number, 'across');
            break;
          }
        }
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (direction !== 'down') {
        setDirection('down');
        const cl = findClueForCell(row, col, 'down');
        if (cl) onClueSelect(cl.number, 'down');
      } else {
        for (let dr = 1; dr < rows; dr++) {
          if (isOpen(row + dr, col)) {
            setCursor({ row: row + dr, col });
            const cl = findClueForCell(row + dr, col, 'down');
            if (cl) onClueSelect(cl.number, 'down');
            break;
          }
        }
      }
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (direction !== 'down') {
        setDirection('down');
        const cl = findClueForCell(row, col, 'down');
        if (cl) onClueSelect(cl.number, 'down');
      } else {
        for (let dr = 1; dr < rows; dr++) {
          if (isOpen(row - dr, col)) {
            setCursor({ row: row - dr, col });
            const cl = findClueForCell(row - dr, col, 'down');
            if (cl) onClueSelect(cl.number, 'down');
            break;
          }
        }
      }
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const sorted = [...clues].sort((a, b) => {
        if (a.direction !== b.direction) return a.direction === 'across' ? -1 : 1;
        return a.number - b.number;
      });
      const currentIdx = sorted.findIndex(
        (cl) => cl.number === selectedClue?.number && cl.direction === selectedClue?.direction
      );
      const nextIdx = e.shiftKey
        ? (currentIdx - 1 + sorted.length) % sorted.length
        : (currentIdx + 1) % sorted.length;
      const next = sorted[nextIdx];
      if (next) {
        setDirection(next.direction);
        setCursor({ row: next.startRow, col: next.startCol });
        onClueSelect(next.number, next.direction);
      }
      return;
    }

    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      const letter = getLetterAt(row, col);
      if (letter) {
        onCellChange(row, col, '');
      } else {
        const cl = findClueForCell(row, col, direction);
        if (cl) {
          const clCells = clueCells(cl);
          const idx = clCells.findIndex((p) => p.row === row && p.col === col);
          if (idx > 0) {
            const prev = clCells[idx - 1];
            setCursor(prev);
            onCellChange(prev.row, prev.col, '');
          }
        }
      }
      return;
    }

    if (/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
      const letter = e.key.toUpperCase();
      onCellChange(row, col, letter);
      // Advance to next cell in word
      const cl = findClueForCell(row, col, direction);
      if (cl) {
        const clCells = clueCells(cl);
        const idx = clCells.findIndex((p) => p.row === row && p.col === col);
        if (idx < clCells.length - 1) {
          setCursor(clCells[idx + 1]);
        }
      }
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const renderCell = (r: number, c: number) => {
    const cell = cells[r]?.[c];
    if (!cell) return null;

    const open = !cell.isBlack;
    const letter = open ? getLetterAt(r, c) : '';
    const cellNumber = open ? cell.number : null;
    const isCursor = cursor?.row === r && cursor?.col === c;
    const inWord = isInSelectedWord(r, c);

    let bgColor = '';
    let textColor = 'text-slate-900';
    const borderStyle = open ? 'border border-slate-400' : '';

    if (!open) {
      bgColor = 'bg-slate-900';
    } else if (submitted) {
      const entered = letter;
      const correct = solution?.[r]?.[c] ?? '';
      if (entered && entered !== ' ') {
        if (entered === correct) {
          bgColor = isCursor ? 'bg-emerald-300' : inWord ? 'bg-emerald-100' : 'bg-emerald-50';
          textColor = 'text-emerald-800';
        } else {
          bgColor = isCursor ? 'bg-red-300' : inWord ? 'bg-red-100' : 'bg-red-50';
          textColor = 'text-red-800';
        }
      } else {
        bgColor = isCursor ? 'bg-yellow-200' : inWord ? 'bg-blue-100' : 'bg-white';
      }
    } else {
      if (isCursor) {
        bgColor = 'bg-yellow-300';
      } else if (inWord) {
        bgColor = 'bg-[#c7d8e8]';
      } else {
        bgColor = 'bg-white';
      }
    }

    return (
      <div
        key={`${r}-${c}`}
        onClick={() => handleCellClick(r, c)}
        className={`relative ${bgColor} ${borderStyle} ${open ? 'cursor-pointer' : 'cursor-default'} select-none`}
        style={{ width: cellPx, height: cellPx }}
      >
        {open && cellNumber !== null && (
          <span
            className="absolute top-0 left-0.5 leading-none font-normal text-slate-800 z-10"
            style={{ fontSize: numFontSize, lineHeight: `${numFontSize + 2}px`, paddingTop: 1 }}
          >
            {cellNumber}
          </span>
        )}
        {open && letter && letter !== ' ' && (
          <span
            className={`absolute inset-0 flex items-center justify-center font-bold uppercase ${textColor}`}
            style={{ fontSize: letterFontSize, paddingTop: cellNumber !== null ? numFontSize - 2 : 0 }}
          >
            {letter}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      ref={gridRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="focus:outline-none select-none"
      aria-label="Crossword puzzle grid"
    >
      {/* Direction toggle */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => {
            setDirection('across');
            if (cursor) {
              const cl = findClueForCell(cursor.row, cursor.col, 'across');
              if (cl) onClueSelect(cl.number, 'across');
            }
          }}
          className={`px-3 py-1 rounded text-sm font-semibold transition ${
            direction === 'across' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          → Across
        </button>
        <button
          onClick={() => {
            setDirection('down');
            if (cursor) {
              const cl = findClueForCell(cursor.row, cursor.col, 'down');
              if (cl) onClueSelect(cl.number, 'down');
            }
          }}
          className={`px-3 py-1 rounded text-sm font-semibold transition ${
            direction === 'down' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          ↓ Down
        </button>
        <span className="text-xs text-slate-400 ml-1 hidden sm:inline">
          Click same cell to toggle · Tab cycles clues
        </span>
      </div>

      {/* Grid */}
      <div className="inline-block border-2 border-slate-900" style={{ lineHeight: 0 }}>
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, ${cellPx}px)`,
            gridTemplateRows: `repeat(${rows}, ${cellPx}px)`,
            gap: 0,
          }}
        >
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => renderCell(r, c))
          )}
        </div>
      </div>
    </div>
  );
};

export default PuzzleGrid;
