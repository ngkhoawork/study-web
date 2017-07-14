/*
 *
 * StudyPage
 *
 */

import React, { PropTypes } from 'react';
import Helmet from 'react-helmet';
import moment from 'moment-timezone';
import _ from 'lodash';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { selectCurrentUser, selectSitePatients } from '../../containers/App/selectors';
import { fetchSources } from '../../containers/App/actions';
import LoadingSpinner from '../../components/LoadingSpinner';
import FilterStudyPatients from './FilterStudyPatients';
import NotFoundPage from '../../containers/NotFoundPage/index';
import StudyStats from './StudyStats';
import PatientBoard from '../../components/PatientBoard/index';
import * as Selector from './selectors';
import { fetchPatients, fetchPatientCategories, fetchStudy, setStudyId, updatePatientSuccess, fetchStudyTextNewStats } from './actions';
import {
  selectSocket,
} from '../../containers/GlobalNotifications/selectors';

export class StudyPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    campaigns: PropTypes.array,
    currentUser: PropTypes.any,
    fetchPatients: PropTypes.func.isRequired,
    fetchPatientCategories: PropTypes.func.isRequired,
    fetchingPatientCategories: PropTypes.bool.isRequired,
    fetchingPatients: PropTypes.bool.isRequired,
    fetchStudy: PropTypes.func.isRequired,
    fetchingStudy: PropTypes.bool.isRequired,
    patientCategories: PropTypes.array,
    params: PropTypes.object,
    patients: PropTypes.array,
    setStudyId: PropTypes.func.isRequired,
    sources: PropTypes.array,
    protocol: PropTypes.object,
    site: PropTypes.object,
    study: PropTypes.object,
    stats: PropTypes.object,
    socket: React.PropTypes.any,
    updatePatientSuccess: React.PropTypes.func,
    fetchSources: PropTypes.func,
    sitePatients: React.PropTypes.object,
    fetchStudyTextNewStats: React.PropTypes.func,
    fetchingPatientsError: PropTypes.object,
  };

  static defaultProps = {
    fetchingStudy: true,
    fetchingPatients: true,
    fetchingPatientCategories: true,
  };

  constructor(props) {
    super(props);
    this.state = {
      socketBinded: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    const { params, setStudyId, fetchStudy, fetchPatientCategories, fetchSources } = this.props;
    setStudyId(parseInt(params.id));
    fetchStudy(params.id);
    fetchPatientCategories(params.id);
    fetchSources();
  }

  componentWillReceiveProps(newProps) {
    const { params, socket, setStudyId, fetchStudy, fetchPatientCategories, fetchSources, currentUser } = this.props;
    if (socket && this.state.socketBinded === false) {
      this.setState({ socketBinded: true }, () => {
        socket.on('notifyMessage', (message) => {
          let curCategoryId = null;
          let unreadMessageCount = 0;
          const socketMessage = message;

          if (socketMessage.twilioTextMessage.__data) { // eslint-disable-line no-underscore-dangle
            socketMessage.twilioTextMessage = socketMessage.twilioTextMessage.__data; // eslint-disable-line no-underscore-dangle
          }
          if (socketMessage.study.__data) { // eslint-disable-line no-underscore-dangle
            socketMessage.study = socketMessage.study.__data; // eslint-disable-line no-underscore-dangle
          }
          if (socketMessage.patient.__data) { // eslint-disable-line no-underscore-dangle
            socketMessage.patient = socketMessage.patient.__data; // eslint-disable-line no-underscore-dangle
          }

          _.forEach(this.props.patientCategories, (item) => {
            _.forEach(item.patients, (patient) => {
              if (patient.id === socketMessage.patient_id) {
                curCategoryId = item.id;
                unreadMessageCount = patient.unreadMessageCount || 0;
              }
            });
          });

          this.props.fetchStudy(params.id);
          this.props.fetchStudyTextNewStats(params.id);
          console.log(socketMessage.twilioTextMessage.direction);
          console.log(unreadMessageCount);
          if (curCategoryId && socketMessage.twilioTextMessage.direction === 'inbound') {
            this.props.updatePatientSuccess({
              patientId: socketMessage.patient_id,
              patientCategoryId: curCategoryId,
              unreadMessageCount: (unreadMessageCount + 1),
              lastTextMessage: socketMessage.twilioTextMessage,
            });
          }
        });

        socket.on('notifyClientReportReady', (data) => {
          if (currentUser.id && data.url && currentUser.id === data.userId) {
            location.replace(data.url);
          }
        });
      });
    }

    if (params.id !== newProps.params.id) {
      setStudyId(parseInt(newProps.params.id));
      fetchStudy(newProps.params.id);
      fetchPatientCategories(newProps.params.id);
      fetchSources();
    }
  }

  handleSubmit(searchFilter) {
    const { params: { id } } = this.props;
    this.props.fetchPatients(id, searchFilter.text, searchFilter.campaignId, searchFilter.sourceId);
  }

  render() {
    const { fetchingPatientCategories, fetchStudy, fetchingStudy, campaigns, patientCategories, protocol, site, sources, study, stats, fetchingPatients } = this.props;
    const ePMS = study && study.patientMessagingSuite;
    if (fetchingStudy || fetchingPatientCategories) {
      return (
        <LoadingSpinner noMessage />
      );
    } else if (!study || !sources || !campaigns) {
      return (
        <div>A problem occurred trying to load the page. Please try refreshing the page.</div>
      );
    }
    const pageTitle = `${study.name} - StudyKIK`;
    const campaignOptions = campaigns.map(campaign => {
      const dateFrom = campaign.dateFrom ? moment(campaign.dateFrom).format('MM/DD/YYYY') : 'TBD';
      const dateTo = campaign.dateTo ? moment(campaign.dateTo).format('MM/DD/YYYY') : 'TBD';
      return {
        label: `${dateFrom} - ${dateTo}`,
        value: campaign.id,
      };
    });
    campaignOptions.unshift({ label: 'All', value: -1 });
    const sourceOptions = sources.map(source => (
      {
        label: source.type,
        value: source.id,
      }
    ));
    sourceOptions.unshift({ label: 'All', value: -1 });
    const siteLocation = site.name;
    let sponsor = 'None';
    if (study.sponsor) {
      sponsor = study.sponsor.name;
    }
    let studyName = study.name;
    if (study.indication && study.indication.name) {
      studyName = study.indication.name;
    }

    if (this.props.fetchingPatientsError && this.props.fetchingPatientsError.status === 404) {
      return <NotFoundPage />;
    }
    return (
      <div className="container-fluid no-padding">
        <Helmet title={pageTitle} />
        <section className="individual-study">
          <header className="main-head">
            <h2 className="main-heading">{study.name}</h2>
            <p>
              <span className="info-cell">Location: {siteLocation}</span>
              <span className="info-cell">Sponsor: {sponsor}</span>
              <span className="info-cell">Protocol: {protocol.number || ''}</span>
            </p>
          </header>
          <FilterStudyPatients
            campaignOptions={campaignOptions}
            sourceOptions={sourceOptions}
            fetchStudy={fetchStudy}
            handleSubmit={this.handleSubmit}
            ePMS={ePMS}
            studyName={studyName}
          />
          <StudyStats stats={stats} />
          <PatientBoard
            patientCategories={patientCategories}
            fetchingPatients={fetchingPatients}
            ePMS={ePMS}
          />
        </section>
      </div>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  campaigns: Selector.selectCampaigns(),
  fetchingPatients: Selector.selectFetchingPatients(),
  fetchingPatientCategories: Selector.selectFetchingPatientCategories(),
  fetchingStudy: Selector.selectFetchingStudy(),
  patientCategories: Selector.selectPatientCategories(),
  sources: Selector.selectSources(),
  site: Selector.selectSite(),
  protocol: Selector.selectProtocol(),
  study: Selector.selectStudy(),
  stats: Selector.selectStudyStats(),
  currentUser: selectCurrentUser(),
  socket: selectSocket(),
  sitePatients: selectSitePatients(),
  fetchingPatientsError: Selector.selectFetchingPatientsError(),
});

function mapDispatchToProps(dispatch) {
  return {
    fetchPatients: (studyId, text, campaignId, sourceId) => dispatch(fetchPatients(studyId, text, campaignId, sourceId)),
    fetchPatientCategories: (studyId) => dispatch(fetchPatientCategories(studyId)),
    fetchStudy: (studyId, campaignId) => dispatch(fetchStudy(studyId, campaignId)),
    setStudyId: (id) => dispatch(setStudyId(id)),
    updatePatientSuccess: (payload) => dispatch(updatePatientSuccess(payload)),
    fetchSources: () => dispatch(fetchSources()),
    fetchStudyTextNewStats: (studyId) => dispatch(fetchStudyTextNewStats(studyId)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StudyPage);
