import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NonIdealState } from '@blueprintjs/core';
import PubPreview from 'components/PubPreview/PubPreview';
import PageWrapper from 'components/PageWrapper/PageWrapper';
import { hydrateWrapper } from 'utilities';
// import { getSearch } from 'actions/search';

require('./search.scss');

const propTypes = {
	communityData: PropTypes.object.isRequired,
	loginData: PropTypes.object.isRequired,
	locationData: PropTypes.object.isRequired,
	searchData: PropTypes.array.isRequired,
};

class Search extends Component {
	constructor(props) {
		super(props);
		// const queryObject = queryString.parse(this.props.location.search);
		this.state = {
			searchQuery: props.locationData.query.q || '',
		};
		// this.getSearchData = this.getSearchData.bind(this);
		this.handleSearchChange = this.handleSearchChange.bind(this);
		this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
	}

	// componentWillMount() {
	// 	this.getSearchData(this.props);
	// }
	// componentWillReceiveProps(nextProps) {
	// 	if (nextProps.location.search !== this.props.location.search) {
	// 		this.getSearchData(nextProps);
	// 		this.setState({ searchQuery: queryString.parse(nextProps.location.search).q || '' });
	// 	}
	// }
	// getSearchData(props) {
	// 	const queryObject = queryString.parse(props.location.search);
	// 	const searchTerm = queryObject.q;
	// 	const appData = this.props.appData.data || {};
	// 	this.props.dispatch(getSearch(searchTerm, appData.id));
	// }
	handleSearchChange(evt) {
		this.setState({ searchQuery: evt.target.value });
	}

	handleSearchSubmit(evt) {
		evt.preventDefault();

		window.location.href = `/search?q=${this.state.searchQuery}`;
		// this.props.history.push();
	}

	render() {
		const searchData = this.props.searchData;
		return (
			<div id="search-container">
				<PageWrapper
					loginData={this.props.loginData}
					communityData={this.props.communityData}
					locationData={this.props.locationData}
					hideNav={this.props.locationData.isBasePubPub}
				>
					<div className="container narrow">
						<div className="row">
							<div className="col-12">
								<form onSubmit={this.handleSearchSubmit}>
									<input
										placeholder="Search for pubs..."
										value={this.state.searchQuery}
										onChange={this.handleSearchChange}
										className="pt-input pt-large pt-fill"
									/>
								</form>
							</div>
						</div>

						<div className="row">
							<div className="col-12">
								{/*this.props.searchData.isLoading &&
									<div>
										<div className="preview-wrapper"><PubPreview size="medium" /></div>
										<div className="preview-wrapper"><PubPreview size="medium" /></div>
										<div className="preview-wrapper"><PubPreview size="medium" /></div>
									</div>
								*/}
								{!searchData.length && this.props.locationData.query.q &&
									<NonIdealState
										title="No Results"
										visual="pt-icon-search"
									/>
								}
								{!!searchData.length &&
									<div>
										{searchData.map((pub)=> {
											return (
												<div className="preview-wrapper" key={`result-${pub.id}`}>
													<PubPreview
														communityData={pub.community}
														title={pub.title}
														description={pub.description}
														slug={pub.slug}
														bannerImage={pub.avatar}
														// isLarge={false}
														size="medium"
														publicationDate={pub.updatedAt}
														collaborators={pub.collaborators.filter((item)=> {
															return !item.Collaborator.isAuthor;
														})}
														authors={pub.collaborators.filter((item)=> {
															return item.Collaborator.isAuthor;
														})}
													/>
												</div>
											);
										})}
									</div>
								}
							</div>
						</div>
					</div>
				</PageWrapper>
			</div>
		);
	}
}

Search.propTypes = propTypes;
export default Search;

hydrateWrapper(Search);
