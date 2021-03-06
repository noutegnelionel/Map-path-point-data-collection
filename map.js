var map;
        var llOffset = 0.022//666666666666667;
        var latPolylines = [];
        var lngPolylines = [];
        var leftPoly;
        var bounds;
        let markersArray = [];
        let polyline = null;
		var geocoder;
		var labels = 'ABCDEFGHIJ'; //KLMNOPQRSTUVWXYZ
		var labels2 = '12345678910';
        var labelIndex = 0;
	    var elevator;

		
	         
    function initMap() {
	    geocoder = new google.maps.Geocoder();
        var directionsService = new google.maps.DirectionsService;
        var directionsDisplay = new google.maps.DirectionsRenderer;
        
		var lat_lng = { lat: 45.489232, lng: -73.658907 };
        map = new google.maps.Map(document.getElementById('map'), {
            center: lat_lng,
            zoom: 10,
            streetViewControl: true,
			scaleControl: true
        });
					  
        // define function to add marker at given latitude and longitude point
		var elevator = new google.maps.ElevationService();
		function addMarker(latLng) {
		    let marker = new google.maps.Marker({
			     map: map,
			     position: latLng,
			     draggable: true,
			    //animation: google.maps.Animation.DROP,
			    //label: markersArray.length + "",
			    label:labels[labelIndex++ % labels.length]
			    //title: markersArray.length + ""
	            //anchorPoint: new google.maps.Point(0, -46)
		    });		  
               
		//store the marker object drawn in global array
		    markersArray.push(marker);	
			
	    //Get latitude and longitude of earch marker
		    google.maps.event.addListener(marker, "click", function (event) {
				var latitude = this.position.lat();
				var longitude = this.position.lng();
				alert(this.position);
			});  
				  
        //Get elevation of Marker
		  	var elevationService = new google.maps.ElevationService();
    	    var requestElevation = {
			    'locations': [marker.getPosition()]
		    };
            elevationService.getElevationForLocations(requestElevation, function(results, status) {
	            if (status == google.maps.ElevationStatus.OK) {
	                if (results[0]) {    
							//alert(
							results[0].elevation+ " m??tres";//);		                         	
			}
			    }
				var filename = "../data_collection.csv"; 
				  var fso = new ActiveXObject('Scripting.FileSystemObject'); 
				  if (fso.FileExists(filename)) { 
						var a, ForAppending, streamWrite; 
						ForAppending = 8; 
						streamWrite = fso.OpenTextFile(filename, ForAppending, false); 
						streamWrite.Write(marker.getLabel()+",");
						streamWrite.Write(results[0].elevation +",");
						streamWrite.Write(marker.getPosition().lat()+",");
						streamWrite.WriteLine(marker.getPosition().lng());

						} 
				  else { 
						var streamWrite = fso.CreateTextFile(filename, true); 
						streamWrite.Write(marker.getLabel()+",");
						streamWrite.Write(results[0].elevation +",");
						streamWrite.Write(marker.getPosition().lat()+",");
						streamWrite.WriteLine(marker.getPosition().lng());
						} 
																	
                     			  streamWrite.Close();									  
	        });          	    
           
		}
		// Header of csv file for elevation value
			var fso = new ActiveXObject('Scripting.FileSystemObject'); 
			var s = fso.OpenTextFile("../data_collection.csv",  8, true);	
			s.Write("Markers"+",");
			s.Write("	Elevation(Meters)"+",")	
			s.Write("Latitude"+",");
			s.WriteLine("Longitude");
			s.Close();	
		  	 
	   	// map onclick listener to get marker on map  
		    map.addListener('click', function(e) {
			//console.log(e);		
           //\for(var i = 0 ; i<markersArray.length ; i++){			
			addMarker(e.latLng );
			var labelIndex2 = 0;
			if (markersArray.length == 10  ) {  
			    
		        drawPolyline();		
		        markersArray = [];
				
				//var fso = new ActiveXObject('Scripting.FileSystemObject'); 
				//var s = fso.OpenTextFile("../data_collection.csv",  8, true);	
                    //s.WriteLine("------ ZONE :" +labelIndex2++ % labels2.length);	
                    //s.Close();
			}
					   
			    drawPolyline();
           // }  				 
		   });
		   
		  
		// Add a listener for the click event             
            google.maps.event.addListener(map, 'bounds_changed', function () {
                createGridLines(map.getBounds());
            });
	}
	    

	   // Fuction to build the grid on map
        function createGridLines(bounds) {
            for (var i = 0; i < latPolylines.length; i++) {
                latPolylines[i].setMap(null);
            }
            latPolylines = [];
            for (var i = 0; i < lngPolylines.length; i++) {
                lngPolylines[i].setMap(null);
            }
            lngPolylines = [];
            if (map.getZoom() <= 4) return;
            var north = bounds.getNorthEast().lat();
            var east = bounds.getNorthEast().lng();
            var south = bounds.getSouthWest().lat();
            var west = bounds.getSouthWest().lng();

            // define the size of the grid
            var topLat = Math.ceil(north / llOffset) * llOffset;
            var rightLong = Math.ceil(east / llOffset) * llOffset;

            var bottomLat = Math.floor(south / llOffset) * llOffset;
            var leftLong = Math.floor(west / llOffset) * llOffset;

            for (var latitude = bottomLat; latitude <= topLat; latitude += llOffset) {
                // lines of latitude
                latPolylines.push(new google.maps.Polyline({
                    path: [
                        new google.maps.LatLng(latitude, leftLong),
                        new google.maps.LatLng(latitude, rightLong)],
                    map: map,
                    geodesic: true,
                    strokeColor: 'blue',
                    strokeOpacity: 0.5,
                    strokeWeight: 1
                }));
            }
            for (var longitude = leftLong; longitude <= rightLong; longitude += llOffset) {
                // lines of longitude
                lngPolylines.push(new google.maps.Polyline({
                    path: [
                        new google.maps.LatLng(topLat, longitude),
                        new google.maps.LatLng(bottomLat, longitude)],
                    map: map,
                    geodesic: true,
                    strokeColor: 'blue',
                    strokeOpacity: 0.5,
                    strokeWeight: 1
                }));
            }
        }	
	    
		// Define function to draw polyline that connect markers' position
		function drawPolyline() {
		     let markersPositionArray = [];
		     // obtain latlng of all markers on map
		     markersArray.forEach(function(e) {
			 markersPositionArray.push(e.getPosition());
		    });
          
		  // check if there is already polyline drawn on map
		  // remove the polyline from map before we draw new one
		  //if (polyline !== null)// {
			//polyline.setMap(null);
		  //}

		  // draw new polyline at markers' position
		  polyline = new google.maps.Polyline({
			map: map,
			strokeColor: 'blue',
			path: markersPositionArray,
                    geodesic: true,
                    strokeColor: 'blue',
                    strokeOpacity: 0.5,
                    strokeWeight: 4		  });
		}
		
		// Sets the map on all markers in the array.
		function setMapOnAll(map) {
		  for (let i = 0; i < markersArray.length; i++) {
			markersArray[i].setMap(map);
		  }
		}
		
		// Removes the markers from the map, but keeps them in the array.
		function clearMarkers() {
		  setMapOnAll(null);
		}
		
		// Shows any markers currently in the array.
		function showMarkers() {
		  setMapOnAll(map);
		}
		
		// Deletes all markers in the array by removing references to them.
		function deleteMarkers() {
		  clearMarkers();
		 markersArray = [];
		}
        	  
		 