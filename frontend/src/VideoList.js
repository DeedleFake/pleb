// @format

import React from 'react'
import { createUseStyles } from 'react-jss'

import * as theme from './theme.js'

import placeholderImage from './assets/placeholder.gif'

const useStyles = createUseStyles({
	main: {
		display: 'flex',
		flexDirection: 'column',
	},

	video: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',

		textDecoration: 'none',
		marginTop: 16,
		padding: 16,
		borderRadius: 16,
		cursor: 'pointer',
		border: 'none',
		color: theme.color.text,

		'&:first-child': {
			marginTop: 0,
		},

		'&:hover': {
			backgroundColor: theme.color.secondary,
		},

		'&.active': {
			backgroundColor: theme.color.primary,
		},
	},

	thumbnail: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',

		flex: '0 0 64px',
		height: 64,
		marginRight: 16,

		'& > img': {
			maxWidth: '100%',
			maxHeight: '100%',
		},
	},

	info: {
		display: 'flex',
		flexDirection: 'column',
	},

	title: {
		fontSize: 20,
	},

	time: {
		color: theme.color.secondaryText,
		fontSize: 16,
	},
})

const classList = (...classes) => classes.filter((v) => v).join(' ')

const VideoList = ({ className, active, videos, onSelect = () => {} }) => {
	const classes = useStyles()

	return (
		<nav className={classList(classes.main, className)}>
			{videos.map((video) => (
				<div
					key={video.slug}
					className={classList(
						classes.video,
						active === video.slug && 'active',
					)}
					onClick={(ev) => onSelect(video)}
				>
					<div className={classes.thumbnail}>
						<img alt="Thumbnail" src={video.thumbnail || placeholderImage} />
					</div>
					<div className={classes.info}>
						<span className={classes.title}>{video.title}</span>
						<span className={classes.time}>{video.time.toLocaleString()}</span>
					</div>
				</div>
			))}
		</nav>
	)
}

export default VideoList
