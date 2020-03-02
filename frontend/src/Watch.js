// @format

import React from 'react'
import { useParams } from 'react-router-dom'

import VideoList from './VideoList'

const Watch = () => {
	const { videoID } = useParams()

	return (
		<div>
			<nav>
				<VideoList />
			</nav>

			<h2>Watching {videoID}</h2>
		</div>
	)
}

export default Watch
