(function($) {
	// Manager for all smartloads on a page to reduce event binding
	window._slm = {
		listeners: [],
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
				for(index in _slm.listeners) {
					listener = _slm.listeners[index];
					listener.func.call();
				}
			}
		},
		bind: function(selector, update) {
			_slm.listeners.push({
				'selector': selector,
				'func': update
			});
		},
		unbind: function(selector) {
			for(index in _slm.listeners) {
				listener = _slm.listeners[index];
				if(listener.selector == selector) {
					_slm.listeners.splice(index,1);
				}
			}
		}
	}
	_slm.init();
	// Main smartload definition
	$.fn.smartLoad = function(handler, options) {
		var elements = this;
		var selector = this.selector;

		var opts = $.extend({}, $.fn.smartLoad.defaults, options);
		var throttle_timer;

		// Intialise each element
		this.each(function() {
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
			elements.each(function() {
				var $this = $(this);
				var top_boundary = $window.scrollTop() - opts.threshold;
				var bottom_boundary = $window.scrollTop() + $window.height() + opts.threshold;

				// Check the top of the element is visible
				if($this.offset().top + $this.height() >= top_boundary && $this.offset().top <= bottom_boundary) {
					$this.trigger("smartload");
					elements = elements.not($this);
					if(!elements.length) {
						_slm.unbind(selector);
					}
				}
			});
		}

		// Bind to the global manager for events
		_slm.bind(selector, function(){update();});

		// Trigger once on load
		$(function(){
			update();
		});

		// Chainable
		return this;
	};
	// Default config
	$.fn.smartLoad.defaults = {
		delay: 0,
		threshold: 0,
		throttle: 0
	};
})(jQuery);