import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English translations
const enTranslations = {
  app: {
    name: 'SmokeSignal',
    languageName: 'English'
  },
  map: {
    locate: 'Find my location',
    layers: 'Map layers',
    settings: 'Settings'
  },
  danger: {
    title: 'Fire Danger Index',
    risk_label: 'FIRE RISK',
    low: 'Low',
    moderate: 'Moderate',
    high: 'High',
    severe: 'Severe',
    extreme: 'Extreme'
  },
  fire: {
    activeTitle: 'Active Fires',
    listTitle: 'Fire Alerts',
    near: 'Fire near',
    detected: 'Detected',
    ago: 'ago',
    recentlyDetected: 'recently',
    unknownLocation: 'Unknown location',
    distanceUnknown: 'Distance unknown',
    noFires: 'No active fires in your area.',
    noMatchingFires: 'No fires match your current filters.',
    noNearbyFires: 'No fires within your selected distance',
    closestFire: 'Closest fire is about',
    increaseRadius: 'Increase Search Radius',
    noLocationNoNearbyFires: 'Enable location to see nearby fires',
    locationNeeded: 'Location access needed for accurate distances',
    enableLocation: 'Click the location button to enable accurate distance-based filtering.',
    locationFilter: 'For better results, enable location access',
    locationAvailable: 'Your location is available',
    locationNotAvailable: 'Location services not enabled',
    showAllFires: 'Show All Fires',
    filter: 'Filter',
    hideFilters: 'Hide Filters',
    filterBy: 'Filter By',
    sortBy: 'Sort By',
    maxDistance: 'Maximum distance',
    filterOptions: {
      all: 'All Fires',
      nearby: 'Nearby',
      severe: 'Severe',
      recent: 'Recent',
      visible: 'In View',
      province: 'By Province'
    },
    province: {
      select: 'Select Province',
      all: 'All Provinces',
      easternCape: 'Eastern Cape',
      westernCape: 'Western Cape',
      northernCape: 'Northern Cape',
      gauteng: 'Gauteng',
      kwazuluNatal: 'KwaZulu-Natal',
      freeState: 'Free State',
      northWest: 'North West',
      mpumalanga: 'Mpumalanga',
      limpopo: 'Limpopo'
    },
    sort: {
      distance: 'Distance',
      intensity: 'Severity',
      time: 'Time'
    },
    intensity: {
      low: 'Low intensity',
      moderate: 'Moderate intensity',
      high: 'High intensity',
      extreme: 'Extreme intensity'
    },
    status: {
      monitor: 'Monitor',
      ready: 'Be Ready',
      evacuate: 'Evacuate'
    },
    away: 'away',
    alertMe: 'Alert Me',
    firstDetected: 'First detected',
    location: 'Location',
    weather: 'Weather conditions',
    getAlerts: 'Get Alerts',
    share: 'Share'
  },
  safety: {
    title: 'Safety Tips',
    evacuateEarly: 'Evacuate Early',
    callEmergency: 'Call Emergency',
    clearDebris: 'Clear Debris',
    stayInformed: 'Stay Informed',
    preparePlan: 'Prepare Plan',
    packEssentials: 'Pack Essentials'
  },
  offline: {
    title: 'Offline Mode Active',
    description: 'Map and safety info available. Reconnect for latest fire data.'
  },
  notifications: {
    title: 'Stay Informed, Stay Safe',
    description: 'Receive critical fire alerts for your area to protect yourself and your loved ones.',
    features: {
      realtime: 'Real-time fire notifications',
      location: 'Location-based alerts',
      evacuation: 'Evacuation guidance'
    },
    enable: 'Enable Notifications',
    later: 'Maybe Later'
  }
};

// Afrikaans translations
const afTranslations = {
  app: {
    name: 'RookSein',
    languageName: 'Afrikaans'
  },
  map: {
    locate: 'Vind my ligging',
    layers: 'Kaart lae',
    settings: 'Instellings'
  },
  danger: {
    title: 'Brandgevaar Indeks',
    risk_label: 'BRANDRISIKO',
    low: 'Laag',
    moderate: 'Matig',
    high: 'Hoog',
    severe: 'Ernstig',
    extreme: 'Ekstreem'
  },
  fire: {
    activeTitle: 'Aktiewe Brande',
    near: 'Brand naby',
    detected: 'Bespeur',
    ago: 'gelede',
    intensity: {
      low: 'Lae intensiteit',
      moderate: 'Matige intensiteit',
      high: 'Hoë intensiteit',
      extreme: 'Ekstreme intensiteit'
    },
    status: {
      monitor: 'Monitor',
      ready: 'Wees Gereed',
      evacuate: 'Ontruim'
    },
    away: 'weg',
    alertMe: 'Waarsku My',
    firstDetected: 'Eerste bespeur',
    location: 'Ligging',
    weather: 'Weer toestande',
    getAlerts: 'Kry Waarskuwings',
    share: 'Deel',
    filterOptions: {
      province: 'Per Provinsie'
    },
    province: {
      select: 'Kies Provinsie',
      all: 'Alle Provinsies',
      easternCape: 'Oos-Kaap',
      westernCape: 'Wes-Kaap',
      northernCape: 'Noord-Kaap',
      gauteng: 'Gauteng',
      kwazuluNatal: 'KwaZulu-Natal',
      freeState: 'Vrystaat',
      northWest: 'Noordwes',
      mpumalanga: 'Mpumalanga',
      limpopo: 'Limpopo'
    }
  },
  safety: {
    title: 'Veiligheid Wenke',
    evacuateEarly: 'Ontruim Vroeg',
    callEmergency: 'Bel Nooddienste',
    clearDebris: 'Verwyder Rommel',
    stayInformed: 'Bly Ingelig',
    preparePlan: 'Berei Plan Voor',
    packEssentials: 'Pak Noodsaaklikhede'
  },
  offline: {
    title: 'Aflyn Modus Aktief',
    description: 'Kaart en veiligheid inligting beskikbaar. Koppel weer aan vir die nuutste branddata.'
  },
  notifications: {
    title: 'Bly Ingelig, Bly Veilig',
    description: 'Ontvang kritieke brandwaarskuwings vir jou area om jouself en jou geliefdes te beskerm.',
    features: {
      realtime: 'Intydse brandkennisgewings',
      location: 'Ligging-gebaseerde waarskuwings',
      evacuation: 'Ontruiming leiding'
    },
    enable: 'Aktiveer Kennisgewings',
    later: 'Miskien Later'
  }
};

// Xhosa translations
const xhTranslations = {
  app: {
    name: 'UmsiUmlilo',
    languageName: 'isiXhosa'
  },
  map: {
    locate: 'Fumana indawo yam',
    layers: 'Iilayer zemephu',
    settings: 'Iisethingi'
  },
  danger: {
    title: 'Isalathisi Sengozi Yomlilo',
    risk_label: 'UBUNGOZI BOMLILO',
    low: 'Ezantsi',
    moderate: 'Phakathi',
    high: 'Ephezulu',
    severe: 'Enzima',
    extreme: 'Engaphezulu'
  },
  fire: {
    activeTitle: 'Imililo Esebenzayo',
    near: 'Umlilo kufuphi',
    detected: 'Ifunyenwe',
    ago: 'eyadlulayo',
    intensity: {
      low: 'Umandla osezantsi',
      moderate: 'Umandla ophakathi',
      high: 'Umandla ophezulu',
      extreme: 'Umandla ogqithisileyo'
    },
    status: {
      monitor: 'Jonga',
      ready: 'Yiba Semaxhantini',
      evacuate: 'Baleka'
    },
    away: 'kude',
    alertMe: 'Ndazise',
    firstDetected: 'Ifunyenwe kuqala',
    location: 'Indawo',
    weather: 'Iimeko zemozulu',
    getAlerts: 'Fumana Izaziso',
    share: 'Yabelana',
    filterOptions: {
      province: 'Ngephondo'
    },
    province: {
      select: 'Khetha Iphondo',
      all: 'Onke Amaphondo',
      easternCape: 'Mpuma Koloni',
      westernCape: 'Ntshona Koloni',
      northernCape: 'Mntla Koloni',
      gauteng: 'eGauteng',
      kwazuluNatal: 'KwaZulu-Natal',
      freeState: 'Free State',
      northWest: 'Mntla Ntshona',
      mpumalanga: 'eMpumalanga',
      limpopo: 'eLimpopo'
    }
  },
  safety: {
    title: 'Amacebo Okhuseleko',
    evacuateEarly: 'Baleka Kwangoko',
    callEmergency: 'Biza Uncedo',
    clearDebris: 'Sula Inkunkuma',
    stayInformed: 'Hlala Unolwazi',
    preparePlan: 'Lungisa Isicwangciso',
    packEssentials: 'Paka Izinto Ezibalulekileyo'
  },
  offline: {
    title: 'Indlela Yogqithiso Isebenza',
    description: 'Imephu nolwazi lokhuseleko luyafumaneka. Qhagamshelana kwakhona ukuze ufumane iinkcukacha zakamuva zomlilo.'
  },
  notifications: {
    title: 'Hlala Unolwazi, Hlala Ukhuselekile',
    description: 'Fumana izilumkiso zomlilo ezibalulekileyo kwindawo yakho ukuze uzikuskele wena nabathandwa bakho.',
    features: {
      realtime: 'Izaziso zomlilo ngoku-ngoku',
      location: 'Izilumkiso ezisekelwe kwindawo',
      evacuation: 'Ukhokeleo lokubaleka'
    },
    enable: 'Vumela Izaziso',
    later: 'Mhlawumbi Kamva'
  }
};

// Initialize i18next with our translations
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      af: { translation: afTranslations },
      xh: { translation: xhTranslations }
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;
