<script lang="ts">
	import TimeSelect from './TimeSelect.svelte';
	import { setDateKeepTime, setTimeKeepDate, normalizeToMidnight } from './time-select-utils.js';
	import type { PresetTime } from './time-select-utils.js';

	let {
		startDate,
		endDate,
		presetTimes,
		nowLabel,
		hideTimeSelect = false,
		dayPickerWidth,
		showReadout = false,
		showExternalControls = false,
	}: {
		startDate?: Date;
		endDate?: Date;
		presetTimes?: PresetTime[];
		nowLabel?: string;
		hideTimeSelect?: boolean;
		dayPickerWidth?: string;
		showReadout?: boolean;
		showExternalControls?: boolean;
	} = $props();

	let timestamp = $state(new Date());

	function jumpTomorrow() {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		timestamp = setTimeKeepDate(setDateKeepTime(timestamp, tomorrow), 14, 0);
	}

	function jumpPlus3() {
		const target = new Date(timestamp);
		target.setDate(target.getDate() + 3);
		timestamp = target;
	}

	function jumpMinus3() {
		const target = new Date(timestamp);
		target.setDate(target.getDate() - 3);
		timestamp = target;
	}

	function jumpLastDay() {
		const effective = endDate ?? (() => {
			const d = new Date();
			d.setDate(d.getDate() + 14);
			return d;
		})();
		timestamp = setTimeKeepDate(setDateKeepTime(timestamp, effective), 20, 15);
	}

	function setMorning() {
		timestamp = setTimeKeepDate(timestamp, 7, 30);
	}

	function setEvening() {
		timestamp = setTimeKeepDate(timestamp, 22, 0);
	}

	function resetNow() {
		timestamp = new Date();
	}
</script>

<div class="flex flex-col gap-3">
	<TimeSelect
		bind:timestamp
		{startDate}
		{endDate}
		{presetTimes}
		{nowLabel}
		{hideTimeSelect}
		{dayPickerWidth}
	/>

	<!-- Live readout -->
	{#if showReadout}
		<div class="bg-neutral text-neutral-content flex items-center gap-4 rounded-lg px-4 py-3">
			<span class="opacity-60 text-sm font-medium">Selected:</span>
			<span class="text-lg font-semibold">
				{timestamp.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
			</span>
			<span class="text-primary text-2xl font-bold">
				{timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
			</span>
		</div>
	{/if}

	<!-- External controls -->
	{#if showExternalControls}
		<div class="flex flex-wrap gap-1">
			<span class="text-base-content/50 self-center text-xs">External:</span>
			<button class="btn btn-outline btn-xs" onclick={resetNow}>Reset to now</button>
			<button class="btn btn-outline btn-xs" onclick={jumpTomorrow}>Tomorrow 14:00</button>
			<button class="btn btn-outline btn-xs" onclick={jumpLastDay}>Last day 20:15</button>
			<button class="btn btn-outline btn-xs" onclick={jumpMinus3}>-3 days</button>
			<button class="btn btn-outline btn-xs" onclick={jumpPlus3}>+3 days</button>
			<button class="btn btn-outline btn-xs" onclick={setMorning}>Set 07:30</button>
			<button class="btn btn-outline btn-xs" onclick={setEvening}>Set 22:00</button>
		</div>
	{/if}
</div>
