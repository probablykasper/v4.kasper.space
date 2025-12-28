import { XMLParser } from 'fast-xml-parser'
import { PERSONAL_GITHUB_TOKEN } from '$env/static/private'
import { graphql as github_graphql } from '@octokit/graphql'
import { dev } from '$app/environment'

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
	if (!response.ok) {
		console.error('500 response xml', JSON.stringify(xml, null, 2))
		throw new Error()
	}
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
	if (!response.ok) {
		console.error('500 response xml', JSON.stringify(xml, null, 2))
		throw new Error()
	}
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
	if (dev) {
		return {
			video_section_videos: video_section(),
			shrive_section_videos: shrive_section(),
			repos: development_section(),
		}
	} else {
		// statically copied in here because of unreliable YouTube XML API
		return {
			video_section_videos: [
				{ title: 'Throw It Canvas', id: '0R8qmVdMobc' },
				{ title: 'Duke Gray & Valcode - Ruthless (feat. Anthony Blake)', id: 'IOHu7VU_SZE' },
				{ title: 'Crushed Candy - Flashing Lights', id: 'HknsYiYt3Uc' },
				{ title: 'Duke Gray & MANGASLAYERS - Confession', id: '-DZ1I4N438o' },
				{ title: 'BraydenK & Akacia - Paint Me', id: '_GLZHROiTVA' },
				{ title: 'Lacuna Rewind 2023 by Axol', id: 'woFyp41D3Gg' },
				{ title: 'Yonexx & Sad Bells - Undefeatable', id: 'KTGLkpg5Xh4' },
				{ title: 'SKUM - NGHTWLKR', id: 'ij1J0ICcGXM' },
				{ title: 'WCX - Reason', id: 'sW1K2iNRSuo' },
				{
					title: 'RYLLZ - Nemesis Pt. II (ft. Bella Renee) (Official Lyric Video)',
					id: 'Mm3seHH6OnM',
				},
				{ title: 'DNIE - Stardust', id: 'b7QN4LUoCyg' },
				{ title: 'borne - Let Go', id: 'fT7DF9Tixt8' },
				{ title: 'DNIE - Fossilized (feat. Stephen Geisler)', id: 'N51laidfYN0' },
				{ title: 'Yonexx, KEVIN LNDN & CRÈME - War in Your Mind', id: '-HG_A-byuoE' },
				{
					title: 'Zack Merci & Mendum - Checkmate (feat. Tara Louise & Nieko) [Lyric Video]',
					id: 'EGFOSYF3b1A',
				},
			],
			shrive_section_videos: [
				{ title: '♫ RYLLZ - AMINA', id: 'FRQjEQSNOfw' },
				{ title: '♫ Midranger - Uprising (ft. Sam Welch) [Lyrics]', id: 'CsJ9OqPJr3Q' },
				{ title: '♫ DNIE - Paranoid (feat. Rose Ghould & Akacia) [Lyrics]', id: 'HqJfP2XH2-Y' },
				{ title: '♫ Salvatore Ganacci - Fight Dirty', id: '4er4aG-KAg0' },
				{ title: '♫ Kyolo & Krakn - Pagoda', id: 'Z8QtkBzrsak' },
				{ title: '♫ Linkin Park - Lying From You (Protostar Remix) [Lyrics]', id: '28ZpXI2lKUg' },
				{ title: '♫ CORPSE, Scarlxrd & Kordhell - MISA MISA!', id: 'fdjA5bd3ejw' },
				{ title: '♫ CORPSE - fuK u lol [Lyrics]', id: 'H37EE5YJGp8' },
				{ title: '♫ Pokelawls - HABIBIA (Deathbrain Remix)', id: 'vBTMhoaj6OA' },
				{ title: '♫ Imagine Dragons & JID - Enemy [Arcane] [Lyrics]', id: 'KLxdG0Mzpw0' },
				{
					title: '♫ CORPSE & Night Lovell - HOT DEMON B!TCHES NEAR U ! ! ! [Lyrics]',
					id: 'rHChXAtkFUk',
				},
				{ title: '♫ Bensley - Vex', id: '1lAZEyoz-R8' },
				{ title: '♫ Apashe ft. Instasamka - Uebok (Gotta Run) [Lyrics]', id: 'dVeHoSda-gg' },
				{ title: '♫ Kuoga. - Crazy (feat. Harley Bird) [Lyrics]', id: 'R9wOZW3KnXw' },
				{ title: '♫ Omri - idk wts [Lyrics]', id: 'aHmKUAsXQEc' },
			],
			repos: [
				{
					description: 'Text calculator with support for units and conversion',
					homepageUrl: 'https://cpc.kasper.space',
					url: 'https://github.com/probablykasper/cpc',
					name: 'cpc',
				},
				{
					description: 'Music library app for Mac, Linux and Windows',
					homepageUrl: 'https://ferrum.kasper.space',
					url: 'https://github.com/probablykasper/ferrum',
					name: 'ferrum',
				},
				{
					description: "App for staying ontop of YouTube channels' uploads",
					homepageUrl: 'https://kadium.kasper.space',
					url: 'https://github.com/probablykasper/kadium',
					name: 'kadium',
				},
				{
					description:
						'Build smaller, faster, and more secure desktop and mobile applications with a web frontend.',
					homepageUrl: 'https://tauri.app',
					url: 'https://github.com/tauri-apps/tauri',
					name: 'tauri',
				},
				{
					description: 'Date and time picker for Svelte',
					homepageUrl: 'https://date-picker-svelte.kasper.space',
					url: 'https://github.com/probablykasper/date-picker-svelte',
					name: 'date-picker-svelte',
				},
				{
					description: 'Music file tagging app for Mac, Linux and Windows',
					homepageUrl: '',
					url: 'https://github.com/probablykasper/mr-tagger',
					name: 'mr-tagger',
				},
			],
		}
	}
}
