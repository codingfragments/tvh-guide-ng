# Picon (Channel Icon) Support

The epg-cache service can serve channel logos ("picons") from a local clone of the
[picons/picons](https://github.com/picons/picons) repository. This replaces TVHeadend's
authenticated `imagecache` URLs with directly usable image URLs.

## Setup

Clone the picons repository and set the `PICON_PATH` environment variable to the
`build-source/` directory:

```bash
git clone https://github.com/picons/picons.git /opt/picons
```

Then configure the service:

```bash
# .env file in services/epg-cache/
PICON_PATH=/opt/picons/build-source
```

Or pass it inline:

```bash
PICON_PATH=/opt/picons/build-source pnpm --filter @tvh-guide/epg-cache dev
```

The variable is **optional**. If unset, the service starts normally and picon endpoints
return `503 Service Unavailable`. If the path is invalid, the service logs a warning and
continues without picon support.

## Endpoints

### GET /api/picon/channel/:channelName

Resolve a channel icon by display name. The name is normalized using the SNP algorithm
(NFKD decomposition, strip diacritics, replace `&`/`+`/`*`, lowercase, strip
non-alphanumeric) and looked up in the picons SNP index.

**Path parameter:**

| Parameter     | Type   | Description                                        |
|---------------|--------|----------------------------------------------------|
| `channelName` | string | Channel display name (e.g. `Das Erste HD`, `ZDF HD`) |

**Query parameter:**

| Parameter | Type   | Default   | Description         |
|-----------|--------|-----------|---------------------|
| `variant` | string | `default` | Logo variant to use |

**Allowed variant values:** `default`, `light`, `dark`, `white`, `black`

If the requested variant is not available for a channel, the service falls back to `default`.
SVG is preferred over PNG when both formats exist.

**Examples:**

```bash
# Default variant
curl http://localhost:3000/api/picon/channel/Das%20Erste%20HD

# Light variant
curl http://localhost:3000/api/picon/channel/Das%20Erste%20HD?variant=light

# Channel with special characters (& is normalized to "and")
curl http://localhost:3000/api/picon/channel/Tom%20%26%20Jerry
```

**Responses:**

| Status | Content-Type              | Description                        |
|--------|---------------------------|------------------------------------|
| 200    | `image/svg+xml` or `image/png` | Logo image                    |
| 400    | `application/json`        | Invalid variant parameter          |
| 404    | `application/json`        | No picon found for channel name    |
| 503    | `application/json`        | Picon support not configured       |

Successful responses include the header `Cache-Control: public, max-age=86400, stale-while-revalidate=604800`
(cached for 1 day, stale-while-revalidate for 7 days).

### GET /api/picon/srp/:serviceRef

Resolve a channel icon by DVB service reference. The reference is looked up directly
in the picons SRP index without normalization.

**Path parameter:**

| Parameter    | Type   | Description                                         |
|--------------|--------|-----------------------------------------------------|
| `serviceRef` | string | DVB service reference (e.g. `1D5_B_1_130000`)       |

**Query parameter:**

| Parameter | Type   | Default   | Description         |
|-----------|--------|-----------|---------------------|
| `variant` | string | `default` | Logo variant to use |

**Allowed variant values:** `default`, `light`, `dark`, `white`, `black`

**Examples:**

```bash
curl http://localhost:3000/api/picon/srp/1D5_B_1_130000
curl http://localhost:3000/api/picon/srp/1D5_B_1_130000?variant=dark
```

**Responses:**

| Status | Content-Type              | Description                        |
|--------|---------------------------|------------------------------------|
| 200    | `image/svg+xml` or `image/png` | Logo image                    |
| 400    | `application/json`        | Invalid variant parameter          |
| 404    | `application/json`        | No picon found for service ref     |
| 503    | `application/json`        | Picon support not configured       |

## Client Library Usage

The `@tvh-guide/epg-cache-client` package provides typed methods for both endpoints:

```ts
import { EpgCacheClient } from '@tvh-guide/epg-cache-client';

const client = new EpgCacheClient({ baseUrl: 'http://localhost:3000' });

// Build a URL for <img src> (no network request)
const url = client.getPiconUrlByChannelName({ channelName: 'Das Erste HD' });
const darkUrl = client.getPiconUrlByChannelName({ channelName: 'ZDF HD', variant: 'dark' });
const srpUrl = client.getPiconUrlByServiceRef({ serviceRef: '1D5_B_1_130000' });

// Fetch the image (returns raw Response)
const response = await client.getPiconByChannelName({ channelName: 'Das Erste HD' });
const blob = await response.blob();
```

The URL builder methods (`getPiconUrlByChannelName`, `getPiconUrlByServiceRef`) are
intended for use in `<img>` tags where the browser handles the fetch directly.

## SNP Normalization

The SNP (Service Name Picon) algorithm transforms channel display names into index keys:

1. NFKD Unicode normalization (decomposes ligatures and composed characters)
2. Strip combining diacritical marks (e.g. `ü` → `u`, `é` → `e`)
3. Replace `&` → `and`, `+` → `plus`, `*` → `star`
4. Lowercase
5. Strip all non-alphanumeric characters

Examples:

| Input              | Normalized        |
|--------------------|-------------------|
| `Das Erste HD`     | `daserstehd`      |
| `RTL+`             | `rtlplus`         |
| `Tom & Jerry`      | `tomandjerry`     |
| `Télé München`     | `telemunchen`     |
| `N-TV (HD)`        | `ntvhd`           |
| `3sat`             | `3sat`            |
