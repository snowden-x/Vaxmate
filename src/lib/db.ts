import { openDB, DBSchema } from 'idb';
import { v4 as uuidv4 } from 'uuid';


interface VaccineSchedulerDB extends DBSchema {
    children: {
        key: string;
        value: {
            id: string;
            name: string;
            dateOfBirth: string;
        };
    };
    schedules: {
        key: string;
        value: {
            childId: string;
            visits: Array<{
                visitNumber: number;
                date: string;
                vaccines: string[];
            }>;
        };
    };
}

const dbPromise = openDB<VaccineSchedulerDB>('vaccine-scheduler', 1, {
    upgrade(db) {
        db.createObjectStore('children', { keyPath: 'id' });
        db.createObjectStore('schedules', { keyPath: 'childId' });
    },
});

export function calculateVaccineDates(dateOfBirth: string): Array<{ visitNumber: number; date: string; vaccines: string[] }> {
    const dob = new Date(dateOfBirth);
    return [
        { visitNumber: 1, date: dob.toISOString().split('T')[0], vaccines: ['BCG', 'OPV-0'] },
        { visitNumber: 2, date: new Date(dob.getTime() + 6 * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], vaccines: ['OPV-1', 'Penta-1', 'PCV-1', 'Rotavirus vaccine-1'] },
        { visitNumber: 3, date: new Date(dob.getTime() + 10 * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], vaccines: ['OPV-2', 'Penta-2', 'PCV-2', 'Rotavirus vaccine-2'] },
        { visitNumber: 4, date: new Date(dob.getTime() + 14 * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], vaccines: ['OPV-3', 'Penta-3', 'PCV-3'] },
        { visitNumber: 5, date: new Date(dob.getTime() + 9 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], vaccines: ['Measles-Rubella (MR)', 'Yellow Fever'] },
        { visitNumber: 6, date: new Date(dob.getTime() + 18 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], vaccines: ['Measles-Rubella (MR)', 'Meningococcal A conjugate (Men A)'] },
    ];
}

export async function addChild(name: string, dateOfBirth: string) {
    const db = await dbPromise;
    const id = uuidv4();
    await db.add('children', { id, name, dateOfBirth });
    
    const schedule = calculateVaccineDates(dateOfBirth);
    await addSchedule(id, schedule);
    
    return id;
}

export async function getChild(id: string) {
    const db = await dbPromise;
    return db.get('children', id);
}

export async function getAllChildren() {
    const db = await dbPromise;
    return db.getAll('children');
}

export async function addSchedule(childId: string, visits: Array<{ visitNumber: number; date: string; vaccines: string[] }>) {
    const db = await dbPromise;
    await db.put('schedules', { childId, visits });
}

export async function getSchedule(childId: string) {
    const db = await dbPromise;
    return db.get('schedules', childId);
}

export async function updateSchedule(childId: string, visits: Array<{ visitNumber: number; date: string; vaccines: string[] }>) {
    const db = await dbPromise;
    await db.put('schedules', { childId, visits });
}

// New functions to add:

export async function updateChild(id: string, name: string, dateOfBirth: string) {
    const db = await dbPromise;
    await db.put('children', { id, name, dateOfBirth });
}

export async function deleteChild(id: string) {
    const db = await dbPromise;
    await db.delete('children', id);
    await db.delete('schedules', id);  // Also delete associated schedule
}

export async function searchChildren(query: string) {
    const db = await dbPromise;
    const allChildren = await db.getAll('children');
    return allChildren.filter(child => 
        child.name.toLowerCase().includes(query.toLowerCase())
    );
}

export async function getAllSchedules() {
    const db = await dbPromise;
    return db.getAll('schedules');
}

export async function deleteSchedule(childId: string) {
    const db = await dbPromise;
    await db.delete('schedules', childId);
}