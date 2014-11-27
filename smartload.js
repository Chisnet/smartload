(function($) {
	// Manager for all smartloads on a page to reduce event binding
	window._slm = {
		listeners: [],
		key_counter: 0,
		init: function() {
			// Trigger when the window is resized or scrolled
			$(window).bind("resize", function() {
				_slm.triggerListeners();
			}).bind("scroll", function() {
				_slm.triggerListeners();
			}).bind("orientationchange", function() {
				_slm.triggerListeners();
			});
		},
		triggerListeners: function() {
			if(_slm.listeners.length) {
				for(var index in _slm.listeners) {
					listener = _slm.listeners[index];
					listener.func.call();
				}
			}
		},
		bind: function(key, update) {
			_slm.listeners.push({
				'key': key,
				'func': update
			});
		},
		unbind: function(key) {
			for(var index in _slm.listeners) {
				listener = _slm.listeners[index];
				if(listener.key == key) {
					_slm.listeners.splice(index,1);
				}
			}
		},
		get_key: function() {
			_slm.key_counter += 1;
			return _slm.key_counter;
		}
	}
	_slm.init();
	// Main smartload definition
	$.fn.smartLoad = function(handler, options) {
		var elements = this;

		if(elements.length > 0) {
			var key = _slm.get_key();

			var opts = $.extend({}, $.fn.smartLoad.defaults, options);
			var throttle_timer;

			// Intialise each element
			elements.each(function() {
				var self = this;
				var $self = $(self);
				self.loaded = false;
				$self.one("smartload", function() {
					if(!this.loaded) {
						if(opts.delay) {
							setTimeout(function(){handler.call(self);}, opts.delay);
						}
						else {
							handler.call(self);
						}
						self.loaded = true;
					}
				});
			});

			function update() {
				if(opts.throttle) {
					if(typeof(throttle_timer) == 'undefined') {
						throttle_timer = setTimeout(function(){
							trigger();
							throttle_timer = undefined;
						}, opts.throttle);
					}
				}
				else {
					trigger();
				}
			}

			// Function that is called when the window loads, scrolls or resizes
			function trigger() {
				var $window = $(window);
				var top_boundary = $window.scrollTop() - opts.threshold;
				var bottom_boundary = $window.scrollTop() + $window.height() + opts.threshold;
				elements.each(function() {
					var $this = $(this);
					// Check the top of the element is visible
					if($this.offset().top + $this.height() >= top_boundary && $this.offset().top <= bottom_boundary && $this.is(':visible')) {
						$this.trigger("smartload");
						elements = elements.not($this);
						if(!elements.length) {
							_slm.unbind(key);
						}
					}
				});
			}

			// Bind to the global manager for events
			_slm.bind(key, function(){update();});

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
		delay: 0,
		threshold: 0,
		throttle: 100
	};
})(jQuery);