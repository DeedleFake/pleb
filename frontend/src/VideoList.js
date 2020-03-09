// @format

import React from 'react'
import { Link } from 'react-router-dom'
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

		'&:first-child': {
			marginTop: 0,
		},

		'&:hover': {
			backgroundColor: theme.color.secondary,
		},

		'&:visited': {
			color: theme.color.text,
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

const VideoList = ({ className, active, videos }) => {
	const classes = useStyles()

	return (
		<nav className={classList(classes.main, className)}>
			{videos.map(({ thumbnail, time, slug, title }) => (
				<Link
					key={slug}
					className={classList(classes.video, active === slug && 'active')}
					to={`/${active !== slug ? slug : ''}`}
				>
					<div className={classes.thumbnail}>
						<img alt="Thumbnail" src={thumbnail || placeholderImage} />
					</div>
					<div className={classes.info}>
						<span className={classes.title}>{title}</span>
						<span className={classes.time}>{time.toLocaleString()}</span>
					</div>
				</Link>
			))}
		</nav>
	)
}

export default VideoList
