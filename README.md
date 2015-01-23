Smartload
=========

A handy jQuery plugin for smart progressive loading/unloading/animating of any content as it comes into (or leaves) view


Why?
----

While working on a new responsive site I was looking into ways to minimize the inital page weight, and also make the experience more appealing. There were already many solutions available for lazy loading of images, and adding visual effects, but I wanted something very small and simple where I was in full control of the effects, so put together this minimal jQuery plugin.


Examples
--------

For a simple lazy loading image you can use something like this:

```html
<article>
	<img alt="" data-src="image.jpg"/>
</article>

<script>
$(function(){
	$("article img").smartLoad(function(){
		$(this).attr('src',$(this).data('src'));
	});
});
</script>
```

This will copy the image URL in the data into the src attribute when any article image comes into view. You can easily use the same format to do something completely different though, like animate a block of content into view from the side, fade an element in, or trigger an AJAX call for more content at the end of an infinity scrolling page by changing the function that is called when the elements come into view.


Configuration
-------------

The plugin only comes with a select few options, as follows:

threshold - Controls how close to the visible area the loading function will be triggered, in pixels.

delay - Adds a delay in milliseconds before the loading function is triggered

throttle - Throttles how often the loading functions can be triggered, handy if you notice problems on JavaScript heavy pages.

repeatable - If defining both load and unload events, whether or not the actions repeat

The delay and threshold can also be specified individually for loading and unloading:

load_threshold
load_delay
unload_threshold
unload_delay

These options can be set globally for all smartload instances, like so:

```html
<script>
$.fn.smartLoad.defaults.delay = 0;
$.fn.smartLoad.defaults.threshold = 0;
$.fn.smartLoad.defaults.throttle = 100; 
</script>

```

or per instance, like so:

```html
<script>
// Triggers loading images 200px outside the viewable area
$(".imageBox img").smartLoad(function(){
	$(this).attr('src',$(this).data('src'));
},{threshold:200});
</script>

```

Delays and thresholds both default to 0 otherwise, while throttle defaults to 100.
