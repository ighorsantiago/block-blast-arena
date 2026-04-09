import { useRef } from 'react';
import {
    Animated,
    Dimensions,
    PanResponder,
    StyleSheet,
    View,
} from 'react-native';
import { Colors, Radius, Spacing } from '../constants/theme';
import { Piece, getPieceBounds } from '../utils/pieces';

const { width } = Dimensions.get('window');
const TRAY_WIDTH = width - 32;
const PIECE_BOX = TRAY_WIDTH / 3 - Spacing.sm;
const MINI_CELL = 20;
const MINI_GAP = 3;

interface PieceTrayProps {
    tray: [Piece | null, Piece | null, Piece | null];
    isDragging: boolean;
    onDragStart: (index: number, x: number, y: number) => void;
    onDragMove: (x: number, y: number) => void;
    onDragEnd: () => void;
    onDragCancel: () => void;
}

export function PieceTray({
    tray,
    isDragging,
    onDragStart,
    onDragMove,
    onDragEnd,
    onDragCancel,
}: PieceTrayProps) {
    return (
        <View style={styles.container}>
            {tray.map((piece, index) => (
                <DraggablePiece
                    key={index}
                    piece={piece}
                    index={index}
                    isDragging={isDragging}
                    onDragStart={onDragStart}
                    onDragMove={onDragMove}
                    onDragEnd={onDragEnd}
                    onDragCancel={onDragCancel}
                />
            ))}
        </View>
    );
}

// ─── Peça arrastável ──────────────────────────────────────────────────────────

interface DraggablePieceProps {
    piece: Piece | null;
    index: number;
    isDragging: boolean;
    onDragStart: (index: number, x: number, y: number) => void;
    onDragMove: (x: number, y: number) => void;
    onDragEnd: () => void;
    onDragCancel: () => void;
}

function DraggablePiece({
    piece,
    index,
    isDragging,
    onDragStart,
    onDragMove,
    onDragEnd,
    onDragCancel,
}: DraggablePieceProps) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const isActiveDrag = useRef(false);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !!piece,
            onMoveShouldSetPanResponder: () => !!piece,

            onPanResponderGrant: (evt) => {
                if (!piece) return;
                isActiveDrag.current = true;
                Animated.spring(scaleAnim, {
                    toValue: 1.15,
                    useNativeDriver: true,
                    speed: 50,
                    bounciness: 0,
                }).start();
                const { pageX, pageY } = evt.nativeEvent;
                onDragStart(index, pageX, pageY);
            },

            onPanResponderMove: (evt) => {
                if (!isActiveDrag.current) return;
                const { pageX, pageY } = evt.nativeEvent;
                onDragMove(pageX, pageY);
            },

            onPanResponderRelease: () => {
                if (!isActiveDrag.current) return;
                isActiveDrag.current = false;
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    speed: 50,
                    bounciness: 0,
                }).start();
                onDragEnd();
            },

            onPanResponderTerminate: () => {
                if (!isActiveDrag.current) return;
                isActiveDrag.current = false;
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    speed: 50,
                    bounciness: 0,
                }).start();
                onDragCancel();
            },
        })
    ).current;

    return (
        <Animated.View
            style={[
                styles.pieceBox,
                !piece && styles.pieceBoxEmpty,
                { transform: [{ scale: scaleAnim }] },
            ]}
            {...panResponder.panHandlers}
        >
            {piece && <PiecePreview piece={piece} />}
        </Animated.View>
    );
}

// ─── Mini preview da peça ─────────────────────────────────────────────────────

function PiecePreview({ piece }: { piece: Piece }) {
    const { rows, cols } = getPieceBounds(piece.shape);

    const matrix = Array.from({ length: rows }, () => Array(cols).fill(false));
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
                    {row.map((filled: boolean, c: number) => (
                        <View
                            key={c}
                            style={[
                                styles.miniCell,
                                { width: cellSize, height: cellSize },
                                filled
                                    ? { backgroundColor: piece.color }
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

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
    },
    pieceBox: {
        flex: 1,
        aspectRatio: 1,
        backgroundColor: Colors.surface,
        borderRadius: Radius.md,
        borderWidth: 1.5,
        borderColor: Colors.borderSubtle,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pieceBoxEmpty: {
        opacity: 0.25,
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
