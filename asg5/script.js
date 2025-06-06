import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

// ------------------------ CONSTANTS -----------------------------

const globals = {
	time: 0,
	deltaTime: 0,
	camera: null,
	cameraInfo: null,
	player: null,
	hitMessageElem: null,
};

let scene;

// camera constants
const fov = 45;
const aspect = 2;
const far = 200;
const near = 1;
const sensitivity = 0.002;

// Character constants
let punk = null;
let punkMixer = null;
const activeCars = [];
let lastSpawnTime = 0;
const CAR_SPEED = 5;
let controls;

const moveSpeed = 5;
const height = 4;
const back = 8;
const rotSmoothFactor = 15;

// time constant
const Clock = new THREE.Clock();
let cameraOffset = new THREE.Vector3(0, height, back);

const ROAD_OPTIONS = {
	laneLength: 20,			// length
	laneSpace: 5,		// lane spacing
	numberOfLanes: 7,	// # of lanes
	lanePieceGap: 2,		// space between pieces in lane
	centerX: 0,
	startZ: 0,
	tileScale: 1
}
let cameraPivot;
let renderer;
let camera;


function loadRoadPiecesAsync() {
	return new Promise((resolve, reject) => {
		const roadLoader = new GLTFLoader();
		roadLoader.load('resources/City_Pack/Road_Bits.glb', (gltf) => {
			const rootGroup = gltf.scene.getObjectByName('RootNode');
			if (!rootGroup) {
				reject(new Error('Road_Bits.glb has no RootNode'));
				return;
			}

			const pieces = {};
			rootGroup.children.forEach((mesh) => {
			if (mesh.isMesh) {
				pieces[mesh.name] = mesh;
			}
			});

			resolve(pieces);
		},
		undefined,
		(err) => reject(err)
		);
	});
}

function buildMap(pieces, scene, options = {}) {
	const {
		laneLength,
		laneSpace,
		numberOfLanes,
		lanePieceGap,
		centerX,
		startZ,
		tileScale
	} = {...ROAD_OPTIONS, ...options};

	if (!pieces.road_straight) {
		console.warn('buildMap: no "road_straight" found in pieces');
		return;
	}

	const roadMapRoot = new THREE.Object3D();
	roadMapRoot.name = 'FroggerRoadMap';
	scene.add(roadMapRoot);

	const worldSegmentDepth =  laneSpace * tileScale;
	const wordLaneOffset = lanePieceGap * tileScale;
	const halfLaneSpan = (laneLength - 1) / 2;
	const halfTileSpan = (numberOfLanes - 1) / 2;

	for (let laneIndex = 0; laneIndex < laneLength; laneIndex++) {
		const xPos = centerX + (laneIndex - halfLaneSpan) * wordLaneOffset;
		for (let tileIdx = 0; tileIdx < numberOfLanes; tileIdx++) {
			const zPos = startZ + (tileIdx - halfTileSpan) * worldSegmentDepth;
			const tile = pieces.road_straight.clone();
			tile.position.set(xPos, 0, zPos);
			tile.rotation.z = Math.PI/2;
			// tile.scale.set(tileScale, 1, tileScale);
			
			tile.castShadow = false;
			tile.receiveShadow = true;
			roadMapRoot.add(tile);
		}
	}
	return roadMapRoot;
}
async function initRoads() {
	try {
		const pieces = await loadRoadPiecesAsync();
		buildMap(pieces, scene);
		
	} catch (e) {
		console.error('Failed to load road pieces:', e);
	}
}


// ------------------------ MAIN -----------------------------
function main() {

	// ------------------------ SETUP -----------------------------
	// let yaw = 0;
	// let pitch = 0;

	// const canvas = document.querySelector( '#c' );
	// canvas.addEventListener('click', () => {
	// 	canvas.requestPointerLock();
	// });

	// document.addEventListener('pointerlockchange', () => {
	// 	if (document.pointerLockElement === canvas) {
	// 		console.log('PointerLocked');
	// 	}
	// });
	
	// window.addEventListener('mousemove', (e) => {
	// 	if (document.pointerLockElement === canvas) {
	// 		yaw -= e.movementX * sensitivity;
	// 		pitch -= e.movementY * sensitivity;
	// 		pitch =  Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, pitch));
	// 	}
	// })

	
	// // split view
	// const view1Elem = document.querySelector( '#view1' );
	// const view2Elem = document.querySelector( '#view2' );

	// const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );
	// renderer.shadowMap.enabled = true;

	// // camera 1, regular view
	// const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	// camera.position.set( 0, 10, 20 );

	// globals.camera = camera;

	// const cameraHelper = new THREE.CameraHelper( camera );
	const canvas = document.querySelector('#c');
   	renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
   	renderer.shadowMap.enabled = true;

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 'black' );
	// add second camera
	

   	
   	camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.set(0, height, back);
	globals.camera = camera;

	cameraPivot = new THREE.Object3D();
  	cameraPivot.position.set(0, 0, 0);       // (will be moved to player later)
  	scene.add(cameraPivot);
	cameraPivot.add(camera);
	
	controls = new OrbitControls(camera, canvas);
	controls.enableDamping = true;         // optional: for smooth motion
	controls.dampingFactor = 0.1;
	// Don’t allow zoom/pan if you want to lock distance:
	// controls.enableZoom = false;
	// controls.enablePan = false;

	const cameraHelper = new THREE.CameraHelper(camera);

	// camera helper
	class MinMaxGUIHelper {
		constructor(obj, minProp, maxProp, minDif) {
			this.obj = obj;
			this.minProp = minProp;
			this.maxProp = maxProp;
			this.minDif = minDif;
		}
		get min() {
			return this.obj[this.minProp];
		}
		set min(v) {
			this.obj[this.minProp] = v;
			this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
		}
		get max() {
			return this.obj[this.maxProp];
		}
		set max(v) {
			this.obj[this.maxProp] = v;
			this.min = this.min;  // this will call the min setter
		}
	}
	function updateCamera() {

		camera.updateProjectionMatrix();

	}

	const gui = new GUI();

	gui.close();
	gui.add( camera, 'fov', 1, 180 );
	const minMaxGUIHelper = new MinMaxGUIHelper( camera, 'near', 'far', 0.1 );
	gui.add( minMaxGUIHelper, 'min', 0.1, 200, 0.1 ).name( 'near' );
	gui.add( minMaxGUIHelper, 'max', 0.1, 200, 0.1 ).name( 'far' );

	scene.add( cameraHelper );

	// camera 2
	// const camera2 = new THREE.PerspectiveCamera(
	// 	60, // fov
	// 	2, // aspect
	// 	0.1, // near
	// 	500, // far
	// );
	// camera2.position.set( 40, 10, 30 );
	// camera2.lookAt( 0, 5, 0 );

	// const controls2 = new OrbitControls( camera2, view2Elem );
	// controls2.target.set( 0, 5, 0 );
	// controls2.update();

	

	// ------------------------ BASE SCENE -----------------------------

	{
		const planeSize = 40;

		const loader = new THREE.TextureLoader();
		const text1 = loader.load( 'resources/img/grass.jpg' );
		text1.wrapS = THREE.RepeatWrapping;
		text1.wrapT = THREE.RepeatWrapping;
		text1.magFilter = THREE.NearestFilter;
		text1.colorSpace = THREE.SRGBColorSpace;
		const repeats = planeSize / 2;
		text1.repeat.set( repeats, repeats );

		const planeGeo = new THREE.PlaneGeometry( planeSize, planeSize );

		const planeMat = new THREE.MeshPhongMaterial( {
			map: text1,
			side: THREE.DoubleSide,
		});
		const mesh = new THREE.Mesh( planeGeo, planeMat );
		mesh.receiveShadow = true;
		mesh.rotation.x = Math.PI * -.5;
		scene.add( mesh );
	}

	// {
	// 	const cubeSize = 4;
	// 	const cubeGeo = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
	// 	const cubeMat = new THREE.MeshPhongMaterial( { color: ' #8AC '} );

	// 	const mesh = new THREE.Mesh( cubeGeo, cubeMat );
	// 	mesh.castShadow = true;
	// 	mesh.receiveShadow = true;
	// 	mesh.position.set( cubeSize + 10, cubeSize / 2, 10);
	// 	scene.add( mesh );
	// }

	// {
	// 	const sphereRadius = 3;
	// 	const sphereWidthDivisions = 32;
	// 	const sphereHeightDivision = 16;
	// 	const sphereGeo = new THREE.SphereGeometry( sphereRadius, sphereWidthDivisions, sphereHeightDivision );
	// 	const sphereMat = new THREE.MeshPhongMaterial( { color: '#CAB' } );

	// 	const mesh = new THREE.Mesh( sphereGeo, sphereMat );
	// 	mesh.castShadow = true;
	// 	mesh.receiveShadow = true;
	// 	mesh.position.set( -sphereRadius - 10, sphereRadius + 2, 10 );
	// 	scene.add( mesh );
	// }

	// light helper functions
	class ColorGUIHelper {

		constructor( object, prop ) {

			this.object = object;
			this.prop = prop;

		}
		get value() {

			return `#${this.object[ this.prop ].getHexString()}`;

		}
		set value( hexString ) {

			this.object[ this.prop ].set( hexString );

		}
	}
	
	function makeXYZGUI( gui, vector3, name, onChangeFn ) {

		const folder = gui.addFolder( name );
		folder.add( vector3, 'x', - 10, 10 ).onChange( onChangeFn );
		folder.add( vector3, 'y', 0, 10 ).onChange( onChangeFn );
		folder.add( vector3, 'z', - 10, 10 ).onChange( onChangeFn );
		folder.open();

	}
	class DegRadHelper {

		constructor( obj, prop ) {

			this.obj = obj;
			this.prop = prop;

		}
		get value() {

			return THREE.MathUtils.radToDeg( this.obj[ this.prop ] );

		}
		set value( v ) {

			this.obj[ this.prop ] = THREE.MathUtils.degToRad( v );

		}
	}	

	// ------------------------ LIGHTS -----------------------------
	
	// Directional Light
	{

		const color = 0xFFFFFF;
		const intensity = 1;
		const dirLight = new THREE.DirectionalLight( color, intensity );
		dirLight.castShadow = true;
		dirLight.position.set( 25, 20, 0 );	// change to 0, 20, 0
		dirLight.target.position.set( 0, 5, 0 );

		dirLight.shadow.bias = 0;
		dirLight.shadow.width = 12;
		dirLight.shadow.height = 12;

		scene.add( dirLight );
		scene.add( dirLight.target );
		const cam = dirLight.shadow.camera;
		cam.near = 1;
		cam.far = 80;
		cam.left = - 40;
		cam.right = 40;
		cam.top = 40;
		cam.bottom = - 40;
		
		const cameraHelper = new THREE.CameraHelper( cam );
		scene.add( cameraHelper );
		cameraHelper.visible = true;
		const helper = new THREE.DirectionalLightHelper( dirLight, 5 );
		scene.add( helper );
		helper.visible = true;

		function directionalMakeXYZGUI( gui, vector3, name, onChangeFn ) {

			const folder = gui.addFolder( name );
			folder.add( vector3, 'x', vector3.x - 50, vector3.x + 50 ).onChange( onChangeFn );
			folder.add( vector3, 'y', vector3.y - 5, vector3.y + 50 ).onChange( onChangeFn );
			folder.add( vector3, 'z', vector3.z - 50, vector3.z + 50 ).onChange( onChangeFn );
			folder.open();

		}

		function updateCamera() {

			// update the light target's matrixWorld because it's needed by the helper
			dirLight.updateMatrixWorld();
			dirLight.target.updateMatrixWorld();
			helper.update();
			// update the light's shadow camera's projection matrix
			dirLight.shadow.camera.updateProjectionMatrix();
			// and now update the camera helper we're using to show the light's shadow camera
			cameraHelper.update();

		}

		updateCamera();

		class DimensionGUIHelper {

			constructor( obj, minProp, maxProp ) {

				this.obj = obj;
				this.minProp = minProp;
				this.maxProp = maxProp;

			}
			get value() {

				return this.obj[ this.maxProp ] * 2;

			}
			set value( v ) {

				this.obj[ this.maxProp ] = v / 2;
				this.obj[ this.minProp ] = v / - 2;

			}
		}

		class MinMaxGUIHelper {

			constructor( obj, minProp, maxProp, minDif ) {

				this.obj = obj;
				this.minProp = minProp;
				this.maxProp = maxProp;
				this.minDif = minDif;

			}
			get min() {

				return this.obj[ this.minProp ];

			}
			set min( v ) {

				this.obj[ this.minProp ] = v;
				this.obj[ this.maxProp ] = Math.max( this.obj[ this.maxProp ], v + this.minDif );

			}
			get max() {

				return this.obj[ this.maxProp ];

			}
			set max( v ) {

				this.obj[ this.maxProp ] = v;
				this.min = this.min; // this will call the min setter

			}
		}

		class VisibleGUIHelper {

			constructor( ...objects ) {

				this.objects = [ ...objects ];

			}
			get value() {

				return this.objects[ 0 ].visible;

			}
			set value( v ) {

				this.objects.forEach( ( obj ) => {

					obj.visible = v;

				} );
			}
		}

	 	const directionalFolder = gui.addFolder( 'Directional Light' );
		directionalFolder.addColor( new ColorGUIHelper( dirLight, 'color' ), 'value' ).name( 'color' );
		directionalFolder.add( dirLight, 'intensity', 0, 5, 0.01 );

		directionalFolder.add( new VisibleGUIHelper( helper, cameraHelper ), 'value' ).name( 'showHelpers' );
		directionalFolder.add( dirLight.shadow, 'bias', -0.1, 0.1, 0.001 );
		{
			const folder = gui.addFolder( 'Shadow Camera' );
			folder.open();
			folder.add(new DimensionGUIHelper( dirLight.shadow.camera, 'left', 'right' ), 'value', 1, 150 )
				.name( 'width' )
				.onChange( updateCamera );
			folder.add( new DimensionGUIHelper( dirLight.shadow.camera, 'bottom', 'top' ), 'value', 1, 150 )
				.name( 'height' )
				.onChange( updateCamera );
			const minMaxGUIHelper = new MinMaxGUIHelper( dirLight.shadow.camera, 'near', 'far', 0.1 );
			folder.add( minMaxGUIHelper, 'min', 1, 100, 1 ).name( 'near' ).onChange( updateCamera );
			folder.add( minMaxGUIHelper, 'max', 1, 400, 1 ).name( 'far' ).onChange( updateCamera );
			folder.add( dirLight.shadow.camera, 'zoom', 0.01, 1.5, 0.01 ).onChange( updateCamera );

		}

		directionalMakeXYZGUI( gui, dirLight.position, 'position', updateCamera );
		directionalMakeXYZGUI( gui, dirLight.target.position, 'target', updateCamera );

	}


	// point light
	{

		const color = 0xFFD700;
		const intensity = 150;
		const pointLight = new THREE.PointLight( color, intensity );
		pointLight.castShadow = true;
		pointLight.position.set( 0, 1, -19 );
		scene.add( pointLight );

		const spotHelper = new THREE.PointLightHelper( pointLight );
		scene.add( spotHelper );

		function updateLight() {

			spotHelper.update();

		}

		const pointFolder = gui.addFolder( 'Point Light' );
		pointFolder.addColor( new ColorGUIHelper( pointLight, 'color' ), 'value' ).name( 'color' );
		pointFolder.add( pointLight, 'intensity', 0, 250, 1 );
		pointFolder.add( pointLight, 'distance', 0, 40 ).onChange( updateLight );

		makeXYZGUI( gui, pointLight.position, 'position' );

	}

	// SpotLight
	{

		const color = 0xFFD700;
		const intensity = 150;
		const spotLight = new THREE.SpotLight( color, intensity );
		spotLight.castShadow = true;
		spotLight.position.set( 6, 8, 20 );
		spotLight.target.position.set( 0, 0, 20 );
		scene.add( spotLight );
		scene.add( spotLight.target );

		const helper = new THREE.SpotLightHelper( spotLight );
		scene.add( helper );

		function updateLight() {

			spotLight.target.updateMatrixWorld();
			helper.update();

		}

		updateLight();

		const spotFolder = gui.addFolder( 'Spot Light' );
		spotFolder.addColor( new ColorGUIHelper( spotLight, 'color' ), 'value' ).name( 'color' );
		spotFolder.add( spotLight, 'intensity', 0, 250, 1 );
		spotFolder.add( spotLight, 'distance', 0, 40 ).onChange( updateLight );
		spotFolder.add( new DegRadHelper( spotLight, 'angle' ), 'value', 0, 90 ).name( 'angle' ).onChange( updateLight );
		spotFolder.add( spotLight, 'penumbra', 0, 1, 0.01 );

		makeXYZGUI( gui, spotLight.position, 'position', updateLight );
		makeXYZGUI( gui, spotLight.target.position, 'target', updateLight );

	}

	// ------------------------ GAME MANAGER -----------------------------

	const manager = new THREE.LoadingManager();
	manager.onLoad = init;

	// const gltfLoader = new GLTFLoader(manager);

	const progressbarElem = document.querySelector( '#progressbar' );
	manager.onProgress = ( url, itemsLoaded, itemsTotal ) => {
		progressbarElem.style.width = `${itemsLoaded / itemsTotal * 100 | 0}%`;
	}
	const models = {
		gtr: { url: './resources/City_Pack/Nissan_GTR.glb'},
		punk: {url: './resources/City_Pack/Punk.glb'},
		building: {url: './resources/City_Pack/Building.glb'},
		Hospital: {url: './resources/City_Pack/Hospital.glb'},
		hotel: {url: './resources/City_Pack/Hotel_Building.glb'},
		apartment: {url: './resources/City_Pack/Apartment_Building.glb'},
		
	};
	{
		
		const gltfLoader = new GLTFLoader( manager );
		for ( const model of Object.values( models )) {
			gltfLoader.load( model.url, (gltf) => {
				model.gltf = gltf;
			});
		}
	}
	
	function prepModelsAndAnimations() {
		Object.values( models ).forEach( model => {
			const animsByName = {};
			model.gltf.animations.forEach(( clip ) => {
				animsByName[ clip.name ] = clip;
			});
			model.animations = animsByName;
		});
	}

	class InputManager{
		constructor() {
			this.keys = {
				forward: 	{down: false, justPressed: false},
				backward:	{down: false, justPressed: false},
				left:		{down: false, justPressed: false},
				right:		{down: false, justPressed: false},
			};
			
			const keyMap = new Map([
				['KeyW',	'forward'],
				['KeyS',	'backward'],
				['KeyA',	'left'],
				['KeyD',	'right'],
			]);

			const setKey = ( keyName, pressed ) => {
				const keyState = this.keys[ keyName ];
				keyState.justPressed = pressed && ! keyState.down;
				keyState.down = pressed;
			}
			
			window.addEventListener( 'keydown', (e) => {
				const keyName = keyMap.get(e.code);
				if (keyName) setKey(keyName, true);
			})
			window.addEventListener('keyup', (e) => {
				const keyName = keyMap.get(e.code);
				if (keyName) {
					this.keys[keyName].justPressed = false;
					this.keys[keyName].down = false;
				}
			});
		}

		update() {
			for (const keyState of Object.values(this.keys)) {
				if ( keyState.justPressed )keyState.justPressed = false;
			}
		}
	}

	function removeArrayElement( array, element ) {

		const ndx = array.indexOf( element );
		if ( ndx >= 0 ) {

			array.splice( ndx, 1 );

		}

	}

	class SafeArray {

		constructor() {

			this.array = [];
			this.addQueue = [];
			this.removeQueue = new Set();

		}
		get isEmpty() {

			return this.addQueue.length + this.array.length > 0;

		}
		add( element ) {

			this.addQueue.push( element );

		}
		remove( element ) {

			this.removeQueue.add( element );

		}
		forEach( fn ) {

			this._addQueued();
			this._removeQueued();
			for ( const element of this.array ) {

				if ( this.removeQueue.has( element ) ) {

					continue;

				}

				fn( element );

			}

			this._removeQueued();

		}
		_addQueued() {

			if ( this.addQueue.length ) {

				this.array.splice( this.array.length, 0, ...this.addQueue );
				this.addQueue = [];

			}

		}
		_removeQueued() {

			if ( this.removeQueue.size ) {

				this.array = this.array.filter( element => ! this.removeQueue.has( element ) );
				this.removeQueue.clear();

			}
		}
	}

	class GameObjectManager {

		constructor() {

			this.gameObjects = new SafeArray();

		}
		createGameObject( parent, name ) {

			const gameObject = new GameObject( parent, name );
			this.gameObjects.add( gameObject );
			return gameObject;

		}
		removeGameObject( gameObject ) {

			this.gameObjects.remove( gameObject );

		}
		update() {

			this.gameObjects.forEach( gameObject => gameObject.update() );

		}

	}

	
	const gameObjectManager = new GameObjectManager();
	const inputManager = new InputManager();

	class GameObject {

		constructor( parent, name ) {

			this.name = name;
			this.components = [];
			this.transform = new THREE.Object3D();
			parent.add( this.transform );

		}
		addComponent( ComponentType, ...args ) {

			const component = new ComponentType( this, ...args );
			this.components.push( component );
			return component;

		}
		removeComponent( component ) {

			removeArrayElement( this.components, component );

		}
		getComponent( ComponentType ) {

			return this.components.find( c => c instanceof ComponentType );

		}
		update() {

			for ( const component of this.components ) {

				component.update();

			}
		}
	}

	// Base for all components
	class Component {

		constructor( gameObject ) {

			this.gameObject = gameObject;

		}
		update() {
		}
	}

	class CameraInfo extends Component {
		constructor( gameObject ) {

			super( gameObject );
			this.projScreenMatrix = new THREE.Matrix4();
			this.frustum = new THREE.Frustum();
			
		}
		
		update() {

			const { camera } = globals;
			this.projScreenMatrix.multiplyMatrices( 
				camera.projectionMatrix, 
				camera.matrixWorldInverse );

			this.frustum.setFromProjectionMatrix(this.projScreenMatrix);
		}
	}

	class SkinInstance extends Component {

		constructor( gameObject, model ) {

			super( gameObject );
			this.model = model;
			this.animRoot = SkeletonUtils.clone( this.model.gltf.scene );
			this.animRoot.traverse(node => {
				if (node.isMesh) {
					node.castShadow = true;
					node.receiveShadow = true;
				}
			});
			this.mixer = new THREE.AnimationMixer( this.animRoot );
			gameObject.transform.add( this.animRoot );
			this.actions = {};

		}
		setAnimation( animName ) {

			const clip = this.model.animations[ animName ];
			// turn off all current actions
			for ( const action of Object.values( this.actions ) ) {

				action.enabled = false;

			}

			// get or create existing action for clip
			const action = this.mixer.clipAction( clip );
			action.enabled = true;
			action.reset();
			action.play();
			this.actions[ animName ] = action;

		}
		update() {

			this.mixer.update( globals.deltaTime );

		}
	}

	function computeTightBoundingBox(rootObj, margin = 0) {
		// Make sure world matrices are up‐to‐date:
		rootObj.updateWorldMatrix(true, true);

		// Start with an “empty” Box3
		const tightBox = new THREE.Box3();

		// Traverse every descendant of rootObj
		rootObj.traverse(node => {
			if (!node.isMesh) return;

			// Ensure the geometry has a local‐space boundingBox
			const geom = node.geometry;
			if (!geom.boundingBox) {
			geom.computeBoundingBox();
			}

			// Copy that local boundingBox and turn it into world‐space
			const worldBox = geom.boundingBox.clone();
			worldBox.applyMatrix4(node.matrixWorld);

			// Union it into our running “tightBox”
			tightBox.union(worldBox);
		});

		// Now we have a minimal AABB around *only* the visible triangles.
		// If the caller supplied a non‐zero margin, expand (or shrink) that box:
		if (margin !== 0) {
			tightBox.expandByScalar(margin);
		}

		return tightBox;
	}

	class Building extends Component {

		constructor(gameObject, modelInfo, x, z, scale , yOffset, rotY ) {
			super(gameObject);
			this.modelInfo = modelInfo;

			
			this.root = SkeletonUtils.clone(this.modelInfo.gltf.scene);
			
			this.root.traverse(node => {
				if (node.isMesh) {
					node.castShadow = true;
					node.receiveShadow = true;
				}
			});
			gameObject.transform.add(this.root);

			
			this.root.position.set(x, yOffset, z);
			this.root.scale.setScalar(scale);
			this.root.rotation.y = rotY;
		}
	}

	class Player extends Component {

		constructor( gameObject, modelInfo, moveSpeed, rotSmoothFactor ) {

			super( gameObject );
			
			// console.log("Available Punk animations:", Object.keys(models.punk.animations));

			// create skin instance for model
			this.modelInfo = modelInfo;
			this.skin = gameObject.addComponent(SkinInstance, this.modelInfo);
			
			
			
			const animNames = Object.keys(this.modelInfo.animations);

			this.idleKey = animNames.find(name => name.toLowerCase().endsWith('idle'));
			this.walkKey = animNames.find(name => name.toLowerCase().endsWith('walk'));

			let defaultAnim = null;

			if (this.idleKey) {
				defaultAnim = this.idleKey;
			} else if (animNames.length > 0) {
				defaultAnim = animNames[0];
				console.warn('No "Idle" animation found; defaulting to "${defaultAnim}"');
			} else {
				console.warn('No animations found for this model');
			}

			if (defaultAnim) {
				this.skin.setAnimation(defaultAnim);
				this.currentAction = defaultAnim;
			} else {
				this.currentAction = null;
			}
			this.boundingBox = new THREE.Box3();
			this._boxHelper = new THREE.Box3Helper(this.boundingBox, 0xff0000);
    		scene.add(this._boxHelper);
			this.moveSpeed = moveSpeed;
			this.rotSmoothFactor = rotSmoothFactor;
			
		}

		// Move and animate punk based on keyState
		update() {
			const dir = new THREE.Vector3();
			if (inputManager.keys.forward.down) 	dir.z -= 1;
			if (inputManager.keys.backward.down)	dir.z += 1;
			if (inputManager.keys.left.down) 		dir.x -= 1;
			if (inputManager.keys.right.down) 		dir.x += 1;

			if (dir.lengthSq() > 0) {
		
				dir.normalize();

				const targetYaw = Math.atan2(dir.x, dir.z);
				
				const transform = this.gameObject.transform;
				let currentYaw = transform.rotation.y;
				let diff = targetYaw - currentYaw;

				if (diff > Math.PI)			diff -= 2 * Math.PI;
				else if (diff < -Math.PI) 	diff += 2 * Math.PI;

				const step = Math.min(this.rotSmoothFactor * globals.deltaTime, 1);
				currentYaw += diff * step;
				transform.rotation.y = currentYaw;

				transform.translateZ(this.moveSpeed * globals.deltaTime);
				// 	new THREE.Vector3(0,0,1), 
				// 	-this.moveSpeed * globals.deltaTime
				// );

				if (this.walkKey && this.currentAction !== this.walkKey) {
					this.skin.setAnimation(this.walkKey);
					this.currentAction = this.walkKey;
					// idleAction.fadeOut(0.2);
					// walkAction.reset().fadeIn(0.2).play();
				}
			} else {
				if (this.idleKey && this.currentAction !== this.idleKey) {
					this.skin.setAnimation(this.idleKey);
					this.currentAction = this.idleKey;
				}
			}
			// this.mixer.update(globals.deltaTime);


			const SHRINK_AMOUNT = -0.2;
			this.boundingBox.copy(
			computeTightBoundingBox(this.skin.animRoot, SHRINK_AMOUNT)
			);

			// 2) Update the visual helper so you can confirm
			this._boxHelper.updateMatrixWorld(true);
			this.skin.update();
		}
	}

	function rand( min, max ) {
		if ( max === undefined ) {
			max = min;
			min = 0;
		}
		return Math.random() * ( max - min ) + min;
	}	

	class Cars extends Component {
		
		constructor ( gameObject, modelInfo, laneIndex = 0, speed = CAR_SPEED ) {
			
			super( gameObject );
			
			this.modelInfo = modelInfo;
			this.laneIndex = laneIndex;
			this.speed = speed;

			this.carRoot = SkeletonUtils.clone(this.modelInfo.gltf.scene);
			gameObject.transform.add(this.carRoot);

			this.carRoot.scale.set(0.5, 0.5, 0.5);
			this.carRoot.rotation.y = Math.PI / 2;
			// this.carRoot.rotation.= Math.PI;

			const {
			laneSpace,
			numberOfLanes,
			lanePieceGap,
			startZ,
			tileScale
			} = ROAD_OPTIONS;

			const worldSegmentDepth = laneSpace * tileScale;
			const halfLaneSpan = (numberOfLanes - 1) / 2;
			const zPos = startZ + (laneIndex - halfLaneSpan) * worldSegmentDepth;
			gameObject.transform.position.set(-30, .5, zPos);

			this.boundingBox = new THREE.Box3();

    		// (Optional) helper in green
    		this._boxHelper = new THREE.Box3Helper(this.boundingBox, 0x00ff00);
    		scene.add(this._boxHelper);

		}
		update() {
			const deltaX = this.speed * globals.deltaTime;
			this.gameObject.transform.translateX(deltaX);
			const EXPAND_AMOUNT = 0.1;
				this.boundingBox.copy(
				computeTightBoundingBox(this.carRoot, EXPAND_AMOUNT)
			);
			this._boxHelper.updateMatrixWorld(true);

			if (this.gameObject.transform.position.x > 40) {
				scene.remove(this._boxHelper);
				gameObjectManager.removeGameObject(this.gameObject);
				const idx = activeCars.indexOf(this);
				if (idx !== -1) activeCars.splice(idx, 1);
				return;
			}
		}
	}
	
	const hitMessageElem = document.querySelector('#hitMessage');
	globals.hitMessageElem = hitMessageElem;

	function pivotWorldPosition() {
		return cameraPivot.position; 
	}

	function init() {
		

		const loadingElem = document.querySelector('#loading');
		loadingElem.style.display = 'none';

		prepModelsAndAnimations();
		
		{
			const cameraGameObject = gameObjectManager.createGameObject( camera, 'camera');
			globals.cameraInfo = cameraGameObject.addComponent( CameraInfo );
		}
		
		{
			const playerGameObject = gameObjectManager.createGameObject( scene, 'player' );
			playerGameObject.transform.position.set(0, 0, 20);
			playerGameObject.transform.rotation.y = Math.PI;
			globals.player = playerGameObject.addComponent( 
				Player,
				models.punk,
				moveSpeed,
				rotSmoothFactor
			);	
		}

		{
			const pPos = globals.player.gameObject.transform.position;
			cameraPivot.position.copy(pPos);

			// Tell OrbitControls that the “target” is now exactly the pivot’s position:
			controls.target.copy(pivotWorldPosition());  // pivotWorldPosition() below
			controls.update();
		}

		controls.target.copy(globals.player.gameObject.transform.position);
		controls.update();

		initRoads(scene);

		const uniformScale = 0.5;   // half‐size (for example)
		const groundY = 0;          // floor is at y=0 for your plane and roads

		{
			const go = gameObjectManager.createGameObject(scene, 'apartment');
			go.addComponent(Building, models.apartment, -20, -20, uniformScale * 0.8, groundY, 0);
			go.addComponent(Building, models.apartment, -16, -20, uniformScale * 0.8, groundY, 0);
			go.addComponent(Building, models.apartment, -12, -20, uniformScale * 0.8, groundY, 0);
			go.addComponent(Building, models.apartment, -8, -20, uniformScale * 0.8, groundY, 0);
			go.addComponent(Building, models.apartment, -4, -20, uniformScale * 0.8, groundY, 0);
			go.addComponent(Building, models.apartment, 0, -20, uniformScale * 0.8, groundY, 0);
			go.addComponent(Building, models.apartment, 4, -20, uniformScale * 0.8, groundY, 0);
			go.addComponent(Building, models.apartment, 8, -20, uniformScale * 0.8, groundY, 0);
			go.addComponent(Building, models.apartment, 12, -20, uniformScale * 0.8, groundY, 0);
			go.addComponent(Building, models.apartment, 16, -20, uniformScale * 0.8, groundY, 0);
			go.addComponent(Building, models.apartment, 20, -20, uniformScale * 0.8, groundY, 0);
			const go1 = gameObjectManager.createGameObject(scene, 'Building');
			go1.addComponent(Building, models.building, 20, 20, 1, groundY, Math.PI);
			go1.addComponent(Building, models.building, 15, 20, 1, groundY, Math.PI);
			go.addComponent(Building, models.apartment,10.5, 20, uniformScale * 0.8, groundY, 0);
			go1.addComponent(Building, models.building, -20, 20, 1, groundY, Math.PI);
			go1.addComponent(Building, models.building, -15, 20, 1, groundY, Math.PI);
			go.addComponent(Building, models.apartment,-10.5, 20, uniformScale * 0.8, groundY, 0);
			
		}

		
		function spawnCar (laneIndex, speed) {
			const carGameObject = gameObjectManager.createGameObject(scene, 'car');
			const carsComponent = carGameObject.addComponent(Cars, models.gtr, laneIndex, speed);
			activeCars.push(carsComponent);
		}

		const SPAWN_INTERVAL = 2.0;
		setInterval(() => {
			for (let i = 0; i < ROAD_OPTIONS.numberOfLanes; i++) {
				const speed = CAR_SPEED + Math.random() * 2;
				spawnCar(i, speed);
			}
		},SPAWN_INTERVAL * 1000);
		// setTimeout(() => {
		// 	for (let i = 0; i < ROAD_OPTIONS.numberOfLanes; i++){
		// 		spawnCar(i, 4 + Math.random() * 2);
		// 	}
		// }, 100);
	}

	


	// function loadColorTexture( path ) {

	// 	const texture = loader.load( path );
	// 	texture.colorSpace = THREE.SRGBColorSpace;
	// 	return texture;

	// }

	

	const skyLoader = new THREE.CubeTextureLoader();
	const skyboxTexture = skyLoader.load( [
		
		'resources/img/elyvisions/sh_lf.png',
		'resources/img/elyvisions/sh_rt.png',
		'resources/img/elyvisions/sh_up.png',
		'resources/img/elyvisions/sh_dn.png',
		'resources/img/elyvisions/sh_ft.png',
		'resources/img/elyvisions/sh_bk.png',
		
	] );
	scene.background = skyboxTexture;
	
	//gltf Loader
	{
		function dumpObject(obj, lines = [], isLast = true, prefix = '') {
			const localPrefix = isLast ? '└─' : '├─';
			lines.push(
			`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`
			);
			const newPrefix = prefix + (isLast ? '  ' : '│ ');
			const lastNdx = obj.children.length - 1;
			obj.children.forEach((child, ndx) => {
				const isLast = ndx === lastNdx;
				dumpObject(child, lines, isLast, newPrefix);
			});
			return lines;
		}

		/**
		 * Recursively prints the scene‐graph and animation clips from a loaded glTF.
		 *
		 * @param {Object} gltf
		 *   The object you get in the GLTFLoader callback (e.g. loader.load(url, gltf => { … })).
		 *   Must contain `gltf.scene` (an Object3D) and optionally `gltf.animations` (an array).
		 */
		function dumpGLTF(gltf) {
			// Dump the scene hierarchy:
			const sceneTree = dumpObject(gltf.scene);
			console.log(sceneTree.join('\n'));

			// Dump all animation clips (if present):
			if (gltf.animations && gltf.animations.length) {
				console.log('\nAnimations:');
				gltf.animations.forEach((clip, idx) => {
				console.log(`  ${idx}: ${clip.name} (${clip.tracks.length} tracks)`);
				});
			} else {
				console.log('\nNo animations found in this glTF.');
			}
		}
	}

	

	// FOR SINGLE CAMERA
	function resizeRendererToDisplaySize( renderer ) {

		const canvas = renderer.domElement;
		const pixelRatio = window.devicePixelRatio;
		const width = Math.floor( canvas.clientWidth * pixelRatio );
		const height = Math.floor( canvas.clientHeight * pixelRatio );
		const needResize = canvas.width !== width || canvas.height !== height;
		if ( needResize ) {

			renderer.setSize( width, height, false );

		}
		return needResize;
	}

	// FOR TWO CAMERAS
	function resizeRendererToDisplaySize2Cameras( renderer ) {

		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if ( needResize ) {

			renderer.setSize( width, height, false );

		}
		return needResize;
	}

	function setScissorForElement( elem ) {

		const canvasRect = canvas.getBoundingClientRect();
		const elemRect = elem.getBoundingClientRect();

		// compute a canvas relative rectangle
		const right = Math.min( elemRect.right, canvasRect.right ) - canvasRect.left;
		const left = Math.max( 0, elemRect.left - canvasRect.left );
		const bottom = Math.min( elemRect.bottom, canvasRect.bottom ) - canvasRect.top;
		const top = Math.max( 0, elemRect.top - canvasRect.top );

		const width = Math.min( canvasRect.width, right - left );
		const height = Math.min( canvasRect.height, bottom - top );

		// setup the scissor to only render to that part of the canvas
		const positiveYUpBottom = canvasRect.height - bottom;
		renderer.setScissor( left, positiveYUpBottom, width, height );
		renderer.setViewport( left, positiveYUpBottom, width, height );

		// return the aspect
		return width / height;
	}

	function checkCollisions() {
		if (!globals.player) return;
		const playerComp = globals.player;     // this is the Player component instance
		const playerBox = playerComp.boundingBox;

		// Loop over every active car
		for (const carComp of activeCars) {
			const carBox = carComp.boundingBox;
			// If the two boxes overlap, we have a collision
			if (playerBox.intersectsBox(carBox)) {
				// Collision detected!
				handlePlayerHit(carComp);
				return; // if you only want to detect the first hit, otherwise omit `return`
			}
		}
	}

	function handlePlayerHit(carComp) {
		
		// console.log("💥 Collision! Player hit by a car!");
		
		const hit = globals.hitMessageElem;
		if (hit) {
			hit.style.display = 'block';
			setTimeout(() => {
				hit.style.display = 'none';
			}, 1000);
		}

		globals.player.gameObject.transform.position.set(0, 0, 20);
		globals.player.gameObject.transform.rotation.y = Math.PI;
		
	}

	
	let then = 0;
	function render( now ) {
		
		// {	// single camera setup
		// time *= 0.001;

		if ( resizeRendererToDisplaySize( renderer ) ) {

			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();

		}

		

		// requestAnimationFrame( render );

		// }

		globals.time = now * 0.001;
		globals.deltaTime = Math.min(globals.time - then, 1 / 20);
		then = globals.time;


		
		gameObjectManager.update();
		inputManager.update();

		// if (globals.player) {
		// 	const playerPos = globals.player.gameObject.transform.position;
		// 	const localOffset = new THREE.Vector3(0, height, back);
		// 	camera.position.copy(playerPos).add(localOffset);
		// 	const target = playerPos.clone();
		// 	target.y += 1.5;
		// 	camera.lookAt(target);
		// }

		if (globals.player) {
			const playerPos = globals.player.gameObject.transform.position;
			cameraPivot.position.copy(playerPos);
			controls.target.set(playerPos.x, playerPos.y + 1.5, playerPos.z);;
		}
		controls.update();
		checkCollisions();

		resizeRendererToDisplaySize( renderer );
		// resizeRendererToDisplaySize2Cameras( renderer );

		// turn on the scissor
		// renderer.setScissorTest( true );

		{ // 2 camera setup

			// scene.traverse((obj) => {
			// 	if (obj.userData.punkMixer) {
			// 		obj.userData.punkMixer.update(delta);
			// 	}
			// });
			// renderer.render(scene,camera);
			// render the original view
			// {

			// 	const aspect = setScissorForElement( view1Elem );

			// 	// adjust the camera for this aspect
			// 	camera.aspect = aspect;
			// 	camera.updateProjectionMatrix();
			// 	cameraHelper.update();

			// 	// don't draw the camera helper in the original view
			// 	cameraHelper.visible = false;

			// 	// scene.background.set( 0x000000 );

			// 	// render
			// 	renderer.render( scene, camera );

			// }

			// // render from the 2nd camera
			// {

			// 	const aspect = setScissorForElement( view2Elem );

			// 	// adjust the camera for this aspect
			// 	camera2.aspect = aspect;
			// 	camera2.updateProjectionMatrix();

			// 	// draw the camera helper in the 2nd view
			// 	cameraHelper.visible = true;

			// 	// scene.background.set( 0x000040 );

			// 	renderer.render( scene, camera2 );

			// }
			renderer.render( scene, camera );

		}
		requestAnimationFrame( render );
	}

	requestAnimationFrame( render );

}

main();
