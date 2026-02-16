<script lang="ts">
	import { CalendarDays as CalendarDaysIcon } from 'lucide-svelte';
	import TimeSelect from '$lib/components/epg/TimeSelect.svelte';

	let selectedTimestamp = $state(new Date());
</script>

<svelte:head>
	<title>EPG Guide — TVH Guide</title>
</svelte:head>

<div class="flex flex-col gap-4 p-2 md:p-4">
	<TimeSelect bind:timestamp={selectedTimestamp} />

	<div class="flex flex-col items-center justify-center gap-4 py-12 text-center">
		<CalendarDaysIcon class="size-16 text-primary opacity-30" />
		<h1 class="text-2xl font-bold">EPG Guide</h1>
		<p class="text-base-content/60">The electronic program guide grid will appear here.</p>
		<p class="text-base-content/40 text-sm">
			Selected: {selectedTimestamp.toLocaleString('de-DE')}
		</p>
	</div>
</div>
