import Pin from "./pin.js";
import { Scene, WebGLRenderer, PerspectiveCamera, DirectionalLight, AmbientLight, GridHelper, Mesh, PlaneGeometry, MeshBasicMaterial, TextureLoader, DoubleSide, LinearFilter } from "./three.module.js";
import { imgTo3by3 } from "./Util.js";
import { SocketToken, BitsActive, FollowActive, SubActive, DonationActive, ThresholdActive, Threshold } from "./Options.js";

//Connect to socket
const streamlabs = io(`https://sockets.streamlabs.com?token=${SocketToken}`);


const scene = new Scene();
window.scene = scene;
const renderer = new WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
document.body.appendChild(renderer.domElement);

let camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0, 0, 5);
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true;

const light1 = new DirectionalLight(0xffffff, 1.0);
light1.position.set(0.5, 1.0, 0.5);
scene.add(light1);

const light2 = new AmbientLight(0xffffff, 0.5);
scene.add(light2);

// const gridHelper = new GridHelper(10, 10);
// scene.add(gridHelper);

const pins = [];

const dollTexture = new TextureLoader().load('./images/voodoo_doll.png');
dollTexture.minFilter = LinearFilter;

let dollTargetAreas = [
    {
        x: 51,
        y: 580,
        width:270,
        height:170,
    }, 
    {
        x: 366,
        y: 740,
        width:193,
        height:203,
    }, 
    {
        x: 176,
        y: 417,
        width:150,
        height:160,
    }, 
    {
        x: 709,
        y: 516,
        width:134,
        height:246,
    }, 
    {
        x: 329,
        y: 390,
        width:365,
        height:328,
    }, 
    {
        x: 460,
        y: 78,
        width:420,
        height:309,
    }, 
]
dollTargetAreas = dollTargetAreas.map(e => imgTo3by3(e));
Pin.setTargetAreas(dollTargetAreas);

// for(let t of dollTargetAreas){
//     let a = new Mesh(
//         new PlaneGeometry(t.width, t.height),
//         new MeshBasicMaterial({color: 0xff0000})
//     );
//     a.position.set(t.x + t.width / 2, t.y - t.height / 2, 0.05);
//     scene.add(a);
// }

const doll = new Mesh(
    new PlaneGeometry(6, 6),
    new MeshBasicMaterial({ map: dollTexture, side: DoubleSide, transparent: true })
);
scene.add(doll);


function AddPins(eventData){
    if(eventData.message instanceof Array){
        for(let msg of eventData.message){
            pins.push(new Pin(eventData.type, msg));
            scene.add(pins[pins.length - 1]);    
        }    
    }
    else{
        pins.push(new Pin(eventData.type, eventData.message));
        scene.add(pins[pins.length - 1]);    
    }
}

//Perform Action on event
streamlabs.on('event', (eventData) => {
    if ((!eventData.for || eventData.for === 'streamlabs') && eventData.type === 'donation') {
        //code to handle donation events
        if(DonationActive){
            if(ThresholdActive && (eventData.message[0].amount < Threshold)){}
            else{
                AddPins(eventData);
            }
        }

    }
    if (eventData.for === 'twitch_account') {
        switch(eventData.type){
            case "bits":
                if(BitsActive){
                    if(ThresholdActive && (eventData.message[0].amount / 100 < Threshold)){}
                    else{
                        AddPins(eventData);
                    }
                } 
                break;
            case "follow":
                if(FollowActive) AddPins(eventData);
                break;
            case "subscription":
                if(SubActive) AddPins(eventData);
                break;
            default:
                break;
        }
    }
});

function animate(){
    requestAnimationFrame(animate);

    for(let pin of pins){
        pin.tickUpdate();
    }

    renderer.render(scene, camera);
}
animate();