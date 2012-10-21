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

		set : function(key,value) {

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
				current  : value
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
	    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
	    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
	    s[8] = s[13] = s[18] = s[23] = "-";

	    var uuid = s.join("");
	    return uuid;
	}
	
	function reverseGeocode( location, callback ) {
		
		var callback_id = 'ttt_' + createUUID(),
		    script_element;
			
		script_element = document.createElement('script');
		
		script_element.id  = 'callback_id' + '_script';
		script_element.src = 'http://open.mapquestapi.com/geocoding/v1/reverse?lat=' + location[ 0 ] + '&lng=' + location[ 1 ] + '&callback=thereThere["' + callback_id + '_cb"]';
		
		thereThere[ callback_id + '_cb' ] = function( r ) {
			//TODO: failure case, timeout case
			callback.apply(thereThere, r.results[0].locations);
		};
		
		document.body.appendChild( script_element );

	}
	
	thereThere.appInit = function( callback, scope ) {
		
		scope = scope || thereThere;
		
		var coord;
		
		if( !thereThere.get( 'start-location' ) ) {
		
			navigator.geolocation.getCurrentPosition( function( location ) {
				
				if( thereThere.map_instance ) {
					
					coords = location.coords;
					
					thereThere.set( 'start-location', [ coords.latitude, coords.longitude ] );
					
				}
				
			} );
		
		} else {
			console.log('already have a start location');
		}
		
		callback.apply( scope, [  ] );
		
	}
	
	thereThere.initMap = function( map_selector ) {
		
		var map_element      = document.querySelector( map_selector ),
		    default_location = [ 34.0547 -118.2343 ];
		
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
		    start_field;
		
		if( planner_element ) {
		
			thereThere.when( 'start-location', function( args, locations ) {
		
				start_field = planner_element.querySelector( 'input[name=start-location]' );
				
				reverseGeocode( locations.current, function( r ) {
					start_field.value = r.street + ', ' + r.adminArea5 + ', ' + r.adminArea3;
				} );
			
				if( start_field ) {
					start_field.value             = locations.current[ 0 ] + ', ' + locations.current[ 1 ];
					start_field.dataset.latitude  = locations.current[ 0 ];
					start_field.dataset.longitude = locations.current[ 1 ];
				}
		
			} );
				
		}
		
	}

})();