import { useCallback, useState } from 'react';
import { Piece, generateTray, getPieceBounds } from '../utils/pieces';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export const GRID_SIZE = 8;

export type Grid = (string | null)[][];

export interface DragState {
    pieceIndex: number;
    piece: Piece;
    x: number;         // posição absoluta na tela
    y: number;
    previewRow: number | null;
    previewCol: number | null;
    isValid: boolean;
}

export interface GameState {
    grid: Grid;
    tray: [Piece | null, Piece | null, Piece | null];
    score: number;
    bestScore: number;
    combo: number;
    isGameOver: boolean;
    drag: DragState | null;
    lastCleared: { rows: number[]; cols: number[] } | null;
    clearingCells: Set<string>; // células em animação de limpeza "row-col"
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyGrid(): Grid {
    return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
}

function cloneGrid(grid: Grid): Grid {
    return grid.map(row => [...row]);
}

export function canPlace(
    grid: Grid,
    shape: [number, number][],
    row: number,
    col: number
): boolean {
    for (const [dr, dc] of shape) {
        const r = row + dr;
        const c = col + dc;
        if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;
        if (grid[r][c] !== null) return false;
    }
    return true;
}

function placePiece(
    grid: Grid,
    shape: [number, number][],
    row: number,
    col: number,
    color: string
): Grid {
    const newGrid = cloneGrid(grid);
    for (const [dr, dc] of shape) {
        newGrid[row + dr][col + dc] = color;
    }
    return newGrid;
}

function findCompletedLines(grid: Grid): { rows: number[]; cols: number[] } {
    const rows: number[] = [];
    const cols: number[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        if (grid[r].every(cell => cell !== null)) rows.push(r);
    }
    for (let c = 0; c < GRID_SIZE; c++) {
        if (grid.every(row => row[c] !== null)) cols.push(c);
    }
    return { rows, cols };
}

function clearLines(grid: Grid, rows: number[], cols: number[]): Grid {
    const newGrid = cloneGrid(grid);
    for (const r of rows) {
        for (let c = 0; c < GRID_SIZE; c++) newGrid[r][c] = null;
    }
    for (const c of cols) {
        for (let r = 0; r < GRID_SIZE; r++) newGrid[r][c] = null;
    }
    return newGrid;
}

function calculateScore(clearedRows: number, clearedCols: number, combo: number): number {
    const linesCleared = clearedRows + clearedCols;
    if (linesCleared === 0) return 0;
    let base = linesCleared * 100;
    if (linesCleared >= 2) base += linesCleared * 50;
    if (linesCleared >= 4) base += linesCleared * 100;
    const comboMultiplier = 1 + combo * 0.5;
    return Math.floor(base * comboMultiplier);
}

function hasAnyValidMove(grid: Grid, tray: (Piece | null)[]): boolean {
    for (const piece of tray) {
        if (!piece) continue;
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (canPlace(grid, piece.shape, r, c)) return true;
            }
        }
    }
    return false;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBlockBlast(initialBestScore: number = 0) {
    const [state, setState] = useState<GameState>({
        grid: emptyGrid(),
        tray: generateTray(),
        score: 0,
        bestScore: initialBestScore,
        combo: 0,
        isGameOver: false,
        drag: null,
        lastCleared: null,
        clearingCells: new Set(),
    });

    // ─── Iniciar jogo ──────────────────────────────────────────────────────────

    const startGame = useCallback(() => {
        setState(prev => ({
            grid: emptyGrid(),
            tray: generateTray(),
            score: 0,
            bestScore: prev.bestScore,
            combo: 0,
            isGameOver: false,
            drag: null,
            lastCleared: null,
            clearingCells: new Set(),
        }));
    }, []);

    // ─── Iniciar drag ──────────────────────────────────────────────────────────

    const startDrag = useCallback((pieceIndex: number, x: number, y: number) => {
        setState(prev => {
            if (prev.isGameOver) return prev;
            const piece = prev.tray[pieceIndex];
            if (!piece) return prev;
            return {
                ...prev,
                drag: {
                    pieceIndex,
                    piece,
                    x,
                    y,
                    previewRow: null,
                    previewCol: null,
                    isValid: false,
                },
                lastCleared: null,
            };
        });
    }, []);

    // ─── Atualizar posição do drag ─────────────────────────────────────────────

    const updateDrag = useCallback((
        x: number,
        y: number,
        gridLayout: { x: number; y: number; width: number; height: number } | null
    ) => {
        setState(prev => {
            if (!prev.drag || !gridLayout) return prev;

            const cellSize = gridLayout.width / GRID_SIZE;

            // Calcula célula alvo — centraliza a peça no dedo
            const { rows: pieceRows, cols: pieceCols } = getPieceBounds(prev.drag.piece.shape);
            const offsetRow = Math.floor(pieceRows / 2);
            const offsetCol = Math.floor(pieceCols / 2);

            const relX = x - gridLayout.x;
            const relY = y - gridLayout.y;

            const targetRow = Math.floor(relY / cellSize) - offsetRow;
            const targetCol = Math.floor(relX / cellSize) - offsetCol;

            const isValid = canPlace(prev.grid, prev.drag.piece.shape, targetRow, targetCol);

            return {
                ...prev,
                drag: {
                    ...prev.drag,
                    x,
                    y,
                    previewRow: targetRow,
                    previewCol: targetCol,
                    isValid,
                },
            };
        });
    }, []);

    // ─── Soltar peça ──────────────────────────────────────────────────────────

    const endDrag = useCallback(() => {
        setState(prev => {
            if (!prev.drag) return prev;

            const { pieceIndex, piece, previewRow, previewCol, isValid } = prev.drag;

            if (!isValid || previewRow === null || previewCol === null) {
                return { ...prev, drag: null };
            }

            const newGrid = placePiece(prev.grid, piece.shape, previewRow, previewCol, piece.color);
            const { rows, cols } = findCompletedLines(newGrid);
            const linesCleared = rows.length + cols.length;
            const newCombo = linesCleared > 0 ? prev.combo + 1 : 0;
            const points = calculateScore(rows.length, cols.length, prev.combo);
            const newScore = prev.score + points;
            const newBest = Math.max(newScore, prev.bestScore);

            const newTray = [...prev.tray] as [Piece | null, Piece | null, Piece | null];
            newTray[pieceIndex] = null;
            const allUsed = newTray.every(p => p === null);
            const finalTray: [Piece | null, Piece | null, Piece | null] = allUsed
                ? generateTray()
                : newTray;

            if (linesCleared === 0) {
                // Sem linhas para limpar — aplica direto
                const isGameOver = !hasAnyValidMove(newGrid, finalTray);
                return {
                    ...prev,
                    grid: newGrid,
                    tray: finalTray,
                    score: newScore,
                    bestScore: newBest,
                    combo: newCombo,
                    isGameOver,
                    drag: null,
                    lastCleared: null,
                    clearingCells: new Set(),
                };
            }

            // Marca células que vão ser animadas
            const clearing = new Set<string>();
            for (const r of rows) {
                for (let c = 0; c < GRID_SIZE; c++) clearing.add(`${r}-${c}`);
            }
            for (const c of cols) {
                for (let r = 0; r < GRID_SIZE; r++) clearing.add(`${r}-${c}`);
            }

            // Após a animação (350ms), limpa o grid de verdade
            setTimeout(() => {
                setState(current => {
                    const clearedGrid = clearLines(newGrid, rows, cols);
                    const isGameOver = !hasAnyValidMove(clearedGrid, finalTray);
                    return {
                        ...current,
                        grid: clearedGrid,
                        tray: finalTray,
                        score: newScore,
                        bestScore: newBest,
                        combo: newCombo,
                        isGameOver,
                        drag: null,
                        lastCleared: { rows, cols },
                        clearingCells: new Set(),
                    };
                });
            }, 350);

            // Primeiro: aplica a peça e marca células animando
            return {
                ...prev,
                grid: newGrid,
                tray: prev.tray, // mantém a tray até a animação terminar
                score: newScore,
                bestScore: newBest,
                combo: newCombo,
                isGameOver: false,
                drag: null,
                lastCleared: null,
                clearingCells: clearing,
            };
        });
    }, []);

    // ─── Cancelar drag ─────────────────────────────────────────────────────────

    const cancelDrag = useCallback(() => {
        setState(prev => ({ ...prev, drag: null }));
    }, []);

    // ─── Helpers ───────────────────────────────────────────────────────────────

    const getPreviewCells = useCallback((): { row: number; col: number }[] => {
        const { drag, grid } = state;
        if (!drag || drag.previewRow === null || drag.previewCol === null || !drag.isValid) return [];
        return drag.piece.shape.map(([dr, dc]) => ({
            row: drag.previewRow! + dr,
            col: drag.previewCol! + dc,
        }));
    }, [state.drag]);

    const formatScore = useCallback((score: number): string => {
        if (score >= 1000000) return `${(score / 1000000).toFixed(1)}M`;
        if (score >= 1000) return `${(score / 1000).toFixed(1)}K`;
        return String(score);
    }, []);

    return {
        ...state,
        startGame,
        startDrag,
        updateDrag,
        endDrag,
        cancelDrag,
        getPreviewCells,
        formatScore,
    };
}
