/*! Smartload v1.2.1 - https://github.com/Chisnet/smartload */
(function (factory) {
    if ( typeof define === 'function' && define.amd ) {
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory;
    } else {
        factory(jQuery);
    }
}(function($) {
    'use strict';
    // Manager for all smartloads on a page to reduce event binding
    window._slm = {
        listeners: [],
        key_counter: 0,
        init: function() {
            // Trigger when the window is resized or scrolled
            $(window).bind("resize", function() {
                window._slm.triggerListeners("resize");
            }).bind("scroll", function() {
                window._slm.triggerListeners("scroll");
            }).bind("orientationchange", function() {
                window._slm.triggerListeners("orientationchange");
            });
        },
        triggerListeners: function(eventType) {
            var listener;
            if(window._slm.listeners.length) {
                for(var index=0; index < window._slm.listeners.length; index++) {
                    listener = window._slm.listeners[index];
                    listener.func.call(null, eventType);
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
        // If responsiveness is enabled ensure that triggers are forced to be repeatable
        if(opts.responsive) {
            opts.repeatable = true;
        }

        // Function that is called when the window loads, scrolls or resizes
        function trigger(eventType) {
            var $window = $(window), top_boundary = $window.scrollTop() - opts.threshold, bottom_boundary = $window.scrollTop() + $window.height() + opts.threshold;
            elements.each(function() {
                var $this = $(this);
                // Check the top of the element is visible
                if($this.offset().top + $this.height() >= top_boundary && $this.offset().top <= bottom_boundary && $this.is(':visible')) {
                    if(!this.loaded || opts.responsive) {
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
        function update(eventType) {
            if(opts.throttle) {
                if(throttle_timer === undefined) {
                    throttle_timer = window.setTimeout(function(){
                        trigger(eventType);
                        throttle_timer = undefined;
                    }, opts.throttle);
                }
            }
            else {
                trigger(eventType);
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
                smartload_function = function(e) {
                    if(!self.loaded || opts.responsive) {
                        if(opts.delay) {
                            window.setTimeout(function(){load_handler.call(self);}, opts.delay);
                        }
                        else {
                            load_handler.call(self);
                        }
                        if(!opts.repeatable){$(self).unbind("smartload");}
                        self.loaded = true;
                    }
                    e.stopPropagation();
                };
                $self.bind("smartload", smartload_function);
                if(unload_handler) {
                    smartunload_function = function(e) {
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
                        e.stopPropagation();
                    };
                    $self.bind("smartunload", smartunload_function);
                }
            });

            // Bind to the global manager for events
            window._slm.bind(key, function(eventType){update(eventType);});

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
        repeatable: false,
        responsive: false
    };
}));
