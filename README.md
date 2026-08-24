# VMC Buses — Final Polished Build

Self-contained static VMC Vadodara city-bus project. The full route database and translations are embedded in `index.html` and also provided as source backups.

## Main files
- `index.html` — runnable website shell with embedded database and translations.
- `app.js` — application logic: search, exact route matching, fare calculation, NOVA AI, GPS nearby stops, map and road routing.
- `styles.css` — UI styling and responsive layout.
- `data.js` — database/translation source backup.
- `data/routes.json` — route database backup.
- `data/stops.json` — canonical stop index with coordinates and served routes.
- `data/translations.json` — UI and stop translations.

## Map
Leaflet renders the map with OpenStreetMap tiles. When online, the highlighted route is requested from the public OSRM routing service so the blue route follows roads rather than drawing straight displacement lines. If the routing service is temporarily unavailable, the stored route geometry remains visible instead of breaking the website.

## Nearby Stops
Nearby search uses the device's high-accuracy GPS and compares the GPS point against every unique stop coordinate in the project database. It watches briefly for a more accurate Android GPS fix before presenting the nearest stops.

## Run
Open `index.html` directly for the core UI, or deploy the folder to Netlify/GitHub Pages/another static host. Internet access is required for the map tiles and road-routing service.

Cinematic intro added as a visual-only layer. Existing application content/data remain unchanged.
