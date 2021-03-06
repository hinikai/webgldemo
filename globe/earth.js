var onRenderFcts= [];

var scene	= new THREE.Scene();
scene.fog = new THREE.Fog( 0x000000, 3500, 15000 );
scene.fog.color.setHSL( 0.51, 0.4, 0.01 );

var camera	= new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100 );
camera.position.z = 3;


var renderer	= new THREE.WebGLRenderer({
    alpha: true
});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
renderer.shadowMapEnabled	= true

renderer.setClearColor( scene.fog.color );
renderer.setPixelRatio( window.devicePixelRatio );

//////////////////////////////////////////////////////////////////////////////////
//		added starfield							//
//////////////////////////////////////////////////////////////////////////////////

var starSphere	= THREEx.Planets.createStarfield()
scene.add(starSphere)

//////////////////////////////////////////////////////////////////////////////////
//		add an object and make it move					//
//////////////////////////////////////////////////////////////////////////////////

// var datGUI	= new dat.GUI()

var containerEarth	= new THREE.Object3D()

containerEarth.rotateY(170 * Math.PI / 180)
containerEarth.rotateX(-30 * Math.PI / 180)

//containerEarth.rotateZ(-23.4 * Math.PI/180)

containerEarth.position.z	= 0

scene.add(containerEarth)
var moonMesh	= THREEx.Planets.createMoon()
moonMesh.position.set(0.5,0,0.8)
moonMesh.scale.multiplyScalar(1/5)
moonMesh.receiveShadow	= true
moonMesh.castShadow	= true
containerEarth.add(moonMesh)

var earthMesh	= THREEx.Planets.createEarth()
earthMesh.receiveShadow	= true
earthMesh.castShadow	= true
containerEarth.add(earthMesh)
onRenderFcts.push(function(delta, now){
    //earthMesh.rotation.y += 1/32 * delta;		
})

var geometry	= new THREE.SphereGeometry(0.5, 32, 32)
var material	= THREEx.createAtmosphereMaterial()
material.uniforms.glowColor.value.set(0x00b3ff)
material.uniforms.coeficient.value	= 0.8
material.uniforms.power.value		= 2.0
var mesh	= new THREE.Mesh(geometry, material );
mesh.scale.multiplyScalar(1.01);
containerEarth.add( mesh );
// new THREEx.addAtmosphereMaterial2DatGui(material, datGUI)

var geometry	= new THREE.SphereGeometry(0.5, 32, 32)
var material	= THREEx.createAtmosphereMaterial()
material.side	= THREE.BackSide
material.uniforms.glowColor.value.set(0x00b3ff)
material.uniforms.coeficient.value	= 0.5
material.uniforms.power.value		= 4.0
var mesh	= new THREE.Mesh(geometry, material );
mesh.scale.multiplyScalar(1.15);
containerEarth.add( mesh );
// new THREEx.addAtmosphereMaterial2DatGui(material, datGUI)

var earthCloud	= THREEx.Planets.createEarthCloud()
earthCloud.receiveShadow	= true
earthCloud.castShadow	= true
containerEarth.add(earthCloud)
onRenderFcts.push(function(delta, now){
    earthCloud.rotation.y += 1/8 * delta;		
})

// add star
// 添加定位点
function addStar(data) {

    geometry = new THREE.Geometry();

    var randomStart = [77.998474, 21.097808];
    var randomEnd = [130.099619, 53.848158];

    for ( i = 0; i < data.length; i ++ ) {
        
        var vertex = latLongToVector3(
            data[i][1], 
            data[i][0], 
            0.5, 
            0);

        /*
        var vertex = new THREE.Vector3();
        vertex.x = Math.random() * 0.5 + 0.5;
        vertex.y = Math.random() * 0.5 + 0.5;
        vertex.z = Math.random() * 0.5 + 0.5;
        */

        geometry.vertices.push( vertex );

    }

    var color  = [0.1, 0.1, 1.0];
    var sprite = THREE.ImageUtils.loadTexture( "snowflake1.png" );
    var size   = 0.05;

    var materials = new THREE.PointCloudMaterial( { size: size, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, transparent : true } );
    materials.color.setHSL( color[0], color[1], color[2] );

    particles = new THREE.PointCloud( geometry, materials );

    containerEarth.add( particles );

} // end add start


//////////////////////////////////////////////////////////////////////////////////
//		Camera Controls							//
//////////////////////////////////////////////////////////////////////////////////
var mouse	= {x : 0, y : 0}
document.addEventListener('mousemove', function(event){
    mouse.x	= (event.clientX / window.innerWidth ) - 0.5
    mouse.y	= (event.clientY / window.innerHeight) - 0.5
}, false)

onRenderFcts.push(function(delta, now){
    camera.position.x += (mouse.x * 5 - camera.position.x) * (delta*3)
    camera.position.y += (mouse.y * 5 - camera.position.y) * (delta*3)

    // 根据时间变化
    var timer = Date.now() * 0.0001;
    //camera.position.x = (Math.cos( timer ) *  3);
    //camera.position.z = (Math.sin( timer ) *  3);

    camera.lookAt( scene.position )
})


//////////////////////////////////////////////////////////////////////////////////
//		render the scene						//
//////////////////////////////////////////////////////////////////////////////////
onRenderFcts.push(function(){
    renderer.render( scene, camera );		
})

//////////////////////////////////////////////////////////////////////////////////
//		loop runner							//
//////////////////////////////////////////////////////////////////////////////////
var lastTimeMsec= null
requestAnimationFrame(function animate(nowMsec){

    // keep looping
    requestAnimationFrame( animate );
    // measure time
    lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
    var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
    lastTimeMsec	= nowMsec

    // call each update function
    onRenderFcts.forEach(function(onRenderFct){
        onRenderFct(deltaMsec/1000, nowMsec/1000)
    })
})



// convert the positions from a lat, lon to a position on a sphere.
function latLongToVector3(lat, lon, radius, heigth) {

    var phi = (lat)*Math.PI/180;
    var theta = (lon-180)*Math.PI/180;

    var x = -(radius+heigth) * Math.cos(phi) * Math.cos(theta);
    var y = (radius+heigth) * Math.sin(phi);
    var z = (radius+heigth) * Math.cos(phi) * Math.sin(theta);

    return new THREE.Vector3(x,y,z);
}


function getData(rs) {
    addStar(rs.data);
}

// lens flares

(function(){

var textureFlare0 = THREE.ImageUtils.loadTexture( "textures/lensflare0.png" );
var textureFlare2 = THREE.ImageUtils.loadTexture( "textures/lensflare2.png" );
var textureFlare3 = THREE.ImageUtils.loadTexture( "textures/lensflare3.png" );

// 添加灯光光晕效果，当做是太阳
function addSun( h, s, l, x, y, z ) {

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

} // end addSun

addSun( 0.08, 0.8, 0.5,    0, 0.5, 1.5 );

})();


// 添加群星效果
(function(){
    var geometry = new THREE.Geometry();

    var sprite = THREE.ImageUtils.loadTexture( "textures/disc.png" );

    for ( i = 0; i < 10000; i ++ ) {

        var vertex = new THREE.Vector3();
        vertex.x = 100 * Math.random() - 50;
        vertex.y = 100 * Math.random() - 50;
        vertex.z = 100 * Math.random() - 50;

        geometry.vertices.push( vertex );

    }

    material = new THREE.PointCloudMaterial( { size: 5, sizeAttenuation: false, map: sprite, alphaTest: 0.5, transparent: true } );
    material.color.setHSL( 1.0, 0.3, 0.7 );

    particles = new THREE.PointCloud( geometry, material );
    scene.add( particles );

    onRenderFcts.push(function(delta, now){
        for ( i = 0; i < 10000; i ++ ) {
            geometry.vertices[i].x += 1;
            geometry.vertices[i].y += 1;
            geometry.vertices[i].z += 1;
        }
    })

})();

// 添加流星效果1
(function(){
    var pointLight = new THREE.PointLight( 0xffffff, 3, 1000 );
    scene.add( pointLight );

    var sphere = new THREE.SphereGeometry( 0.01, 16, 8, 1 );
    var lightMesh = new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xff0000 } ) );
    scene.add( lightMesh );

    onRenderFcts.push(function(delta, now){
        var time = Date.now() * 0.001;

        lightMesh.position.x = 1 * Math.cos( time );
        lightMesh.position.y = 1 * Math.cos( time * 1.25 );
        lightMesh.position.z = 1 * Math.sin( time );

        pointLight.position.copy( lightMesh.position );
    })

    var map = THREE.ImageUtils.loadTexture( 'lensflare0_alpha.png' );


    var blending = "AdditiveAlphaBlending";

    var geo1 = new THREE.PlaneBufferGeometry( 1, 1);

    var material = new THREE.MeshBasicMaterial( { map: map } );
    material.transparent = true;
    material.blending = THREE[ blending ];

    var x = 0.7;
    var y = 0.7;
    var z = 0.7;

    var mesh = new THREE.Mesh( geo1, material );
    mesh.position.set( x, y, z );
    scene.add( mesh );

})();

(function(){
    ////////////
    // 群星效果2//
    ////////////
    
    var particleTexture = THREE.ImageUtils.loadTexture( 'textures/spark.png' );

    particleGroup = new THREE.Object3D();
    
    var totalParticles = 200;
    var radiusRange = 10;
    for( var i = 0; i < totalParticles; i++ ) 
    {
        var spriteMaterial = new THREE.SpriteMaterial( { map: particleTexture, useScreenCoordinates: false, color: 0xffffff } );
        
        var sprite = new THREE.Sprite( spriteMaterial );
        sprite.scale.set( 0.5, 0.5, 1.0 ); // imageWidth, imageHeight
        sprite.position.set( Math.random() * 1 - 0.5, Math.random() * 1 - 0.5, Math.random() * 1 - 0.5 );
        // for a cube:
        // sprite.position.multiplyScalar( radiusRange );
        // for a solid sphere:
        // sprite.position.setLength( radiusRange * Math.random() );
        // for a spherical shell:
        sprite.position.setLength( radiusRange * (Math.random() * 0.1 + 0.9) );
        
        // sprite.color.setRGB( Math.random(),  Math.random(),  Math.random() ); 
        sprite.material.color.setHSL( Math.random(), 0.9, 0.7 ); 
        
        // sprite.opacity = 0.80; // translucent particles
        sprite.material.blending = THREE.AdditiveBlending; // "glowing" particles
        
        particleGroup.add( sprite );
    }
    particleGroup.position.x = 0;
    particleGroup.position.y = 0;
    particleGroup.position.z = 0;
    scene.add( particleGroup );
})();

(function(){
    var particleTexture = THREE.ImageUtils.loadTexture( 'textures/spark.png' );

    var spriteMaterial = new THREE.SpriteMaterial( { map: particleTexture, useScreenCoordinates: false, color: 0xffffff } );

    for (var i = 0; i < 100; i++) {
        var spriteMaterial = new THREE.SpriteMaterial( { map: particleTexture, useScreenCoordinates: false, color: 0xffffff } );
        var sprite = new THREE.Sprite( spriteMaterial );
        sprite.scale.set( .1, .1, 1 ); // imageWidth, imageHeight
        sprite.position.set( i / 200 + 0.5, i / 200 + 0.5, i / 200 + 0.5 );
        sprite.material.color.setHSL( 0.8, 0.9, i / 50 );
        scene.add( sprite );
    }

})();
