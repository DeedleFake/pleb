// @format

import React, { useEffect, useState, useMemo } from 'react'
import {
	Switch,
	Route,
	Prompt,
	useRouteMatch,
	useHistory,
} from 'react-router-dom'
import { createUseStyles } from 'react-jss'

import axios from 'axios'
import FuzzySearch from 'fuzzy-search'

import VideoList from './VideoList.js'
import * as theme from './theme.js'

import placeholderVideo from './assets/placeholder.mp4'

const removeExtension = (filename) => filename.replace(/\.[a-zA-Z0-9]+$/, '')

const toSlug = (filename) =>
	filename
		.toLowerCase()
		.replace(/[^a-zA-Z0-9]+/g, '-')
		.replace(/^-/, '')
		.replace(/-$/, '')

const sorts = {
	name: (v1, v2) => v1.file.toLowerCase().localeCompare(v2.file.toLowerCase()),
	time: (v1, v2) => v2.time.getTime() - v1.time.getTime(),
}

const useStyles = createUseStyles({
	'@global': {
		body: {
			fontFamily: 'Arial',
			color: theme.color.text,
			backgroundColor: theme.color.background,
			margin: 0,
			padding: 0,
		},

		'a, a:visited, a:hover, a:active': {
			color: theme.color.text,
		},
	},

	main: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap-reverse',
		justifyContent: 'center',
		alignItems: 'start',
	},

	listWrapper: {
		display: 'flex',
		flexDirection: 'column',
		margin: 16,

		flex: '0 1 400px',
	},

	listAdjust: {
		display: 'flex',
		flexDirection: 'column',

		'& > div': {
			display: 'flex',
			flexDirection: 'row',

			fontSize: 20,
			marginTop: 8,

			'& > *': {
				flex: 1,
				marginLeft: 8,
			},

			'& > *:first-child': {
				flex: 0,
				marginLeft: 0,
			},
		},

		'& > div:first-child': {
			marginTop: 0,
		},
	},

	list: {
		display: 'flex',

		marginTop: 16,
	},

	video: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',

		flex: '1 1 400px',
		margin: 16,

		'& > img, & > video': {
			maxWidth: '100%',
			maxHeight: 720,
		},
	},

	subSelector: {
		display: 'flex',
		flexDirection: 'row',

		marginTop: 16,
	}
})

const App = () => {
	const classes = useStyles()

	const history = useHistory()
	const { params: { videoID, subID } = {} } =
		useRouteMatch('/:videoID/:subID?') || {}

	const [videoPlaying, setVideoPlaying] = useState(false)

	const [rawVideos, setRawVideos] = useState([])
	const [search, setSearch] = useState('')
	const [sort, setSort] = useState('name')
	const [sortAsc, setSortAsc] = useState(false)

	useEffect(() => {
		axios.get('/videos.json').then((rsp) => {
			setRawVideos(rsp.data)
		})
	}, [])

	const adjustedVideos = useMemo(
		() =>
			rawVideos
				.map((video) => ({
					...video,
					time: new Date(video.time),
					slug: toSlug(removeExtension(video.file)),
					title: video.sub == null ? removeExtension(video.file) : video.file,
					thumbnail: `/thumbnail/${video.file}`,

					sub: video?.sub?.map((s) => ({
						title: s,
						slug: toSlug(removeExtension(s)),
						file: `${video.file}/${s}`,
						thumbnail: `/thumbnail/${video.file}/${s}`,
					})),
				}))
				.sort(
					((f) => (sortAsc ? (v1, v2) => -f(v1, v2) : f))(
						sorts[sort] || sorts['name'],
					),
				),
		[rawVideos, sort, sortAsc],
	)

	const searcher = useMemo(
		() => new FuzzySearch(adjustedVideos, ['title'], { sort: true }),
		[adjustedVideos],
	)

	const videos = useMemo(
		() => (search === '' ? adjustedVideos : searcher.search(search)),
		[search, adjustedVideos, searcher],
	)

	const currentVideo = useMemo(
		() => videos.find(({ slug }) => videoID === slug),
		[videos, videoID],
	)

	const subIndex = useMemo(
		() => currentVideo?.sub?.findIndex(({ slug }) => subID === slug),
		[currentVideo, subID],
	)

	const videoInfo = useMemo(
		() => ({ ...currentVideo, ...currentVideo?.sub?.[subIndex] }),
		[currentVideo, subIndex],
	)

	useEffect(() => {
		if (currentVideo == null) {
			document.title = process.env.REACT_APP_TITLE
			return
		}

		document.title = `${currentVideo.title} :: ${process.env.REACT_APP_TITLE}`
	}, [currentVideo])

	useEffect(() => {
		const unlisten = history.listen((location, action) => {
			setVideoPlaying(false)
		})

		return unlisten
	}, [history])

	return (
		<>
			<Prompt
				when={videoPlaying}
				message="You appear to be in the middle of a video. Are you sure that you want to switch pages?"
			/>

			<div className={classes.main}>
				<div className={classes.listWrapper}>
					<div className={classes.listAdjust}>
						<div>
							<span>Search:</span>
							<input
								type="text"
								placeholder="Filter videos..."
								value={search}
								onChange={(ev) => setSearch(ev.target.value)}
							/>
						</div>
						<div>
							<span>Sort:</span>
							<select
								disabled={search !== ''}
								onChange={(ev) => setSort(ev.target.value)}
							>
								<option value="name">Name</option>
								<option value="time">Time</option>
							</select>
							<button
								disabled={search !== ''}
								onClick={(ev) => setSortAsc(!sortAsc)}
							>
								{sortAsc ? 'Ascending' : 'Descending'}
							</button>
						</div>
					</div>
					<VideoList
						className={classes.list}
						active={videoID}
						videos={videos}
						onSelect={(v) => {
							if (v.slug === videoID) {
								history.push('/')
								return
							}

							let sub = v.sub != null ? `/${v.sub?.[0]?.slug}` : ''
							history.push(`/${v.slug}${sub}`)
						}}
					/>
				</div>

				<div className={classes.video}>
					<Switch>
						<Route path="/:videoID/:subID?">
							{videoInfo != null ? (
								<video
									controls
									src={`/videos/${videoInfo.file}`}
									poster={videoInfo.thumbnail}
									onPlay={(ev) => {
										setVideoPlaying(true)
										window.onbeforeunload = () => true
									}}
									onEnded={(ev) => {
										setVideoPlaying(false)
										window.onbeforeunload = null
									}}
								/>
							) : (
								<h2>Unknown Video: {videoID}</h2>
							)}
						</Route>
						<Route path="/">
							<video autoPlay muted loop playsInline src={placeholderVideo} />
						</Route>
					</Switch>

					{currentVideo?.sub != null && (
						<div className={classes.subSelector}>
							<button
								disabled={subIndex === 0}
								onClick={(ev) =>
									history.push(
										`/${videoID}/${currentVideo.sub[subIndex - 1].slug}`,
									)
								}
							>
								&lt;
							</button>

							<select
								value={videoInfo.slug}
								onChange={(ev) =>
									history.push(`/${videoID}/${ev.target.value}`)
								}
							>
								{currentVideo.sub.map((s, i) => (
									<option key={s.slug} value={s.slug}>
										{s.title}
									</option>
								))}
							</select>

							<button
								disabled={subIndex === currentVideo.sub.length - 1}
								onClick={(ev) =>
									history.push(
										`/${videoID}/${currentVideo.sub[subIndex + 1].slug}`,
									)
								}
							>
								&gt;
							</button>
						</div>
					)}
				</div>
			</div>
		</>
	)
}

export default App
