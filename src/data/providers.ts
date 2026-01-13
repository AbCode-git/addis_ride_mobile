export interface RideProvider {
    id: string;
    name: string;
    color: string;
    logoUrl?: string; // Optional for MVP, we'll use Icons or Text
    baseFare: number;
    perKmRate: number;
    perMinuteRate: number;
    minFare: number;
    surgeMultiplierMorning: number;
    surgeMultiplierEvening: number;
}

export const PROVIDERS: RideProvider[] = [
    {
        id: "p1",
        name: "RIDE",
        color: "#FCD34D", // Yellow
        baseFare: 130,
        perKmRate: 16,
        perMinuteRate: 3,
        minFare: 80,
        surgeMultiplierMorning: 1.3,
        surgeMultiplierEvening: 1.4,
    },
    {
        id: "p2",
        name: "Yango",
        color: "#EF4444", // Red
        baseFare: 100,
        perKmRate: 15,
        perMinuteRate: 2.5,
        minFare: 75,
        surgeMultiplierMorning: 1.3,
        surgeMultiplierEvening: 1.4,
    },
    {
        id: "p3",
        name: "Feres",
        color: "#10B981", // Green
        baseFare: 130,
        perKmRate: 16,
        perMinuteRate: 1,
        minFare: 80,
        surgeMultiplierMorning: 1.3,
        surgeMultiplierEvening: 1.4,
    },
    {
        id: "p4",
        name: "ZayRide",
        color: "#3B82F6", // Blue
        baseFare: 100,
        perKmRate: 16,
        perMinuteRate: 2,
        minFare: 75,
        surgeMultiplierMorning: 1.3,
        surgeMultiplierEvening: 1.4,
    },
];
