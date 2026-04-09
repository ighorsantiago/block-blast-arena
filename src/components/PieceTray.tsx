import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Colors, Radius, Spacing } from '../constants/theme';
import { Piece, getPieceBounds } from '../utils/pieces';

const { width } = Dimensions.get('window');
const TRAY_WIDTH = width - 32;
const PIECE_BOX = TRAY_WIDTH / 3 - Spacing.sm;
const MINI_CELL = 18;
const MINI_GAP = 2;

interface PieceTrayProps {
    tray: [Piece | null, Piece | null, Piece | null];
    selectedPiece: number | null;
    onSelectPiece: (index: number) => void;
}

export function PieceTray({ tray, selectedPiece, onSelectPiece }: PieceTrayProps) {
    return (
        <View style={styles.container}>
            {tray.map((piece, index) => (
                <TouchableOpacity
                    key={index}
                    style={[
                        styles.pieceBox,
                        selectedPiece === index && styles.pieceBoxSelected,
                        piece === null && styles.pieceBoxEmpty,
                    ]}
                    onPress={() => piece && onSelectPiece(index)}
                    activeOpacity={piece ? 0.8 : 1}
                >
                    {piece && (
                        <PiecePreview piece={piece} isSelected={selectedPiece === index} />
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
}

// ─── Mini preview da peça ─────────────────────────────────────────────────────

function PiecePreview({
    piece,
    isSelected,
}: {
    piece: Piece;
    isSelected: boolean;
}) {
    const { rows, cols } = getPieceBounds(piece.shape);

    // Cria matriz do bounding box
    const matrix = Array.from({ length: rows }, () =>
        Array(cols).fill(false)
    );
    for (const [r, c] of piece.shape) {
        matrix[r][c] = true;
    }

    const cellSize = Math.min(
        MINI_CELL,
        Math.floor((PIECE_BOX - Spacing.md * 2) / Math.max(rows, cols))
    );

    return (
        <View style={styles.preview}>
            {matrix.map((row, r) => (
                <View key={r} style={styles.previewRow}>
                    {row.map((filled, c) => (
                        <View
                            key={c}
                            style={[
                                styles.miniCell,
                                { width: cellSize, height: cellSize },
                                filled
                                    ? { backgroundColor: piece.color, opacity: isSelected ? 1 : 0.85 }
                                    : { backgroundColor: 'transparent' },
                                filled && styles.miniCellFilled,
                            ]}
                        />
                    ))}
                </View>
            ))}
        </View>
    );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
    },
    pieceBox: {
        width: PIECE_BOX,
        height: PIECE_BOX,
        backgroundColor: Colors.surface,
        borderRadius: Radius.md,
        borderWidth: 1.5,
        borderColor: Colors.borderSubtle,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pieceBoxSelected: {
        borderColor: Colors.primary,
        backgroundColor: Colors.surfaceLight,
        transform: [{ scale: 1.06 }],
    },
    pieceBoxEmpty: {
        opacity: 0.3,
    },
    preview: {
        gap: MINI_GAP,
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewRow: {
        flexDirection: 'row',
        gap: MINI_GAP,
    },
    miniCell: {
        borderRadius: 3,
    },
    miniCellFilled: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 2,
    },
});
