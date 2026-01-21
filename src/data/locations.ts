export interface LocationData {
    name: string;
    lat: number;
    lng: number;
    keywords?: string[];
}

export const STATIC_LOCATIONS: LocationData[] = [
    // Hubs
    { name: "Bole International Airport", lat: 8.9778, lng: 38.7993, keywords: ["airport", "terminal", "fly"] },
    { name: "Meskel Square", lat: 9.0104, lng: 38.7613, keywords: ["center", "stadium"] },
    { name: "Mexico Square", lat: 9.0103, lng: 38.7454, keywords: ["transport"] },
    { name: "Piassa (Piazza)", lat: 9.0305, lng: 38.7400, keywords: ["old town", "churchill"] },
    { name: "Megenagna", lat: 9.0205, lng: 38.8011, keywords: ["terminal", "east"] },
    { name: "Kazanchis", lat: 9.0184, lng: 38.7674, keywords: ["hotels", "un", "eca"] },
    { name: "4 Kilo", lat: 9.0333, lng: 38.7505, keywords: ["palace", "parliament", "university"] },
    { name: "6 Kilo", lat: 9.0409, lng: 38.7607, keywords: ["university", "museum"] },

    // Bole Area
    { name: "Bole Medhanialem", lat: 8.9934, lng: 38.7865, keywords: ["church", "camara"] },
    { name: "Edna Mall", lat: 8.9944, lng: 38.7884, keywords: ["cinema", "matti"] },
    { name: "Friendship Park", lat: 9.0160, lng: 38.7595, keywords: ["park", "palace"] },
    { name: "Bole Atlas", lat: 9.0020, lng: 38.7850, keywords: ["hotel"] },
    { name: "22 Mazoria", lat: 9.0225, lng: 38.7955, keywords: ["golagul", "zeret"] },
    { name: "Olympia", lat: 8.9980, lng: 38.7680, keywords: ["dembel"] },
    { name: "Bambis", lat: 9.0150, lng: 38.7550, keywords: ["supermarket"] },
    { name: "Hayahulet", lat: 9.0220, lng: 38.7950, keywords: ["hospital"] },

    // Residential / Suburbs
    { name: "CMC St. Michael", lat: 9.0195, lng: 38.8205, keywords: ["train", "tsehay"] },
    { name: "Ayat", lat: 9.0505, lng: 38.8305, keywords: ["train", "village"] },
    { name: "Summit", lat: 8.9855, lng: 38.7755, keywords: ["condo", "soft drink"] },
    { name: "Gerji", lat: 8.9805, lng: 38.8105, keywords: ["unity", "taxi"] },
    { name: "Jemo 1", lat: 8.9275, lng: 38.7005, keywords: ["condo"] },
    { name: "Lebu", lat: 8.9305, lng: 38.7205, keywords: ["varnero", "music"] },
    { name: "Lafto", lat: 8.9505, lng: 38.7405, keywords: ["mall"] },
    { name: "Sarbet", lat: 8.9955, lng: 38.7305, keywords: ["canada", "vatican", "mekanisa"] },
    { name: "Bisrate Gabriel", lat: 8.9880, lng: 38.7350, keywords: ["church", "tvet"] },
    { name: "Gotera", lat: 8.9905, lng: 38.7555, keywords: ["interchange", "pepsi"] },

    // West / North
    { name: "Lideta", lat: 9.0155, lng: 38.7355, keywords: ["condo", "court", "church"] },
    { name: "Tor Hailoch", lat: 9.0180, lng: 38.7250, keywords: ["hospital"] },
    { name: "Kolfe", lat: 9.0105, lng: 38.7105, keywords: ["18", "police"] },
    { name: "Merkato", lat: 9.0304, lng: 38.7305, keywords: ["market", "bus"] },
    { name: "Shiro Meda", lat: 9.0550, lng: 38.7650, keywords: ["embassy", "market"] },
    { name: "Entoto Park", lat: 9.0750, lng: 38.7650, keywords: ["park", "mountain"] },
];

/**
 * Searches static list
 */
export function searchStaticLocations(query: string): LocationData[] {
    if (!query) return [];
    const q = query.toLowerCase();
    return STATIC_LOCATIONS.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.keywords?.some(k => k.includes(q))
    ).slice(0, 5);
}
