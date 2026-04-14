import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = '@block_blast_arena_stats';

export interface BlockBlastStats {
    gamesPlayed: number;
    bestScore: number;
    totalScore: number;
    minScore: number | null;  // null até ter pelo menos 1 jogo
}

function emptyStats(): BlockBlastStats {
    return {
        gamesPlayed: 0,
        bestScore: 0,
        totalScore: 0,
        minScore: null,
    };
}

async function loadStats(): Promise<BlockBlastStats> {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw) as Partial<BlockBlastStats>;
            return { ...emptyStats(), ...parsed };
        }
    } catch { }
    return emptyStats();
}

async function saveStats(stats: BlockBlastStats): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch { }
}

export function useStats() {
    const [stats, setStats] = useState<BlockBlastStats>(emptyStats());
    const [loaded, setLoaded] = useState(false);
    const statsRef = useRef<BlockBlastStats>(emptyStats());

    // ─── Carregar ao montar ───────────────────────────────────────────────────

    useEffect(() => {
        loadStats().then(s => {
            statsRef.current = s;
            setStats(s);
            setLoaded(true);
        });
    }, []);

    // ─── Registrar partida finalizada ─────────────────────────────────────────

    const recordGame = useCallback(async (score: number): Promise<boolean> => {
        const current = await loadStats();
        const isNewBest = score > current.bestScore;

        const next: BlockBlastStats = {
            gamesPlayed: current.gamesPlayed + 1,
            bestScore: isNewBest ? score : current.bestScore,
            totalScore: current.totalScore + score,
            minScore: current.minScore === null
                ? score
                : Math.min(current.minScore, score),
        };

        statsRef.current = next;
        setStats(next);
        await saveStats(next);
        return isNewBest;
    }, []);

    // ─── Zerar estatísticas ───────────────────────────────────────────────────

    const resetStats = useCallback(async () => {
        const empty = emptyStats();
        statsRef.current = empty;
        setStats(empty);
        await saveStats(empty);
    }, []);

    // ─── Helpers ──────────────────────────────────────────────────────────────

    function getAvgScore(): number {
        if (stats.gamesPlayed === 0) return 0;
        return Math.floor(stats.totalScore / stats.gamesPlayed);
    }

    function formatScore(score: number): string {
        if (score >= 1000000) return `${(score / 1000000).toFixed(1)}M`;
        if (score >= 1000) return `${(score / 1000).toFixed(1)}K`;
        return String(score);
    }

    const reloadStats = useCallback(async () => {
        const s = await loadStats();
        statsRef.current = s;
        setStats(s);
    }, []);

    return {
        stats,
        loaded,
        recordGame,
        resetStats,
        reloadStats,
        getAvgScore,
        formatScore,
    };
}
