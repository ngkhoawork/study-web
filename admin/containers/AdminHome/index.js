/*
 * AdminHome
 */

import React, { Component, PropTypes } from 'react';
import { change, reset } from 'redux-form';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import _ from 'lodash';

import StatsBox from '../../components/StatsBox';
import ExpandableSection from '../../components/ExpandableSection';
import FiltersPageForm from '../../components/FiltersPageForm';
import MediaStatsTable from '../../components/MediaStatsTable';
import FilterQueryForm from '../../components/Filter/FilterQueryForm';
import StudyInfo from '../../components/StudyInfo';
import {
  selectFilterFormValues, selectStudies, selectTotals, selectSources, selectCustomFilters, selectMediaTotals,
  selectStudiesPaginationOptions, selectIndications, selectProtocols, selectSponsors, selectUsersByRoles, selectCro,
} from '../App/selectors';
import {
  fetchSources, fetchIndications, fetchProtocols, fetchSponsors, fetchCro, fetchUsersByRole,
  fetchStudiesForAdmin, fetchTotalsForAdmin, clearFilters, clearStudies, fetchMediaTotalsForAdmin, clearCustomFilters,
} from '../App/actions';

const formName = 'adminDashboardFilters';
export class AdminHomePage extends Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    change: PropTypes.func.isRequired,
    changeAdminFilters: PropTypes.func.isRequired,
    resetForm: PropTypes.func.isRequired,
    fetchSources: PropTypes.func,
    totals: PropTypes.object,
    mediaTotals: PropTypes.object,
    studies: PropTypes.object,
    sources: PropTypes.array,
    indications: PropTypes.array,
    protocols: PropTypes.object,
    sponsors: PropTypes.object,
    cro: PropTypes.object,
    usersByRoles: PropTypes.object,
    filtersFormValues: PropTypes.object.isRequired,
    customFilters: PropTypes.array.isRequired,
    fetchStudiesForAdmin: PropTypes.func,
    fetchTotalsForAdmin: PropTypes.func,
    fetchIndications: PropTypes.func,
    fetchProtocols: PropTypes.func,
    fetchSponsors: PropTypes.func,
    fetchCro: PropTypes.func,
    fetchUsersByRole: PropTypes.func,
    fetchMediaTotalsForAdmin: PropTypes.func,
    clearFilters: PropTypes.func,
    clearStudies: PropTypes.func,
    clearCustomFilters: PropTypes.func,
    paginationOptions: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.state = {
      modalOpen: false,
      prevOffset: null,
      prevTotalsFilters: null,
    };

    this.fetchStudiesAccordingToFilters = this.fetchStudiesAccordingToFilters.bind(this);
    this.getCurrentFilters = this.getCurrentFilters.bind(this);
    this.clearFiltersAndClean = this.clearFiltersAndClean.bind(this);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.filtersFormValues.campaign !== this.props.filtersFormValues.campaign) {
      this.fetchStudiesAccordingToFilters();
    }

    if (newProps.sources !== this.props.sources) {
      const allSources = _.cloneDeep(newProps.sources);
      const defaultSource = allSources.find(s => {
        return s.type === 'StudyKIK';
      });

      newProps.fetchTotalsForAdmin({ source: defaultSource.id }, null, null);
    }
  }

  componentWillMount() {
    const { sources, fetchSources, indications, fetchIndications, protocols, fetchProtocols, sponsors, fetchSponsors,
      cro, fetchCro, usersByRoles, fetchUsersByRole } = this.props;
    if (!sources.length) {
      fetchSources();
    }
    if (!indications.length) {
      fetchIndications();
    }
    if (!protocols.details.length) {
      fetchProtocols();
    }
    if (!sponsors.details.length) {
      fetchSponsors();
    }
    if (!cro.details.length) {
      fetchCro();
    }
    if (![...usersByRoles.sm, ...usersByRoles.bd, ...usersByRoles.ae, ...usersByRoles.cc].length) {
      fetchUsersByRole();
    }
  }

  fetchStudiesAccordingToFilters(fetchByScroll = false) {
    const { change, totals, paginationOptions, clearFilters, fetchStudiesForAdmin, fetchTotalsForAdmin, sources, clearStudies } = this.props;
    const { prevTotalsFilters, prevOffset } = this.state;

    const allSources = _.cloneDeep(sources);
    const defaultSource = allSources.find(s => {
      return s.type === 'StudyKIK';
    });
    const filters = this.getCurrentFilters();
    let isEmpty = true;

    _.forEach(filters, (filter) => {
      if (!_.isEmpty(filter)) {
        isEmpty = false;
      }
    });

    if (defaultSource && filters.source === defaultSource.id) {
      change('dashboardFilters', 'source', defaultSource.id);
    } else if (!filters.source) {
      change('dashboardFilters', 'source', null);
    }

    let offset = 0;
    const limit = 50;

    if (fetchByScroll) {
      offset = paginationOptions.page * limit;
    } else {
      clearStudies();
    }

    if (isEmpty) {
      clearFilters();
      this.setState({ prevTotalsFilters: null });
    } else if (_.isEqual(prevTotalsFilters, filters)) {
      if (prevOffset !== offset || _.isEmpty(totals.details)) {
        fetchStudiesForAdmin(filters, limit, offset);
        fetchTotalsForAdmin(filters, limit, offset);
        this.setState({ prevOffset: offset });
      }
    } else {
      this.setState({ prevTotalsFilters: _.cloneDeep(filters) });
      fetchStudiesForAdmin(filters, limit, offset);
      fetchTotalsForAdmin(filters, limit, offset);
      this.setState({ prevOffset: offset });
    }
  }

  getCurrentFilters() {
    const { filtersFormValues, customFilters, sources } = this.props;
    const allSources = _.cloneDeep(sources);
    const defaultSource = allSources.find(s => {
      return s.type === 'StudyKIK';
    });
    let filters = _.cloneDeep(filtersFormValues);

    // adding custom filters and remove unneeded attributes
    if (filters['admin-search-type']) {
      delete filters['admin-search-type'];
    }
    if (filters['admin-search-value']) {
      delete filters['admin-search-value'];
    }
    customFilters.forEach(cf => {
      if (cf.key === 'studyNumber' && cf.value) {
        filters = { ...filters, search: { value: cf.value.trim() } };
      } else if (cf.key === 'address' && cf.value) {
        filters = { ...filters, address: { value: cf.value.trim() } };
      } else if (cf.key === 'postalCode' && cf.value) {
        filters = { ...filters, postalCode: { value: cf.value.trim() } };
      }
    });

    _.forEach(filters, (filter, k) => {
      if (k !== 'search' && k !== 'percentage' && k !== 'campaign' && k !== 'source' && k !== 'postalCode' && k !== 'address') {
        const withoutAll = _.remove(filter, (item) => (item.label !== 'All'));
        filters[k] = withoutAll;
      }
    });

    if (!filters.source && defaultSource) {
      change('dashboardFilters', 'source', defaultSource.id);
      filters.source = defaultSource.id;
    }

    if (filters.source === -1) {
      change('dashboardFilters', 'source', null);
      delete filters.source;
    }

    return filters;
  }

  clearFiltersAndClean() {
    const { resetForm, clearCustomFilters, clearStudies } = this.props;
    clearCustomFilters();
    resetForm();
    clearStudies();
    this.setState({ prevOffset: null, prevTotalsFilters: null });
  }

  render() {
    const { studies, mediaTotals, sources, totals, filtersFormValues, changeAdminFilters, paginationOptions,
      fetchMediaTotalsForAdmin } = this.props;
    const filterUnchanged = _.isEqual(this.state.prevTotalsFilters, this.getCurrentFilters());

    const campaignSelected = (typeof filtersFormValues.campaign === 'string');

    return (
      <div id="adminHomePage" className="admin-dashboard">
        <div className="fixed-header clearfix">
          <h1 className="main-heading pull-left">Admin portal</h1>
          <FiltersPageForm />
        </div>
        <FilterQueryForm
          clearFilters={this.clearFiltersAndClean}
          changeAdminFilters={changeAdminFilters}
          applyFilters={this.fetchStudiesAccordingToFilters}
          filterUnchanged={filterUnchanged}
        />
        <StatsBox
          totals={totals}
          campainSelected={campaignSelected}
        />
        {(studies.details && studies.details.length > 0) && (
          <div id="mediaStatsBox">
            <ExpandableSection
              content={
                <MediaStatsTable
                  campaignSelected={campaignSelected}
                  campaign={filtersFormValues.campaign}
                  startDate={filtersFormValues.startDate}
                  endDate={filtersFormValues.endDate}
                  studies={studies}
                  sources={sources}
                  mediaTotals={mediaTotals}
                  fetchMediaTotalsForAdmin={fetchMediaTotalsForAdmin}
                />
              }
            />
          </div>)
        }
        <StudyInfo
          studies={studies}
          totals={totals}
          filtersFormValues={filtersFormValues}
          paginationOptions={paginationOptions}
          changeAdminFilters={changeAdminFilters}
          fetchStudiesAccordingToFilters={this.fetchStudiesAccordingToFilters}
        />
      </div>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  filtersFormValues: selectFilterFormValues(),
  paginationOptions: selectStudiesPaginationOptions(),
  studies: selectStudies(),
  totals: selectTotals(),
  mediaTotals: selectMediaTotals(),
  sources: selectSources(),
  customFilters: selectCustomFilters(),
  indications: selectIndications(),
  protocols: selectProtocols(),
  sponsors: selectSponsors(),
  cro: selectCro(),
  usersByRoles: selectUsersByRoles(),
});

const mapDispatchToProps = (dispatch) => ({
  change: (fName, name, value) => dispatch(change(fName, name, value)),
  changeAdminFilters: (name, value) => dispatch(change(formName, name, value)),
  resetForm: () => dispatch(reset(formName)),
  fetchStudiesForAdmin: (params, limit, offset) => dispatch(fetchStudiesForAdmin(params, limit, offset)),
  fetchTotalsForAdmin: (params, limit, offset) => dispatch(fetchTotalsForAdmin(params, limit, offset)),
  fetchMediaTotalsForAdmin: (params) => dispatch(fetchMediaTotalsForAdmin(params)),
  fetchIndications: () => dispatch(fetchIndications()),
  fetchProtocols: () => dispatch(fetchProtocols()),
  fetchSponsors: () => dispatch(fetchSponsors()),
  fetchSources: () => dispatch(fetchSources()),
  fetchUsersByRole: () => dispatch(fetchUsersByRole()),
  fetchCro: () => dispatch(fetchCro()),
  clearFilters: () => dispatch(clearFilters()),
  clearStudies: () => dispatch(clearStudies()),
  clearCustomFilters: () => dispatch(clearCustomFilters()),
});

export default connect(mapStateToProps, mapDispatchToProps)(AdminHomePage);
