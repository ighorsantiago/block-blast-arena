import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Colors, Radius } from '../constants/theme';
import { GRID_SIZE, Grid } from '../hooks/useBlockBlast';

const { width } = Dimensions.get('window');
const GRID_PADDING = 16;
const GRID_WIDTH = width - GRID_PADDING * 2;
const CELL_SIZE = GRID_WIDTH / GRID_SIZE;
const CELL_GAP = 2;

interface GameGridProps {
    grid: Grid;
    selectedPiece: number | null;
    canPlacePiece: (row: number, col: number) => boolean;
    getPreviewCells: (row: number, col: number) => { row: number; col: number }[];
    lastCleared: { rows: number[]; cols: number[] } | null;
    onDrop: (row: number, col: number) => void;
}

export function GameGrid({
    grid,
    selectedPiece,
    canPlacePiece,
    getPreviewCells,
    lastCleared,
    onDrop,
}: GameGridProps) {

    function handleCellPress(row: number, col: number) {
        if (selectedPiece === null) return;
        if (canPlacePiece(row, col)) {
            onDrop(row, col);
        }
    }

    function getCellStyle(row: number, col: number) {
        const value = grid[row][col];
        const isCleared =
            lastCleared?.rows.includes(row) || lastCleared?.cols.includes(col);

        if (isCleared) {
            return { backgroundColor: Colors.primary, opacity: 0.6 };
        }

        if (value) {
            return { backgroundColor: value };
        }

        return { backgroundColor: Colors.gridCell };
    }

    // Calcula o preview baseado no toque do usuário
    // Para simplicidade, o preview aparece quando há peça selecionada
    // e o jogador toca em uma célula válida
    function getHighlightStyle(row: number, col: number) {
        if (selectedPiece === null) return null;

        // Verifica se essa célula faria parte de um drop válido na linha/col 0,0
        // O highlight real é calculado dinamicamente via getPreviewCells
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {Array.from({ length: GRID_SIZE }, (_, row) => (
                    <View key={row} style={styles.row}>
                        {Array.from({ length: GRID_SIZE }, (_, col) => {
                            const cellStyle = getCellStyle(row, col);
                            const canDrop = selectedPiece !== null && canPlacePiece(row, col);

                            return (
                                <TouchableOpacity
                                    key={col}
                                    style={[
                                        styles.cell,
                                        cellStyle,
                                        canDrop && styles.cellCanDrop,
                                    ]}
                                    onPress={() => handleCellPress(row, col)}
                                    activeOpacity={canDrop ? 0.7 : 1}
                                >
                                    {/* Célula preenchida com brilho interno */}
                                    {grid[row][col] && (
                                        <View style={styles.cellInner} />
                                    )}
                                </TouchableOpacity>
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
        borderWidth: 2,
        borderColor: Colors.primary,
        padding: CELL_GAP,
        gap: CELL_GAP,
    },
    row: {
        flexDirection: 'row',
        gap: CELL_GAP,
    },
    cell: {
        width: CELL_SIZE - CELL_GAP * 2,
        height: CELL_SIZE - CELL_GAP * 2,
        borderRadius: Radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cellCanDrop: {
        borderWidth: 1.5,
        borderColor: Colors.primary,
        opacity: 0.85,
    },
    cellInner: {
        position: 'absolute',
        top: 3,
        left: 3,
        right: 3,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
});
