export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoiam9ub21rYXIiLCJhIjoiY2xrODBpNWE4MGg2bjNzcnRpNGthMmYyNSJ9.M-9ByV31ZKwjON5BWruy2A';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/jonomkar/clk8259cw00an01nwaq2d9u55',
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popUp
    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(`<P>Day ${loc.day}: ${loc.description}</P>`)
      .addTo(map);

    //Extend Map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: { top: 200, bottom: 150, left: 100, right: 100 },
  });
};
