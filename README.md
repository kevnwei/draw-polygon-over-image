# draw-polygon-over-image
Draw rectangle and polygon over image using canvas, depend on jquery only, import and export json string.

# usage
function saveCallback(ret) {
	console.log(ret);
}
$(document).ready(function() {
	var app = new painter();
	app.run('201708245t213212', 'f1_20170310m81418001_2.jpg', '{"DELETE":0,"POLYGON_VECTOR":[{"POLYGON":"(4160,1576)(4728,2400)(4712,1672)(5328,1032)(4160,1576)","TYPE":3}],"RECT_VECTOR":[{"RECT":"(2269,1743)(2547,2153)","TYPE":5}]}', saveCallback);
});
