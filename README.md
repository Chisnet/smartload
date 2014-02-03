Smartload
=========

A handy jQuery plugin for smart progressive loading/animating of any content as it comes into view


Why?
----

While working on a new responsive site I was looking into ways to minimize the inital page weight, and also make the experience more appealing. There were already many solutions available for lazy loading of images, and adding visual effects, but I wanted something very small and simple where I was in full control of the effects, so out together this minimal jQuery plugin.

Examples
--------

For a simple lazy loading image you can use something like this:

`
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
`

This will copy the image URL in the data into the src attribute when any article image comes into view. You can easily use the same format to do something completely different though, like animate a block of content into view from the side, fade an element in, or trigger an AJAX call for more content at the end of an infinity scrolling page by changing the function that is called when the elements come into view.