export type CulturalRegion = 'western' | 'east-asian' | 'middle-eastern' | 'south-asian';

const REGION_MAP: Record<string, CulturalRegion> = {
    // East Asia
    'CN': 'east-asian', // China
    'JP': 'east-asian', // Japan
    'KR': 'east-asian', // South Korea
    'TW': 'east-asian', // Taiwan
    'HK': 'east-asian', // Hong Kong
    'VN': 'east-asian', // Vietnam
    'SG': 'east-asian', // Singapore
    'MY': 'east-asian', // Malaysia (Mixed, but often high context)
    'TH': 'east-asian', // Thailand

    // Middle East
    'SA': 'middle-eastern', // Saudi Arabia
    'AE': 'middle-eastern', // UAE
    'IR': 'middle-eastern', // Iran
    'IQ': 'middle-eastern', // Iraq
    'EG': 'middle-eastern', // Egypt
    'QA': 'middle-eastern', // Qatar
    'KW': 'middle-eastern', // Kuwait
    'OM': 'middle-eastern', // Oman
    'BH': 'middle-eastern', // Bahrain
    'JO': 'middle-eastern', // Jordan
    'LB': 'middle-eastern', // Lebanon

    // South Asia
    'IN': 'south-asian', // India
    'PK': 'south-asian', // Pakistan
    'BD': 'south-asian', // Bangladesh
    'LK': 'south-asian', // Sri Lanka
    'NP': 'south-asian', // Nepal
};

export const getRegionFromCountryCode = (countryCode: string): CulturalRegion => {
    return REGION_MAP[countryCode.toUpperCase()] || 'western';
};
