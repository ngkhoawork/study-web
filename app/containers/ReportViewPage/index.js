/*
 *
 * ReportViewPage
 *
 */

import _ from 'lodash';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import Modal from 'react-bootstrap/lib/Modal';
import InfiniteScroll from 'react-infinite-scroller';

import { STATUS_ALL } from './constants';
import LoadingSpinner from '../../components/LoadingSpinner';
import ReportViewInfo from '../../containers/ReportViewPage/ReportViewInfo';
import ReportViewTotals from '../../containers/ReportViewPage/ReportViewTotals';
import StudyReportView from './StudyReportView';
import ReportViewSearch from '../../components/ReportViewSearch';
import ReportViewTable from '../../components/ReportViewTable';
import CenteredModal from '../../../common/components/CenteredModal/index';
import PQSModal from '../../components/PQSModal/index';
import unknownImageUrl from '../../assets/images/unknown.png';
import PatientNote from './PatientNote';
import { translate } from '../../../common/utilities/localization';

import { selectCurrentUser, selectSources } from '../../containers/App/selectors';
import { getReportsList, setActiveSort, sortReportsSuccess, changeProtocolStatus, getReportsTotals, getCategoryNotes, clearReportList, fetchMediaSources, getDispositionTotals, fetchTotalSignUps, fetchStudyMediaSources, getStudyDispositionTotals, getStudyReportsTotals } from '../../containers/ReportViewPage/actions';
import { selectReportsList, selectSearchReportsFormValues, selectPaginationOptions, selectTableFormValues, selectReportsTotals, selectCategoryNotes, selectNotesPaginationOptions, selectMediaSources, selectDispositionTotals, selectPatientSignUps, selectStudyReportsTotals, selectStudyDispositionTotals, selectStudyMediaSources } from '../../containers/ReportViewPage/selectors';
import { fetchSources } from '../../containers/App/actions';
import './style.less';

const dispositions = [
  {
    id: '1',
    type: translate('sponsor.page.reportViewPage.dispositions.key1'),
  },
  {
    id: '2',
    type: translate('sponsor.page.reportViewPage.dispositions.key2'),
  },
  {
    id: '3',
    type: translate('sponsor.page.reportViewPage.dispositions.key3'),
  },
  {
    id: '4',
    type: translate('sponsor.page.reportViewPage.dispositions.key4'),
  },
];

export class ReportViewPage extends React.Component { // eslint-disable-line react/prefer-stateless-function

  static propTypes = {
    location: PropTypes.object,
    getReportsList: PropTypes.func,
    reportsList: PropTypes.object,
    formValues: PropTypes.object,
    setActiveSort: PropTypes.func,
    sortReportsSuccess: PropTypes.func,
    paginationOptions: PropTypes.object,
    formTableValues: PropTypes.object,
    currentUser: PropTypes.object,
    changeProtocolStatus: PropTypes.func,
    getReportsTotals: PropTypes.func,
    fetchMediaSources: PropTypes.func,
    totals: PropTypes.object,
    getCategoryNotes: PropTypes.func,
    categoryNotes: PropTypes.object,
    notesPaginationOptions: PropTypes.object,
    patientSignUps: PropTypes.object,
    fetchSources: PropTypes.func,
    clearReportList: PropTypes.func,
    sources: PropTypes.array,
    dispositionTotals: PropTypes.object,
    getDispositionTotals: PropTypes.func,
    mediaSources: PropTypes.object,
    fetchTotalSignUps: PropTypes.func,
    studyTotals: PropTypes.object,
    getStudyReportsTotals: PropTypes.func,
    studyMediaSources: PropTypes.object,
    fetchStudyMediaSources: PropTypes.func,
    studyDispositionTotals: PropTypes.object,
    getStudyDispositionTotals: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      filters: null,
      showCategoryModal: false,
      modalCategory: false,
      modalTitle: false,
      currentCategoryStudyId: false,
      currentDnqStudyId: false,
      showPQSModal: false,
      showStatsModal: false,
      selectedStudyId: null,
    };

    this.searchReports = this.searchReports.bind(this);
    this.loadReports = this.loadReports.bind(this);
    this.openNotesModal = this.openNotesModal.bind(this);
    this.closeCategoryModal = this.closeCategoryModal.bind(this);
    this.loadNotesItems = this.loadNotesItems.bind(this);
    this.openPQSModal = this.openPQSModal.bind(this);
    this.closePQSModal = this.closePQSModal.bind(this);
    this.openStatsModal = this.openStatsModal.bind(this);
    this.closeStatsModal = this.closeStatsModal.bind(this);
    this.getMoreTotals = this.getMoreTotals.bind(this);
  }

  componentWillMount() {
    const { currentUser } = this.props;
    const protocolNumber = this.props.location.query.protocol || null;
    const indication = this.props.location.query.indication || null;
    const cro = this.props.location.query.cro || null;
    const messaging = this.props.location.query.messaging || null;

    const filters = { source: 1, status: STATUS_ALL, sponsorRoleId: currentUser.roleForSponsor.id, protocol: protocolNumber, indication, cro, messaging, timezone: currentUser.timezone };
    this.setState({ filters });

    this.props.getReportsList({ ...filters, source: null });
    this.props.getReportsTotals(filters);
    this.props.getDispositionTotals({ ...filters, source: null });
    this.props.fetchSources();
    this.props.fetchTotalSignUps(currentUser.roleForSponsor.id, protocolNumber, indication, currentUser.timezone);
  }

  componentWillUnmount() {
    this.props.clearReportList();
  }

  loadMediaSources = () => {
    this.props.fetchMediaSources(this.state.filters);
  }

  getPercentageObject(item) {
    const countTotal = parseInt(item.count_not_contacted || 0) + parseInt(item.call_attempted || 0) + parseInt(item.dnq || 0) + parseInt(item.action_needed || 0) + parseInt(item.scheduled || 0) + parseInt(item.consented || 0) + parseInt(item.screen_failed || 0) + parseInt(item.randomized || 0);
    const countContacted = parseInt(item.call_attempted || 0) + parseInt(item.dnq || 0) + parseInt(item.action_needed || 0) + parseInt(item.scheduled || 0) + parseInt(item.consented || 0) + parseInt(item.screen_failed || 0) + parseInt(item.randomized || 0);

    const result = {
      count_contacted_p: parseInt(countTotal) ? Math.round(((parseInt(countContacted) / parseInt(countTotal)) * 100) * 10) / 10 : 0,
      count_not_contacted_p: parseInt(countTotal) ? Math.round(((parseInt(item.count_not_contacted || 0) / parseInt(countTotal)) * 100) * 10) / 10 : 0,
      dnq_p: parseInt(countTotal) ? Math.round(((parseInt(item.dnq || 0) / parseInt(countTotal)) * 100) * 10) / 10 : 0,
      action_needed_p: parseInt(countTotal) ? Math.round(((parseInt(item.action_needed || 0) / parseInt(countTotal)) * 100) * 10) / 10 : 0,
      scheduled_p: parseInt(countTotal) ? Math.round(((parseInt(item.scheduled || 0) / parseInt(countTotal)) * 100) * 10) / 10 : 0,
      consented_p: parseInt(countTotal) ? Math.round(((parseInt(item.consented || 0) / parseInt(countTotal)) * 100) * 10) / 10 : 0,
      screen_failed_p: parseInt(countTotal) ? Math.round(((parseInt(item.screen_failed || 0) / parseInt(countTotal)) * 100) * 10) / 10 : 0,
      randomized_p: parseInt(countTotal) ? Math.round(((parseInt(item.randomized || 0) / parseInt(countTotal)) * 100) * 10) / 10 : 0,
      call_attempted_p: parseInt(countTotal) ? Math.round(((parseInt(item.call_attempted || 0) / parseInt(countTotal)) * 100) * 10) / 10 : 0,
    };

    return result;
  }

  getMoreTotals() {
    const { currentUser, sources } = this.props;
    const protocolNumber = this.props.location.query.protocol || null;
    const indication = this.props.location.query.indication || null;
    const cro = this.props.location.query.cro || null;
    const messaging = this.props.location.query.messaging || null;
    for (const source of sources) {
      let filters = { sponsorRoleId: currentUser.roleForSponsor.id, protocol: protocolNumber, indication, cro, messaging, timezone: currentUser.timezone };
      filters = _.assign(filters, this.props.formValues, {
        source: source.id,
      });
      this.props.getReportsTotals(filters);
    }
  }

  searchReports(searchFilter) {
    const { currentUser, fetchTotalSignUps, getReportsTotals, getReportsList, fetchMediaSources, getDispositionTotals, sources } = this.props;
    const protocolNumber = this.props.location.query.protocol || null;
    const indication = this.props.location.query.indication || null;
    const cro = this.props.location.query.cro || null;
    const messaging = this.props.location.query.messaging || null;

    let filters = { sponsorRoleId: currentUser.roleForSponsor.id, protocol: protocolNumber, indication, cro, messaging, timezone: currentUser.timezone };

    filters = _.assign(filters, this.props.formValues, searchFilter);
    this.setState({ filters });
    fetchTotalSignUps(currentUser.roleForSponsor.id, protocolNumber, indication, currentUser.timezone, searchFilter);
    getReportsTotals(filters);
    getReportsList({ ...filters, source: null }, 50, 0, this.props.paginationOptions.activeSort, this.props.paginationOptions.activeDirection);
    fetchMediaSources(filters);
    getDispositionTotals({ ...filters, source: null });

    for (const source of sources) {
      const filtersForSource = { ...filters, ...this.props.formValues, source: source.id };
      this.props.getReportsTotals(filtersForSource);
    }
  }

  loadReports(isSort, sort, direction) {
    let offset = 0;
    if (!isSort) {
      offset = this.props.paginationOptions.page * 50;
    }
    const limit = 50;

    this.props.getReportsList({ ...this.state.filters, source: null }, limit, offset, (sort || null), (direction || null));
  }

  openNotesModal(id, category, title) {
    this.setState({ showCategoryModal: true, currentCategoryStudyId: id, modalCategory: category, modalTitle: title });
    this.props.getCategoryNotes(this.state.filters, category, id, 10, 0);
  }

  closeCategoryModal() {
    this.setState({ showCategoryModal: false, currentCategoryStudyId: false, modalCategory: false, modalTitle: false });
  }

  loadNotesItems() {
    const offset = this.props.notesPaginationOptions.page * 10;
    const limit = 10;

    this.props.getCategoryNotes(this.state.filters, this.state.modalCategory, this.state.currentCategoryStudyId, limit, offset);
  }

  openPQSModal() {
    this.setState({ showPQSModal: true });
  }

  closePQSModal() {
    this.setState({ showPQSModal: false });
  }

  openStatsModal(item) {
    const { currentUser, sources } = this.props;
    const protocolNumber = this.props.location.query.protocol || null;
    const indication = this.props.location.query.indication || null;
    const cro = this.props.location.query.cro || null;
    const messaging = this.props.location.query.messaging || null;

    const filtersTotal = { source: null, status: STATUS_ALL, sponsorRoleId: currentUser.roleForSponsor.id, protocol: protocolNumber, indication, cro, messaging, timezone: currentUser.timezone, study: item.study_id };
    this.setState({ selectedStudyId:item.study_id, showStatsModal: true });
    for (const source of sources) {
      let studyfilters = { sponsorRoleId: currentUser.roleForSponsor.id, protocol: protocolNumber, indication, cro, messaging, timezone: currentUser.timezone, study: item.study_id  };
      studyfilters = _.assign(studyfilters, this.props.formValues, {
        source: source.id,
      });
      this.props.getStudyReportsTotals(studyfilters);
    }
    this.props.fetchStudyMediaSources(filtersTotal);
    this.props.getStudyDispositionTotals(filtersTotal);
  }

  closeStatsModal() {
    this.setState({ showStatsModal: false });
  }

  render() {
    const protocolNumber = this.props.location.query.protocol || null;
    const indication = this.props.location.query.indication || null;
    const cro = (this.props.location.query.cro && this.props.location.query.cro !== 'null') ? this.props.location.query.cro : 'N/A';
    let notes = '';
    if (this.props.categoryNotes.details.length > 0) {
      let innerCounter = 1;
      let isNextPatientDifferent = true;
      notes =
        (<div className="category-notes-container">
          {
            this.props.categoryNotes.details.map((note, index) => {
              const nextPatient = this.props.categoryNotes.details[index + 1] ? this.props.categoryNotes.details[index + 1].patient_id : null;
              const isNewPatient = isNextPatientDifferent;
              isNextPatientDifferent = (nextPatient && note.patient_id !== nextPatient);
              const result =
              (<div className="patient-note-container" key={index}>
                {(isNewPatient) && <div className="name font-bold">{`Patient #${innerCounter} (${note.siteName})`}</div>}
                { isNewPatient && <div className="img-holder">
                  <img alt="" src={unknownImageUrl} />
                </div> }
                <PatientNote key={note.id} currentUser={this.props.currentUser} note={note} isNewPatient={isNewPatient} counter={innerCounter} />
                {isNextPatientDifferent && <hr></hr>}
              </div>);
              if (isNextPatientDifferent) {
                innerCounter++;
              }
              return result;
            })
          }
        </div>);
    } else if (!this.props.categoryNotes.fetching) {
      notes = <div className="text-center btn-default-padding">{translate('sponsor.page.reportViewPage.noNotes')}</div>;
    }

    const searchInitialValues = { source: 1, status: STATUS_ALL };

    return (
      <div className="container-fluid sponsor-portal report-view-page">
        <section className="reports">
          <div className="individual-study">
            <div className="main-head">
              <h2 className="main-heading">{protocolNumber}</h2>
              <p>
                <span className="info-cell">{translate('sponsor.page.reportViewPage.indication')} {indication}</span>
                <span className="info-cell">{translate('sponsor.page.reportViewPage.cro')} {cro}</span>
              </p>
            </div>
          </div>
        </section>
        <ReportViewSearch
          searchReports={this.searchReports}
          reportsList={this.props.reportsList}
          location={this.props.location}
          currentUser={this.props.currentUser}
          formValues={this.props.formValues}
          initialValues={searchInitialValues}
        />
        <ReportViewInfo
          patientSignUps={this.props.patientSignUps}
          reportsList={this.props.reportsList}
          totals={this.props.totals}
          openPQSModal={() => { this.openPQSModal(); }}
        />
        <ReportViewTotals
          reportsList={this.props.reportsList}
          getPercentageObject={this.getPercentageObject}
          getMoreTotals={this.getMoreTotals}
          totals={this.props.totals}
          openNotesModal={this.openNotesModal}
          sources={this.props.sources}
          dispositions={dispositions}
          dispositionTotals={this.props.dispositionTotals}
          mediaSources={this.props.mediaSources}
          loadMediaSources={this.loadMediaSources}
        />
        <ReportViewTable
          reportsList={this.props.reportsList}
          getPercentageObject={this.getPercentageObject}
          setActiveSort={this.props.setActiveSort}
          sortReportsSuccess={this.props.sortReportsSuccess}
          paginationOptions={this.props.paginationOptions}
          formTableValues={this.props.formTableValues}
          changeProtocolStatus={this.props.changeProtocolStatus}
          currentUser={this.props.currentUser}
          totals={this.props.totals}
          loadReports={this.loadReports}
          openNotesModal={this.openNotesModal}
          openStatsModal={this.openStatsModal}
        />
        <Modal
          dialogComponentClass={CenteredModal}
          show={this.state.showCategoryModal}
        >
          <Modal.Header>
            <Modal.Title>
              {this.state.modalTitle} {translate('sponsor.page.reportViewPage.notes')}
              <a className="lightbox-close close" onClick={() => { this.closeCategoryModal(); }}>
                <i className="icomoon-icon_close" />
              </a>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <InfiniteScroll
              className="sponsor-portal-dnq-inf-scroll"
              pageStart={0}
              loadMore={this.loadNotesItems}
              initialLoad={false}
              hasMore={this.props.notesPaginationOptions.hasMoreItems}
              useWindow={false}
            >
              { notes }
              { this.props.categoryNotes.fetching && <div className="text-center"><LoadingSpinner showOnlyIcon /></div> }
            </InfiniteScroll>
          </Modal.Body>
        </Modal>
        <Modal
          dialogComponentClass={CenteredModal}
          show={this.state.showStatsModal}
          className="stats-modal"
        >
          <Modal.Header>
            <Modal.Title>
              {this.state.modalTitle} {translate('sponsor.component.reportItem.morestats')}
              <a className="lightbox-close close" onClick={() => { this.closeStatsModal(); }}>
                <i className="icomoon-icon_close" />
              </a>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <StudyReportView
              getPercentageObject={this.getPercentageObject}
              totals={this.props.studyTotals}
              openNotesModal={this.openNotesModal}
              sources={this.props.sources}
              dispositions={dispositions}
              dispositionTotals={this.props.studyDispositionTotals}
              mediaSources={this.props.studyMediaSources}
              studyId={this.state.selectedStudyId}
            />
          </Modal.Body>
        </Modal>

        <PQSModal
          showModal={this.state.showPQSModal}
          closePQSModal={this.closePQSModal}
          openPQSModal={this.openPQSModal}
        />
      </div>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  currentUser: selectCurrentUser(),
  reportsList: selectReportsList(),
  formValues: selectSearchReportsFormValues(),
  paginationOptions: selectPaginationOptions(),
  formTableValues: selectTableFormValues(),
  totals: selectReportsTotals(),
  categoryNotes: selectCategoryNotes(),
  notesPaginationOptions: selectNotesPaginationOptions(),
  sources: selectSources(),
  dispositionTotals: selectDispositionTotals(),
  mediaSources: selectMediaSources(),
  patientSignUps: selectPatientSignUps(),
  studyTotals: selectStudyReportsTotals(),
  studyDispositionTotals: selectStudyDispositionTotals(),
  studyMediaSources: selectStudyMediaSources(),
});

function mapDispatchToProps(dispatch) {
  return {
    getReportsList: (searchParams, limit, offset, sort, order) => dispatch(getReportsList(searchParams, limit, offset, sort, order)),
    setActiveSort: (sort, direction) => dispatch(setActiveSort(sort, direction)),
    sortReportsSuccess: (reports) => dispatch(sortReportsSuccess(reports)),
    changeProtocolStatus: (payload) => dispatch(changeProtocolStatus(payload)),
    getReportsTotals: searchParams => dispatch(getReportsTotals(searchParams)),
    getCategoryNotes: (searchParams, category, studyId, limit, offset) => dispatch(getCategoryNotes(searchParams, category, studyId, limit, offset)),
    fetchMediaSources: (searchParams) => dispatch(fetchMediaSources(searchParams)),
    fetchSources: () => dispatch(fetchSources()),
    getDispositionTotals: searchParams => dispatch(getDispositionTotals(searchParams)),
    clearReportList: () => dispatch(clearReportList()),
    fetchTotalSignUps: (roleId, protocol, indication, timezone, searchFilter) => dispatch(fetchTotalSignUps(roleId, protocol, indication, timezone, searchFilter)),
    getStudyReportsTotals: searchParams => dispatch(getStudyReportsTotals(searchParams)),
    getStudyDispositionTotals: searchParams => dispatch(getStudyDispositionTotals(searchParams)),
    fetchStudyMediaSources: (searchParams) => dispatch(fetchStudyMediaSources(searchParams)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ReportViewPage);
