<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TimeSelectHarness from './TimeSelectHarness.svelte';

	const STORY_DEFAULT_PRESETS = [
		{ label: '08:00', hour: 8, minute: 0 },
		{ label: '12:00', hour: 12, minute: 0 },
		{ label: '20:15', hour: 20, minute: 15 },
		{ label: '22:00', hour: 22, minute: 0 },
	];

	const { Story } = defineMeta({
		title: 'Components/EPG/TimeSelect',
		component: TimeSelectHarness,
		args: {
			showReadout: false,
			showExternalControls: false,
			presetTimes: STORY_DEFAULT_PRESETS,
		},
		argTypes: {
			showReadout: { control: 'boolean' },
			showExternalControls: { control: 'boolean' },
			hideTimeSelect: { control: 'boolean' },
			enableCustomTime: { control: 'boolean' },
			highlightNow: { control: 'boolean' },
			nowLabel: { control: 'text' },
			customTimeLabel: { control: 'text' },
			customTimeStepMinutes: { control: { type: 'number', min: 5, max: 60, step: 5 } },
			customTimeAppearance: {
				control: 'select',
				options: ['outline', 'ghost', 'primary', 'neutral'],
			},
			dayPickerWidth: { control: 'text' },
			// Disable controls that can't be edited via Storybook (Date, arrays)
			startDate: { table: { disable: true } },
			endDate: { table: { disable: true } },
			presetTimes: { table: { disable: true } },
		},
	});
</script>

<Story name="Default" />

<Story
	name="Interactive"
	args={{ showReadout: true, showExternalControls: true }}
/>

<Story
	name="Many Preset Times"
	args={{
		showExternalControls: true,
		presetTimes: [
			{ label: '05:00', hour: 5, minute: 0 },
			{ label: '08:00', hour: 8, minute: 0 },
			{ label: '12:00', hour: 12, minute: 0 },
			{ label: '15:00', hour: 15, minute: 0 },
			{ label: '18:00', hour: 18, minute: 0 },
			{ label: '20:15', hour: 20, minute: 15 },
			{ label: '23:00', hour: 23, minute: 0 },
		],
	}}
/>

<Story
	name="Without Time Controls"
	args={{ hideTimeSelect: true, showExternalControls: true }}
/>

<Story
	name="With Custom Time"
	args={{
		showExternalControls: true,
		enableCustomTime: true,
		highlightNow: true,
		customTimeAppearance: 'primary',
	}}
/>

	<Story name="Short Range">
		{#snippet template(args)}
			{@const start = new Date()}
			{@const end = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)}
			<TimeSelectHarness {...args} startDate={start} endDate={end} showExternalControls={true} />
		{/snippet}
	</Story>

<Story
	name="Custom Now Label"
	args={{
		nowLabel: 'Now',
		showExternalControls: true,
		presetTimes: [
			{ label: '08:00 PM', hour: 20, minute: 0 },
			{ label: '10:00 PM', hour: 22, minute: 0 },
		],
	}}
/>

<Story
	name="Constrained Width (16rem)"
	args={{ dayPickerWidth: '16rem', showExternalControls: true }}
/>

<Story
	name="Constrained Width (24rem)"
	args={{ dayPickerWidth: '24rem', showExternalControls: true }}
/>

<Story name="Mobile" globals={{ viewport: { value: 'mobile1' } }}>
	{#snippet template(args)}
		<div class="w-72">
			<TimeSelectHarness
				{...args}
				showExternalControls={true}
				presetTimes={[
					{ label: '12:00', hour: 12, minute: 0 },
					{ label: '20:15', hour: 20, minute: 15 },
				]}
			/>
		</div>
	{/snippet}
</Story>
