import { useRouter } from 'expo-router';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSizes, Radius, Spacing } from '../constants/theme';

export default function HomeScreen() {
    const router = useRouter();

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

                {/* Botão jogar */}
                <TouchableOpacity
                    style={styles.playButton}
                    onPress={handlePlay}
                    activeOpacity={0.85}
                >
                    <Text style={styles.playButtonText}>JOGAR</Text>
                </TouchableOpacity>

                {/* Rodapé */}
                <Text style={styles.footer}>ARENA GAMES</Text>

            </View>
        </SafeAreaView>
    );
}

// ─── Preview do grid ──────────────────────────────────────────────────────────

function GridPreview() {
    const COLS = 5;
    const CELL = 36;
    const GAP = 3;

    // Mini blocos decorativos
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

    // Rodapé
    footer: {
        color: Colors.textDim,
        fontSize: FontSizes.xs,
        letterSpacing: 3,
    },
});
