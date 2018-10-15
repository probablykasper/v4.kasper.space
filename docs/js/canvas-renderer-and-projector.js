'use strict';

// minOnSave: true, minifier: uglify-js
var bgColor = 0xffffff;
/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.SpriteCanvasMaterial = function (parameters) {

	THREE.Material.call(this);

	this.type = 'SpriteCanvasMaterial';

	this.color = new THREE.Color(0xffffff);
	this.program = function () {};

	this.setValues(parameters);
};

THREE.SpriteCanvasMaterial.prototype = Object.create(THREE.Material.prototype);
THREE.SpriteCanvasMaterial.prototype.constructor = THREE.SpriteCanvasMaterial;
THREE.SpriteCanvasMaterial.prototype.isSpriteCanvasMaterial = true;

THREE.SpriteCanvasMaterial.prototype.clone = function () {

	var material = new THREE.SpriteCanvasMaterial();

	material.copy(this);
	material.color.copy(this.color);
	material.program = this.program;

	return material;
};

//

THREE.CanvasRenderer = function (parameters) {

	console.log('THREE.CanvasRenderer', THREE.REVISION);

	parameters = parameters || {};

	var _this = this,
	    _renderData,
	    _elements,
	    _lights,
	    _projector = new THREE.Projector(),
	    _canvas = parameters.canvas !== undefined ? parameters.canvas : document.createElement('canvas'),
	    _canvasWidth = _canvas.width,
	    _canvasHeight = _canvas.height,
	    _canvasWidthHalf = Math.floor(_canvasWidth / 2),
	    _canvasHeightHalf = Math.floor(_canvasHeight / 2),
	    _viewportX = 0,
	    _viewportY = 0,
	    _viewportWidth = _canvasWidth,
	    _viewportHeight = _canvasHeight,
	    _pixelRatio = 1,
	    _context = _canvas.getContext('2d', {
		alpha: parameters.alpha === true
	}),
	    _clearColor = new THREE.Color(bgColor),
	    _clearAlpha = parameters.alpha === true ? 0 : 1,
	    _contextGlobalAlpha = 1,
	    _contextGlobalCompositeOperation = 0,
	    _contextStrokeStyle = null,
	    _contextFillStyle = null,
	    _contextLineWidth = null,
	    _contextLineCap = null,
	    _contextLineJoin = null,
	    _contextLineDash = [],
	    _v1,
	    _v2,
	    _v3,
	    _v1x,
	    _v1y,
	    _v2x,
	    _v2y,
	    _v3x,
	    _v3y,
	    _color = new THREE.Color(),
	    _diffuseColor = new THREE.Color(),
	    _emissiveColor = new THREE.Color(),
	    _lightColor = new THREE.Color(),
	    _patterns = {},
	    _uvs,
	    _uv1x,
	    _uv1y,
	    _uv2x,
	    _uv2y,
	    _uv3x,
	    _uv3y,
	    _clipBox = new THREE.Box2(),
	    _clearBox = new THREE.Box2(),
	    _elemBox = new THREE.Box2(),
	    _ambientLight = new THREE.Color(),
	    _directionalLights = new THREE.Color(),
	    _pointLights = new THREE.Color(),
	    _vector3 = new THREE.Vector3(),
	    // Needed for PointLight
	_centroid = new THREE.Vector3(),
	    _normal = new THREE.Vector3(),
	    _normalViewMatrix = new THREE.Matrix3();

	/* TODO
 _canvas.mozImageSmoothingEnabled = false;
 _canvas.webkitImageSmoothingEnabled = false;
 _canvas.msImageSmoothingEnabled = false;
 _canvas.imageSmoothingEnabled = false;
 */

	// dash+gap fallbacks for Firefox and everything else

	if (_context.setLineDash === undefined) {

		_context.setLineDash = function () {};
	}

	this.domElement = _canvas;

	this.autoClear = true;
	this.sortObjects = true;
	this.sortElements = true;

	this.info = {

		render: {

			vertices: 0,
			faces: 0

		}

	};

	// API

	this.getContext = function () {

		return _context;
	};

	this.getContextAttributes = function () {

		return _context.getContextAttributes();
	};

	this.getPixelRatio = function () {

		return _pixelRatio;
	};

	this.setPixelRatio = function (value) {

		if (value !== undefined) _pixelRatio = value;
	};

	this.setSize = function (width, height, updateStyle) {

		_canvasWidth = width * _pixelRatio;
		_canvasHeight = height * _pixelRatio;

		_canvas.width = _canvasWidth;
		_canvas.height = _canvasHeight;

		_canvasWidthHalf = Math.floor(_canvasWidth / 2);
		_canvasHeightHalf = Math.floor(_canvasHeight / 2);

		if (updateStyle !== false) {

			_canvas.style.width = width + 'px';
			_canvas.style.height = height + 'px';
		}

		_clipBox.min.set(-_canvasWidthHalf, -_canvasHeightHalf);
		_clipBox.max.set(_canvasWidthHalf, _canvasHeightHalf);

		_clearBox.min.set(-_canvasWidthHalf, -_canvasHeightHalf);
		_clearBox.max.set(_canvasWidthHalf, _canvasHeightHalf);

		_contextGlobalAlpha = 1;
		_contextGlobalCompositeOperation = 0;
		_contextStrokeStyle = null;
		_contextFillStyle = null;
		_contextLineWidth = null;
		_contextLineCap = null;
		_contextLineJoin = null;

		this.setViewport(0, 0, width, height);
	};

	this.setViewport = function (x, y, width, height) {

		_viewportX = x * _pixelRatio;
		_viewportY = y * _pixelRatio;

		_viewportWidth = width * _pixelRatio;
		_viewportHeight = height * _pixelRatio;
	};

	this.setScissor = function () {};
	this.setScissorTest = function () {};

	this.setClearColor = function (color, alpha) {

		_clearColor.set(color);
		_clearAlpha = alpha !== undefined ? alpha : 1;

		_clearBox.min.set(-_canvasWidthHalf, -_canvasHeightHalf);
		_clearBox.max.set(_canvasWidthHalf, _canvasHeightHalf);
	};

	this.setClearColorHex = function (hex, alpha) {

		console.warn('THREE.CanvasRenderer: .setClearColorHex() is being removed. Use .setClearColor() instead.');
		this.setClearColor(hex, alpha);
	};

	this.getClearColor = function () {

		return _clearColor;
	};

	this.getClearAlpha = function () {

		return _clearAlpha;
	};

	this.getMaxAnisotropy = function () {

		return 0;
	};

	this.clear = function () {

		if (_clearBox.isEmpty() === false) {

			_clearBox.intersect(_clipBox);
			_clearBox.expandByScalar(2);

			_clearBox.min.x = _clearBox.min.x + _canvasWidthHalf;
			_clearBox.min.y = -_clearBox.min.y + _canvasHeightHalf; // higher y value !
			_clearBox.max.x = _clearBox.max.x + _canvasWidthHalf;
			_clearBox.max.y = -_clearBox.max.y + _canvasHeightHalf; // lower y value !

			if (_clearAlpha < 1) {

				_context.clearRect(_clearBox.min.x | 0, _clearBox.max.y | 0, _clearBox.max.x - _clearBox.min.x | 0, _clearBox.min.y - _clearBox.max.y | 0);
			}

			if (_clearAlpha > 0) {

				setOpacity(1);
				setBlending(THREE.NormalBlending);

				setFillStyle('rgba(' + Math.floor(_clearColor.r * 255) + ',' + Math.floor(_clearColor.g * 255) + ',' + Math.floor(_clearColor.b * 255) + ',' + _clearAlpha + ')');

				_context.fillRect(_clearBox.min.x | 0, _clearBox.max.y | 0, _clearBox.max.x - _clearBox.min.x | 0, _clearBox.min.y - _clearBox.max.y | 0);
			}

			_clearBox.makeEmpty();
		}
	};

	// compatibility

	this.clearColor = function () {};
	this.clearDepth = function () {};
	this.clearStencil = function () {};

	this.render = function (scene, camera) {

		if (camera.isCamera === undefined) {

			console.error('THREE.CanvasRenderer.render: camera is not an instance of THREE.Camera.');
			return;
		}

		var background = scene.background;

		if (background && background.isColor) {

			setOpacity(1);
			setBlending(THREE.NormalBlending);

			setFillStyle(background.getStyle());
			_context.fillRect(0, 0, _canvasWidth, _canvasHeight);
		} else if (this.autoClear === true) {

			this.clear();
		}

		_this.info.render.vertices = 0;
		_this.info.render.faces = 0;

		_context.setTransform(_viewportWidth / _canvasWidth, 0, 0, -_viewportHeight / _canvasHeight, _viewportX, _canvasHeight - _viewportY);
		_context.translate(_canvasWidthHalf, _canvasHeightHalf);

		_renderData = _projector.projectScene(scene, camera, this.sortObjects, this.sortElements);
		_elements = _renderData.elements;
		_lights = _renderData.lights;

		_normalViewMatrix.getNormalMatrix(camera.matrixWorldInverse);

		/* DEBUG
  setFillStyle( 'rgba( 0, 255, 255, 0.5 )' );
  _context.fillRect( _clipBox.min.x, _clipBox.min.y, _clipBox.max.x - _clipBox.min.x, _clipBox.max.y - _clipBox.min.y );
  */

		calculateLights();

		for (var e = 0, el = _elements.length; e < el; e++) {

			var element = _elements[e];

			var material = element.material;

			if (material === undefined || material.opacity === 0) continue;

			_elemBox.makeEmpty();

			if (element instanceof THREE.RenderableSprite) {

				_v1 = element;
				_v1.x *= _canvasWidthHalf;_v1.y *= _canvasHeightHalf;

				renderSprite(_v1, element, material);
			} else if (element instanceof THREE.RenderableLine) {

				_v1 = element.v1;_v2 = element.v2;

				_v1.positionScreen.x *= _canvasWidthHalf;_v1.positionScreen.y *= _canvasHeightHalf;
				_v2.positionScreen.x *= _canvasWidthHalf;_v2.positionScreen.y *= _canvasHeightHalf;

				_elemBox.setFromPoints([_v1.positionScreen, _v2.positionScreen]);

				if (_clipBox.intersectsBox(_elemBox) === true) {

					renderLine(_v1, _v2, element, material);
				}
			} else if (element instanceof THREE.RenderableFace) {

				_v1 = element.v1;_v2 = element.v2;_v3 = element.v3;

				if (_v1.positionScreen.z < -1 || _v1.positionScreen.z > 1) continue;
				if (_v2.positionScreen.z < -1 || _v2.positionScreen.z > 1) continue;
				if (_v3.positionScreen.z < -1 || _v3.positionScreen.z > 1) continue;

				_v1.positionScreen.x *= _canvasWidthHalf;_v1.positionScreen.y *= _canvasHeightHalf;
				_v2.positionScreen.x *= _canvasWidthHalf;_v2.positionScreen.y *= _canvasHeightHalf;
				_v3.positionScreen.x *= _canvasWidthHalf;_v3.positionScreen.y *= _canvasHeightHalf;

				if (material.overdraw > 0) {

					expand(_v1.positionScreen, _v2.positionScreen, material.overdraw);
					expand(_v2.positionScreen, _v3.positionScreen, material.overdraw);
					expand(_v3.positionScreen, _v1.positionScreen, material.overdraw);
				}

				_elemBox.setFromPoints([_v1.positionScreen, _v2.positionScreen, _v3.positionScreen]);

				if (_clipBox.intersectsBox(_elemBox) === true) {

					renderFace3(_v1, _v2, _v3, 0, 1, 2, element, material);
				}
			}

			/* DEBUG
   setLineWidth( 1 );
   setStrokeStyle( 'rgba( 0, 255, 0, 0.5 )' );
   _context.strokeRect( _elemBox.min.x, _elemBox.min.y, _elemBox.max.x - _elemBox.min.x, _elemBox.max.y - _elemBox.min.y );
   */

			_clearBox.union(_elemBox);
		}

		/* DEBUG
  setLineWidth( 1 );
  setStrokeStyle( 'rgba( 255, 0, 0, 0.5 )' );
  _context.strokeRect( _clearBox.min.x, _clearBox.min.y, _clearBox.max.x - _clearBox.min.x, _clearBox.max.y - _clearBox.min.y );
  */

		_context.setTransform(1, 0, 0, 1, 0, 0);
	};

	//

	function calculateLights() {

		_ambientLight.setRGB(0, 0, 0);
		_directionalLights.setRGB(0, 0, 0);
		_pointLights.setRGB(0, 0, 0);

		for (var l = 0, ll = _lights.length; l < ll; l++) {

			var light = _lights[l];
			var lightColor = light.color;

			if (light.isAmbientLight) {

				_ambientLight.add(lightColor);
			} else if (light.isDirectionalLight) {

				// for sprites

				_directionalLights.add(lightColor);
			} else if (light.isPointLight) {

				// for sprites

				_pointLights.add(lightColor);
			}
		}
	}

	function calculateLight(position, normal, color) {

		for (var l = 0, ll = _lights.length; l < ll; l++) {

			var light = _lights[l];

			_lightColor.copy(light.color);

			if (light.isDirectionalLight) {

				var lightPosition = _vector3.setFromMatrixPosition(light.matrixWorld).normalize();

				var amount = normal.dot(lightPosition);

				if (amount <= 0) continue;

				amount *= light.intensity;

				color.add(_lightColor.multiplyScalar(amount));
			} else if (light.isPointLight) {

				var lightPosition = _vector3.setFromMatrixPosition(light.matrixWorld);

				var amount = normal.dot(_vector3.subVectors(lightPosition, position).normalize());

				if (amount <= 0) continue;

				amount *= light.distance == 0 ? 1 : 1 - Math.min(position.distanceTo(lightPosition) / light.distance, 1);

				if (amount == 0) continue;

				amount *= light.intensity;

				color.add(_lightColor.multiplyScalar(amount));
			}
		}
	}

	function renderSprite(v1, element, material) {

		setOpacity(material.opacity);
		setBlending(material.blending);

		var scaleX = element.scale.x * _canvasWidthHalf;
		var scaleY = element.scale.y * _canvasHeightHalf;

		var dist = Math.sqrt(scaleX * scaleX + scaleY * scaleY); // allow for rotated sprite
		_elemBox.min.set(v1.x - dist, v1.y - dist);
		_elemBox.max.set(v1.x + dist, v1.y + dist);

		if (material.isSpriteMaterial) {

			var texture = material.map;

			if (texture !== null) {

				var pattern = _patterns[texture.id];

				if (pattern === undefined || pattern.version !== texture.version) {

					pattern = textureToPattern(texture);
					_patterns[texture.id] = pattern;
				}

				if (pattern.canvas !== undefined) {

					setFillStyle(pattern.canvas);

					var bitmap = texture.image;

					var ox = bitmap.width * texture.offset.x;
					var oy = bitmap.height * texture.offset.y;

					var sx = bitmap.width * texture.repeat.x;
					var sy = bitmap.height * texture.repeat.y;

					var cx = scaleX / sx;
					var cy = scaleY / sy;

					_context.save();
					_context.translate(v1.x, v1.y);
					if (material.rotation !== 0) _context.rotate(material.rotation);
					_context.translate(-scaleX / 2, -scaleY / 2);
					_context.scale(cx, cy);
					_context.translate(-ox, -oy);
					_context.fillRect(ox, oy, sx, sy);
					_context.restore();
				}
			} else {

				// no texture

				setFillStyle(material.color.getStyle());

				_context.save();
				_context.translate(v1.x, v1.y);
				if (material.rotation !== 0) _context.rotate(material.rotation);
				_context.scale(scaleX, -scaleY);
				_context.fillRect(-0.5, -0.5, 1, 1);
				_context.restore();
			}
		} else if (material.isSpriteCanvasMaterial) {

			setStrokeStyle(material.color.getStyle());
			setFillStyle(material.color.getStyle());

			_context.save();
			_context.translate(v1.x, v1.y);
			if (material.rotation !== 0) _context.rotate(material.rotation);
			_context.scale(scaleX, scaleY);

			material.program(_context);

			_context.restore();
		} else if (material.isPointsMaterial) {

			setFillStyle(material.color.getStyle());

			_context.save();
			_context.translate(v1.x, v1.y);
			if (material.rotation !== 0) _context.rotate(material.rotation);
			_context.scale(scaleX * material.size, -scaleY * material.size);
			_context.fillRect(-0.5, -0.5, 1, 1);
			_context.restore();
		}

		/* DEBUG
  setStrokeStyle( 'rgb(255,255,0)' );
  _context.beginPath();
  _context.moveTo( v1.x - 10, v1.y );
  _context.lineTo( v1.x + 10, v1.y );
  _context.moveTo( v1.x, v1.y - 10 );
  _context.lineTo( v1.x, v1.y + 10 );
  _context.stroke();
  */
	}

	function renderLine(v1, v2, element, material) {

		setOpacity(material.opacity);
		setBlending(material.blending);

		_context.beginPath();
		_context.moveTo(v1.positionScreen.x, v1.positionScreen.y);
		_context.lineTo(v2.positionScreen.x, v2.positionScreen.y);

		if (material.isLineBasicMaterial) {

			setLineWidth(material.linewidth);
			setLineCap(material.linecap);
			setLineJoin(material.linejoin);

			if (material.vertexColors !== THREE.VertexColors) {

				setStrokeStyle(material.color.getStyle());
			} else {

				var colorStyle1 = element.vertexColors[0].getStyle();
				var colorStyle2 = element.vertexColors[1].getStyle();

				if (colorStyle1 === colorStyle2) {

					setStrokeStyle(colorStyle1);
				} else {

					try {

						var grad = _context.createLinearGradient(v1.positionScreen.x, v1.positionScreen.y, v2.positionScreen.x, v2.positionScreen.y);
						grad.addColorStop(0, colorStyle1);
						grad.addColorStop(1, colorStyle2);
					} catch (exception) {

						grad = colorStyle1;
					}

					setStrokeStyle(grad);
				}
			}

			if (material.isLineDashedMaterial) {

				setLineDash([material.dashSize, material.gapSize]);
			}

			_context.stroke();
			_elemBox.expandByScalar(material.linewidth * 2);

			if (material.isLineDashedMaterial) {

				setLineDash([]);
			}
		}
	}

	function renderFace3(v1, v2, v3, uv1, uv2, uv3, element, material) {

		_this.info.render.vertices += 3;
		_this.info.render.faces++;

		setOpacity(material.opacity);
		setBlending(material.blending);

		_v1x = v1.positionScreen.x;_v1y = v1.positionScreen.y;
		_v2x = v2.positionScreen.x;_v2y = v2.positionScreen.y;
		_v3x = v3.positionScreen.x;_v3y = v3.positionScreen.y;

		drawTriangle(_v1x, _v1y, _v2x, _v2y, _v3x, _v3y);

		if ((material.isMeshLambertMaterial || material.isMeshPhongMaterial || material.isMeshStandardMaterial) && material.map === null) {

			_diffuseColor.copy(material.color);
			_emissiveColor.copy(material.emissive);

			if (material.vertexColors === THREE.FaceColors) {

				_diffuseColor.multiply(element.color);
			}

			_color.copy(_ambientLight);

			_centroid.copy(v1.positionWorld).add(v2.positionWorld).add(v3.positionWorld).divideScalar(3);

			calculateLight(_centroid, element.normalModel, _color);

			_color.multiply(_diffuseColor).add(_emissiveColor);

			material.wireframe === true ? strokePath(_color, material.wireframeLinewidth, material.wireframeLinecap, material.wireframeLinejoin) : fillPath(_color);
		} else if (material.isMeshBasicMaterial || material.isMeshLambertMaterial || material.isMeshPhongMaterial || material.isMeshStandardMaterial) {

			if (material.map !== null) {

				var mapping = material.map.mapping;

				if (mapping === THREE.UVMapping) {

					_uvs = element.uvs;
					patternPath(_v1x, _v1y, _v2x, _v2y, _v3x, _v3y, _uvs[uv1].x, _uvs[uv1].y, _uvs[uv2].x, _uvs[uv2].y, _uvs[uv3].x, _uvs[uv3].y, material.map);
				}
			} else if (material.envMap !== null) {

				if (material.envMap.mapping === THREE.SphericalReflectionMapping) {

					_normal.copy(element.vertexNormalsModel[uv1]).applyMatrix3(_normalViewMatrix);
					_uv1x = 0.5 * _normal.x + 0.5;
					_uv1y = 0.5 * _normal.y + 0.5;

					_normal.copy(element.vertexNormalsModel[uv2]).applyMatrix3(_normalViewMatrix);
					_uv2x = 0.5 * _normal.x + 0.5;
					_uv2y = 0.5 * _normal.y + 0.5;

					_normal.copy(element.vertexNormalsModel[uv3]).applyMatrix3(_normalViewMatrix);
					_uv3x = 0.5 * _normal.x + 0.5;
					_uv3y = 0.5 * _normal.y + 0.5;

					patternPath(_v1x, _v1y, _v2x, _v2y, _v3x, _v3y, _uv1x, _uv1y, _uv2x, _uv2y, _uv3x, _uv3y, material.envMap);
				}
			} else {

				_color.copy(material.color);

				if (material.vertexColors === THREE.FaceColors) {

					_color.multiply(element.color);
				}

				material.wireframe === true ? strokePath(_color, material.wireframeLinewidth, material.wireframeLinecap, material.wireframeLinejoin) : fillPath(_color);
			}
		} else if (material.isMeshNormalMaterial) {

			_normal.copy(element.normalModel).applyMatrix3(_normalViewMatrix);

			_color.setRGB(_normal.x, _normal.y, _normal.z).multiplyScalar(0.5).addScalar(0.5);

			material.wireframe === true ? strokePath(_color, material.wireframeLinewidth, material.wireframeLinecap, material.wireframeLinejoin) : fillPath(_color);
		} else {

			_color.setRGB(1, 1, 1);

			material.wireframe === true ? strokePath(_color, material.wireframeLinewidth, material.wireframeLinecap, material.wireframeLinejoin) : fillPath(_color);
		}
	}

	//

	function drawTriangle(x0, y0, x1, y1, x2, y2) {

		_context.beginPath();
		_context.moveTo(x0, y0);
		_context.lineTo(x1, y1);
		_context.lineTo(x2, y2);
		_context.closePath();
	}

	function strokePath(color, linewidth, linecap, linejoin) {

		setLineWidth(linewidth);
		setLineCap(linecap);
		setLineJoin(linejoin);
		setStrokeStyle(color.getStyle());

		_context.stroke();

		_elemBox.expandByScalar(linewidth * 2);
	}

	function fillPath(color) {

		setFillStyle(color.getStyle());
		_context.fill();
	}

	function textureToPattern(texture) {

		if (texture.version === 0 || texture instanceof THREE.CompressedTexture || texture instanceof THREE.DataTexture) {

			return {
				canvas: undefined,
				version: texture.version
			};
		}

		var image = texture.image;

		if (image.complete === false) {

			return {
				canvas: undefined,
				version: 0
			};
		}

		var repeatX = texture.wrapS === THREE.RepeatWrapping || texture.wrapS === THREE.MirroredRepeatWrapping;
		var repeatY = texture.wrapT === THREE.RepeatWrapping || texture.wrapT === THREE.MirroredRepeatWrapping;

		var mirrorX = texture.wrapS === THREE.MirroredRepeatWrapping;
		var mirrorY = texture.wrapT === THREE.MirroredRepeatWrapping;

		//

		var canvas = document.createElement('canvas');
		canvas.width = image.width * (mirrorX ? 2 : 1);
		canvas.height = image.height * (mirrorY ? 2 : 1);

		var context = canvas.getContext('2d');
		context.setTransform(1, 0, 0, -1, 0, image.height);
		context.drawImage(image, 0, 0);

		if (mirrorX === true) {

			context.setTransform(-1, 0, 0, -1, image.width, image.height);
			context.drawImage(image, -image.width, 0);
		}

		if (mirrorY === true) {

			context.setTransform(1, 0, 0, 1, 0, 0);
			context.drawImage(image, 0, image.height);
		}

		if (mirrorX === true && mirrorY === true) {

			context.setTransform(-1, 0, 0, 1, image.width, 0);
			context.drawImage(image, -image.width, image.height);
		}

		var repeat = 'no-repeat';

		if (repeatX === true && repeatY === true) {

			repeat = 'repeat';
		} else if (repeatX === true) {

			repeat = 'repeat-x';
		} else if (repeatY === true) {

			repeat = 'repeat-y';
		}

		var pattern = _context.createPattern(canvas, repeat);

		if (texture.onUpdate) texture.onUpdate(texture);

		return {
			canvas: pattern,
			version: texture.version
		};
	}

	function patternPath(x0, y0, x1, y1, x2, y2, u0, v0, u1, v1, u2, v2, texture) {

		var pattern = _patterns[texture.id];

		if (pattern === undefined || pattern.version !== texture.version) {

			pattern = textureToPattern(texture);
			_patterns[texture.id] = pattern;
		}

		if (pattern.canvas !== undefined) {

			setFillStyle(pattern.canvas);
		} else {

			setFillStyle('rgba( 0, 0, 0, 1)');
			_context.fill();
			return;
		}

		// http://extremelysatisfactorytotalitarianism.com/blog/?p=2120

		var a,
		    b,
		    c,
		    d,
		    e,
		    f,
		    det,
		    idet,
		    offsetX = texture.offset.x / texture.repeat.x,
		    offsetY = texture.offset.y / texture.repeat.y,
		    width = texture.image.width * texture.repeat.x,
		    height = texture.image.height * texture.repeat.y;

		u0 = (u0 + offsetX) * width;
		v0 = (v0 + offsetY) * height;

		u1 = (u1 + offsetX) * width;
		v1 = (v1 + offsetY) * height;

		u2 = (u2 + offsetX) * width;
		v2 = (v2 + offsetY) * height;

		x1 -= x0;y1 -= y0;
		x2 -= x0;y2 -= y0;

		u1 -= u0;v1 -= v0;
		u2 -= u0;v2 -= v0;

		det = u1 * v2 - u2 * v1;

		if (det === 0) return;

		idet = 1 / det;

		a = (v2 * x1 - v1 * x2) * idet;
		b = (v2 * y1 - v1 * y2) * idet;
		c = (u1 * x2 - u2 * x1) * idet;
		d = (u1 * y2 - u2 * y1) * idet;

		e = x0 - a * u0 - c * v0;
		f = y0 - b * u0 - d * v0;

		_context.save();
		_context.transform(a, b, c, d, e, f);
		_context.fill();
		_context.restore();
	}

	/*
 function clipImage( x0, y0, x1, y1, x2, y2, u0, v0, u1, v1, u2, v2, image ) {
 		// http://extremelysatisfactorytotalitarianism.com/blog/?p=2120
 		var a, b, c, d, e, f, det, idet,
 	width = image.width - 1,
 	height = image.height - 1;
 		u0 *= width; v0 *= height;
 	u1 *= width; v1 *= height;
 	u2 *= width; v2 *= height;
 		x1 -= x0; y1 -= y0;
 	x2 -= x0; y2 -= y0;
 		u1 -= u0; v1 -= v0;
 	u2 -= u0; v2 -= v0;
 		det = u1 * v2 - u2 * v1;
 		idet = 1 / det;
 		a = ( v2 * x1 - v1 * x2 ) * idet;
 	b = ( v2 * y1 - v1 * y2 ) * idet;
 	c = ( u1 * x2 - u2 * x1 ) * idet;
 	d = ( u1 * y2 - u2 * y1 ) * idet;
 		e = x0 - a * u0 - c * v0;
 	f = y0 - b * u0 - d * v0;
 		_context.save();
 	_context.transform( a, b, c, d, e, f );
 	_context.clip();
 	_context.drawImage( image, 0, 0 );
 	_context.restore();
 	}
 */

	// Hide anti-alias gaps

	function expand(v1, v2, pixels) {

		var x = v2.x - v1.x,
		    y = v2.y - v1.y,
		    det = x * x + y * y,
		    idet;

		if (det === 0) return;

		idet = pixels / Math.sqrt(det);

		x *= idet;y *= idet;

		v2.x += x;v2.y += y;
		v1.x -= x;v1.y -= y;
	}

	// Context cached methods.

	function setOpacity(value) {

		if (_contextGlobalAlpha !== value) {

			_context.globalAlpha = value;
			_contextGlobalAlpha = value;
		}
	}

	function setBlending(value) {

		if (_contextGlobalCompositeOperation !== value) {

			if (value === THREE.NormalBlending) {

				_context.globalCompositeOperation = 'source-over';
			} else if (value === THREE.AdditiveBlending) {

				_context.globalCompositeOperation = 'lighter';
			} else if (value === THREE.SubtractiveBlending) {

				_context.globalCompositeOperation = 'darker';
			} else if (value === THREE.MultiplyBlending) {

				_context.globalCompositeOperation = 'multiply';
			}

			_contextGlobalCompositeOperation = value;
		}
	}

	function setLineWidth(value) {

		if (_contextLineWidth !== value) {

			_context.lineWidth = value;
			_contextLineWidth = value;
		}
	}

	function setLineCap(value) {

		// "butt", "round", "square"

		if (_contextLineCap !== value) {

			_context.lineCap = value;
			_contextLineCap = value;
		}
	}

	function setLineJoin(value) {

		// "round", "bevel", "miter"

		if (_contextLineJoin !== value) {

			_context.lineJoin = value;
			_contextLineJoin = value;
		}
	}

	function setStrokeStyle(value) {

		if (_contextStrokeStyle !== value) {

			_context.strokeStyle = value;
			_contextStrokeStyle = value;
		}
	}

	function setFillStyle(value) {

		if (_contextFillStyle !== value) {

			_context.fillStyle = value;
			_contextFillStyle = value;
		}
	}

	function setLineDash(value) {

		if (_contextLineDash.length !== value.length) {

			_context.setLineDash(value);
			_contextLineDash = value;
		}
	}
};

/**
 * @author mrdoob / http://mrdoob.com/
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author julianwa / https://github.com/julianwa
 */

THREE.RenderableObject = function () {

	this.id = 0;

	this.object = null;
	this.z = 0;
	this.renderOrder = 0;
};

//

THREE.RenderableFace = function () {

	this.id = 0;

	this.v1 = new THREE.RenderableVertex();
	this.v2 = new THREE.RenderableVertex();
	this.v3 = new THREE.RenderableVertex();

	this.normalModel = new THREE.Vector3();

	this.vertexNormalsModel = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
	this.vertexNormalsLength = 0;

	this.color = new THREE.Color();
	this.material = null;
	this.uvs = [new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2()];

	this.z = 0;
	this.renderOrder = 0;
};

//

THREE.RenderableVertex = function () {

	this.position = new THREE.Vector3();
	this.positionWorld = new THREE.Vector3();
	this.positionScreen = new THREE.Vector4();

	this.visible = true;
};

THREE.RenderableVertex.prototype.copy = function (vertex) {

	this.positionWorld.copy(vertex.positionWorld);
	this.positionScreen.copy(vertex.positionScreen);
};

//

THREE.RenderableLine = function () {

	this.id = 0;

	this.v1 = new THREE.RenderableVertex();
	this.v2 = new THREE.RenderableVertex();

	this.vertexColors = [new THREE.Color(), new THREE.Color()];
	this.material = null;

	this.z = 0;
	this.renderOrder = 0;
};

//

THREE.RenderableSprite = function () {

	this.id = 0;

	this.object = null;

	this.x = 0;
	this.y = 0;
	this.z = 0;

	this.rotation = 0;
	this.scale = new THREE.Vector2();

	this.material = null;
	this.renderOrder = 0;
};

//

THREE.Projector = function () {

	var _object,
	    _objectCount,
	    _objectPool = [],
	    _objectPoolLength = 0,
	    _vertex,
	    _vertexCount,
	    _vertexPool = [],
	    _vertexPoolLength = 0,
	    _face,
	    _faceCount,
	    _facePool = [],
	    _facePoolLength = 0,
	    _line,
	    _lineCount,
	    _linePool = [],
	    _linePoolLength = 0,
	    _sprite,
	    _spriteCount,
	    _spritePool = [],
	    _spritePoolLength = 0,
	    _renderData = { objects: [], lights: [], elements: [] },
	    _vector3 = new THREE.Vector3(),
	    _vector4 = new THREE.Vector4(),
	    _clipBox = new THREE.Box3(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1)),
	    _boundingBox = new THREE.Box3(),
	    _points3 = new Array(3),
	    _viewMatrix = new THREE.Matrix4(),
	    _viewProjectionMatrix = new THREE.Matrix4(),
	    _modelMatrix,
	    _modelViewProjectionMatrix = new THREE.Matrix4(),
	    _normalMatrix = new THREE.Matrix3(),
	    _frustum = new THREE.Frustum(),
	    _clippedVertex1PositionScreen = new THREE.Vector4(),
	    _clippedVertex2PositionScreen = new THREE.Vector4();

	//

	this.projectVector = function (vector, camera) {

		console.warn('THREE.Projector: .projectVector() is now vector.project().');
		vector.project(camera);
	};

	this.unprojectVector = function (vector, camera) {

		console.warn('THREE.Projector: .unprojectVector() is now vector.unproject().');
		vector.unproject(camera);
	};

	this.pickingRay = function () {

		console.error('THREE.Projector: .pickingRay() is now raycaster.setFromCamera().');
	};

	//

	var RenderList = function RenderList() {

		var normals = [];
		var colors = [];
		var uvs = [];

		var object = null;
		var material = null;

		var normalMatrix = new THREE.Matrix3();

		function setObject(value) {

			object = value;
			material = object.material;

			normalMatrix.getNormalMatrix(object.matrixWorld);

			normals.length = 0;
			colors.length = 0;
			uvs.length = 0;
		}

		function projectVertex(vertex) {

			var position = vertex.position;
			var positionWorld = vertex.positionWorld;
			var positionScreen = vertex.positionScreen;

			positionWorld.copy(position).applyMatrix4(_modelMatrix);
			positionScreen.copy(positionWorld).applyMatrix4(_viewProjectionMatrix);

			var invW = 1 / positionScreen.w;

			positionScreen.x *= invW;
			positionScreen.y *= invW;
			positionScreen.z *= invW;

			vertex.visible = positionScreen.x >= -1 && positionScreen.x <= 1 && positionScreen.y >= -1 && positionScreen.y <= 1 && positionScreen.z >= -1 && positionScreen.z <= 1;
		}

		function pushVertex(x, y, z) {

			_vertex = getNextVertexInPool();
			_vertex.position.set(x, y, z);

			projectVertex(_vertex);
		}

		function pushNormal(x, y, z) {

			normals.push(x, y, z);
		}

		function pushColor(r, g, b) {

			colors.push(r, g, b);
		}

		function pushUv(x, y) {

			uvs.push(x, y);
		}

		function checkTriangleVisibility(v1, v2, v3) {

			if (v1.visible === true || v2.visible === true || v3.visible === true) return true;

			_points3[0] = v1.positionScreen;
			_points3[1] = v2.positionScreen;
			_points3[2] = v3.positionScreen;

			return _clipBox.intersectsBox(_boundingBox.setFromPoints(_points3));
		}

		function checkBackfaceCulling(v1, v2, v3) {

			return (v3.positionScreen.x - v1.positionScreen.x) * (v2.positionScreen.y - v1.positionScreen.y) - (v3.positionScreen.y - v1.positionScreen.y) * (v2.positionScreen.x - v1.positionScreen.x) < 0;
		}

		function pushLine(a, b) {

			var v1 = _vertexPool[a];
			var v2 = _vertexPool[b];

			// Clip

			v1.positionScreen.copy(v1.position).applyMatrix4(_modelViewProjectionMatrix);
			v2.positionScreen.copy(v2.position).applyMatrix4(_modelViewProjectionMatrix);

			if (clipLine(v1.positionScreen, v2.positionScreen) === true) {

				// Perform the perspective divide
				v1.positionScreen.multiplyScalar(1 / v1.positionScreen.w);
				v2.positionScreen.multiplyScalar(1 / v2.positionScreen.w);

				_line = getNextLineInPool();
				_line.id = object.id;
				_line.v1.copy(v1);
				_line.v2.copy(v2);
				_line.z = Math.max(v1.positionScreen.z, v2.positionScreen.z);
				_line.renderOrder = object.renderOrder;

				_line.material = object.material;

				if (object.material.vertexColors === THREE.VertexColors) {

					_line.vertexColors[0].fromArray(colors, a * 3);
					_line.vertexColors[1].fromArray(colors, b * 3);
				}

				_renderData.elements.push(_line);
			}
		}

		function pushTriangle(a, b, c) {

			var v1 = _vertexPool[a];
			var v2 = _vertexPool[b];
			var v3 = _vertexPool[c];

			if (checkTriangleVisibility(v1, v2, v3) === false) return;

			if (material.side === THREE.DoubleSide || checkBackfaceCulling(v1, v2, v3) === true) {

				_face = getNextFaceInPool();

				_face.id = object.id;
				_face.v1.copy(v1);
				_face.v2.copy(v2);
				_face.v3.copy(v3);
				_face.z = (v1.positionScreen.z + v2.positionScreen.z + v3.positionScreen.z) / 3;
				_face.renderOrder = object.renderOrder;

				// use first vertex normal as face normal

				_face.normalModel.fromArray(normals, a * 3);
				_face.normalModel.applyMatrix3(normalMatrix).normalize();

				for (var i = 0; i < 3; i++) {

					var normal = _face.vertexNormalsModel[i];
					normal.fromArray(normals, arguments[i] * 3);
					normal.applyMatrix3(normalMatrix).normalize();

					var uv = _face.uvs[i];
					uv.fromArray(uvs, arguments[i] * 2);
				}

				_face.vertexNormalsLength = 3;

				_face.material = object.material;

				_renderData.elements.push(_face);
			}
		}

		return {
			setObject: setObject,
			projectVertex: projectVertex,
			checkTriangleVisibility: checkTriangleVisibility,
			checkBackfaceCulling: checkBackfaceCulling,
			pushVertex: pushVertex,
			pushNormal: pushNormal,
			pushColor: pushColor,
			pushUv: pushUv,
			pushLine: pushLine,
			pushTriangle: pushTriangle
		};
	};

	var renderList = new RenderList();

	function projectObject(object) {

		if (object.visible === false) return;

		if (object instanceof THREE.Light) {

			_renderData.lights.push(object);
		} else if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {

			if (object.material.visible === false) return;
			if (object.frustumCulled === true && _frustum.intersectsObject(object) === false) return;

			addObject(object);
		} else if (object instanceof THREE.Sprite) {

			if (object.material.visible === false) return;
			if (object.frustumCulled === true && _frustum.intersectsSprite(object) === false) return;

			addObject(object);
		}

		var children = object.children;

		for (var i = 0, l = children.length; i < l; i++) {

			projectObject(children[i]);
		}
	}

	function addObject(object) {

		_object = getNextObjectInPool();
		_object.id = object.id;
		_object.object = object;

		_vector3.setFromMatrixPosition(object.matrixWorld);
		_vector3.applyMatrix4(_viewProjectionMatrix);
		_object.z = _vector3.z;
		_object.renderOrder = object.renderOrder;

		_renderData.objects.push(_object);
	}

	this.projectScene = function (scene, camera, sortObjects, sortElements) {

		_faceCount = 0;
		_lineCount = 0;
		_spriteCount = 0;

		_renderData.elements.length = 0;

		if (scene.autoUpdate === true) scene.updateMatrixWorld();
		if (camera.parent === null) camera.updateMatrixWorld();

		_viewMatrix.copy(camera.matrixWorldInverse);
		_viewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, _viewMatrix);

		_frustum.setFromMatrix(_viewProjectionMatrix);

		//

		_objectCount = 0;

		_renderData.objects.length = 0;
		_renderData.lights.length = 0;

		projectObject(scene);

		if (sortObjects === true) {

			_renderData.objects.sort(painterSort);
		}

		//

		var objects = _renderData.objects;

		for (var o = 0, ol = objects.length; o < ol; o++) {

			var object = objects[o].object;
			var geometry = object.geometry;

			renderList.setObject(object);

			_modelMatrix = object.matrixWorld;

			_vertexCount = 0;

			if (object instanceof THREE.Mesh) {

				if (geometry instanceof THREE.BufferGeometry) {

					var attributes = geometry.attributes;
					var groups = geometry.groups;

					if (attributes.position === undefined) continue;

					var positions = attributes.position.array;

					for (var i = 0, l = positions.length; i < l; i += 3) {

						renderList.pushVertex(positions[i], positions[i + 1], positions[i + 2]);
					}

					if (attributes.normal !== undefined) {

						var normals = attributes.normal.array;

						for (var i = 0, l = normals.length; i < l; i += 3) {

							renderList.pushNormal(normals[i], normals[i + 1], normals[i + 2]);
						}
					}

					if (attributes.uv !== undefined) {

						var uvs = attributes.uv.array;

						for (var i = 0, l = uvs.length; i < l; i += 2) {

							renderList.pushUv(uvs[i], uvs[i + 1]);
						}
					}

					if (geometry.index !== null) {

						var indices = geometry.index.array;

						if (groups.length > 0) {

							for (var g = 0; g < groups.length; g++) {

								var group = groups[g];

								for (var i = group.start, l = group.start + group.count; i < l; i += 3) {

									renderList.pushTriangle(indices[i], indices[i + 1], indices[i + 2]);
								}
							}
						} else {

							for (var i = 0, l = indices.length; i < l; i += 3) {

								renderList.pushTriangle(indices[i], indices[i + 1], indices[i + 2]);
							}
						}
					} else {

						for (var i = 0, l = positions.length / 3; i < l; i += 3) {

							renderList.pushTriangle(i, i + 1, i + 2);
						}
					}
				} else if (geometry instanceof THREE.Geometry) {

					var vertices = geometry.vertices;
					var faces = geometry.faces;
					var faceVertexUvs = geometry.faceVertexUvs[0];

					_normalMatrix.getNormalMatrix(_modelMatrix);

					var material = object.material;

					var isMultiMaterial = Array.isArray(material);

					for (var v = 0, vl = vertices.length; v < vl; v++) {

						var vertex = vertices[v];

						_vector3.copy(vertex);

						if (material.morphTargets === true) {

							var morphTargets = geometry.morphTargets;
							var morphInfluences = object.morphTargetInfluences;

							for (var t = 0, tl = morphTargets.length; t < tl; t++) {

								var influence = morphInfluences[t];

								if (influence === 0) continue;

								var target = morphTargets[t];
								var targetVertex = target.vertices[v];

								_vector3.x += (targetVertex.x - vertex.x) * influence;
								_vector3.y += (targetVertex.y - vertex.y) * influence;
								_vector3.z += (targetVertex.z - vertex.z) * influence;
							}
						}

						renderList.pushVertex(_vector3.x, _vector3.y, _vector3.z);
					}

					for (var f = 0, fl = faces.length; f < fl; f++) {

						var face = faces[f];

						material = isMultiMaterial === true ? object.material[face.materialIndex] : object.material;

						if (material === undefined) continue;

						var side = material.side;

						var v1 = _vertexPool[face.a];
						var v2 = _vertexPool[face.b];
						var v3 = _vertexPool[face.c];

						if (renderList.checkTriangleVisibility(v1, v2, v3) === false) continue;

						var visible = renderList.checkBackfaceCulling(v1, v2, v3);

						if (side !== THREE.DoubleSide) {

							if (side === THREE.FrontSide && visible === false) continue;
							if (side === THREE.BackSide && visible === true) continue;
						}

						_face = getNextFaceInPool();

						_face.id = object.id;
						_face.v1.copy(v1);
						_face.v2.copy(v2);
						_face.v3.copy(v3);

						_face.normalModel.copy(face.normal);

						if (visible === false && (side === THREE.BackSide || side === THREE.DoubleSide)) {

							_face.normalModel.negate();
						}

						_face.normalModel.applyMatrix3(_normalMatrix).normalize();

						var faceVertexNormals = face.vertexNormals;

						for (var n = 0, nl = Math.min(faceVertexNormals.length, 3); n < nl; n++) {

							var normalModel = _face.vertexNormalsModel[n];
							normalModel.copy(faceVertexNormals[n]);

							if (visible === false && (side === THREE.BackSide || side === THREE.DoubleSide)) {

								normalModel.negate();
							}

							normalModel.applyMatrix3(_normalMatrix).normalize();
						}

						_face.vertexNormalsLength = faceVertexNormals.length;

						var vertexUvs = faceVertexUvs[f];

						if (vertexUvs !== undefined) {

							for (var u = 0; u < 3; u++) {

								_face.uvs[u].copy(vertexUvs[u]);
							}
						}

						_face.color = face.color;
						_face.material = material;

						_face.z = (v1.positionScreen.z + v2.positionScreen.z + v3.positionScreen.z) / 3;
						_face.renderOrder = object.renderOrder;

						_renderData.elements.push(_face);
					}
				}
			} else if (object instanceof THREE.Line) {

				_modelViewProjectionMatrix.multiplyMatrices(_viewProjectionMatrix, _modelMatrix);

				if (geometry instanceof THREE.BufferGeometry) {

					var attributes = geometry.attributes;

					if (attributes.position !== undefined) {

						var positions = attributes.position.array;

						for (var i = 0, l = positions.length; i < l; i += 3) {

							renderList.pushVertex(positions[i], positions[i + 1], positions[i + 2]);
						}

						if (attributes.color !== undefined) {

							var colors = attributes.color.array;

							for (var i = 0, l = colors.length; i < l; i += 3) {

								renderList.pushColor(colors[i], colors[i + 1], colors[i + 2]);
							}
						}

						if (geometry.index !== null) {

							var indices = geometry.index.array;

							for (var i = 0, l = indices.length; i < l; i += 2) {

								renderList.pushLine(indices[i], indices[i + 1]);
							}
						} else {

							var step = object instanceof THREE.LineSegments ? 2 : 1;

							for (var i = 0, l = positions.length / 3 - 1; i < l; i += step) {

								renderList.pushLine(i, i + 1);
							}
						}
					}
				} else if (geometry instanceof THREE.Geometry) {

					var vertices = object.geometry.vertices;

					if (vertices.length === 0) continue;

					v1 = getNextVertexInPool();
					v1.positionScreen.copy(vertices[0]).applyMatrix4(_modelViewProjectionMatrix);

					var step = object instanceof THREE.LineSegments ? 2 : 1;

					for (var v = 1, vl = vertices.length; v < vl; v++) {

						v1 = getNextVertexInPool();
						v1.positionScreen.copy(vertices[v]).applyMatrix4(_modelViewProjectionMatrix);

						if ((v + 1) % step > 0) continue;

						v2 = _vertexPool[_vertexCount - 2];

						_clippedVertex1PositionScreen.copy(v1.positionScreen);
						_clippedVertex2PositionScreen.copy(v2.positionScreen);

						if (clipLine(_clippedVertex1PositionScreen, _clippedVertex2PositionScreen) === true) {

							// Perform the perspective divide
							_clippedVertex1PositionScreen.multiplyScalar(1 / _clippedVertex1PositionScreen.w);
							_clippedVertex2PositionScreen.multiplyScalar(1 / _clippedVertex2PositionScreen.w);

							_line = getNextLineInPool();

							_line.id = object.id;
							_line.v1.positionScreen.copy(_clippedVertex1PositionScreen);
							_line.v2.positionScreen.copy(_clippedVertex2PositionScreen);

							_line.z = Math.max(_clippedVertex1PositionScreen.z, _clippedVertex2PositionScreen.z);
							_line.renderOrder = object.renderOrder;

							_line.material = object.material;

							if (object.material.vertexColors === THREE.VertexColors) {

								_line.vertexColors[0].copy(object.geometry.colors[v]);
								_line.vertexColors[1].copy(object.geometry.colors[v - 1]);
							}

							_renderData.elements.push(_line);
						}
					}
				}
			} else if (object instanceof THREE.Points) {

				_modelViewProjectionMatrix.multiplyMatrices(_viewProjectionMatrix, _modelMatrix);

				if (geometry instanceof THREE.Geometry) {

					var vertices = object.geometry.vertices;

					for (var v = 0, vl = vertices.length; v < vl; v++) {

						var vertex = vertices[v];

						_vector4.set(vertex.x, vertex.y, vertex.z, 1);
						_vector4.applyMatrix4(_modelViewProjectionMatrix);

						pushPoint(_vector4, object, camera);
					}
				} else if (geometry instanceof THREE.BufferGeometry) {

					var attributes = geometry.attributes;

					if (attributes.position !== undefined) {

						var positions = attributes.position.array;

						for (var i = 0, l = positions.length; i < l; i += 3) {

							_vector4.set(positions[i], positions[i + 1], positions[i + 2], 1);
							_vector4.applyMatrix4(_modelViewProjectionMatrix);

							pushPoint(_vector4, object, camera);
						}
					}
				}
			} else if (object instanceof THREE.Sprite) {

				_vector4.set(_modelMatrix.elements[12], _modelMatrix.elements[13], _modelMatrix.elements[14], 1);
				_vector4.applyMatrix4(_viewProjectionMatrix);

				pushPoint(_vector4, object, camera);
			}
		}

		if (sortElements === true) {

			_renderData.elements.sort(painterSort);
		}

		return _renderData;
	};

	function pushPoint(_vector4, object, camera) {

		var invW = 1 / _vector4.w;

		_vector4.z *= invW;

		if (_vector4.z >= -1 && _vector4.z <= 1) {

			_sprite = getNextSpriteInPool();
			_sprite.id = object.id;
			_sprite.x = _vector4.x * invW;
			_sprite.y = _vector4.y * invW;
			_sprite.z = _vector4.z;
			_sprite.renderOrder = object.renderOrder;
			_sprite.object = object;

			_sprite.rotation = object.rotation;

			_sprite.scale.x = object.scale.x * Math.abs(_sprite.x - (_vector4.x + camera.projectionMatrix.elements[0]) / (_vector4.w + camera.projectionMatrix.elements[12]));
			_sprite.scale.y = object.scale.y * Math.abs(_sprite.y - (_vector4.y + camera.projectionMatrix.elements[5]) / (_vector4.w + camera.projectionMatrix.elements[13]));

			_sprite.material = object.material;

			_renderData.elements.push(_sprite);
		}
	}

	// Pools

	function getNextObjectInPool() {

		if (_objectCount === _objectPoolLength) {

			var object = new THREE.RenderableObject();
			_objectPool.push(object);
			_objectPoolLength++;
			_objectCount++;
			return object;
		}

		return _objectPool[_objectCount++];
	}

	function getNextVertexInPool() {

		if (_vertexCount === _vertexPoolLength) {

			var vertex = new THREE.RenderableVertex();
			_vertexPool.push(vertex);
			_vertexPoolLength++;
			_vertexCount++;
			return vertex;
		}

		return _vertexPool[_vertexCount++];
	}

	function getNextFaceInPool() {

		if (_faceCount === _facePoolLength) {

			var face = new THREE.RenderableFace();
			_facePool.push(face);
			_facePoolLength++;
			_faceCount++;
			return face;
		}

		return _facePool[_faceCount++];
	}

	function getNextLineInPool() {

		if (_lineCount === _linePoolLength) {

			var line = new THREE.RenderableLine();
			_linePool.push(line);
			_linePoolLength++;
			_lineCount++;
			return line;
		}

		return _linePool[_lineCount++];
	}

	function getNextSpriteInPool() {

		if (_spriteCount === _spritePoolLength) {

			var sprite = new THREE.RenderableSprite();
			_spritePool.push(sprite);
			_spritePoolLength++;
			_spriteCount++;
			return sprite;
		}

		return _spritePool[_spriteCount++];
	}

	//

	function painterSort(a, b) {

		if (a.renderOrder !== b.renderOrder) {

			return a.renderOrder - b.renderOrder;
		} else if (a.z !== b.z) {

			return b.z - a.z;
		} else if (a.id !== b.id) {

			return a.id - b.id;
		} else {

			return 0;
		}
	}

	function clipLine(s1, s2) {

		var alpha1 = 0,
		    alpha2 = 1,


		// Calculate the boundary coordinate of each vertex for the near and far clip planes,
		// Z = -1 and Z = +1, respectively.

		bc1near = s1.z + s1.w,
		    bc2near = s2.z + s2.w,
		    bc1far = -s1.z + s1.w,
		    bc2far = -s2.z + s2.w;

		if (bc1near >= 0 && bc2near >= 0 && bc1far >= 0 && bc2far >= 0) {

			// Both vertices lie entirely within all clip planes.
			return true;
		} else if (bc1near < 0 && bc2near < 0 || bc1far < 0 && bc2far < 0) {

			// Both vertices lie entirely outside one of the clip planes.
			return false;
		} else {

			// The line segment spans at least one clip plane.

			if (bc1near < 0) {

				// v1 lies outside the near plane, v2 inside
				alpha1 = Math.max(alpha1, bc1near / (bc1near - bc2near));
			} else if (bc2near < 0) {

				// v2 lies outside the near plane, v1 inside
				alpha2 = Math.min(alpha2, bc1near / (bc1near - bc2near));
			}

			if (bc1far < 0) {

				// v1 lies outside the far plane, v2 inside
				alpha1 = Math.max(alpha1, bc1far / (bc1far - bc2far));
			} else if (bc2far < 0) {

				// v2 lies outside the far plane, v2 inside
				alpha2 = Math.min(alpha2, bc1far / (bc1far - bc2far));
			}

			if (alpha2 < alpha1) {

				// The line segment spans two boundaries, but is outside both of them.
				// (This can't happen when we're only clipping against just near/far but good
				//  to leave the check here for future usage if other clip planes are added.)
				return false;
			} else {

				// Update the s1 and s2 vertices to match the clipped line segment.
				s1.lerp(s2, alpha1);
				s2.lerp(s1, 1 - alpha2);

				return true;
			}
		}
	}
};
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpzL2NhbnZhcy1yZW5kZXJlci1hbmQtcHJvamVjdG9yLmpzIl0sIm5hbWVzIjpbImJnQ29sb3IiLCJUSFJFRSIsIlNwcml0ZUNhbnZhc01hdGVyaWFsIiwicGFyYW1ldGVycyIsIk1hdGVyaWFsIiwiY2FsbCIsInR5cGUiLCJjb2xvciIsIkNvbG9yIiwicHJvZ3JhbSIsInNldFZhbHVlcyIsInByb3RvdHlwZSIsIk9iamVjdCIsImNyZWF0ZSIsImNvbnN0cnVjdG9yIiwiaXNTcHJpdGVDYW52YXNNYXRlcmlhbCIsImNsb25lIiwibWF0ZXJpYWwiLCJjb3B5IiwiQ2FudmFzUmVuZGVyZXIiLCJjb25zb2xlIiwibG9nIiwiUkVWSVNJT04iLCJfdGhpcyIsIl9yZW5kZXJEYXRhIiwiX2VsZW1lbnRzIiwiX2xpZ2h0cyIsIl9wcm9qZWN0b3IiLCJQcm9qZWN0b3IiLCJfY2FudmFzIiwiY2FudmFzIiwidW5kZWZpbmVkIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiX2NhbnZhc1dpZHRoIiwid2lkdGgiLCJfY2FudmFzSGVpZ2h0IiwiaGVpZ2h0IiwiX2NhbnZhc1dpZHRoSGFsZiIsIk1hdGgiLCJmbG9vciIsIl9jYW52YXNIZWlnaHRIYWxmIiwiX3ZpZXdwb3J0WCIsIl92aWV3cG9ydFkiLCJfdmlld3BvcnRXaWR0aCIsIl92aWV3cG9ydEhlaWdodCIsIl9waXhlbFJhdGlvIiwiX2NvbnRleHQiLCJnZXRDb250ZXh0IiwiYWxwaGEiLCJfY2xlYXJDb2xvciIsIl9jbGVhckFscGhhIiwiX2NvbnRleHRHbG9iYWxBbHBoYSIsIl9jb250ZXh0R2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uIiwiX2NvbnRleHRTdHJva2VTdHlsZSIsIl9jb250ZXh0RmlsbFN0eWxlIiwiX2NvbnRleHRMaW5lV2lkdGgiLCJfY29udGV4dExpbmVDYXAiLCJfY29udGV4dExpbmVKb2luIiwiX2NvbnRleHRMaW5lRGFzaCIsIl92MSIsIl92MiIsIl92MyIsIl92MXgiLCJfdjF5IiwiX3YyeCIsIl92MnkiLCJfdjN4IiwiX3YzeSIsIl9jb2xvciIsIl9kaWZmdXNlQ29sb3IiLCJfZW1pc3NpdmVDb2xvciIsIl9saWdodENvbG9yIiwiX3BhdHRlcm5zIiwiX3V2cyIsIl91djF4IiwiX3V2MXkiLCJfdXYyeCIsIl91djJ5IiwiX3V2M3giLCJfdXYzeSIsIl9jbGlwQm94IiwiQm94MiIsIl9jbGVhckJveCIsIl9lbGVtQm94IiwiX2FtYmllbnRMaWdodCIsIl9kaXJlY3Rpb25hbExpZ2h0cyIsIl9wb2ludExpZ2h0cyIsIl92ZWN0b3IzIiwiVmVjdG9yMyIsIl9jZW50cm9pZCIsIl9ub3JtYWwiLCJfbm9ybWFsVmlld01hdHJpeCIsIk1hdHJpeDMiLCJzZXRMaW5lRGFzaCIsImRvbUVsZW1lbnQiLCJhdXRvQ2xlYXIiLCJzb3J0T2JqZWN0cyIsInNvcnRFbGVtZW50cyIsImluZm8iLCJyZW5kZXIiLCJ2ZXJ0aWNlcyIsImZhY2VzIiwiZ2V0Q29udGV4dEF0dHJpYnV0ZXMiLCJnZXRQaXhlbFJhdGlvIiwic2V0UGl4ZWxSYXRpbyIsInZhbHVlIiwic2V0U2l6ZSIsInVwZGF0ZVN0eWxlIiwic3R5bGUiLCJtaW4iLCJzZXQiLCJtYXgiLCJzZXRWaWV3cG9ydCIsIngiLCJ5Iiwic2V0U2Npc3NvciIsInNldFNjaXNzb3JUZXN0Iiwic2V0Q2xlYXJDb2xvciIsInNldENsZWFyQ29sb3JIZXgiLCJoZXgiLCJ3YXJuIiwiZ2V0Q2xlYXJDb2xvciIsImdldENsZWFyQWxwaGEiLCJnZXRNYXhBbmlzb3Ryb3B5IiwiY2xlYXIiLCJpc0VtcHR5IiwiaW50ZXJzZWN0IiwiZXhwYW5kQnlTY2FsYXIiLCJjbGVhclJlY3QiLCJzZXRPcGFjaXR5Iiwic2V0QmxlbmRpbmciLCJOb3JtYWxCbGVuZGluZyIsInNldEZpbGxTdHlsZSIsInIiLCJnIiwiYiIsImZpbGxSZWN0IiwibWFrZUVtcHR5IiwiY2xlYXJDb2xvciIsImNsZWFyRGVwdGgiLCJjbGVhclN0ZW5jaWwiLCJzY2VuZSIsImNhbWVyYSIsImlzQ2FtZXJhIiwiZXJyb3IiLCJiYWNrZ3JvdW5kIiwiaXNDb2xvciIsImdldFN0eWxlIiwic2V0VHJhbnNmb3JtIiwidHJhbnNsYXRlIiwicHJvamVjdFNjZW5lIiwiZWxlbWVudHMiLCJsaWdodHMiLCJnZXROb3JtYWxNYXRyaXgiLCJtYXRyaXhXb3JsZEludmVyc2UiLCJjYWxjdWxhdGVMaWdodHMiLCJlIiwiZWwiLCJsZW5ndGgiLCJlbGVtZW50Iiwib3BhY2l0eSIsIlJlbmRlcmFibGVTcHJpdGUiLCJyZW5kZXJTcHJpdGUiLCJSZW5kZXJhYmxlTGluZSIsInYxIiwidjIiLCJwb3NpdGlvblNjcmVlbiIsInNldEZyb21Qb2ludHMiLCJpbnRlcnNlY3RzQm94IiwicmVuZGVyTGluZSIsIlJlbmRlcmFibGVGYWNlIiwidjMiLCJ6Iiwib3ZlcmRyYXciLCJleHBhbmQiLCJyZW5kZXJGYWNlMyIsInVuaW9uIiwic2V0UkdCIiwibCIsImxsIiwibGlnaHQiLCJsaWdodENvbG9yIiwiaXNBbWJpZW50TGlnaHQiLCJhZGQiLCJpc0RpcmVjdGlvbmFsTGlnaHQiLCJpc1BvaW50TGlnaHQiLCJjYWxjdWxhdGVMaWdodCIsInBvc2l0aW9uIiwibm9ybWFsIiwibGlnaHRQb3NpdGlvbiIsInNldEZyb21NYXRyaXhQb3NpdGlvbiIsIm1hdHJpeFdvcmxkIiwibm9ybWFsaXplIiwiYW1vdW50IiwiZG90IiwiaW50ZW5zaXR5IiwibXVsdGlwbHlTY2FsYXIiLCJzdWJWZWN0b3JzIiwiZGlzdGFuY2UiLCJkaXN0YW5jZVRvIiwiYmxlbmRpbmciLCJzY2FsZVgiLCJzY2FsZSIsInNjYWxlWSIsImRpc3QiLCJzcXJ0IiwiaXNTcHJpdGVNYXRlcmlhbCIsInRleHR1cmUiLCJtYXAiLCJwYXR0ZXJuIiwiaWQiLCJ2ZXJzaW9uIiwidGV4dHVyZVRvUGF0dGVybiIsImJpdG1hcCIsImltYWdlIiwib3giLCJvZmZzZXQiLCJveSIsInN4IiwicmVwZWF0Iiwic3kiLCJjeCIsImN5Iiwic2F2ZSIsInJvdGF0aW9uIiwicm90YXRlIiwicmVzdG9yZSIsInNldFN0cm9rZVN0eWxlIiwiaXNQb2ludHNNYXRlcmlhbCIsInNpemUiLCJiZWdpblBhdGgiLCJtb3ZlVG8iLCJsaW5lVG8iLCJpc0xpbmVCYXNpY01hdGVyaWFsIiwic2V0TGluZVdpZHRoIiwibGluZXdpZHRoIiwic2V0TGluZUNhcCIsImxpbmVjYXAiLCJzZXRMaW5lSm9pbiIsImxpbmVqb2luIiwidmVydGV4Q29sb3JzIiwiVmVydGV4Q29sb3JzIiwiY29sb3JTdHlsZTEiLCJjb2xvclN0eWxlMiIsImdyYWQiLCJjcmVhdGVMaW5lYXJHcmFkaWVudCIsImFkZENvbG9yU3RvcCIsImV4Y2VwdGlvbiIsImlzTGluZURhc2hlZE1hdGVyaWFsIiwiZGFzaFNpemUiLCJnYXBTaXplIiwic3Ryb2tlIiwidXYxIiwidXYyIiwidXYzIiwiZHJhd1RyaWFuZ2xlIiwiaXNNZXNoTGFtYmVydE1hdGVyaWFsIiwiaXNNZXNoUGhvbmdNYXRlcmlhbCIsImlzTWVzaFN0YW5kYXJkTWF0ZXJpYWwiLCJlbWlzc2l2ZSIsIkZhY2VDb2xvcnMiLCJtdWx0aXBseSIsInBvc2l0aW9uV29ybGQiLCJkaXZpZGVTY2FsYXIiLCJub3JtYWxNb2RlbCIsIndpcmVmcmFtZSIsInN0cm9rZVBhdGgiLCJ3aXJlZnJhbWVMaW5ld2lkdGgiLCJ3aXJlZnJhbWVMaW5lY2FwIiwid2lyZWZyYW1lTGluZWpvaW4iLCJmaWxsUGF0aCIsImlzTWVzaEJhc2ljTWF0ZXJpYWwiLCJtYXBwaW5nIiwiVVZNYXBwaW5nIiwidXZzIiwicGF0dGVyblBhdGgiLCJlbnZNYXAiLCJTcGhlcmljYWxSZWZsZWN0aW9uTWFwcGluZyIsInZlcnRleE5vcm1hbHNNb2RlbCIsImFwcGx5TWF0cml4MyIsImlzTWVzaE5vcm1hbE1hdGVyaWFsIiwiYWRkU2NhbGFyIiwieDAiLCJ5MCIsIngxIiwieTEiLCJ4MiIsInkyIiwiY2xvc2VQYXRoIiwiZmlsbCIsIkNvbXByZXNzZWRUZXh0dXJlIiwiRGF0YVRleHR1cmUiLCJjb21wbGV0ZSIsInJlcGVhdFgiLCJ3cmFwUyIsIlJlcGVhdFdyYXBwaW5nIiwiTWlycm9yZWRSZXBlYXRXcmFwcGluZyIsInJlcGVhdFkiLCJ3cmFwVCIsIm1pcnJvclgiLCJtaXJyb3JZIiwiY29udGV4dCIsImRyYXdJbWFnZSIsImNyZWF0ZVBhdHRlcm4iLCJvblVwZGF0ZSIsInUwIiwidjAiLCJ1MSIsInUyIiwiYSIsImMiLCJkIiwiZiIsImRldCIsImlkZXQiLCJvZmZzZXRYIiwib2Zmc2V0WSIsInRyYW5zZm9ybSIsInBpeGVscyIsImdsb2JhbEFscGhhIiwiZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uIiwiQWRkaXRpdmVCbGVuZGluZyIsIlN1YnRyYWN0aXZlQmxlbmRpbmciLCJNdWx0aXBseUJsZW5kaW5nIiwibGluZVdpZHRoIiwibGluZUNhcCIsImxpbmVKb2luIiwic3Ryb2tlU3R5bGUiLCJmaWxsU3R5bGUiLCJSZW5kZXJhYmxlT2JqZWN0Iiwib2JqZWN0IiwicmVuZGVyT3JkZXIiLCJSZW5kZXJhYmxlVmVydGV4IiwidmVydGV4Tm9ybWFsc0xlbmd0aCIsIlZlY3RvcjIiLCJWZWN0b3I0IiwidmlzaWJsZSIsInZlcnRleCIsIl9vYmplY3QiLCJfb2JqZWN0Q291bnQiLCJfb2JqZWN0UG9vbCIsIl9vYmplY3RQb29sTGVuZ3RoIiwiX3ZlcnRleCIsIl92ZXJ0ZXhDb3VudCIsIl92ZXJ0ZXhQb29sIiwiX3ZlcnRleFBvb2xMZW5ndGgiLCJfZmFjZSIsIl9mYWNlQ291bnQiLCJfZmFjZVBvb2wiLCJfZmFjZVBvb2xMZW5ndGgiLCJfbGluZSIsIl9saW5lQ291bnQiLCJfbGluZVBvb2wiLCJfbGluZVBvb2xMZW5ndGgiLCJfc3ByaXRlIiwiX3Nwcml0ZUNvdW50IiwiX3Nwcml0ZVBvb2wiLCJfc3ByaXRlUG9vbExlbmd0aCIsIm9iamVjdHMiLCJfdmVjdG9yNCIsIkJveDMiLCJfYm91bmRpbmdCb3giLCJfcG9pbnRzMyIsIkFycmF5IiwiX3ZpZXdNYXRyaXgiLCJNYXRyaXg0IiwiX3ZpZXdQcm9qZWN0aW9uTWF0cml4IiwiX21vZGVsTWF0cml4IiwiX21vZGVsVmlld1Byb2plY3Rpb25NYXRyaXgiLCJfbm9ybWFsTWF0cml4IiwiX2ZydXN0dW0iLCJGcnVzdHVtIiwiX2NsaXBwZWRWZXJ0ZXgxUG9zaXRpb25TY3JlZW4iLCJfY2xpcHBlZFZlcnRleDJQb3NpdGlvblNjcmVlbiIsInByb2plY3RWZWN0b3IiLCJ2ZWN0b3IiLCJwcm9qZWN0IiwidW5wcm9qZWN0VmVjdG9yIiwidW5wcm9qZWN0IiwicGlja2luZ1JheSIsIlJlbmRlckxpc3QiLCJub3JtYWxzIiwiY29sb3JzIiwibm9ybWFsTWF0cml4Iiwic2V0T2JqZWN0IiwicHJvamVjdFZlcnRleCIsImFwcGx5TWF0cml4NCIsImludlciLCJ3IiwicHVzaFZlcnRleCIsImdldE5leHRWZXJ0ZXhJblBvb2wiLCJwdXNoTm9ybWFsIiwicHVzaCIsInB1c2hDb2xvciIsInB1c2hVdiIsImNoZWNrVHJpYW5nbGVWaXNpYmlsaXR5IiwiY2hlY2tCYWNrZmFjZUN1bGxpbmciLCJwdXNoTGluZSIsImNsaXBMaW5lIiwiZ2V0TmV4dExpbmVJblBvb2wiLCJmcm9tQXJyYXkiLCJwdXNoVHJpYW5nbGUiLCJzaWRlIiwiRG91YmxlU2lkZSIsImdldE5leHRGYWNlSW5Qb29sIiwiaSIsImFyZ3VtZW50cyIsInV2IiwicmVuZGVyTGlzdCIsInByb2plY3RPYmplY3QiLCJMaWdodCIsIk1lc2giLCJMaW5lIiwiUG9pbnRzIiwiZnJ1c3R1bUN1bGxlZCIsImludGVyc2VjdHNPYmplY3QiLCJhZGRPYmplY3QiLCJTcHJpdGUiLCJpbnRlcnNlY3RzU3ByaXRlIiwiY2hpbGRyZW4iLCJnZXROZXh0T2JqZWN0SW5Qb29sIiwiYXV0b1VwZGF0ZSIsInVwZGF0ZU1hdHJpeFdvcmxkIiwicGFyZW50IiwibXVsdGlwbHlNYXRyaWNlcyIsInByb2plY3Rpb25NYXRyaXgiLCJzZXRGcm9tTWF0cml4Iiwic29ydCIsInBhaW50ZXJTb3J0IiwibyIsIm9sIiwiZ2VvbWV0cnkiLCJCdWZmZXJHZW9tZXRyeSIsImF0dHJpYnV0ZXMiLCJncm91cHMiLCJwb3NpdGlvbnMiLCJhcnJheSIsImluZGV4IiwiaW5kaWNlcyIsImdyb3VwIiwic3RhcnQiLCJjb3VudCIsIkdlb21ldHJ5IiwiZmFjZVZlcnRleFV2cyIsImlzTXVsdGlNYXRlcmlhbCIsImlzQXJyYXkiLCJ2IiwidmwiLCJtb3JwaFRhcmdldHMiLCJtb3JwaEluZmx1ZW5jZXMiLCJtb3JwaFRhcmdldEluZmx1ZW5jZXMiLCJ0IiwidGwiLCJpbmZsdWVuY2UiLCJ0YXJnZXQiLCJ0YXJnZXRWZXJ0ZXgiLCJmbCIsImZhY2UiLCJtYXRlcmlhbEluZGV4IiwiRnJvbnRTaWRlIiwiQmFja1NpZGUiLCJuZWdhdGUiLCJmYWNlVmVydGV4Tm9ybWFscyIsInZlcnRleE5vcm1hbHMiLCJuIiwibmwiLCJ2ZXJ0ZXhVdnMiLCJ1Iiwic3RlcCIsIkxpbmVTZWdtZW50cyIsInB1c2hQb2ludCIsImdldE5leHRTcHJpdGVJblBvb2wiLCJhYnMiLCJsaW5lIiwic3ByaXRlIiwiczEiLCJzMiIsImFscGhhMSIsImFscGhhMiIsImJjMW5lYXIiLCJiYzJuZWFyIiwiYmMxZmFyIiwiYmMyZmFyIiwibGVycCJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBLElBQUlBLFVBQVUsUUFBZDtBQUNBOzs7O0FBSUFDLE1BQU1DLG9CQUFOLEdBQTZCLFVBQVdDLFVBQVgsRUFBd0I7O0FBRXBERixPQUFNRyxRQUFOLENBQWVDLElBQWYsQ0FBcUIsSUFBckI7O0FBRUEsTUFBS0MsSUFBTCxHQUFZLHNCQUFaOztBQUVBLE1BQUtDLEtBQUwsR0FBYSxJQUFJTixNQUFNTyxLQUFWLENBQWlCLFFBQWpCLENBQWI7QUFDQSxNQUFLQyxPQUFMLEdBQWUsWUFBWSxDQUFFLENBQTdCOztBQUVBLE1BQUtDLFNBQUwsQ0FBZ0JQLFVBQWhCO0FBRUEsQ0FYRDs7QUFhQUYsTUFBTUMsb0JBQU4sQ0FBMkJTLFNBQTNCLEdBQXVDQyxPQUFPQyxNQUFQLENBQWVaLE1BQU1HLFFBQU4sQ0FBZU8sU0FBOUIsQ0FB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ZXNDb250ZW50IjpbIi8vIG1pbk9uU2F2ZTogdHJ1ZSwgbWluaWZpZXI6IHVnbGlmeS1qc1xudmFyIGJnQ29sb3IgPSAweGZmZmZmZlxuLyoqXG4gKiBAYXV0aG9yIG1yZG9vYiAvIGh0dHA6Ly9tcmRvb2IuY29tL1xuICovXG5cblRIUkVFLlNwcml0ZUNhbnZhc01hdGVyaWFsID0gZnVuY3Rpb24gKCBwYXJhbWV0ZXJzICkge1xuXG5cdFRIUkVFLk1hdGVyaWFsLmNhbGwoIHRoaXMgKTtcblxuXHR0aGlzLnR5cGUgPSAnU3ByaXRlQ2FudmFzTWF0ZXJpYWwnO1xuXG5cdHRoaXMuY29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoIDB4ZmZmZmZmICk7XG5cdHRoaXMucHJvZ3JhbSA9IGZ1bmN0aW9uICgpIHt9O1xuXG5cdHRoaXMuc2V0VmFsdWVzKCBwYXJhbWV0ZXJzICk7XG5cbn07XG5cblRIUkVFLlNwcml0ZUNhbnZhc01hdGVyaWFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRIUkVFLk1hdGVyaWFsLnByb3RvdHlwZSApO1xuVEhSRUUuU3ByaXRlQ2FudmFzTWF0ZXJpYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVEhSRUUuU3ByaXRlQ2FudmFzTWF0ZXJpYWw7XG5USFJFRS5TcHJpdGVDYW52YXNNYXRlcmlhbC5wcm90b3R5cGUuaXNTcHJpdGVDYW52YXNNYXRlcmlhbCA9IHRydWU7XG5cblRIUkVFLlNwcml0ZUNhbnZhc01hdGVyaWFsLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcblxuXHR2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU3ByaXRlQ2FudmFzTWF0ZXJpYWwoKTtcblxuXHRtYXRlcmlhbC5jb3B5KCB0aGlzICk7XG5cdG1hdGVyaWFsLmNvbG9yLmNvcHkoIHRoaXMuY29sb3IgKTtcblx0bWF0ZXJpYWwucHJvZ3JhbSA9IHRoaXMucHJvZ3JhbTtcblxuXHRyZXR1cm4gbWF0ZXJpYWw7XG5cbn07XG5cbi8vXG5cblRIUkVFLkNhbnZhc1JlbmRlcmVyID0gZnVuY3Rpb24gKCBwYXJhbWV0ZXJzICkge1xuXG5cdGNvbnNvbGUubG9nKCAnVEhSRUUuQ2FudmFzUmVuZGVyZXInLCBUSFJFRS5SRVZJU0lPTiApO1xuXG5cdHBhcmFtZXRlcnMgPSBwYXJhbWV0ZXJzIHx8IHt9O1xuXG5cdHZhciBfdGhpcyA9IHRoaXMsXG5cdFx0X3JlbmRlckRhdGEsIF9lbGVtZW50cywgX2xpZ2h0cyxcblx0XHRfcHJvamVjdG9yID0gbmV3IFRIUkVFLlByb2plY3RvcigpLFxuXG5cdFx0X2NhbnZhcyA9IHBhcmFtZXRlcnMuY2FudmFzICE9PSB1bmRlZmluZWRcblx0XHRcdFx0ID8gcGFyYW1ldGVycy5jYW52YXNcblx0XHRcdFx0IDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKSxcblxuXHRcdF9jYW52YXNXaWR0aCA9IF9jYW52YXMud2lkdGgsXG5cdFx0X2NhbnZhc0hlaWdodCA9IF9jYW52YXMuaGVpZ2h0LFxuXHRcdF9jYW52YXNXaWR0aEhhbGYgPSBNYXRoLmZsb29yKCBfY2FudmFzV2lkdGggLyAyICksXG5cdFx0X2NhbnZhc0hlaWdodEhhbGYgPSBNYXRoLmZsb29yKCBfY2FudmFzSGVpZ2h0IC8gMiApLFxuXG5cdFx0X3ZpZXdwb3J0WCA9IDAsXG5cdFx0X3ZpZXdwb3J0WSA9IDAsXG5cdFx0X3ZpZXdwb3J0V2lkdGggPSBfY2FudmFzV2lkdGgsXG5cdFx0X3ZpZXdwb3J0SGVpZ2h0ID0gX2NhbnZhc0hlaWdodCxcblxuXHRcdF9waXhlbFJhdGlvID0gMSxcblxuXHRcdF9jb250ZXh0ID0gX2NhbnZhcy5nZXRDb250ZXh0KCAnMmQnLCB7XG5cdFx0XHRhbHBoYTogcGFyYW1ldGVycy5hbHBoYSA9PT0gdHJ1ZVxuXHRcdH0gKSxcblxuXHRcdF9jbGVhckNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKCBiZ0NvbG9yICksXG5cdFx0X2NsZWFyQWxwaGEgPSBwYXJhbWV0ZXJzLmFscGhhID09PSB0cnVlID8gMCA6IDEsXG5cblx0XHRfY29udGV4dEdsb2JhbEFscGhhID0gMSxcblx0XHRfY29udGV4dEdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9IDAsXG5cdFx0X2NvbnRleHRTdHJva2VTdHlsZSA9IG51bGwsXG5cdFx0X2NvbnRleHRGaWxsU3R5bGUgPSBudWxsLFxuXHRcdF9jb250ZXh0TGluZVdpZHRoID0gbnVsbCxcblx0XHRfY29udGV4dExpbmVDYXAgPSBudWxsLFxuXHRcdF9jb250ZXh0TGluZUpvaW4gPSBudWxsLFxuXHRcdF9jb250ZXh0TGluZURhc2ggPSBbXSxcblxuXHRcdF92MSwgX3YyLCBfdjMsXG5cblx0XHRfdjF4LCBfdjF5LCBfdjJ4LCBfdjJ5LCBfdjN4LCBfdjN5LFxuXG5cdFx0X2NvbG9yID0gbmV3IFRIUkVFLkNvbG9yKCksXG5cblx0XHRfZGlmZnVzZUNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKCksXG5cdFx0X2VtaXNzaXZlQ29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoKSxcblxuXHRcdF9saWdodENvbG9yID0gbmV3IFRIUkVFLkNvbG9yKCksXG5cblx0XHRfcGF0dGVybnMgPSB7fSxcblxuXHRcdF91dnMsXG5cdFx0X3V2MXgsIF91djF5LCBfdXYyeCwgX3V2MnksIF91djN4LCBfdXYzeSxcblxuXHRcdF9jbGlwQm94ID0gbmV3IFRIUkVFLkJveDIoKSxcblx0XHRfY2xlYXJCb3ggPSBuZXcgVEhSRUUuQm94MigpLFxuXHRcdF9lbGVtQm94ID0gbmV3IFRIUkVFLkJveDIoKSxcblxuXHRcdF9hbWJpZW50TGlnaHQgPSBuZXcgVEhSRUUuQ29sb3IoKSxcblx0XHRfZGlyZWN0aW9uYWxMaWdodHMgPSBuZXcgVEhSRUUuQ29sb3IoKSxcblx0XHRfcG9pbnRMaWdodHMgPSBuZXcgVEhSRUUuQ29sb3IoKSxcblxuXHRcdF92ZWN0b3IzID0gbmV3IFRIUkVFLlZlY3RvcjMoKSwgLy8gTmVlZGVkIGZvciBQb2ludExpZ2h0XG5cdFx0X2NlbnRyb2lkID0gbmV3IFRIUkVFLlZlY3RvcjMoKSxcblx0XHRfbm9ybWFsID0gbmV3IFRIUkVFLlZlY3RvcjMoKSxcblx0XHRfbm9ybWFsVmlld01hdHJpeCA9IG5ldyBUSFJFRS5NYXRyaXgzKCk7XG5cblx0LyogVE9ET1xuXHRfY2FudmFzLm1vekltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuXHRfY2FudmFzLndlYmtpdEltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuXHRfY2FudmFzLm1zSW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG5cdF9jYW52YXMuaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG5cdCovXG5cblx0Ly8gZGFzaCtnYXAgZmFsbGJhY2tzIGZvciBGaXJlZm94IGFuZCBldmVyeXRoaW5nIGVsc2VcblxuXHRpZiAoIF9jb250ZXh0LnNldExpbmVEYXNoID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRfY29udGV4dC5zZXRMaW5lRGFzaCA9IGZ1bmN0aW9uICgpIHt9O1xuXG5cdH1cblxuXHR0aGlzLmRvbUVsZW1lbnQgPSBfY2FudmFzO1xuXG5cdHRoaXMuYXV0b0NsZWFyID0gdHJ1ZTtcblx0dGhpcy5zb3J0T2JqZWN0cyA9IHRydWU7XG5cdHRoaXMuc29ydEVsZW1lbnRzID0gdHJ1ZTtcblxuXHR0aGlzLmluZm8gPSB7XG5cblx0XHRyZW5kZXI6IHtcblxuXHRcdFx0dmVydGljZXM6IDAsXG5cdFx0XHRmYWNlczogMFxuXG5cdFx0fVxuXG5cdH07XG5cblx0Ly8gQVBJXG5cblx0dGhpcy5nZXRDb250ZXh0ID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0cmV0dXJuIF9jb250ZXh0O1xuXG5cdH07XG5cblx0dGhpcy5nZXRDb250ZXh0QXR0cmlidXRlcyA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdHJldHVybiBfY29udGV4dC5nZXRDb250ZXh0QXR0cmlidXRlcygpO1xuXG5cdH07XG5cblx0dGhpcy5nZXRQaXhlbFJhdGlvID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0cmV0dXJuIF9waXhlbFJhdGlvO1xuXG5cdH07XG5cblx0dGhpcy5zZXRQaXhlbFJhdGlvID0gZnVuY3Rpb24gKCB2YWx1ZSApIHtcblxuXHRcdGlmICggdmFsdWUgIT09IHVuZGVmaW5lZCApIF9waXhlbFJhdGlvID0gdmFsdWU7XG5cblx0fTtcblxuXHR0aGlzLnNldFNpemUgPSBmdW5jdGlvbiAoIHdpZHRoLCBoZWlnaHQsIHVwZGF0ZVN0eWxlICkge1xuXG5cdFx0X2NhbnZhc1dpZHRoID0gd2lkdGggKiBfcGl4ZWxSYXRpbztcblx0XHRfY2FudmFzSGVpZ2h0ID0gaGVpZ2h0ICogX3BpeGVsUmF0aW87XG5cblx0XHRfY2FudmFzLndpZHRoID0gX2NhbnZhc1dpZHRoO1xuXHRcdF9jYW52YXMuaGVpZ2h0ID0gX2NhbnZhc0hlaWdodDtcblxuXHRcdF9jYW52YXNXaWR0aEhhbGYgPSBNYXRoLmZsb29yKCBfY2FudmFzV2lkdGggLyAyICk7XG5cdFx0X2NhbnZhc0hlaWdodEhhbGYgPSBNYXRoLmZsb29yKCBfY2FudmFzSGVpZ2h0IC8gMiApO1xuXG5cdFx0aWYgKCB1cGRhdGVTdHlsZSAhPT0gZmFsc2UgKSB7XG5cblx0XHRcdF9jYW52YXMuc3R5bGUud2lkdGggPSB3aWR0aCArICdweCc7XG5cdFx0XHRfY2FudmFzLnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCc7XG5cblx0XHR9XG5cblx0XHRfY2xpcEJveC5taW4uc2V0KCAtIF9jYW52YXNXaWR0aEhhbGYsIC0gX2NhbnZhc0hlaWdodEhhbGYgKTtcblx0XHRfY2xpcEJveC5tYXguc2V0KCAgIF9jYW52YXNXaWR0aEhhbGYsICAgX2NhbnZhc0hlaWdodEhhbGYgKTtcblxuXHRcdF9jbGVhckJveC5taW4uc2V0KCAtIF9jYW52YXNXaWR0aEhhbGYsIC0gX2NhbnZhc0hlaWdodEhhbGYgKTtcblx0XHRfY2xlYXJCb3gubWF4LnNldCggICBfY2FudmFzV2lkdGhIYWxmLCAgIF9jYW52YXNIZWlnaHRIYWxmICk7XG5cblx0XHRfY29udGV4dEdsb2JhbEFscGhhID0gMTtcblx0XHRfY29udGV4dEdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9IDA7XG5cdFx0X2NvbnRleHRTdHJva2VTdHlsZSA9IG51bGw7XG5cdFx0X2NvbnRleHRGaWxsU3R5bGUgPSBudWxsO1xuXHRcdF9jb250ZXh0TGluZVdpZHRoID0gbnVsbDtcblx0XHRfY29udGV4dExpbmVDYXAgPSBudWxsO1xuXHRcdF9jb250ZXh0TGluZUpvaW4gPSBudWxsO1xuXG5cdFx0dGhpcy5zZXRWaWV3cG9ydCggMCwgMCwgd2lkdGgsIGhlaWdodCApO1xuXG5cdH07XG5cblx0dGhpcy5zZXRWaWV3cG9ydCA9IGZ1bmN0aW9uICggeCwgeSwgd2lkdGgsIGhlaWdodCApIHtcblxuXHRcdF92aWV3cG9ydFggPSB4ICogX3BpeGVsUmF0aW87XG5cdFx0X3ZpZXdwb3J0WSA9IHkgKiBfcGl4ZWxSYXRpbztcblxuXHRcdF92aWV3cG9ydFdpZHRoID0gd2lkdGggKiBfcGl4ZWxSYXRpbztcblx0XHRfdmlld3BvcnRIZWlnaHQgPSBoZWlnaHQgKiBfcGl4ZWxSYXRpbztcblxuXHR9O1xuXG5cdHRoaXMuc2V0U2Npc3NvciA9IGZ1bmN0aW9uICgpIHt9O1xuXHR0aGlzLnNldFNjaXNzb3JUZXN0ID0gZnVuY3Rpb24gKCkge307XG5cblx0dGhpcy5zZXRDbGVhckNvbG9yID0gZnVuY3Rpb24gKCBjb2xvciwgYWxwaGEgKSB7XG5cblx0XHRfY2xlYXJDb2xvci5zZXQoIGNvbG9yICk7XG5cdFx0X2NsZWFyQWxwaGEgPSBhbHBoYSAhPT0gdW5kZWZpbmVkID8gYWxwaGEgOiAxO1xuXG5cdFx0X2NsZWFyQm94Lm1pbi5zZXQoIC0gX2NhbnZhc1dpZHRoSGFsZiwgLSBfY2FudmFzSGVpZ2h0SGFsZiApO1xuXHRcdF9jbGVhckJveC5tYXguc2V0KCAgIF9jYW52YXNXaWR0aEhhbGYsICAgX2NhbnZhc0hlaWdodEhhbGYgKTtcblxuXHR9O1xuXG5cdHRoaXMuc2V0Q2xlYXJDb2xvckhleCA9IGZ1bmN0aW9uICggaGV4LCBhbHBoYSApIHtcblxuXHRcdGNvbnNvbGUud2FybiggJ1RIUkVFLkNhbnZhc1JlbmRlcmVyOiAuc2V0Q2xlYXJDb2xvckhleCgpIGlzIGJlaW5nIHJlbW92ZWQuIFVzZSAuc2V0Q2xlYXJDb2xvcigpIGluc3RlYWQuJyApO1xuXHRcdHRoaXMuc2V0Q2xlYXJDb2xvciggaGV4LCBhbHBoYSApO1xuXG5cdH07XG5cblx0dGhpcy5nZXRDbGVhckNvbG9yID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0cmV0dXJuIF9jbGVhckNvbG9yO1xuXG5cdH07XG5cblx0dGhpcy5nZXRDbGVhckFscGhhID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0cmV0dXJuIF9jbGVhckFscGhhO1xuXG5cdH07XG5cblx0dGhpcy5nZXRNYXhBbmlzb3Ryb3B5ID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0cmV0dXJuIDA7XG5cblx0fTtcblxuXHR0aGlzLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0aWYgKCBfY2xlYXJCb3guaXNFbXB0eSgpID09PSBmYWxzZSApIHtcblxuXHRcdFx0X2NsZWFyQm94LmludGVyc2VjdCggX2NsaXBCb3ggKTtcblx0XHRcdF9jbGVhckJveC5leHBhbmRCeVNjYWxhciggMiApO1xuXG5cdFx0XHRfY2xlYXJCb3gubWluLnggPSAgIF9jbGVhckJveC5taW4ueCArIF9jYW52YXNXaWR0aEhhbGY7XG5cdFx0XHRfY2xlYXJCb3gubWluLnkgPSAtIF9jbGVhckJveC5taW4ueSArIF9jYW52YXNIZWlnaHRIYWxmO1x0XHQvLyBoaWdoZXIgeSB2YWx1ZSAhXG5cdFx0XHRfY2xlYXJCb3gubWF4LnggPSAgIF9jbGVhckJveC5tYXgueCArIF9jYW52YXNXaWR0aEhhbGY7XG5cdFx0XHRfY2xlYXJCb3gubWF4LnkgPSAtIF9jbGVhckJveC5tYXgueSArIF9jYW52YXNIZWlnaHRIYWxmO1x0XHQvLyBsb3dlciB5IHZhbHVlICFcblxuXHRcdFx0aWYgKCBfY2xlYXJBbHBoYSA8IDEgKSB7XG5cblx0XHRcdFx0X2NvbnRleHQuY2xlYXJSZWN0KFxuXHRcdFx0XHRcdF9jbGVhckJveC5taW4ueCB8IDAsXG5cdFx0XHRcdFx0X2NsZWFyQm94Lm1heC55IHwgMCxcblx0XHRcdFx0XHQoIF9jbGVhckJveC5tYXgueCAtIF9jbGVhckJveC5taW4ueCApIHwgMCxcblx0XHRcdFx0XHQoIF9jbGVhckJveC5taW4ueSAtIF9jbGVhckJveC5tYXgueSApIHwgMFxuXHRcdFx0XHQpO1xuXG5cdFx0XHR9XG5cblx0XHRcdGlmICggX2NsZWFyQWxwaGEgPiAwICkge1xuXG5cdFx0XHRcdHNldE9wYWNpdHkoIDEgKTtcblx0XHRcdFx0c2V0QmxlbmRpbmcoIFRIUkVFLk5vcm1hbEJsZW5kaW5nICk7XG5cblx0XHRcdFx0c2V0RmlsbFN0eWxlKCAncmdiYSgnICsgTWF0aC5mbG9vciggX2NsZWFyQ29sb3IuciAqIDI1NSApICsgJywnICsgTWF0aC5mbG9vciggX2NsZWFyQ29sb3IuZyAqIDI1NSApICsgJywnICsgTWF0aC5mbG9vciggX2NsZWFyQ29sb3IuYiAqIDI1NSApICsgJywnICsgX2NsZWFyQWxwaGEgKyAnKScgKTtcblxuXHRcdFx0XHRfY29udGV4dC5maWxsUmVjdChcblx0XHRcdFx0XHRfY2xlYXJCb3gubWluLnggfCAwLFxuXHRcdFx0XHRcdF9jbGVhckJveC5tYXgueSB8IDAsXG5cdFx0XHRcdFx0KCBfY2xlYXJCb3gubWF4LnggLSBfY2xlYXJCb3gubWluLnggKSB8IDAsXG5cdFx0XHRcdFx0KCBfY2xlYXJCb3gubWluLnkgLSBfY2xlYXJCb3gubWF4LnkgKSB8IDBcblx0XHRcdFx0KTtcblxuXHRcdFx0fVxuXG5cdFx0XHRfY2xlYXJCb3gubWFrZUVtcHR5KCk7XG5cblx0XHR9XG5cblx0fTtcblxuXHQvLyBjb21wYXRpYmlsaXR5XG5cblx0dGhpcy5jbGVhckNvbG9yID0gZnVuY3Rpb24gKCkge307XG5cdHRoaXMuY2xlYXJEZXB0aCA9IGZ1bmN0aW9uICgpIHt9O1xuXHR0aGlzLmNsZWFyU3RlbmNpbCA9IGZ1bmN0aW9uICgpIHt9O1xuXG5cdHRoaXMucmVuZGVyID0gZnVuY3Rpb24gKCBzY2VuZSwgY2FtZXJhICkge1xuXG5cdFx0aWYgKCBjYW1lcmEuaXNDYW1lcmEgPT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0Y29uc29sZS5lcnJvciggJ1RIUkVFLkNhbnZhc1JlbmRlcmVyLnJlbmRlcjogY2FtZXJhIGlzIG5vdCBhbiBpbnN0YW5jZSBvZiBUSFJFRS5DYW1lcmEuJyApO1xuXHRcdFx0cmV0dXJuO1xuXG5cdFx0fVxuXG5cdFx0dmFyIGJhY2tncm91bmQgPSBzY2VuZS5iYWNrZ3JvdW5kO1xuXG5cdFx0aWYgKCBiYWNrZ3JvdW5kICYmIGJhY2tncm91bmQuaXNDb2xvciApIHtcblxuXHRcdFx0c2V0T3BhY2l0eSggMSApO1xuXHRcdFx0c2V0QmxlbmRpbmcoIFRIUkVFLk5vcm1hbEJsZW5kaW5nICk7XG5cblx0XHRcdHNldEZpbGxTdHlsZSggYmFja2dyb3VuZC5nZXRTdHlsZSgpICk7XG5cdFx0XHRfY29udGV4dC5maWxsUmVjdCggMCwgMCwgX2NhbnZhc1dpZHRoLCBfY2FudmFzSGVpZ2h0ICk7XG5cblx0XHR9IGVsc2UgaWYgKCB0aGlzLmF1dG9DbGVhciA9PT0gdHJ1ZSApIHtcblxuXHRcdFx0dGhpcy5jbGVhcigpO1xuXG5cdFx0fVxuXG5cdFx0X3RoaXMuaW5mby5yZW5kZXIudmVydGljZXMgPSAwO1xuXHRcdF90aGlzLmluZm8ucmVuZGVyLmZhY2VzID0gMDtcblxuXHRcdF9jb250ZXh0LnNldFRyYW5zZm9ybSggX3ZpZXdwb3J0V2lkdGggLyBfY2FudmFzV2lkdGgsIDAsIDAsIC0gX3ZpZXdwb3J0SGVpZ2h0IC8gX2NhbnZhc0hlaWdodCwgX3ZpZXdwb3J0WCwgX2NhbnZhc0hlaWdodCAtIF92aWV3cG9ydFkgKTtcblx0XHRfY29udGV4dC50cmFuc2xhdGUoIF9jYW52YXNXaWR0aEhhbGYsIF9jYW52YXNIZWlnaHRIYWxmICk7XG5cblx0XHRfcmVuZGVyRGF0YSA9IF9wcm9qZWN0b3IucHJvamVjdFNjZW5lKCBzY2VuZSwgY2FtZXJhLCB0aGlzLnNvcnRPYmplY3RzLCB0aGlzLnNvcnRFbGVtZW50cyApO1xuXHRcdF9lbGVtZW50cyA9IF9yZW5kZXJEYXRhLmVsZW1lbnRzO1xuXHRcdF9saWdodHMgPSBfcmVuZGVyRGF0YS5saWdodHM7XG5cblx0XHRfbm9ybWFsVmlld01hdHJpeC5nZXROb3JtYWxNYXRyaXgoIGNhbWVyYS5tYXRyaXhXb3JsZEludmVyc2UgKTtcblxuXHRcdC8qIERFQlVHXG5cdFx0c2V0RmlsbFN0eWxlKCAncmdiYSggMCwgMjU1LCAyNTUsIDAuNSApJyApO1xuXHRcdF9jb250ZXh0LmZpbGxSZWN0KCBfY2xpcEJveC5taW4ueCwgX2NsaXBCb3gubWluLnksIF9jbGlwQm94Lm1heC54IC0gX2NsaXBCb3gubWluLngsIF9jbGlwQm94Lm1heC55IC0gX2NsaXBCb3gubWluLnkgKTtcblx0XHQqL1xuXG5cdFx0Y2FsY3VsYXRlTGlnaHRzKCk7XG5cblx0XHRmb3IgKCB2YXIgZSA9IDAsIGVsID0gX2VsZW1lbnRzLmxlbmd0aDsgZSA8IGVsOyBlICsrICkge1xuXG5cdFx0XHR2YXIgZWxlbWVudCA9IF9lbGVtZW50c1sgZSBdO1xuXG5cdFx0XHR2YXIgbWF0ZXJpYWwgPSBlbGVtZW50Lm1hdGVyaWFsO1xuXG5cdFx0XHRpZiAoIG1hdGVyaWFsID09PSB1bmRlZmluZWQgfHwgbWF0ZXJpYWwub3BhY2l0eSA9PT0gMCApIGNvbnRpbnVlO1xuXG5cdFx0XHRfZWxlbUJveC5tYWtlRW1wdHkoKTtcblxuXHRcdFx0aWYgKCBlbGVtZW50IGluc3RhbmNlb2YgVEhSRUUuUmVuZGVyYWJsZVNwcml0ZSApIHtcblxuXHRcdFx0XHRfdjEgPSBlbGVtZW50O1xuXHRcdFx0XHRfdjEueCAqPSBfY2FudmFzV2lkdGhIYWxmOyBfdjEueSAqPSBfY2FudmFzSGVpZ2h0SGFsZjtcblxuXHRcdFx0XHRyZW5kZXJTcHJpdGUoIF92MSwgZWxlbWVudCwgbWF0ZXJpYWwgKTtcblxuXHRcdFx0fSBlbHNlIGlmICggZWxlbWVudCBpbnN0YW5jZW9mIFRIUkVFLlJlbmRlcmFibGVMaW5lICkge1xuXG5cdFx0XHRcdF92MSA9IGVsZW1lbnQudjE7IF92MiA9IGVsZW1lbnQudjI7XG5cblx0XHRcdFx0X3YxLnBvc2l0aW9uU2NyZWVuLnggKj0gX2NhbnZhc1dpZHRoSGFsZjsgX3YxLnBvc2l0aW9uU2NyZWVuLnkgKj0gX2NhbnZhc0hlaWdodEhhbGY7XG5cdFx0XHRcdF92Mi5wb3NpdGlvblNjcmVlbi54ICo9IF9jYW52YXNXaWR0aEhhbGY7IF92Mi5wb3NpdGlvblNjcmVlbi55ICo9IF9jYW52YXNIZWlnaHRIYWxmO1xuXG5cdFx0XHRcdF9lbGVtQm94LnNldEZyb21Qb2ludHMoIFtcblx0XHRcdFx0XHRfdjEucG9zaXRpb25TY3JlZW4sXG5cdFx0XHRcdFx0X3YyLnBvc2l0aW9uU2NyZWVuXG5cdFx0XHRcdF0gKTtcblxuXHRcdFx0XHRpZiAoIF9jbGlwQm94LmludGVyc2VjdHNCb3goIF9lbGVtQm94ICkgPT09IHRydWUgKSB7XG5cblx0XHRcdFx0XHRyZW5kZXJMaW5lKCBfdjEsIF92MiwgZWxlbWVudCwgbWF0ZXJpYWwgKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdH0gZWxzZSBpZiAoIGVsZW1lbnQgaW5zdGFuY2VvZiBUSFJFRS5SZW5kZXJhYmxlRmFjZSApIHtcblxuXHRcdFx0XHRfdjEgPSBlbGVtZW50LnYxOyBfdjIgPSBlbGVtZW50LnYyOyBfdjMgPSBlbGVtZW50LnYzO1xuXG5cdFx0XHRcdGlmICggX3YxLnBvc2l0aW9uU2NyZWVuLnogPCAtIDEgfHwgX3YxLnBvc2l0aW9uU2NyZWVuLnogPiAxICkgY29udGludWU7XG5cdFx0XHRcdGlmICggX3YyLnBvc2l0aW9uU2NyZWVuLnogPCAtIDEgfHwgX3YyLnBvc2l0aW9uU2NyZWVuLnogPiAxICkgY29udGludWU7XG5cdFx0XHRcdGlmICggX3YzLnBvc2l0aW9uU2NyZWVuLnogPCAtIDEgfHwgX3YzLnBvc2l0aW9uU2NyZWVuLnogPiAxICkgY29udGludWU7XG5cblx0XHRcdFx0X3YxLnBvc2l0aW9uU2NyZWVuLnggKj0gX2NhbnZhc1dpZHRoSGFsZjsgX3YxLnBvc2l0aW9uU2NyZWVuLnkgKj0gX2NhbnZhc0hlaWdodEhhbGY7XG5cdFx0XHRcdF92Mi5wb3NpdGlvblNjcmVlbi54ICo9IF9jYW52YXNXaWR0aEhhbGY7IF92Mi5wb3NpdGlvblNjcmVlbi55ICo9IF9jYW52YXNIZWlnaHRIYWxmO1xuXHRcdFx0XHRfdjMucG9zaXRpb25TY3JlZW4ueCAqPSBfY2FudmFzV2lkdGhIYWxmOyBfdjMucG9zaXRpb25TY3JlZW4ueSAqPSBfY2FudmFzSGVpZ2h0SGFsZjtcblxuXHRcdFx0XHRpZiAoIG1hdGVyaWFsLm92ZXJkcmF3ID4gMCApIHtcblxuXHRcdFx0XHRcdGV4cGFuZCggX3YxLnBvc2l0aW9uU2NyZWVuLCBfdjIucG9zaXRpb25TY3JlZW4sIG1hdGVyaWFsLm92ZXJkcmF3ICk7XG5cdFx0XHRcdFx0ZXhwYW5kKCBfdjIucG9zaXRpb25TY3JlZW4sIF92My5wb3NpdGlvblNjcmVlbiwgbWF0ZXJpYWwub3ZlcmRyYXcgKTtcblx0XHRcdFx0XHRleHBhbmQoIF92My5wb3NpdGlvblNjcmVlbiwgX3YxLnBvc2l0aW9uU2NyZWVuLCBtYXRlcmlhbC5vdmVyZHJhdyApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRfZWxlbUJveC5zZXRGcm9tUG9pbnRzKCBbXG5cdFx0XHRcdFx0X3YxLnBvc2l0aW9uU2NyZWVuLFxuXHRcdFx0XHRcdF92Mi5wb3NpdGlvblNjcmVlbixcblx0XHRcdFx0XHRfdjMucG9zaXRpb25TY3JlZW5cblx0XHRcdFx0XSApO1xuXG5cdFx0XHRcdGlmICggX2NsaXBCb3guaW50ZXJzZWN0c0JveCggX2VsZW1Cb3ggKSA9PT0gdHJ1ZSApIHtcblxuXHRcdFx0XHRcdHJlbmRlckZhY2UzKCBfdjEsIF92MiwgX3YzLCAwLCAxLCAyLCBlbGVtZW50LCBtYXRlcmlhbCApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0XHQvKiBERUJVR1xuXHRcdFx0c2V0TGluZVdpZHRoKCAxICk7XG5cdFx0XHRzZXRTdHJva2VTdHlsZSggJ3JnYmEoIDAsIDI1NSwgMCwgMC41ICknICk7XG5cdFx0XHRfY29udGV4dC5zdHJva2VSZWN0KCBfZWxlbUJveC5taW4ueCwgX2VsZW1Cb3gubWluLnksIF9lbGVtQm94Lm1heC54IC0gX2VsZW1Cb3gubWluLngsIF9lbGVtQm94Lm1heC55IC0gX2VsZW1Cb3gubWluLnkgKTtcblx0XHRcdCovXG5cblx0XHRcdF9jbGVhckJveC51bmlvbiggX2VsZW1Cb3ggKTtcblxuXHRcdH1cblxuXHRcdC8qIERFQlVHXG5cdFx0c2V0TGluZVdpZHRoKCAxICk7XG5cdFx0c2V0U3Ryb2tlU3R5bGUoICdyZ2JhKCAyNTUsIDAsIDAsIDAuNSApJyApO1xuXHRcdF9jb250ZXh0LnN0cm9rZVJlY3QoIF9jbGVhckJveC5taW4ueCwgX2NsZWFyQm94Lm1pbi55LCBfY2xlYXJCb3gubWF4LnggLSBfY2xlYXJCb3gubWluLngsIF9jbGVhckJveC5tYXgueSAtIF9jbGVhckJveC5taW4ueSApO1xuXHRcdCovXG5cblx0XHRfY29udGV4dC5zZXRUcmFuc2Zvcm0oIDEsIDAsIDAsIDEsIDAsIDAgKTtcblxuXHR9O1xuXG5cdC8vXG5cblx0ZnVuY3Rpb24gY2FsY3VsYXRlTGlnaHRzKCkge1xuXG5cdFx0X2FtYmllbnRMaWdodC5zZXRSR0IoIDAsIDAsIDAgKTtcblx0XHRfZGlyZWN0aW9uYWxMaWdodHMuc2V0UkdCKCAwLCAwLCAwICk7XG5cdFx0X3BvaW50TGlnaHRzLnNldFJHQiggMCwgMCwgMCApO1xuXG5cdFx0Zm9yICggdmFyIGwgPSAwLCBsbCA9IF9saWdodHMubGVuZ3RoOyBsIDwgbGw7IGwgKysgKSB7XG5cblx0XHRcdHZhciBsaWdodCA9IF9saWdodHNbIGwgXTtcblx0XHRcdHZhciBsaWdodENvbG9yID0gbGlnaHQuY29sb3I7XG5cblx0XHRcdGlmICggbGlnaHQuaXNBbWJpZW50TGlnaHQgKSB7XG5cblx0XHRcdFx0X2FtYmllbnRMaWdodC5hZGQoIGxpZ2h0Q29sb3IgKTtcblxuXHRcdFx0fSBlbHNlIGlmICggbGlnaHQuaXNEaXJlY3Rpb25hbExpZ2h0ICkge1xuXG5cdFx0XHRcdC8vIGZvciBzcHJpdGVzXG5cblx0XHRcdFx0X2RpcmVjdGlvbmFsTGlnaHRzLmFkZCggbGlnaHRDb2xvciApO1xuXG5cdFx0XHR9IGVsc2UgaWYgKCBsaWdodC5pc1BvaW50TGlnaHQgKSB7XG5cblx0XHRcdFx0Ly8gZm9yIHNwcml0ZXNcblxuXHRcdFx0XHRfcG9pbnRMaWdodHMuYWRkKCBsaWdodENvbG9yICk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHR9XG5cblx0ZnVuY3Rpb24gY2FsY3VsYXRlTGlnaHQoIHBvc2l0aW9uLCBub3JtYWwsIGNvbG9yICkge1xuXG5cdFx0Zm9yICggdmFyIGwgPSAwLCBsbCA9IF9saWdodHMubGVuZ3RoOyBsIDwgbGw7IGwgKysgKSB7XG5cblx0XHRcdHZhciBsaWdodCA9IF9saWdodHNbIGwgXTtcblxuXHRcdFx0X2xpZ2h0Q29sb3IuY29weSggbGlnaHQuY29sb3IgKTtcblxuXHRcdFx0aWYgKCBsaWdodC5pc0RpcmVjdGlvbmFsTGlnaHQgKSB7XG5cblx0XHRcdFx0dmFyIGxpZ2h0UG9zaXRpb24gPSBfdmVjdG9yMy5zZXRGcm9tTWF0cml4UG9zaXRpb24oIGxpZ2h0Lm1hdHJpeFdvcmxkICkubm9ybWFsaXplKCk7XG5cblx0XHRcdFx0dmFyIGFtb3VudCA9IG5vcm1hbC5kb3QoIGxpZ2h0UG9zaXRpb24gKTtcblxuXHRcdFx0XHRpZiAoIGFtb3VudCA8PSAwICkgY29udGludWU7XG5cblx0XHRcdFx0YW1vdW50ICo9IGxpZ2h0LmludGVuc2l0eTtcblxuXHRcdFx0XHRjb2xvci5hZGQoIF9saWdodENvbG9yLm11bHRpcGx5U2NhbGFyKCBhbW91bnQgKSApO1xuXG5cdFx0XHR9IGVsc2UgaWYgKCBsaWdodC5pc1BvaW50TGlnaHQgKSB7XG5cblx0XHRcdFx0dmFyIGxpZ2h0UG9zaXRpb24gPSBfdmVjdG9yMy5zZXRGcm9tTWF0cml4UG9zaXRpb24oIGxpZ2h0Lm1hdHJpeFdvcmxkICk7XG5cblx0XHRcdFx0dmFyIGFtb3VudCA9IG5vcm1hbC5kb3QoIF92ZWN0b3IzLnN1YlZlY3RvcnMoIGxpZ2h0UG9zaXRpb24sIHBvc2l0aW9uICkubm9ybWFsaXplKCkgKTtcblxuXHRcdFx0XHRpZiAoIGFtb3VudCA8PSAwICkgY29udGludWU7XG5cblx0XHRcdFx0YW1vdW50ICo9IGxpZ2h0LmRpc3RhbmNlID09IDAgPyAxIDogMSAtIE1hdGgubWluKCBwb3NpdGlvbi5kaXN0YW5jZVRvKCBsaWdodFBvc2l0aW9uICkgLyBsaWdodC5kaXN0YW5jZSwgMSApO1xuXG5cdFx0XHRcdGlmICggYW1vdW50ID09IDAgKSBjb250aW51ZTtcblxuXHRcdFx0XHRhbW91bnQgKj0gbGlnaHQuaW50ZW5zaXR5O1xuXG5cdFx0XHRcdGNvbG9yLmFkZCggX2xpZ2h0Q29sb3IubXVsdGlwbHlTY2FsYXIoIGFtb3VudCApICk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHR9XG5cblx0ZnVuY3Rpb24gcmVuZGVyU3ByaXRlKCB2MSwgZWxlbWVudCwgbWF0ZXJpYWwgKSB7XG5cblx0XHRzZXRPcGFjaXR5KCBtYXRlcmlhbC5vcGFjaXR5ICk7XG5cdFx0c2V0QmxlbmRpbmcoIG1hdGVyaWFsLmJsZW5kaW5nICk7XG5cblx0XHR2YXIgc2NhbGVYID0gZWxlbWVudC5zY2FsZS54ICogX2NhbnZhc1dpZHRoSGFsZjtcblx0XHR2YXIgc2NhbGVZID0gZWxlbWVudC5zY2FsZS55ICogX2NhbnZhc0hlaWdodEhhbGY7XG5cblx0XHR2YXIgZGlzdCA9IE1hdGguc3FydCggc2NhbGVYICogc2NhbGVYICsgc2NhbGVZICogc2NhbGVZICk7IC8vIGFsbG93IGZvciByb3RhdGVkIHNwcml0ZVxuXHRcdF9lbGVtQm94Lm1pbi5zZXQoIHYxLnggLSBkaXN0LCB2MS55IC0gZGlzdCApO1xuXHRcdF9lbGVtQm94Lm1heC5zZXQoIHYxLnggKyBkaXN0LCB2MS55ICsgZGlzdCApO1xuXG5cdFx0aWYgKCBtYXRlcmlhbC5pc1Nwcml0ZU1hdGVyaWFsICkge1xuXG5cdFx0XHR2YXIgdGV4dHVyZSA9IG1hdGVyaWFsLm1hcDtcblxuXHRcdFx0aWYgKCB0ZXh0dXJlICE9PSBudWxsICkge1xuXG5cdFx0XHRcdHZhciBwYXR0ZXJuID0gX3BhdHRlcm5zWyB0ZXh0dXJlLmlkIF07XG5cblx0XHRcdFx0aWYgKCBwYXR0ZXJuID09PSB1bmRlZmluZWQgfHwgcGF0dGVybi52ZXJzaW9uICE9PSB0ZXh0dXJlLnZlcnNpb24gKSB7XG5cblx0XHRcdFx0XHRwYXR0ZXJuID0gdGV4dHVyZVRvUGF0dGVybiggdGV4dHVyZSApO1xuXHRcdFx0XHRcdF9wYXR0ZXJuc1sgdGV4dHVyZS5pZCBdID0gcGF0dGVybjtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCBwYXR0ZXJuLmNhbnZhcyAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRcdFx0c2V0RmlsbFN0eWxlKCBwYXR0ZXJuLmNhbnZhcyApO1xuXG5cdFx0XHRcdFx0dmFyIGJpdG1hcCA9IHRleHR1cmUuaW1hZ2U7XG5cblx0XHRcdFx0XHR2YXIgb3ggPSBiaXRtYXAud2lkdGggKiB0ZXh0dXJlLm9mZnNldC54O1xuXHRcdFx0XHRcdHZhciBveSA9IGJpdG1hcC5oZWlnaHQgKiB0ZXh0dXJlLm9mZnNldC55O1xuXG5cdFx0XHRcdFx0dmFyIHN4ID0gYml0bWFwLndpZHRoICogdGV4dHVyZS5yZXBlYXQueDtcblx0XHRcdFx0XHR2YXIgc3kgPSBiaXRtYXAuaGVpZ2h0ICogdGV4dHVyZS5yZXBlYXQueTtcblxuXHRcdFx0XHRcdHZhciBjeCA9IHNjYWxlWCAvIHN4O1xuXHRcdFx0XHRcdHZhciBjeSA9IHNjYWxlWSAvIHN5O1xuXG5cdFx0XHRcdFx0X2NvbnRleHQuc2F2ZSgpO1xuXHRcdFx0XHRcdF9jb250ZXh0LnRyYW5zbGF0ZSggdjEueCwgdjEueSApO1xuXHRcdFx0XHRcdGlmICggbWF0ZXJpYWwucm90YXRpb24gIT09IDAgKSBfY29udGV4dC5yb3RhdGUoIG1hdGVyaWFsLnJvdGF0aW9uICk7XG5cdFx0XHRcdFx0X2NvbnRleHQudHJhbnNsYXRlKCAtIHNjYWxlWCAvIDIsIC0gc2NhbGVZIC8gMiApO1xuXHRcdFx0XHRcdF9jb250ZXh0LnNjYWxlKCBjeCwgY3kgKTtcblx0XHRcdFx0XHRfY29udGV4dC50cmFuc2xhdGUoIC0gb3gsIC0gb3kgKTtcblx0XHRcdFx0XHRfY29udGV4dC5maWxsUmVjdCggb3gsIG95LCBzeCwgc3kgKTtcblx0XHRcdFx0XHRfY29udGV4dC5yZXN0b3JlKCk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdC8vIG5vIHRleHR1cmVcblxuXHRcdFx0XHRzZXRGaWxsU3R5bGUoIG1hdGVyaWFsLmNvbG9yLmdldFN0eWxlKCkgKTtcblxuXHRcdFx0XHRfY29udGV4dC5zYXZlKCk7XG5cdFx0XHRcdF9jb250ZXh0LnRyYW5zbGF0ZSggdjEueCwgdjEueSApO1xuXHRcdFx0XHRpZiAoIG1hdGVyaWFsLnJvdGF0aW9uICE9PSAwICkgX2NvbnRleHQucm90YXRlKCBtYXRlcmlhbC5yb3RhdGlvbiApO1xuXHRcdFx0XHRfY29udGV4dC5zY2FsZSggc2NhbGVYLCAtIHNjYWxlWSApO1xuXHRcdFx0XHRfY29udGV4dC5maWxsUmVjdCggLSAwLjUsIC0gMC41LCAxLCAxICk7XG5cdFx0XHRcdF9jb250ZXh0LnJlc3RvcmUoKTtcblxuXHRcdFx0fVxuXG5cdFx0fSBlbHNlIGlmICggbWF0ZXJpYWwuaXNTcHJpdGVDYW52YXNNYXRlcmlhbCApIHtcblxuXHRcdFx0c2V0U3Ryb2tlU3R5bGUoIG1hdGVyaWFsLmNvbG9yLmdldFN0eWxlKCkgKTtcblx0XHRcdHNldEZpbGxTdHlsZSggbWF0ZXJpYWwuY29sb3IuZ2V0U3R5bGUoKSApO1xuXG5cdFx0XHRfY29udGV4dC5zYXZlKCk7XG5cdFx0XHRfY29udGV4dC50cmFuc2xhdGUoIHYxLngsIHYxLnkgKTtcblx0XHRcdGlmICggbWF0ZXJpYWwucm90YXRpb24gIT09IDAgKSBfY29udGV4dC5yb3RhdGUoIG1hdGVyaWFsLnJvdGF0aW9uICk7XG5cdFx0XHRfY29udGV4dC5zY2FsZSggc2NhbGVYLCBzY2FsZVkgKTtcblxuXHRcdFx0bWF0ZXJpYWwucHJvZ3JhbSggX2NvbnRleHQgKTtcblxuXHRcdFx0X2NvbnRleHQucmVzdG9yZSgpO1xuXG5cdFx0fSBlbHNlIGlmICggbWF0ZXJpYWwuaXNQb2ludHNNYXRlcmlhbCApIHtcblxuXHRcdFx0c2V0RmlsbFN0eWxlKCBtYXRlcmlhbC5jb2xvci5nZXRTdHlsZSgpICk7XG5cblx0XHRcdF9jb250ZXh0LnNhdmUoKTtcblx0XHRcdF9jb250ZXh0LnRyYW5zbGF0ZSggdjEueCwgdjEueSApO1xuXHRcdFx0aWYgKCBtYXRlcmlhbC5yb3RhdGlvbiAhPT0gMCApIF9jb250ZXh0LnJvdGF0ZSggbWF0ZXJpYWwucm90YXRpb24gKTtcblx0XHRcdF9jb250ZXh0LnNjYWxlKCBzY2FsZVggKiBtYXRlcmlhbC5zaXplLCAtIHNjYWxlWSAqIG1hdGVyaWFsLnNpemUgKTtcblx0XHRcdF9jb250ZXh0LmZpbGxSZWN0KCAtIDAuNSwgLSAwLjUsIDEsIDEgKTtcblx0XHRcdF9jb250ZXh0LnJlc3RvcmUoKTtcblxuXHRcdH1cblxuXHRcdC8qIERFQlVHXG5cdFx0c2V0U3Ryb2tlU3R5bGUoICdyZ2IoMjU1LDI1NSwwKScgKTtcblx0XHRfY29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRfY29udGV4dC5tb3ZlVG8oIHYxLnggLSAxMCwgdjEueSApO1xuXHRcdF9jb250ZXh0LmxpbmVUbyggdjEueCArIDEwLCB2MS55ICk7XG5cdFx0X2NvbnRleHQubW92ZVRvKCB2MS54LCB2MS55IC0gMTAgKTtcblx0XHRfY29udGV4dC5saW5lVG8oIHYxLngsIHYxLnkgKyAxMCApO1xuXHRcdF9jb250ZXh0LnN0cm9rZSgpO1xuXHRcdCovXG5cblx0fVxuXG5cdGZ1bmN0aW9uIHJlbmRlckxpbmUoIHYxLCB2MiwgZWxlbWVudCwgbWF0ZXJpYWwgKSB7XG5cblx0XHRzZXRPcGFjaXR5KCBtYXRlcmlhbC5vcGFjaXR5ICk7XG5cdFx0c2V0QmxlbmRpbmcoIG1hdGVyaWFsLmJsZW5kaW5nICk7XG5cblx0XHRfY29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRfY29udGV4dC5tb3ZlVG8oIHYxLnBvc2l0aW9uU2NyZWVuLngsIHYxLnBvc2l0aW9uU2NyZWVuLnkgKTtcblx0XHRfY29udGV4dC5saW5lVG8oIHYyLnBvc2l0aW9uU2NyZWVuLngsIHYyLnBvc2l0aW9uU2NyZWVuLnkgKTtcblxuXHRcdGlmICggbWF0ZXJpYWwuaXNMaW5lQmFzaWNNYXRlcmlhbCApIHtcblxuXHRcdFx0c2V0TGluZVdpZHRoKCBtYXRlcmlhbC5saW5ld2lkdGggKTtcblx0XHRcdHNldExpbmVDYXAoIG1hdGVyaWFsLmxpbmVjYXAgKTtcblx0XHRcdHNldExpbmVKb2luKCBtYXRlcmlhbC5saW5lam9pbiApO1xuXG5cdFx0XHRpZiAoIG1hdGVyaWFsLnZlcnRleENvbG9ycyAhPT0gVEhSRUUuVmVydGV4Q29sb3JzICkge1xuXG5cdFx0XHRcdHNldFN0cm9rZVN0eWxlKCBtYXRlcmlhbC5jb2xvci5nZXRTdHlsZSgpICk7XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0dmFyIGNvbG9yU3R5bGUxID0gZWxlbWVudC52ZXJ0ZXhDb2xvcnNbIDAgXS5nZXRTdHlsZSgpO1xuXHRcdFx0XHR2YXIgY29sb3JTdHlsZTIgPSBlbGVtZW50LnZlcnRleENvbG9yc1sgMSBdLmdldFN0eWxlKCk7XG5cblx0XHRcdFx0aWYgKCBjb2xvclN0eWxlMSA9PT0gY29sb3JTdHlsZTIgKSB7XG5cblx0XHRcdFx0XHRzZXRTdHJva2VTdHlsZSggY29sb3JTdHlsZTEgKTtcblxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0dHJ5IHtcblxuXHRcdFx0XHRcdFx0dmFyIGdyYWQgPSBfY29udGV4dC5jcmVhdGVMaW5lYXJHcmFkaWVudChcblx0XHRcdFx0XHRcdFx0djEucG9zaXRpb25TY3JlZW4ueCxcblx0XHRcdFx0XHRcdFx0djEucG9zaXRpb25TY3JlZW4ueSxcblx0XHRcdFx0XHRcdFx0djIucG9zaXRpb25TY3JlZW4ueCxcblx0XHRcdFx0XHRcdFx0djIucG9zaXRpb25TY3JlZW4ueVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdGdyYWQuYWRkQ29sb3JTdG9wKCAwLCBjb2xvclN0eWxlMSApO1xuXHRcdFx0XHRcdFx0Z3JhZC5hZGRDb2xvclN0b3AoIDEsIGNvbG9yU3R5bGUyICk7XG5cblx0XHRcdFx0XHR9IGNhdGNoICggZXhjZXB0aW9uICkge1xuXG5cdFx0XHRcdFx0XHRncmFkID0gY29sb3JTdHlsZTE7XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRzZXRTdHJva2VTdHlsZSggZ3JhZCApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIG1hdGVyaWFsLmlzTGluZURhc2hlZE1hdGVyaWFsICkge1xuXG5cdFx0XHRcdHNldExpbmVEYXNoKCBbIG1hdGVyaWFsLmRhc2hTaXplLCBtYXRlcmlhbC5nYXBTaXplIF0gKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRfY29udGV4dC5zdHJva2UoKTtcblx0XHRcdF9lbGVtQm94LmV4cGFuZEJ5U2NhbGFyKCBtYXRlcmlhbC5saW5ld2lkdGggKiAyICk7XG5cblx0XHRcdGlmICggbWF0ZXJpYWwuaXNMaW5lRGFzaGVkTWF0ZXJpYWwgKSB7XG5cblx0XHRcdFx0c2V0TGluZURhc2goIFtdICk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHR9XG5cblx0ZnVuY3Rpb24gcmVuZGVyRmFjZTMoIHYxLCB2MiwgdjMsIHV2MSwgdXYyLCB1djMsIGVsZW1lbnQsIG1hdGVyaWFsICkge1xuXG5cdFx0X3RoaXMuaW5mby5yZW5kZXIudmVydGljZXMgKz0gMztcblx0XHRfdGhpcy5pbmZvLnJlbmRlci5mYWNlcyArKztcblxuXHRcdHNldE9wYWNpdHkoIG1hdGVyaWFsLm9wYWNpdHkgKTtcblx0XHRzZXRCbGVuZGluZyggbWF0ZXJpYWwuYmxlbmRpbmcgKTtcblxuXHRcdF92MXggPSB2MS5wb3NpdGlvblNjcmVlbi54OyBfdjF5ID0gdjEucG9zaXRpb25TY3JlZW4ueTtcblx0XHRfdjJ4ID0gdjIucG9zaXRpb25TY3JlZW4ueDsgX3YyeSA9IHYyLnBvc2l0aW9uU2NyZWVuLnk7XG5cdFx0X3YzeCA9IHYzLnBvc2l0aW9uU2NyZWVuLng7IF92M3kgPSB2My5wb3NpdGlvblNjcmVlbi55O1xuXG5cdFx0ZHJhd1RyaWFuZ2xlKCBfdjF4LCBfdjF5LCBfdjJ4LCBfdjJ5LCBfdjN4LCBfdjN5ICk7XG5cblx0XHRpZiAoICggbWF0ZXJpYWwuaXNNZXNoTGFtYmVydE1hdGVyaWFsIHx8IG1hdGVyaWFsLmlzTWVzaFBob25nTWF0ZXJpYWwgfHwgbWF0ZXJpYWwuaXNNZXNoU3RhbmRhcmRNYXRlcmlhbCApICYmIG1hdGVyaWFsLm1hcCA9PT0gbnVsbCApIHtcblxuXHRcdFx0X2RpZmZ1c2VDb2xvci5jb3B5KCBtYXRlcmlhbC5jb2xvciApO1xuXHRcdFx0X2VtaXNzaXZlQ29sb3IuY29weSggbWF0ZXJpYWwuZW1pc3NpdmUgKTtcblxuXHRcdFx0aWYgKCBtYXRlcmlhbC52ZXJ0ZXhDb2xvcnMgPT09IFRIUkVFLkZhY2VDb2xvcnMgKSB7XG5cblx0XHRcdFx0X2RpZmZ1c2VDb2xvci5tdWx0aXBseSggZWxlbWVudC5jb2xvciApO1xuXG5cdFx0XHR9XG5cblx0XHRcdF9jb2xvci5jb3B5KCBfYW1iaWVudExpZ2h0ICk7XG5cblx0XHRcdF9jZW50cm9pZC5jb3B5KCB2MS5wb3NpdGlvbldvcmxkICkuYWRkKCB2Mi5wb3NpdGlvbldvcmxkICkuYWRkKCB2My5wb3NpdGlvbldvcmxkICkuZGl2aWRlU2NhbGFyKCAzICk7XG5cblx0XHRcdGNhbGN1bGF0ZUxpZ2h0KCBfY2VudHJvaWQsIGVsZW1lbnQubm9ybWFsTW9kZWwsIF9jb2xvciApO1xuXG5cdFx0XHRfY29sb3IubXVsdGlwbHkoIF9kaWZmdXNlQ29sb3IgKS5hZGQoIF9lbWlzc2l2ZUNvbG9yICk7XG5cblx0XHRcdG1hdGVyaWFsLndpcmVmcmFtZSA9PT0gdHJ1ZVxuXHRcdFx0XHQgPyBzdHJva2VQYXRoKCBfY29sb3IsIG1hdGVyaWFsLndpcmVmcmFtZUxpbmV3aWR0aCwgbWF0ZXJpYWwud2lyZWZyYW1lTGluZWNhcCwgbWF0ZXJpYWwud2lyZWZyYW1lTGluZWpvaW4gKVxuXHRcdFx0XHQgOiBmaWxsUGF0aCggX2NvbG9yICk7XG5cblx0XHR9IGVsc2UgaWYgKCBtYXRlcmlhbC5pc01lc2hCYXNpY01hdGVyaWFsIHx8IG1hdGVyaWFsLmlzTWVzaExhbWJlcnRNYXRlcmlhbCB8fCBtYXRlcmlhbC5pc01lc2hQaG9uZ01hdGVyaWFsIHx8IG1hdGVyaWFsLmlzTWVzaFN0YW5kYXJkTWF0ZXJpYWwgKSB7XG5cblx0XHRcdGlmICggbWF0ZXJpYWwubWFwICE9PSBudWxsICkge1xuXG5cdFx0XHRcdHZhciBtYXBwaW5nID0gbWF0ZXJpYWwubWFwLm1hcHBpbmc7XG5cblx0XHRcdFx0aWYgKCBtYXBwaW5nID09PSBUSFJFRS5VVk1hcHBpbmcgKSB7XG5cblx0XHRcdFx0XHRfdXZzID0gZWxlbWVudC51dnM7XG5cdFx0XHRcdFx0cGF0dGVyblBhdGgoIF92MXgsIF92MXksIF92MngsIF92MnksIF92M3gsIF92M3ksIF91dnNbIHV2MSBdLngsIF91dnNbIHV2MSBdLnksIF91dnNbIHV2MiBdLngsIF91dnNbIHV2MiBdLnksIF91dnNbIHV2MyBdLngsIF91dnNbIHV2MyBdLnksIG1hdGVyaWFsLm1hcCApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0fSBlbHNlIGlmICggbWF0ZXJpYWwuZW52TWFwICE9PSBudWxsICkge1xuXG5cdFx0XHRcdGlmICggbWF0ZXJpYWwuZW52TWFwLm1hcHBpbmcgPT09IFRIUkVFLlNwaGVyaWNhbFJlZmxlY3Rpb25NYXBwaW5nICkge1xuXG5cdFx0XHRcdFx0X25vcm1hbC5jb3B5KCBlbGVtZW50LnZlcnRleE5vcm1hbHNNb2RlbFsgdXYxIF0gKS5hcHBseU1hdHJpeDMoIF9ub3JtYWxWaWV3TWF0cml4ICk7XG5cdFx0XHRcdFx0X3V2MXggPSAwLjUgKiBfbm9ybWFsLnggKyAwLjU7XG5cdFx0XHRcdFx0X3V2MXkgPSAwLjUgKiBfbm9ybWFsLnkgKyAwLjU7XG5cblx0XHRcdFx0XHRfbm9ybWFsLmNvcHkoIGVsZW1lbnQudmVydGV4Tm9ybWFsc01vZGVsWyB1djIgXSApLmFwcGx5TWF0cml4MyggX25vcm1hbFZpZXdNYXRyaXggKTtcblx0XHRcdFx0XHRfdXYyeCA9IDAuNSAqIF9ub3JtYWwueCArIDAuNTtcblx0XHRcdFx0XHRfdXYyeSA9IDAuNSAqIF9ub3JtYWwueSArIDAuNTtcblxuXHRcdFx0XHRcdF9ub3JtYWwuY29weSggZWxlbWVudC52ZXJ0ZXhOb3JtYWxzTW9kZWxbIHV2MyBdICkuYXBwbHlNYXRyaXgzKCBfbm9ybWFsVmlld01hdHJpeCApO1xuXHRcdFx0XHRcdF91djN4ID0gMC41ICogX25vcm1hbC54ICsgMC41O1xuXHRcdFx0XHRcdF91djN5ID0gMC41ICogX25vcm1hbC55ICsgMC41O1xuXG5cdFx0XHRcdFx0cGF0dGVyblBhdGgoIF92MXgsIF92MXksIF92MngsIF92MnksIF92M3gsIF92M3ksIF91djF4LCBfdXYxeSwgX3V2MngsIF91djJ5LCBfdXYzeCwgX3V2M3ksIG1hdGVyaWFsLmVudk1hcCApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRfY29sb3IuY29weSggbWF0ZXJpYWwuY29sb3IgKTtcblxuXHRcdFx0XHRpZiAoIG1hdGVyaWFsLnZlcnRleENvbG9ycyA9PT0gVEhSRUUuRmFjZUNvbG9ycyApIHtcblxuXHRcdFx0XHRcdF9jb2xvci5tdWx0aXBseSggZWxlbWVudC5jb2xvciApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRtYXRlcmlhbC53aXJlZnJhbWUgPT09IHRydWVcblx0XHRcdFx0XHQgPyBzdHJva2VQYXRoKCBfY29sb3IsIG1hdGVyaWFsLndpcmVmcmFtZUxpbmV3aWR0aCwgbWF0ZXJpYWwud2lyZWZyYW1lTGluZWNhcCwgbWF0ZXJpYWwud2lyZWZyYW1lTGluZWpvaW4gKVxuXHRcdFx0XHRcdCA6IGZpbGxQYXRoKCBfY29sb3IgKTtcblxuXHRcdFx0fVxuXG5cdFx0fSBlbHNlIGlmICggbWF0ZXJpYWwuaXNNZXNoTm9ybWFsTWF0ZXJpYWwgKSB7XG5cblx0XHRcdF9ub3JtYWwuY29weSggZWxlbWVudC5ub3JtYWxNb2RlbCApLmFwcGx5TWF0cml4MyggX25vcm1hbFZpZXdNYXRyaXggKTtcblxuXHRcdFx0X2NvbG9yLnNldFJHQiggX25vcm1hbC54LCBfbm9ybWFsLnksIF9ub3JtYWwueiApLm11bHRpcGx5U2NhbGFyKCAwLjUgKS5hZGRTY2FsYXIoIDAuNSApO1xuXG5cdFx0XHRtYXRlcmlhbC53aXJlZnJhbWUgPT09IHRydWVcblx0XHRcdFx0ID8gc3Ryb2tlUGF0aCggX2NvbG9yLCBtYXRlcmlhbC53aXJlZnJhbWVMaW5ld2lkdGgsIG1hdGVyaWFsLndpcmVmcmFtZUxpbmVjYXAsIG1hdGVyaWFsLndpcmVmcmFtZUxpbmVqb2luIClcblx0XHRcdFx0IDogZmlsbFBhdGgoIF9jb2xvciApO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0X2NvbG9yLnNldFJHQiggMSwgMSwgMSApO1xuXG5cdFx0XHRtYXRlcmlhbC53aXJlZnJhbWUgPT09IHRydWVcblx0XHRcdFx0ID8gc3Ryb2tlUGF0aCggX2NvbG9yLCBtYXRlcmlhbC53aXJlZnJhbWVMaW5ld2lkdGgsIG1hdGVyaWFsLndpcmVmcmFtZUxpbmVjYXAsIG1hdGVyaWFsLndpcmVmcmFtZUxpbmVqb2luIClcblx0XHRcdFx0IDogZmlsbFBhdGgoIF9jb2xvciApO1xuXG5cdFx0fVxuXG5cdH1cblxuXHQvL1xuXG5cdGZ1bmN0aW9uIGRyYXdUcmlhbmdsZSggeDAsIHkwLCB4MSwgeTEsIHgyLCB5MiApIHtcblxuXHRcdF9jb250ZXh0LmJlZ2luUGF0aCgpO1xuXHRcdF9jb250ZXh0Lm1vdmVUbyggeDAsIHkwICk7XG5cdFx0X2NvbnRleHQubGluZVRvKCB4MSwgeTEgKTtcblx0XHRfY29udGV4dC5saW5lVG8oIHgyLCB5MiApO1xuXHRcdF9jb250ZXh0LmNsb3NlUGF0aCgpO1xuXG5cdH1cblxuXHRmdW5jdGlvbiBzdHJva2VQYXRoKCBjb2xvciwgbGluZXdpZHRoLCBsaW5lY2FwLCBsaW5lam9pbiApIHtcblxuXHRcdHNldExpbmVXaWR0aCggbGluZXdpZHRoICk7XG5cdFx0c2V0TGluZUNhcCggbGluZWNhcCApO1xuXHRcdHNldExpbmVKb2luKCBsaW5lam9pbiApO1xuXHRcdHNldFN0cm9rZVN0eWxlKCBjb2xvci5nZXRTdHlsZSgpICk7XG5cblx0XHRfY29udGV4dC5zdHJva2UoKTtcblxuXHRcdF9lbGVtQm94LmV4cGFuZEJ5U2NhbGFyKCBsaW5ld2lkdGggKiAyICk7XG5cblx0fVxuXG5cdGZ1bmN0aW9uIGZpbGxQYXRoKCBjb2xvciApIHtcblxuXHRcdHNldEZpbGxTdHlsZSggY29sb3IuZ2V0U3R5bGUoKSApO1xuXHRcdF9jb250ZXh0LmZpbGwoKTtcblxuXHR9XG5cblx0ZnVuY3Rpb24gdGV4dHVyZVRvUGF0dGVybiggdGV4dHVyZSApIHtcblxuXHRcdGlmICggdGV4dHVyZS52ZXJzaW9uID09PSAwIHx8XG5cdFx0XHR0ZXh0dXJlIGluc3RhbmNlb2YgVEhSRUUuQ29tcHJlc3NlZFRleHR1cmUgfHxcblx0XHRcdHRleHR1cmUgaW5zdGFuY2VvZiBUSFJFRS5EYXRhVGV4dHVyZSApIHtcblxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0Y2FudmFzOiB1bmRlZmluZWQsXG5cdFx0XHRcdHZlcnNpb246IHRleHR1cmUudmVyc2lvblxuXHRcdFx0fTtcblxuXHRcdH1cblxuXHRcdHZhciBpbWFnZSA9IHRleHR1cmUuaW1hZ2U7XG5cblx0XHRpZiAoIGltYWdlLmNvbXBsZXRlID09PSBmYWxzZSApIHtcblxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0Y2FudmFzOiB1bmRlZmluZWQsXG5cdFx0XHRcdHZlcnNpb246IDBcblx0XHRcdH07XG5cblx0XHR9XG5cblx0XHR2YXIgcmVwZWF0WCA9IHRleHR1cmUud3JhcFMgPT09IFRIUkVFLlJlcGVhdFdyYXBwaW5nIHx8IHRleHR1cmUud3JhcFMgPT09IFRIUkVFLk1pcnJvcmVkUmVwZWF0V3JhcHBpbmc7XG5cdFx0dmFyIHJlcGVhdFkgPSB0ZXh0dXJlLndyYXBUID09PSBUSFJFRS5SZXBlYXRXcmFwcGluZyB8fCB0ZXh0dXJlLndyYXBUID09PSBUSFJFRS5NaXJyb3JlZFJlcGVhdFdyYXBwaW5nO1xuXG5cdFx0dmFyIG1pcnJvclggPSB0ZXh0dXJlLndyYXBTID09PSBUSFJFRS5NaXJyb3JlZFJlcGVhdFdyYXBwaW5nO1xuXHRcdHZhciBtaXJyb3JZID0gdGV4dHVyZS53cmFwVCA9PT0gVEhSRUUuTWlycm9yZWRSZXBlYXRXcmFwcGluZztcblxuXHRcdC8vXG5cblx0XHR2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcblx0XHRjYW52YXMud2lkdGggPSBpbWFnZS53aWR0aCAqICggbWlycm9yWCA/IDIgOiAxICk7XG5cdFx0Y2FudmFzLmhlaWdodCA9IGltYWdlLmhlaWdodCAqICggbWlycm9yWSA/IDIgOiAxICk7XG5cblx0XHR2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCAnMmQnICk7XG5cdFx0Y29udGV4dC5zZXRUcmFuc2Zvcm0oIDEsIDAsIDAsIC0gMSwgMCwgaW1hZ2UuaGVpZ2h0ICk7XG5cdFx0Y29udGV4dC5kcmF3SW1hZ2UoIGltYWdlLCAwLCAwICk7XG5cblx0XHRpZiAoIG1pcnJvclggPT09IHRydWUgKSB7XG5cblx0XHRcdGNvbnRleHQuc2V0VHJhbnNmb3JtKCAtIDEsIDAsIDAsIC0gMSwgaW1hZ2Uud2lkdGgsIGltYWdlLmhlaWdodCApO1xuXHRcdFx0Y29udGV4dC5kcmF3SW1hZ2UoIGltYWdlLCAtIGltYWdlLndpZHRoLCAwICk7XG5cblx0XHR9XG5cblx0XHRpZiAoIG1pcnJvclkgPT09IHRydWUgKSB7XG5cblx0XHRcdGNvbnRleHQuc2V0VHJhbnNmb3JtKCAxLCAwLCAwLCAxLCAwLCAwICk7XG5cdFx0XHRjb250ZXh0LmRyYXdJbWFnZSggaW1hZ2UsIDAsIGltYWdlLmhlaWdodCApO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCBtaXJyb3JYID09PSB0cnVlICYmIG1pcnJvclkgPT09IHRydWUgKSB7XG5cblx0XHRcdGNvbnRleHQuc2V0VHJhbnNmb3JtKCAtIDEsIDAsIDAsIDEsIGltYWdlLndpZHRoLCAwICk7XG5cdFx0XHRjb250ZXh0LmRyYXdJbWFnZSggaW1hZ2UsIC0gaW1hZ2Uud2lkdGgsIGltYWdlLmhlaWdodCApO1xuXG5cdFx0fVxuXG5cdFx0dmFyIHJlcGVhdCA9ICduby1yZXBlYXQnO1xuXG5cdFx0aWYgKCByZXBlYXRYID09PSB0cnVlICYmIHJlcGVhdFkgPT09IHRydWUgKSB7XG5cblx0XHRcdHJlcGVhdCA9ICdyZXBlYXQnO1xuXG5cdFx0fSBlbHNlIGlmICggcmVwZWF0WCA9PT0gdHJ1ZSApIHtcblxuXHRcdFx0cmVwZWF0ID0gJ3JlcGVhdC14JztcblxuXHRcdH0gZWxzZSBpZiAoIHJlcGVhdFkgPT09IHRydWUgKSB7XG5cblx0XHRcdHJlcGVhdCA9ICdyZXBlYXQteSc7XG5cblx0XHR9XG5cblx0XHR2YXIgcGF0dGVybiA9IF9jb250ZXh0LmNyZWF0ZVBhdHRlcm4oIGNhbnZhcywgcmVwZWF0ICk7XG5cblx0XHRpZiAoIHRleHR1cmUub25VcGRhdGUgKSB0ZXh0dXJlLm9uVXBkYXRlKCB0ZXh0dXJlICk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0Y2FudmFzOiBwYXR0ZXJuLFxuXHRcdFx0dmVyc2lvbjogdGV4dHVyZS52ZXJzaW9uXG5cdFx0fTtcblxuXHR9XG5cblx0ZnVuY3Rpb24gcGF0dGVyblBhdGgoIHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIsIHUwLCB2MCwgdTEsIHYxLCB1MiwgdjIsIHRleHR1cmUgKSB7XG5cblx0XHR2YXIgcGF0dGVybiA9IF9wYXR0ZXJuc1sgdGV4dHVyZS5pZCBdO1xuXG5cdFx0aWYgKCBwYXR0ZXJuID09PSB1bmRlZmluZWQgfHwgcGF0dGVybi52ZXJzaW9uICE9PSB0ZXh0dXJlLnZlcnNpb24gKSB7XG5cblx0XHRcdHBhdHRlcm4gPSB0ZXh0dXJlVG9QYXR0ZXJuKCB0ZXh0dXJlICk7XG5cdFx0XHRfcGF0dGVybnNbIHRleHR1cmUuaWQgXSA9IHBhdHRlcm47XG5cblx0XHR9XG5cblx0XHRpZiAoIHBhdHRlcm4uY2FudmFzICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdHNldEZpbGxTdHlsZSggcGF0dGVybi5jYW52YXMgKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdHNldEZpbGxTdHlsZSggJ3JnYmEoIDAsIDAsIDAsIDEpJyApO1xuXHRcdFx0X2NvbnRleHQuZmlsbCgpO1xuXHRcdFx0cmV0dXJuO1xuXG5cdFx0fVxuXG5cdFx0Ly8gaHR0cDovL2V4dHJlbWVseXNhdGlzZmFjdG9yeXRvdGFsaXRhcmlhbmlzbS5jb20vYmxvZy8/cD0yMTIwXG5cblx0XHR2YXIgYSwgYiwgYywgZCwgZSwgZiwgZGV0LCBpZGV0LFxuXHRcdFx0b2Zmc2V0WCA9IHRleHR1cmUub2Zmc2V0LnggLyB0ZXh0dXJlLnJlcGVhdC54LFxuXHRcdFx0b2Zmc2V0WSA9IHRleHR1cmUub2Zmc2V0LnkgLyB0ZXh0dXJlLnJlcGVhdC55LFxuXHRcdFx0d2lkdGggPSB0ZXh0dXJlLmltYWdlLndpZHRoICogdGV4dHVyZS5yZXBlYXQueCxcblx0XHRcdGhlaWdodCA9IHRleHR1cmUuaW1hZ2UuaGVpZ2h0ICogdGV4dHVyZS5yZXBlYXQueTtcblxuXHRcdHUwID0gKCB1MCArIG9mZnNldFggKSAqIHdpZHRoO1xuXHRcdHYwID0gKCB2MCArIG9mZnNldFkgKSAqIGhlaWdodDtcblxuXHRcdHUxID0gKCB1MSArIG9mZnNldFggKSAqIHdpZHRoO1xuXHRcdHYxID0gKCB2MSArIG9mZnNldFkgKSAqIGhlaWdodDtcblxuXHRcdHUyID0gKCB1MiArIG9mZnNldFggKSAqIHdpZHRoO1xuXHRcdHYyID0gKCB2MiArIG9mZnNldFkgKSAqIGhlaWdodDtcblxuXHRcdHgxIC09IHgwOyB5MSAtPSB5MDtcblx0XHR4MiAtPSB4MDsgeTIgLT0geTA7XG5cblx0XHR1MSAtPSB1MDsgdjEgLT0gdjA7XG5cdFx0dTIgLT0gdTA7IHYyIC09IHYwO1xuXG5cdFx0ZGV0ID0gdTEgKiB2MiAtIHUyICogdjE7XG5cblx0XHRpZiAoIGRldCA9PT0gMCApIHJldHVybjtcblxuXHRcdGlkZXQgPSAxIC8gZGV0O1xuXG5cdFx0YSA9ICggdjIgKiB4MSAtIHYxICogeDIgKSAqIGlkZXQ7XG5cdFx0YiA9ICggdjIgKiB5MSAtIHYxICogeTIgKSAqIGlkZXQ7XG5cdFx0YyA9ICggdTEgKiB4MiAtIHUyICogeDEgKSAqIGlkZXQ7XG5cdFx0ZCA9ICggdTEgKiB5MiAtIHUyICogeTEgKSAqIGlkZXQ7XG5cblx0XHRlID0geDAgLSBhICogdTAgLSBjICogdjA7XG5cdFx0ZiA9IHkwIC0gYiAqIHUwIC0gZCAqIHYwO1xuXG5cdFx0X2NvbnRleHQuc2F2ZSgpO1xuXHRcdF9jb250ZXh0LnRyYW5zZm9ybSggYSwgYiwgYywgZCwgZSwgZiApO1xuXHRcdF9jb250ZXh0LmZpbGwoKTtcblx0XHRfY29udGV4dC5yZXN0b3JlKCk7XG5cblx0fVxuXG5cdC8qXG5cdGZ1bmN0aW9uIGNsaXBJbWFnZSggeDAsIHkwLCB4MSwgeTEsIHgyLCB5MiwgdTAsIHYwLCB1MSwgdjEsIHUyLCB2MiwgaW1hZ2UgKSB7XG5cblx0XHQvLyBodHRwOi8vZXh0cmVtZWx5c2F0aXNmYWN0b3J5dG90YWxpdGFyaWFuaXNtLmNvbS9ibG9nLz9wPTIxMjBcblxuXHRcdHZhciBhLCBiLCBjLCBkLCBlLCBmLCBkZXQsIGlkZXQsXG5cdFx0d2lkdGggPSBpbWFnZS53aWR0aCAtIDEsXG5cdFx0aGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0IC0gMTtcblxuXHRcdHUwICo9IHdpZHRoOyB2MCAqPSBoZWlnaHQ7XG5cdFx0dTEgKj0gd2lkdGg7IHYxICo9IGhlaWdodDtcblx0XHR1MiAqPSB3aWR0aDsgdjIgKj0gaGVpZ2h0O1xuXG5cdFx0eDEgLT0geDA7IHkxIC09IHkwO1xuXHRcdHgyIC09IHgwOyB5MiAtPSB5MDtcblxuXHRcdHUxIC09IHUwOyB2MSAtPSB2MDtcblx0XHR1MiAtPSB1MDsgdjIgLT0gdjA7XG5cblx0XHRkZXQgPSB1MSAqIHYyIC0gdTIgKiB2MTtcblxuXHRcdGlkZXQgPSAxIC8gZGV0O1xuXG5cdFx0YSA9ICggdjIgKiB4MSAtIHYxICogeDIgKSAqIGlkZXQ7XG5cdFx0YiA9ICggdjIgKiB5MSAtIHYxICogeTIgKSAqIGlkZXQ7XG5cdFx0YyA9ICggdTEgKiB4MiAtIHUyICogeDEgKSAqIGlkZXQ7XG5cdFx0ZCA9ICggdTEgKiB5MiAtIHUyICogeTEgKSAqIGlkZXQ7XG5cblx0XHRlID0geDAgLSBhICogdTAgLSBjICogdjA7XG5cdFx0ZiA9IHkwIC0gYiAqIHUwIC0gZCAqIHYwO1xuXG5cdFx0X2NvbnRleHQuc2F2ZSgpO1xuXHRcdF9jb250ZXh0LnRyYW5zZm9ybSggYSwgYiwgYywgZCwgZSwgZiApO1xuXHRcdF9jb250ZXh0LmNsaXAoKTtcblx0XHRfY29udGV4dC5kcmF3SW1hZ2UoIGltYWdlLCAwLCAwICk7XG5cdFx0X2NvbnRleHQucmVzdG9yZSgpO1xuXG5cdH1cblx0Ki9cblxuXHQvLyBIaWRlIGFudGktYWxpYXMgZ2Fwc1xuXG5cdGZ1bmN0aW9uIGV4cGFuZCggdjEsIHYyLCBwaXhlbHMgKSB7XG5cblx0XHR2YXIgeCA9IHYyLnggLSB2MS54LCB5ID0gdjIueSAtIHYxLnksXG5cdFx0XHRkZXQgPSB4ICogeCArIHkgKiB5LCBpZGV0O1xuXG5cdFx0aWYgKCBkZXQgPT09IDAgKSByZXR1cm47XG5cblx0XHRpZGV0ID0gcGl4ZWxzIC8gTWF0aC5zcXJ0KCBkZXQgKTtcblxuXHRcdHggKj0gaWRldDsgeSAqPSBpZGV0O1xuXG5cdFx0djIueCArPSB4OyB2Mi55ICs9IHk7XG5cdFx0djEueCAtPSB4OyB2MS55IC09IHk7XG5cblx0fVxuXG5cdC8vIENvbnRleHQgY2FjaGVkIG1ldGhvZHMuXG5cblx0ZnVuY3Rpb24gc2V0T3BhY2l0eSggdmFsdWUgKSB7XG5cblx0XHRpZiAoIF9jb250ZXh0R2xvYmFsQWxwaGEgIT09IHZhbHVlICkge1xuXG5cdFx0XHRfY29udGV4dC5nbG9iYWxBbHBoYSA9IHZhbHVlO1xuXHRcdFx0X2NvbnRleHRHbG9iYWxBbHBoYSA9IHZhbHVlO1xuXG5cdFx0fVxuXG5cdH1cblxuXHRmdW5jdGlvbiBzZXRCbGVuZGluZyggdmFsdWUgKSB7XG5cblx0XHRpZiAoIF9jb250ZXh0R2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uICE9PSB2YWx1ZSApIHtcblxuXHRcdFx0aWYgKCB2YWx1ZSA9PT0gVEhSRUUuTm9ybWFsQmxlbmRpbmcgKSB7XG5cblx0XHRcdFx0X2NvbnRleHQuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1vdmVyJztcblxuXHRcdFx0fSBlbHNlIGlmICggdmFsdWUgPT09IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcgKSB7XG5cblx0XHRcdFx0X2NvbnRleHQuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2xpZ2h0ZXInO1xuXG5cdFx0XHR9IGVsc2UgaWYgKCB2YWx1ZSA9PT0gVEhSRUUuU3VidHJhY3RpdmVCbGVuZGluZyApIHtcblxuXHRcdFx0XHRfY29udGV4dC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnZGFya2VyJztcblxuXHRcdFx0fSBlbHNlIGlmICggdmFsdWUgPT09IFRIUkVFLk11bHRpcGx5QmxlbmRpbmcgKSB7XG5cblx0XHRcdFx0X2NvbnRleHQuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ211bHRpcGx5JztcblxuXHRcdFx0fVxuXG5cdFx0XHRfY29udGV4dEdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9IHZhbHVlO1xuXG5cdFx0fVxuXG5cdH1cblxuXHRmdW5jdGlvbiBzZXRMaW5lV2lkdGgoIHZhbHVlICkge1xuXG5cdFx0aWYgKCBfY29udGV4dExpbmVXaWR0aCAhPT0gdmFsdWUgKSB7XG5cblx0XHRcdF9jb250ZXh0LmxpbmVXaWR0aCA9IHZhbHVlO1xuXHRcdFx0X2NvbnRleHRMaW5lV2lkdGggPSB2YWx1ZTtcblxuXHRcdH1cblxuXHR9XG5cblx0ZnVuY3Rpb24gc2V0TGluZUNhcCggdmFsdWUgKSB7XG5cblx0XHQvLyBcImJ1dHRcIiwgXCJyb3VuZFwiLCBcInNxdWFyZVwiXG5cblx0XHRpZiAoIF9jb250ZXh0TGluZUNhcCAhPT0gdmFsdWUgKSB7XG5cblx0XHRcdF9jb250ZXh0LmxpbmVDYXAgPSB2YWx1ZTtcblx0XHRcdF9jb250ZXh0TGluZUNhcCA9IHZhbHVlO1xuXG5cdFx0fVxuXG5cdH1cblxuXHRmdW5jdGlvbiBzZXRMaW5lSm9pbiggdmFsdWUgKSB7XG5cblx0XHQvLyBcInJvdW5kXCIsIFwiYmV2ZWxcIiwgXCJtaXRlclwiXG5cblx0XHRpZiAoIF9jb250ZXh0TGluZUpvaW4gIT09IHZhbHVlICkge1xuXG5cdFx0XHRfY29udGV4dC5saW5lSm9pbiA9IHZhbHVlO1xuXHRcdFx0X2NvbnRleHRMaW5lSm9pbiA9IHZhbHVlO1xuXG5cdFx0fVxuXG5cdH1cblxuXHRmdW5jdGlvbiBzZXRTdHJva2VTdHlsZSggdmFsdWUgKSB7XG5cblx0XHRpZiAoIF9jb250ZXh0U3Ryb2tlU3R5bGUgIT09IHZhbHVlICkge1xuXG5cdFx0XHRfY29udGV4dC5zdHJva2VTdHlsZSA9IHZhbHVlO1xuXHRcdFx0X2NvbnRleHRTdHJva2VTdHlsZSA9IHZhbHVlO1xuXG5cdFx0fVxuXG5cdH1cblxuXHRmdW5jdGlvbiBzZXRGaWxsU3R5bGUoIHZhbHVlICkge1xuXG5cdFx0aWYgKCBfY29udGV4dEZpbGxTdHlsZSAhPT0gdmFsdWUgKSB7XG5cblx0XHRcdF9jb250ZXh0LmZpbGxTdHlsZSA9IHZhbHVlO1xuXHRcdFx0X2NvbnRleHRGaWxsU3R5bGUgPSB2YWx1ZTtcblxuXHRcdH1cblxuXHR9XG5cblx0ZnVuY3Rpb24gc2V0TGluZURhc2goIHZhbHVlICkge1xuXG5cdFx0aWYgKCBfY29udGV4dExpbmVEYXNoLmxlbmd0aCAhPT0gdmFsdWUubGVuZ3RoICkge1xuXG5cdFx0XHRfY29udGV4dC5zZXRMaW5lRGFzaCggdmFsdWUgKTtcblx0XHRcdF9jb250ZXh0TGluZURhc2ggPSB2YWx1ZTtcblxuXHRcdH1cblxuXHR9XG5cbn07XG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cbi8qKlxuICogQGF1dGhvciBtcmRvb2IgLyBodHRwOi8vbXJkb29iLmNvbS9cbiAqIEBhdXRob3Igc3VwZXJlZ2diZXJ0IC8gaHR0cDovL3d3dy5wYXVsYnJ1bnQuY28udWsvXG4gKiBAYXV0aG9yIGp1bGlhbndhIC8gaHR0cHM6Ly9naXRodWIuY29tL2p1bGlhbndhXG4gKi9cblxuVEhSRUUuUmVuZGVyYWJsZU9iamVjdCA9IGZ1bmN0aW9uICgpIHtcblxuXHR0aGlzLmlkID0gMDtcblxuXHR0aGlzLm9iamVjdCA9IG51bGw7XG5cdHRoaXMueiA9IDA7XG5cdHRoaXMucmVuZGVyT3JkZXIgPSAwO1xuXG59O1xuXG4vL1xuXG5USFJFRS5SZW5kZXJhYmxlRmFjZSA9IGZ1bmN0aW9uICgpIHtcblxuXHR0aGlzLmlkID0gMDtcblxuXHR0aGlzLnYxID0gbmV3IFRIUkVFLlJlbmRlcmFibGVWZXJ0ZXgoKTtcblx0dGhpcy52MiA9IG5ldyBUSFJFRS5SZW5kZXJhYmxlVmVydGV4KCk7XG5cdHRoaXMudjMgPSBuZXcgVEhSRUUuUmVuZGVyYWJsZVZlcnRleCgpO1xuXG5cdHRoaXMubm9ybWFsTW9kZWwgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXG5cdHRoaXMudmVydGV4Tm9ybWFsc01vZGVsID0gWyBuZXcgVEhSRUUuVmVjdG9yMygpLCBuZXcgVEhSRUUuVmVjdG9yMygpLCBuZXcgVEhSRUUuVmVjdG9yMygpIF07XG5cdHRoaXMudmVydGV4Tm9ybWFsc0xlbmd0aCA9IDA7XG5cblx0dGhpcy5jb2xvciA9IG5ldyBUSFJFRS5Db2xvcigpO1xuXHR0aGlzLm1hdGVyaWFsID0gbnVsbDtcblx0dGhpcy51dnMgPSBbIG5ldyBUSFJFRS5WZWN0b3IyKCksIG5ldyBUSFJFRS5WZWN0b3IyKCksIG5ldyBUSFJFRS5WZWN0b3IyKCkgXTtcblxuXHR0aGlzLnogPSAwO1xuXHR0aGlzLnJlbmRlck9yZGVyID0gMDtcblxufTtcblxuLy9cblxuVEhSRUUuUmVuZGVyYWJsZVZlcnRleCA9IGZ1bmN0aW9uICgpIHtcblxuXHR0aGlzLnBvc2l0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblx0dGhpcy5wb3NpdGlvbldvcmxkID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblx0dGhpcy5wb3NpdGlvblNjcmVlbiA9IG5ldyBUSFJFRS5WZWN0b3I0KCk7XG5cblx0dGhpcy52aXNpYmxlID0gdHJ1ZTtcblxufTtcblxuVEhSRUUuUmVuZGVyYWJsZVZlcnRleC5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uICggdmVydGV4ICkge1xuXG5cdHRoaXMucG9zaXRpb25Xb3JsZC5jb3B5KCB2ZXJ0ZXgucG9zaXRpb25Xb3JsZCApO1xuXHR0aGlzLnBvc2l0aW9uU2NyZWVuLmNvcHkoIHZlcnRleC5wb3NpdGlvblNjcmVlbiApO1xuXG59O1xuXG4vL1xuXG5USFJFRS5SZW5kZXJhYmxlTGluZSA9IGZ1bmN0aW9uICgpIHtcblxuXHR0aGlzLmlkID0gMDtcblxuXHR0aGlzLnYxID0gbmV3IFRIUkVFLlJlbmRlcmFibGVWZXJ0ZXgoKTtcblx0dGhpcy52MiA9IG5ldyBUSFJFRS5SZW5kZXJhYmxlVmVydGV4KCk7XG5cblx0dGhpcy52ZXJ0ZXhDb2xvcnMgPSBbIG5ldyBUSFJFRS5Db2xvcigpLCBuZXcgVEhSRUUuQ29sb3IoKSBdO1xuXHR0aGlzLm1hdGVyaWFsID0gbnVsbDtcblxuXHR0aGlzLnogPSAwO1xuXHR0aGlzLnJlbmRlck9yZGVyID0gMDtcblxufTtcblxuLy9cblxuVEhSRUUuUmVuZGVyYWJsZVNwcml0ZSA9IGZ1bmN0aW9uICgpIHtcblxuXHR0aGlzLmlkID0gMDtcblxuXHR0aGlzLm9iamVjdCA9IG51bGw7XG5cblx0dGhpcy54ID0gMDtcblx0dGhpcy55ID0gMDtcblx0dGhpcy56ID0gMDtcblxuXHR0aGlzLnJvdGF0aW9uID0gMDtcblx0dGhpcy5zY2FsZSA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cblx0dGhpcy5tYXRlcmlhbCA9IG51bGw7XG5cdHRoaXMucmVuZGVyT3JkZXIgPSAwO1xuXG59O1xuXG4vL1xuXG5USFJFRS5Qcm9qZWN0b3IgPSBmdW5jdGlvbiAoKSB7XG5cblx0dmFyIF9vYmplY3QsIF9vYmplY3RDb3VudCwgX29iamVjdFBvb2wgPSBbXSwgX29iamVjdFBvb2xMZW5ndGggPSAwLFxuXHRcdF92ZXJ0ZXgsIF92ZXJ0ZXhDb3VudCwgX3ZlcnRleFBvb2wgPSBbXSwgX3ZlcnRleFBvb2xMZW5ndGggPSAwLFxuXHRcdF9mYWNlLCBfZmFjZUNvdW50LCBfZmFjZVBvb2wgPSBbXSwgX2ZhY2VQb29sTGVuZ3RoID0gMCxcblx0XHRfbGluZSwgX2xpbmVDb3VudCwgX2xpbmVQb29sID0gW10sIF9saW5lUG9vbExlbmd0aCA9IDAsXG5cdFx0X3Nwcml0ZSwgX3Nwcml0ZUNvdW50LCBfc3ByaXRlUG9vbCA9IFtdLCBfc3ByaXRlUG9vbExlbmd0aCA9IDAsXG5cblx0XHRfcmVuZGVyRGF0YSA9IHsgb2JqZWN0czogW10sIGxpZ2h0czogW10sIGVsZW1lbnRzOiBbXSB9LFxuXG5cdFx0X3ZlY3RvcjMgPSBuZXcgVEhSRUUuVmVjdG9yMygpLFxuXHRcdF92ZWN0b3I0ID0gbmV3IFRIUkVFLlZlY3RvcjQoKSxcblxuXHRcdF9jbGlwQm94ID0gbmV3IFRIUkVFLkJveDMoIG5ldyBUSFJFRS5WZWN0b3IzKCAtIDEsIC0gMSwgLSAxICksIG5ldyBUSFJFRS5WZWN0b3IzKCAxLCAxLCAxICkgKSxcblx0XHRfYm91bmRpbmdCb3ggPSBuZXcgVEhSRUUuQm94MygpLFxuXHRcdF9wb2ludHMzID0gbmV3IEFycmF5KCAzICksXG5cblx0XHRfdmlld01hdHJpeCA9IG5ldyBUSFJFRS5NYXRyaXg0KCksXG5cdFx0X3ZpZXdQcm9qZWN0aW9uTWF0cml4ID0gbmV3IFRIUkVFLk1hdHJpeDQoKSxcblxuXHRcdF9tb2RlbE1hdHJpeCxcblx0XHRfbW9kZWxWaWV3UHJvamVjdGlvbk1hdHJpeCA9IG5ldyBUSFJFRS5NYXRyaXg0KCksXG5cblx0XHRfbm9ybWFsTWF0cml4ID0gbmV3IFRIUkVFLk1hdHJpeDMoKSxcblxuXHRcdF9mcnVzdHVtID0gbmV3IFRIUkVFLkZydXN0dW0oKSxcblxuXHRcdF9jbGlwcGVkVmVydGV4MVBvc2l0aW9uU2NyZWVuID0gbmV3IFRIUkVFLlZlY3RvcjQoKSxcblx0XHRfY2xpcHBlZFZlcnRleDJQb3NpdGlvblNjcmVlbiA9IG5ldyBUSFJFRS5WZWN0b3I0KCk7XG5cblx0Ly9cblxuXHR0aGlzLnByb2plY3RWZWN0b3IgPSBmdW5jdGlvbiAoIHZlY3RvciwgY2FtZXJhICkge1xuXG5cdFx0Y29uc29sZS53YXJuKCAnVEhSRUUuUHJvamVjdG9yOiAucHJvamVjdFZlY3RvcigpIGlzIG5vdyB2ZWN0b3IucHJvamVjdCgpLicgKTtcblx0XHR2ZWN0b3IucHJvamVjdCggY2FtZXJhICk7XG5cblx0fTtcblxuXHR0aGlzLnVucHJvamVjdFZlY3RvciA9IGZ1bmN0aW9uICggdmVjdG9yLCBjYW1lcmEgKSB7XG5cblx0XHRjb25zb2xlLndhcm4oICdUSFJFRS5Qcm9qZWN0b3I6IC51bnByb2plY3RWZWN0b3IoKSBpcyBub3cgdmVjdG9yLnVucHJvamVjdCgpLicgKTtcblx0XHR2ZWN0b3IudW5wcm9qZWN0KCBjYW1lcmEgKTtcblxuXHR9O1xuXG5cdHRoaXMucGlja2luZ1JheSA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdGNvbnNvbGUuZXJyb3IoICdUSFJFRS5Qcm9qZWN0b3I6IC5waWNraW5nUmF5KCkgaXMgbm93IHJheWNhc3Rlci5zZXRGcm9tQ2FtZXJhKCkuJyApO1xuXG5cdH07XG5cblx0Ly9cblxuXHR2YXIgUmVuZGVyTGlzdCA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdHZhciBub3JtYWxzID0gW107XG5cdFx0dmFyIGNvbG9ycyA9IFtdO1xuXHRcdHZhciB1dnMgPSBbXTtcblxuXHRcdHZhciBvYmplY3QgPSBudWxsO1xuXHRcdHZhciBtYXRlcmlhbCA9IG51bGw7XG5cblx0XHR2YXIgbm9ybWFsTWF0cml4ID0gbmV3IFRIUkVFLk1hdHJpeDMoKTtcblxuXHRcdGZ1bmN0aW9uIHNldE9iamVjdCggdmFsdWUgKSB7XG5cblx0XHRcdG9iamVjdCA9IHZhbHVlO1xuXHRcdFx0bWF0ZXJpYWwgPSBvYmplY3QubWF0ZXJpYWw7XG5cblx0XHRcdG5vcm1hbE1hdHJpeC5nZXROb3JtYWxNYXRyaXgoIG9iamVjdC5tYXRyaXhXb3JsZCApO1xuXG5cdFx0XHRub3JtYWxzLmxlbmd0aCA9IDA7XG5cdFx0XHRjb2xvcnMubGVuZ3RoID0gMDtcblx0XHRcdHV2cy5sZW5ndGggPSAwO1xuXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gcHJvamVjdFZlcnRleCggdmVydGV4ICkge1xuXG5cdFx0XHR2YXIgcG9zaXRpb24gPSB2ZXJ0ZXgucG9zaXRpb247XG5cdFx0XHR2YXIgcG9zaXRpb25Xb3JsZCA9IHZlcnRleC5wb3NpdGlvbldvcmxkO1xuXHRcdFx0dmFyIHBvc2l0aW9uU2NyZWVuID0gdmVydGV4LnBvc2l0aW9uU2NyZWVuO1xuXG5cdFx0XHRwb3NpdGlvbldvcmxkLmNvcHkoIHBvc2l0aW9uICkuYXBwbHlNYXRyaXg0KCBfbW9kZWxNYXRyaXggKTtcblx0XHRcdHBvc2l0aW9uU2NyZWVuLmNvcHkoIHBvc2l0aW9uV29ybGQgKS5hcHBseU1hdHJpeDQoIF92aWV3UHJvamVjdGlvbk1hdHJpeCApO1xuXG5cdFx0XHR2YXIgaW52VyA9IDEgLyBwb3NpdGlvblNjcmVlbi53O1xuXG5cdFx0XHRwb3NpdGlvblNjcmVlbi54ICo9IGludlc7XG5cdFx0XHRwb3NpdGlvblNjcmVlbi55ICo9IGludlc7XG5cdFx0XHRwb3NpdGlvblNjcmVlbi56ICo9IGludlc7XG5cblx0XHRcdHZlcnRleC52aXNpYmxlID0gcG9zaXRpb25TY3JlZW4ueCA+PSAtIDEgJiYgcG9zaXRpb25TY3JlZW4ueCA8PSAxICYmXG5cdFx0XHRcdFx0IHBvc2l0aW9uU2NyZWVuLnkgPj0gLSAxICYmIHBvc2l0aW9uU2NyZWVuLnkgPD0gMSAmJlxuXHRcdFx0XHRcdCBwb3NpdGlvblNjcmVlbi56ID49IC0gMSAmJiBwb3NpdGlvblNjcmVlbi56IDw9IDE7XG5cblx0XHR9XG5cblx0XHRmdW5jdGlvbiBwdXNoVmVydGV4KCB4LCB5LCB6ICkge1xuXG5cdFx0XHRfdmVydGV4ID0gZ2V0TmV4dFZlcnRleEluUG9vbCgpO1xuXHRcdFx0X3ZlcnRleC5wb3NpdGlvbi5zZXQoIHgsIHksIHogKTtcblxuXHRcdFx0cHJvamVjdFZlcnRleCggX3ZlcnRleCApO1xuXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gcHVzaE5vcm1hbCggeCwgeSwgeiApIHtcblxuXHRcdFx0bm9ybWFscy5wdXNoKCB4LCB5LCB6ICk7XG5cblx0XHR9XG5cblx0XHRmdW5jdGlvbiBwdXNoQ29sb3IoIHIsIGcsIGIgKSB7XG5cblx0XHRcdGNvbG9ycy5wdXNoKCByLCBnLCBiICk7XG5cblx0XHR9XG5cblx0XHRmdW5jdGlvbiBwdXNoVXYoIHgsIHkgKSB7XG5cblx0XHRcdHV2cy5wdXNoKCB4LCB5ICk7XG5cblx0XHR9XG5cblx0XHRmdW5jdGlvbiBjaGVja1RyaWFuZ2xlVmlzaWJpbGl0eSggdjEsIHYyLCB2MyApIHtcblxuXHRcdFx0aWYgKCB2MS52aXNpYmxlID09PSB0cnVlIHx8IHYyLnZpc2libGUgPT09IHRydWUgfHwgdjMudmlzaWJsZSA9PT0gdHJ1ZSApIHJldHVybiB0cnVlO1xuXG5cdFx0XHRfcG9pbnRzM1sgMCBdID0gdjEucG9zaXRpb25TY3JlZW47XG5cdFx0XHRfcG9pbnRzM1sgMSBdID0gdjIucG9zaXRpb25TY3JlZW47XG5cdFx0XHRfcG9pbnRzM1sgMiBdID0gdjMucG9zaXRpb25TY3JlZW47XG5cblx0XHRcdHJldHVybiBfY2xpcEJveC5pbnRlcnNlY3RzQm94KCBfYm91bmRpbmdCb3guc2V0RnJvbVBvaW50cyggX3BvaW50czMgKSApO1xuXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gY2hlY2tCYWNrZmFjZUN1bGxpbmcoIHYxLCB2MiwgdjMgKSB7XG5cblx0XHRcdHJldHVybiAoICggdjMucG9zaXRpb25TY3JlZW4ueCAtIHYxLnBvc2l0aW9uU2NyZWVuLnggKSAqXG5cdFx0XHRcdCAgICAoIHYyLnBvc2l0aW9uU2NyZWVuLnkgLSB2MS5wb3NpdGlvblNjcmVlbi55ICkgLVxuXHRcdFx0XHQgICAgKCB2My5wb3NpdGlvblNjcmVlbi55IC0gdjEucG9zaXRpb25TY3JlZW4ueSApICpcblx0XHRcdFx0ICAgICggdjIucG9zaXRpb25TY3JlZW4ueCAtIHYxLnBvc2l0aW9uU2NyZWVuLnggKSApIDwgMDtcblxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHB1c2hMaW5lKCBhLCBiICkge1xuXG5cdFx0XHR2YXIgdjEgPSBfdmVydGV4UG9vbFsgYSBdO1xuXHRcdFx0dmFyIHYyID0gX3ZlcnRleFBvb2xbIGIgXTtcblxuXHRcdFx0Ly8gQ2xpcFxuXG5cdFx0XHR2MS5wb3NpdGlvblNjcmVlbi5jb3B5KCB2MS5wb3NpdGlvbiApLmFwcGx5TWF0cml4NCggX21vZGVsVmlld1Byb2plY3Rpb25NYXRyaXggKTtcblx0XHRcdHYyLnBvc2l0aW9uU2NyZWVuLmNvcHkoIHYyLnBvc2l0aW9uICkuYXBwbHlNYXRyaXg0KCBfbW9kZWxWaWV3UHJvamVjdGlvbk1hdHJpeCApO1xuXG5cdFx0XHRpZiAoIGNsaXBMaW5lKCB2MS5wb3NpdGlvblNjcmVlbiwgdjIucG9zaXRpb25TY3JlZW4gKSA9PT0gdHJ1ZSApIHtcblxuXHRcdFx0XHQvLyBQZXJmb3JtIHRoZSBwZXJzcGVjdGl2ZSBkaXZpZGVcblx0XHRcdFx0djEucG9zaXRpb25TY3JlZW4ubXVsdGlwbHlTY2FsYXIoIDEgLyB2MS5wb3NpdGlvblNjcmVlbi53ICk7XG5cdFx0XHRcdHYyLnBvc2l0aW9uU2NyZWVuLm11bHRpcGx5U2NhbGFyKCAxIC8gdjIucG9zaXRpb25TY3JlZW4udyApO1xuXG5cdFx0XHRcdF9saW5lID0gZ2V0TmV4dExpbmVJblBvb2woKTtcblx0XHRcdFx0X2xpbmUuaWQgPSBvYmplY3QuaWQ7XG5cdFx0XHRcdF9saW5lLnYxLmNvcHkoIHYxICk7XG5cdFx0XHRcdF9saW5lLnYyLmNvcHkoIHYyICk7XG5cdFx0XHRcdF9saW5lLnogPSBNYXRoLm1heCggdjEucG9zaXRpb25TY3JlZW4ueiwgdjIucG9zaXRpb25TY3JlZW4ueiApO1xuXHRcdFx0XHRfbGluZS5yZW5kZXJPcmRlciA9IG9iamVjdC5yZW5kZXJPcmRlcjtcblxuXHRcdFx0XHRfbGluZS5tYXRlcmlhbCA9IG9iamVjdC5tYXRlcmlhbDtcblxuXHRcdFx0XHRpZiAoIG9iamVjdC5tYXRlcmlhbC52ZXJ0ZXhDb2xvcnMgPT09IFRIUkVFLlZlcnRleENvbG9ycyApIHtcblxuXHRcdFx0XHRcdF9saW5lLnZlcnRleENvbG9yc1sgMCBdLmZyb21BcnJheSggY29sb3JzLCBhICogMyApO1xuXHRcdFx0XHRcdF9saW5lLnZlcnRleENvbG9yc1sgMSBdLmZyb21BcnJheSggY29sb3JzLCBiICogMyApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRfcmVuZGVyRGF0YS5lbGVtZW50cy5wdXNoKCBfbGluZSApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRmdW5jdGlvbiBwdXNoVHJpYW5nbGUoIGEsIGIsIGMgKSB7XG5cblx0XHRcdHZhciB2MSA9IF92ZXJ0ZXhQb29sWyBhIF07XG5cdFx0XHR2YXIgdjIgPSBfdmVydGV4UG9vbFsgYiBdO1xuXHRcdFx0dmFyIHYzID0gX3ZlcnRleFBvb2xbIGMgXTtcblxuXHRcdFx0aWYgKCBjaGVja1RyaWFuZ2xlVmlzaWJpbGl0eSggdjEsIHYyLCB2MyApID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdFx0aWYgKCBtYXRlcmlhbC5zaWRlID09PSBUSFJFRS5Eb3VibGVTaWRlIHx8IGNoZWNrQmFja2ZhY2VDdWxsaW5nKCB2MSwgdjIsIHYzICkgPT09IHRydWUgKSB7XG5cblx0XHRcdFx0X2ZhY2UgPSBnZXROZXh0RmFjZUluUG9vbCgpO1xuXG5cdFx0XHRcdF9mYWNlLmlkID0gb2JqZWN0LmlkO1xuXHRcdFx0XHRfZmFjZS52MS5jb3B5KCB2MSApO1xuXHRcdFx0XHRfZmFjZS52Mi5jb3B5KCB2MiApO1xuXHRcdFx0XHRfZmFjZS52My5jb3B5KCB2MyApO1xuXHRcdFx0XHRfZmFjZS56ID0gKCB2MS5wb3NpdGlvblNjcmVlbi56ICsgdjIucG9zaXRpb25TY3JlZW4ueiArIHYzLnBvc2l0aW9uU2NyZWVuLnogKSAvIDM7XG5cdFx0XHRcdF9mYWNlLnJlbmRlck9yZGVyID0gb2JqZWN0LnJlbmRlck9yZGVyO1xuXG5cdFx0XHRcdC8vIHVzZSBmaXJzdCB2ZXJ0ZXggbm9ybWFsIGFzIGZhY2Ugbm9ybWFsXG5cblx0XHRcdFx0X2ZhY2Uubm9ybWFsTW9kZWwuZnJvbUFycmF5KCBub3JtYWxzLCBhICogMyApO1xuXHRcdFx0XHRfZmFjZS5ub3JtYWxNb2RlbC5hcHBseU1hdHJpeDMoIG5vcm1hbE1hdHJpeCApLm5vcm1hbGl6ZSgpO1xuXG5cdFx0XHRcdGZvciAoIHZhciBpID0gMDsgaSA8IDM7IGkgKysgKSB7XG5cblx0XHRcdFx0XHR2YXIgbm9ybWFsID0gX2ZhY2UudmVydGV4Tm9ybWFsc01vZGVsWyBpIF07XG5cdFx0XHRcdFx0bm9ybWFsLmZyb21BcnJheSggbm9ybWFscywgYXJndW1lbnRzWyBpIF0gKiAzICk7XG5cdFx0XHRcdFx0bm9ybWFsLmFwcGx5TWF0cml4Myggbm9ybWFsTWF0cml4ICkubm9ybWFsaXplKCk7XG5cblx0XHRcdFx0XHR2YXIgdXYgPSBfZmFjZS51dnNbIGkgXTtcblx0XHRcdFx0XHR1di5mcm9tQXJyYXkoIHV2cywgYXJndW1lbnRzWyBpIF0gKiAyICk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdF9mYWNlLnZlcnRleE5vcm1hbHNMZW5ndGggPSAzO1xuXG5cdFx0XHRcdF9mYWNlLm1hdGVyaWFsID0gb2JqZWN0Lm1hdGVyaWFsO1xuXG5cdFx0XHRcdF9yZW5kZXJEYXRhLmVsZW1lbnRzLnB1c2goIF9mYWNlICk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRzZXRPYmplY3Q6IHNldE9iamVjdCxcblx0XHRcdHByb2plY3RWZXJ0ZXg6IHByb2plY3RWZXJ0ZXgsXG5cdFx0XHRjaGVja1RyaWFuZ2xlVmlzaWJpbGl0eTogY2hlY2tUcmlhbmdsZVZpc2liaWxpdHksXG5cdFx0XHRjaGVja0JhY2tmYWNlQ3VsbGluZzogY2hlY2tCYWNrZmFjZUN1bGxpbmcsXG5cdFx0XHRwdXNoVmVydGV4OiBwdXNoVmVydGV4LFxuXHRcdFx0cHVzaE5vcm1hbDogcHVzaE5vcm1hbCxcblx0XHRcdHB1c2hDb2xvcjogcHVzaENvbG9yLFxuXHRcdFx0cHVzaFV2OiBwdXNoVXYsXG5cdFx0XHRwdXNoTGluZTogcHVzaExpbmUsXG5cdFx0XHRwdXNoVHJpYW5nbGU6IHB1c2hUcmlhbmdsZVxuXHRcdH07XG5cblx0fTtcblxuXHR2YXIgcmVuZGVyTGlzdCA9IG5ldyBSZW5kZXJMaXN0KCk7XG5cblx0ZnVuY3Rpb24gcHJvamVjdE9iamVjdCggb2JqZWN0ICkge1xuXG5cdFx0aWYgKCBvYmplY3QudmlzaWJsZSA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHRpZiAoIG9iamVjdCBpbnN0YW5jZW9mIFRIUkVFLkxpZ2h0ICkge1xuXG5cdFx0XHRfcmVuZGVyRGF0YS5saWdodHMucHVzaCggb2JqZWN0ICk7XG5cblx0XHR9IGVsc2UgaWYgKCBvYmplY3QgaW5zdGFuY2VvZiBUSFJFRS5NZXNoIHx8IG9iamVjdCBpbnN0YW5jZW9mIFRIUkVFLkxpbmUgfHwgb2JqZWN0IGluc3RhbmNlb2YgVEhSRUUuUG9pbnRzICkge1xuXG5cdFx0XHRpZiAoIG9iamVjdC5tYXRlcmlhbC52aXNpYmxlID09PSBmYWxzZSApIHJldHVybjtcblx0XHRcdGlmICggb2JqZWN0LmZydXN0dW1DdWxsZWQgPT09IHRydWUgJiYgX2ZydXN0dW0uaW50ZXJzZWN0c09iamVjdCggb2JqZWN0ICkgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0XHRhZGRPYmplY3QoIG9iamVjdCApO1xuXG5cdFx0fSBlbHNlIGlmICggb2JqZWN0IGluc3RhbmNlb2YgVEhSRUUuU3ByaXRlICkge1xuXG5cdFx0XHRpZiAoIG9iamVjdC5tYXRlcmlhbC52aXNpYmxlID09PSBmYWxzZSApIHJldHVybjtcblx0XHRcdGlmICggb2JqZWN0LmZydXN0dW1DdWxsZWQgPT09IHRydWUgJiYgX2ZydXN0dW0uaW50ZXJzZWN0c1Nwcml0ZSggb2JqZWN0ICkgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0XHRhZGRPYmplY3QoIG9iamVjdCApO1xuXG5cdFx0fVxuXG5cdFx0dmFyIGNoaWxkcmVuID0gb2JqZWN0LmNoaWxkcmVuO1xuXG5cdFx0Zm9yICggdmFyIGkgPSAwLCBsID0gY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbDsgaSArKyApIHtcblxuXHRcdFx0cHJvamVjdE9iamVjdCggY2hpbGRyZW5bIGkgXSApO1xuXG5cdFx0fVxuXG5cdH1cblxuXHRmdW5jdGlvbiBhZGRPYmplY3QoIG9iamVjdCApIHtcblxuXHRcdF9vYmplY3QgPSBnZXROZXh0T2JqZWN0SW5Qb29sKCk7XG5cdFx0X29iamVjdC5pZCA9IG9iamVjdC5pZDtcblx0XHRfb2JqZWN0Lm9iamVjdCA9IG9iamVjdDtcblxuXHRcdF92ZWN0b3IzLnNldEZyb21NYXRyaXhQb3NpdGlvbiggb2JqZWN0Lm1hdHJpeFdvcmxkICk7XG5cdFx0X3ZlY3RvcjMuYXBwbHlNYXRyaXg0KCBfdmlld1Byb2plY3Rpb25NYXRyaXggKTtcblx0XHRfb2JqZWN0LnogPSBfdmVjdG9yMy56O1xuXHRcdF9vYmplY3QucmVuZGVyT3JkZXIgPSBvYmplY3QucmVuZGVyT3JkZXI7XG5cblx0XHRfcmVuZGVyRGF0YS5vYmplY3RzLnB1c2goIF9vYmplY3QgKTtcblxuXHR9XG5cblx0dGhpcy5wcm9qZWN0U2NlbmUgPSBmdW5jdGlvbiAoIHNjZW5lLCBjYW1lcmEsIHNvcnRPYmplY3RzLCBzb3J0RWxlbWVudHMgKSB7XG5cblx0XHRfZmFjZUNvdW50ID0gMDtcblx0XHRfbGluZUNvdW50ID0gMDtcblx0XHRfc3ByaXRlQ291bnQgPSAwO1xuXG5cdFx0X3JlbmRlckRhdGEuZWxlbWVudHMubGVuZ3RoID0gMDtcblxuXHRcdGlmICggc2NlbmUuYXV0b1VwZGF0ZSA9PT0gdHJ1ZSApIHNjZW5lLnVwZGF0ZU1hdHJpeFdvcmxkKCk7XG5cdFx0aWYgKCBjYW1lcmEucGFyZW50ID09PSBudWxsICkgY2FtZXJhLnVwZGF0ZU1hdHJpeFdvcmxkKCk7XG5cblx0XHRfdmlld01hdHJpeC5jb3B5KCBjYW1lcmEubWF0cml4V29ybGRJbnZlcnNlICk7XG5cdFx0X3ZpZXdQcm9qZWN0aW9uTWF0cml4Lm11bHRpcGx5TWF0cmljZXMoIGNhbWVyYS5wcm9qZWN0aW9uTWF0cml4LCBfdmlld01hdHJpeCApO1xuXG5cdFx0X2ZydXN0dW0uc2V0RnJvbU1hdHJpeCggX3ZpZXdQcm9qZWN0aW9uTWF0cml4ICk7XG5cblx0XHQvL1xuXG5cdFx0X29iamVjdENvdW50ID0gMDtcblxuXHRcdF9yZW5kZXJEYXRhLm9iamVjdHMubGVuZ3RoID0gMDtcblx0XHRfcmVuZGVyRGF0YS5saWdodHMubGVuZ3RoID0gMDtcblxuXHRcdHByb2plY3RPYmplY3QoIHNjZW5lICk7XG5cblx0XHRpZiAoIHNvcnRPYmplY3RzID09PSB0cnVlICkge1xuXG5cdFx0XHRfcmVuZGVyRGF0YS5vYmplY3RzLnNvcnQoIHBhaW50ZXJTb3J0ICk7XG5cblx0XHR9XG5cblx0XHQvL1xuXG5cdFx0dmFyIG9iamVjdHMgPSBfcmVuZGVyRGF0YS5vYmplY3RzO1xuXG5cdFx0Zm9yICggdmFyIG8gPSAwLCBvbCA9IG9iamVjdHMubGVuZ3RoOyBvIDwgb2w7IG8gKysgKSB7XG5cblx0XHRcdHZhciBvYmplY3QgPSBvYmplY3RzWyBvIF0ub2JqZWN0O1xuXHRcdFx0dmFyIGdlb21ldHJ5ID0gb2JqZWN0Lmdlb21ldHJ5O1xuXG5cdFx0XHRyZW5kZXJMaXN0LnNldE9iamVjdCggb2JqZWN0ICk7XG5cblx0XHRcdF9tb2RlbE1hdHJpeCA9IG9iamVjdC5tYXRyaXhXb3JsZDtcblxuXHRcdFx0X3ZlcnRleENvdW50ID0gMDtcblxuXHRcdFx0aWYgKCBvYmplY3QgaW5zdGFuY2VvZiBUSFJFRS5NZXNoICkge1xuXG5cdFx0XHRcdGlmICggZ2VvbWV0cnkgaW5zdGFuY2VvZiBUSFJFRS5CdWZmZXJHZW9tZXRyeSApIHtcblxuXHRcdFx0XHRcdHZhciBhdHRyaWJ1dGVzID0gZ2VvbWV0cnkuYXR0cmlidXRlcztcblx0XHRcdFx0XHR2YXIgZ3JvdXBzID0gZ2VvbWV0cnkuZ3JvdXBzO1xuXG5cdFx0XHRcdFx0aWYgKCBhdHRyaWJ1dGVzLnBvc2l0aW9uID09PSB1bmRlZmluZWQgKSBjb250aW51ZTtcblxuXHRcdFx0XHRcdHZhciBwb3NpdGlvbnMgPSBhdHRyaWJ1dGVzLnBvc2l0aW9uLmFycmF5O1xuXG5cdFx0XHRcdFx0Zm9yICggdmFyIGkgPSAwLCBsID0gcG9zaXRpb25zLmxlbmd0aDsgaSA8IGw7IGkgKz0gMyApIHtcblxuXHRcdFx0XHRcdFx0cmVuZGVyTGlzdC5wdXNoVmVydGV4KCBwb3NpdGlvbnNbIGkgXSwgcG9zaXRpb25zWyBpICsgMSBdLCBwb3NpdGlvbnNbIGkgKyAyIF0gKTtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICggYXR0cmlidXRlcy5ub3JtYWwgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHRcdFx0dmFyIG5vcm1hbHMgPSBhdHRyaWJ1dGVzLm5vcm1hbC5hcnJheTtcblxuXHRcdFx0XHRcdFx0Zm9yICggdmFyIGkgPSAwLCBsID0gbm9ybWFscy5sZW5ndGg7IGkgPCBsOyBpICs9IDMgKSB7XG5cblx0XHRcdFx0XHRcdFx0cmVuZGVyTGlzdC5wdXNoTm9ybWFsKCBub3JtYWxzWyBpIF0sIG5vcm1hbHNbIGkgKyAxIF0sIG5vcm1hbHNbIGkgKyAyIF0gKTtcblxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKCBhdHRyaWJ1dGVzLnV2ICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0XHRcdHZhciB1dnMgPSBhdHRyaWJ1dGVzLnV2LmFycmF5O1xuXG5cdFx0XHRcdFx0XHRmb3IgKCB2YXIgaSA9IDAsIGwgPSB1dnMubGVuZ3RoOyBpIDwgbDsgaSArPSAyICkge1xuXG5cdFx0XHRcdFx0XHRcdHJlbmRlckxpc3QucHVzaFV2KCB1dnNbIGkgXSwgdXZzWyBpICsgMSBdICk7XG5cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICggZ2VvbWV0cnkuaW5kZXggIT09IG51bGwgKSB7XG5cblx0XHRcdFx0XHRcdHZhciBpbmRpY2VzID0gZ2VvbWV0cnkuaW5kZXguYXJyYXk7XG5cblx0XHRcdFx0XHRcdGlmICggZ3JvdXBzLmxlbmd0aCA+IDAgKSB7XG5cblx0XHRcdFx0XHRcdFx0Zm9yICggdmFyIGcgPSAwOyBnIDwgZ3JvdXBzLmxlbmd0aDsgZyArKyApIHtcblxuXHRcdFx0XHRcdFx0XHRcdHZhciBncm91cCA9IGdyb3Vwc1sgZyBdO1xuXG5cdFx0XHRcdFx0XHRcdFx0Zm9yICggdmFyIGkgPSBncm91cC5zdGFydCwgbCA9IGdyb3VwLnN0YXJ0ICsgZ3JvdXAuY291bnQ7IGkgPCBsOyBpICs9IDMgKSB7XG5cblx0XHRcdFx0XHRcdFx0XHRcdHJlbmRlckxpc3QucHVzaFRyaWFuZ2xlKCBpbmRpY2VzWyBpIF0sIGluZGljZXNbIGkgKyAxIF0sIGluZGljZXNbIGkgKyAyIF0gKTtcblxuXHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRcdFx0Zm9yICggdmFyIGkgPSAwLCBsID0gaW5kaWNlcy5sZW5ndGg7IGkgPCBsOyBpICs9IDMgKSB7XG5cblx0XHRcdFx0XHRcdFx0XHRyZW5kZXJMaXN0LnB1c2hUcmlhbmdsZSggaW5kaWNlc1sgaSBdLCBpbmRpY2VzWyBpICsgMSBdLCBpbmRpY2VzWyBpICsgMiBdICk7XG5cblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0XHRmb3IgKCB2YXIgaSA9IDAsIGwgPSBwb3NpdGlvbnMubGVuZ3RoIC8gMzsgaSA8IGw7IGkgKz0gMyApIHtcblxuXHRcdFx0XHRcdFx0XHRyZW5kZXJMaXN0LnB1c2hUcmlhbmdsZSggaSwgaSArIDEsIGkgKyAyICk7XG5cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9IGVsc2UgaWYgKCBnZW9tZXRyeSBpbnN0YW5jZW9mIFRIUkVFLkdlb21ldHJ5ICkge1xuXG5cdFx0XHRcdFx0dmFyIHZlcnRpY2VzID0gZ2VvbWV0cnkudmVydGljZXM7XG5cdFx0XHRcdFx0dmFyIGZhY2VzID0gZ2VvbWV0cnkuZmFjZXM7XG5cdFx0XHRcdFx0dmFyIGZhY2VWZXJ0ZXhVdnMgPSBnZW9tZXRyeS5mYWNlVmVydGV4VXZzWyAwIF07XG5cblx0XHRcdFx0XHRfbm9ybWFsTWF0cml4LmdldE5vcm1hbE1hdHJpeCggX21vZGVsTWF0cml4ICk7XG5cblx0XHRcdFx0XHR2YXIgbWF0ZXJpYWwgPSBvYmplY3QubWF0ZXJpYWw7XG5cblx0XHRcdFx0XHR2YXIgaXNNdWx0aU1hdGVyaWFsID0gQXJyYXkuaXNBcnJheSggbWF0ZXJpYWwgKTtcblxuXHRcdFx0XHRcdGZvciAoIHZhciB2ID0gMCwgdmwgPSB2ZXJ0aWNlcy5sZW5ndGg7IHYgPCB2bDsgdiArKyApIHtcblxuXHRcdFx0XHRcdFx0dmFyIHZlcnRleCA9IHZlcnRpY2VzWyB2IF07XG5cblx0XHRcdFx0XHRcdF92ZWN0b3IzLmNvcHkoIHZlcnRleCApO1xuXG5cdFx0XHRcdFx0XHRpZiAoIG1hdGVyaWFsLm1vcnBoVGFyZ2V0cyA9PT0gdHJ1ZSApIHtcblxuXHRcdFx0XHRcdFx0XHR2YXIgbW9ycGhUYXJnZXRzID0gZ2VvbWV0cnkubW9ycGhUYXJnZXRzO1xuXHRcdFx0XHRcdFx0XHR2YXIgbW9ycGhJbmZsdWVuY2VzID0gb2JqZWN0Lm1vcnBoVGFyZ2V0SW5mbHVlbmNlcztcblxuXHRcdFx0XHRcdFx0XHRmb3IgKCB2YXIgdCA9IDAsIHRsID0gbW9ycGhUYXJnZXRzLmxlbmd0aDsgdCA8IHRsOyB0ICsrICkge1xuXG5cdFx0XHRcdFx0XHRcdFx0dmFyIGluZmx1ZW5jZSA9IG1vcnBoSW5mbHVlbmNlc1sgdCBdO1xuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKCBpbmZsdWVuY2UgPT09IDAgKSBjb250aW51ZTtcblxuXHRcdFx0XHRcdFx0XHRcdHZhciB0YXJnZXQgPSBtb3JwaFRhcmdldHNbIHQgXTtcblx0XHRcdFx0XHRcdFx0XHR2YXIgdGFyZ2V0VmVydGV4ID0gdGFyZ2V0LnZlcnRpY2VzWyB2IF07XG5cblx0XHRcdFx0XHRcdFx0XHRfdmVjdG9yMy54ICs9ICggdGFyZ2V0VmVydGV4LnggLSB2ZXJ0ZXgueCApICogaW5mbHVlbmNlO1xuXHRcdFx0XHRcdFx0XHRcdF92ZWN0b3IzLnkgKz0gKCB0YXJnZXRWZXJ0ZXgueSAtIHZlcnRleC55ICkgKiBpbmZsdWVuY2U7XG5cdFx0XHRcdFx0XHRcdFx0X3ZlY3RvcjMueiArPSAoIHRhcmdldFZlcnRleC56IC0gdmVydGV4LnogKSAqIGluZmx1ZW5jZTtcblxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0cmVuZGVyTGlzdC5wdXNoVmVydGV4KCBfdmVjdG9yMy54LCBfdmVjdG9yMy55LCBfdmVjdG9yMy56ICk7XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRmb3IgKCB2YXIgZiA9IDAsIGZsID0gZmFjZXMubGVuZ3RoOyBmIDwgZmw7IGYgKysgKSB7XG5cblx0XHRcdFx0XHRcdHZhciBmYWNlID0gZmFjZXNbIGYgXTtcblxuXHRcdFx0XHRcdFx0bWF0ZXJpYWwgPSBpc011bHRpTWF0ZXJpYWwgPT09IHRydWVcblx0XHRcdFx0XHRcdFx0ID8gb2JqZWN0Lm1hdGVyaWFsWyBmYWNlLm1hdGVyaWFsSW5kZXggXVxuXHRcdFx0XHRcdFx0XHQgOiBvYmplY3QubWF0ZXJpYWw7XG5cblx0XHRcdFx0XHRcdGlmICggbWF0ZXJpYWwgPT09IHVuZGVmaW5lZCApIGNvbnRpbnVlO1xuXG5cdFx0XHRcdFx0XHR2YXIgc2lkZSA9IG1hdGVyaWFsLnNpZGU7XG5cblx0XHRcdFx0XHRcdHZhciB2MSA9IF92ZXJ0ZXhQb29sWyBmYWNlLmEgXTtcblx0XHRcdFx0XHRcdHZhciB2MiA9IF92ZXJ0ZXhQb29sWyBmYWNlLmIgXTtcblx0XHRcdFx0XHRcdHZhciB2MyA9IF92ZXJ0ZXhQb29sWyBmYWNlLmMgXTtcblxuXHRcdFx0XHRcdFx0aWYgKCByZW5kZXJMaXN0LmNoZWNrVHJpYW5nbGVWaXNpYmlsaXR5KCB2MSwgdjIsIHYzICkgPT09IGZhbHNlICkgY29udGludWU7XG5cblx0XHRcdFx0XHRcdHZhciB2aXNpYmxlID0gcmVuZGVyTGlzdC5jaGVja0JhY2tmYWNlQ3VsbGluZyggdjEsIHYyLCB2MyApO1xuXG5cdFx0XHRcdFx0XHRpZiAoIHNpZGUgIT09IFRIUkVFLkRvdWJsZVNpZGUgKSB7XG5cblx0XHRcdFx0XHRcdFx0aWYgKCBzaWRlID09PSBUSFJFRS5Gcm9udFNpZGUgJiYgdmlzaWJsZSA9PT0gZmFsc2UgKSBjb250aW51ZTtcblx0XHRcdFx0XHRcdFx0aWYgKCBzaWRlID09PSBUSFJFRS5CYWNrU2lkZSAmJiB2aXNpYmxlID09PSB0cnVlICkgY29udGludWU7XG5cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0X2ZhY2UgPSBnZXROZXh0RmFjZUluUG9vbCgpO1xuXG5cdFx0XHRcdFx0XHRfZmFjZS5pZCA9IG9iamVjdC5pZDtcblx0XHRcdFx0XHRcdF9mYWNlLnYxLmNvcHkoIHYxICk7XG5cdFx0XHRcdFx0XHRfZmFjZS52Mi5jb3B5KCB2MiApO1xuXHRcdFx0XHRcdFx0X2ZhY2UudjMuY29weSggdjMgKTtcblxuXHRcdFx0XHRcdFx0X2ZhY2Uubm9ybWFsTW9kZWwuY29weSggZmFjZS5ub3JtYWwgKTtcblxuXHRcdFx0XHRcdFx0aWYgKCB2aXNpYmxlID09PSBmYWxzZSAmJiAoIHNpZGUgPT09IFRIUkVFLkJhY2tTaWRlIHx8IHNpZGUgPT09IFRIUkVFLkRvdWJsZVNpZGUgKSApIHtcblxuXHRcdFx0XHRcdFx0XHRfZmFjZS5ub3JtYWxNb2RlbC5uZWdhdGUoKTtcblxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRfZmFjZS5ub3JtYWxNb2RlbC5hcHBseU1hdHJpeDMoIF9ub3JtYWxNYXRyaXggKS5ub3JtYWxpemUoKTtcblxuXHRcdFx0XHRcdFx0dmFyIGZhY2VWZXJ0ZXhOb3JtYWxzID0gZmFjZS52ZXJ0ZXhOb3JtYWxzO1xuXG5cdFx0XHRcdFx0XHRmb3IgKCB2YXIgbiA9IDAsIG5sID0gTWF0aC5taW4oIGZhY2VWZXJ0ZXhOb3JtYWxzLmxlbmd0aCwgMyApOyBuIDwgbmw7IG4gKysgKSB7XG5cblx0XHRcdFx0XHRcdFx0dmFyIG5vcm1hbE1vZGVsID0gX2ZhY2UudmVydGV4Tm9ybWFsc01vZGVsWyBuIF07XG5cdFx0XHRcdFx0XHRcdG5vcm1hbE1vZGVsLmNvcHkoIGZhY2VWZXJ0ZXhOb3JtYWxzWyBuIF0gKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoIHZpc2libGUgPT09IGZhbHNlICYmICggc2lkZSA9PT0gVEhSRUUuQmFja1NpZGUgfHwgc2lkZSA9PT0gVEhSRUUuRG91YmxlU2lkZSApICkge1xuXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsTW9kZWwubmVnYXRlKCk7XG5cblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdG5vcm1hbE1vZGVsLmFwcGx5TWF0cml4MyggX25vcm1hbE1hdHJpeCApLm5vcm1hbGl6ZSgpO1xuXG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdF9mYWNlLnZlcnRleE5vcm1hbHNMZW5ndGggPSBmYWNlVmVydGV4Tm9ybWFscy5sZW5ndGg7XG5cblx0XHRcdFx0XHRcdHZhciB2ZXJ0ZXhVdnMgPSBmYWNlVmVydGV4VXZzWyBmIF07XG5cblx0XHRcdFx0XHRcdGlmICggdmVydGV4VXZzICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0XHRcdFx0Zm9yICggdmFyIHUgPSAwOyB1IDwgMzsgdSArKyApIHtcblxuXHRcdFx0XHRcdFx0XHRcdF9mYWNlLnV2c1sgdSBdLmNvcHkoIHZlcnRleFV2c1sgdSBdICk7XG5cblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdF9mYWNlLmNvbG9yID0gZmFjZS5jb2xvcjtcblx0XHRcdFx0XHRcdF9mYWNlLm1hdGVyaWFsID0gbWF0ZXJpYWw7XG5cblx0XHRcdFx0XHRcdF9mYWNlLnogPSAoIHYxLnBvc2l0aW9uU2NyZWVuLnogKyB2Mi5wb3NpdGlvblNjcmVlbi56ICsgdjMucG9zaXRpb25TY3JlZW4ueiApIC8gMztcblx0XHRcdFx0XHRcdF9mYWNlLnJlbmRlck9yZGVyID0gb2JqZWN0LnJlbmRlck9yZGVyO1xuXG5cdFx0XHRcdFx0XHRfcmVuZGVyRGF0YS5lbGVtZW50cy5wdXNoKCBfZmFjZSApO1xuXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH1cblxuXHRcdFx0fSBlbHNlIGlmICggb2JqZWN0IGluc3RhbmNlb2YgVEhSRUUuTGluZSApIHtcblxuXHRcdFx0XHRfbW9kZWxWaWV3UHJvamVjdGlvbk1hdHJpeC5tdWx0aXBseU1hdHJpY2VzKCBfdmlld1Byb2plY3Rpb25NYXRyaXgsIF9tb2RlbE1hdHJpeCApO1xuXG5cdFx0XHRcdGlmICggZ2VvbWV0cnkgaW5zdGFuY2VvZiBUSFJFRS5CdWZmZXJHZW9tZXRyeSApIHtcblxuXHRcdFx0XHRcdHZhciBhdHRyaWJ1dGVzID0gZ2VvbWV0cnkuYXR0cmlidXRlcztcblxuXHRcdFx0XHRcdGlmICggYXR0cmlidXRlcy5wb3NpdGlvbiAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRcdFx0XHR2YXIgcG9zaXRpb25zID0gYXR0cmlidXRlcy5wb3NpdGlvbi5hcnJheTtcblxuXHRcdFx0XHRcdFx0Zm9yICggdmFyIGkgPSAwLCBsID0gcG9zaXRpb25zLmxlbmd0aDsgaSA8IGw7IGkgKz0gMyApIHtcblxuXHRcdFx0XHRcdFx0XHRyZW5kZXJMaXN0LnB1c2hWZXJ0ZXgoIHBvc2l0aW9uc1sgaSBdLCBwb3NpdGlvbnNbIGkgKyAxIF0sIHBvc2l0aW9uc1sgaSArIDIgXSApO1xuXG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmICggYXR0cmlidXRlcy5jb2xvciAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRcdFx0XHRcdHZhciBjb2xvcnMgPSBhdHRyaWJ1dGVzLmNvbG9yLmFycmF5O1xuXG5cdFx0XHRcdFx0XHRcdGZvciAoIHZhciBpID0gMCwgbCA9IGNvbG9ycy5sZW5ndGg7IGkgPCBsOyBpICs9IDMgKSB7XG5cblx0XHRcdFx0XHRcdFx0XHRyZW5kZXJMaXN0LnB1c2hDb2xvciggY29sb3JzWyBpIF0sIGNvbG9yc1sgaSArIDEgXSwgY29sb3JzWyBpICsgMiBdICk7XG5cblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmICggZ2VvbWV0cnkuaW5kZXggIT09IG51bGwgKSB7XG5cblx0XHRcdFx0XHRcdFx0dmFyIGluZGljZXMgPSBnZW9tZXRyeS5pbmRleC5hcnJheTtcblxuXHRcdFx0XHRcdFx0XHRmb3IgKCB2YXIgaSA9IDAsIGwgPSBpbmRpY2VzLmxlbmd0aDsgaSA8IGw7IGkgKz0gMiApIHtcblxuXHRcdFx0XHRcdFx0XHRcdHJlbmRlckxpc3QucHVzaExpbmUoIGluZGljZXNbIGkgXSwgaW5kaWNlc1sgaSArIDEgXSApO1xuXG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdFx0XHR2YXIgc3RlcCA9IG9iamVjdCBpbnN0YW5jZW9mIFRIUkVFLkxpbmVTZWdtZW50cyA/IDIgOiAxO1xuXG5cdFx0XHRcdFx0XHRcdGZvciAoIHZhciBpID0gMCwgbCA9ICggcG9zaXRpb25zLmxlbmd0aCAvIDMgKSAtIDE7IGkgPCBsOyBpICs9IHN0ZXAgKSB7XG5cblx0XHRcdFx0XHRcdFx0XHRyZW5kZXJMaXN0LnB1c2hMaW5lKCBpLCBpICsgMSApO1xuXG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0gZWxzZSBpZiAoIGdlb21ldHJ5IGluc3RhbmNlb2YgVEhSRUUuR2VvbWV0cnkgKSB7XG5cblx0XHRcdFx0XHR2YXIgdmVydGljZXMgPSBvYmplY3QuZ2VvbWV0cnkudmVydGljZXM7XG5cblx0XHRcdFx0XHRpZiAoIHZlcnRpY2VzLmxlbmd0aCA9PT0gMCApIGNvbnRpbnVlO1xuXG5cdFx0XHRcdFx0djEgPSBnZXROZXh0VmVydGV4SW5Qb29sKCk7XG5cdFx0XHRcdFx0djEucG9zaXRpb25TY3JlZW4uY29weSggdmVydGljZXNbIDAgXSApLmFwcGx5TWF0cml4NCggX21vZGVsVmlld1Byb2plY3Rpb25NYXRyaXggKTtcblxuXHRcdFx0XHRcdHZhciBzdGVwID0gb2JqZWN0IGluc3RhbmNlb2YgVEhSRUUuTGluZVNlZ21lbnRzID8gMiA6IDE7XG5cblx0XHRcdFx0XHRmb3IgKCB2YXIgdiA9IDEsIHZsID0gdmVydGljZXMubGVuZ3RoOyB2IDwgdmw7IHYgKysgKSB7XG5cblx0XHRcdFx0XHRcdHYxID0gZ2V0TmV4dFZlcnRleEluUG9vbCgpO1xuXHRcdFx0XHRcdFx0djEucG9zaXRpb25TY3JlZW4uY29weSggdmVydGljZXNbIHYgXSApLmFwcGx5TWF0cml4NCggX21vZGVsVmlld1Byb2plY3Rpb25NYXRyaXggKTtcblxuXHRcdFx0XHRcdFx0aWYgKCAoIHYgKyAxICkgJSBzdGVwID4gMCApIGNvbnRpbnVlO1xuXG5cdFx0XHRcdFx0XHR2MiA9IF92ZXJ0ZXhQb29sWyBfdmVydGV4Q291bnQgLSAyIF07XG5cblx0XHRcdFx0XHRcdF9jbGlwcGVkVmVydGV4MVBvc2l0aW9uU2NyZWVuLmNvcHkoIHYxLnBvc2l0aW9uU2NyZWVuICk7XG5cdFx0XHRcdFx0XHRfY2xpcHBlZFZlcnRleDJQb3NpdGlvblNjcmVlbi5jb3B5KCB2Mi5wb3NpdGlvblNjcmVlbiApO1xuXG5cdFx0XHRcdFx0XHRpZiAoIGNsaXBMaW5lKCBfY2xpcHBlZFZlcnRleDFQb3NpdGlvblNjcmVlbiwgX2NsaXBwZWRWZXJ0ZXgyUG9zaXRpb25TY3JlZW4gKSA9PT0gdHJ1ZSApIHtcblxuXHRcdFx0XHRcdFx0XHQvLyBQZXJmb3JtIHRoZSBwZXJzcGVjdGl2ZSBkaXZpZGVcblx0XHRcdFx0XHRcdFx0X2NsaXBwZWRWZXJ0ZXgxUG9zaXRpb25TY3JlZW4ubXVsdGlwbHlTY2FsYXIoIDEgLyBfY2xpcHBlZFZlcnRleDFQb3NpdGlvblNjcmVlbi53ICk7XG5cdFx0XHRcdFx0XHRcdF9jbGlwcGVkVmVydGV4MlBvc2l0aW9uU2NyZWVuLm11bHRpcGx5U2NhbGFyKCAxIC8gX2NsaXBwZWRWZXJ0ZXgyUG9zaXRpb25TY3JlZW4udyApO1xuXG5cdFx0XHRcdFx0XHRcdF9saW5lID0gZ2V0TmV4dExpbmVJblBvb2woKTtcblxuXHRcdFx0XHRcdFx0XHRfbGluZS5pZCA9IG9iamVjdC5pZDtcblx0XHRcdFx0XHRcdFx0X2xpbmUudjEucG9zaXRpb25TY3JlZW4uY29weSggX2NsaXBwZWRWZXJ0ZXgxUG9zaXRpb25TY3JlZW4gKTtcblx0XHRcdFx0XHRcdFx0X2xpbmUudjIucG9zaXRpb25TY3JlZW4uY29weSggX2NsaXBwZWRWZXJ0ZXgyUG9zaXRpb25TY3JlZW4gKTtcblxuXHRcdFx0XHRcdFx0XHRfbGluZS56ID0gTWF0aC5tYXgoIF9jbGlwcGVkVmVydGV4MVBvc2l0aW9uU2NyZWVuLnosIF9jbGlwcGVkVmVydGV4MlBvc2l0aW9uU2NyZWVuLnogKTtcblx0XHRcdFx0XHRcdFx0X2xpbmUucmVuZGVyT3JkZXIgPSBvYmplY3QucmVuZGVyT3JkZXI7XG5cblx0XHRcdFx0XHRcdFx0X2xpbmUubWF0ZXJpYWwgPSBvYmplY3QubWF0ZXJpYWw7XG5cblx0XHRcdFx0XHRcdFx0aWYgKCBvYmplY3QubWF0ZXJpYWwudmVydGV4Q29sb3JzID09PSBUSFJFRS5WZXJ0ZXhDb2xvcnMgKSB7XG5cblx0XHRcdFx0XHRcdFx0XHRfbGluZS52ZXJ0ZXhDb2xvcnNbIDAgXS5jb3B5KCBvYmplY3QuZ2VvbWV0cnkuY29sb3JzWyB2IF0gKTtcblx0XHRcdFx0XHRcdFx0XHRfbGluZS52ZXJ0ZXhDb2xvcnNbIDEgXS5jb3B5KCBvYmplY3QuZ2VvbWV0cnkuY29sb3JzWyB2IC0gMSBdICk7XG5cblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdF9yZW5kZXJEYXRhLmVsZW1lbnRzLnB1c2goIF9saW5lICk7XG5cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9XG5cblx0XHRcdH0gZWxzZSBpZiAoIG9iamVjdCBpbnN0YW5jZW9mIFRIUkVFLlBvaW50cyApIHtcblxuXHRcdFx0XHRfbW9kZWxWaWV3UHJvamVjdGlvbk1hdHJpeC5tdWx0aXBseU1hdHJpY2VzKCBfdmlld1Byb2plY3Rpb25NYXRyaXgsIF9tb2RlbE1hdHJpeCApO1xuXG5cdFx0XHRcdGlmICggZ2VvbWV0cnkgaW5zdGFuY2VvZiBUSFJFRS5HZW9tZXRyeSApIHtcblxuXHRcdFx0XHRcdHZhciB2ZXJ0aWNlcyA9IG9iamVjdC5nZW9tZXRyeS52ZXJ0aWNlcztcblxuXHRcdFx0XHRcdGZvciAoIHZhciB2ID0gMCwgdmwgPSB2ZXJ0aWNlcy5sZW5ndGg7IHYgPCB2bDsgdiArKyApIHtcblxuXHRcdFx0XHRcdFx0dmFyIHZlcnRleCA9IHZlcnRpY2VzWyB2IF07XG5cblx0XHRcdFx0XHRcdF92ZWN0b3I0LnNldCggdmVydGV4LngsIHZlcnRleC55LCB2ZXJ0ZXgueiwgMSApO1xuXHRcdFx0XHRcdFx0X3ZlY3RvcjQuYXBwbHlNYXRyaXg0KCBfbW9kZWxWaWV3UHJvamVjdGlvbk1hdHJpeCApO1xuXG5cdFx0XHRcdFx0XHRwdXNoUG9pbnQoIF92ZWN0b3I0LCBvYmplY3QsIGNhbWVyYSApO1xuXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0gZWxzZSBpZiAoIGdlb21ldHJ5IGluc3RhbmNlb2YgVEhSRUUuQnVmZmVyR2VvbWV0cnkgKSB7XG5cblx0XHRcdFx0XHR2YXIgYXR0cmlidXRlcyA9IGdlb21ldHJ5LmF0dHJpYnV0ZXM7XG5cblx0XHRcdFx0XHRpZiAoIGF0dHJpYnV0ZXMucG9zaXRpb24gIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHRcdFx0dmFyIHBvc2l0aW9ucyA9IGF0dHJpYnV0ZXMucG9zaXRpb24uYXJyYXk7XG5cblx0XHRcdFx0XHRcdGZvciAoIHZhciBpID0gMCwgbCA9IHBvc2l0aW9ucy5sZW5ndGg7IGkgPCBsOyBpICs9IDMgKSB7XG5cblx0XHRcdFx0XHRcdFx0X3ZlY3RvcjQuc2V0KCBwb3NpdGlvbnNbIGkgXSwgcG9zaXRpb25zWyBpICsgMSBdLCBwb3NpdGlvbnNbIGkgKyAyIF0sIDEgKTtcblx0XHRcdFx0XHRcdFx0X3ZlY3RvcjQuYXBwbHlNYXRyaXg0KCBfbW9kZWxWaWV3UHJvamVjdGlvbk1hdHJpeCApO1xuXG5cdFx0XHRcdFx0XHRcdHB1c2hQb2ludCggX3ZlY3RvcjQsIG9iamVjdCwgY2FtZXJhICk7XG5cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9XG5cblx0XHRcdH0gZWxzZSBpZiAoIG9iamVjdCBpbnN0YW5jZW9mIFRIUkVFLlNwcml0ZSApIHtcblxuXHRcdFx0XHRfdmVjdG9yNC5zZXQoIF9tb2RlbE1hdHJpeC5lbGVtZW50c1sgMTIgXSwgX21vZGVsTWF0cml4LmVsZW1lbnRzWyAxMyBdLCBfbW9kZWxNYXRyaXguZWxlbWVudHNbIDE0IF0sIDEgKTtcblx0XHRcdFx0X3ZlY3RvcjQuYXBwbHlNYXRyaXg0KCBfdmlld1Byb2plY3Rpb25NYXRyaXggKTtcblxuXHRcdFx0XHRwdXNoUG9pbnQoIF92ZWN0b3I0LCBvYmplY3QsIGNhbWVyYSApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRpZiAoIHNvcnRFbGVtZW50cyA9PT0gdHJ1ZSApIHtcblxuXHRcdFx0X3JlbmRlckRhdGEuZWxlbWVudHMuc29ydCggcGFpbnRlclNvcnQgKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiBfcmVuZGVyRGF0YTtcblxuXHR9O1xuXG5cdGZ1bmN0aW9uIHB1c2hQb2ludCggX3ZlY3RvcjQsIG9iamVjdCwgY2FtZXJhICkge1xuXG5cdFx0dmFyIGludlcgPSAxIC8gX3ZlY3RvcjQudztcblxuXHRcdF92ZWN0b3I0LnogKj0gaW52VztcblxuXHRcdGlmICggX3ZlY3RvcjQueiA+PSAtIDEgJiYgX3ZlY3RvcjQueiA8PSAxICkge1xuXG5cdFx0XHRfc3ByaXRlID0gZ2V0TmV4dFNwcml0ZUluUG9vbCgpO1xuXHRcdFx0X3Nwcml0ZS5pZCA9IG9iamVjdC5pZDtcblx0XHRcdF9zcHJpdGUueCA9IF92ZWN0b3I0LnggKiBpbnZXO1xuXHRcdFx0X3Nwcml0ZS55ID0gX3ZlY3RvcjQueSAqIGludlc7XG5cdFx0XHRfc3ByaXRlLnogPSBfdmVjdG9yNC56O1xuXHRcdFx0X3Nwcml0ZS5yZW5kZXJPcmRlciA9IG9iamVjdC5yZW5kZXJPcmRlcjtcblx0XHRcdF9zcHJpdGUub2JqZWN0ID0gb2JqZWN0O1xuXG5cdFx0XHRfc3ByaXRlLnJvdGF0aW9uID0gb2JqZWN0LnJvdGF0aW9uO1xuXG5cdFx0XHRfc3ByaXRlLnNjYWxlLnggPSBvYmplY3Quc2NhbGUueCAqIE1hdGguYWJzKCBfc3ByaXRlLnggLSAoIF92ZWN0b3I0LnggKyBjYW1lcmEucHJvamVjdGlvbk1hdHJpeC5lbGVtZW50c1sgMCBdICkgLyAoIF92ZWN0b3I0LncgKyBjYW1lcmEucHJvamVjdGlvbk1hdHJpeC5lbGVtZW50c1sgMTIgXSApICk7XG5cdFx0XHRfc3ByaXRlLnNjYWxlLnkgPSBvYmplY3Quc2NhbGUueSAqIE1hdGguYWJzKCBfc3ByaXRlLnkgLSAoIF92ZWN0b3I0LnkgKyBjYW1lcmEucHJvamVjdGlvbk1hdHJpeC5lbGVtZW50c1sgNSBdICkgLyAoIF92ZWN0b3I0LncgKyBjYW1lcmEucHJvamVjdGlvbk1hdHJpeC5lbGVtZW50c1sgMTMgXSApICk7XG5cblx0XHRcdF9zcHJpdGUubWF0ZXJpYWwgPSBvYmplY3QubWF0ZXJpYWw7XG5cblx0XHRcdF9yZW5kZXJEYXRhLmVsZW1lbnRzLnB1c2goIF9zcHJpdGUgKTtcblxuXHRcdH1cblxuXHR9XG5cblx0Ly8gUG9vbHNcblxuXHRmdW5jdGlvbiBnZXROZXh0T2JqZWN0SW5Qb29sKCkge1xuXG5cdFx0aWYgKCBfb2JqZWN0Q291bnQgPT09IF9vYmplY3RQb29sTGVuZ3RoICkge1xuXG5cdFx0XHR2YXIgb2JqZWN0ID0gbmV3IFRIUkVFLlJlbmRlcmFibGVPYmplY3QoKTtcblx0XHRcdF9vYmplY3RQb29sLnB1c2goIG9iamVjdCApO1xuXHRcdFx0X29iamVjdFBvb2xMZW5ndGggKys7XG5cdFx0XHRfb2JqZWN0Q291bnQgKys7XG5cdFx0XHRyZXR1cm4gb2JqZWN0O1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIF9vYmplY3RQb29sWyBfb2JqZWN0Q291bnQgKysgXTtcblxuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0TmV4dFZlcnRleEluUG9vbCgpIHtcblxuXHRcdGlmICggX3ZlcnRleENvdW50ID09PSBfdmVydGV4UG9vbExlbmd0aCApIHtcblxuXHRcdFx0dmFyIHZlcnRleCA9IG5ldyBUSFJFRS5SZW5kZXJhYmxlVmVydGV4KCk7XG5cdFx0XHRfdmVydGV4UG9vbC5wdXNoKCB2ZXJ0ZXggKTtcblx0XHRcdF92ZXJ0ZXhQb29sTGVuZ3RoICsrO1xuXHRcdFx0X3ZlcnRleENvdW50ICsrO1xuXHRcdFx0cmV0dXJuIHZlcnRleDtcblxuXHRcdH1cblxuXHRcdHJldHVybiBfdmVydGV4UG9vbFsgX3ZlcnRleENvdW50ICsrIF07XG5cblx0fVxuXG5cdGZ1bmN0aW9uIGdldE5leHRGYWNlSW5Qb29sKCkge1xuXG5cdFx0aWYgKCBfZmFjZUNvdW50ID09PSBfZmFjZVBvb2xMZW5ndGggKSB7XG5cblx0XHRcdHZhciBmYWNlID0gbmV3IFRIUkVFLlJlbmRlcmFibGVGYWNlKCk7XG5cdFx0XHRfZmFjZVBvb2wucHVzaCggZmFjZSApO1xuXHRcdFx0X2ZhY2VQb29sTGVuZ3RoICsrO1xuXHRcdFx0X2ZhY2VDb3VudCArKztcblx0XHRcdHJldHVybiBmYWNlO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIF9mYWNlUG9vbFsgX2ZhY2VDb3VudCArKyBdO1xuXG5cblx0fVxuXG5cdGZ1bmN0aW9uIGdldE5leHRMaW5lSW5Qb29sKCkge1xuXG5cdFx0aWYgKCBfbGluZUNvdW50ID09PSBfbGluZVBvb2xMZW5ndGggKSB7XG5cblx0XHRcdHZhciBsaW5lID0gbmV3IFRIUkVFLlJlbmRlcmFibGVMaW5lKCk7XG5cdFx0XHRfbGluZVBvb2wucHVzaCggbGluZSApO1xuXHRcdFx0X2xpbmVQb29sTGVuZ3RoICsrO1xuXHRcdFx0X2xpbmVDb3VudCArKztcblx0XHRcdHJldHVybiBsaW5lO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIF9saW5lUG9vbFsgX2xpbmVDb3VudCArKyBdO1xuXG5cdH1cblxuXHRmdW5jdGlvbiBnZXROZXh0U3ByaXRlSW5Qb29sKCkge1xuXG5cdFx0aWYgKCBfc3ByaXRlQ291bnQgPT09IF9zcHJpdGVQb29sTGVuZ3RoICkge1xuXG5cdFx0XHR2YXIgc3ByaXRlID0gbmV3IFRIUkVFLlJlbmRlcmFibGVTcHJpdGUoKTtcblx0XHRcdF9zcHJpdGVQb29sLnB1c2goIHNwcml0ZSApO1xuXHRcdFx0X3Nwcml0ZVBvb2xMZW5ndGggKys7XG5cdFx0XHRfc3ByaXRlQ291bnQgKys7XG5cdFx0XHRyZXR1cm4gc3ByaXRlO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIF9zcHJpdGVQb29sWyBfc3ByaXRlQ291bnQgKysgXTtcblxuXHR9XG5cblx0Ly9cblxuXHRmdW5jdGlvbiBwYWludGVyU29ydCggYSwgYiApIHtcblxuXHRcdGlmICggYS5yZW5kZXJPcmRlciAhPT0gYi5yZW5kZXJPcmRlciApIHtcblxuXHRcdFx0cmV0dXJuIGEucmVuZGVyT3JkZXIgLSBiLnJlbmRlck9yZGVyO1xuXG5cdFx0fSBlbHNlIGlmICggYS56ICE9PSBiLnogKSB7XG5cblx0XHRcdHJldHVybiBiLnogLSBhLno7XG5cblx0XHR9IGVsc2UgaWYgKCBhLmlkICE9PSBiLmlkICkge1xuXG5cdFx0XHRyZXR1cm4gYS5pZCAtIGIuaWQ7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRyZXR1cm4gMDtcblxuXHRcdH1cblxuXHR9XG5cblx0ZnVuY3Rpb24gY2xpcExpbmUoIHMxLCBzMiApIHtcblxuXHRcdHZhciBhbHBoYTEgPSAwLCBhbHBoYTIgPSAxLFxuXG5cdFx0Ly8gQ2FsY3VsYXRlIHRoZSBib3VuZGFyeSBjb29yZGluYXRlIG9mIGVhY2ggdmVydGV4IGZvciB0aGUgbmVhciBhbmQgZmFyIGNsaXAgcGxhbmVzLFxuXHRcdC8vIFogPSAtMSBhbmQgWiA9ICsxLCByZXNwZWN0aXZlbHkuXG5cblx0XHRcdGJjMW5lYXIgPSBzMS56ICsgczEudyxcblx0XHRcdGJjMm5lYXIgPSBzMi56ICsgczIudyxcblx0XHRcdGJjMWZhciA9IC0gczEueiArIHMxLncsXG5cdFx0XHRiYzJmYXIgPSAtIHMyLnogKyBzMi53O1xuXG5cdFx0aWYgKCBiYzFuZWFyID49IDAgJiYgYmMybmVhciA+PSAwICYmIGJjMWZhciA+PSAwICYmIGJjMmZhciA+PSAwICkge1xuXG5cdFx0XHQvLyBCb3RoIHZlcnRpY2VzIGxpZSBlbnRpcmVseSB3aXRoaW4gYWxsIGNsaXAgcGxhbmVzLlxuXHRcdFx0cmV0dXJuIHRydWU7XG5cblx0XHR9IGVsc2UgaWYgKCAoIGJjMW5lYXIgPCAwICYmIGJjMm5lYXIgPCAwICkgfHwgKCBiYzFmYXIgPCAwICYmIGJjMmZhciA8IDAgKSApIHtcblxuXHRcdFx0Ly8gQm90aCB2ZXJ0aWNlcyBsaWUgZW50aXJlbHkgb3V0c2lkZSBvbmUgb2YgdGhlIGNsaXAgcGxhbmVzLlxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0Ly8gVGhlIGxpbmUgc2VnbWVudCBzcGFucyBhdCBsZWFzdCBvbmUgY2xpcCBwbGFuZS5cblxuXHRcdFx0aWYgKCBiYzFuZWFyIDwgMCApIHtcblxuXHRcdFx0XHQvLyB2MSBsaWVzIG91dHNpZGUgdGhlIG5lYXIgcGxhbmUsIHYyIGluc2lkZVxuXHRcdFx0XHRhbHBoYTEgPSBNYXRoLm1heCggYWxwaGExLCBiYzFuZWFyIC8gKCBiYzFuZWFyIC0gYmMybmVhciApICk7XG5cblx0XHRcdH0gZWxzZSBpZiAoIGJjMm5lYXIgPCAwICkge1xuXG5cdFx0XHRcdC8vIHYyIGxpZXMgb3V0c2lkZSB0aGUgbmVhciBwbGFuZSwgdjEgaW5zaWRlXG5cdFx0XHRcdGFscGhhMiA9IE1hdGgubWluKCBhbHBoYTIsIGJjMW5lYXIgLyAoIGJjMW5lYXIgLSBiYzJuZWFyICkgKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIGJjMWZhciA8IDAgKSB7XG5cblx0XHRcdFx0Ly8gdjEgbGllcyBvdXRzaWRlIHRoZSBmYXIgcGxhbmUsIHYyIGluc2lkZVxuXHRcdFx0XHRhbHBoYTEgPSBNYXRoLm1heCggYWxwaGExLCBiYzFmYXIgLyAoIGJjMWZhciAtIGJjMmZhciApICk7XG5cblx0XHRcdH0gZWxzZSBpZiAoIGJjMmZhciA8IDAgKSB7XG5cblx0XHRcdFx0Ly8gdjIgbGllcyBvdXRzaWRlIHRoZSBmYXIgcGxhbmUsIHYyIGluc2lkZVxuXHRcdFx0XHRhbHBoYTIgPSBNYXRoLm1pbiggYWxwaGEyLCBiYzFmYXIgLyAoIGJjMWZhciAtIGJjMmZhciApICk7XG5cblx0XHRcdH1cblxuXHRcdFx0aWYgKCBhbHBoYTIgPCBhbHBoYTEgKSB7XG5cblx0XHRcdFx0Ly8gVGhlIGxpbmUgc2VnbWVudCBzcGFucyB0d28gYm91bmRhcmllcywgYnV0IGlzIG91dHNpZGUgYm90aCBvZiB0aGVtLlxuXHRcdFx0XHQvLyAoVGhpcyBjYW4ndCBoYXBwZW4gd2hlbiB3ZSdyZSBvbmx5IGNsaXBwaW5nIGFnYWluc3QganVzdCBuZWFyL2ZhciBidXQgZ29vZFxuXHRcdFx0XHQvLyAgdG8gbGVhdmUgdGhlIGNoZWNrIGhlcmUgZm9yIGZ1dHVyZSB1c2FnZSBpZiBvdGhlciBjbGlwIHBsYW5lcyBhcmUgYWRkZWQuKVxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0Ly8gVXBkYXRlIHRoZSBzMSBhbmQgczIgdmVydGljZXMgdG8gbWF0Y2ggdGhlIGNsaXBwZWQgbGluZSBzZWdtZW50LlxuXHRcdFx0XHRzMS5sZXJwKCBzMiwgYWxwaGExICk7XG5cdFx0XHRcdHMyLmxlcnAoIHMxLCAxIC0gYWxwaGEyICk7XG5cblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHR9XG5cbn07XG4iXX0=
