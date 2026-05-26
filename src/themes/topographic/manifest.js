export default {
  slug: 'topographic',
  name: 'Topographic',
  description: "Carte topographique vintage : papier kraft, lignes de niveau, tempo contemplatif.",
  swatch: 'linear-gradient(135deg, #fef3c7 0%, #4d7c0f 55%, #92400e 100%)',
  defaultMode: 'light',
  // OpenTopoMap : vraie carte topographique (lignes de niveau, relief), gratuite,
  // sans auth. Subdomains a/b/c. Max zoom natif = 17, on upscale au-delà.
  mapTileUrl: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  mapTileAttribution:
    'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>, ' +
    '<a href="http://viewfinderpanoramas.org">SRTM</a> | ' +
    'Style: <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
  mapTileMaxNativeZoom: 17,
  mapFilter: 'sepia(0.35) contrast(0.95) saturate(0.9)'
}
