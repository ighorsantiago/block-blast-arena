import { useEffect, useRef, useState } from 'react';
import {
    AdEventType,
    InterstitialAd,
} from 'react-native-google-mobile-ads';

const AD_UNIT_IDS = {
    banner: 'ca-app-pub-3386298011801498/3575466897',
    interstitial: 'ca-app-pub-3386298011801498/3780413238',
};

// ─── Interstitial ─────────────────────────────────────────────────────────────

export function useInterstitialAd() {
    const interstitial = useRef(
        InterstitialAd.createForAdRequest(AD_UNIT_IDS.interstitial, {
            requestNonPersonalizedAdsOnly: true,
        })
    );
    const [loaded, setLoaded] = useState(false);
    const gamesCount = useRef(0);

    useEffect(() => {
        const unsubscribeLoaded = interstitial.current.addAdEventListener(
            AdEventType.LOADED,
            () => setLoaded(true)
        );
        const unsubscribeClosed = interstitial.current.addAdEventListener(
            AdEventType.CLOSED,
            () => {
                setLoaded(false);
                interstitial.current.load();
            }
        );

        interstitial.current.load();

        return () => {
            unsubscribeLoaded();
            unsubscribeClosed();
        };
    }, []);

    function onGameStarted() {
        gamesCount.current += 1;
        if (gamesCount.current % 3 === 0 && loaded) {
            interstitial.current.show();
        }
    }

    return { onGameStarted };
}
