import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSizes, Radius, Spacing } from '../constants/theme';
import { useStats } from '../hooks/useStats';

export default function HomeScreen() {
    const router = useRouter();
    const [showStats, setShowStats] = useState(false);
    const { stats, resetStats, getAvgScore, formatScore, reloadStats } = useStats();

    useFocusEffect(
        useCallback(() => {
            reloadStats();
        }, [reloadStats])
    );

    function handlePlay() {
        router.push('/game');
    }

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>

                {/* Logo */}
                <View style={styles.logoArea}>
                    <GridPreview />
                    <View style={styles.titleDivider} />
                    <Text style={styles.titleLine1}>BLOCK</Text>
                    <Text style={styles.titleLine2}>BLAST</Text>
                    <Text style={styles.titleSub}>ARENA</Text>
                    <View style={styles.titleDivider} />
                    <Text style={styles.tagline}>ENCAIXE  ·  ELIMINE  ·  PONTUE</Text>
                </View>

                {/* Recorde rápido na home */}
                {stats.bestScore > 0 && (
                    <View style={styles.bestScoreRow}>
                        <Ionicons name="trophy-outline" size={14} color={Colors.primary} />
                        <Text style={styles.bestScoreText}>
                            Recorde: {formatScore(stats.bestScore)}
                        </Text>
                    </View>
                )}

                {/* Botão jogar */}
                <TouchableOpacity
                    style={styles.playButton}
                    onPress={handlePlay}
                    activeOpacity={0.85}
                >
                    <Text style={styles.playButtonText}>JOGAR</Text>
                </TouchableOpacity>

                {/* Botão stats */}
                <TouchableOpacity
                    style={styles.statsButton}
                    onPress={() => setShowStats(true)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="bar-chart-outline" size={16} color={Colors.textMuted} />
                    <Text style={styles.statsButtonText}>ESTATÍSTICAS</Text>
                </TouchableOpacity>

                {/* Rodapé */}
                <Text style={styles.footer}>ARENA GAMES</Text>

            </View>

            {/* Modal de estatísticas */}
            <Modal visible={showStats} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>

                        <Text style={styles.modalTitle}>ESTATÍSTICAS</Text>

                        <View style={styles.statsGrid}>
                            <StatItem
                                icon="game-controller-outline"
                                label="Partidas"
                                value={String(stats.gamesPlayed)}
                            />
                            <StatItem
                                icon="trophy-outline"
                                label="Recorde"
                                value={formatScore(stats.bestScore)}
                                highlight
                            />
                            <StatItem
                                icon="trending-up-outline"
                                label="Média"
                                value={formatScore(getAvgScore())}
                            />
                            <StatItem
                                icon="trending-down-outline"
                                label="Mínimo"
                                value={stats.minScore !== null ? formatScore(stats.minScore) : '--'}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.buttonPrimary}
                            onPress={() => setShowStats(false)}
                        >
                            <Text style={styles.buttonPrimaryText}>FECHAR</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.buttonReset}
                            onPress={resetStats}
                        >
                            <Text style={styles.buttonResetText}>ZERAR ESTATÍSTICAS</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

// ─── Stat Item ────────────────────────────────────────────────────────────────

function StatItem({
    icon,
    label,
    value,
    highlight = false,
}: {
    icon: string;
    label: string;
    value: string;
    highlight?: boolean;
}) {
    return (
        <View style={statStyles.item}>
            <Ionicons
                name={icon as any}
                size={20}
                color={highlight ? Colors.primary : Colors.textMuted}
            />
            <Text style={[statStyles.value, highlight && statStyles.valueHighlight]}>
                {value}
            </Text>
            <Text style={statStyles.label}>{label}</Text>
        </View>
    );
}

const statStyles = StyleSheet.create({
    item: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: Colors.background,
        borderRadius: Radius.md,
        padding: Spacing.md,
        alignItems: 'center',
        gap: 4,
    },
    value: {
        color: Colors.text,
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
    },
    valueHighlight: {
        color: Colors.primary,
    },
    label: {
        color: Colors.textMuted,
        fontSize: FontSizes.xs,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
});

// ─── Preview do grid ──────────────────────────────────────────────────────────

function GridPreview() {
    const COLS = 5;
    const CELL = 36;
    const GAP = 3;

    const filled: Record<string, string> = {
        '0-0': Colors.piece1, '0-1': Colors.piece1, '0-2': Colors.piece1,
        '1-3': Colors.piece2, '1-4': Colors.piece2,
        '2-3': Colors.piece2, '2-4': Colors.piece2,
        '3-1': Colors.piece3, '3-2': Colors.piece3, '3-3': Colors.piece3,
        '4-0': Colors.piece4, '4-1': Colors.piece4,
    };

    return (
        <View style={[styles.gridPreview, {
            width: COLS * CELL + (COLS - 1) * GAP + 8,
            height: 5 * CELL + 4 * GAP + 8,
        }]}>
            {Array.from({ length: 5 }, (_, r) => (
                <View key={r} style={{ flexDirection: 'row', gap: GAP }}>
                    {Array.from({ length: COLS }, (_, c) => {
                        const key = `${r}-${c}`;
                        const color = filled[key];
                        return (
                            <View
                                key={c}
                                style={{
                                    width: CELL,
                                    height: CELL,
                                    borderRadius: 5,
                                    backgroundColor: color ?? Colors.surface,
                                }}
                            />
                        );
                    })}
                </View>
            ))}
        </View>
    );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-evenly',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.xxl,
    },

    // Logo
    logoArea: {
        alignItems: 'center',
        gap: Spacing.sm,
    },
    gridPreview: {
        borderWidth: 2,
        borderColor: Colors.primary,
        borderRadius: Radius.md,
        padding: 4,
        gap: 3,
        marginBottom: Spacing.md,
    },
    titleDivider: {
        width: 220,
        height: 1,
        backgroundColor: Colors.primary,
        marginVertical: Spacing.xs,
    },
    titleLine1: {
        color: Colors.primary,
        fontSize: FontSizes.xxxl,
        fontWeight: 'bold',
        letterSpacing: 8,
        lineHeight: FontSizes.xxxl,
    },
    titleLine2: {
        color: Colors.secondary,
        fontSize: FontSizes.xxxl,
        fontWeight: 'bold',
        letterSpacing: 8,
        lineHeight: FontSizes.xxxl,
    },
    titleSub: {
        color: Colors.primary,
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        letterSpacing: 10,
        lineHeight: FontSizes.xl * 1.4,
    },
    tagline: {
        color: Colors.textMuted,
        fontSize: FontSizes.xs,
        letterSpacing: 2,
    },

    // Recorde
    bestScoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    bestScoreText: {
        color: Colors.primary,
        fontSize: FontSizes.sm,
        fontWeight: '600',
    },

    // Jogar
    playButton: {
        width: '100%',
        height: 56,
        backgroundColor: Colors.primary,
        borderRadius: Radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playButtonText: {
        color: Colors.background,
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        letterSpacing: 4,
    },

    // Stats button
    statsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    statsButtonText: {
        color: Colors.textMuted,
        fontSize: FontSizes.xs,
        letterSpacing: 2,
    },

    // Rodapé
    footer: {
        color: Colors.textDim,
        fontSize: FontSizes.xs,
        letterSpacing: 3,
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
        gap: Spacing.lg,
    },
    modalTitle: {
        color: Colors.primary,
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        letterSpacing: 4,
        textAlign: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    buttonPrimary: {
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
    buttonReset: {
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonResetText: {
        color: Colors.error,
        fontSize: FontSizes.xs,
        fontWeight: '600',
        letterSpacing: 1,
    },
});
