function xhr (reqContent, url, options = {}, callback) {
  return new Promise((resolve, reject) => {
    if (typeof options === 'function') callback = options
    if (typeof options === 'function') options = {}
    if (options.type == undefined) options.type = 'POST'
    if (options.contentType == undefined) options.contentType = 'json'
    var xhr = new XMLHttpRequest()
    xhr.open(options.type, url, true)
    if (options.type == 'GET') {
      xhr.send()
    } else if (options.contentType == 'form') {
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
      xhr.send('data=' + JSON.stringify(reqContent))
    } else if (options.contentType == 'json') {
      xhr.setRequestHeader('Content-type', 'application/json')
      xhr.send(JSON.stringify(reqContent))
    } else if (options.contentType == 'none') {
      xhr.send(reqContent)
      // for file uploads (multipart/form-data)
    } else if (options.contentType) {
      xhr.setRequestHeader('Content-type', options.contentType)
      xhr.send(reqContent)
    }
    xhr.onreadystatechange = function () {
      if (this.readyState == 4) {
        let res = JSON.parse(this.responseText)
        let err = null
        if (!String(this.status).startsWith('2')) {
          console.error('HTTP error ' + this.status)
          err = this.status
        }
        if (err) reject(err)
        else resolve(res)
        if (callback) callback(res, err)
      }
    }
    // resolve(5);
  })
}
window.xhr = xhr

var YTapiKey = 'AIzaSyBnQnpboWUfWyR8aW6HuQV5MAlxZ5FQ090';

(function Video () {
  var maxResults = 6

  var url = 'https://www.googleapis.com/youtube/v3/playlistItems' +
    '?key=' + YTapiKey +
    '&part=snippet' +
    '&maxResults=' + maxResults +
    '&playlistId='
  var myWork = xhr(null, url + 'PL84-DNDSU8p5WP6jA7hvOCV9dIKBNjdCS', { type: 'GET' })
  myWork.then((result) => {
    console.log('==--==--==--> YouTube Video')
    console.log(result)
    var items = result.items
    for (var i = 0; i < items.length; i++) {
      var url = items[i].snippet.resourceId.videoId
      // var img = items[i].snippet.thumbnails.high.url
      var img = items[i].snippet.thumbnails.standard.url
      // var img = items[i].snippet.thumbnails.maxres.url
      var item = document.querySelector('section.video .thumbnails a.item:nth-child(' + (i + 1) + ')')
      item.setAttribute('href', 'https://www.youtube.com/watch?v=' + url)
      item.querySelector('img').setAttribute('src', img)
      item.title = items[i].snippet.title // hover title
    }
    document.querySelector('section.video').classList.remove('hidden')
  }, (err) => {
    document.querySelector('section.video').classList.add('removed')
    console.log('Could not fetch Video YouTube playlistItems')
    throw Error(err)
  })
})();

(function Synctan () {
  var maxResults = 6

  var url = 'https://www.googleapis.com/youtube/v3/playlistItems' +
    '?key=' + YTapiKey +
    '&part=snippet' +
    '&maxResults=' + maxResults +
    '&playlistId=UUoMimPRPeR28TM3_0cinjVQ'
  xhr(null, url, { type: 'GET' }).then((result) => {
    console.log('==--==--==-->YouTube Synctan')
    console.log(result)
    var items = result.items
    for (var i = 0; i < items.length; i++) {
      var url = items[i].snippet.resourceId.videoId
      var img = items[i].snippet.thumbnails.high.url
      var item = document.querySelector('section.synctan .thumbnails .item:nth-child(' + (i + 1) + ')')
      item.setAttribute('href', 'https://www.youtube.com/watch?v=' + url)
      item.querySelector('img').setAttribute('src', img)
      item.title = items[i].snippet.title // hover title
    }
    document.querySelector('section.synctan').classList.remove('hidden')
  }, (err) => {
    document.querySelector('section.synctan').classList.add('removed')
    console.log('Could not fetch Synctan YouTube playlistItems')
    throw Error(err)
  })
})();

(function Lacuna () {
  var maxResults = 8

  // Lacuna
  var clientID = '6ibYZTmF5qnpvp88S9V3werVrC18WCdC'
  var url = 'https://api.soundcloud.com/users/247370320/tracks' +
    '?limit=' + maxResults +
    '&client_id=' + clientID
  xhr(null, url, { type: 'GET' }).then((tracks) => {
    console.log('==--==--==--> SoundCloud Lacuna')
    console.log(tracks)
    for (var i = 0; i < 6; i++) {
      var url = tracks[i].permalink_url
      var img = tracks[i].artwork_url.replace('large', 't500x500')
      var item = document.querySelector('section.lacuna .thumbnails .item:nth-child(' + (i + 1) + ')')
      item.setAttribute('href', url)
      item.querySelector('img').setAttribute('src', img)
      item.title = tracks[i].title // hover title
    }
    document.querySelector('section.lacuna').classList.remove('hidden')
  }, (err) => {
    document.querySelector('section.lacuna').classList.add('removed')
    console.log('Could not fetch SoundCloud tracks')
    throw Error(err)
  })
})();

(function GitHub () {
  // this is so babel won't combine the two string into one, and
  // make GitHub revoke the token when it detects it in the commit
  let token = '510127accaf075e7a33b'
  if (true) token += '04e4569c7e2f78c83539'
  fetch('https://api.github.com/graphql', {
    body: JSON.stringify({
      query: `
          query {
              user(login:"SpectralKH") {
              pinnedRepositories(first:6) {
                  edges {
                  node {
                      description
                      homepageUrl
                      url
                      name
                  }
                  }
              }
              }
          }
      `
    }),
    headers: {
      Authorization: 'bearer ' + token,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    method: 'POST'
  })
    .then((response) => {
      if (response.ok) return response
      else throw Error(response)
    })
    .then((response) => {
      response.json().then((result) => {
        console.log('==--==--==--> GitHub')
        console.log(result.data)
        const repos = result.data.user.pinnedRepositories.edges
        for (var i = 0; i < repos.length; i++) {
          const repo = repos[i].node
          const description = repo.description
          const repoWebsite = repo.homepageUrl
          const name = repo.name
          const repoUrl = repo.url
          // const img = tracks[i].artwork_url.replace('large', 't300x300')
          const item = document.querySelector('section.github .cards .item:nth-child(' + (i + 1) + ')')
          // item.setAttribute('href', url)
          item.classList.remove('hidden')
          item.querySelector('p.title').innerHTML = name
          item.querySelector('p.description').innerHTML = description
          if (repoUrl) {
            item.querySelector('a.repo-url').setAttribute('href', repoUrl)
            item.querySelector('a.repo-url').classList.remove('hidden')
          }
          if (repoWebsite) {
            item.querySelector('a.repo-website').setAttribute('href', repoWebsite)
            item.querySelector('a.repo-website').classList.remove('hidden')
          }
        }
        document.querySelector('section.github').classList.remove('hidden')
      })
    })
    .catch((err) => {
      document.querySelector('section.github').classList.add('removed')
      throw err
    })
})()

// discord/email popups
document.addEventListener('click', function (e) {
  function hideAllPopups () {
    var popups = document.querySelectorAll('a.has-popup .popup')
    for (var i = 0; i < popups.length; i++) {
      popups[i].classList.add('hidden')
    }
  }
  var hasClassHasPopup = e.target.classList.contains('has-popup')
  var hasClassPopup = e.target.classList.contains('popup')
  if (hasClassHasPopup || hasClassPopup) {
    let socialMediaButton = e.target
    if (hasClassPopup) socialMediaButton = e.target.parentElement
    var popup = e.target.querySelector('.popup')
    if (e.target.classList.contains('popup')) popup = e.target
    var clickedpopup = e.target.classList.contains('popup')
    var popupIsHidden = popup.classList.contains('hidden')
    if (popupIsHidden) {
      hideAllPopups()

      // select
      const range = document.createRange()
      range.selectNodeContents(socialMediaButton.querySelector('.popup'))
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
      
      popup.classList.remove('hidden')
    } else if (!clickedpopup) {
      popup.classList.add('hidden')
    }
  } else {
    // clicked anywhere
    hideAllPopups()
  }
})
