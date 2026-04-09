import { useCallback, useState } from 'react';
import { Piece, generateTray } from '../utils/pieces';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export const GRID_SIZE = 8;

export type Grid = (string | null)[][];  // null = vazio, string = cor da peça

export interface GameState {
    grid: Grid;
    tray: [Piece | null, Piece | null, Piece | null];
    score: number;
    bestScore: number;
    combo: number;
    isGameOver: boolean;
    selectedPiece: number | null;       // índice na tray (0, 1 ou 2)
    lastCleared: { rows: number[]; cols: number[] } | null; // para animação
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyGrid(): Grid {
    return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
}

function cloneGrid(grid: Grid): Grid {
    return grid.map(row => [...row]);
}

function canPlace(
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

function calculateScore(
    clearedRows: number,
    clearedCols: number,
    combo: number
): number {
    const linesCleared = clearedRows + clearedCols;
    if (linesCleared === 0) return 0;

    // Base: 100 por linha/coluna
    let base = linesCleared * 100;

    // Bônus por múltiplas linhas simultâneas
    if (linesCleared >= 2) base += linesCleared * 50;
    if (linesCleared >= 4) base += linesCleared * 100;

    // Multiplicador de combo
    const comboMultiplier = 1 + combo * 0.5;

    return Math.floor(base * comboMultiplier);
}

function hasAnyValidMove(
    grid: Grid,
    tray: (Piece | null)[]
): boolean {
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

export function useBlockBlast() {
    const [state, setState] = useState<GameState>({
        grid: emptyGrid(),
        tray: generateTray(),
        score: 0,
        bestScore: 0,
        combo: 0,
        isGameOver: false,
        selectedPiece: null,
        lastCleared: null,
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
            selectedPiece: null,
            lastCleared: null,
        }));
    }, []);

    // ─── Selecionar peça ───────────────────────────────────────────────────────

    const selectPiece = useCallback((index: number) => {
        setState(prev => {
            if (prev.isGameOver) return prev;
            if (prev.tray[index] === null) return prev;
            return {
                ...prev,
                selectedPiece: prev.selectedPiece === index ? null : index,
            };
        });
    }, []);

    // ─── Verificar se pode encaixar ────────────────────────────────────────────

    const canPlacePiece = useCallback((row: number, col: number): boolean => {
        const { grid, tray, selectedPiece } = state;
        if (selectedPiece === null) return false;
        const piece = tray[selectedPiece];
        if (!piece) return false;
        return canPlace(grid, piece.shape, row, col);
    }, [state]);

    // ─── Colocar peça no grid ──────────────────────────────────────────────────

    const dropPiece = useCallback((row: number, col: number) => {
        setState(prev => {
            if (prev.selectedPiece === null) return prev;
            if (prev.isGameOver) return prev;

            const piece = prev.tray[prev.selectedPiece];
            if (!piece) return prev;

            if (!canPlace(prev.grid, piece.shape, row, col)) return prev;

            // Coloca a peça
            let newGrid = placePiece(prev.grid, piece.shape, row, col, piece.color);

            // Verifica linhas/colunas completas
            const { rows, cols } = findCompletedLines(newGrid);
            const linesCleared = rows.length + cols.length;

            // Calcula combo
            const newCombo = linesCleared > 0 ? prev.combo + 1 : 0;

            // Pontua
            const points = calculateScore(rows.length, cols.length, prev.combo);
            const newScore = prev.score + points;
            const newBest = Math.max(newScore, prev.bestScore);

            // Limpa linhas
            if (linesCleared > 0) {
                newGrid = clearLines(newGrid, rows, cols);
            }

            // Atualiza tray
            const newTray = [...prev.tray] as [Piece | null, Piece | null, Piece | null];
            newTray[prev.selectedPiece] = null;

            // Se todas as peças foram usadas, gera nova tray
            const allUsed = newTray.every(p => p === null);
            const finalTray: [Piece | null, Piece | null, Piece | null] = allUsed
                ? generateTray()
                : newTray;

            // Verifica game over
            const isGameOver = !hasAnyValidMove(newGrid, finalTray);

            return {
                ...prev,
                grid: newGrid,
                tray: finalTray,
                score: newScore,
                bestScore: newBest,
                combo: newCombo,
                isGameOver,
                selectedPiece: null,
                lastCleared: linesCleared > 0 ? { rows, cols } : null,
            };
        });
    }, []);

    // ─── Preview de encaixe ────────────────────────────────────────────────────

    const getPreviewCells = useCallback((
        row: number,
        col: number
    ): { row: number; col: number }[] => {
        const { tray, selectedPiece, grid } = state;
        if (selectedPiece === null) return [];
        const piece = tray[selectedPiece];
        if (!piece) return [];
        if (!canPlace(grid, piece.shape, row, col)) return [];
        return piece.shape.map(([dr, dc]) => ({ row: row + dr, col: col + dc }));
    }, [state]);

    // ─── Helpers de UI ─────────────────────────────────────────────────────────

    const formatScore = useCallback((score: number): string => {
        if (score >= 1000000) return `${(score / 1000000).toFixed(1)}M`;
        if (score >= 1000) return `${(score / 1000).toFixed(1)}K`;
        return String(score);
    }, []);

    return {
        ...state,
        startGame,
        selectPiece,
        dropPiece,
        canPlacePiece,
        getPreviewCells,
        formatScore,
    };
}
