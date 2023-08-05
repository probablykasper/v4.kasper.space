<script lang="ts">
	import { onMount } from 'svelte'
	import {
		Color,
		Mesh,
		MeshBasicMaterial,
		PerspectiveCamera,
		Scene,
		SphereGeometry,
		WebGLRenderer,
	} from 'three'

	const canvasHeight = 400
	const SEPARATION = 100
	const AMOUNTX = 80
	const AMOUNTY = 40
	const particleColor = '#3f3f3f'

	let container: HTMLDivElement
	let camera: PerspectiveCamera
	let scene: Scene
	let renderer: WebGLRenderer

	let particles: Mesh[]
	let particle: Mesh

	let show = false

	function getCanvasContainerWidth() {
		return container?.clientWidth || window.innerWidth
	}
	onMount(() => {
		camera = new PerspectiveCamera(75, getCanvasContainerWidth() / canvasHeight, 1, 10000)
		camera.position.set(0, 355, 122)

		scene = new Scene()

		particles = []

		const geometry = new SphereGeometry(0.5, 8, 8)
		const material = new MeshBasicMaterial({
			color: particleColor,
		})

		let i = 0

		for (let ix = 0; ix < AMOUNTX; ix++) {
			for (let iy = 0; iy < AMOUNTY; iy++) {
				particle = particles[i++] = new Mesh(geometry, material)
				particle.position.x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2
				particle.position.z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2
				scene.add(particle)
			}
		}

		renderer = new WebGLRenderer({ antialias: true })
		renderer.setClearColor(new Color('#ffffff'))
		renderer.setPixelRatio(window.devicePixelRatio)
		renderer.setSize(getCanvasContainerWidth(), canvasHeight)
		container.appendChild(renderer.domElement)

		show = true
		requestAnimationFrame(step)
	})

	type DOMHighResTimeStamp = number
	let start: DOMHighResTimeStamp
	let elapsed = 0
	function step(timestamp: DOMHighResTimeStamp) {
		if (start === undefined) {
			start = timestamp
		}
		const elapsed_ms = timestamp - start
		elapsed = elapsed_ms * 0.006

		let i = 0

		for (let ix = 0; ix < AMOUNTX; ix++) {
			for (let iy = 0; iy < AMOUNTY; iy++) {
				particle = particles[i++]
				particle.position.y =
					Math.sin((ix + elapsed) * 0.3) * 50 + Math.sin((iy + elapsed) * 0.5) * 50
				particle.scale.x = particle.scale.y =
					(Math.sin((ix + elapsed) * 0.3) + 1) * 4 + (Math.sin((iy + elapsed) * 0.5) + 1) * 4
			}
		}

		renderer.render(scene, camera)
		requestAnimationFrame(step)
	}
</script>

<svelte:window
	on:resize={() => {
		const canvasContainerWidth = getCanvasContainerWidth()

		camera.aspect = canvasContainerWidth / canvasHeight
		camera.updateProjectionMatrix()

		renderer.setSize(canvasContainerWidth, canvasHeight)
	}}
/>
<div class="canvas-container" class:hidden={!show} bind:this={container} />

<style lang="sass">
	$transition-100: 1s cubic-bezier(0.4, 0.0, 0.2, 1.0)

	.canvas-container
		position: absolute
		top: 0px
		left: 0px
		z-index: -1
		width: 100%
		transform: rotate(180deg)
		transition: $transition-100 opacity
		&.hidden
			opacity: 0
</style>
