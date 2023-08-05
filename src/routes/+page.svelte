<script lang="ts">
	import { PUBLIC_EMAIL } from '$env/static/public'
	import Particles from './Particles.svelte'
	import Popup from './Popup.svelte'

	export let data
	console.log(data)
</script>

<svelte:head>
	<title>Kasper</title>
	<meta name="Description" content="My portfolio website" />
</svelte:head>

<img class="logo" alt="" src="/kh-logo.png" />
<div class="social-media">
	<a
		class="svg-link twitter"
		target="_blank"
		rel="noopener noreferrer"
		title="Twitter"
		href="https://twitter.com/probablykasper"
	>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
			<path
				d="M32 7.075a12.941 12.941 0 01-3.769 1.031 6.601 6.601 0 002.887-3.631 13.21 13.21 0 01-4.169 1.594A6.565 6.565 0 0022.155 4a6.563 6.563 0 00-6.563 6.563c0 .512.056 1.012.169 1.494A18.635 18.635 0 012.23 5.195a6.56 6.56 0 00-.887 3.3 6.557 6.557 0 002.919 5.463 6.565 6.565 0 01-2.975-.819v.081a6.565 6.565 0 005.269 6.437 6.574 6.574 0 01-2.968.112 6.588 6.588 0 006.131 4.563 13.17 13.17 0 01-9.725 2.719 18.568 18.568 0 0010.069 2.95c12.075 0 18.681-10.006 18.681-18.681 0-.287-.006-.569-.019-.85A13.216 13.216 0 0032 7.076z"
			/>
		</svg>
	</a>
	<div class="svg-link">
		<Popup title="Discord" text="Kasper#6425">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
				<path
					d="M26.963 0c1.875 0 3.387 1.516 3.476 3.3V32l-3.569-3.031-1.96-1.784-2.139-1.864.893 2.94H4.947c-1.869 0-3.387-1.42-3.387-3.301V3.307C1.56 1.523 3.08.004 4.953.004L26.962 0zm-8.158 7.577h-.04l-.269.267c2.764.8 4.101 2.049 4.101 2.049-1.781-.891-3.387-1.336-4.992-1.516-1.16-.18-2.32-.085-3.3 0h-.267c-.627 0-1.96.267-3.747.98-.623.271-.98.448-.98.448s1.336-1.336 4.28-2.049l-.18-.18s-2.229-.085-4.636 1.693c0 0-2.407 4.192-2.407 9.36 0 0 1.333 2.32 4.991 2.408 0 0 .533-.711 1.073-1.336-2.053-.624-2.853-1.872-2.853-1.872s.179.088.447.267h.08c.04 0 .059.02.08.04v.008c.021.021.04.04.08.04.44.181.88.36 1.24.533.621.269 1.42.537 2.4.715 1.24.18 2.661.267 4.28 0 .8-.18 1.6-.356 2.4-.713.52-.267 1.16-.533 1.863-.983 0 0-.8 1.248-2.94 1.872.44.621 1.06 1.333 1.06 1.333 3.659-.08 5.08-2.4 5.16-2.301 0-5.16-2.42-9.36-2.42-9.36-2.18-1.619-4.22-1.68-4.58-1.68l.075-.027zm.224 5.884c.937 0 1.693.8 1.693 1.78 0 .987-.76 1.787-1.693 1.787s-1.693-.8-1.693-1.779c.003-.987.764-1.784 1.693-1.784zm-6.057 0c.933 0 1.688.8 1.688 1.78 0 .987-.76 1.787-1.693 1.787s-1.693-.8-1.693-1.779c0-.987.76-1.784 1.693-1.784z"
				/>
			</svg>
		</Popup>
	</div>
	<a
		class="svg-link youtube"
		target="_blank"
		rel="noopener noreferrer"
		title="YouTube"
		href="https://youtube.com/probablykasper"
	>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
			<path
				d="M31.681 9.6s-.313-2.206-1.275-3.175C29.187 5.15 27.825 5.144 27.2 5.069c-4.475-.325-11.194-.325-11.194-.325h-.012s-6.719 0-11.194.325c-.625.075-1.987.081-3.206 1.356C.631 7.394.325 9.6.325 9.6s-.319 2.588-.319 5.181v2.425c0 2.587.319 5.181.319 5.181s.313 2.206 1.269 3.175c1.219 1.275 2.819 1.231 3.531 1.369 2.563.244 10.881.319 10.881.319s6.725-.012 11.2-.331c.625-.075 1.988-.081 3.206-1.356.962-.969 1.275-3.175 1.275-3.175s.319-2.587.319-5.181v-2.425c-.006-2.588-.325-5.181-.325-5.181zM12.694 20.15v-8.994l8.644 4.513-8.644 4.481z"
			/>
		</svg>
	</a>
	<a
		class="instagram svg-link"
		target="_blank"
		rel="noopener noreferrer"
		title="Instagram"
		href="https://www.instagram.com/kasper.space/"
	>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
			<path
				d="M16 2.881c4.275 0 4.781.019 6.462.094 1.563.069 2.406.331 2.969.55a4.952 4.952 0 011.837 1.194 5.015 5.015 0 011.2 1.838c.219.563.481 1.412.55 2.969.075 1.688.094 2.194.094 6.463s-.019 4.781-.094 6.463c-.069 1.563-.331 2.406-.55 2.969a4.94 4.94 0 01-1.194 1.837 5.02 5.02 0 01-1.837 1.2c-.563.219-1.413.481-2.969.55-1.688.075-2.194.094-6.463.094s-4.781-.019-6.463-.094c-1.563-.069-2.406-.331-2.969-.55a4.952 4.952 0 01-1.838-1.194 5.02 5.02 0 01-1.2-1.837c-.219-.563-.481-1.413-.55-2.969-.075-1.688-.094-2.194-.094-6.463s.019-4.781.094-6.463c.069-1.563.331-2.406.55-2.969a4.964 4.964 0 011.194-1.838 5.015 5.015 0 011.838-1.2c.563-.219 1.412-.481 2.969-.55 1.681-.075 2.188-.094 6.463-.094zM16 0c-4.344 0-4.887.019-6.594.094-1.7.075-2.869.35-3.881.744-1.056.412-1.95.956-2.837 1.85a7.833 7.833 0 00-1.85 2.831C.444 6.538.169 7.7.094 9.4.019 11.113 0 11.656 0 16s.019 4.887.094 6.594c.075 1.7.35 2.869.744 3.881.413 1.056.956 1.95 1.85 2.837a7.82 7.82 0 002.831 1.844c1.019.394 2.181.669 3.881.744 1.706.075 2.25.094 6.594.094s4.888-.019 6.594-.094c1.7-.075 2.869-.35 3.881-.744 1.05-.406 1.944-.956 2.831-1.844s1.438-1.781 1.844-2.831c.394-1.019.669-2.181.744-3.881.075-1.706.094-2.25.094-6.594s-.019-4.887-.094-6.594c-.075-1.7-.35-2.869-.744-3.881a7.506 7.506 0 00-1.831-2.844A7.82 7.82 0 0026.482.843C25.463.449 24.301.174 22.601.099c-1.712-.081-2.256-.1-6.6-.1z"
			/>
			<path
				d="M16 7.781c-4.537 0-8.219 3.681-8.219 8.219s3.681 8.219 8.219 8.219 8.219-3.681 8.219-8.219A8.221 8.221 0 0016 7.781zm0 13.55a5.331 5.331 0 110-10.663 5.331 5.331 0 010 10.663zM26.462 7.456a1.919 1.919 0 11-3.838 0 1.919 1.919 0 013.838 0z"
			/>
		</svg>
	</a>
	<a
		class="github svg-link"
		target="_blank"
		rel="noopener noreferrer"
		title="GitHub"
		href="https://github.com/probablykasper"
	>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
			<path
				d="M16 .395c-8.836 0-16 7.163-16 16 0 7.069 4.585 13.067 10.942 15.182.8.148 1.094-.347 1.094-.77 0-.381-.015-1.642-.022-2.979-4.452.968-5.391-1.888-5.391-1.888-.728-1.849-1.776-2.341-1.776-2.341-1.452-.993.11-.973.11-.973 1.606.113 2.452 1.649 2.452 1.649 1.427 2.446 3.743 1.739 4.656 1.33.143-1.034.558-1.74 1.016-2.14-3.554-.404-7.29-1.777-7.29-7.907 0-1.747.625-3.174 1.649-4.295-.166-.403-.714-2.03.155-4.234 0 0 1.344-.43 4.401 1.64a15.353 15.353 0 014.005-.539c1.359.006 2.729.184 4.008.539 3.054-2.07 4.395-1.64 4.395-1.64.871 2.204.323 3.831.157 4.234 1.026 1.12 1.647 2.548 1.647 4.295 0 6.145-3.743 7.498-7.306 7.895.574.497 1.085 1.47 1.085 2.963 0 2.141-.019 3.864-.019 4.391 0 .426.288.925 1.099.768C27.421 29.457 32 23.462 32 16.395c0-8.837-7.164-16-16-16z"
			/>
		</svg>
	</a>
	<a
		class="facebook svg-link"
		target="_blank"
		rel="noopener noreferrer"
		title="Facebook"
		href="https://www.facebook.com/kasper.space"
	>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
			<path d="M19 6h5V0h-5c-3.86 0-7 3.14-7 7v3H8v6h4v16h6V16h5l1-6h-6V7c0-.542.458-1 1-1z" />
		</svg>
	</a>
	<div class="svg-link">
		<Popup title="Email" text={PUBLIC_EMAIL}>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
				<path
					d="M18 2a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V4c0-1.1.9-2 2-2h16zm-4.37 9.1L20 16v-2l-5.12-3.9L20 6V4l-10 8L0 4v2l5.12 4.1L0 14v2l6.37-4.9L10 14l3.63-2.9z"
				/>
			</svg>
		</Popup>
	</div>
	<a
		class="soundcloud svg-link"
		target="_blank"
		rel="noopener noreferrer"
		title="SoundCloud"
		href="https://soundcloud.com/probablykasper"
	>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
			<path
				d="M27.874 16.069c-.565 0-1.105.11-1.596.308C25.95 12.803 22.831 10 19.028 10a7.61 7.61 0 00-2.635.474c-.311.116-.393.235-.393.466v12.585c0 .243.195.445.441.469l11.434.007c2.278 0 4.125-1.776 4.125-3.965s-1.848-3.966-4.126-3.966zM12.5 24h1l.5-7.007L13.5 10h-1l-.5 6.993zm-3 0h-1L8 18.914 8.5 14h1l.5 5zm-5 0h1l.5-4-.5-4h-1L4 20zm-4-2h1l.5-2-.5-2h-1L0 20z"
			/>
		</svg>
	</a>
</div>

<section class="video">
	<div class="header">
		<p class="title">Video</p>
		<p class="description">I make some pretty cool videos. I'd watch them.</p>
	</div>
	<div class="thumbnails">
		{#each data.video_section_videos.slice(0, 6) as video}
			<a
				href="https://youtube.com/watch?v={video.id}"
				class="item"
				target="_blank"
				rel="noopener noreferrer"
				title={video.title}
			>
				<img alt="" src="https://i.ytimg.com/vi/{video.id}/sddefault.jpg" />
			</a>
		{/each}
	</div>
	<a
		class="see-more"
		target="_blank"
		rel="noopener noreferrer"
		href="https://www.youtube.com/playlist?list=PL84-DNDSU8p5WP6jA7hvOCV9dIKBNjdCS"
	>
		<p>See more</p>
	</a>
</section>

<section class="shrive">
	<div class="header">
		<p class="title">Shrive</p>
		<p class="description">A YouTube channel where I curate all kinds of music I like.</p>
	</div>
	<div class="thumbnails">
		{#each data.shrive_section_videos.slice(0, 6) as video}
			<a
				href="https://youtube.com/watch?v={video.id}"
				class="item"
				target="_blank"
				rel="noopener noreferrer"
				title={video.title}
			>
				<img alt="" src="https://i.ytimg.com/vi/{video.id}/sddefault.jpg" />
			</a>
		{/each}
	</div>
	<a
		class="see-more"
		target="_blank"
		rel="noopener noreferrer"
		href="https://www.youtube.com/shrive"
	>
		<p>See more</p>
	</a>
</section>

<!-- <section class="lacuna soundcloud">
	<div class="header">
		<p class="title">Lacuna</p>
		<p class="description">I am a co-owner of this independent indie record label.</p>
	</div>
	<div class="thumbnails">
		<a class="item" target="_blank" rel="noopener noreferrer">
			<img alt="" />
		</a>
		<a class="item" target="_blank" rel="noopener noreferrer">
			<img alt="" />
		</a>
		<a class="item" target="_blank" rel="noopener noreferrer">
			<img alt="" />
		</a>
		<a class="item" target="_blank" rel="noopener noreferrer">
			<img alt="" />
		</a>
		<a class="item" target="_blank" rel="noopener noreferrer">
			<img alt="" />
		</a>
		<a class="item" target="_blank" rel="noopener noreferrer">
			<img alt="" />
		</a>
	</div>
	<a
		class="see-more"
		target="_blank"
		rel="noopener noreferrer"
		href="https://soundcloud.com/lacunarecs"
	>
		<p>See more</p>
	</a>
</section> -->

<section class="github">
	<div class="header">
		<p class="title">Development</p>
		<p class="description">
			I do some programming for fun. These are some of my favorite projects.
		</p>
	</div>
	<div class="cards">
		{#each data.repos as repo}
			<div class="item">
				<p class="title">{repo.name}</p>
				<p class="description">{repo.description}</p>
				<div class="urls">
					{#if repo.homepageUrl}
						<a
							href={repo.homepageUrl}
							class="repo-website svg-link"
							title="Website"
							target="_blank"
							rel="noopener noreferrer"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
								<path d="M0 0h24v24H0z" fill="none" />
								<path
									d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"
								/>
							</svg>
						</a>
					{/if}
					<a
						href={repo.url}
						class="repo-url svg-link"
						title="Repository"
						target="_blank"
						rel="noopener noreferrer"
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
							<path
								d="M16 .395c-8.836 0-16 7.163-16 16 0 7.069 4.585 13.067 10.942 15.182.8.148 1.094-.347 1.094-.77 0-.381-.015-1.642-.022-2.979-4.452.968-5.391-1.888-5.391-1.888-.728-1.849-1.776-2.341-1.776-2.341-1.452-.993.11-.973.11-.973 1.606.113 2.452 1.649 2.452 1.649 1.427 2.446 3.743 1.739 4.656 1.33.143-1.034.558-1.74 1.016-2.14-3.554-.404-7.29-1.777-7.29-7.907 0-1.747.625-3.174 1.649-4.295-.166-.403-.714-2.03.155-4.234 0 0 1.344-.43 4.401 1.64a15.353 15.353 0 014.005-.539c1.359.006 2.729.184 4.008.539 3.054-2.07 4.395-1.64 4.395-1.64.871 2.204.323 3.831.157 4.234 1.026 1.12 1.647 2.548 1.647 4.295 0 6.145-3.743 7.498-7.306 7.895.574.497 1.085 1.47 1.085 2.963 0 2.141-.019 3.864-.019 4.391 0 .426.288.925 1.099.768C27.421 29.457 32 23.462 32 16.395c0-8.837-7.164-16-16-16z"
							/>
						</svg>
					</a>
				</div>
			</div>
		{/each}
	</div>
	<a
		class="see-more"
		target="_blank"
		rel="noopener noreferrer"
		href="https://github.com/probablykasper"
	>
		<p>See more</p>
	</a>
</section>

<Particles />

<style lang="sass">
	@keyframes fade-in
		from
			opacity: 0
		to
			opacity: 1
	
	// $dark: #1D212D
	$darkest: #14161D
	$selection-color: #ffffff
	$selection-bg-color: #6273D8
	$link-color: #006edc
	$button-color: #3f3f3f
	$description-color: #383838
	$tiny-description-color: #5a5a5a
	$card-edge-color: #ececec
	$title-color: #000000

	$button-text-color: #000000

	// transitions
	$transition-15:             .15s cubic-bezier(0.4, 0.0, 0.2, 1.0)

	$transition-10:             .10s cubic-bezier(0.4, 0.0, 0.2, 1.0)
	$transition-10-in:          .10s cubic-bezier(0.0, 0.0, 0.2, 1.0)
	$transition-10-out:         .10s cubic-bezier(0.4, 0.0, 1.0, 1.0)

	$transition-20:             .20s cubic-bezier(0.4, 0.0, 0.2, 1.0)
	$transition-20-in:          .20s cubic-bezier(0.0, 0.0, 0.2, 1.0)
	$transition-20-out:         .20s cubic-bezier(0.4, 0.0, 1.0, 1.0)

	$transition-30:             .30s cubic-bezier(0.4, 0.0, 0.2, 1.0)
	$transition-30-in:          .30s cubic-bezier(0.0, 0.0, 0.2, 1.0)
	$transition-30-out:         .30s cubic-bezier(0.4, 0.0, 1.0, 1.0)

	$transition-40:             .40s cubic-bezier(0.4, 0.0, 0.2, 1.0)
	$transition-40-in:          .40s cubic-bezier(0.0, 0.0, 0.2, 1.0)
	$transition-40-out:         .40s cubic-bezier(0.4, 0.0, 1.0, 1.0)

	$transition-100:             1s cubic-bezier(0.4, 0.0, 0.2, 1.0)

	:global(html)
		:global(::selection)
			color: $selection-color
			background-color: $selection-bg-color
		:global(body)
			font-family: "Rubik", sans-serif
			background-color: #ffffff
			display: flex
			flex-direction: column
			width: 100%
			margin: 0px
			align-items: center
	@media (max-width: 600px)
		div.social-media
			grid-template-columns: repeat(4, 1fr)
		section
			div.thumbnails .item, div.cards .item
				width: 300px
			.thumbnails, .cards
				> .item:nth-child(1n+4)
					display: none
		section.video, section.shrive
			div.thumbnails .item
				height: calc(300px/16*9 - 4px)
		section.lacuna
			div.thumbnails .item
				height: 270px
		section.github div.cards
			.item
				padding: 10px

	section
		max-width: 1000px
	.svg-link
		display: block
		svg
			height: 22px
			width: 22px
			padding: 12px
			fill: $button-color
			opacity: 0.8
			&:hover
				opacity: 1
			*
				pointer-events: none
	.social-media
		display: grid
		justify-items: center
		grid-gap: 20px
		grid-template-columns: repeat(8, 1fr)
		margin: 10px auto
		margin-bottom: 40px
		width: 1000px
		max-width: 100%
		justify-content: space-around
	.logo
		margin: 50px
		width: 150px
		height: 150px
	section
		width: 100%
		margin-bottom: 50px
		transition: $transition-40 all
		animation: $transition-40 fade-in forwards
		.header
			width: 100%
			p
				margin: auto
				text-align: center
			p.title
				color: $title-color
				font-size: 26px
				margin-bottom: 4px
			p.description
				color: $description-color
		.thumbnails, .cards
			width: 100%
			display: flex
			flex-wrap: wrap
			justify-content: space-evenly
			.item
				border-radius: 10px
				width: 200px
				margin: 40px
				padding: 0px
				overflow: hidden
				transition: $transition-30 transform
				&:hover
					transform: scale(1.1)
					img
						transform: scale(1.3)
				img
					transition: $transition-100 all
					width: 100%
					display: block
		.see-more
			margin: auto
			display: table
			padding: 9px 13px
			text-decoration: none
			position: relative
			border-radius: 6px
			transition: $transition-30 transform, $transition-30 background-color
			background-color: rgba(#000000, 0.03)
			&::before // for increasing the hover area
				content: ''
				position: absolute
				top: 0px
				left: 0px
				width: 100%
				height: 100%
				border-radius: 6px
				transition: $transition-30 transform, $transition-30 background-color
			&::after
				background-color: rgba(#000000, 0.03)
				content: ''
				position: absolute
				top: 0px
				left: 0px
				width: 100%
				height: 100%
				border-radius: 6px
				transition: $transition-30 transform, $transition-30 background-color
				pointer-events: none
			&:hover
				background-color: rgba(#000000, 0.06)
				transform: scale(0.8)
				&::before
					transform: scale(1.4)
				&::after
					background-color: rgba(#000000, 0.06)
					transform: scale(1.4) rotateZ(180deg)
			p
				margin: auto
				color: $button-text-color
		&.video, &.shrive
			.item
				display: flex
				align-items: center
				height: calc(200px/16*9)
				img
					transform: scale(1.02)
		// &.soundcloud
		// 	.item
		// 		width: 180px
		// 		margin: 40px 50px
		// 		height: auto
		&.github
			.cards
				margin-top: 10px
			.item
				display: flex
				flex-direction: column
				width: calc(200px + 20px)
				margin: calc(50px - 20px)
				border: 2px solid $card-edge-color
				box-sizing: border-box
				backface-visibility: hidden
				&:hover
					transform: none
				p.title
					margin: 18px
					margin-bottom: 10px
					font-size: 18px
					color: $title-color
				p.description
					margin: 0px 18px
					font-size: 14px
					color: $tiny-description-color
				.urls
					display: flex
					justify-content: flex-end
					margin-top: auto
</style>
