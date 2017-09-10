var container;
var $canvas;
var IMG_WIDTH = 0;
var IMG_HEIGHT = 0;
var painter = function () {
	var self = this;
	container = document.getElementById('container');
	this.imgurl = '';
	this.jsonstr = '';
	this.callback;
	
	this.points = [[]];
	this.colors = [[0]];
    this.palette = ['#FF0000', '#FFFF00', '#0000FF'];
    this.active = 0;
	this.color = 0;
	this.rectMode = false;
	this.viewMode = true;
	this.dragMode = false;
	this.types = [3, 4, 5];
	this.isDelete = 0;
	this.scaleSize = 1;
	this.imageSize = 0;
	this.isListen = 0;
	this.wdRate;

	this.image;
	this.activePoint;
	this.gDrag = false;
	this.gMagnify = false;
	this.scrollPoint = {};
	this.rectPoint = {};
	this.dragPoint = {};
	
	$canvas = $('#mycanvas');
	this.ctx = $canvas[0].getContext('2d');

	this.selectit = function() {
        self.dragMode = !self.dragMode;
		self.viewMode = false;
		$('#selectbtn').attr('class', !self.dragMode ? 'select' : 'unselect');
		$('#viewbtn').attr('class', 'unview');
    };
	this.view = function(){
        self.viewMode = !self.viewMode;
		$('#viewbtn').attr('class', !self.viewMode ? 'unview' : 'view');
    };
	this.rect = function(){
		self.rectMode = true;
		self.viewMode = false;
		self.dragMode = false;
		$('#viewbtn').attr('class','unview');
		$('#rectangle').attr('class', 'unrectangle');
		$('#polygon').attr('class', 'polygon');
		$('#selectbtn').attr('class', 'select');
    };
	this.polygon = function(){
		self.rectMode = false;
		self.viewMode = false;
		self.dragMode = false;
		$('#viewbtn').attr('class', 'unview');
		$('#polygon').attr('class', 'unpolygon');
		$('#rectangle').attr('class', 'rectangle');
		$('#selectbtn').attr('class', 'select');
    	self.points.push([]);
		self.colors.push([self.color]);
        self.active = self.points.length - 1;
    };
	this.TypeA = function(){
        self.color = 0;
		$('#TypeA').attr('class', 'unTypeA');
		$('#TypeB').attr('class', 'TypeB');
		$('#TypeC').attr('class', 'TypeC');
    };
	this.TypeB = function(){
        self.color = 1;
		$('#TypeA').attr('class', 'TypeA');
		$('#TypeB').attr('class', 'unTypeB');
		$('#TypeC').attr('class', 'TypeC');
    };
	this.TypeC = function(){
        self.color = 2;
		$('#TypeA').attr('class', 'TypeA');
		$('#TypeB').attr('class', 'TypeB');
		$('#TypeC').attr('class', 'unTypeC');
    };
    this.undo = function(){
        self.points[self.active].splice(-1, 1);
    };
    this.clearAll = function(){
        self.points[this.active] = [];
    };
	this.deleteIt = function(){
        self.isDelete = self.isDelete ? 0 : 1;
		if (self.isDelete) {
			$('#delete').attr('class', 'undelete');
		} else {
			$('#delete').attr('class', 'delete');
		}
    };
    this.removePolygon = function (index) {
        self.points.splice(index, 1);
        if(index <= self.active) {
            --self.active;
        }
		self.colors.splice(index, 1);
    };
	this.setColor = function(){
		var color = $(this).attr('color');
		self.colors[self.active] = [color];
		$('#right-menu').hide();
		self.draw();
	};
    this.add = function (index) {
    	self.points.push([]);
		self.colors.push([self.color]);
        self.active = self.points.length - 1;
    };

	this.dotLineLength = function(x, y, x0, y0, x1, y1, o) {
		function lineLength(x, y, x0, y0){
			return Math.sqrt((x -= x0) * x + (y -= y0) * y);
		}
		if(o && !(o = function(x, y, x0, y0, x1, y1){
				if(!(x1 - x0)) return {x: x0, y: y};
				else if(!(y1 - y0)) return {x: x, y: y0};
				var left, tg = -1 / ((y1 - y0) / (x1 - x0));
				return {x: left = (x1 * (x * tg - y + y0) + x0 * (x * - tg + y - y1)) / (tg * (x1 - x0) + y0 - y1), y: tg * left - tg * x + y};
			}(x, y, x0, y0, x1, y1), o.x >= Math.min(x0, x1) && o.x <= Math.max(x0, x1) && o.y >= Math.min(y0, y1) && o.y <= Math.max(y0, y1))){
			var l1 = lineLength(x, y, x0, y0), l2 = lineLength(x, y, x1, y1);
			return l1 > l2 ? l2 : l1;
		}
		else {
			var a = y0 - y1, b = x1 - x0, c = x0 * y1 - y0 * x1;
			return Math.abs(a * x + b * y + c) / Math.sqrt(a * a + b * b);
		}
	};
	
	this.getMousePos = function (canvas, evt) {
		var rect = canvas.getBoundingClientRect();
		return {
			x: evt.clientX - rect.left,
			y: evt.clientY - rect.top
		};
	};
	
	this.isInside = function (x, y, points) {
		var minX = x, maxX = x, minY = y, maxY = y;
		for (var i = points.length - 1; i >= 0 ; --i) {
			minX = x, maxX = x, minY = y, maxY = y;
			for (var j = 0; j < points[i].length; ++j) {
				minX = minX > points[i][j][0] ? points[i][j][0] : minX;
				maxX = maxX < points[i][j][0] ? points[i][j][0] : maxX;
				minY = minY > points[i][j][1] ? points[i][j][1] : minY;
				maxY = maxY < points[i][j][1] ? points[i][j][1] : maxY;
			}
			if (x > minX && x < maxX && y > minY && y < maxY) {
				return true;
			}
		}
		return false;
	};
	
	this.resize = function(onload) {
		if (IMG_WIDTH == 0 || IMG_HEIGHT == 0) {
			IMG_WIDTH = 2 * self.image.naturalWidth;
			IMG_HEIGHT = 2 * self.image.naturalHeight;
			self.imageSize = IMG_WIDTH;
		}
		if (onload) {
			self.wdRate = self.image.naturalWidth / self.image.naturalHeight;
			self.image.width = 1024;
			self.scaleSize = self.image.width / IMG_WIDTH;
			self.image.height = self.scaleSize * IMG_HEIGHT;
			self.load();
		}

		$canvas.attr('height', self.image.height).attr('width', self.image.width);
		self.draw();
	};
	
	this.move = function(e) {
		if(!e.offsetX) {
			e.offsetX = (e.pageX - $(e.target).offset().left);
			e.offsetY = (e.pageY - $(e.target).offset().top);
		}
		var points = self.points[self.active];
		points[self.activePoint][0] = Math.round(e.offsetX);
		points[self.activePoint][1] = Math.round(e.offsetY);
		self.draw();
	};

	this.stopdrag = function() {
		if (self.rectMode) {
			self.gDrag = false;
			return false;
		}
		$(container).off('mousemove');
		self.activePoint = null;
	};

	this.rightclick = function(e) {
		e.preventDefault();
		if(!e.offsetX) {
			e.offsetX = (e.pageX - $(e.target).offset().left);
			e.offsetY = (e.pageY - $(e.target).offset().top);
		}
		var x = e.offsetX, y = e.offsetY;
		var points = self.points[self.active];
		if (points){
			for (var i = 0; i < points.length; ++i) {
				var dis = Math.sqrt(Math.pow(x - points[i][0], 2) + Math.pow(y - points[i][1], 2));
				if ( dis < 6 ) {
					points.splice(i, 1);
					self.draw();
					return false;
				}
			}
		}
		
		if (self.isInside(x, y, self.points)) {
			$('#right-menu').css('display', 'block').css('left', e.pageX + 'px').css('top', e.pageY + 'px');
			return false;
		}
		self.viewMode = !self.viewMode;
		$('#viewbtn').attr('class', !self.viewMode ? 'unview' : 'view');

		return false;
	};

	this.mousedown = function(e) {
		if (e.which === 3) {
			return false;
		}
		
		$('#right-menu').hide();
		if (self.gMagnify) {
			self.magnify(e);
			return false;
		}
		if (self.viewMode && e.button == 0) {
			self.setScrollPoint(e);
			return false;
		}
		if (!self.rectMode && !self.dragMode && self.points.length == 0) {
			self.points.push([]);
			self.colors.push([self.color]);
			self.active = self.points.length - 1;
		}
		var points = self.points[self.active];
		var x, y, dis, minDis = 0, minDisIndex = -1;
		e.preventDefault();
		if(!e.offsetX) {
			e.offsetX = (e.pageX - $(e.target).offset().left);
			e.offsetY = (e.pageY - $(e.target).offset().top);
		}
		var mousePos = self.getMousePos($canvas[0], e);
		x = mousePos.x; y = mousePos.y;
		
		if (self.rectMode || self.dragMode) {
			if (self.dragMode) {
				self.setScrollPoint(e);
			}
			if (self.setDragPoint(x, y)) {
				return false;
			} else {
				self.dragPoint = {};
			}
		}
		
		if (points) {
			for (var i = 0; i < points.length; ++i) {
				dis = Math.sqrt(Math.pow(x - points[i][0], 2) + Math.pow(y - points[i][1], 2));
				if(minDisIndex == -1 || minDis > dis) {
					minDis = dis;
					minDisIndex = i;
				}
			}
		}
		if ( minDis < 6 && minDisIndex >= 0 ) {
			if (self.rectMode && !self.dragMode) {
				self.resizeRect(points, minDisIndex);
				return false;
			}
			self.activePoint = minDisIndex;
			$(container).on('mousemove', self.move);
			return false;
		} else if (self.rectMode && !self.dragMode) {
			self.setDrawRect(x, y);
			return false;
		}

		if (!self.dragMode) {
			self.setDrawPloygon(points, x, y);
		}

		return false;
	};

	this.setDrawPloygon = function(points, x, y) {
		var lineDis;
		var insertAt = points ? points.length : 0
		for (var i = 0; i < points.length; ++i) {
			if (i > 1) {
				lineDis = self.dotLineLength(
					x, y,
					points[i][0], points[i][1],
					points[i-1][0], points[i-1][1],
					true
				);
				if (lineDis < 6) {
					insertAt = i;
				}
			}
		}

		points.splice(insertAt, 0, [Math.round(x), Math.round(y)]);
		self.activePoint = insertAt;
		$(container).on('mousemove', self.move);
		self.draw();
	};

	this.setDragPoint = function(x, y) {
		var minX = x, maxX = x, minY = y, maxY = y;
		for (var i = self.points.length - 1; i >= 0 ; --i) {
			minX = x, maxX = x, minY = y, maxY = y;
			for (var j = 0; j < self.points[i].length; ++j) {
				minX = minX > self.points[i][j][0] ? self.points[i][j][0] : minX;
				maxX = maxX < self.points[i][j][0] ? self.points[i][j][0] : maxX;
				minY = minY > self.points[i][j][1] ? self.points[i][j][1] : minY;
				maxY = maxY < self.points[i][j][1] ? self.points[i][j][1] : maxY;
			}
			if (x > minX && x < maxX && y > minY && y < maxY) {
				self.active = i;
				self.draw();
				self.dragPoint.x = x;
				self.dragPoint.y = y;
				self.gDrag = true;
				return true;
			}
		}
		return false;
	};

	this.setScrollPoint = function(e) {
		self.gDrag = true;
		self.scrollPoint.x = e.clientX;
		self.scrollPoint.y = e.clientY;
		$(container).css("cursor","move");
	};

	this.resizeRect = function(points, minDisIndex) {
		self.gDrag = true;
		var j = (minDisIndex + 2) % 4;
		self.rectPoint.startX = points[j][0];
		self.rectPoint.startY = points[j][1];
		self.dragPoint = {};
	};

	this.setDrawRect = function(x, y) {
		self.points.push([]);
		self.colors.push([self.color]);
		self.active = self.points.length - 1;
		self.rectPoint.startX = x;
		self.rectPoint.startY = y;
		self.dragPoint = {};
		self.gDrag = true;
	};
	
	this.mousemove = function(e) {
		if (self.gDrag) {
			self.viewMode ? self.scroll(e)
			: (self.dragPoint && self.dragPoint.x && self.dragPoint.y ? self.drag(e) :
			(self.dragMode ? self.scroll(e) : self.drawRect(e)));
		} else {
			self.over(e);
		}
	};

	this.scroll = function(e) {
		var x = e.clientX;
		var y = e.clientY;
		if (typeof self.scrollPoint.x != 'undefined') {
			window.scrollBy(self.scrollPoint.x - x, self.scrollPoint.y - y);
		}
		self.scrollPoint.x = x;
		self.scrollPoint.y = y;
	};

	this.over = function(e) {
		if ((self.dragMode || self.rectMode) && !self.gMagnify) {
			e.preventDefault();
			if(!e.offsetX) {
				e.offsetX = (e.pageX - $(e.target).offset().left);
				e.offsetY = (e.pageY - $(e.target).offset().top);
			}
			var mousePos = self.getMousePos($canvas[0], e);
			var x = mousePos.x; var y = mousePos.y;
			var minX = x, maxX = x, minY = y, maxY = y;
			$(container).css("cursor","default");
			for (var i = self.points.length - 1; i >= 0 ; --i) {
				minX = x, maxX = x, minY = y, maxY = y;
				for (var j = 0; j < self.points[i].length; ++j) {
					minX = minX > self.points[i][j][0] ? self.points[i][j][0] : minX;
					maxX = maxX < self.points[i][j][0] ? self.points[i][j][0] : maxX;
					minY = minY > self.points[i][j][1] ? self.points[i][j][1] : minY;
					maxY = maxY < self.points[i][j][1] ? self.points[i][j][1] : maxY;
				}
				if (x > minX && x < maxX && y > minY && y < maxY) {
					$(container).css("cursor","move");
					break;
				}
			}
		}
	};
	
	this.drag = function(e) {
		var x, y;
		e.preventDefault();
		if(!e.offsetX) {
			e.offsetX = (e.pageX - $(e.target).offset().left);
			e.offsetY = (e.pageY - $(e.target).offset().top);
		}
		var mousePos = self.getMousePos($canvas[0], e);
		x = mousePos.x; y = mousePos.y;
		
		var movePts = self.active;
		var points = self.points[movePts];
		var deltaX = x - self.dragPoint.x;
		var deltaY = y - self.dragPoint.y;
		for (var i = 0; i < points.length; ++i) {
			self.points[movePts][i][0] += deltaX;
			self.points[movePts][i][1] += deltaY;
			self.points[movePts][i][0] = parseInt(self.points[movePts][i][0]);
			self.points[movePts][i][1] = parseInt(self.points[movePts][i][1]);
		}
		var insertAt = 0;
		self.dragPoint.x = x;
		self.dragPoint.y = y;
		self.activePoint = insertAt;
		self.draw();
	};
	
	this.drawRect = function(e) {
		e.preventDefault();
		self.points[self.active] = [];
		var points = self.points[self.active];
		var x, y, dis, minDis = 0, minDisIndex = -1, lineDis, insertAt = points.length;
		e.preventDefault();
		if(!e.offsetX) {
			e.offsetX = (e.pageX - $(e.target).offset().left);
			e.offsetY = (e.pageY - $(e.target).offset().top);
		}
		var mousePos = self.getMousePos($canvas[0], e);
		x = mousePos.x; y = mousePos.y;
		var x1 = self.rectPoint.startX, y1 = self.rectPoint.startY,
		x2 = x1, y2 = y,
		x3 = x, y3 = y,
		x4 = x, y4 = y1;
		points.splice(insertAt, 0, [Math.round(x1), Math.round(y1)],[Math.round(x2), Math.round(y2)],[Math.round(x3), Math.round(y3)],[Math.round(x4), Math.round(y4)]);
		self.activePoint = insertAt;
		self.draw();
	};
	
	this.draw = function() {
		self.ctx.canvas.width = self.ctx.canvas.width;
		if(self.points.length > 0) {
			self.drawSingle(self.points[self.active], self.active);
		}
		for(var p = 0; p < self.points.length; ++p) {
			var points = self.points[p];
			if (points.length == 0 || self.active == p) {
				continue;
			}
			self.drawSingle(points, p);
		}
	};

	this.drawSingle = function (points, p) {
		var colorIndex = self.colors[p][0];
		var strokecolor = self.palette[colorIndex];
		self.ctx.globalCompositeOperation = 'destination-over';
		self.ctx.fillStyle = 'rgb(255,255,255)';
		self.ctx.strokeStyle = strokecolor;
		self.ctx.lineWidth = 3;
		self.ctx.beginPath();
		for (var i = 0; i < points.length; ++i) {
			if(self.active == p) {
				self.ctx.fillRect(points[i][0] - 2, points[i][1] - 2, 4, 4);
				self.ctx.strokeRect(points[i][0] - 2, points[i][1] - 2, 4, 4);
			}
			self.ctx.lineTo(points[i][0], points[i][1]);
		}
		self.ctx.closePath();
		self.ctx.stroke();
	};

	this.magnify = function (e) {
		var preWidth = self.image.width;
		self.image.width  = IMG_WIDTH / 2;
		self.image.height = IMG_HEIGHT / 2;
		self.scaleSize = self.image.width / preWidth;
		self.scalePoints();
		self.resize();
		var x = ((0.5 + (e.offsetX * self.scaleSize)) | 0) - e.offsetX;
		var y = ((0.5 + (e.offsetY * self.scaleSize)) | 0) - e.offsetY;
		window.scrollBy(x, y);
		self.gMagnify = false;
		$(container).css("cursor","default");
	};
	
	this.scale = function (e) {
		var delta = e.originalEvent.wheelDelta > 0 ? 512 : -512;
		if (delta < 0 && self.image.width < (window.screen.availWidth)) {
			return false;
		}
		if (delta > 0 && self.image.width >= (IMG_WIDTH / 2)) {
			return false;
		}

		e.preventDefault();
		var preWidth = self.image.width;
		self.image.width += delta;
		self.image.height += Math.round(delta / self.wdRate);
		self.scaleSize = self.image.width / preWidth;
		self.scalePoints();
		self.resize();
		var x = ((0.5 + (e.offsetX * self.scaleSize)) | 0) - e.offsetX;
		var y = ((0.5 + (e.offsetY * self.scaleSize)) | 0) - e.offsetY;
		window.scrollBy(x, y);
	};
	
	this.scalePoints = function () {
		for (var i = self.points.length - 1; i >= 0 ; --i) {
			for (var j = 0; j < self.points[i].length; ++j) {
				self.points[i][j][0] = self.points[i][j][0] * self.scaleSize;
				self.points[i][j][1] = self.points[i][j][1] * self.scaleSize;
			}
		}
	};

	this.mouseup = function(e) {
		self.gDrag = false;
		$(container).css("cursor","default");
	};

	this.keydown = function(e) {
		var currKey = e.keyCode || e.which || e.charCode;
		switch (currKey) {
			case 74 || 106:
				// press j
				self.color = 0;
				break;
			case 71 || 103:
				// press g
				self.color = 1;
				break;
			case 81 || 113:
				// press q
				self.color = 2;
				break;
			case 69 || 101:
				// press e
				$(container).css({cursor:"url(../images/magnifier.png),auto"});
				self.gMagnify = true;
				break;
			case 70 || 102:
				// press f
				self.rectMode = !self.rectMode;
				if (!self.rectMode) {
					self.points.push([]);
					self.colors.push([self.color]);
					self.active = self.points.length - 1;
				}
				break;
			case 68 || 100:
				//press d
				if (self.active >= 0) {
					self.points.splice(self.active, 1);
					self.colors.splice(self.active, 1);
					self.active = self.points.length - 1;
					self.draw();
				}
				break;
			case 90 || 122:
				//press ctrl + z
				if (e.ctrlKey) {
					self.points[self.active].splice(-1, 1);
					self.draw();
				}
				break;
			case 83 || 115:
				// press s
				self.isDelete = self.isDelete ? 0 : 1;
				break;
			default:
				break;
		}
	};
		
	this.load = function() {
		if (!self.jsonstr) {
			return false;
		}
		var data = JSON.parse(self.jsonstr);
		if (data) {
			self.points  = [[]];
			self.colors  = [[0]];
			if (data.RECT_VECTOR) {
				for (var i = 0; i < data.RECT_VECTOR.length; i++) {
					var item = data.RECT_VECTOR[i];
					if ( item.TYPE != 3 && item.TYPE != 4 && item.TYPE != 5) {
						continue;
					}
						
					var temp = item.RECT.split('(');
					var rectpoints = [];
					for( var j = 0 ; j < temp.length; j++) {
						if (temp[j].length != 0) {
							var t = temp[j].replace(')', '');
							t = t.split(',');
							rectpoints.push(t);
						}
					}
					if (rectpoints.length > 0) {
						var x1 = parseInt(rectpoints[0][0]) * self.scaleSize;
						var y1 = parseInt(rectpoints[0][1]) * self.scaleSize;
						var x2 = parseInt(rectpoints[1][0]) * self.scaleSize;
						var y2 = parseInt(rectpoints[1][1]) * self.scaleSize;
						var rect = [[x1, y1], [x1, y2], [x2, y2], [x2, y1]];
						self.points.push(rect);
						self.colors.push([item.TYPE % 3]);
					}
				}
			}
			if (data.POLYGON_VECTOR) {
				for (var i = 0; i < data.POLYGON_VECTOR.length; i++) {
					var item = data.POLYGON_VECTOR[i];
					if ( item.TYPE != 3 && item.TYPE != 4 && item.TYPE != 5) {
						continue;
					}
						
					var temp = item.POLYGON.split('(');
					var polypoints = [];
					for( var j = 0 ; j < temp.length; j++) {
						if (temp[j].length != 0) {
							var t = temp[j].replace(')', '');
							t = t.split(',');
							polypoints.push(t);
						}
					}
					if (polypoints.length > 0) {
						var poly = [];
						for (var k = 0; k < polypoints.length - 1; k++) {
							var x = parseInt(polypoints[k][0]) * self.scaleSize;
							var y = parseInt(polypoints[k][1]) * self.scaleSize;
							poly.push([x, y]);
						}
						self.points.push(poly);
						self.colors.push([item.TYPE % 3]);
					}
				}
			}
		}
	};
	
	this.save = function(){
		var ret = {
			'DELETE': self.isDelete,
			'POLYGON_VECTOR':[],
			'RECT_VECTOR':[]
		};

		if (self.points.length > 0) {
			var _scale = self.imageSize / self.image.width;
			var polygon = '';
			var rect = '';
			var type = '';
			var first = '';
			for(var i = 0; i < self.points.length; i++) {
			    if (self.points[i].length == 0) {
					continue;
				}
				if (self.points[i].length != 4 || (self.points[i].length == 4 && !(
					self.points[i][0][0] == self.points[i][1][0] && 
					self.points[i][0][1] == self.points[i][3][1] && 
					self.points[i][1][1] == self.points[i][2][1] && 
					self.points[i][2][0] == self.points[i][3][0]))) {
					polygon = '';
					first = '';
					for (var j in self.points[i]) {
						polygon += '(' + ((0.5 +(self.points[i][j][0] * _scale)) | 0) + ',' + ((0.5 +(self.points[i][j][1] * _scale)) | 0) + ')';
						if (first === '') {
							first = polygon;
						}
					}
					polygon += first;
					type = self.types[self.colors[i][0]];
					ret['POLYGON_VECTOR'].push({'POLYGON':polygon, 'TYPE': type});
				} else {
					rect = '';
					rect += '(' + ((0.5 +(self.points[i][0][0] * _scale)) | 0) + ',' + ((0.5 +(self.points[i][0][1] * _scale)) | 0) + ')';
					rect += '(' + ((0.5 +(self.points[i][2][0] * _scale)) | 0) + ',' + ((0.5 +(self.points[i][2][1] * _scale)) | 0) + ')';
					type = self.types[self.colors[i][0]];
					ret['RECT_VECTOR'].push({'RECT': rect, 'TYPE': type});
				}
			}
		}
		
		$('#save').attr('class', 'saved');
		//console.log(ret);
		if (self.callback) {
			self.callback(ret);
		}
	};
	this.listen = function () {
		if (self.isListen) {
			return false;
		}
		self.isListen = 1;
		$('#selectbtn').on('click', self.selectit);
		$('#viewbtn').on('click', self.view);
		$('#rectangle').on('click', self.rect);
		$('#polygon').on('click', self.polygon);
		$('#TypeA').on('click', self.TypeA);
		$('#TypeB').on('click', self.TypeB);
		$('#TypeC').on('click', self.TypeC);
		$('#delete').on('click', self.deleteIt);
		$('#save').on('click', self.save);
		$('.popup').on('click', self.setColor);
		$canvas.on('mousedown', self.mousedown);
		$canvas.on('mouseup', self.mouseup);
		$canvas.on('contextmenu', self.rightclick);
		$canvas.on('mouseup', self.stopdrag);
		$canvas.on('mousemove', self.mousemove);
		$canvas.on('mousewheel', self.scale);
		$(document).on('keydown', self.keydown);
	};
	
	this.run = function (imgurl, json, callback) {
		self.listen();
		self.jsonstr = json;
		self.callback = callback;
		self.points = [[]];
		self.active = 0;
		self.image = new Image();
		self.image.src = imgurl;
		$(self.image).load(function () {self.resize(1)});
		$canvas.css({background: 'url('+self.image.src+')'});
		$canvas.css({backgroundSize: 'contain'});
	};
}
