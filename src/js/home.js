// YouTube API
function start () {
  gapi.client.init({
    'apiKey': 'AIzaSyBnQnpboWUfWyR8aW6HuQV5MAlxZ5FQ090',
    'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
  }).then(function () {
    // SYNCTAN
    // API request details
    var requestSynctan = gapi.client.youtube.playlistItems.list({
      part: 'snippet',
      playlistId: 'UUoMimPRPeR28TM3_0cinjVQ',
      maxResults: 8
    })
    // Perform API request, process response
    requestSynctan.execute(function (response) {
      var nthChild; var arrayLength = response.result.items.length
      for (var i = 0; i < arrayLength; i++) {
        nthChild = i + 1
        $('section.synctan .item:nth-child(' + nthChild + ')')
          .attr('href', 'https://www.youtube.com/watch?v=' + response.result.items[i].snippet.resourceId.videoId)
        $('section.synctan .item:nth-child(' + nthChild + ') div.img')
          .attr('style', 'background-image: url("' + response.result.items[i].snippet.thumbnails.high.url + '")')
          .siblings('.title').html(response.result.items[i].snippet.title)
      }
    })

    // TRAP UNITED
    // API request details
    var requestTrapUnited = gapi.client.youtube.search.list({
      part: 'snippet',
      channelId: 'UC0kHs8aHGQEtQODjt9XHjfQ',
      type: 'video',
      publishedBefore: '2017-05-14T00:00:00Z',
      order: 'date',
      maxResults: 8
    })
    // Perform API request, process response
    requestTrapUnited.execute(function (response) {
      var nthChild; var arrayLength = response.result.items.length
      for (var i = 0; i < arrayLength; i++) {
        nthChild = i + 1
        $('section.trap-united .item:nth-child(' + nthChild + ')')
          .attr('href', 'https://www.youtube.com/watch?v=' + response.result.items[i].id.videoId)
        $('section.trap-united .item:nth-child(' + nthChild + ') div.img')
          .attr('style', 'background-image: url("' + response.result.items[i].snippet.thumbnails.high.url + '")')
          .siblings('.title').html(response.result.items[i].snippet.title)
      }
    })

    // VIDEO (personal)
    // API request details
    var requestVideo = gapi.client.youtube.playlistItems.list({
      part: 'snippet',
      playlistId: 'UUy6jcAF6fZGttRvihyQixbA',
      maxResults: 8
    })
    var requestCommissions = gapi.client.youtube.playlistItems.list({
      part: 'snippet',
      playlistId: 'PL84-DNDSU8p5WP6jA7hvOCV9dIKBNjdCS',
      maxResults: 8
    })
    // Perform API request, process response
    var videoResponse, commissionResponse
    requestVideo.execute(function (response) {
      videoResponse = response
      processResponses()
    })
    requestCommissions.execute(function (response) {
      commissionResponse = response
      processResponses()
    })
    function processResponses () {
      if (videoResponse && commissionResponse) {
        // combine video and commission responses
        var resultItems = videoResponse.result.items.concat(commissionResponse.result.items)
        resultItems.sort(function (a, b) {
          var dateA = new Date(a.snippet.publishedAt)
          var dateB = new Date(b.snippet.publishedAt)
          return dateB - dateA // sort by date ascending
        })
        resultItems = resultItems.splice(0, 8)
        // insert into page
        var nthChild
        for (var i = 0; i < resultItems.length; i++) {
          nthChild = i + 1
          $('section.video .item:nth-child(' + nthChild + ') div.img')
            .attr('style', 'background-image: url("' + resultItems[i].snippet.thumbnails.high.url + '")')
            .siblings('.title').html(resultItems[i].snippet.title)
            .parent().attr('href', 'https://www.youtube.com/watch?v=' + resultItems[i].snippet.resourceId.videoId)
        }
      }
    }
  })
}
gapi.load('client', start)

// SoundCloud API
SC.initialize({
  client_id: '6ibYZTmF5qnpvp88S9V3werVrC18WCdC' // change
})
SC.get('/users/247370320/tracks', { limit: 8 }).then(function (tracks) {
  for (var i = 0; i < tracks.length; i++) {
    var nthChild = i + 1
    // coverSrc = JSON.stringify(tracks[i].artwork_url.replace("large", "t300x300"));
    $('section.lacuna .item:nth-child(' + nthChild + ') div.img')
      .attr('style', 'background-image: url("' + tracks[i].artwork_url.replace('large', 't300x300') + '")')
      .parent().attr('href', tracks[i].permalink_url)
  }
})

// Responsive YT thumbnails/SC covers
function resizeStuff () {
  var newHeight = $('section.adjust-height .item').width() / 16 * 9
  $('section.adjust-height .item').css('height', newHeight + 'px')

  var newHeight = $('section:not(.adjust-height) .item').width()
  $('section:not(.adjust-height) .item').css('height', newHeight + 'px')
}
resizeStuff()
$(window).resize(resizeStuff)

// Image hover overlap/z-index fix
var high = 3
$('.item').hover(function () {
  $(this).css({ 'z-index': high })
  high++
})

// Chevron scroller
var spacerHeight
$('.chevron').on('click', function () {
  spacerHeight = $('.spacer').height()
  console.log(spacerHeight)
  window.scroll({ top: spacerHeight, left: 0, behavior: 'smooth' })
})

// Discord link popup
$('body').on('click', function (e) {
  // Stop if input field was clicked
  if (!$(e.target).hasClass('popup-input')) {
    // If icon was clicked
    if ($(e.target).hasClass('discord')) {
      // Select text if hidden
      if ($(e.target).children('.popup').hasClass('hidden')) {
        $(e.target).children('.popup').children('input').select()
      }
      // Toggle visibility
      $(e.target).children('.popup').toggleClass('hidden')
    }
    // If hidden and icon was not clicked
    if (!$('.discord .popup').hasClass('hidden') && !$(e.target).hasClass('discord')) {
      // Hide
      $('.discord .popup').addClass('hidden')
    }
  }
})
// Email link popup
$('body').on('click', function (e) {
  // Stop if input field was clicked
  if (!$(e.target).hasClass('popup-input')) {
    // If icon was clicked
    if ($(e.target).hasClass('email')) {
      // Select text if hidden
      if ($(e.target).children('.popup').hasClass('hidden')) {
        $(e.target).children('.popup').children('input').select()
      }
      // Toggle visibility
      $(e.target).children('.popup').toggleClass('hidden')
    }
    // If hidden and icon was not clicked
    if (!$('.email .popup').hasClass('hidden') && !$(e.target).hasClass('email')) {
      // Hide
      $('.email .popup').addClass('hidden')
    }
  }
})

// Social media links anchor
function smlAnchor () {
  var sml = $('.personal-links') // social media links
  var sasml = $('.spacer').height() - sml.height() // space above social media links
  if (sasml < window.pageYOffset) sml.css('position', 'fixed').css('top', '0px')
  else sml.css('position', '').css('top', '')
}
$(window).scroll(smlAnchor)
$(window).resize(smlAnchor)
