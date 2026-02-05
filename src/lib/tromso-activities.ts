// Tromsø activities for recommendations between tours

// Interest categories that match the preference form
export type InterestCategory = "fjord" | "northern-lights" | "food" | "culture" | "wildlife" | "nightlife";

export interface Activity {
  id: string;
  name: string;
  type: "cafe" | "museum" | "attraction" | "walk" | "shopping" | "viewpoint" | "indoor";
  interests: InterestCategory[]; // which user interests this activity matches
  durationMinutes: number;
  description: string;
  location: string;
  walkingMinutes?: number; // from harbor
  price?: string;
  tip?: string;
}

export const tromsøActivities: Activity[] = [
  // Cafes & Restaurants
  {
    id: "bonnna",
    name: "Bønna Coffee",
    type: "cafe",
    interests: ["food"],
    durationMinutes: 30,
    description: "High-quality coffee at the harbor terminal",
    location: "Harbor Terminal, Prostneset",
    walkingMinutes: 1,
  },
  {
    id: "jordbarpikene",
    name: "Jordbærpikene",
    type: "cafe",
    interests: ["food", "fjord"],
    durationMinutes: 45,
    description: "Café with possibly the best view in Tromsø over the fjord",
    location: "3rd floor, Nerstranda",
    walkingMinutes: 5,
  },
  {
    id: "riso",
    name: "Risø",
    type: "cafe",
    interests: ["food", "culture"],
    durationMinutes: 45,
    description: "Local favorite café and art gallery",
    location: "City center",
    walkingMinutes: 5,
  },
  {
    id: "olhallen",
    name: "Ølhallen",
    type: "cafe",
    interests: ["food", "nightlife", "culture"],
    durationMinutes: 60,
    description: "Tromsø's oldest pub, serving beer from Mack Brewery",
    location: "City center",
    walkingMinutes: 5,
  },

  // Museums
  {
    id: "polaria",
    name: "Polaria",
    type: "museum",
    interests: ["wildlife", "culture"],
    durationMinutes: 90,
    description: "World's northernmost aquarium with seals and Arctic marine life",
    location: "Hjalmar Johansens gate 12",
    walkingMinutes: 5,
    price: "See polaria.no for prices",
    tip: "Seal feeding at 10:30, 12:30, and 15:30",
  },
  {
    id: "polar-museum",
    name: "Polar Museum",
    type: "museum",
    interests: ["culture"],
    durationMinutes: 75,
    description: "History of famous polar explorers in a historic warehouse from 1830",
    location: "Skansen area, waterfront",
    walkingMinutes: 8,
    price: "130 NOK adults",
  },
  {
    id: "full-steam",
    name: "Full Steam Museum",
    type: "museum",
    interests: ["culture", "northern-lights"],
    durationMinutes: 75,
    description: "Sea Sami culture, maritime history and northern lights photography",
    location: "Historic building at the harbor",
    walkingMinutes: 3,
  },
  {
    id: "art-museum",
    name: "Northern Norwegian Art Museum",
    type: "museum",
    interests: ["culture"],
    durationMinutes: 60,
    description: "Art museum featuring Northern Norwegian and national artists",
    location: "Sjøgata 1, city center",
    walkingMinutes: 5,
  },

  // Attractions
  {
    id: "arctic-cathedral",
    name: "Arctic Cathedral",
    type: "attraction",
    interests: ["culture", "northern-lights"],
    durationMinutes: 45,
    description: "Iconic landmark and functioning parish church with stunning architecture",
    location: "Tromsdalen, across the bridge",
    walkingMinutes: 25,
    price: "~70-80 NOK",
    tip: "Midnight sun concerts in summer, northern lights concerts in winter",
  },
  {
    id: "fjellheisen",
    name: "Fjellheisen Cable Car",
    type: "attraction",
    interests: ["fjord", "northern-lights"],
    durationMinutes: 90,
    description: "Panoramic views from 421m above sea level - perfect for northern lights",
    location: "Tromsdalen",
    walkingMinutes: 30,
    tip: "Best combined with Arctic Cathedral visit",
  },

  // Walks
  {
    id: "storgata-walk",
    name: "Storgata Pedestrian Street",
    type: "walk",
    interests: ["culture", "food"],
    durationMinutes: 45,
    description: "Main pedestrian street with cafés, shops and mixed architecture",
    location: "City center",
    walkingMinutes: 2,
  },
  {
    id: "harbor-promenade",
    name: "Harbor Promenade",
    type: "walk",
    interests: ["fjord"],
    durationMinutes: 30,
    description: "Beautiful walk along the harbor with views of Arctic Cathedral and fjord",
    location: "Along the waterfront",
    walkingMinutes: 0,
  },
  {
    id: "bridge-walk",
    name: "Tromsø Bridge Walk",
    type: "walk",
    interests: ["fjord"],
    durationMinutes: 35,
    description: "Walk across the iconic bridge with views of the city and fjords",
    location: "Tromsø Bridge",
    walkingMinutes: 5,
  },

  // Shopping
  {
    id: "nerstranda",
    name: "Alti Nerstranda",
    type: "shopping",
    interests: ["food"],
    durationMinutes: 60,
    description: "Shopping center with 46 shops and eateries in the city center",
    location: "City center",
    walkingMinutes: 5,
  },
  {
    id: "storgata-shopping",
    name: "Storgata Shops",
    type: "shopping",
    interests: ["culture"],
    durationMinutes: 60,
    description: "Boutiques, souvenir shops, and local crafts",
    location: "Main street",
    walkingMinutes: 2,
  },

  // Viewpoints
  {
    id: "harbor-viewpoint",
    name: "Prostneset Harbor",
    type: "viewpoint",
    interests: ["fjord", "northern-lights"],
    durationMinutes: 15,
    description: "Great views of Arctic Cathedral, bridge, and mountains",
    location: "Harbor area",
    walkingMinutes: 0,
  },
  {
    id: "bridge-viewpoint",
    name: "Tromsø Bridge",
    type: "viewpoint",
    interests: ["fjord", "northern-lights"],
    durationMinutes: 20,
    description: "Panoramic views of the city, fjords, and mountains",
    location: "Tromsø Bridge",
    walkingMinutes: 5,
    tip: "Especially beautiful at sunset or during northern lights season",
  },

  // Indoor activities (bad weather)
  {
    id: "tromsobadet",
    name: "Tromsøbadet",
    type: "indoor",
    interests: [],
    durationMinutes: 120,
    description: "Swimming pools, saunas, and water attractions",
    location: "Tromsø",
    walkingMinutes: 15,
  },
  {
    id: "bybowling",
    name: "ByBowling",
    type: "indoor",
    interests: ["nightlife"],
    durationMinutes: 90,
    description: "Bowling, darts, billiards and shuffleboard with bar",
    location: "City center",
    walkingMinutes: 5,
  },
  {
    id: "pust-sauna",
    name: "Pust Sauna",
    type: "indoor",
    interests: ["fjord"],
    durationMinutes: 75,
    description: "Floating sauna with fjord views and cold water dip",
    location: "Harbor",
    walkingMinutes: 5,
    tip: "Great view of Arctic Cathedral from the water",
  },
];

// Get recommended activities for a time gap
export function getRecommendedActivities(
  gapMinutes: number,
  excludeTypes?: Activity["type"][],
  userInterests?: InterestCategory[]
): Activity[] {
  const suitable = tromsøActivities.filter((a) => {
    // Filter by duration (activity should fit in gap with some buffer)
    if (a.durationMinutes + 15 > gapMinutes) return false;
    // Filter out excluded types
    if (excludeTypes && excludeTypes.includes(a.type)) return false;
    return true;
  });

  // Sort by interest match first, then by best fit
  return suitable.sort((a, b) => {
    // Count interest matches
    const aMatches = userInterests
      ? a.interests.filter(i => userInterests.includes(i)).length
      : 0;
    const bMatches = userInterests
      ? b.interests.filter(i => userInterests.includes(i)).length
      : 0;

    // Prioritize more interest matches
    if (bMatches !== aMatches) return bMatches - aMatches;

    // Then by best fit (closest to gap time without going over)
    const aFit = gapMinutes - a.durationMinutes;
    const bFit = gapMinutes - b.durationMinutes;
    return aFit - bFit;
  });
}

// Get a mix of different activity types, prioritizing user interests
export function getMixedRecommendations(
  gapMinutes: number,
  count: number = 3,
  userInterests?: InterestCategory[]
): Activity[] {
  const types: Activity["type"][] = ["cafe", "museum", "walk", "attraction", "viewpoint"];
  const result: Activity[] = [];
  const usedTypes = new Set<Activity["type"]>();

  // First pass: try to match user interests
  if (userInterests && userInterests.length > 0) {
    const interestMatches = tromsøActivities
      .filter((a) => {
        if (a.durationMinutes + 15 > gapMinutes) return false;
        return a.interests.some(i => userInterests.includes(i));
      })
      .sort((a, b) => {
        const aMatches = a.interests.filter(i => userInterests.includes(i)).length;
        const bMatches = b.interests.filter(i => userInterests.includes(i)).length;
        return bMatches - aMatches;
      });

    for (const activity of interestMatches) {
      if (result.length >= count) break;
      if (!usedTypes.has(activity.type)) {
        result.push(activity);
        usedTypes.add(activity.type);
      }
    }
  }

  // Second pass: fill remaining slots with variety
  for (const type of types) {
    if (result.length >= count) break;
    if (usedTypes.has(type)) continue;

    const activities = tromsøActivities.filter(
      (a) => a.type === type && a.durationMinutes + 15 <= gapMinutes
    );

    if (activities.length > 0) {
      result.push(activities[0]);
      usedTypes.add(type);
    }
  }

  return result;
}

// Get the interest category label for display
export function getInterestLabel(interest: InterestCategory): string {
  const labels: Record<InterestCategory, string> = {
    "fjord": "🌊 Fjord views",
    "northern-lights": "🌌 Northern lights",
    "food": "🍽️ Food & drink",
    "culture": "🏛️ Culture",
    "wildlife": "🦭 Wildlife",
    "nightlife": "🎉 Nightlife",
  };
  return labels[interest] || interest;
}
