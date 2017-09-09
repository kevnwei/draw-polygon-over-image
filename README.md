# draw-polygon-over-image
Draw rectangle and polygon over image using canvas, depend on jquery only, import and export json string.

# note

for the scale feature, just fit for 2:1 size image only currently. will be updated later.

# usage
<pre>
function cb(ret) {
	console.log(ret);
}
$(document).ready(function() {
	var app = new painter();
	var json= '{"DELETE":0,"POLYGON_VECTOR":[{"POLYGON":"(4160,1576)(4728,2400)(4712,1672)","TYPE":3}],"RECT_VECTOR":[{"RECT":"(2269,1743)(2547,2153)","TYPE":5}]}';
	app.run('test.jpg', json, cb);
});
</pre>
