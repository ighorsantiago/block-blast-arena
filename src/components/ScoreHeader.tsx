import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, FontSizes, Radius, Spacing } from '../constants/theme';

interface ScoreHeaderProps {
    score: number;
    bestScore: number;
    combo: number;
    formatScore: (score: number) => string;
    onBack: () => void;
}

export function ScoreHeader({
    score,
    bestScore,
    combo,
    formatScore,
    onBack,
}: ScoreHeaderProps) {
    return (
        <View style={styles.container}>

            {/* Linha superior */}
            <View style={styles.topRow}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backArrow}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.title}>BLOCK BLAST ARENA</Text>
                <View style={styles.backButton} />
            </View>

            {/* Linha de stats */}
            <View style={styles.statsRow}>

                {/* Pontuação atual */}
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>PONTOS</Text>
                    <Text style={styles.statValue}>{formatScore(score)}</Text>
                </View>

                <View style={styles.divider} />

                {/* Recorde */}
                <View style={styles.statItem}>
                    <View style={styles.bestRow}>
                        <Ionicons name="trophy-outline" size={12} color={Colors.primary} />
                        <Text style={styles.statLabel}> RECORDE</Text>
                    </View>
                    <Text style={styles.statValue}>{formatScore(bestScore)}</Text>
                </View>

                {/* Combo — só aparece quando ativo */}
                {combo > 1 && (
                    <>
                        <View style={styles.divider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>COMBO</Text>
                            <Text style={styles.comboValue}>x{combo}</Text>
                        </View>
                    </>
                )}

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.md,
        gap: Spacing.md,
    },

    // Linha superior
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 36,
        alignItems: 'center',
    },
    backArrow: {
        color: Colors.primary,
        fontSize: 36,
        lineHeight: 36,
        fontWeight: '300',
    },
    title: {
        color: Colors.primary,
        fontSize: FontSizes.sm,
        fontWeight: 'bold',
        letterSpacing: 2,
    },

    // Stats
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.borderSubtle,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: 2,
    },
    bestRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statLabel: {
        color: Colors.textMuted,
        fontSize: FontSizes.xs,
        letterSpacing: 1,
    },
    statValue: {
        color: Colors.text,
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
    },
    comboValue: {
        color: Colors.secondary,
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
    },
    divider: {
        width: 1,
        height: 32,
        backgroundColor: Colors.borderSubtle,
        marginHorizontal: Spacing.sm,
    },
});
