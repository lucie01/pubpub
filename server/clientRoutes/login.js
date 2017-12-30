import ReactDOMServer from 'react-dom/server';
import React from 'react';
import Promise from 'bluebird';
import Login from 'containers/Login/Login';
import Html from '../Html';
import app from '../server';
import { User } from '../models';
import { getCommunity } from '../utilities';

app.use((req, res)=> {
	res.status(404);

	return Promise.all([getCommunity(req), User.findOne()])
	.then(([communityData, loginData])=> {
		const initialData = {
			loginData: loginData,
			communityData: communityData,
			isBasePubPub: false,
		};
		return ReactDOMServer.renderToNodeStream(
			<Html
				chunkName="Login"
				initialData={initialData}
				headerComponents={[
					<title key="meta-title">{`Login · ${communityData.title}`}</title>,
				]}
			>
				<Login {...initialData} />
			</Html>
		)
		.pipe(res);
	})
	.catch((err)=> {
		console.log('Err', err);
		return res.status(500).json('Error');
	});
});