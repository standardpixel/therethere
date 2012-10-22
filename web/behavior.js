(function() {

	window.SM = function(config) {
		this._initial_config = config;

		initAll.apply(this);
	}

	function logError(msg) {
		if(window.console && console.error) {
			console.error(msg);
		} else if(window.console && console.log) {
			console.log('Error:' + msg);
		}
	}

	function isArray(arg) {
        return Object.prototype.toString.call(arg) === "[object Array]";
    }

	function isObject(arg) {
        return Object.prototype.toString.call(arg) === "[object Object]";
    }

	function isString(arg) {
        return Object.prototype.toString.call(arg) === "[object String]";
    }

	function initDataItems() {

		var items = this._initial_config;

		for(var i in items) {

			if(items.hasOwnProperty(i)) {
				var item = items[i];

				if(isObject(item)) {

					if(item.value) {
						this._dataItems[i] = item.value;

						if(item.validator) {
							this._validators[i] = item.validator;
						}
					} else {
						logError('Data item "'+i+'" was passed without a "value" property');
					}

				} else {
					if(isString(item)) {
						if(this._dataItems) {
							this._dataItems[i] = item;
						}
					} else {
						logError('Data item "'+i+'" needs to either be a string or object containing at least a value property');
					}
				}
			}

		}

	}

	function initAll() {

		initDataItems.apply(this);

	}

	SM.prototype = {

		name : 'SimpleModel',

		_initial_config : {

		},

		_subscribers : {

		},

		_validators : {

		},

		_dataItems : {

		},

		get : function(key) {

			return this._dataItems[key];

		},

		set : function(key,value,args) {

			var validator = this._validators[key];

			if(validator) {
				if(validator(value)) {
					this._dataItems[key]=value;
				}
			} else {
				this._dataItems[key]=value;
			}

			this.run(key,{
				previous : this._dataItems[key],
				current  : value,
				args     : args
			});

		},

		when : function(key,callback,scope,args) {

			var subscriber = {
				key       : key,
				callback  : callback,
				scope     : scope,
				args      : args
			};

			if(this._subscribers[key]) {
				this._subscribers[key].push(subscriber);
			} else {
				this._subscribers[key] = [subscriber];
			}

		},

		run : function(key,args) {

			var subscribers = this._subscribers[key];

			if( isArray( subscribers ) ) {

				for(var i=0, l=subscribers.length; l > i; i++) {
					var subscriber = subscribers[i],
					    scope      = subscriber.scope | window;

					subscriber.callback.apply(scope,[subscriber.args,args]);
				};

			}

		}
	}
	
	/** App code Begin **/
	
	var default_location    = [ 34.0547, -118.2343 ], //LA Union Station,
	    foursquare_api_args = '&oauth_token=U4SYDDY1YQD2QKP2I3BAJWJEO131TK21GDUMWP1PWNPGHTQR&intent=checkin&callback=',
	    each                = Array.prototype.forEach;
	
	window.thereThere = new SM({
		state : 'no-route'
	});
	
	function createUUID() {
	    // http://www.ietf.org/rfc/rfc4122.txt
	    var s = [];
	    var hexDigits = "0123456789abcdef";
	    for (var i = 0; i < 36; i++) {
	        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	    }
	    s[14] = "4";
	    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
	    s[8] = s[13] = s[18] = s[23] = "-";

	    var uuid = s.join("");
	    return uuid;
	}
	
	function callJSONP( src, callback ) {
		
		var callback_id = 'ttt_' + createUUID(),
		    script_element;
			
		script_element     = document.createElement('script');	
		script_element.id  = 'callback_id' + '_script';
		script_element.src = src + 'thereThere["' + callback_id + '_cb"]';
		
		thereThere[ callback_id + '_cb' ] = function( r ) {
			//TODO: failure case, timeout case
			callback.apply( thereThere, [ r ] );
		};
		
		document.body.appendChild( script_element );
		
	}
	
	function reverseGeocode( location, callback ) {
		
		callJSONP( 
			'https://api.foursquare.com/v2/venues/search?' 
			+ 'll='
			+ location[ 0 ] + ',' + location[ 1 ]
			+ foursquare_api_args
		, function( r ) {

			callback.apply( thereThere, [ r.response.groups[0].items ] );
			
		} );

	}
	
	function geocode( place_string, callback ) {
		
		var location = thereThere.map_instance.getCenter();
		
		callJSONP( 
			'https://api.foursquare.com/v2/venues/search?' 
			+ 'query=' + encodeURIComponent( place_string ) + '&'
			+ 'll='
			+ location.lat + ',' + location.lng
			+ foursquare_api_args
		, function( r ) {

			callback.apply( thereThere, [ r.response.groups[0].items ] );
			
		} );

	}
	
	thereThere.appInit = function( callback, scope ) {
		
		scope = scope || thereThere;
		
		var coord;
		
		if( !thereThere.get( 'start-location' ) ) {
		
			navigator.geolocation.getCurrentPosition( 
				
				//
				// Yay!
				//
				function( location ) {
					
					if( thereThere.map_instance ) {
					
						coords = location.coords;
					
						thereThere.set( 'start-location', [ coords.latitude, coords.longitude ] );
						
					}
					
				},
				
				//
				// Booooo!
				//	
				function() {
				
					thereThere.set( 'start-location', default_location );
				
				} 
			);
		
		} else {
			console.log('already have a start location');
		}
		
		callback.apply( scope, [  ] );
		
	}
	
	thereThere.initMap = function( map_selector ) {
		
		var map_element      = document.querySelector( map_selector );
		
		// initialize the map on the "map" div with a given center and zoom
		thereThere.map_instance = L.map( map_element, {
		    center: default_location,
		    zoom: 13
		});
		
		L.tileLayer('http://{s}.tiles.mapbox.com/v3/mapbox.mapbox-streets/{z}/{x}/{y}.png', {
			'subdomains' : 'abc'
		}).addTo( thereThere.map_instance );
		
		thereThere.start_marker = new L.marker( default_location ).addTo( thereThere.map_instance );
		thereThere.start_marker.setOpacity( 0 );
		
		thereThere.when( 'start-location', function( args, locations ) {
			
			thereThere.map_instance.panTo( new L.LatLng( locations.current[ 0 ], locations.current[ 1 ] ) );
			
			thereThere.start_marker.setLatLng( locations.current );
			thereThere.start_marker.setOpacity( 1 );
			
		} );
		
	}
	
	thereThere.initPlanner = function( planner_selector ) {
		
		var planner_element = document.querySelector( planner_selector ),
		    location_fields = planner_element.querySelectorAll( 'input[type=search]' ),
		    start_field     = planner_element.querySelector( 'input[name=start-location]' );
		
		if( planner_element ) {
			
			//
			// What happens when the location changes?
			//
			thereThere.when( 'start-location', function( args, locations ) {
				
				if( !locations.args || !locations.args.geocoded ) {
				
					reverseGeocode( locations.current, function( r ) {
					
						if( r && r[ 0 ] && r[ 0 ].name ) {
							start_field.value = r[ 0 ].name;
						}
					
					} );
						
					start_field.value = locations.current[ 0 ] + ', ' + locations.current[ 1 ];	
					
				}
		
			} );
			
			//
			// Set up behavior for location fields
			//
			each.call( location_fields, function( field ){ 
				
				field.addEventListener( 'focus', function() {
					
					field.dataset.startValue=field.value;
					
				}, false );
				
				field.addEventListener( 'blur', function() {

					if( field.dataset.startValue !== field.value ) {
						
						if( isString( field.value ) ) {
							
							geocode( field.value, function( r ) {
								
								if( r && r[ 0 ] && r[ 0 ].name ) {
									
									field.value = r[ 0 ].name;
									
									thereThere.set( 'start-location', [ r[ 0 ].location.lat, r[ 0 ].location.lng ], { 'geocoded' : true } );
									
								}
								
							} );
							
						} else {
							
							//TODO: Check if it is a lat long
							console.log('check if it is a lat long');
							
						}
						
					}
					
				}, false );
			  
			} );
				
		}
		
	}

})();