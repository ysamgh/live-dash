# Architecture

## Current deployment shape

MVP 0.1 is intentionally a static application:

```
Browser
  ├── UI shell (HTML/CSS)
  ├── Map view (Leaflet + CARTO tiles)
  ├── USGS connector ──> USGS GeoJSON feed
  └── NASA connector ──> NASA APOD API (DEMO_KEY)
```

The browser consumes public endpoints directly. This avoids premature infrastructure, secret management and operating costs. It also means the browser is subject to CORS, API rate limits, provider availability and client-side network conditions.

## Target architecture

As the number of connectors grows, move provider-specific logic behind a small data-access boundary:

```
External sources
  -> Source registry
  -> Provider connectors
  -> Validation + normalization
  -> Unified event / observation model
  -> Cache (optional backend)
  -> Map / timeline / discovery experiences
  -> AI research assistant (later)
```

Do not introduce a backend until there is a concrete need: private API credentials, rate-limit protection, scheduled ingestion, cross-source joins, durable user accounts, or server-side caching.

## Canonical observation model

```json
{
  "id": "provider:record-id",
  "source_id": "usgs",
  "kind": "earthquake",
  "title": "Provider supplied event title",
  "geometry": { "type": "Point", "coordinates": [-120.1, 38.2] },
  "occurred_at": "2026-11-27T00:00:00Z",
  "observed_at": "2026-11-27T00:01:00Z",
  "source_url": "https://provider.example/record",
  "attributes": {},
  "license": "provider-defined"
}
```

Rules:
- Coordinates use GeoJSON order: longitude, latitude.
- All timestamps are ISO 8601 UTC.
- Preserve provider IDs and original source URLs.
- Never infer missing values as zero.
- Keep provider payloads available for debugging when ingestion is server-side.
- Record the provider's license and attribution requirements before redistributing data.

## Connector contract

Each future connector should document:
- Stable source identifier and human-readable name.
- Data types and geographic / temporal coverage.
- Endpoint and authentication requirements.
- Update cadence and expected latency.
- Rate limits, license and attribution requirements.
- Failure modes and a clear stale / unavailable state.
- A small normalized output fixture for tests.

## Reliability

- Distinguish `live`, `delayed`, `stale`, `unavailable` and `unknown`.
- Display last successful retrieval time.
- Use bounded retries and caching when a backend is introduced.
- Do not let one provider failure blank the entire dashboard.
- Validate external payloads before rendering them.
- Treat all external text as untrusted data; escape before inserting into HTML.

## Security and privacy

- Never commit private API keys.
- Public demo keys are not secrets but can be rate-limited.
- Do not collect location or personal data without an explicit feature and privacy review.
- Avoid arbitrary third-party embeds and scraping.
