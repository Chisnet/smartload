/*! Smartload v1.1.0 */
(function(window, $) {
	'use strict';
	// Manager for all smartloads on a page to reduce event binding
	window._slm = {
		listeners: [],
		key_counter: 0,
		init: function() {
			// Trigger when the window is resized or scrolled
			$(window).bind("resize", function() {
				window._slm.triggerListeners();
			}).bind("scroll", function() {
				window._slm.triggerListeners();
			}).bind("orientationchange", function() {
				window._slm.triggerListeners();
			});
		},
		triggerListeners: function() {
			var listener;
			if(window._slm.listeners.length) {
				for(var index=0; index < window._slm.listeners.length; index++) {
					listener = window._slm.listeners[index];
					listener.func.call();
				}
			}
		},
		bind: function(key, update) {
			window._slm.listeners.push({
				'key': key,
				'func': update
			});
		},
		unbind: function(key) {
			var listener;
			for(var index=0; index < window._slm.listeners.length; index++) {
				listener = window._slm.listeners[index];
				if(listener.key === key) {
					window._slm.listeners.splice(index,1);
				}
			}
		},
		get_key: function() {
			window._slm.key_counter += 1;
			return window._slm.key_counter;
		}
	};
	window._slm.init();
	// Main smartload definition
	$.fn.smartLoad = function(load_handler, unload_handler, options) {
		var key = window._slm.get_key(), elements = this, throttle_timer, opts;

		// Resolve call params - unload_handler is optional
		if(typeof unload_handler === 'object') {
			options = unload_handler;
			unload_handler = undefined;
		}
		opts = $.extend({}, $.fn.smartLoad.defaults, options);

		// Function that is called when the window loads, scrolls or resizes
		function trigger() {
			var $window = $(window), top_boundary = $window.scrollTop() - opts.threshold, bottom_boundary = $window.scrollTop() + $window.height() + opts.threshold;

			elements.each(function() {
				var $this = $(this);
				// Check the top of the element is visible
				if($this.offset().top + $this.height() >= top_boundary && $this.offset().top <= bottom_boundary && $this.is(':visible')) {
					if(!this.loaded) {
						$this.trigger("smartload");
						if(!opts.repeatable && !unload_handler) {
							elements = elements.not($this);
							if(!elements.length) {
								window._slm.unbind(key);
							}
						}
					}
				}
				else if($this.is(':visible') && this.loaded) {
					if(!opts.repeatable) {
						elements = elements.not($this);
						if(!elements.length) {
							window._slm.unbind(key);
						}
					}
					$this.trigger("smartunload");
				}
			});
		}
		// Throttling function
		function update() {
			if(opts.throttle) {
				if(throttle_timer === undefined) {
					throttle_timer = window.setTimeout(function(){
						trigger();
						throttle_timer = undefined;
					}, opts.throttle);
				}
			}
			else {
				trigger();
			}
		}

		// Only bind smartLoad events if the jQuery object contains valid elements
		if(elements.length > 0) {
			// Inherit load/unload delay and threshold from generic setting unless provided
			if(opts.load_delay === undefined){ opts.load_delay = opts.delay; }
			if(opts.load_threshold === undefined){ opts.load_threshold = opts.threshold; }
			if(opts.unload_delay === undefined){ opts.unload_delay = opts.delay; }
			if(opts.unload_threshold === undefined){ opts.load_threshold = opts.threshold; }

			// Intialise each element
			elements.each(function() {
				var self = this, $self = $(self), smartload_function, smartunload_function;
				self.loaded = false;
				smartload_function = function() {
					if(!self.loaded) {
						if(opts.delay) {
							window.setTimeout(function(){load_handler.call(self);}, opts.delay);
						}
						else {
							load_handler.call(self);
						}
						if(!opts.repeatable){$(self).unbind("smartload");}
						self.loaded = true;
					}
				};
				$self.bind("smartload", smartload_function);
				if(unload_handler) {
					smartunload_function = function() {
						if(self.loaded) {
							if(opts.delay) {
								window.setTimeout(function(){unload_handler.call(self);}, opts.delay);
							}
							else {
								unload_handler.call(self);
							}
							if(!opts.repeatable){$(self).unbind("smartunload");}
							self.loaded = false;
						}
					};
					$self.bind("smartunload", smartunload_function);
				}
			});

			// Bind to the global manager for events
			window._slm.bind(key, function(){update();});

			// Trigger once on DOM ready
			$(function(){
				update();
			});
		}

		// Chainable
		return this;
	};
	// Default config
	$.fn.smartLoad.defaults = {
		// delay and threshold settings are used for both load and unload unless overridden
		delay: 0,
		threshold: 0,
		throttle: 100,
		repeatable: false
	};
})(window, jQuery);