// YouTube API
function start() {
	gapi.client.init({
		"apiKey": "AIzaSyCHepYt7z_57JRdDdoAddSIdJt5lTTO5dY",
		"discoveryDocs": ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"]
	}).then(function() {

		// SYNCTAN
		// API request details
		var requestSynctan = gapi.client.youtube.playlistItems.list({
			part: "snippet",
			playlistId: "UUoMimPRPeR28TM3_0cinjVQ",
			maxResults: 8
		});
		// Perform API request, process response
		requestSynctan.execute(function(response) {
			var nthChild, arrayLength = response.result.items.length;
			for (var i = 0; i < arrayLength; i++) {
				nthChild = i+1;
				$("section.synctan .item:nth-child("+nthChild+")")
					.attr("href", "https://www.youtube.com/watch?v="+response.result.items[i].snippet.resourceId.videoId);
				$("section.synctan .item:nth-child("+nthChild+") div.img")
					.attr("style", 'background-image: url("'+response.result.items[i].snippet.thumbnails.high.url+'")')
					.siblings(".title").html(response.result.items[i].snippet.title);
			}
		});

		// TRAP UNITED
		// API request details
		var requestTrapUnited = gapi.client.youtube.playlistItems.list({
			part: "snippet",
			playlistId: "UU0kHs8aHGQEtQODjt9XHjfQ",
			maxResults: 8
		});
		// Perform API request, process response
		requestTrapUnited.execute(function(response) {
			var nthChild, arrayLength = response.result.items.length;
			for (var i = 0; i < arrayLength; i++) {
				nthChild = i+1;
				$("section.trap-united .item:nth-child("+nthChild+")")
					.attr("href", "https://www.youtube.com/watch?v="+response.result.items[i].snippet.resourceId.videoId);
				$("section.trap-united .item:nth-child("+nthChild+") div.img")
					.attr("style", 'background-image: url("'+response.result.items[i].snippet.thumbnails.high.url+'")')
					.siblings(".title").html(response.result.items[i].snippet.title);
			}
		});

		// VIDEO (personal)
		// API request details
		var requestVideo = gapi.client.youtube.playlistItems.list({
			part: "snippet",
			playlistId: "UUy6jcAF6fZGttRvihyQixbA",
			maxResults: 8
		});
		// Perform API request, process response
		requestVideo.execute(function(response) {
			var nthChild, arrayLength = response.result.items.length;
			for (var i = 0; i < arrayLength; i++) {
				nthChild = i+1;
				$("section.video .item:nth-child("+nthChild+") div.img")
					.attr("style", 'background-image: url("'+response.result.items[i].snippet.thumbnails.high.url+'")')
					.siblings(".title").html(response.result.items[i].snippet.title)
					.parent().attr("href", "https://www.youtube.com/watch?v="+response.result.items[i].snippet.resourceId.videoId);
			}
		});

	});
}
gapi.load("client", start);

// SoundCloud API
SC.initialize({
	client_id: "6ibYZTmF5qnpvp88S9V3werVrC18WCdC" //change
});
SC.get("/users/247370320/tracks", {limit: 8}).then(function(tracks) {
	for (var i = 0; i < tracks.length; i++) {
		nthChild = i+1;
		// coverSrc = JSON.stringify(tracks[i].artwork_url.replace("large", "t300x300"));
		$("section.lacuna .item:nth-child("+nthChild+") div.img")
			.attr("style", 'background-image: url("'+tracks[i].artwork_url.replace("large", "t300x300")+'")')
			.parent().attr("href", tracks[i].permalink_url);
	}
});

// Responsive YT thumbnails/SC covers
function resizeStuff() {
	var newHeight = $("section.adjust-height .item").width() / 16 * 9;
	$("section.adjust-height .item").css("height", newHeight+"px");

	var newHeight = $("section:not(.adjust-height) .item").width();
	$("section:not(.adjust-height) .item").css("height", newHeight+"px");
}
resizeStuff();
$(window).resize(resizeStuff);

// Image hover z-index fix
var high = 3;
$(".item").hover(function() {
	$(this).css({"z-index": high});
	high++;
});

// Chevron scroller
var spacerHeight;
$(".chevron").on("click", function() {
	spacerHeight = $(".spacer").height();
	console.log(spacerHeight);
	window.scroll({ top: spacerHeight, left: 0, behavior: "smooth" });
});

// Discord link popup
$("body").on("click", function(e) {
	// Stop if input field was clicked
	if (!$(e.target).hasClass("popup-input")) {
		// If icon was clicked
		if ($(e.target).hasClass("discord")) {
			// Select text if hidden
			if ($(e.target).children(".popup").hasClass("hidden")) {
				$(e.target).children(".popup").children("input").select();
			}
			// Toggle visibility
			$(e.target).children(".popup").toggleClass("hidden");
		}
		// If hidden and icon was not clicked
		if (!$(".discord .popup").hasClass("hidden") && !$(e.target).hasClass("discord")) {
			// Hide
			$(".discord .popup").addClass("hidden");
		}
	}
});
// Email link popup
$("body").on("click", function(e) {
	// Stop if input field was clicked
	if (!$(e.target).hasClass("popup-input")) {
		// If icon was clicked
		if ($(e.target).hasClass("email")) {
			// Select text if hidden
			if ($(e.target).children(".popup").hasClass("hidden")) {
				$(e.target).children(".popup").children("input").select();
			}
			// Toggle visibility
			$(e.target).children(".popup").toggleClass("hidden");
		}
		// If hidden and icon was not clicked
		if (!$(".email .popup").hasClass("hidden") && !$(e.target).hasClass("email")) {
			// Hide
			$(".email .popup").addClass("hidden");
		}
	}
});
