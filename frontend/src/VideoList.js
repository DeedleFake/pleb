// @format

import React from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'

import { Divider, Menu } from 'semantic-ui-react'

const fakeVideos = [
	'A Fake Video.mp4',
	'Another Fake Video.webm',
	'Unreal Video.mp4',
]

const removeExtension = (filename) => filename.replace(/\.[a-zA-Z0-9]+$/, '')

const toSlug = (filename) =>
	filename.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-')

const VideoList = () => {
	const location = useLocation()
	const { videoID } = useParams()

	return (
		<Menu fluid vertical tabular>
			<Menu.Item active={location.pathname === '/'}>
				<Link to="/">Video List</Link>
			</Menu.Item>
			<Divider />
			{fakeVideos.map((v) => (
				<Menu.Item key={v} active={videoID === toSlug(removeExtension(v))}>
					<Link to={`/${toSlug(removeExtension(v))}`}>
						{removeExtension(v)}
					</Link>
				</Menu.Item>
			))}
		</Menu>
	)
}

export default VideoList
