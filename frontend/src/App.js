// @format

import React, { useMemo, useEffect, useState } from 'react'
import { Switch, Route } from 'react-router-dom'
import { createUseStyles } from 'react-jss'

import axios from 'axios'

import VideoList from './VideoList'

import noThumbnail from './assets/nothumbnail.gif'

const api = process.env.NODE_ENV === 'production' ? process.env.PUBLIC_URL : 'http://localhost:8080'

const removeExtension = (filename) => filename.replace(/\.[a-zA-Z0-9]+$/, '')

const toSlug = (filename) =>
	filename.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-')

const fakeVideos = [
	{ time: new Date('January 2nd, 2920').toString(), file: 'A Fake Video.mp4' },
	{
		time: new Date('April, 12th, 500').toString(),
		file: 'Another Fake Video.webm',
	},
	{ time: new Date('March 3rd, 1920').toString(), file: 'Unreal Video.mp4' },
]

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

	list: {
		display: 'flex',

		flex: 1,
		maxWidth: 400,
		margin: 16,
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

	useEffect(() => {
		axios.get(`${api}/videos`).then((rsp) => {
			console.dir(rsp)
		})
	}, [])

	const videos = useMemo(
		() =>
			fakeVideos.map((v) => ({
				...v,
				slug: toSlug(removeExtension(v.file)),
				title: removeExtension(v.file),
			})),
		[],
	)

	return (
		<div className={classes.main}>
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

			<div className={classes.video}>
				<Switch>
					<Route
						path="/:videoID"
						children={({ match }) =>
							videos.find(({ slug }) => match?.params?.videoID === slug) !=
							null ? (
								<video controls />
							) : (
								<h2>Unknown Video: {match?.params?.videoID}</h2>
							)
						}
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
