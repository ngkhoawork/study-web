import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import Modal from 'react-bootstrap/lib/Modal';
import { createStructuredSelector } from 'reselect';
import { toastr } from 'react-redux-toastr';
import { touch } from 'redux-form';
import _ from 'lodash';

import CenteredModal from '../../components/CenteredModal/index';
import { fetchIndications, fetchSources, fetchClientSites } from '../../containers/App/actions';
import {
  selectCurrentUser,
  selectSiteLocations,
  selectSources,
  selectIndications,
  selectClientSites,
} from '../App/selectors';
import { selectSyncErrors } from '../../common/selectors/form.selector';
import { selectAddProtocolProcessStatus } from './selectors';

import { exportPatients, emptyRowRequiredError, addProtocol } from './actions';

import UploadPatientsForm from '../../components/UploadPatientsForm/index';
import NewProtocolForm from '../../components/AddNewProtocolForm/index';
import { fields } from '../../components/UploadPatientsForm/validator';
import { normalizePhoneForServer } from '../../common/helper/functions';

const formName = 'UploadPatients.UploadPatientsForm';

export class UploadPatientsPage extends Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    fetchIndications: PropTypes.func,
    fetchClientSites: PropTypes.func,
    fetchSources: PropTypes.func,
    fetchPatients: PropTypes.func,
    addProtocol: PropTypes.func,
    fullSiteLocations: PropTypes.object,
    exportPatients: PropTypes.func,
    currentUser: PropTypes.object.isRequired,
    sites: PropTypes.array,
    indications: PropTypes.array,
    sources: PropTypes.array,
    formSyncErrors: PropTypes.object,
    touchFields: PropTypes.func,
    notifyEmptyRowRequiredError: PropTypes.func,
    formValues: PropTypes.object,
    addProtocolProcess: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      showAddProtocolModal: false,
    };


    this.onSubmitForm = this.onSubmitForm.bind(this);
    this.checkEmptyRequired = this.checkEmptyRequired.bind(this);
    this.addProtocol = this.addProtocol.bind(this);
    this.switchShowAddProtocolModal = this.switchShowAddProtocolModal.bind(this);
  }

  componentWillMount() {
    const { fetchIndications, fetchSources, fetchClientSites, currentUser } = this.props;
    fetchIndications();
    fetchSources();
    fetchClientSites(currentUser.roleForClient.client_id);
  }

  componentWillReceiveProps(newProps) {
    const { addProtocolProcess }  = this.props;
    if (newProps.addProtocolProcess.fetching === false && newProps.addProtocolProcess.fetching !== addProtocolProcess.fetching) {
      this.switchShowAddProtocolModal();
    }
  }

  onSubmitForm(params) {
    const { exportPatients, formSyncErrors, touchFields, notifyEmptyRowRequiredError } = this.props;
    const options = _.clone(params);

    // swap out the "protocol" for the study_id for adding the patient (in reality, we're storing studyId in the protocol field,
    // since it's easier to transform and display this way while still displaying studies by protocol
    if (options.protocol) {
      options.study_id = options.protocol;
    }

    delete options.protocol;
    delete options.groupname;
    delete options.groupemail;
    delete options.groupphone;
    delete options.groupage;
    delete options.groupgender;
    delete options.groupbmi;

    // console.log('fields', fields);

    touchFields();

    if (options.patients && options.patients.length) {
      const hasEmpty = this.checkEmptyRequired(options.patients);
      notifyEmptyRowRequiredError(hasEmpty);

      if (!_.isEmpty(formSyncErrors)) {
        if (formSyncErrors.groupname) {
          toastr.error('', formSyncErrors.groupname);
        } else if (formSyncErrors.groupemail) {
          toastr.error('', formSyncErrors.groupemail);
        } else if (formSyncErrors.groupphone) {
          toastr.error('', formSyncErrors.groupphone);
        }
      } else {
        /* normalizing the phone number */
        _.forEach(options.patients, (patient, index) => {
          if (patient.phone) {
            options.patients[index].phone = normalizePhoneForServer(patient.phone);
          }
        });

        if (!hasEmpty) {
          exportPatients(options);
        }
      }
    } else {
      toastr.error('', 'Error! There are no patients to be added.');
    }
  }

  checkEmptyRequired(patients) {
    let empty = false;
    _.forEach(patients, (patient) => {
      const hasName = _.hasIn(patient, 'name');
      const hasEmail = _.hasIn(patient, 'email');
      const hasPhone = _.hasIn(patient, 'phone');

      if (!hasName || !patient.name || !hasEmail || !patient.email || !hasPhone || !patient.phone) {
        empty = true;
      }
    });

    return empty;
  }

  addProtocol(err, data) {
    const { fullSiteLocations, indications, currentUser, addProtocol } = this.props;
    if (!err) {
      const siteLocation = _.find(fullSiteLocations.details, { id: data.siteLocation });
      const indication = _.find(indications, { id: data.indication_id });

      const params = {
        ...data,
        siteLocationName: siteLocation.name,
        indicationName: indication.name,
        user_id: currentUser.id,
        currentUser,
        client_id: currentUser.roleForClient.client_id,
        stripeCustomerId: currentUser.roleForClient.client.stripeCustomerId,
      };
      params.recruitmentPhone = normalizePhoneForServer(data.recruitmentPhone);
      addProtocol(params);
    }
  }

  switchShowAddProtocolModal() {
    this.setState({ showAddProtocolModal: !this.state.showAddProtocolModal });
  }

  render() {
    const { indications, fullSiteLocations } = this.props;

    return (
      <div className="container-fluid">
        <section className="patient-upload">
          <Helmet title="Patient Database - StudyKIK" />
          <h2 className="main-heading">Upload Patients</h2>

          <UploadPatientsForm onSubmit={this.onSubmitForm} showProtocolModal={this.switchShowAddProtocolModal} />
        </section>
        <Modal dialogComponentClass={CenteredModal} show={this.state.showAddProtocolModal} onHide={this.switchShowAddProtocolModal}>
          <Modal.Header>
            <Modal.Title>ADD NEW PROTOCOL</Modal.Title>
            <a className="lightbox-close close" onClick={this.switchShowAddProtocolModal}>
              <i className="icomoon-icon_close" />
            </a>
          </Modal.Header>
          <Modal.Body>
            <NewProtocolForm
              onSubmit={this.addProtocol}
              fullSiteLocations={fullSiteLocations}
              indications={indications}
            />
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  currentUser: selectCurrentUser(),
  sites: selectSiteLocations(),
  indications: selectIndications(),
  sources: selectSources(),
  formSyncErrors: selectSyncErrors(formName),
  fullSiteLocations : selectClientSites(),
  addProtocolProcess: selectAddProtocolProcessStatus(),
});

function mapDispatchToProps(dispatch) {
  return {
    touchFields: () => dispatch(touch(formName, ...fields)),
    fetchIndications: () => dispatch(fetchIndications()),
    addProtocol: (payload) => dispatch(addProtocol(payload)),
    fetchSources: () => dispatch(fetchSources()),
    notifyEmptyRowRequiredError: (hasEmpty) => dispatch(emptyRowRequiredError(hasEmpty)),
    fetchClientSites: (clientId) => dispatch(fetchClientSites(clientId)),
    exportPatients: (params) => dispatch(exportPatients(params)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UploadPatientsPage);
