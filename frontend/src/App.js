// @format

import React, { useEffect, useState, useMemo } from 'react'
import { Switch, Route } from 'react-router-dom'
import { createUseStyles } from 'react-jss'

import axios from 'axios'

import VideoList from './VideoList'

import noThumbnail from './assets/nothumbnail.gif'

const removeExtension = (filename) => filename.replace(/\.[a-zA-Z0-9]+$/, '')

const toSlug = (filename) =>
	filename.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-')

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

	listSort: {
		display: 'flex',
		flexDirection: 'row',

		fontSize: 20,

		'& > *': {
			flex: 1,
			marginLeft: 8,
		},

		'& >*:first-child': {
			flex: 0,
			marginLeft: 0,
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

	const [rawVideos, setRawVideos] = useState([])
	const [sort, setSort] = useState('name')

	useEffect(() => {
		axios.get('/videos.json').then((rsp) => {
			setRawVideos(rsp.data)
		})
	}, [])

	const videos = useMemo(
		() =>
			rawVideos
				.map((video) => ({
					...video,
					time: new Date(video.time),
					slug: toSlug(removeExtension(video.file)),
					title: removeExtension(video.file),
					thumbnail: `/thumbnail/${video.file}`,
				}))
				.sort(sorts[sort] || sorts['name']),
		[rawVideos, sort],
	)

	return (
		<div className={classes.main}>
			<div className={classes.listWrapper}>
				<div className={classes.listSort}>
					<span>Sort:</span>
					<select onChange={(ev) => setSort(ev.target.value)}>
						<option value="name">Name</option>
						<option value="time">Time</option>
					</select>
				</div>

				<Route
					path="/:videoID"
					children={({ match }) => (
						<VideoList
							className={classes.list}
							active={match?.params?.videoID}
							videos={videos}
						/>
					)}
				/>
			</div>

			<div className={classes.video}>
				<Switch>
					<Route
						path="/:videoID"
						children={({ match }) => {
							const video = videos.find(
								({ slug }) => match?.params?.videoID === slug,
							)
							if (video == null) {
								return <h2>Unknown Video: {match?.params?.videoID}</h2>
							}

							return <video controls src={`/videos/${video.file}`} />
						}}
					/>
					<Route path="/">
						<img alt="No Video" src={noThumbnail} />
					</Route>
				</Switch>
			</div>
		</div>
	)
}

export default App
