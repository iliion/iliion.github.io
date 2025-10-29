
import { Coords } from '../types';

// Haversine formula to calculate distance between two lat/lon points in km
export const haversineDistance = (coords1: Coords, coords2: Coords): number => {
    const toRad = (x: number): number => (x * Math.PI) / 180;

    const R = 6371; // Earth's radius in km
    const dLat = toRad(coords2.latitude - coords1.latitude);
    const dLon = toRad(coords2.longitude - coords1.longitude);
    const lat1 = toRad(coords1.latitude);
    const lat2 = toRad(coords2.latitude);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;

    return d;
};
