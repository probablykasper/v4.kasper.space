import { XMLParser } from 'fast-xml-parser'
import { PERSONAL_GITHUB_TOKEN } from '$env/static/private'
import { graphql as github_graphql } from '@octokit/graphql'

export const prerender = true

async function video_section() {
	const response = await fetch(
		'https://www.youtube.com/feeds/videos.xml?channel_id=UCy6jcAF6fZGttRvihyQixbA',
	)
	const text = await response.text()
	const parser = new XMLParser()
	const xml: {
		feed: {
			entry: {
				title: string
				'yt:videoId': string
			}[]
		}
	} = parser.parse(text)
	return xml.feed.entry.map((entry) => ({
		title: entry.title,
		id: entry['yt:videoId'],
	}))
}

async function shrive_section() {
	const response = await fetch(
		'https://www.youtube.com/feeds/videos.xml?channel_id=UCoMimPRPeR28TM3_0cinjVQ',
	)
	const text = await response.text()
	const parser = new XMLParser()
	const xml: {
		feed: {
			entry: {
				title: string
				'yt:videoId': string
			}[]
		}
	} = parser.parse(text)
	return xml.feed.entry.map((entry) => ({
		title: entry.title,
		id: entry['yt:videoId'],
	}))
}

// old code for getting SoundCloud tracks - SoundCloud API token is not valid
// (function Lacuna () {
//   // For example if you specify 10 maxResults, SoundCloud will only respond
//   // with 4 if 6 of them are private
//   var maxResults = 50

//   // Lacuna
//   var clientID = '6ibYZTmF5qnpvp88S9V3werVrC18WCdC'
//   var url = 'https://api.soundcloud.com/users/247370320/tracks' +
//   '?limit=' + maxResults +
//   '&client_id=' + clientID
//   xhr(null, url, { type: 'GET' }).then((tracks) => {
//     console.log('==--==--==--> SoundCloud Lacuna')
//     console.log(tracks)
//     for (var i = 0; i < 6; i++) {
//       var url = tracks[i].permalink_url
//       var img = tracks[i].artwork_url.replace('large', 't500x500')
//       var item = document.querySelector('section.lacuna .thumbnails .item:nth-child(' + (i + 1) + ')')
//       item.setAttribute('href', url)
//       item.querySelector('img').setAttribute('src', img)
//       item.title = tracks[i].title // hover title
//     }
//     document.querySelector('section.lacuna').classList.remove('hidden')
//   }, (err) => {
//     document.querySelector('section.lacuna').classList.add('removed')
//     console.log('Could not fetch SoundCloud tracks')
//     throw Error(err)
//   })
// })();

async function development_section() {
	type Response = {
		user: {
			pinnedItems: {
				nodes: {
					description: string | null
					homepageUrl: string | null
					url: string
					name: string
				}[]
			}
		}
	}
	const response = await github_graphql<Response>(
		`
			{
				user(login: "probablykasper") {
					pinnedItems(first:6, types:REPOSITORY) {
						nodes {
							... on Repository {
								description
								homepageUrl
								url
								name
							}
						}
					}
				}
			}
		`,
		{
			headers: {
				Authorization: 'bearer ' + PERSONAL_GITHUB_TOKEN,
			},
		},
	)
	return response.user.pinnedItems.nodes
}

export async function load() {
	return {
		video_section_videos: video_section(),
		shrive_section_videos: shrive_section(),
		repos: development_section(),
	}
}
