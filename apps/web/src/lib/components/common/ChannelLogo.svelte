<script lang="ts">
	import { Tv as TvIcon } from 'lucide-svelte';
	import { buildPiconImageUrl, type PiconVariant, type PiconSize } from './picon-url.js';

	const SIZE_CLASSES: Record<PiconSize, string> = {
		sm: 'size-6',
		md: 'size-8',
		lg: 'size-12',
		xl: 'size-16',
		xxl: 'size-32',
	};

	let {
		src = '',
		variant = 'default',
		size = 'md',
		class: className = '',
		alt = 'Channel logo',
	}: {
		src?: string;
		variant?: PiconVariant;
		size?: PiconSize;
		class?: string;
		alt?: string;
	} = $props();

	let hasError = $state(false);

	const imageUrl = $derived(buildPiconImageUrl(src, variant));
	const sizeClass = $derived(SIZE_CLASSES[size]);

	$effect(() => {
		// Reset error state when src or variant changes
		void src;
		void variant;
		hasError = false;
	});
</script>

<span class="inline-flex shrink-0 items-center justify-center {sizeClass} {className}">
	{#if imageUrl && !hasError}
		<img
			{alt}
			src={imageUrl}
			class="h-full w-full object-contain"
			onerror={() => (hasError = true)}
		/>
	{:else}
		<TvIcon class="h-full w-full opacity-40" />
	{/if}
</span>
