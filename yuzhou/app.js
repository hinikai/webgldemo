var container, stats;

var camera, scene, renderer;

init();
animate();

function init() {

    container = document.getElementById( 'canvas' );
    document.body.appendChild( container );

    // camera

	camera	= new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100 );
    camera.position.z = 250;

    // scene

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0x000000, 3500, 15000 );
    scene.fog.color.setHSL( 0.51, 0.4, 0.01 );

    // lens flares

    var textureFlare0 = THREE.ImageUtils.loadTexture( "lensflare0.png" );
    var textureFlare2 = THREE.ImageUtils.loadTexture( "lensflare2.png" );
    var textureFlare3 = THREE.ImageUtils.loadTexture( "lensflare3.png" );

    addLight( 0.08, 0.8, 0.5,    0, 0, -1.5 );

    function addLight( h, s, l, x, y, z ) {

        var light = new THREE.PointLight( 0xffffff, 1.5, 4500 );
        light.color.setHSL( h, s, l );
        light.position.set( x, y, z );
        scene.add( light );

        var flareColor = new THREE.Color( 0xffffff );
        flareColor.setHSL( h, s, l + 0.5 );

        var lensFlare = new THREE.LensFlare( textureFlare0, 700, 0.0, THREE.AdditiveBlending, flareColor );

        lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
        lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
        lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );

        lensFlare.add( textureFlare3, 60, 0.6, THREE.AdditiveBlending );
        lensFlare.add( textureFlare3, 70, 0.7, THREE.AdditiveBlending );
        lensFlare.add( textureFlare3, 120, 0.9, THREE.AdditiveBlending );
        lensFlare.add( textureFlare3, 70, 1.0, THREE.AdditiveBlending );

        lensFlare.position.copy( light.position );

        scene.add( lensFlare );

    }

    // renderer

    renderer = new THREE.WebGLRenderer( { alpha: true } );
    renderer.setClearColor( scene.fog.color );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

}

function animate() {

    requestAnimationFrame( animate );

    render();

}

function render() {

    renderer.render( scene, camera );

    var timer = Date.now() * 0.0001;
    camera.position.x = (Math.cos( timer ) *  4);
    camera.position.z = (Math.sin( timer ) *  4) ;
    camera.lookAt( scene.position );

}
