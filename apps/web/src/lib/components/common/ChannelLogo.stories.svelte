<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ChannelLogo from './ChannelLogo.svelte';
	import { PICON_VARIANTS, type PiconSize } from './picon-url.js';

	const SIZES: PiconSize[] = ['sm', 'md', 'lg', 'xl', 'xxl'];

	const germanChannels = [
		'Das Erste HD',
		'ZDF HD',
		'RTL',
		'SAT.1',
		'ProSieben',
		'VOX',
		'kabel eins',
		'RTL II',
		'ARTE',
		'3sat',
		'WDR',
		'NDR',
		'BR',
		'SWR',
		'MDR',
		'HR',
		'RBB',
		'DMAX',
		'sixx',
		'NITRO',
		'Super RTL',
		'TELE 5',
		'ZDFneo',
		'ONE',
	];

	const channelOptions = germanChannels.map((ch) => `picon://channel/${ch}`);

	const { Story } = defineMeta({
		title: 'Components/ChannelLogo',
		component: ChannelLogo,
		args: {
			src: 'picon://channel/Das Erste HD',
			variant: 'default',
			size: 'md',
		},
		argTypes: {
			src: { control: 'select', options: channelOptions },
			variant: { control: 'select', options: PICON_VARIANTS },
			size: { control: 'select', options: SIZES },
		},
	});
</script>

<Story name="Default" argTypes={{ src: { control: 'text' } }} />

<Story
	name="Variants"
	args={{ src: 'picon://channel/Das Erste HD' }}
	argTypes={{ variant: { table: { disable: true } }, size: { table: { disable: true } } }}
>
	{#snippet template(args)}
		<div class="flex items-center gap-4">
			{#each PICON_VARIANTS as v}
				<div class="flex flex-col items-center gap-1">
					<ChannelLogo src={args.src} variant={v} size="lg" />
					<span class="text-base-content/60 text-xs">{v}</span>
				</div>
			{/each}
		</div>
	{/snippet}
</Story>

<Story
	name="Sizes"
	args={{ src: 'picon://channel/Das Erste HD' }}
	argTypes={{ variant: { table: { disable: true } }, size: { table: { disable: true } } }}
>
	{#snippet template(args)}
		<div class="flex items-end gap-4">
			{#each SIZES as s}
				<div class="flex flex-col items-center gap-1">
					<ChannelLogo src={args.src} size={s} />
					<span class="text-base-content/60 text-xs">{s}</span>
				</div>
			{/each}
		</div>
	{/snippet}
</Story>

<Story name="German Channels">
	{#snippet children()}
		<div class="grid grid-cols-6 gap-4">
			{#each germanChannels as channel}
				<div class="flex flex-col items-center gap-1">
					<ChannelLogo src="picon://channel/{channel}" size="lg" />
					<span class="text-base-content/60 max-w-20 truncate text-center text-xs">{channel}</span>
				</div>
			{/each}
		</div>
	{/snippet}
</Story>

<Story name="Error State" args={{ src: 'picon://channel/nonexistent-channel-xyz', size: 'lg' }}>
	{#snippet template(args)}
		<div class="flex items-center gap-4">
			<ChannelLogo {...args} />
			<span class="text-base-content/60 text-sm">Invalid channel — shows fallback icon</span>
		</div>
	{/snippet}
</Story>

<Story name="No Source" args={{ src: '', size: 'lg' }}>
	{#snippet template(args)}
		<div class="flex items-center gap-4">
			<ChannelLogo {...args} />
			<span class="text-base-content/60 text-sm">Empty src — shows fallback icon</span>
		</div>
	{/snippet}
</Story>
