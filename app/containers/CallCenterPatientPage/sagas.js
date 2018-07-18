import { takeLatest } from 'redux-saga';
import { take, call, put, fork, cancel } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'react-router-redux';
import { get } from 'lodash';
import { toastr } from 'react-redux-toastr';

import request from '../../utils/request';
import { getItem, removeItem } from '../../utils/localStorage';
import { translate } from '../../../common/utilities/localization';

import { SEND_PATIENT_MESSAGES } from '../GlobalNotifications/constants';
import {
  FETCH_CALL_CENTER_PATIENT_CATEGORIES,
  FETCH_PATIENT,
  SUBMIT_PATIENT_UPDATE,
  SUBMIT_PATIENT_NOTE,
  SUBMIT_DELETE_NOTE,
  SUBMIT_EMAIL,
  SUBMIT_PATIENT_DISPOSITION,
  READ_STUDY_PATIENT_MESSAGES,
  SUBMIT_PATIENT_SCHEDULE,
  FETCH_SCHEDULES,
} from './constants';

import {
  patientFetched,
  patientFetchingError,
  callCenterPatientCategoriesFetched,
  callCenterPatientCategoriesFetchingError,
  deletePatientNoteSuccess,
  addPatientNoteSuccess,
  submitEmailSuccess,
  patientDispositionSubmitted,
  patientDispositionSubmissionError,
  readStudyPatientMessagesSuccess,
  readStudyPatientMessagesError,
  patientScheduleSubmitted,
  schedulesFetched,
  schedulesFetchingError,
} from './actions';

import {
  sendPatientMessagesSuccess,
} from '../GlobalNotifications/actions';

export function* fetchPatientWatcher() {
  while (true) {
    const { id } = yield take(FETCH_PATIENT);

    try {
      const filter = JSON.stringify({
        include: [
          {
            relation: 'site',
          },
          {
            relation: 'dispositions',
          },
          {
            relation: 'patientIndications',
            scope: {
              include: ['indication'],
            },
          },
          {
            relation: 'notes',
            scope: {
              fields: ['id', 'note', 'createdAt', 'user_id'],
              include: [
                {
                  relation: 'user',
                  scope: {
                    fields: ['id', 'firstName', 'lastName', 'profileImageURL'],
                    include: 'roleForClient',
                  },
                },
              ],
            },
          },
          {
            studySource: 'source',
          },
          {
            studyPatientCategory: [
              'patientCategory',
              'study',
            ],
          },
          {
            relation: 'textMessages',
            scope: {
              fields: ['id', 'note', 'createdAt', 'text_message_id', 'user_id'],
              include: [
                {
                  relation: 'twilioTextMessage',
                },
                {
                  relation: 'user',
                  scope: {
                    fields: ['id', 'firstName', 'lastName', 'profileImageURL'],
                  },
                },
              ],
            },
          },
          {
            relation: 'callRecords',
            scope: {
              fields: ['id', 'note', 'createdAt', 'call_record_id', 'user_id'],
              include: [
                {
                  relation: 'twilioCallRecord',
                },
              ],
            },
          },
          {
            relation: 'appointments',
            scope: {
              fields: ['time'],
            },
          },
        ],
      });
      const requestURL = `${API_URL}/patients/${id}?filter=${filter}`;
      const response = yield call(request, requestURL);
      response.textMessages = response.textMessages.map(textMessage => {
        const mappedTextMessage = {
          ...textMessage,
          ...textMessage.twilioTextMessage,
        };
        delete mappedTextMessage.twilioTextMessage;
        delete mappedTextMessage.text_message_id;
        delete mappedTextMessage.user_id;
        return mappedTextMessage;
      });
      if (response.source) {
        response.source = response.source.id;
      }
      yield put(patientFetched(response));
    } catch (err) {
      yield put(patientFetchingError(err));
      console.error(err);
    }
  }
}

function* fetchCallCenterPatientCategoriesWatcher() {
  while (true) {
    yield take(FETCH_CALL_CENTER_PATIENT_CATEGORIES);

    try {
      const options = {
        method: 'GET',
        query: {
          filter: JSON.stringify({
            fields: ['name', 'id'],
            order: 'id ASC',
          }),
        },
      };
      const requestURL = `${API_URL}/callCenterPatientCategories`;
      const response = yield call(request, requestURL, options);
      yield put(callCenterPatientCategoriesFetched(response));
    } catch (err) {
      yield put(callCenterPatientCategoriesFetchingError(err));
    }
  }
}

function* submitPatientNote() {
  while (true) {
    // listen for the SUBMIT_PATIENT_NOTE action
    const { patientId, studyId, currentUser, note } = yield take(SUBMIT_PATIENT_NOTE);
    const authToken = getItem('auth_token');
    if (!authToken) {
      return;
    }

    try {
      const requestURL = `${API_URL}/patients/${patientId}/notes`;
      const response = yield call(request, requestURL, {
        method: 'POST',
        body: JSON.stringify({
          study_id: studyId,
          isProxy: currentUser.isProxy,
          note,
        }),
      });
      yield put(addPatientNoteSuccess(currentUser, response));
    } catch (e) {
      const errorMessage = get(e, 'message', translate('client.page.studyPage.toastrAddingNoteErrorMessage'));
      toastr.error('', errorMessage);
      if (e.status === 401) {
        yield call(() => { location.href = '/login'; });
      }
    }
  }
}

function* submitEmail() {
  while (true) {
    // listen for the SUBMIT_EMAIL action
    const { studyId, patientId, currentUser, email, message, subject } = yield take(SUBMIT_EMAIL);
    const authToken = getItem('auth_token');
    if (!authToken) {
      return;
    }

    try {
      const requestURL = `${API_URL}/patients/${patientId}/emailSend`;
      const response = yield call(request, requestURL, {
        method: 'POST',
        body: JSON.stringify({
          study_id: studyId,
          patientId,
          email,
          userId: currentUser.id,
          message,
          subject,
          isCallCenter: true,
        }),
      });
      yield put(submitEmailSuccess(response));
      toastr.success('', translate('client.page.studyPage.toastrEmailSuccessMessage'));
    } catch (e) {
      const errorMessage = get(e, 'message', translate('client.page.studyPage.toastrSandingEmailErrorMessage'));
      toastr.error('', errorMessage);
      if (e.status === 401) {
        yield call(() => { location.href = '/login'; });
      }
    }
  }
}

function* submitDeleteNote() {
  while (true) {
    // listen for the SUBMIT_DELETE_NOTE action
    const { patientId, noteId } = yield take(SUBMIT_DELETE_NOTE);
    const authToken = getItem('auth_token');
    if (!authToken) {
      return;
    }

    try {
      const requestURL = `${API_URL}/patients/${patientId}/notes/${noteId}`;
      yield call(request, requestURL, {
        method: 'DELETE',
      });
      yield put(deletePatientNoteSuccess(noteId));
    } catch (e) {
      const errorMessage = get(e, 'message', translate('client.page.studyPage.toastrAddingNoneErrorMessage'));
      toastr.error('', errorMessage);
      if (e.status === 401) {
        yield call(() => { location.href = '/login'; });
      }
    }
  }
}

function* submitPatientUpdate() {
  while (true) {
    // listen for the SUBMIT_PATIENT_UPDATE action
    const { payload: { patientId, callCenterPatientCategoryId, patientCategoryId } } = yield take(SUBMIT_PATIENT_UPDATE);
    const authToken = getItem('auth_token');
    if (!authToken) {
      return;
    }

    try {
      // Update call center patient category
      let requestURL = `${API_URL}/patients/updateCallCenterCategory`;
      yield call(request, requestURL, {
        method: 'POST',
        body: JSON.stringify({
          patientId,
          callCenterPatientCategoryId,
        }),
      });

      // Update patient category
      requestURL = `${API_URL}/patients/updateCategory`;
      yield call(request, requestURL, {
        method: 'POST',
        body: JSON.stringify({
          studyId: null,
          patientId,
          patientCategoryId,
          afterPatientId: null,
        }),
      });

      toastr.success('', translate('container.page.callCenterPatient.toastr.success.updatePatient'));
    } catch (e) {
      let errorMessage = get(e, 'message', translate('client.page.studyPage.toastrUpdatingErrorMessage'));
      if (errorMessage.includes('email')) {
        errorMessage = translate('client.page.studyPage.toastrEmailOnFileErrorMessage');
      } else if (errorMessage.includes('phone')) {
        errorMessage = translate('client.page.studyPage.toastrPhoneOnFileErrorMessage');
      }
      toastr.error('', errorMessage);
    }
  }
}


function* submitPatientSchedule() {
  while (true) {
    // listen for the SUBMIT_PATIENT_UPDATE action
    const { payload: { patientId, isDelete, time } } = yield take(SUBMIT_PATIENT_SCHEDULE);

    console.log('@@@@@@@@@@@@@saga', patientId, isDelete, time);
    const authToken = getItem('auth_token');
    if (!authToken) {
      return;
    }

    try {
      // update or create appointment
      const requestURL = `${API_URL}/callCenterAppointments`;
      let method = 'PATCH';
      if (isDelete) {
        method = 'DELETE';
      }

      const response = yield call(request, requestURL, {
        method,
        body: JSON.stringify({
          patient_id: patientId,
          time,
        }),
      });


      yield put(patientScheduleSubmitted(response, isDelete));
      toastr.success('', translate('container.page.callCenterPatient.toastr.success.updatePatient'));
    } catch (e) {
      let errorMessage = get(e, 'message', translate('client.page.studyPage.toastrUpdatingErrorMessage'));
      if (errorMessage.includes('email')) {
        errorMessage = translate('client.page.studyPage.toastrEmailOnFileErrorMessage');
      } else if (errorMessage.includes('phone')) {
        errorMessage = translate('client.page.studyPage.toastrPhoneOnFileErrorMessage');
      }
      toastr.error('', errorMessage);
    }
  }
}

function* submitPatientDisposition() {
  while (true) {
    const { payload: { patientId, dispositionKey } } = yield take(SUBMIT_PATIENT_DISPOSITION);
    const authToken = getItem('auth_token');
    if (!authToken) {
      return;
    }

    try {
      const requestURL = `${API_URL}/patientDispositions/updatePatientDisposition`;
      yield call(request, requestURL, {
        method: 'POST',
        body: JSON.stringify({
          patientId,
          dispositionKey,
        }),
      });
      yield put(patientDispositionSubmitted());
    } catch (e) {
      yield put(patientDispositionSubmissionError());
      toastr.error('', e.message);
    }
  }
}

function* sendPatientMessagesWatcher() {
  yield* takeLatest(SEND_PATIENT_MESSAGES, sendPatientMessagesWorker);
}

function* sendPatientMessagesWorker(action) {
  try {
    const { patientId } = action.payload;
    if (patientId && patientId > 0) {
      const requestURL = `${API_URL}/twilioTextMessages/saveTwilioTextMessages`;
      const options = {
        method: 'POST',
        body: JSON.stringify(action.payload),
      };
      const response = yield call(request, requestURL, options);

      yield put(sendPatientMessagesSuccess(response));
    }
  } catch (err) {
    toastr.error('', err.message);
    if (err.status === 401) {
      removeItem('auth_token');
      yield call(() => { location.href = '/login'; });
    }
  }
}

function* readStudyPatientMessagesWatcher() {
  yield* takeLatest(READ_STUDY_PATIENT_MESSAGES, readStudyPatientMessagesWorker);
}

function* readStudyPatientMessagesWorker(action) {
  try {
    const { patientId } = action;
    if (patientId && patientId > 0) {
      const requestURL = `${API_URL}/patients/${patientId}/markMessagesAsRead`;
      const response = yield call(request, requestURL);

      yield put(readStudyPatientMessagesSuccess(response));
    } else {
      yield put(readStudyPatientMessagesSuccess([]));
    }
  } catch (err) {
    yield put(readStudyPatientMessagesError(err));
    if (err.status === 401) {
      removeItem('auth_token');
      yield call(() => { location.href = '/login'; });
    }
  }
}

export function* fetchSchedulesWatcher() {
  while (true) {
    yield take(FETCH_SCHEDULES);
    try {
      const requestURL = `${API_URL}/callCenterAppointments/getAppointmentsForUser`;
      const response = yield call(request, requestURL);

      yield put(schedulesFetched(response));
    } catch (err) {
      const errorMessage = get(err, 'message', 'Something went wrong while fetching schedules.');
      toastr.error('', errorMessage);
      yield put(schedulesFetchingError(err));
      if (err.status === 401) {
        removeItem('auth_token');
        yield call(() => { location.href = '/login'; });
      }
    }
  }
}

export function* callCenterPatientPageSaga() {
  try {
    const watcherA = yield fork(fetchPatientWatcher);
    const watcherB = yield fork(submitPatientNote);
    const watcherC = yield fork(submitDeleteNote);
    const watcherD = yield fork(submitEmail);
    const watcherE = yield fork(fetchCallCenterPatientCategoriesWatcher);
    const watcherF = yield fork(submitPatientUpdate);
    const watcherG = yield fork(submitPatientDisposition);
    const watcherH = yield fork(sendPatientMessagesWatcher);
    const watcherI = yield fork(readStudyPatientMessagesWatcher);
    const watcherJ = yield fork(submitPatientSchedule);
    const watcherK = yield fork(fetchSchedulesWatcher);

    yield take(LOCATION_CHANGE);

    yield cancel(watcherA);
    yield cancel(watcherB);
    yield cancel(watcherC);
    yield cancel(watcherD);
    yield cancel(watcherE);
    yield cancel(watcherF);
    yield cancel(watcherG);
    yield cancel(watcherH);
    yield cancel(watcherI);
    yield cancel(watcherJ);
    yield cancel(watcherK);
  } catch (e) {
    // if returns forbidden we remove the token from local storage
    if (e.status === 401) {
      removeItem('auth_token');
    }
  }
}

// Bootstrap sagas
export default [
  callCenterPatientPageSaga,
];
