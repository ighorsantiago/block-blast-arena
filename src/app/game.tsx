import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameGrid } from '../components/GameGrid';
import { PieceTray } from '../components/PieceTray';
import { ScoreHeader } from '../components/ScoreHeader';
import { Colors, FontSizes, Radius, Spacing } from '../constants/theme';
import { useBlockBlast } from '../hooks/useBlockBlast';

export default function GameScreen() {
    const router = useRouter();

    const {
        grid,
        tray,
        score,
        bestScore,
        combo,
        isGameOver,
        selectedPiece,
        lastCleared,
        startGame,
        selectPiece,
        dropPiece,
        canPlacePiece,
        getPreviewCells,
        formatScore,
    } = useBlockBlast();

    useEffect(() => {
        startGame();
    }, []);

    function handleBack() {
        router.back();
    }

    function handleRestart() {
        startGame();
    }

    function handleNewGame() {
        router.back();
    }

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>

                {/* Header */}
                <ScoreHeader
                    score={score}
                    bestScore={bestScore}
                    combo={combo}
                    formatScore={formatScore}
                    onBack={handleBack}
                />

                {/* Grid */}
                <GameGrid
                    grid={grid}
                    selectedPiece={selectedPiece}
                    canPlacePiece={canPlacePiece}
                    getPreviewCells={getPreviewCells}
                    lastCleared={lastCleared}
                    onDrop={dropPiece}
                />

                {/* Instrução */}
                <View style={styles.instructionRow}>
                    {selectedPiece !== null ? (
                        <Text style={styles.instructionText}>
                            Toque no grid para encaixar a peça
                        </Text>
                    ) : (
                        <Text style={styles.instructionText}>
                            Selecione uma peça abaixo
                        </Text>
                    )}
                </View>

                {/* Tray de peças */}
                <PieceTray
                    tray={tray}
                    selectedPiece={selectedPiece}
                    onSelectPiece={selectPiece}
                />

            </View>

            {/* Modal de game over */}
            <Modal visible={isGameOver} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>

                        <Text style={styles.modalEmoji}>💥</Text>
                        <Text style={styles.modalTitle}>GAME OVER</Text>
                        <Text style={styles.modalSubtitle}>
                            Não há mais espaço para as peças
                        </Text>

                        {/* Score final */}
                        <View style={styles.modalScoreBox}>
                            <View style={styles.modalScoreItem}>
                                <Text style={styles.modalScoreLabel}>PONTUAÇÃO</Text>
                                <Text style={styles.modalScoreValue}>{formatScore(score)}</Text>
                            </View>
                            <View style={styles.modalDivider} />
                            <View style={styles.modalScoreItem}>
                                <View style={styles.modalBestRow}>
                                    <Ionicons name="trophy-outline" size={14} color={Colors.primary} />
                                    <Text style={styles.modalScoreLabel}> RECORDE</Text>
                                </View>
                                <Text style={styles.modalScoreValue}>{formatScore(bestScore)}</Text>
                            </View>
                        </View>

                        {/* Novo recorde */}
                        {score >= bestScore && score > 0 && (
                            <View style={styles.newRecordBadge}>
                                <Ionicons name="trophy-outline" size={14} color={Colors.background} />
                                <Text style={styles.newRecordText}>NOVO RECORDE!</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.buttonPrimary}
                            onPress={handleRestart}
                        >
                            <Text style={styles.buttonPrimaryText}>JOGAR NOVAMENTE</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.buttonSecondary}
                            onPress={handleNewGame}
                        >
                            <Text style={styles.buttonSecondaryText}>MENU PRINCIPAL</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    container: {
        flex: 1,
        justifyContent: 'space-evenly',
        paddingVertical: Spacing.sm,
    },

    // Instrução
    instructionRow: {
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
    },
    instructionText: {
        color: Colors.textMuted,
        fontSize: FontSizes.xs,
        letterSpacing: 1,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.xl,
    },
    modalBox: {
        width: '100%',
        backgroundColor: Colors.surface,
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: Colors.primary,
        padding: Spacing.xl,
        alignItems: 'center',
        gap: Spacing.md,
    },
    modalEmoji: {
        fontSize: 56,
    },
    modalTitle: {
        color: Colors.error,
        fontSize: FontSizes.xxl,
        fontWeight: 'bold',
        letterSpacing: 4,
    },
    modalSubtitle: {
        color: Colors.textMuted,
        fontSize: FontSizes.sm,
        letterSpacing: 1,
        textAlign: 'center',
    },

    // Score no modal
    modalScoreBox: {
        flexDirection: 'row',
        backgroundColor: Colors.background,
        borderRadius: Radius.md,
        padding: Spacing.md,
        width: '100%',
        justifyContent: 'center',
        marginVertical: Spacing.xs,
    },
    modalScoreItem: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    modalBestRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalScoreLabel: {
        color: Colors.textMuted,
        fontSize: FontSizes.xs,
        letterSpacing: 1,
    },
    modalScoreValue: {
        color: Colors.text,
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
    },
    modalDivider: {
        width: 1,
        backgroundColor: Colors.borderSubtle,
        marginHorizontal: Spacing.md,
    },

    // Novo recorde
    newRecordBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: Radius.md,
    },
    newRecordText: {
        color: Colors.background,
        fontSize: FontSizes.xs,
        fontWeight: 'bold',
        letterSpacing: 2,
    },

    // Botões
    buttonPrimary: {
        width: '100%',
        height: 52,
        backgroundColor: Colors.primary,
        borderRadius: Radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonPrimaryText: {
        color: Colors.background,
        fontSize: FontSizes.sm,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    buttonSecondary: {
        width: '100%',
        height: 52,
        backgroundColor: 'transparent',
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.borderSubtle,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonSecondaryText: {
        color: Colors.textMuted,
        fontSize: FontSizes.sm,
        fontWeight: '600',
        letterSpacing: 2,
    },
});
