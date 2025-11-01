import { Assignment, Settings } from './types';
import { PEOPLE_LIST } from './data/people';

// Using jsonblob.com for a simple, free, and anonymous cloud JSON store.
// The previous endpoint was inaccessible (404 Not Found), causing fetch errors.
// This new endpoint has been initialized with the default data structure.
const DB_ENDPOINT = 'https://jsonblob.com/api/jsonBlob/1262492985331400704';

interface CloudData {
    assignments: Record<string, Assignment>;
    settings: Settings;
}

// We will cache the data in memory to reduce network requests.
let cache: CloudData | null = null;

function initializeDefaultData(): CloudData {
    const defaultSettings: Settings = {
        meetingDays: [3, 6], // Wednesday, Saturday
        people: PEOPLE_LIST,
    };
    return {
        assignments: {},
        settings: defaultSettings,
    };
}

async function fetchData(): Promise<CloudData> {
    if (cache) {
        return Promise.resolve(cache);
    }

    try {
        const response = await fetch(DB_ENDPOINT, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            // If the blob doesn't exist (404) or is empty, initialize with default data.
            // This happens on the very first run.
            console.log("No remote data found or error fetching, initializing with defaults.");
            const defaultData = initializeDefaultData();
            cache = defaultData;
            return defaultData;
        }
        
        // Handle potentially empty response body before calling .json()
        const responseText = await response.text();
        if (!responseText) {
             console.warn("Remote data is empty, using defaults.");
             const defaultData = initializeDefaultData();
             cache = defaultData;
             return defaultData;
        }
        const data = JSON.parse(responseText);

        // Basic validation to ensure fetched data has the expected structure
        if (data && typeof data.assignments === 'object' && typeof data.settings === 'object') {
             cache = data;
             return data;
        } else {
            console.warn("Remote data is malformed, using defaults.");
            const defaultData = initializeDefaultData();
            cache = defaultData;
            return defaultData;
        }
    } catch (error) {
        console.error("Error fetching from cloud DB, using default data.", error);
        const defaultData = initializeDefaultData();
        cache = defaultData;
        return defaultData;
    }
}

async function saveData(data: CloudData): Promise<void> {
    cache = data; // Update cache immediately for UI responsiveness
    try {
        const response = await fetch(DB_ENDPOINT, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`Failed to save data: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error saving to cloud DB:", error);
        throw error;
    }
}


// Mimic the old db.ts API for minimal changes in App.tsx
export const initDB = async (): Promise<void> => {
    // With this cloud setup, initialization just means fetching the data to warm up the cache.
    await fetchData();
};

export const getAllAssignments = async (): Promise<Record<string, Assignment>> => {
    const data = await fetchData();
    return data.assignments;
};

export const saveAssignments = async (assignments: Record<string, Assignment>): Promise<void> => {
    if (!cache) await fetchData(); // ensure cache is populated
    const newData = { assignments, settings: cache!.settings };
    await saveData(newData);
};

export const getSettings = async (): Promise<Settings> => {
    const data = await fetchData();
    return data.settings;
};

export const saveSettings = async (settings: Settings): Promise<void> => {
    if (!cache) await fetchData(); // ensure cache is populated
    const newData = { settings, assignments: cache!.assignments };
    await saveData(newData);
};