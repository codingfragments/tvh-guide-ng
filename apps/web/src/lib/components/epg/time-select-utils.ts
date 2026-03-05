export interface PresetTime {
	label: string;
	hour: number;
	minute: number;
}

export type CustomTimeAppearance = 'outline' | 'ghost' | 'primary' | 'neutral';

export const DEFAULT_PRESET_TIMES: PresetTime[] = [
	{ label: '06:00', hour: 6, minute: 0 },
	{ label: '12:00', hour: 12, minute: 0 },
	{ label: '20:15', hour: 20, minute: 15 },
	{ label: '22:00', hour: 22, minute: 0 },
];

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

export function parsePresetTimes(raw: string | undefined): PresetTime[] {
	if (!raw || !raw.trim()) return DEFAULT_PRESET_TIMES;

	// Allow JSON array: [{"label":"08:00","hour":8,"minute":0}, ...]
	try {
		const parsed = JSON.parse(raw) as Array<Partial<PresetTime>>;
		if (Array.isArray(parsed)) {
			const mapped = parsed
				.map((entry) => toPresetFromParts(entry.hour, entry.minute, entry.label))
				.filter((entry): entry is PresetTime => entry !== null);
			if (mapped.length > 0) return mapped;
		}
	} catch {
		// Fallback to comma-separated HH:mm format below.
	}

	// Allow CSV format: "06:00,12:00,20:15,22:00"
	const mapped = raw
		.split(',')
		.map((part) => part.trim())
		.map((part) => {
			const match = /^(\d{1,2}):(\d{2})$/.exec(part);
			if (!match) return null;
			return toPresetFromParts(Number(match[1]), Number(match[2]), part);
		})
		.filter((entry): entry is PresetTime => entry !== null);

	return mapped.length > 0 ? mapped : DEFAULT_PRESET_TIMES;
}

export function parseCustomTimeAppearance(raw: string | undefined): CustomTimeAppearance {
	switch ((raw ?? '').trim().toLowerCase()) {
		case 'ghost':
			return 'ghost';
		case 'primary':
			return 'primary';
		case 'neutral':
			return 'neutral';
		default:
			return 'outline';
	}
}

export function getCustomTimeAppearanceClass(appearance: CustomTimeAppearance): string {
	switch (appearance) {
		case 'ghost':
			return 'select select-sm border border-base-300 bg-base-100/60';
		case 'primary':
			return 'select select-sm select-primary';
		case 'neutral':
			return 'select select-sm select-neutral';
		default:
			return 'select select-sm select-bordered';
	}
}

export function buildTimeOptions(stepMinutes = 15): PresetTime[] {
	const safeStep = Number.isInteger(stepMinutes) && stepMinutes > 0 ? stepMinutes : 15;
	const entries: PresetTime[] = [];

	for (let total = 0; total < 24 * 60; total += safeStep) {
		const hour = Math.floor(total / 60);
		const minute = total % 60;
		entries.push({
			label: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
			hour,
			minute,
		});
	}

	return entries;
}

function toPresetFromParts(hour: unknown, minute: unknown, label: unknown): PresetTime | null {
	if (typeof hour !== 'number' || typeof minute !== 'number') return null;
	if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
	if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

	const normalizedLabel =
		typeof label === 'string' && label.trim() ? label.trim() : `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

	return {
		label: normalizedLabel,
		hour,
		minute,
	};
}
