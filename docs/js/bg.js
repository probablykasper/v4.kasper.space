// minOnSave: true, minifier: uglify-js
var canvasHeight = 400;
var SEPARATION = 100;
var AMOUNTX = 80;
var AMOUNTY = 40;
var particleColor = "#3f3f3f";

var container;
var camera, scene, renderer;

var particles, particle, count = 0;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = canvasHeight / 2;

init();
animate();

function init() {

	container = document.createElement( 'div' );
    container.classList.add("canvas-container");
    container.classList.add("hidden");
    setTimeout(function() {
        container.classList.remove("hidden");
    }, 1000);
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / canvasHeight, 1, 10000 );
	camera.position.z = 10000;

	scene = new THREE.Scene();

	particles = new Array();

	var PI2 = Math.PI * 2;
	var material = new THREE.SpriteCanvasMaterial( {

		color: particleColor,
		program: function ( context ) {

			context.beginPath();
			context.arc( 0, 0, 0.5, 0, PI2, true );
			context.fill();

		}

	} );

	var i = 0;

	for ( var ix = 0; ix < AMOUNTX; ix ++ ) {

		for ( var iy = 0; iy < AMOUNTY; iy ++ ) {

			particle = particles[ i ++ ] = new THREE.Sprite( material );
			particle.position.x = ix * SEPARATION - ( ( AMOUNTX * SEPARATION ) / 2 );
			particle.position.z = iy * SEPARATION - ( ( AMOUNTY * SEPARATION ) / 2 );
			scene.add( particle );

		}

	}

	renderer = new THREE.CanvasRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, canvasHeight );
	container.appendChild( renderer.domElement );



	//

	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

	windowHalfX = window.innerWidth / 2;
	windowHalfY = canvasHeight / 2;

	camera.aspect = window.innerWidth / canvasHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, canvasHeight );

}

//

//

function animate() {

	requestAnimationFrame( animate );

	render();

}

function render() {


	camera.position.set(0,355,122);

	var i = 0;

	for ( var ix = 0; ix < AMOUNTX; ix ++ ) {

		for ( var iy = 0; iy < AMOUNTY; iy ++ ) {

			particle = particles[ i++ ];
			particle.position.y = ( Math.sin( ( ix + count ) * 0.3 ) * 50 ) +
				( Math.sin( ( iy + count ) * 0.5 ) * 50 );
			particle.scale.x = particle.scale.y = ( Math.sin( ( ix + count ) * 0.3 ) + 1 ) * 4 +
				( Math.sin( ( iy + count ) * 0.5 ) + 1 ) * 4;

		}

	}

	renderer.render( scene, camera );

	count += 0.1;

}
