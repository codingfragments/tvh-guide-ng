import type { PageServerLoad } from './$types';
import { parseTimestampOrNow } from '$lib/server/now';
import type { NowResponse } from '$lib/components/now/types';

function toLocalInputValue(ts: number): string {
  const d = new Date(ts * 1000);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export const load: PageServerLoad = async ({ fetch, url }) => {
  const tsParam = url.searchParams.get('ts');

  let isNowMode = true;
  try {
    isNowMode = parseTimestampOrNow(tsParam).isNowMode;
  } catch {
    throw new Error('Invalid ts parameter');
  }

  const qs = tsParam ? `?ts=${encodeURIComponent(tsParam)}` : '';
  const res = await fetch(`/api/now${qs}`);
  if (!res.ok) {
    throw new Error(`Failed to load now-view data (${String(res.status)})`);
  }

  const data = (await res.json()) as NowResponse;

  return {
    now: data,
    isNowMode,
    timestampInput: toLocalInputValue(data.timestamp),
  };
};
