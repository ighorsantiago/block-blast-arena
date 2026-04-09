import { Dimensions, StyleSheet, View } from 'react-native';
import { Colors, Radius } from '../constants/theme';
import { DragState, GRID_SIZE, Grid } from '../hooks/useBlockBlast';

const { width } = Dimensions.get('window');
const GRID_PADDING = 16;
const BORDER = 2;
const CELL_GAP = 2;
const GRID_WIDTH = width - GRID_PADDING * 2;
// Espaço disponível internamente: desconta borda (x2), padding interno (x2) e gaps entre células
const CELL_SIZE = Math.floor(
    (GRID_WIDTH - BORDER * 2 - CELL_GAP * 2 - CELL_GAP * (GRID_SIZE - 1)) / GRID_SIZE
);

interface GameGridProps {
    grid: Grid;
    drag: DragState | null;
    previewCells: { row: number; col: number }[];
    lastCleared: { rows: number[]; cols: number[] } | null;
    onLayout: (layout: { x: number; y: number; width: number; height: number }) => void;
}

export function GameGrid({
    grid,
    drag,
    lastCleared,
    onLayout,
}: GameGridProps) {

    const previewSet = getPreviewSet();

    function getCellColor(row: number, col: number): string | null {
        // Preview sempre aparece quando está arrastando — válido em cor normal, inválido em vermelho
        if (drag && previewSet.has(`${row}-${col}`)) {
            return drag.isValid ? drag.piece.color : Colors.error;
        }
        return grid[row][col];
    }

    function getCellOpacity(row: number, col: number): number {
        if (drag && previewSet.has(`${row}-${col}`)) return 0.5;
        if (lastCleared?.rows.includes(row) || lastCleared?.cols.includes(col)) return 0.4;
        return 1;
    }

    // Preview deve sobrepor células ocupadas também
    function getPreviewSet() {
        if (!drag || drag.previewRow === null || drag.previewCol === null) return new Set<string>();
        return new Set(
            drag.piece.shape.map(([dr, dc]) => `${drag.previewRow! + dr}-${drag.previewCol! + dc}`)
        );
    }

    return (
        <View
            style={styles.container}
            onLayout={e => {
                const { x, y, width, height } = e.nativeEvent.layout;
                e.target.measure((fx, fy, w, h, px, py) => {
                    onLayout({ x: px, y: py, width: w, height: h });
                });
            }}
        >
            <View style={styles.grid}>
                {Array.from({ length: GRID_SIZE }, (_, row) => (
                    <View key={row} style={styles.row}>
                        {Array.from({ length: GRID_SIZE }, (_, col) => {
                            const color = getCellColor(row, col);
                            const opacity = getCellOpacity(row, col);

                            return (
                                <View
                                    key={col}
                                    style={[
                                        styles.cell,
                                        color
                                            ? { backgroundColor: color, opacity }
                                            : styles.cellEmpty,
                                    ]}
                                >
                                    {color && <View style={styles.cellShine} />}
                                </View>
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
