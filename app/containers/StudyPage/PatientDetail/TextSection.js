/**
 * Created by mike on 10/18/16.
 */

import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import Button from 'react-bootstrap/lib/Button';
import { submitPatientText } from '../actions';

import {
  sendStudyPatientMessages,
  fetchStudyPatientMessages,
  setProcessingStatus,
} from 'containers/GlobalNotifications/actions';

import PatientText from './PatientText';

const formName = 'PatientDetailSection.Text';

@reduxForm({
  form: formName,
})
class TextSection extends React.Component {
  static propTypes = {
    active: React.PropTypes.bool.isRequired,
    currentPatient: React.PropTypes.object,
    currentUser: React.PropTypes.object,
    submitPatientText: React.PropTypes.func.isRequired,
    fetchStudyPatientMessages: React.PropTypes.func,
    sendStudyPatientMessages: React.PropTypes.func,
    setProcessingStatus: React.PropTypes.func,
    socket: React.PropTypes.any,
    studyId: React.PropTypes.any,
  };

  constructor(props) {
    super(props);
    this.renderText = this.renderText.bind(this);
    this.submitText = this.submitText.bind(this);
    this.initStudyPatientMessagesFetch = this.initStudyPatientMessagesFetch.bind(this);

    this.state = {
      twilioMessages : [],
    };
  }

  componentDidMount() {
  }

  componentWillReceiveProps(newProps) {
    if (newProps.active && newProps.currentPatient) {
      this.initStudyPatientMessagesFetch(newProps);
    }

    this.props.socket.on('notifyMessage', () => {
      this.initStudyPatientMessagesFetch(newProps);
    });
  }

  initStudyPatientMessagesFetch(props) {
    if (props.currentPatient) {
      // otherwise method componentWillReceiveProps
      // receiving data with a missing property currentPatient
      // which leads to an error
      props.fetchStudyPatientMessages({
        studyId: props.studyId,
        patientId: props.currentPatient.id,
        cb: (err, data) => {
          if (!err) {
            if (this.state.twilioMessages !== data.messages) {
              this.setState({ twilioMessages: data.messages });
            }
          } else {
            console.log(err);
          }
          this.props.setProcessingStatus({ status: false });
        },
      });
    }
  }

  scrollElement() {
    const scope = this;
    window.requestAnimationFrame(() => {
      const scrollable = scope.scrollable;
      if (scrollable && scope.props.active) {
        scrollable.scrollTop = scrollable.scrollHeight;
      }
    });
  }

  submitText() {
    const { currentUser, currentPatient, studyId } = this.props;
    const textarea = this.textarea;
    const options = {
      studyId: studyId,
      currentUserId: currentUser.id,
      patientId: currentPatient.id,
      body: textarea.value,
      to: currentPatient.phone,
    };

    this.props.sendStudyPatientMessages(options, (err) => {
      if (!err) {
        textarea.value = '';
      }
    });
  }

  renderText() {
    const { currentUser, currentPatient } = this.props;
    const { twilioMessages } = this.state;
    if (currentPatient && twilioMessages.length) {
      return (
        <section
          className="postarea text"
          ref={(scrollable) => {
            this.scrollable = scrollable;
          }}
        >
          {twilioMessages.map(twilioMessage => (
            <PatientText
              key={twilioMessage.id}
              currentPatient={currentPatient}
              currentUser={currentUser}
              textMessage={twilioMessage.twilioTextMessage}
            />
          ))}
        </section>
      );
    }
    return null;
  }

  render() {
    const { active } = this.props;
    this.scrollElement();
    return (
      <div className={classNames('item text', { active })}>
        {this.renderText()}
        <div className="textarea">
          <textarea
            className="form-control"
            placeholder="Type a message..."
            ref={(textarea) => {
              this.textarea = textarea;
            }}
          />
          <Button onClick={this.submitText}>Send</Button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = () => ({
});

const mapDispatchToProps = (dispatch) => ({
  submitPatientText: (text) => dispatch(submitPatientText(text)),
  sendStudyPatientMessages: (payload, cb) => dispatch(sendStudyPatientMessages(payload, cb)),
  fetchStudyPatientMessages: (payload) => dispatch(fetchStudyPatientMessages(payload)),
  setProcessingStatus: (payload) => dispatch(setProcessingStatus(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TextSection);
