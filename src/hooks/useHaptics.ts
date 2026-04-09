import * as Haptics from 'expo-haptics';

export function useHaptics() {
    async function vibrateSuccess() {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    async function vibrateCombo() {
        // Vibração dupla para combos
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 120);
    }

    async function vibrateDrop() {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    async function vibrateGameOver() {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    return { vibrateSuccess, vibrateCombo, vibrateDrop, vibrateGameOver };
}
