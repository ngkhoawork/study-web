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
import { bindActionCreators } from 'redux';
import { actions as toastrActions } from 'react-redux-toastr';
import { createStructuredSelector } from 'reselect';
import { selectSitePatients, selectCurrentUser, selectSources } from '../App/selectors';
import { fetchStudySources } from '../../../common/actions/studySources';
import LoadingSpinner from '../../components/LoadingSpinner';
import FilterStudyPatients from './FilterStudyPatients';
import NotFoundPage from '../NotFoundPage/index';
import StudyStats from './StudyStats';
import PatientBoard from '../../components/PatientBoard/Index';
import { getItem } from '../../../common/utils/localStorage';
import * as Selector from './selectors';
import { selectStudySources } from '../../../common/selectors/studySources';
import { fetchPatients, fetchPatientCategories, fetchStudy, fetchStudyStats, setStudyId, updatePatientSuccess, downloadReport, studyStatsFetched, studyViewsStatFetched, fetchClientCredits } from './actions';
import { clientOpenedStudyPage, clientClosedStudyPage } from '../GlobalNotifications/actions';
import {
  selectSocket,
} from '../GlobalNotifications/selectors';
import { translate } from '../../../common/utilities/localization';

const mapStateToProps = createStructuredSelector({
  campaigns: Selector.selectCampaigns(),
  fetchingPatients: Selector.selectFetchingPatients(),
  patientBoardLoading: Selector.selectPatientBoardLoading(),
  fetchingPatientCategories: Selector.selectFetchingPatientCategories(),
  fetchingStudy: Selector.selectFetchingStudy(),
  patientCategories: Selector.selectPatientCategories(),
  sources: selectSources(),
  site: Selector.selectSite(),
  protocol: Selector.selectProtocol(),
  study: Selector.selectStudy(),
  stats: Selector.selectStudyStats(),
  patientCategoriesTotals: Selector.selectPatientCategoriesTotals(),
  socket: selectSocket(),
  sitePatients: selectSitePatients(),
  fetchingPatientsError: Selector.selectFetchingPatientsError(),
  currentUser: selectCurrentUser(),
  paginationOptions: Selector.selectPaginationOptions(),
  studySources: selectStudySources(),
  isAdmin: Selector.selectIsVendorAdmin(),
});

const mapDispatchToProps = (dispatch) => {
  return {
    fetchPatients: (studyId, text, campaignId, sourceId, skip) => dispatch(fetchPatients(studyId, text, campaignId, sourceId, skip)),
    downloadReport: (reportName) => dispatch(downloadReport(reportName)),
    fetchPatientCategories: (studyId) => dispatch(fetchPatientCategories(studyId)),
    fetchStudy: (studyId, sourceId) => dispatch(fetchStudy(studyId, sourceId)),
    fetchStudyStats: (studyId, campaignId, sourceId) => dispatch(fetchStudyStats(studyId, campaignId, sourceId)),
    setStudyId: (id) => dispatch(setStudyId(id)),
    updatePatientSuccess: (patientId, patientCategoryId, payload) => dispatch(updatePatientSuccess(patientId, patientCategoryId, payload)),
    clientOpenedStudyPage: (studyId) => dispatch(clientOpenedStudyPage(studyId)),
    clientClosedStudyPage: (studyId) => dispatch(clientClosedStudyPage(studyId)),
    studyStatsFetched: (payload) => dispatch(studyStatsFetched(payload)),
    studyViewsStatFetched: (payload) => dispatch(studyViewsStatFetched(payload)),
    fetchStudySources: (studyId) => dispatch(fetchStudySources(studyId)),
    toastrActions: bindActionCreators(toastrActions, dispatch),
    fetchClientCredits: (userId) => dispatch(fetchClientCredits(userId)),
  };
};

@connect(mapStateToProps, mapDispatchToProps)
export default class StudyPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    campaigns: PropTypes.array,
    fetchPatients: PropTypes.func.isRequired,
    downloadReport: PropTypes.func.isRequired,
    fetchPatientCategories: PropTypes.func.isRequired,
    fetchingPatientCategories: PropTypes.bool.isRequired,
    fetchingPatients: PropTypes.bool.isRequired,
    fetchStudy: PropTypes.func.isRequired,
    fetchStudyStats: PropTypes.func.isRequired,
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
    updatePatientSuccess: React.PropTypes.func.isRequired,
    fetchStudySources: PropTypes.func.isRequired,
    sitePatients: React.PropTypes.object,
    fetchingPatientsError: PropTypes.object,
    currentUser: PropTypes.object,
    clientOpenedStudyPage: React.PropTypes.func.isRequired,
    clientClosedStudyPage: React.PropTypes.func.isRequired,
    studyStatsFetched: React.PropTypes.func.isRequired,
    studyViewsStatFetched: React.PropTypes.func.isRequired,
    studySources: React.PropTypes.object,
    paginationOptions: React.PropTypes.object,
    patientCategoriesTotals: React.PropTypes.array,
    patientBoardLoading: React.PropTypes.bool,
    toastrActions: React.PropTypes.object.isRequired,
    isAdmin: PropTypes.bool,
    fetchClientCredits: React.PropTypes.func,
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
      isSubscribedToUpdateStats: false,
      messageIds: [],
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    const { params, setStudyId, fetchStudy, fetchPatientCategories, socket, clientOpenedStudyPage, fetchStudySources, currentUser } = this.props;
    setStudyId(parseInt(params.id));
    fetchStudy(params.id);
    fetchPatientCategories(params.id);
    fetchStudySources(params.id);
    this.props.fetchClientCredits(currentUser.id);
    if (socket && socket.connected) {
      this.setState({ isSubscribedToUpdateStats: true }, () => {
        clientOpenedStudyPage(params.id);
      });
    }
  }

  componentWillReceiveProps(newProps) {
    const { params, socket, setStudyId, fetchPatientCategories, clientOpenedStudyPage, studyViewsStatFetched, currentUser } = this.props;
    if (socket && this.state.socketBinded === false) {
      this.setState({ socketBinded: true }, () => {
        socket.on('connect', () => {
          this.setState({ isSubscribedToUpdateStats: true }, () => {
            clientOpenedStudyPage(params.id);
          });
        });

        socket.on('notifyStudyPageMessage', (message) => {
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

          // fetch the new text stats
          // TODO needs to take into account the stats are filtered based on campaign and source selected
          // TODO needs to be able to fetch the redux state without having to resort to hacks
          // TODO right now it cannot access redux state when getting an incoming text or sending an outgoing text
          if (params && parseInt(params.id) === socketMessage.study.id && this.state.messageIds.indexOf(socketMessage.text_message_id) === -1) {
            // check is patients is on the board
            this.state.messageIds.push(socketMessage.text_message_id);
            let needToUpdateMessageStats = false;
            _.forEach(this.props.patientCategories, (category) => { // eslint-disable-line consistent-return
              _.forEach(category.patients, (patient) => { // eslint-disable-line consistent-return
                if (patient.id === socketMessage.patient_id) {
                  needToUpdateMessageStats = true;
                  return false;
                }
              });
              if (needToUpdateMessageStats) {
                return false;
              }
            });
            if (needToUpdateMessageStats) {
              if (socketMessage.twilioTextMessage.direction !== 'inbound') {
                this.props.studyStatsFetched({
                  total: this.props.stats.texts + 1,
                  sent: this.props.stats.textsSent + 1,
                  received: this.props.stats.textsReceived,
                  totalDuration: this.props.stats.callsDuration,
                  views: this.props.stats.views,
                  countReceived: this.props.stats.calls,
                });
              } else {
                this.props.studyStatsFetched({
                  total: this.props.stats.texts + 1,
                  sent: this.props.stats.textsSent,
                  received: this.props.stats.textsReceived + 1,
                  totalDuration: this.props.stats.callsDuration,
                  views: this.props.stats.views,
                  countReceived: this.props.stats.calls,
                });
              }
            }
          }
          if (curCategoryId && socketMessage.twilioTextMessage.direction === 'inbound') {
            this.props.updatePatientSuccess(socketMessage.patient_id, curCategoryId, {
              unreadMessageCount: (unreadMessageCount + 1),
              lastTextMessage: socketMessage.twilioTextMessage,
            });
          } else if (curCategoryId && socketMessage.twilioTextMessage.direction !== 'inbound') {
            this.props.updatePatientSuccess(socketMessage.patient_id, curCategoryId, {
              unreadMessageCount,
              lastTextMessage: socketMessage.twilioTextMessage,
            });
          }
        });


        // TODO fix performance issues just updating the landing page view count, it calls the endpoint to get the overall landing page view count, rather than incrementing
        socket.on('notifyLandingPageViewChanged', (data) => {
          if (data.studyId === parseInt(params.id)) {
            studyViewsStatFetched(data.count);
          }
        });

        socket.on('notifyVendorReportReady', (data) => {
          const authToken = getItem('auth_token');
          if (currentUser.roleForVendor && data.url && currentUser.roleForVendor.id === data.vendorRoleId && authToken === data.authToken) {
            setTimeout(() => { this.props.toastrActions.remove('loadingToasterForExportPatients'); }, 1000);
            location.replace(data.url);
          }
        });
      });
    }

    if (socket && this.state.isSubscribedToUpdateStats === false) {
      this.setState({ isSubscribedToUpdateStats: true }, () => {
        clientOpenedStudyPage(params.id);
      });
    }

    if (params.id !== newProps.params.id) {
      setStudyId(parseInt(newProps.params.id));
      fetchPatientCategories(newProps.params.id);
    }
  }

  componentWillUnmount() {
    const { params, socket, clientClosedStudyPage } = this.props;

    if (socket) {
      if (socket.connected) {
        clientClosedStudyPage(params.id);
      }
      socket.removeAllListeners('notifyStudyPageMessage');
      socket.removeAllListeners('notifyLandingPageViewChanged');
    }
  }

  handleSubmit(searchFilter, loadMore) {
    const { params: { id }, paginationOptions } = this.props;
    const sourceId = searchFilter.source;
    const campaignId = searchFilter.campaignId || searchFilter.campaign;
    let skip = 0;
    if (loadMore) {
      skip = paginationOptions.page * 50;
    }

    if (paginationOptions.hasMoreItems) {
      this.props.fetchPatients(id, searchFilter.text, campaignId, sourceId, skip);
    }
  }

  render() {
    const { fetchingPatientCategories, fetchStudy, fetchStudyStats, fetchingStudy,
      campaigns, patientCategories, protocol, site, sources, study, stats,
      fetchingPatients, params, paginationOptions, patientCategoriesTotals, patientBoardLoading, isAdmin } = this.props;
    const ePMS = study && study.patientMessagingSuite;
    if (fetchingStudy || fetchingPatientCategories) {
      return (
        <LoadingSpinner noMessage />
      );
    } else if (!study || !sources || !campaigns) {
      return (
        <div>{translate('client.page.studyPage.problem')}</div>
      );
    }
    const pageTitle = `${study.name} - StudyKIK`;
    const campaignOptions = campaigns.map(campaign => {
      const dateFrom = campaign.dateFrom ? moment(campaign.dateFrom).tz(site.timezone).format('MM/DD/YYYY') : 'TBD';
      const dateTo = campaign.dateTo ? moment(campaign.dateTo).tz(site.timezone).format('MM/DD/YYYY') : 'TBD';
      return {
        label: `${dateFrom} - ${dateTo}`,
        value: campaign.id,
      };
    });
    campaignOptions.unshift({ label: translate('common.constants.all'), value: -1 });
    const defaultSource = -1;
    const sourceOptions = this.props.studySources.details.filter(s => !s.isMediaType).map(studySource => {
      return {
        label: studySource.source.label,
        value: studySource.source.value,
      };
    });
    sourceOptions.unshift({ label: translate('common.constants.all'), value: -1 });
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

    const totalCountByGroups = {};
    const sourceMapped = this.props.studySources.details.map((studySource) => {
      const isStudySourceNameSet = !!studySource.sourceName;
      const sourceName = studySource.sourceName ? `- ${studySource.sourceName}` : studySource.source.label;
      const group = studySource.source.label;
      if (totalCountByGroups[group]) {
        totalCountByGroups[group]++;
      } else {
        totalCountByGroups[group] = 1;
      }
      return {
        label: sourceName,
        id: studySource.studySourceId,
        studySourceId: studySource.studySourceId,
        group,
        isStudySourceNameSet,
      };
    });
    totalCountByGroups.all = sourceMapped.length;

    return (
      <div className="container-fluid no-padding">
        <Helmet title={pageTitle} />
        <section className="individual-study">
          <header className="main-head">
            <h2 className="main-heading">{study.name}</h2>
            <p>
              <span className="info-cell">{translate('client.page.studyPage.location')} {siteLocation}</span>
              <span className="info-cell">{translate('client.page.studyPage.sponsor')} {sponsor}</span>
              <span className="info-cell">{translate('client.page.studyPage.protocol')} {protocol.number || ''}</span>
            </p>
          </header>
          <FilterStudyPatients
            patientBoardLoading={patientBoardLoading}
            campaignOptions={campaignOptions}
            sourceOptions={sourceOptions}
            fetchStudy={fetchStudy}
            fetchStudyStats={fetchStudyStats}
            ePMS={ePMS}
            studyName={studyName}
            initialValues={{ source: defaultSource }}
            sourceMapped={sourceMapped}
            totalCountByGroups={totalCountByGroups}
          />
          <StudyStats stats={stats} />
          <PatientBoard
            patientCategoriesTotals={patientCategoriesTotals}
            patientCategories={patientCategories}
            fetchingPatients={fetchingPatients}
            site={site}
            params={params}
            ePMS={ePMS}
            loadMore={this.handleSubmit}
            paginationOptions={paginationOptions}
            isAdmin={isAdmin}
          />
        </section>
      </div>
    );
  }
}
