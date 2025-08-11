import {
    Engine,
    Scene,
    UniversalCamera,
    Vector3,
    HemisphericLight, MeshBuilder,
    StandardMaterial, Color3, CannonJSPlugin, PhysicsImpostor, AbstractMesh,
    Mesh, DirectionalLight,
    ArcRotateCamera,
    Texture,
    Vector4,
    Axis,
    Space,
    SolidParticleSystem,
    ActionManager,
    ExecuteCodeAction,
} from '@babylonjs/core'
import { DetectionState } from './detection/detectionState'


export function setup(containerId: string, detectionState: DetectionState) {
    console.log(`carGame -> setup(${containerId})`)
    const gameContainer = document.getElementById(containerId)
    // Clear any existing content
    gameContainer.innerHTML = ''

    // Create canvas for Babylon.js
    const canvas = document.createElement('canvas')
    canvas.id = 'babylonCanvas'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    canvas.style.touchAction = 'none'
    gameContainer.appendChild(canvas)
    const [engine, scene] = createScene(canvas, detectionState)
    engine.runRenderLoop(function () {
        scene.render()
    })
    return [engine, scene]
}

export function createScene(canvas, detectionState: DetectionState): [Engine, Scene] {
    console.log(`carGame -> createScene(${canvas})`)
    const engine = new Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
        antialias: true,
        adaptToDeviceRatio: true
    })
    const scene = new Scene(engine)
    // camera
    let camera = new ArcRotateCamera("camera1", 0, 0, 20, new Vector3(0, 0, 0), scene)
    camera.setPosition(new Vector3(11.5, 3.5, 0))

    // lights
    let light1 = new DirectionalLight("light1", new Vector3(1, 2, 0), scene)
    let light2 = new HemisphericLight("light2", new Vector3(0, 1, 0), scene)
    light2.intensity = 0.75

    /***************************Car*********************************************/

    /*-----------------------Car Body------------------------------------------*/

    //Car Body Material 
    let bodyMaterial = new StandardMaterial("body_mat", scene)
    bodyMaterial.diffuseColor = new Color3(1.0, 0.25, 0.25)
    bodyMaterial.backFaceCulling = false

    //Array of points for trapezium side of car.
    let side = [
        new Vector3(-6.5, 1.5, -2),
        new Vector3(2.5, 1.5, -2),
        new Vector3(3.5, 0.5, -2),
        new Vector3(-9.5, 0.5, -2)
    ]

    side.push(side[0])	//close trapezium

    //Array of points for the extrusion path
    let extrudePath = [new Vector3(0, 0, 0), new Vector3(0, 0, 4)]

    //Create body and apply material
    let carBody = MeshBuilder.ExtrudeShape("body", { shape: side, path: extrudePath, cap: Mesh.CAP_ALL }, scene)
    carBody.material = bodyMaterial
    camera.parent = carBody
    /*-----------------------End Car Body------------------------------------------*/

    /*-----------------------Wheel------------------------------------------*/

    //Wheel Material 
    let wheelMaterial = new StandardMaterial("wheel_mat", scene)
    let wheelTexture = new Texture("http://i.imgur.com/ZUWbT6L.png", scene)
    wheelMaterial.diffuseTexture = wheelTexture

    //Set color for wheel tread as black
    let faceColors = []
    faceColors[1] = new Color3(0, 0, 0)

    //set texture for flat face of wheel 
    let faceUV = []
    faceUV[0] = new Vector4(0, 0, 1, 1)
    faceUV[2] = new Vector4(0, 0, 1, 1)

    //create wheel front inside and apply material
    let wheelFI = MeshBuilder.CreateCylinder("wheelFI", { diameter: 3, height: 1, tessellation: 24, faceColors: faceColors, faceUV: faceUV }, scene)
    wheelFI.material = wheelMaterial

    //rotate wheel so tread in xz plane  
    wheelFI.rotate(Axis.X, Math.PI / 2, Space.WORLD)
    /*-----------------------End Wheel------------------------------------------*/

    /*-------------------Pivots for Front Wheels-----------------------------------*/
    let pivotFI = new Mesh("pivotFI", scene)
    pivotFI.parent = carBody
    pivotFI.position = new Vector3(-6.5, 0, -2)

    let pivotFO = new Mesh("pivotFO", scene)
    pivotFO.parent = carBody
    pivotFO.position = new Vector3(-6.5, 0, 2)
    /*----------------End Pivots for Front Wheels--------------------------------*/

    /*------------Create other Wheels as Instances, Parent and Position----------*/
    let wheelFO = wheelFI.createInstance("FO")
    wheelFO.parent = pivotFO
    wheelFO.position = new Vector3(0, 0, 1.8)

    let wheelRI = wheelFI.createInstance("RI")
    wheelRI.parent = carBody
    wheelRI.position = new Vector3(0, 0, -2.8)

    let wheelRO = wheelFI.createInstance("RO")
    wheelRO.parent = carBody
    wheelRO.position = new Vector3(0, 0, 2.8)

    wheelFI.parent = pivotFI
    wheelFI.position = new Vector3(0, 0, -1.8)
    /*------------End Create other Wheels as Instances, Parent and Position----------*/

    /*---------------------Create Car Centre of Rotation-----------------------------*/
    let pivot = new Mesh("pivot", scene) //current centre of rotation
    pivot.position.z = 50
    carBody.parent = pivot
    carBody.position = new Vector3(0, 0, -50)

    /*---------------------End Create Car Centre of Rotation-------------------------*/


    /*************************** End Car*********************************************/

    /*****************************Add Ground********************************************/
    let groundSize = 400

    let ground = MeshBuilder.CreateGround("ground", { width: groundSize, height: groundSize }, scene)
    let groundMaterial = new StandardMaterial("ground", scene)
    groundMaterial.diffuseColor = new Color3(0.75, 1, 0.25)
    ground.material = groundMaterial
    ground.position.y = -1.5
    /*****************************End Add Ground********************************************/

    /*****************************Particles to Show Movement********************************************/
    let box = MeshBuilder.CreateBox("box", {}, scene)
    box.position = new Vector3(20, 0, 10)


    let boxesSPS = new SolidParticleSystem("boxes", scene, { updatable: false })

    //function to position of grey boxes
    let set_boxes = function (particle, i, s) {
        particle.position = new Vector3(-200 + Math.random() * 400, 0, -200 + Math.random() * 400)
    }

    //add 400 boxes
    boxesSPS.addShape(box, 400, { positionFunction: set_boxes })
    let boxes = boxesSPS.buildMesh() // mesh of boxes
    boxes.material = new StandardMaterial("", scene)
    boxes.material.alpha = 0.25
    /*****************************Particles to Show Movement********************************************/



    /****************************Key Controls************************************************/

    let map = {} //object for multiple key presses
    scene.actionManager = new ActionManager(scene)

    scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown"

    }))

    scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown"
    }))

    /****************************End Key Controls************************************************/


    /****************************Variables************************************************/

    let theta = 0
    let deltaTheta = 0
    let D = 0 //distance translated per second
    let R = 50 //turning radius, initial set at pivot z value
    let NR //Next turning radius on wheel turn
    let A = 4 // axel length
    let L = 4 //distance between wheel pivots
    let r = 1.5 // wheel radius
    let psi, psiRI, psiRO, psFI, psiFO //wheel rotations  
    let phi //rotation of car when turning 

    let F // frames per second	

    /****************************End Variables************************************************/



    /****************************Animation******************************************************/
    let turningLeft = false
    let turningRight = false
    scene.registerAfterRender(function () {
        F = engine.getFps()

        if (map[" "] && D < 5) {
            D += 1
        }

        if (D > 0.15) {
            D -= 0.15
        }
        else {
            D = 0
        }

        let distance = D / F
        psi = D / (r * F)
        const turnLeft = (map['a'] || map['A'] || detectionState.state.input.left > 0)
        const turnRight = (map['d'] || map['D'] || detectionState.state.input.right > 0)

        if (turnLeft && -Math.PI / 6 < theta) {
            turningLeft = true
            turningRight = false
            deltaTheta = -Math.PI / 252
            theta += deltaTheta
            pivotFI.rotate(Axis.Y, deltaTheta, Space.LOCAL)
            pivotFO.rotate(Axis.Y, deltaTheta, Space.LOCAL)
            if (Math.abs(theta) > 0.00000001) {
                NR = A / 2 + L / Math.tan(theta)
            }
            else {
                console.log('turnLeft & Resetting theta & NR')
                theta = 0
                NR = 0
            }
            pivot.translate(Axis.Z, NR - R, Space.LOCAL)
            carBody.translate(Axis.Z, R - NR, Space.LOCAL)
            R = NR
        }
        if (turnRight && theta < Math.PI / 6) {
            turningRight = true
            turningLeft = false
            deltaTheta = Math.PI / 252
            theta += deltaTheta
            pivotFI.rotate(Axis.Y, deltaTheta, Space.LOCAL)
            pivotFO.rotate(Axis.Y, deltaTheta, Space.LOCAL)
            if (Math.abs(theta) > 0.00000001) {
                NR = A / 2 + L / Math.tan(theta)
            }
            else {
                console.log('turnRight & Resetting theta & NR')
                theta = 0
                NR = 0
            }
            pivot.translate(Axis.Z, NR - R, Space.LOCAL)
            carBody.translate(Axis.Z, R - NR, Space.LOCAL)
            R = NR
        }

        if (D > 0) {
            phi = D / (R * F)
            if (Math.abs(theta) > 0) {
                pivot.rotate(Axis.Y, phi, Space.WORLD)
                psiRI = D / (r * F)
                psiRO = D * (R + A) / (r * F)
                let psiFI = D * Math.sqrt(R * R + L * L) / (r * F)
                psiFO = D * Math.sqrt((R + A) * (R + A) + L * L) / (r * F)

                wheelFI.rotate(Axis.Y, psiFI, Space.LOCAL)
                wheelFO.rotate(Axis.Y, psiFO, Space.LOCAL)
                wheelRI.rotate(Axis.Y, psiRI, Space.LOCAL)
                wheelRO.rotate(Axis.Y, psiRO, Space.LOCAL)
            }
            else {
                pivot.translate(Axis.X, -distance, Space.LOCAL)
                wheelFI.rotate(Axis.Y, psi, Space.LOCAL)
                wheelFO.rotate(Axis.Y, psi, Space.LOCAL)
                wheelRI.rotate(Axis.Y, psi, Space.LOCAL)
                wheelRO.rotate(Axis.Y, psi, Space.LOCAL)
            }
        }
    })
    return [engine, scene]
}