import { Colors } from '../constants/theme';

// Cada peça é uma matriz de [row, col] representando as células ocupadas
// relativas à origem (0,0)

export interface Piece {
    id: string;
    shape: [number, number][];  // células ocupadas
    color: string;
    size: number;               // dimensão do bounding box (ex: 3 = 3x3)
}

// ─── Definição das peças ──────────────────────────────────────────────────────

export const PIECE_DEFINITIONS: Omit<Piece, 'color'>[] = [

    // ── 1x1 ──────────────────────────────────────────────────────────────────
    {
        id: 'single',
        shape: [[0, 0]],
        size: 1,
    },

    // ── 1x2 ──────────────────────────────────────────────────────────────────
    {
        id: 'h2',
        shape: [[0, 0], [0, 1]],
        size: 2,
    },
    {
        id: 'v2',
        shape: [[0, 0], [1, 0]],
        size: 2,
    },

    // ── 1x3 ──────────────────────────────────────────────────────────────────
    {
        id: 'h3',
        shape: [[0, 0], [0, 1], [0, 2]],
        size: 3,
    },
    {
        id: 'v3',
        shape: [[0, 0], [1, 0], [2, 0]],
        size: 3,
    },

    // ── 1x4 ──────────────────────────────────────────────────────────────────
    {
        id: 'h4',
        shape: [[0, 0], [0, 1], [0, 2], [0, 3]],
        size: 4,
    },
    {
        id: 'v4',
        shape: [[0, 0], [1, 0], [2, 0], [3, 0]],
        size: 4,
    },

    // ── 1x5 ──────────────────────────────────────────────────────────────────
    {
        id: 'h5',
        shape: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
        size: 5,
    },
    {
        id: 'v5',
        shape: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
        size: 5,
    },

    // ── 2x2 quadrado ─────────────────────────────────────────────────────────
    {
        id: 'sq2',
        shape: [[0, 0], [0, 1], [1, 0], [1, 1]],
        size: 2,
    },

    // ── 3x3 quadrado ─────────────────────────────────────────────────────────
    {
        id: 'sq3',
        shape: [
            [0, 0], [0, 1], [0, 2],
            [1, 0], [1, 1], [1, 2],
            [2, 0], [2, 1], [2, 2],
        ],
        size: 3,
    },

    // ── L shapes ─────────────────────────────────────────────────────────────
    {
        id: 'l1',
        shape: [[0, 0], [1, 0], [2, 0], [2, 1]],
        size: 3,
    },
    {
        id: 'l2',
        shape: [[0, 0], [0, 1], [1, 0], [2, 0]],
        size: 3,
    },
    {
        id: 'l3',
        shape: [[0, 0], [0, 1], [0, 2], [1, 0]],
        size: 3,
    },
    {
        id: 'l4',
        shape: [[0, 0], [0, 1], [0, 2], [1, 2]],
        size: 3,
    },
    {
        id: 'l5',
        shape: [[0, 1], [1, 1], [2, 0], [2, 1]],
        size: 3,
    },
    {
        id: 'l6',
        shape: [[0, 0], [1, 0], [1, 1], [1, 2]],
        size: 3,
    },

    // ── T shapes ─────────────────────────────────────────────────────────────
    {
        id: 't1',
        shape: [[0, 0], [0, 1], [0, 2], [1, 1]],
        size: 3,
    },
    {
        id: 't2',
        shape: [[0, 0], [1, 0], [1, 1], [2, 0]],
        size: 3,
    },
    {
        id: 't3',
        shape: [[0, 1], [1, 0], [1, 1], [1, 2]],
        size: 3,
    },

    // ── S / Z shapes ─────────────────────────────────────────────────────────
    {
        id: 's1',
        shape: [[0, 1], [0, 2], [1, 0], [1, 1]],
        size: 3,
    },
    {
        id: 's2',
        shape: [[0, 0], [0, 1], [1, 1], [1, 2]],
        size: 3,
    },
    {
        id: 'z1',
        shape: [[0, 0], [1, 0], [1, 1], [2, 1]],
        size: 3,
    },
    {
        id: 'z2',
        shape: [[0, 1], [1, 0], [1, 1], [2, 0]],
        size: 3,
    },

    // ── Cantos / diagonais ────────────────────────────────────────────────────
    {
        id: 'corner1',
        shape: [[0, 0], [1, 0], [1, 1]],
        size: 2,
    },
    {
        id: 'corner2',
        shape: [[0, 1], [1, 0], [1, 1]],
        size: 2,
    },
    {
        id: 'corner3',
        shape: [[0, 0], [0, 1], [1, 0]],
        size: 2,
    },
    {
        id: 'corner4',
        shape: [[0, 0], [0, 1], [1, 1]],
        size: 2,
    },
];

// Cores disponíveis para as peças (ciclam aleatoriamente)
const PIECE_COLORS = [
    Colors.piece1,
    Colors.piece2,
    Colors.piece3,
    Colors.piece4,
    Colors.piece5,
    Colors.piece6,
    Colors.piece7,
];

// ─── Geração de peças ─────────────────────────────────────────────────────────

function randomColor(exclude?: string): string {
    const available = PIECE_COLORS.filter(c => c !== exclude);
    return available[Math.floor(Math.random() * available.length)];
}

function randomPiece(excludeColor?: string): Piece {
    const def = PIECE_DEFINITIONS[Math.floor(Math.random() * PIECE_DEFINITIONS.length)];
    return {
        ...def,
        color: randomColor(excludeColor),
    };
}

export function generateTray(): [Piece, Piece, Piece] {
    const p1 = randomPiece();
    const p2 = randomPiece(p1.color);
    const p3 = randomPiece(p2.color);
    return [p1, p2, p3];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getPieceBounds(shape: [number, number][]): {
    rows: number;
    cols: number;
} {
    const maxRow = Math.max(...shape.map(([r]) => r));
    const maxCol = Math.max(...shape.map(([, c]) => c));
    return { rows: maxRow + 1, cols: maxCol + 1 };
}
