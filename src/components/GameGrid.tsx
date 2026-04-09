import { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { Colors, Radius } from '../constants/theme';
import { DragState, GRID_SIZE, Grid } from '../hooks/useBlockBlast';

const { width } = Dimensions.get('window');
const GRID_PADDING = 16;
const BORDER = 2;
const CELL_GAP = 2;
const GRID_WIDTH = width - GRID_PADDING * 2;
const CELL_SIZE = Math.floor(
    (GRID_WIDTH - BORDER * 2 - CELL_GAP * 2 - CELL_GAP * (GRID_SIZE - 1)) / GRID_SIZE
);

// ─── Componente da célula com animação ───────────────────────────────────────

interface AnimatedCellProps {
    color: string | null;
    isClearing: boolean;
    shine?: boolean;
}

function AnimatedCell({ color, isClearing, shine }: AnimatedCellProps) {
    const flashAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isClearing) {
            // 1. Flash rápido para dourado
            // 2. Fade out suave
            Animated.sequence([
                Animated.timing(flashAnim, {
                    toValue: 1,
                    duration: 80,
                    useNativeDriver: false,
                }),
                Animated.timing(flashAnim, {
                    toValue: 0.8,
                    duration: 80,
                    useNativeDriver: false,
                }),
                Animated.timing(flashAnim, {
                    toValue: 1,
                    duration: 80,
                    useNativeDriver: false,
                }),
                Animated.timing(flashAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: false,
                }),
            ]).start();
        } else {
            flashAnim.setValue(0);
        }
    }, [isClearing]);

    const backgroundColor = flashAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [
            color ?? Colors.gridCell,
            Colors.primary,
            '#FFFFFF',
        ],
    });

    const opacity = isClearing
        ? flashAnim.interpolate({
            inputRange: [0, 0.7, 1],
            outputRange: [0, 0.6, 1],
        })
        : 1;

    return (
        <Animated.View
            style={[
                styles.cell,
                { backgroundColor, opacity },
            ]}
        >
            {color && !isClearing && <View style={styles.cellShine} />}
        </Animated.View>
    );
}

// ─── Grid principal ───────────────────────────────────────────────────────────

interface GameGridProps {
    grid: Grid;
    drag: DragState | null;
    previewCells: { row: number; col: number }[];
    lastCleared: { rows: number[]; cols: number[] } | null;
    clearingCells: Set<string>;
    onLayout: (layout: { x: number; y: number; width: number; height: number }) => void;
}

export function GameGrid({
    grid,
    drag,
    previewCells,
    lastCleared,
    clearingCells,
    onLayout,
}: GameGridProps) {

    function getPreviewSet() {
        if (!drag || drag.previewRow === null || drag.previewCol === null) return new Set<string>();
        return new Set(
            drag.piece.shape.map(([dr, dc]) => `${drag.previewRow! + dr}-${drag.previewCol! + dc}`)
        );
    }

    const previewSet = getPreviewSet();

    function getCellColor(row: number, col: number): string | null {
        if (drag && previewSet.has(`${row}-${col}`)) {
            return drag.isValid ? drag.piece.color : Colors.error;
        }
        return grid[row][col];
    }

    function getCellOpacity(row: number, col: number): number {
        if (drag && previewSet.has(`${row}-${col}`)) return 0.5;
        return 1;
    }

    return (
        <View
            style={styles.container}
            onLayout={e => {
                e.target.measure((fx, fy, w, h, px, py) => {
                    onLayout({ x: px, y: py, width: w, height: h });
                });
            }}
        >
            <View style={styles.grid}>
                {Array.from({ length: GRID_SIZE }, (_, row) => (
                    <View key={row} style={styles.row}>
                        {Array.from({ length: GRID_SIZE }, (_, col) => {
                            const key = `${row}-${col}`;
                            const isClearing = clearingCells.has(key);
                            const isPreview = drag && previewSet.has(key);
                            const color = getCellColor(row, col);
                            const opacity = getCellOpacity(row, col);

                            if (isClearing) {
                                // Células em animação usam AnimatedCell
                                return (
                                    <AnimatedCell
                                        key={col}
                                        color={grid[row][col]}
                                        isClearing={true}
                                    />
                                );
                            }

                            // Célula normal
                            return (
                                <Animated.View
                                    key={col}
                                    style={[
                                        styles.cell,
                                        color
                                            ? { backgroundColor: color, opacity }
                                            : styles.cellEmpty,
                                    ]}
                                >
                                    {color && !isPreview && <View style={styles.cellShine} />}
                                </Animated.View>
                            );
                        })}
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: GRID_PADDING,
    },
    grid: {
        width: GRID_WIDTH,
        backgroundColor: Colors.surface,
        borderRadius: Radius.md,
        borderWidth: BORDER,
        borderColor: Colors.primary,
        padding: CELL_GAP,
        gap: CELL_GAP,
    },
    row: {
        flexDirection: 'row',
        gap: CELL_GAP,
    },
    cell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        borderRadius: Radius.sm,
        overflow: 'hidden',
    },
    cellEmpty: {
        backgroundColor: Colors.gridCell,
    },
    cellShine: {
        position: 'absolute',
        top: 3,
        left: 3,
        right: 3,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
});
