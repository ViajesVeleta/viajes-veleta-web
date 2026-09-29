import type { CollectionEntry } from "astro:content";

/**
 * Checks whether a trip has already taken place (is in the past).
 * A trip is past if its end date (or start date if no end date) is before today.
 */
export function isTripPast(date: Date, endDate?: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tripEnd = new Date(endDate ?? date);
    tripEnd.setHours(23, 59, 59, 999);

    return tripEnd.getTime() < today.getTime();
}

/**
 * Separates trips into upcoming and past trips.
 * Upcoming trips are sorted ascending (soonest first).
 * Past trips are sorted descending (most recently completed first).
 */
export function partitionTrips(trips: CollectionEntry<"groups">[]) {
    const upcoming: CollectionEntry<"groups">[] = [];
    const past: CollectionEntry<"groups">[] = [];

    for (const trip of trips) {
        if (isTripPast(trip.data.date, trip.data.endDate)) {
            past.push(trip);
        } else {
            upcoming.push(trip);
        }
    }

    upcoming.sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf());
    past.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

    return { upcoming, past };
}
