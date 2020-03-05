// @format

import React from 'react'
import { Link } from 'react-router-dom'
import { createUseStyles } from 'react-jss'

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

		color: 'black',
		textDecoration: 'none',
		marginTop: 16,
		padding: 16,
		borderRadius: 16,

		'&:first-child': {
			marginTop: 0,
		},

		'&:hover': {
			backgroundColor: 'gray',
		},

		'&:visited': {
			color: 'black',
		},

		'&.active': {
			backgroundColor: 'darkgray',
			color: 'white',
		},
	},

	thumbnail: {
		flex: '0 0 64px',
		marginRight: 16,
	},

	info: {
		display: 'flex',
		flexDirection: 'column',
	},

	title: {
		fontSize: 20,
	},

	time: {
		color: 'purple',
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
					<img
						className={classes.thumbnail}
						alt="Thumbnail"
						src={thumbnail || placeholderImage}
					/>
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
