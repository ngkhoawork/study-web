/**
*
* ChatFrom
*
*/

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Field, reduxForm, reset } from 'redux-form';
import Form from 'react-bootstrap/lib/Form';
import Button from 'react-bootstrap/lib/Button';
import Input from 'components/Input';

import formValidator from './validator';

import { setProcessingStatus } from 'containers/GlobalNotifications/actions';
import {
  selectProcessingStatus,
} from 'containers/GlobalNotifications/selectors';

import './styles.less';

const formName = 'chatPatient';

@reduxForm({ form: formName, validate: formValidator })

class ChatForm extends Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    isSaving: PropTypes.any,
    setProcessingStatus: PropTypes.func,
    handleSubmit: PropTypes.func,
    selectedPatient: PropTypes.object,
    sendStudyPatientMessages: PropTypes.func,
    reset: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.sendMessage = this.sendMessage.bind(this);
  }

  sendMessage(message) {
    const { selectedPatient, sendStudyPatientMessages, reset } = this.props;
    const options = {
      body: message.body,
      studyId: selectedPatient.study_id,
      patientId: selectedPatient.id,
      to: selectedPatient.phone,
    };

    sendStudyPatientMessages(options, (err, data) => {
      if (!err) {
        console.log('data', data);
      }
    });
    reset();
  }

  render() {
    const { handleSubmit } = this.props;
    return (
      <Form onSubmit={handleSubmit(this.sendMessage)}>
        <fieldset>
          <Field
            name="body"
            component={Input}
            componentClass="textarea"
            placeholder="Type a message..."
          />
          <Button type="submit">
            Send
          </Button>
        </fieldset>
      </Form>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  isSaving: selectProcessingStatus(),
});

function mapDispatchToProps(dispatch) {
  return {
    setProcessingStatus: (payload) => dispatch(setProcessingStatus(payload)),
    reset: () => dispatch(reset(formName)),
  };
}

// export default ChatForm;

export default connect(mapStateToProps, mapDispatchToProps)(ChatForm);
