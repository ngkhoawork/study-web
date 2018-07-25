/**
 * Call Center Homepage
 *
 */

import { map } from 'lodash';
import React, { Component, PropTypes } from 'react';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import moment from 'moment-timezone';

import { fetchIndications } from '../../containers/App/actions';
import { selectIndications, selectCurrentUser } from '../App/selectors';

import { fetchPatients, fetchSchedules, searchForPatients } from './actions';
import { selectFetchedPatients, selectSchedules } from './selectors';

import CenteredModal from '../../../common/components/CenteredModal';
import { normalizePhoneForServer } from '../../../common/utilities/helpers/functions';
import { translate } from '../../../common/utilities/localization';
import CallCenterSearchForm from './CallCenterSearchForm/index';
import FiltersForm from './FiltersForm/index';
import CallCenterPatientListModal from './CallCenterPatientListModal/index';

import CallDiv from './CallDiv/';
import CallCalendar from './CallCalendar/';

import './style.less';

const mapStateToProps = createStructuredSelector({
  currentUser: selectCurrentUser(),
  patients: selectFetchedPatients(),
  indications: selectIndications(),
  schedules: selectSchedules(),
});

const mapDispatchToProps = (dispatch) => {
  return {
    fetchIndications: () => dispatch(fetchIndications()),
    fetchPatients: (userId) => dispatch(fetchPatients(userId)),
    searchForPatients: (phone) => dispatch(searchForPatients(phone)),
    fetchSchedules: () => dispatch(fetchSchedules()),
  };
};

@connect(mapStateToProps, mapDispatchToProps)
export default class CallCenterHomePage extends Component {

  static propTypes = {
    currentUser: PropTypes.object.isRequired,
    fetchIndications: PropTypes.func.isRequired,
    fetchPatients: PropTypes.func.isRequired,
    fetchSchedules: PropTypes.func.isRequired,
    patients: PropTypes.array,
    searchForPatients: PropTypes.func.isRequired,
    indications: PropTypes.array,
    schedules: PropTypes.object,
  };

  state = {
    addUserModalOpen: false,
  };

  componentDidMount() {
    const { currentUser, fetchIndications, fetchPatients, fetchSchedules } = this.props;
    fetchIndications();
    fetchPatients(currentUser.id);
    fetchSchedules();
  }

  openFiltersModal() {
    this.setState({ addUserModalOpen: true });
  }

  closeFiltersModal() {
    this.setState({ addUserModalOpen: false });
  }

  handleSearch = (data) => {
    const { searchForPatients } = this.props;
    const phone = normalizePhoneForServer(data.phone);
    searchForPatients(phone);
  };

  render() {
    const { patients, indications, currentUser, schedules } = this.props;

    const siteOptions = map([], siteIterator => ({ label: siteIterator.name, value: siteIterator.id.toString() }));
    siteOptions.unshift({ label: 'All', value: '0' });

    let unreadMessages = 0;
    let meetingCount = 0;

    if (schedules && schedules.data) {
      schedules.data.forEach((schedule) => {
        const { time } = schedule;
        meetingCount += (moment.tz(time, currentUser.timezone).format('Y-MM-D') === moment().format('Y-MM-D')) ? 1 : 0;
      });
    }

    patients.forEach((patient) => {
      unreadMessages += patient.count_unread ? parseInt(patient.count_unread) : 0;
    });

    return (
      <div className="container-fluid" id="callcentermain">
        <div className="search-area">
          <div className="field">
            <Button bsStyle="primary" onClick={(e) => this.openFiltersModal(e)}>
              {translate('container.page.callcenter.btn.filters')}
            </Button>
          </div>
          <Modal dialogComponentClass={CenteredModal} className="filter-modal" id="filter-modal" show={this.state.addUserModalOpen} onHide={this.closeFiltersModal}>
            <Modal.Header>
              <Modal.Title>{translate('container.page.callcenter.btn.filters')}</Modal.Title>
              <a className="lightbox-close close" onClick={(e) => this.closeFiltersModal(e)}>
                <i className="icomoon-icon_close" />
              </a>
            </Modal.Header>
            <Modal.Body>
              <div className="holder clearfix">
                <div className="form-lightbox">
                  <FiltersForm />
                </div>
              </div>
            </Modal.Body>
          </Modal>
          <CallCenterSearchForm onSubmit={this.handleSearch} />
          <CallCenterPatientListModal />
        </div>

        <div className="cc-article">
          <div className="col-xs-4 ccDiv-txt">
            <div className="ccDiv-content">
              <div className="cc-heading-text">
                {translate('container.page.callcenter.heading.texts')}
              </div>
              <div className="cc-heading-value">
                {unreadMessages}
              </div>
            </div>
          </div>
          <div className="col-xs-4 ccDiv-rot">
            <div className="ccDiv-content">
              <div className="cc-heading-text">
                {translate('container.page.callcenter.heading.rottings')}
              </div>
              <div className="cc-heading-value">
                &nbsp;
              </div>
            </div>
          </div>
          <div className="col-xs-4 ccDiv-sch">
            <div className="ccDiv-content">
              <div className="cc-heading-text">
                {translate('container.page.callcenter.heading.meetings')}
              </div>
              <div className="cc-heading-value">
                {meetingCount}
              </div>
            </div>
          </div>
        </div>

        <div className="content">
          <CallDiv patients={patients} indications={indications} timezone={currentUser.timezone} />
          <CallCalendar currentUser={currentUser} schedules={schedules && schedules.data} />
        </div>
      </div>
    );
  }
}
