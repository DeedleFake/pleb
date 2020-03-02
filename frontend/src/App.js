// @format

import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import { Grid } from 'semantic-ui-react'

import Watch from './Watch'
import VideoList from './VideoList'

const App = () => {
	return (
		<Router>
			<Switch>
				<Route path="/:videoID">
					<Watch />
				</Route>
				<Route path="/">
					<Grid>
						<Grid.Column width={16}>
							<VideoList />
						</Grid.Column>
					</Grid>
				</Route>
			</Switch>
		</Router>
	)
}

export default App
