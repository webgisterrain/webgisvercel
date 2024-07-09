require(["esri/config", "esri/Map", "esri/views/MapView", "esri/layers/FeatureLayer", "esri/widgets/Legend", "esri/Graphic", "esri/widgets/Popup"],
function(esriConfig, Map, MapView, FeatureLayer, Legend, Graphic, Popup) {

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

	const trailheadsRenderer = {
		"type": "simple",
		"symbol": {
			"type": "picture-marker",
			"url": "http://static.arcgis.com/images/Symbols/NPS/npsPictograph_0231b.png",
			"width": "18px",
			"height": "18px"
		}
	}

	/*const popupTrailheads = {
		"title": "{TRL_NAME}",
		"content": "This trail starts at {ELEV_FT} ft."
	}*/

	const popupTrailheads = {
    title: "{TRL_NAME}",
    content: [{
        type: "text",
        text: `
							This trail is <b>{ELEV_FT} ft high</b>.<br>
							It's located at <b>{X_STREET}</b>.<br><br>
							<b>Latitude:</b> {LAT}<br>
							<b>Longitude:</b> {LON}<br><br>
							<b>{expression/parking-type}</b> parking available<br>
							<b><img src="{PHOTO}" alt="No photo available" >
							`
    }],
    expressionInfos: [{
        name: "parking-type",
        expression: `
										var parkingType = When(
											$feature.PARKING == 'SA', 'Standard Angle',
											$feature.PARKING == 'ST', 'Straight-In',
											$feature.PARKING == 'N', 'Normal',
											'Unknown' // Default case if none of the conditions match
										);
										return parkingType;
										`
    }]
	}

  const trailheadsLayer = new FeatureLayer({
    url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads/FeatureServer/0",
		renderer: trailheadsRenderer,
		//popupTemplate: popupTrailheads
		outFields: ["*"]
  });
	map.add(trailheadsLayer);

	const legend = new Legend({
		view: view,
		container: "myLegend",
		layerInfos: [
			{
				layer: trailheadsLayer,
				title: "Hiking Trailheads"
			}
		]
	});

	//QUERY////////////////////////////////////////////////////
	document.getElementById("myQueryButton").addEventListener("click", function(){
		let myWhereStatement = document.getElementById("thatQuery").value;
		queryFeatures(myWhereStatement);
	});

	function queryFeatures(whereStatement) {
		trailheadsLayer.queryFeatures({
			//query object
			geometry: view.extent,
			spatialRelationship: "intersects",
			where: whereStatement,
			returnGeometry: true,
			outFields: ["*"],
		})
		.then((featureSet) => {
			// Remove existing graphics if needed
			view.graphics.removeAll();

			const features = featureSet.features;
			features.forEach((feature) => {
        // Create a graphic for each feature
        const graphic = new Graphic({
            geometry: feature.geometry,  // Point geometry
            symbol: {
                type: "simple-marker",  // Use a simple marker symbol
                color: "grey",           // Set the color of the marker
                size: "20px",            // Set the size of the marker
                outline: {              // Define the outline
                    color: [255, 255, 255], // White outline
                    width: 2             // Width of the outline
                }
            }
        });

        // Add the graphic to the view
        view.graphics.add(graphic);
			});
		});
	}

	// HIT TEST /////////////////////////////////////////////
	// Listen for click events on the view
	view.on("click", function(event) {
		// Perform a hitTest on the view
		view.hitTest(event).then(function(response) {
				// Check if a feature from the featureLayer was clicked
				var feature = response.results.find(function(result) {
						return result.graphic.layer === trailheadsLayer;
				});

				// Proceed if a feature was found
				if (feature && feature.graphic) {
						let attributes = feature.graphic.attributes;
						let parkingType;

						// Use if-else structure to determine parking type
						if (attributes.PARKING === 'SA') {
								parkingType = 'Standard Angle';
						} else if (attributes.PARKING === 'ST') {
								parkingType = 'Straight-In';
						} else if (attributes.PARKING === 'N') {
								parkingType = 'Normal';
						} else {
								parkingType = 'Unknown'; // Default case
						}

						// Open the popup at the location of the click with the relevant information
						view.popupEnabled = false; // to make it react on hit test and not popuptemplate for that layer
						view.popup.open({
								title: "Parking Information", // Set a title for the popup
								location: event.mapPoint,    // Set the location for the popup to the point where the user clicked
								content: `Parking Type: ${parkingType}` // Display the parking type in the popup
						});
				}
		});
	});

});