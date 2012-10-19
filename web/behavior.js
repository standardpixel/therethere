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
	
	thereThere.appInit = function( callback, scope ) {
		
		scope = scope || thereThere;
		
		if( !thereThere.get( 'start-location' ) ) {
		
			navigator.geolocation.getCurrentPosition( function( location ) {
				console.log('hi');
			} );
		
		}
		
		callback.apply( scope, [  ] );
		
	}
	
	thereThere.initMap = function( map_selector ) {
		
		var map_element = element = document.querySelector( map_selector );
		
		// initialize the map on the "map" div with a given center and zoom
		var map = L.map( map_element, {
		    center: [51.505, -0.09],
		    zoom: 13
		});
		
		L.tileLayer('http://{s}.tiles.mapbox.com/v3/mapbox.mapbox-streets/{z}/{x}/{y}.png', {
			'subdomains' : 'abc'
		}).addTo(map);
		
	}

})();