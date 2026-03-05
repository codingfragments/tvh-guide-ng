import type { PageLoad } from './$types';
import type { NowEventDetail, NowEventItem } from '$lib/components/now/types';

interface MobileNowEventPayload {
  item: NowEventItem;
  detail: NowEventDetail;
}

export const load: PageLoad = async ({ fetch, params }) => {
  const res = await fetch(`/api/now/event/${encodeURIComponent(params.eventId)}/mobile`);
  if (!res.ok) {
    throw new Error(`Failed to load event details (${String(res.status)})`);
  }

  const payload = (await res.json()) as MobileNowEventPayload;

  return {
    item: payload.item,
    detail: payload.detail,
  };
};
