require(["esri/config", "esri/Map", "esri/views/MapView", "esri/layers/FeatureLayer"],
  function(esriConfig, Map, MapView, FeatureLayer) {
  
    //esriConfig.apiKey = "YOUR_API_KEY";
  
    const map = new Map({
      basemap: "gray" // basemap styles service
    });
  
    const view = new MapView({
      map: map,
      center: [-118.805, 34.027], // Longitude, latitude
      zoom: 13, // Zoom level
      container: "map" // Div element
    });
  
    //##### 1. Create renderer
    const trailheadsRenderer = {
      "type": "simple",
      "symbol": {
        "type": "picture-marker",
        "url": "http://static.arcgis.com/images/Symbols/NPS/npsPictograph_0231b.png",
        "width": "18px",
        "height": "18px"
      }
    }
  
    const trailheadsLayer = new FeatureLayer({
      url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads/FeatureServer/0",
      //##### 2. Add render to renderer prop
      renderer: trailheadsRenderer
    });
    map.add(trailheadsLayer);
  
  });