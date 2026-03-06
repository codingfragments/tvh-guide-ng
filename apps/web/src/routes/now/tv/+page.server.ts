import { env } from '$env/dynamic/private';
import type { PageServerLoad } from './$types';

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
  if (!configuredDefaultProfile) return profiles;
  if (profiles.some((profile) => profile.name === configuredDefaultProfile)) return profiles;
  return [
    {
      name: configuredDefaultProfile,
      label: configuredDefaultProfile,
    },
    ...profiles,
  ];
}
