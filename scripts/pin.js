import { Object3D, Color, SphereGeometry, Vector3, Mesh, ConeGeometry, Group, MeshPhongMaterial, MeshBasicMaterial } from './three.module.js';
import { Lerp, EasingFunctions } from './Util.js';
import { SubRGB, PinRGB, DonationRGB, FollowRGB, BitsRGB } from './Options.js';

let _targetAreas = [{width: 3, height: 3, x: -3, y: -3, chance: 1}];
window.targetAreas = _targetAreas;

export default class Pin extends Group{

    constructor(type, data){
        super();
        let ballColor = new Color(0.5, 0, 0.5);
        let size = 0.0075;

        if(type){
            switch(type){
                case "follow":
                    ballColor.setHex(FollowRGB);
                    break;
                case "subscription":
                    ballColor.setHex(SubRGB);
                    size += Math.pow(data.months * 5, 0.1) / 15;
                    break;
                case "donation":
                    ballColor.setHex(DonationRGB);
                    size += Math.pow(data.amount, 0.15) / 20;
                    break;
                case "bits":
                    data.amount = 1;
                    ballColor.setHex(BitsRGB);
                    size += Math.pow(data.amount / 100, 0.15) / 20;
                    break;
            }
        }
        const coneRad = Math.pow(size / 5, 0.9);
        const coneLen = size*20;

        // console.log(type, ballColor, size);


        this.internalObj = new Object3D();
        this.internalObj.position.set(0, 0, -coneLen * (0.4 + Math.random() * 0.4));
        this.add(this.internalObj);

        let ballGeom = new SphereGeometry(size, 12, 12);
        let ballMat = new MeshBasicMaterial({ color: ballColor.getHex() });
        this.sphere = new Mesh(ballGeom, ballMat);

        this.internalObj.add(this.sphere);

        let needleGeom = new ConeGeometry(coneRad, coneLen);
        let needleMat = new MeshBasicMaterial({ color: PinRGB});
        let needleMesh = new Mesh(needleGeom, needleMat);
        this.needle = new Object3D();
        this.needle.position.set(0, 0, coneLen/2);
        this.needle.lookAt(0, 200, 0);
        this.needle.add(needleMesh);
        this.internalObj.add(this.needle);


        let xy = this.getPointIn(this.chooseTargetArea());
        this.target = new Vector3(
            xy.x, 
            xy.y, 
            0);

        this.position.set(
            this.target.x * 1.05 + Math.random()*1.5 - 0.75,
            this.target.y * 1.05 + Math.random()*1.5 - 0.75,
            1.5 + Math.random() - (this.target.length() / 10));

        this.start = new Vector3().copy(this.position);
        this.lookAt(this.target);

        this.timeElapsed = 0;
    }

    tickUpdate(){
        this.timeElapsed += 0.02;
        if(this.timeElapsed >= 0.2 && this.timeElapsed <= 1.2){
            const eased = EasingFunctions.easeInOutQuint(this.timeElapsed - 0.2);
            this.position.x = Lerp(this.start.x, this.target.x, eased);
            this.position.y = Lerp(this.start.y, this.target.y, eased);
            this.position.z = Lerp(this.start.z, this.target.z, eased);    
        }
    }

    static setTargetAreas(targetAreas){
        _targetAreas.length = 0;
        for(let target of targetAreas){
            _targetAreas.push(target);
        }
    }

    getPointIn(targetArea){
        let x = Math.random() * targetArea.width + targetArea.x;
        let y = -Math.random() * targetArea.height + targetArea.y;
        return {x, y};
    }

    chooseTargetArea(){
        let c = 0;
        let intervals = [];
        for(let i = 0; i < _targetAreas.length; ++i){
            let t = _targetAreas[i];
            c += t.chance;
            intervals.push(c);
        }

        let a = Math.random() * c;        
        for(let i = 0; i < intervals.length; ++i){
            if(a <= intervals[i]){
                return _targetAreas[i];
            }
        }
    }
}