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

import VideoList from './VideoList'

import noThumbnail from './assets/nothumbnail.gif'

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
			backgroundColor: 'lightgray',
			margin: 0,
			padding: 0,
		},
	},

	main: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap-reverse',
		alignItems: 'start',
	},

	listWrapper: {
		display: 'flex',
		flexDirection: 'column',
		margin: 16,
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

			'& >*:first-child': {
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

		flex: 1,
		maxWidth: 400,
		marginTop: 16,
	},

	video: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',

		flex: 1,
		minWidth: 400,
		margin: 16,

		'& > img': {
			maxHeight: 720,
		},
	},
})

const App = () => {
	const classes = useStyles()

	const history = useHistory()
	const { params: { videoID } = {} } = useRouteMatch('/:videoID') || {}

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
					title: removeExtension(video.file),
					thumbnail: `/thumbnail/${video.file}`,
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
							<button onClick={(ev) => setSortAsc(!sortAsc)}>
								{sortAsc ? 'Ascending' : 'Descending'}
							</button>
						</div>
					</div>
					<VideoList
						className={classes.list}
						active={videoID}
						videos={videos}
					/>
				</div>

				<div className={classes.video}>
					<Switch>
						<Route path="/:videoID">
							{currentVideo != null ? (
								<video
									controls
									src={`/videos/${currentVideo.file}`}
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
							<img alt="No Video" src={noThumbnail} />
						</Route>
					</Switch>
				</div>
			</div>
		</>
	)
}

export default App
