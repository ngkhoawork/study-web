/*
 *
 * DashboardIndicationPage
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import Helmet from 'react-helmet';
import DashboardIndicationSearch from './DashboardIndicationSearch/index';
import DashboardIndicationTable from './DashboardIndicationTable';
import { fetchIndications, fetchLevels, addLevel, addIndication, deleteIndication, editIndication, setActiveSort } from './actions';
import { selectDashboardIndicationSearchFormValues, selectIndications, selectLevels, selectDashboardAddLevelProcess, selectDashboardAddIndicationProcess, selectPaginationOptions } from './selectors';

export class DashboardIndicationPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    fetchIndications: PropTypes.func,
    fetchLevels: PropTypes.func,
    indications: PropTypes.object,
    levels: PropTypes.object,
    addLevel: PropTypes.func,
    addIndication: PropTypes.func,
    addLevelProcess: PropTypes.object,
    addIndicationProcess: PropTypes.object,
    editIndication: PropTypes.func,
    deleteIndication: PropTypes.func,
    indicationSearchFormValues: PropTypes.object,
    setActiveSort: PropTypes.func,
    paginationOptions: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.loadMore = this.loadMore.bind(this);
  }

  componentWillMount() {
    this.props.fetchIndications();
    this.props.fetchLevels();
  }

  loadMore() {
    const { fetchIndications } = this.props;
    const offset = this.props.paginationOptions.page * 10;
    const limit = 10;
    fetchIndications(limit, offset);
  }

  render() {
    const { indicationSearchFormValues, indications, levels, addLevel, addIndication, addLevelProcess, addIndicationProcess } = this.props;
    return (
      <div className="container-fluid dashboard-indication">
        <Helmet title="Indication - StudyKIK" />
        <h2 className="main-heading">Indication</h2>

        <DashboardIndicationSearch
          addLevel={addLevel}
          addIndication={addIndication}
          addLevelProcess={addLevelProcess}
          addIndicationProcess={addIndicationProcess}
          levels={levels}
          indications={indications}
        />
        <DashboardIndicationTable
          levels={levels}
          editIndication={this.props.editIndication}
          deleteIndication={this.props.deleteIndication}
          addIndicationProcess={addIndicationProcess}
          indicationSearchFormValues={indicationSearchFormValues}
          setActiveSort={this.props.setActiveSort}
          loadMore={this.loadMore}
        />
      </div>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  indications: selectIndications(),
  levels: selectLevels(),
  addLevelProcess: selectDashboardAddLevelProcess(),
  addIndicationProcess: selectDashboardAddIndicationProcess(),
  indicationSearchFormValues: selectDashboardIndicationSearchFormValues(),
  paginationOptions: selectPaginationOptions(),
});

function mapDispatchToProps(dispatch) {
  return {
    fetchIndications: (limit, offset) => dispatch(fetchIndications(limit, offset)),
    fetchLevels: () => dispatch(fetchLevels()),
    addLevel: (payload) => dispatch(addLevel(payload)),
    addIndication: (payload) => dispatch(addIndication(payload)),
    editIndication: (payload) => dispatch(editIndication(payload)),
    deleteIndication: (payload) => dispatch(deleteIndication(payload)),
    setActiveSort: (sort, direction) => dispatch(setActiveSort(sort, direction)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardIndicationPage);
