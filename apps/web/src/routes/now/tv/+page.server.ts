import { env } from '$env/dynamic/private';
import type { PageServerLoad } from './$types';
import { HLS_PROXY_PROFILE_LABEL, HLS_PROXY_PROFILE_NAME } from '$lib/components/live/live-profile-options';

interface ProfileOption {
  name: string;
  label: string;
}

interface ProfilesApiResponse {
  profiles?: ProfileOption[];
  error?: string;
}

export const load: PageServerLoad = async ({ fetch }) => {
  const configuredDefaultProfile = normalize(env.TVH_STREAM_DEFAULT_PROFILE);
  const response = await fetch('/api/channel/profiles');
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as ProfilesApiResponse;
    const profiles = ensureConfiguredOption([], configuredDefaultProfile);
    return {
      profiles,
      profilesError: payload.error || `Failed to load profiles (${String(response.status)})`,
      configuredDefaultProfile,
      defaultProfile: configuredDefaultProfile ?? '',
    };
  }

  const payload = (await response.json()) as ProfilesApiResponse;
  const profiles = ensureConfiguredOption(payload.profiles ?? [], configuredDefaultProfile);
  const defaultProfile =
    configuredDefaultProfile && configuredDefaultProfile.length > 0 ? configuredDefaultProfile : (profiles[0]?.name ?? '');

  return {
    profiles,
    profilesError: null as string | null,
    configuredDefaultProfile,
    defaultProfile,
  };
};

function normalize(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function ensureConfiguredOption(profiles: ProfileOption[], configuredDefaultProfile: string | null): ProfileOption[] {
  const withHlsOption = ensureHlsOption(profiles);
  if (!configuredDefaultProfile) return withHlsOption;
  if (withHlsOption.some((profile) => profile.name === configuredDefaultProfile)) return withHlsOption;
  return [{ name: configuredDefaultProfile, label: configuredDefaultProfile }, ...withHlsOption];
}

function ensureHlsOption(profiles: ProfileOption[]): ProfileOption[] {
  if (profiles.some((profile) => profile.name === HLS_PROXY_PROFILE_NAME)) {
    return profiles;
  }

  return [
    ...profiles,
    {
      name: HLS_PROXY_PROFILE_NAME,
      label: HLS_PROXY_PROFILE_LABEL,
    },
  ];
}
