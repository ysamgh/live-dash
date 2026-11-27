# LIVE DASH — Explore Reality

**A living interface for exploring our planet, civilization, science and universe.**

LIVE DASH turns a scattered collection of open-data sources and curiosity-driven websites into one coherent discovery experience. It is not a link directory: the product combines selected data feeds, maps, timelines and editorial pathways so people can move from a signal to a story.

## Product principles

1. **Source-first:** every factual data point must identify its source and link to the original record.
2. **Observed is not occurred:** event time and retrieval time are separate fields.
3. **No fake real-time:** show freshness and availability honestly. A page refresh is not a live stream.
4. **Progressive integration:** prefer a few reliable, documented connectors over dozens of brittle scrapers.
5. **Respect source policies:** use documented APIs and permitted embeds; do not scrape sites or bypass access controls.
6. **Fast and accessible:** responsive, keyboard-friendly, lightweight, and usable without an account.

## MVP 0.1

The first release is a static web application with:
- A responsive exploration dashboard.
- A live USGS GeoJSON feed for earthquakes in the past day.
- A Leaflet map with recent earthquake markers.
- NASA Astronomy Picture of the Day using the public DEMO_KEY (rate limits apply).
- A small curated discovery engine.
- Direct source attribution and links.

No backend, database, user account, or paid API key is required for this first milestone.

## Run locally

Serve the repository root with any local HTTP server:

```bash
python -m http.server 8000
```

Then open http://localhost:8000. Internet access is required for live feeds, map tiles, and CDN libraries.

## Deploy

The app is compatible with GitHub Pages. After merging the MVP, configure repository Settings → Pages to deploy from the `main` branch and the root folder. No build step is required.

## Data sources

- Earthquakes: [USGS GeoJSON feeds](https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php)
- Astronomy: [NASA APOD](https://apod.nasa.gov/apod/astropix.html) (DEMO_KEY; subject to rate limits)
- Map tiles: [CARTO basemaps](https://carto.com/basemaps/) with OpenStreetMap attribution
- Map library: [Leaflet](https://leafletjs.com/)

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/ROADMAP.md](docs/ROADMAP.md), and [data/sources.json](data/sources.json).

## Project status

**MVP implementation in progress.** The current interface is a first vertical slice, not a claim that all 50 listed websites have API integrations. Some sources are interactive destinations, some provide public datasets, and others require credentials, licensing review, or a separate integration.

## License

MIT. Third-party data, imagery, map tiles, and APIs remain subject to their own licenses and terms.
