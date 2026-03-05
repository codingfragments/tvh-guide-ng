<script lang="ts">
  import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from 'lucide-svelte';
  import {
    type CustomTimeAppearance,
    type PresetTime,
    buildTimeOptions,
    getCustomTimeAppearanceClass,
    generateDays,
    findDayIndex,
    clampDate,
    setDateKeepTime,
    setTimeKeepDate,
    normalizeToMidnight,
    isSameDay,
  } from './time-select-utils.js';

  let {
    timestamp = $bindable(new Date()),
    startDate,
    endDate,
    presetTimes,
    nowLabel = 'Jetzt',
    hideTimeSelect = false,
    dayPickerWidth,
    enableCustomTime = false,
    highlightNow = false,
    customTimeLabel = 'Custom',
    customTimeStepMinutes,
    customTimeAppearance,
  }: {
    timestamp?: Date;
    startDate?: Date;
    endDate?: Date;
    presetTimes?: PresetTime[];
    nowLabel?: string;
    hideTimeSelect?: boolean;
    dayPickerWidth?: string;
    enableCustomTime?: boolean;
    highlightNow?: boolean;
    customTimeLabel?: string;
    customTimeStepMinutes?: number;
    customTimeAppearance?: CustomTimeAppearance;
  } = $props();

  const effectiveStart = $derived(startDate ?? normalizeToMidnight(new Date()));
  const effectiveEnd = $derived.by(() => {
    if (endDate) return endDate;
    return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  });

  const days = $derived(generateDays(effectiveStart, effectiveEnd));
  const selectedIndex = $derived(findDayIndex(days, timestamp));
  const canScrollLeft = $derived(selectedIndex > 0);
  const canScrollRight = $derived(selectedIndex < days.length - 1);
  const effectivePresetTimes = $derived(presetTimes ?? []);
  const effectiveCustomTimeStep = $derived(
    Number.isInteger(customTimeStepMinutes) && customTimeStepMinutes > 0 ? customTimeStepMinutes : 15,
  );
  const effectiveCustomAppearance = $derived(customTimeAppearance ?? 'outline');
  const customTimeOptions = $derived(buildTimeOptions(effectiveCustomTimeStep));
  const customTimeClass = $derived(getCustomTimeAppearanceClass(effectiveCustomAppearance));
  const customValue = $derived(
    `${String(timestamp.getHours()).padStart(2, '0')}:${String(timestamp.getMinutes()).padStart(2, '0')}`,
  );
  const quickCustomOptions = $derived.by(() => {
    const quick: PresetTime[] = [];

    for (const preset of effectivePresetTimes) {
      const key = `${preset.hour}:${preset.minute}`;
      if (quick.some((entry) => `${entry.hour}:${entry.minute}` === key)) continue;
      quick.push(preset);
    }

    return quick;
  });

  let carouselRef = $state<HTMLElement | null>(null);

  function scrollToCenter(index: number) {
    if (!carouselRef || index < 0) return;
    const children = carouselRef.children;
    if (index >= children.length) return;
    // All items fit — no scrolling needed
    if (carouselRef.scrollWidth <= carouselRef.clientWidth) {
      carouselRef.scrollTo({ left: 0 });
      return;
    }
    const child = children[index] as HTMLElement;
    const ideal = child.offsetLeft - carouselRef.clientWidth / 2 + child.offsetWidth / 2;
    const maxScroll = carouselRef.scrollWidth - carouselRef.clientWidth;
    carouselRef.scrollTo({ left: Math.max(0, Math.min(ideal, maxScroll)), behavior: 'smooth' });
  }

  $effect(() => {
    scrollToCenter(selectedIndex);
  });

  // Auto-clamp: if timestamp is out of range, clamp it
  $effect(() => {
    const clamped = clampDate(timestamp, effectiveStart, effectiveEnd);
    if (clamped.getTime() !== timestamp.getTime()) {
      timestamp = clamped;
    }
  });

  function selectDay(index: number) {
    if (index < 0 || index >= days.length) return;
    timestamp = setDateKeepTime(timestamp, days[index].date);
  }

  function selectPreset(preset: PresetTime) {
    timestamp = setTimeKeepDate(timestamp, preset.hour, preset.minute);
  }

  function selectNow() {
    const now = new Date();
    // If today is in range, jump to now; otherwise clamp
    if (days.some((d) => isSameDay(d.date, now))) {
      timestamp = now;
    } else {
      timestamp = clampDate(now, effectiveStart, effectiveEnd);
    }
  }

  function selectCustomValue(value: string) {
    const match = /^(\d{2}):(\d{2})$/.exec(value);
    if (!match) return;
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return;
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return;
    timestamp = setTimeKeepDate(timestamp, hour, minute);
  }

  function prevDay() {
    if (canScrollLeft) selectDay(selectedIndex - 1);
  }

  function nextDay() {
    if (canScrollRight) selectDay(selectedIndex + 1);
  }
</script>

<div class="bg-base-200 flex flex-col gap-2 rounded-lg p-2 md:flex-row md:items-center md:gap-3">
  <!-- Day carousel -->
  <div
    class="day-picker flex min-w-0 items-center gap-1 {dayPickerWidth ? 'md:constrained' : 'md:flex-1'}"
    style:--day-picker-w={dayPickerWidth}
  >
    <button
      class="btn btn-ghost btn-sm btn-square shrink-0"
      disabled={!canScrollLeft}
      onclick={prevDay}
      aria-label="Vorheriger Tag"
    >
      <ChevronLeftIcon class="size-4" />
    </button>

    <div
      bind:this={carouselRef}
      class="relative flex min-w-0 flex-1 gap-1 overflow-x-hidden px-0.5"
      role="listbox"
      aria-label="Tagesauswahl"
    >
      {#each days as day, i (day.date.getTime())}
        <button
          class="flex w-[2.75rem] shrink-0 flex-col items-center rounded-lg py-1 text-xs transition-colors
						{selectedIndex === i ? 'border-accent border-2 bg-base-100 font-bold' : 'btn-ghost border-2 border-transparent'}
						{day.isToday && selectedIndex !== i ? 'text-accent' : ''}"
          role="option"
          aria-selected={selectedIndex === i}
          onclick={() => {
            selectDay(i);
          }}
        >
          <span>{day.label}</span>
          <span class="text-sm font-semibold">{day.dayNumber}</span>
        </button>
      {/each}
    </div>

    <button
      class="btn btn-ghost btn-sm btn-square shrink-0"
      disabled={!canScrollRight}
      onclick={nextDay}
      aria-label="Nächster Tag"
    >
      <ChevronRightIcon class="size-4" />
    </button>
  </div>

  <!-- Time controls -->
  {#if !hideTimeSelect}
    <div class="flex shrink-0 items-center gap-1 md:ml-auto">
      {#each effectivePresetTimes as preset (`${preset.hour}:${preset.minute}:${preset.label}`)}
        <button
          class={`btn btn-ghost btn-sm ${enableCustomTime ? 'hidden md:inline-flex' : ''}`}
          onclick={() => {
            selectPreset(preset);
          }}
        >
          {preset.label}
        </button>
      {/each}
      <button class={`btn btn-ghost btn-sm ${highlightNow ? 'font-bold underline' : ''}`} onclick={selectNow}>
        {nowLabel}
      </button>
      {#if enableCustomTime}
        <label class="sr-only" for="custom-time-select">{customTimeLabel}</label>
        <select
          id="custom-time-select"
          class={customTimeClass}
          value={customValue}
          aria-label={customTimeLabel}
          onchange={(event) => {
            selectCustomValue((event.currentTarget as HTMLSelectElement).value);
          }}
        >
          {#if quickCustomOptions.length > 0}
            <optgroup label="Quick">
              {#each quickCustomOptions as option (`q-${option.hour}:${option.minute}`)}
                <option value={`${String(option.hour).padStart(2, '0')}:${String(option.minute).padStart(2, '0')}`}>
                  {option.label}
                </option>
              {/each}
            </optgroup>
          {/if}
          <optgroup label={`All (${effectiveCustomTimeStep}m)`}>
            {#each customTimeOptions as option (`a-${option.hour}:${option.minute}`)}
              <option value={option.label}>{option.label}</option>
            {/each}
          </optgroup>
        </select>
      {/if}
    </div>
  {/if}
</div>

<style>
  @media (min-width: 768px) {
    .day-picker.md\:constrained {
      width: var(--day-picker-w);
      flex: 0 0 auto;
    }
  }
</style>
