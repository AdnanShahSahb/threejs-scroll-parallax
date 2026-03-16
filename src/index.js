

import GUI from "lil-gui"
import * as THREE from "three"
import gsap from "gsap"

const sizes = {
    height: window.innerHeight,
    width: window.innerWidth
}

const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

const gui = new GUI()

const parameters = {
    color: '#ffeded'
}

const cameraGroup = new THREE.Group();
scene.add(cameraGroup)

const camera = new THREE.PerspectiveCamera(33, sizes.width / sizes.height, 0.1, 1000)
camera.position.z = 8;
cameraGroup.add(camera);

const dirLight = new THREE.DirectionalLight("white", 3)
dirLight.position.set(1, 1, 0)
scene.add(dirLight)

const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('./3.jpg')
gradientTexture.magFilter = THREE.NearestFilter
gradientTexture.colorSpace = THREE.SRGBColorSpace


const material = new THREE.MeshToonMaterial({
    color: parameters.color,
    gradientMap: gradientTexture
})


const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.5, 16, 60),
    material
)
scene.add(mesh1)
const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 1, 32),
    material
)
scene.add(mesh2)
const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1, 0.41, 100, 16),
    material
)
scene.add(mesh3)

const sectionMeshes = [mesh1, mesh2, mesh3]

const objDistance = 5;


mesh1.position.y = -objDistance * 0;
mesh2.position.y = -objDistance * 1;
mesh3.position.y = -objDistance * 2;

mesh1.position.x = 3;
mesh2.position.x = -3;
mesh3.position.x = 3;

// mesh1.position.y = 2;
// mesh1.scale.set(0.5, 0.5, 0.5)
// mesh2.visible = false;
// mesh3.position.y = -2;
// mesh3.scale.set(0.5, 0.5, 0.5)


const count = 1000;
const positions = new Float32Array(count * 3)
for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = objDistance * 0.3 - (Math.random()) * objDistance * (sectionMeshes.length);
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}
const particlesGeom = new THREE.BufferGeometry();
particlesGeom.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
)
const particlesMat = new THREE.PointsMaterial({
    color: 'white',
    size: 0.01,
    sizeAttenuation: true,
})
const points = new THREE.Points(particlesGeom, particlesMat)
scene.add(points)



gui.addColor(parameters, 'color').onChange(() => {
    material.color.set(parameters.color);
    particlesMat.color.set(parameters.color)
})

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true })
renderer.setSize(sizes.width, sizes.height)


let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener('scroll', () => {
    scrollY = window.scrollY


    const newSection = (Math.round((scrollY / sizes.height)));

    if (newSection != currentSection) {
        currentSection = newSection;

        gsap.to(sectionMeshes[currentSection].rotation, {
            duration: 1.5,
            ease: 'power2.inOut',
            x: '+=6',
            y: '+=3'
        })
    }
})

const cursor = {
    x: 0,
    y: 0,
}
window.addEventListener('mousemove', (e) => {
    cursor.x = e.clientX / sizes.width - 0.5;
    cursor.y = e.clientY / sizes.height - 0.5;
})


window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const clock = new THREE.Clock();
let prevTime = 0;
const anim = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - prevTime;
    prevTime = elapsedTime;

    camera.position.y = -scrollY / sizes.height * objDistance;

    const parallaxX = cursor.x;
    const parallaxY = -cursor.y;
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 3 * deltaTime;
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 3 * deltaTime;

    sectionMeshes.forEach((d) => {
        d.rotation.x += deltaTime * 0.1;
        d.rotation.y += deltaTime * 0.2;
        d.rotation.z += deltaTime * 0.3;
    })

    renderer.render(scene, camera)
    requestAnimationFrame(anim)
}
anim();