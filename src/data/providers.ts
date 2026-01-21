export interface RideProvider {
    id: string;
    name: string;
    color: string;
    logoUrl?: string;
    logoLocal?: any;
    baseFare: number;
    perKmRate: number;
    perMinuteRate: number;
    minFare: number;
    surgeMultiplierMorning: number;
    surgeMultiplierEvening: number;
    pickupDelayMin: number;
    enabled?: boolean;
    categoryMultipliers?: {
        economy: number;
        comfort: number;
        van: number;
    };
}

export const PROVIDERS: RideProvider[] = [
    {
        id: "p1",
        name: "RIDE",
        color: "#FCD34D",
        logoLocal: require('../../assets/logos/ride.png'),
        baseFare: 130,
        perKmRate: 16,
        perMinuteRate: 3,
        minFare: 80,
        surgeMultiplierMorning: 1.3,
        surgeMultiplierEvening: 1.4,
        pickupDelayMin: 4,
        enabled: true,
        categoryMultipliers: { economy: 1.0, comfort: 1.35, van: 2.0 }
    },
    {
        id: "p2",
        name: "Yango",
        color: "#EF4444",
        logoLocal: require('../../assets/logos/yango.png'),
        baseFare: 92,
        perKmRate: 15,
        perMinuteRate: 2.2,
        minFare: 70,
        surgeMultiplierMorning: 1.3,
        surgeMultiplierEvening: 1.4,
        pickupDelayMin: 2,
        enabled: true,
        categoryMultipliers: { economy: 1.0, comfort: 1.3, van: 1.8 }
    },
    {
        id: "p3",
        name: "Feres",
        color: "#10B981",
        logoLocal: require('../../assets/logos/feres.png'),
        baseFare: 130,
        perKmRate: 16,
        perMinuteRate: 1,
        minFare: 80,
        surgeMultiplierMorning: 1.3,
        surgeMultiplierEvening: 1.4,
        pickupDelayMin: 5,
        enabled: true,
        categoryMultipliers: { economy: 1.0, comfort: 1.25, van: 1.9 }
    },
];
