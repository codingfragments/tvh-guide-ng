export interface PresetTime {
	label: string;
	hour: number;
	minute: number;
}

export interface DayItem {
	date: Date;
	weekday: string;
	dayNumber: number;
	label: string;
	isToday: boolean;
}

const WEEKDAY_ABBR = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

export function normalizeToMidnight(date: Date): Date {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
}

export function isSameDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

export function generateDays(start: Date, end: Date): DayItem[] {
	const days: DayItem[] = [];
	const today = new Date();
	const current = normalizeToMidnight(start);
	const last = normalizeToMidnight(end);

	while (current <= last) {
		const isToday = isSameDay(current, today);
		days.push({
			date: new Date(current),
			weekday: WEEKDAY_ABBR[current.getDay()],
			dayNumber: current.getDate(),
			label: isToday ? 'Heute' : WEEKDAY_ABBR[current.getDay()],
			isToday,
		});
		current.setDate(current.getDate() + 1);
	}

	return days;
}

export function clampDate(timestamp: Date, start: Date, end: Date): Date {
	const startMidnight = normalizeToMidnight(start);
	const endEnd = normalizeToMidnight(end);
	endEnd.setHours(23, 59, 59, 999);

	if (timestamp < startMidnight) return new Date(startMidnight);
	if (timestamp > endEnd) return new Date(endEnd);
	return timestamp;
}

export function setDateKeepTime(timestamp: Date, targetDay: Date): Date {
	const result = new Date(timestamp);
	result.setFullYear(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate());
	return result;
}

export function setTimeKeepDate(timestamp: Date, hour: number, minute: number): Date {
	const result = new Date(timestamp);
	result.setHours(hour, minute, 0, 0);
	return result;
}

export function findDayIndex(days: DayItem[], timestamp: Date): number {
	return days.findIndex((day) => isSameDay(day.date, timestamp));
}
