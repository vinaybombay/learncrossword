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

export interface CellPos {
  row: number;
  col: number;
}

export interface ClueStart {
  clueNumber: number;
  direction: 'across' | 'down';
  row: number;
  col: number;
  length: number;
}

// Derive the starting cell for each clue by scanning gridData.
export function deriveClueStarts(gridData: string[], clues: Clue[]): ClueStart[] {
  const size = gridData.length;
  const isOpen = (r: number, c: number) =>
    r >= 0 && r < size && c >= 0 && c < size && gridData[r][c] !== '.';

  const starts: ClueStart[] = [];

  for (const clue of clues) {
    if (clue.direction === 'across') {
      outer: for (let r = 0; r < size; r++) {
        for (let c = 0; c <= size - clue.length; c++) {
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

export function clueCells(start: ClueStart): CellPos[] {
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

  const findClueForCell = (r: number, c: number, dir: 'across' | 'down'): ClueStart | null => {
    const covers = coverMap.get(`${r},${c}`) ?? [];
    return covers.find((cs) => cs.direction === dir) ?? null;
  };

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

  const getCorrectLetter = (r: number, c: number): string => gridData[r]?.[c] ?? '.';

  // Get the clue number label for a cell (smallest clue number at that start position)
  const getCellNumber = (r: number, c: number): number | undefined => {
    const starts = startMap.get(`${r},${c}`);
    if (!starts || starts.length === 0) return undefined;
    return Math.min(...starts.map((s) => s.clueNumber));
  };

  const handleCellClick = (r: number, c: number) => {
    if (!isOpen(r, c)) return;

    const isSameCell = cursor?.row === r && cursor?.col === c;
    let newDir = direction;

    if (isSameCell) {
      // Toggle direction on repeated click of same cell
      const covers = coverMap.get(`${r},${c}`) ?? [];
      const hasAcross = covers.some((cs) => cs.direction === 'across');
      const hasDown = covers.some((cs) => cs.direction === 'down');
      if (hasAcross && hasDown) {
        newDir = direction === 'across' ? 'down' : 'across';
        setDirection(newDir);
      }
    } else {
      setCursor({ row: r, col: c });
      // When clicking new cell, prefer to keep current direction if available
      const covers = coverMap.get(`${r},${c}`) ?? [];
      const hasCurrentDir = covers.some((cs) => cs.direction === direction);
      if (!hasCurrentDir) {
        // Switch to whichever direction is available
        const available = covers[0]?.direction;
        if (available) {
          newDir = available;
          setDirection(available);
        }
      }
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

  // Sync external selectedClue → internal direction + cursor
  useEffect(() => {
    if (selectedClue) {
      setDirection(selectedClue.direction);
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
      if (direction !== 'across') {
        setDirection('across');
        const cs = findClueForCell(row, col, 'across');
        if (cs) onClueSelect(cs.clueNumber, 'across');
      } else {
        for (let dc = 1; dc < gridSize; dc++) {
          if (isOpen(row, col + dc)) {
            const newCursor = { row, col: col + dc };
            setCursor(newCursor);
            const cs = findClueForCell(row, col + dc, 'across');
            if (cs) onClueSelect(cs.clueNumber, 'across');
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
        const cs = findClueForCell(row, col, 'across');
        if (cs) onClueSelect(cs.clueNumber, 'across');
      } else {
        for (let dc = 1; dc < gridSize; dc++) {
          if (isOpen(row, col - dc)) {
            setCursor({ row, col: col - dc });
            const cs = findClueForCell(row, col - dc, 'across');
            if (cs) onClueSelect(cs.clueNumber, 'across');
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
        const cs = findClueForCell(row, col, 'down');
        if (cs) onClueSelect(cs.clueNumber, 'down');
      } else {
        for (let dr = 1; dr < gridSize; dr++) {
          if (isOpen(row + dr, col)) {
            setCursor({ row: row + dr, col });
            const cs = findClueForCell(row + dr, col, 'down');
            if (cs) onClueSelect(cs.clueNumber, 'down');
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
        const cs = findClueForCell(row, col, 'down');
        if (cs) onClueSelect(cs.clueNumber, 'down');
      } else {
        for (let dr = 1; dr < gridSize; dr++) {
          if (isOpen(row - dr, col)) {
            setCursor({ row: row - dr, col });
            const cs = findClueForCell(row - dr, col, 'down');
            if (cs) onClueSelect(cs.clueNumber, 'down');
            break;
          }
        }
      }
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      // Tab cycles through clues
      const sortedClues = [...clueStarts].sort((a, b) => {
        if (a.direction !== b.direction) return a.direction === 'across' ? -1 : 1;
        return a.clueNumber - b.clueNumber;
      });
      const currentIdx = sortedClues.findIndex(
        (cs) => cs.clueNumber === selectedClue?.number && cs.direction === selectedClue?.direction
      );
      const nextIdx = e.shiftKey
        ? (currentIdx - 1 + sortedClues.length) % sortedClues.length
        : (currentIdx + 1) % sortedClues.length;
      const next = sortedClues[nextIdx];
      if (next) {
        setDirection(next.direction);
        setCursor({ row: next.row, col: next.col });
        onClueSelect(next.clueNumber, next.direction);
      }
      return;
    }

    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      const cs = findClueForCell(row, col, direction);
      if (cs) {
        const cells = clueCells(cs);
        const idx = cells.findIndex((p) => p.row === row && p.col === col);
        const currentLetter = getLetterAt(row, col);
        if (currentLetter && currentLetter !== ' ') {
          onCellChange(cs.clueNumber, cs.direction, idx, ' ');
        } else if (idx > 0) {
          // Move back and clear
          const prevCell = cells[idx - 1];
          setCursor(prevCell);
          onCellChange(cs.clueNumber, cs.direction, idx - 1, ' ');
        }
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
        // Advance cursor to next cell in word
        if (idx < cells.length - 1) {
          setCursor(cells[idx + 1]);
        }
      }
    }
  };

  // Determine if a cell is part of the currently selected clue's word
  const isInSelectedWord = (r: number, c: number): boolean => {
    if (!selectedClue) return false;
    const cs = clueStarts.find(
      (s) => s.clueNumber === selectedClue.number && s.direction === selectedClue.direction
    );
    if (!cs) return false;
    return clueCells(cs).some((p) => p.row === r && p.col === c);
  };

  // Cell size adapts to grid size — Guardian uses ~31px for 15x15
  const cellPx = gridSize <= 7 ? 52 : gridSize <= 9 ? 44 : gridSize <= 13 ? 36 : 31;
  const numFontSize = Math.max(7, Math.floor(cellPx * 0.28));
  const letterFontSize = Math.max(13, Math.floor(cellPx * 0.55));

  const renderCell = (r: number, c: number) => {
    const open = isOpen(r, c);
    const letter = open ? getLetterAt(r, c) : '';
    const cellNumber = open ? getCellNumber(r, c) : undefined;
    const isCursor = cursor?.row === r && cursor?.col === c;
    const inWord = isInSelectedWord(r, c);

    let bgColor = '';
    let textColor = 'text-slate-900';
    let borderStyle = '';

    if (!open) {
      // Black cell — Guardian style solid black
      bgColor = 'bg-slate-900';
      borderStyle = '';
    } else if (submitted) {
      const typedLetter = letter;
      const correct = getCorrectLetter(r, c);
      if (typedLetter && typedLetter !== ' ') {
        if (typedLetter === correct) {
          bgColor = isCursor ? 'bg-emerald-300' : inWord ? 'bg-emerald-100' : 'bg-emerald-50';
          textColor = 'text-emerald-800';
        } else {
          bgColor = isCursor ? 'bg-red-300' : inWord ? 'bg-red-100' : 'bg-red-50';
          textColor = 'text-red-800';
        }
      } else {
        bgColor = isCursor ? 'bg-yellow-200' : inWord ? 'bg-blue-100' : 'bg-white';
      }
      borderStyle = 'border border-slate-400';
    } else {
      if (isCursor) {
        // Active cursor cell — Guardian uses yellow
        bgColor = 'bg-yellow-300';
        textColor = 'text-slate-900';
      } else if (inWord) {
        // Highlighted word — Guardian uses light blue
        bgColor = 'bg-[#c7d8e8]';
        textColor = 'text-slate-900';
      } else {
        bgColor = 'bg-white';
      }
      borderStyle = 'border border-slate-400';
    }

    return (
      <div
        key={`${r}-${c}`}
        onClick={() => handleCellClick(r, c)}
        className={`relative ${bgColor} ${borderStyle} ${open ? 'cursor-pointer' : 'cursor-default'} select-none`}
        style={{ width: cellPx, height: cellPx }}
      >
        {/* Clue number — top-left, small */}
        {open && cellNumber !== undefined && (
          <span
            className="absolute top-0 left-0.5 leading-none font-normal text-slate-800 z-10"
            style={{ fontSize: numFontSize, lineHeight: `${numFontSize + 2}px`, paddingTop: 1 }}
          >
            {cellNumber}
          </span>
        )}
        {/* Letter — centred */}
        {open && letter && letter !== ' ' && (
          <span
            className={`absolute inset-0 flex items-center justify-center font-bold uppercase ${textColor}`}
            style={{ fontSize: letterFontSize, paddingTop: cellNumber !== undefined ? numFontSize - 2 : 0 }}
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
      aria-label="Crossword grid"
    >
      {/* Direction indicator */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => {
            setDirection('across');
            if (cursor) {
              const cs = findClueForCell(cursor.row, cursor.col, 'across');
              if (cs) onClueSelect(cs.clueNumber, 'across');
            }
          }}
          className={`px-3 py-1 rounded text-sm font-semibold transition ${
            direction === 'across'
              ? 'bg-slate-800 text-white'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          → Across
        </button>
        <button
          onClick={() => {
            setDirection('down');
            if (cursor) {
              const cs = findClueForCell(cursor.row, cursor.col, 'down');
              if (cs) onClueSelect(cs.clueNumber, 'down');
            }
          }}
          className={`px-3 py-1 rounded text-sm font-semibold transition ${
            direction === 'down'
              ? 'bg-slate-800 text-white'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          ↓ Down
        </button>
        <span className="text-xs text-slate-400 ml-2">Click same cell to toggle · Tab to next clue</span>
      </div>

      {/* Grid — outer border matches Guardian's thick outer border */}
      <div
        className="inline-block border-2 border-slate-900"
        style={{ lineHeight: 0 }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, ${cellPx}px)`,
            gridTemplateRows: `repeat(${gridSize}, ${cellPx}px)`,
            gap: 0,
          }}
        >
          {Array.from({ length: gridSize }, (_, r) =>
            Array.from({ length: gridSize }, (_, c) => renderCell(r, c))
          )}
        </div>
      </div>
    </div>
  );
};

export default CrosswordGrid;
