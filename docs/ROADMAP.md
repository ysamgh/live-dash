# Roadmap

## 0.1 — First vertical slice
- [x] Product mission and source-first principles
- [x] Responsive dashboard shell
- [x] USGS 24-hour earthquake feed
- [x] Interactive earthquake map
- [x] NASA APOD card (DEMO_KEY)
- [x] Curiosity / random discovery entry point
- [ ] Automated browser smoke test
- [ ] GitHub Pages deployment verification

## 0.2 — Discovery quality
- [ ] Category landing views with meaningful filters
- [ ] Search across source registry
- [ ] Save / bookmark discoveries with a complete interaction
- [ ] Better loading, empty, offline and stale states
- [ ] Basic accessibility and performance audit

## 0.3 — Time and context
- [ ] Timeline controls for supported datasets
- [ ] Compare geographic observations across dates
- [ ] NASA image archive search (API integration and attribution review)
- [ ] Our World in Data chart / dataset integration

## 0.4 — More of the living planet
- [ ] Global Forest Watch integration (credentials and terms review)
- [ ] Weather / wind provider evaluation
- [ ] Flight and vessel data provider evaluation (commercial terms first)
- [ ] Source health and freshness dashboard

## 0.5 — Knowledge layer
- [ ] Curated scientific paper discovery (arXiv)
- [ ] Historical maps and cultural collections
- [ ] Cross-source story pages
- [ ] AI-assisted question answering with citations to retrieved source records

## Release gates

A connector is not complete merely because a URL is displayed. It must have:
1. A documented access method and terms review.
2. A working integration or explicitly labelled outbound link.
3. Normalized records and source attribution.
4. Loading, empty, stale and error states.
5. A fixture or test for its data contract.
