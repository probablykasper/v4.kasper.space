<script lang="ts">
	export let title: string
	export let text: string
	let el: HTMLElement
	let popupEl: HTMLElement

	let visible = false
	$: if (visible) {
		const range = document.createRange()
		range.selectNodeContents(popupEl)
		const selection = window.getSelection()
		if (selection) {
			selection.removeAllRanges()
			selection.addRange(range)
		}
	}
</script>

<svelte:body
	on:click={(e) => {
		if (e.target instanceof Node && !el.contains(e.target)) {
			visible = false
		}
	}}
/>

<button
	type="button"
	class="has-popup"
	class:popup-hidden={!visible}
	{title}
	bind:this={el}
	on:click={() => {
		visible = !visible
	}}
>
	<slot />
	<p class="popup" bind:this={popupEl}>{text}</p>
</button>

<style lang="sass">
	$darkest: #14161D
	$transition-20: .20s cubic-bezier(0.4, 0.0, 0.2, 1.0)

	.has-popup
		position: relative
		appearance: none
		border: none
		background: transparent
		cursor: pointer
		padding: 0px
		&.popup-hidden .popup
			transform: translate(-50%, -10px) scale(0.5)
			pointer-events: none
			opacity: 0
		.popup
			margin: 0px
			cursor: text
			display: block
			text-align: center
			font-family: "Rubik", sans-serif
			position: absolute
			transition: $transition-20 all
			transform: translate(-50%, 0px)
			font-size: 14px
			border: none
			outline: none
			color: $darkest
			top: 100%
			left: 50%
			padding: 5px
			background-color: transparent
</style>
