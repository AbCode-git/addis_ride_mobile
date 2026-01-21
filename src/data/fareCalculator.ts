import { RideProvider } from "./providers";

export interface FareEstimate {
    providerId: string;
    minEstimate: number;
    maxEstimate: number;
    surgeApplied: boolean;
    surgeReason?: string;
    durationMin: number;
    // Breakdown components
    baseFare: number;
    distanceCost: number;
    timeCost: number;
    surgeAmount: number;
}

/**
 * Calculates fare estimates for a list of providers.
 */
export function calculateFares(
    distanceKm: number,
    durationMin: number,
    providers: RideProvider[],
    currentHour: number = new Date().getHours(),
    category: 'economy' | 'comfort' | 'van' = 'economy'
): FareEstimate[] {
    return providers.map((provider) => {
        const catMultiplier = provider.categoryMultipliers?.[category] || 1.0;

        // 1. Calculate Base Cost
        const distanceCost = (distanceKm * provider.perKmRate) * catMultiplier;
        const timeCost = (durationMin * provider.perMinuteRate) * catMultiplier;
        const baseFare = provider.baseFare * catMultiplier;
        const rawFare = baseFare + distanceCost + timeCost;

        // 2. Determine Surge
        let multiplier = 1.0;
        let surgeReason = undefined;

        // Morning Rush: 6:00 - 9:00
        if (currentHour >= 6 && currentHour < 9) {
            multiplier = provider.surgeMultiplierMorning || 1.3;
            surgeReason = "Morning Rush";
        }
        // Evening Rush: 17:00 - 20:00
        else if (currentHour >= 17 && currentHour < 20) {
            multiplier = provider.surgeMultiplierEvening || 1.4;
            surgeReason = "Evening Rush";
        }

        const surgeFare = rawFare * multiplier;
        const surgeAmount = surgeFare - rawFare;

        // 3. Apply Minimum Fare
        const finalFareBase = Math.max(surgeFare, provider.minFare);

        // 4. Create Range (+/- 5-15%)
        const minEstimate = Math.floor(finalFareBase * 0.95);
        const maxEstimate = Math.ceil(finalFareBase * 1.15);

        return {
            providerId: provider.id,
            minEstimate,
            maxEstimate,
            surgeApplied: multiplier > 1.0,
            surgeReason,
            durationMin,
            baseFare,
            distanceCost,
            timeCost,
            surgeAmount,
        };
    }).sort((a, b) => a.minEstimate - b.minEstimate); // Sort cheapest first
}
