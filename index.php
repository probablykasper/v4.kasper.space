<?
function generateItems() {
	for ($i = 0; $i < 8; $i++) { ?>
		<a target="_blank" class="item">
			<div class="overlay"></div>
			<p class="title"></p>
			<div class="img"></div>
		</a>
		<? };
}
?>
<!DOCTYPE html>
<head>
	<title>KH</title>
	<link href="/cdn/favicon.ico" rel="icon" type="image/x-icon" />
	<link rel="stylesheet" type="text/css" href="/css/global.css?r=<?=rand(0,999)?>">
</head>
<body>
	<div class="top">
		<header class="page">
			<img src="/cdn/logos/kh-transparent.png">
			<p class="one">Hi.</p>
		</header>
		<p class="two">I make things.</p>
		<section class="projects flex-row">
			<div class="chevron"></div>
			<p class="three">Let me</span> show you.</p>
		</section>
	</div>
	<div class="bottom">
		<div class="spacer">
			<div class="personal-links flex-row">
				<a target="_blank" class="twitter" title="Twitter"			href="https://twitter.com/SpectralKH"></a>
				<a class="discord" title="Discord">
					<div class="popup hidden">
						<input readonly class="popup-input" value="KH | Synctan &amp; Lacuna#6425"></input>
					</div>
				</a>
				<a target="_blank" class="facebook" title="Facebook"		href="https://www.facebook.com/SpectralKH"></a>
				<a target="_blank" class="youtube" title="YouTube"			href="https://youtube.com/SpectralKH"></a>
				<a target="_blank" class="soundcloud" title="SoundCloud"	href="https://soundcloud.com/SpectralKH"></a>
				<a target="_blank" class="github" title="GitHub"			href="https://github.com/SpectralKH"></a>
				<a target="_blank" class="instagram" title="Instagram"		href="https://www.instagram.com/spckh/"></a>
				<!-- <a target="_blank" class="email" title="email"				href="mailto:kasperkh.kh@gmail.com"></a> -->
				<a class="email" title="Email">
					<div class="popup hidden">
						<input readonly class="popup-input" value="kasperkh.kh@gmail.com"></input>
					</div>
				</a>
			</div>
		</div>

		<section class="synctan adjust-height">
			<header class="flex-row">
				<a target="_blank" href="https://www.youtube.com/Synctan">
					<img src="/cdn/logos/project/synctan.png">
				</a>
				<div class="text r">
					<p class="title">
						<a target="_blank" href="https://www.youtube.com/Synctan">Synctan</a>
					</p>
					<p class="description">A YouTube channel where I curate all kinds of music I like.</p>
				</div>
			</header>
			<main class="adjust-height flex-row">
				<?= generateItems() ?>
			</main>
		</section>

		<section class="lacuna">
			<header class="flex-row">
				<div class="text l">
					<p class="title">
						<a target="_blank" href="https://soundcloud.com/LacunaRecords">Lacuna Records</a>
					</p>
					<p class="description">I am a co-owner of this independent indie record label.</p>
				</div>
				<a target="_blank" href="https://soundcloud.com/LacunaRecords">
					<img src="/cdn/logos/project/lacuna.png">
				</a>
			</header>
			<main class="flex-row">
				<?= generateItems() ?>
			</main>
		</section>

		<section class="trap-united adjust-height">
			<header class="flex-row">
				<a target="_blank" href="https://www.youtube.com/TrapUnited">
					<img src="/cdn/logos/project/trap-united.png">
				</a>
				<div class="text r">
					<p class="title">
						<a target="_blank" href="https://www.youtube.com/TrapUnited">Trap United</a>
					</p>
					<p class="description">Another music curation channel, this one with daily trap music uploads, and part of to the "United" channel network.</p>
				</div>
			</header>
			<main class="adjust-height flex-row">
				<?= generateItems() ?>
			</main>
		</section>

		<section class="dev">
			<header class="flex-row">
				<div class="text l">
					<p class="title">
						<a target="_blank" href="https://github.com/SpectralKH">Dev</a>
					</p>
					<p class="description">HTML5, Sass, JS, jQuery, PHP, MySQL. It's a start.</p>
				</div>
				<a target="_blank" href="https://github.com/SpectralKH">
					<img src="/cdn/logos/project/github.png">
				</a>
			</header>
			<main class="adjust-height flex-row">
				<div target="_blank" class="item">
					<div class="overlay"></div>
					<p class="title">Nelation</p>
					<p class="description">Website for the record label Nelation.</p>
					<div class="links">
						<a class="link" href=""></a>
						<a class="github-link" href=""></a>
					</div>
					<div class="img"></div>
				</div>
				<div target="_blank" class="item">
					<div class="overlay"></div>
					<p class="title">Personal Website</p>
					<p class="description">I think it's self explanatory</p>
					<div class="links">
						<a class="link" href="http://kh.henningsen.se/"></a>
						<a class="github-link" href=""></a>
					</div>
					<div class="img"></div>
				</div>
			</main>
		</section>

		<section class="video adjust-height">
			<header class="flex-row">
				<a target="_blank" href="https://www.youtube.com/user/SpectralKH">
					<img src="/cdn/logos/project/youtube.png">
				</a>
				<div class="text r">
					<p class="title">
						<a target="_blank" href="https://www.youtube.com/user/SpectralKH">Video</a>
					</p>
					<p class="description">I'm experienced with After Effects and Final Cut. My personal YouTube channel has audio visualizers, animations, sketches etc.</p>
				</div>
			</header>
			<main class="adjust-height flex-row">
				<?= generateItems() ?>
			</main>
		</section>

		<section class="minecraft">
			<header class="flex-row">
				<div class="text l">
					<p class="title">
						<a target="_blank" href="http://www.planetminecraft.com/member/SpectralKH/">Minecraft</a>
					</p>
					<p class="description">Minecraft was a big part of my life previously. I gathered lots of friends, and had fun with different projects.</p>
				</div>
				<a target="_blank" href="http://www.planetminecraft.com/member/SpectralKH/">
					<img src="/cdn/logos/project/minecraft.png">
				</a>
			</header>
			<main>
				Maybe I'll care to add something here eventually.<br>
				http://www.planetminecraft.com/member/spectralkh/<br>
				http://www.planetminecraft.com/mod/spectralguns/<br>
				http://www.planetminecraft.com/member/nectoxbt/<br>
			</main>
		</section>
		<p class="footnote">This piece of text is dedicated to Elon Musk</p>
	</div>
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
	<script src="https://apis.google.com/js/api.js"></script>
	<script src="https://connect.soundcloud.com/sdk/sdk-3.1.2.js"></script>
	<script src="/js/smoothscroll.js?r=<?=rand(0,999)?>"></script>
	<script src="/js/home.js?r=<?=rand(0,999)?>"></script>
</body>
