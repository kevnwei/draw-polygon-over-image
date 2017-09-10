# draw-polygon-over-image
Draw rectangle and polygon over image using canvas, depend on jquery only, import and export json string.

# Features
<pre>
DRAW: rectangle and polygon
DRAG: select the rectangle or polygon in RECTANGLE mode, and drag it to somewhere you want to
TYPE: change the TYPE of the rectangle or polygon by right click the shape, and select the right TYPE in the Popup
UNDO: by press CTRL+Z
SCALE: use the mouse wheel to scale the image and the rectangles and polygons
MAGNIFIER: by press "e" and click the mouse's left button
IMPORT: import the json string to auto draw the shapes
EXPORT: export the shapes as json string
VIEW: in the view mode, you cannot edit the shapes
SELECT: you can click the shape to select it, and drag it, or drag the picture
DELETE: you can delete the shape by select it and press "d"
REMOVE: remove one point of the polygon by right click it
</pre>

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
