import ReactDOMServer from 'react-dom/server';
import React from 'react';
import Promise from 'bluebird';
import CollectionContainer from 'containers/Collection/Collection';
import Html from '../Html';
import app from '../server';
import { User, Collection, Pub, Collaborator, Discussion } from '../models';
import { getCommunity } from '../utilities';

const renderCollection = (req, res, next)=> {
	return getCommunity(req)
	.then((communityData)=> {
		const collectionId = communityData.collections.reduce((prev, curr)=> {
			if (curr.slug === '' && req.params.slug === undefined) { return curr.id; }
			if (curr.slug === req.params.slug) { return curr.id; }
			return prev;
		}, undefined);

		if (!collectionId) { throw new Error('Collection Not Found'); }

		const findCollection = Collection.findOne({
			where: {
				id: collectionId
			},
			include: [
				{
					model: Pub,
					as: 'pubs',
					through: { attributes: [] },
					attributes: {
						exclude: ['editHash', 'viewHash'],
					},
					include: [
						{
							model: User,
							as: 'collaborators',
							attributes: ['id', 'avatar', 'initials'],
							through: { attributes: ['isAuthor'] },
						},
						{
							required: false,
							model: Collaborator,
							as: 'emptyCollaborators',
							where: { userId: null },
							attributes: { exclude: ['createdAt', 'updatedAt'] },
						},
						{
							required: false,
							separate: true,
							model: Discussion,
							as: 'discussions',
							attributes: ['suggestions', 'pubId', 'submitHash', 'isArchived']
						}
					]
				}
			],
		});
		return Promise.all([communityData, findCollection]);
	})
	.then(([communityData, collectionData])=> {
		const initialData = {
			loginData: req.user || {},
			communityData: communityData,
			collectionData: collectionData,
			isBasePubPub: false,
			slug: req.params.slug,
		};
		const pageTitle = collectionData.title === 'Home'
			? communityData.title
			: collectionData.title;
		return ReactDOMServer.renderToNodeStream(
			<Html
				chunkName="Collection"
				initialData={initialData}
				headerComponents={[
					<title key="meta-title">{pageTitle}</title>,
					<meta key="meta-desc" name="description" content={collectionData.description} />,
				]}
			>
				<CollectionContainer {...initialData} />
			</Html>
		)
		.pipe(res);
	})
	.catch((err)=> {
		if (err.message === 'Collection Not Found') {
			return next();
		}
		console.log('Err', err);
		return res.status(500).json('Error');
	});
};

app.get('/', renderCollection);
app.get('/:slug', renderCollection);