export function formatDate(date: Date | string): string {
    const d = date instanceof Date ? date : new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); // getMonth() is zero-indexed
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

export function parseDate(dateString: string): Date {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day); // month is zero-indexed in Date constructor
}