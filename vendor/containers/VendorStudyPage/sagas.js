/**
 * Created by mike on 9/23/16.
 */
import React from 'react';
import FileSaver from 'file-saver';
import { call, fork, put, take, cancel } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'react-router-redux';
import { takeLatest } from 'redux-saga';
import { actions as toastrActions, toastr } from 'react-redux-toastr';
import FaSpinner from 'react-icons/lib/fa/spinner';
import { get } from 'lodash';
import moment from 'moment-timezone';
import request from '../../utils/request';
import composeQueryString from '../../utils/composeQueryString';
import { getItem, removeItem } from '../../utils/localStorage';
import { translate } from '../../../common/utilities/localization';
import {
  VENDOR_FIND_PATIENTS_TEXT_BLAST,
  VENDOR_FETCH_PATIENTS,
  VENDOR_FETCH_PATIENT_DETAILS,
  VENDOR_FETCH_PATIENT_CATEGORIES,
  VENDOR_FETCH_STUDY,
  VENDOR_FETCH_STUDY_STATS,
  VENDOR_ADD_PATIENT_INDICATION,
  VENDOR_REMOVE_PATIENT_INDICATION,
  VENDOR_SUBMIT_PATIENT_UPDATE,
  VENDOR_SUBMIT_PATIENT_IMPORT,
  VENDOR_SUBMIT_ADD_PATIENT,
  VENDOR_SUBMIT_PATIENT_NOTE,
  VENDOR_SUBMIT_DELETE_NOTE,
  VENDOR_SUBMIT_MOVE_PATIENT_BETWEEN_CATEGORIES,
  VENDOR_SUBMIT_SCHEDULE,
  VENDOR_DELETE_PATIENT,
  VENDOR_DOWNLOAD_CLIENT_REPORT,
  VENDOR_GENERATE_PATIENT_REFERRAL,
  VENDOR_DOWNLOAD_PATIENT_REFERRAL,
  VENDOR_SUBMIT_EMAIL,
  VENDOR_FETCH_EMAILS,
  VENDOR_FETCH_PATIENT_CATEGORIES_TOTALS,
} from './constants';

import {
  addPatientsToTextBlast,
  campaignsFetched,
  deletePatientNoteSuccess,
  findPatientsForTextBlastSuccess,
  patientCategoriesFetched,
  patientsFetched,
  patientsFetchedError,
  patientDetailsFetched,
  protocolFetched,
  siteFetched,
  studyFetched,
  studyViewsStatFetched,
  submitAddPatientSuccess,
  submitAddPatientFailure,
  studyStatsFetched,
  addPatientIndicationSuccess,
  removePatientIndicationSuccess,
  updatePatientSuccess,
  addPatientNoteSuccess,
  movePatientBetweenCategoriesLoading,
  movePatientBetweenCategoriesSuccess,
  movePatientBetweenCategoriesFailed,
  submitScheduleSucceeded,
  submitScheduleFailed,
  deletePatientSuccess,
  deletePatientError,
  submitEmailSuccess,
  emailsFetched,
  emailsFetchError,
  fetchEmails,
  patientCategoriesTotalsFetched,
} from './actions';

// Bootstrap sagas
export default [
  fetchStudySaga,
];

function* fetchStudyDetails() {
  const authToken = getItem('auth_token');
  if (!authToken) {
    return;
  }

  // listen for the FETCH_STUDY action
  const { studyId } = yield take(VENDOR_FETCH_STUDY);

  // put the fetching study action in case of a navigation action
  const filter = JSON.stringify({
    include: [
      {
        relation: 'campaigns',
        scope: {
          order: 'orderNumber DESC',
        },
      },
      {
        relation: 'protocol',
      },
      {
        relation: 'site',
      },
      {
        relation: 'sources',
      },
      {
        relation: 'sponsor',
      },
      {
        relation: 'indication',
      },
    ],
  });
  try {
    const requestURL = `${API_URL}/studies/${studyId}?filter=${filter}`;
    const response = yield call(request, requestURL, {
      method: 'GET',
    });
    // populate the campaigns and sources from the study
    yield put(campaignsFetched(response.campaigns));
    yield put(protocolFetched(response.protocol));
    yield put(siteFetched(response.site));
    delete response.campaigns;
    delete response.protocol;
    delete response.site;
    delete response.sources;
    // put in the study in the state
    yield put(studyFetched(response));
  } catch (e) {
    if (e.status === 404) {
      yield call(() => { location.href = '/app/notfound'; });
    } else {
      const errorMessage = get(e, 'message', translate('client.page.studyPage.toastrFetchStudyErrorMessage'));
      toastr.error('', errorMessage);
      if (e.status === 401) {
        yield call(() => { location.href = '/login'; });
      }
    }
  }
}

function* fetchStudyViewsStat(action) { // eslint-disable-line
  const authToken = getItem('auth_token');
  if (!authToken) {
    return;
  }

  // listen for the latest FETCH_STUDY action
  const { studyId, text, campaignId, sourceId } = action;

  try {
    const options = {
      method: 'GET',
    };
    if (text || campaignId || sourceId) {
      options.query = {};
    }
    if (campaignId) {
      options.query.campaignId = campaignId;
    }
    if (sourceId) {
      options.query.sourceIds = JSON.stringify(sourceId);
    }
    if (text) {
      options.query.text = text;
    }
    const requestURL = `${API_URL}/studies/${studyId}/landingPageViews`;
    const response = yield call(request, requestURL, options);
    yield put(studyViewsStatFetched(response));
  } catch (e) {
    const errorMessage = get(e, 'message', 'Something went wrong while fetching study view stats. Please try again later.');
    toastr.error('', errorMessage);
    if (e.status === 401) {
      yield call(() => { location.href = '/login'; });
    }
  }
}

// TODO re-enable when optimized for high traffic
/* function* fetchStudyCallStats(action) {
  const authToken = getItem('auth_token');
  if (!authToken) {
    return;
  }

  // listen for the latest FETCH_STUDY or FETCH_STUDY_STATS action
  const { studyId, campaignId, sourceId } = action;

  try {
    const requestURL = `${API_URL}/twilioCallRecords/countStudyCallRecords/${studyId}`;
    const options = {
      method: 'GET',
    };
    if (campaignId || sourceId) {
      options.query = {};
    }
    if (campaignId) {
      options.query.campaignId = campaignId;
    }
    if (sourceId) {
      options.query.sourceId = sourceId;
    }
    const response = yield call(request, requestURL, options);
    yield put(callStatsFetched(response));
  } catch (e) {
    const errorMessage = get(e, 'message', 'Something went wrong while fetching call stats. Please try again later.');
    toastr.error('', errorMessage);
    if (e.status === 401) {
      yield call(() => { location.href = '/login'; });
    }
  }
} */

function* fetchStudyStats(action) {
  const authToken = getItem('auth_token');

  if (!authToken) {
    return;
  }
  // listen for the latest FETCH_STUDY action
  const { studyId, campaignId, sourceId } = action;

  try {
    const requestURL = `${API_URL}/studies/${studyId}/stats/count`;
    const options = {
      method: 'GET',
    };
    if (campaignId || sourceId) {
      options.query = {};
    }
    if (campaignId) {
      options.query.campaignId = campaignId;
    }
    if (sourceId) {
      options.query.sourceId = sourceId;
    }
    const response = yield call(request, requestURL, options);
    yield put(studyStatsFetched(response));
  } catch (e) {
    if (e.status === 401) {
      yield call(() => { location.href = '/login'; });
    }
  }
}

function* fetchPatientCategoriesTotals(action) {
  const authToken = getItem('auth_token');
  if (!authToken) {
    return;
  }
  // listen for the latest FETCH_STUDY action
  const { studyId, campaignId, sourceId } = action;

  try {
    const requestURL = `${API_URL}/studies/${studyId}/patientCategoriesTotals`;
    const options = {
      method: 'GET',
    };
    if (campaignId || sourceId) {
      options.query = {};
    }
    if (campaignId) {
      options.query.campaignId = campaignId;
    }
    if (sourceId) {
      options.query.sourceId = sourceId;
    }
    const response = yield call(request, requestURL, options);
    yield put(patientCategoriesTotalsFetched(response));
  } catch (e) {
    if (e.status === 401) {
      yield call(() => { location.href = '/login'; });
    }
  }
}

function* fetchPatientCategories() {
  const authToken = getItem('auth_token');
  if (!authToken) {
    return;
  }

  // listen for the FETCH_PATIENT_CATEGORIES action
  const { studyId } = yield take(VENDOR_FETCH_PATIENT_CATEGORIES);

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
    const requestURL = `${API_URL}/patientCategories`;
    const response = yield call(request, requestURL, options);
    // populate the patient categories
    yield put(patientCategoriesFetched(response));
    yield call(fetchPatients, studyId, null, null, 1);
  } catch (e) {
    const errorMessage = get(e, 'message', translate('client.page.studyPage.toastrFetchCategoriesErrorMessage'));
    toastr.error('', errorMessage);
    if (e.status === 401) {
      yield call(() => { location.href = '/login'; });
    }
  }
}

export function* downloadReport() {
  while (true) {
    // listen for the DOWNLOAD_CLIENT_REPORT action
    const { reportName } = yield take(VENDOR_DOWNLOAD_CLIENT_REPORT);
    const authToken = getItem('auth_token');
    if (!authToken) {
      return;
    }

    try {
      const requestURL = `${API_URL}/downloadClientReport?&reportName=${reportName}`;
      location.replace(`${requestURL}`);
    } catch (e) {
      // if returns forbidden we remove the token from local storage
      if (e.status === 401) {
        removeItem('auth_token');
      }
      const errorMessage = get(e, 'message', translate('client.page.studyPage.toastrDownloadingReportErrorMessage'));
      toastr.error('', errorMessage);
      if (e.status === 401) {
        yield call(() => { location.href = '/login'; });
      }
    }
  }
}

export function* generateReferral() {
  while (true) {
    // listen for the GENERATE_PATIENT_REFERRAL action
    const { patientId, studyId } = yield take(VENDOR_GENERATE_PATIENT_REFERRAL);
    const authToken = getItem('auth_token');
    if (!authToken) {
      return;
    }

    try {
      const requestURL = `${API_URL}/patients/generatePatientReferral?patientId=${patientId}&studyId=${studyId}`;
      const toastrOptions = {
        id: 'loadingToasterForReferralGenerate',
        type: 'success',
        message: 'Loading...',
        options: {
          timeOut: 0,
          icon: (<FaSpinner size={40} className="spinner-icon text-info" />),
          showCloseButton: true,
        },
      };
      yield put(toastrActions.add(toastrOptions));
      yield call(request, requestURL, {
        method: 'GET',
      });
    } catch (e) {
      // if returns forbidden we remove the token from local storage
      if (e.status === 401) {
        removeItem('auth_token');
      }
      const errorMessage = get(e, 'message', translate('client.page.studyPage.toastrGeneratingReferralErrorMessage'));
      yield put(toastrActions.remove('loadingToasterForReferralGenerate'));
      toastr.error('', errorMessage);
      if (e.status === 401) {
        yield call(() => { location.href = '/login'; });
      }
    }
  }
}

export function* downloadReferral() {
  while (true) {
    // listen for the DOWNLOAD_PATIENT_REFERRAL action
    const { reportName, studyId } = yield take(VENDOR_DOWNLOAD_PATIENT_REFERRAL);
    const authToken = getItem('auth_token');
    if (!authToken) {
      return;
    }

    try {
      const params = {
        query: {
          reportName,
          studyId,
        },
        doNotParseAsJson: true,
      };
      const requestURL = `${API_URL}/patients/getReferralPDF`;
      const response = yield call(request, requestURL, params);
      yield put(toastrActions.remove('loadingToasterForReferralGenerate'));
      response.blob().then(blob => {
        FileSaver.saveAs(blob, reportName);
      });
    } catch (e) {
      // if returns forbidden we remove the token from local storage
      if (e.status === 401) {
        removeItem('auth_token');
      }
      const errorMessage = get(e, 'message', translate('client.page.studyPage.toastrDownloadingReferralErrorMessage'));
      yield put(toastrActions.remove('loadingToasterForReferralGenerate'));
      toastr.error('', errorMessage);
      if (e.status === 401) {
        yield call(() => { location.href = '/login'; });
      }
    }
  }
}

export function* fetchPatientsSaga() {
  while (true) {
    // listen for the FETCH_PATIENTS action
    const { studyId, text, campaignId, sourceId, skip } = yield take(VENDOR_FETCH_PATIENTS);
    yield call(fetchPatients, studyId, text, campaignId, sourceId, skip);
  }
}

function* fetchPatients(studyId, text, campaignId, sourceId, skip) {
  const authToken = getItem('auth_token');
  if (!authToken) {
    return;
  }

  try {
    const queryParams = {};
    if (campaignId) {
      queryParams.campaignId = campaignId;
    }
    if (sourceId) {
      queryParams.sourceIds = sourceId;
    }
    if (text) {
      queryParams.text = text;
    }
    const limit = 50;
    const offset = skip || 0;
    const filter = {
      limit,
    };

    if (offset > 0) {
      filter.offset = offset;
    }

    queryParams.filter = JSON.stringify(filter);
    const queryString = composeQueryString(queryParams);
    const requestURL = `${API_URL}/studies/${studyId}/patients?${queryString}`;
    const response = yield call(request, requestURL, {
      method: 'GET',
    });

    const page = 1 + (offset / 50);
    // populate the patients
    yield put(patientsFetched(response, page, limit, offset));
  } catch (e) {
    // if returns forbidden we remove the token from local storage
    if (e.status === 401) {
      removeItem('auth_token');
    }
    yield put(patientsFetchedError(e));
    const errorMessage = get(e, 'message', translate('client.page.studyPage.toastrFetchingPatientsErrorMessage'));
    toastr.error('', errorMessage);
    if (e.status === 401) {
      yield call(() => { location.href = '/login'; });
    }
  }
}

function* fetchPatientDetails() {
  while (true) {
    // listen for the FETCH_PATIENT_DETAILS action
    const { patientId, patientCategoryId } = yield take(VENDOR_FETCH_PATIENT_DETAILS);
    const authToken = getItem('auth_token');
    if (!authToken) {
      return;
    }

    const filter = JSON.stringify({
      include: [
        {
          relation: 'patientIndications',
          scope: {
            include: 'indication',
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
          relation: 'studySource',
          scope: {
            include: 'source',
          },
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
    try {
      const requestURL = `${API_URL}/patients/${patientId}?filter=${filter}`;
      const response = yield call(request, requestURL, {
        method: 'GET',
      });
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
      yield put(patientDetailsFetched(patientId, patientCategoryId, response));
    } catch (e) {
      const errorMessage = get(e, 'message', translate('client.page.studyPage.toastrFetchingPatientInformationErrorMessage'));
      toastr.error('', errorMessage);
      if (e.status === 401) {
        yield call(() => { location.href = '/login'; });
      }
    }
  }
}

function* findPatientsSaga() {
  while (true) {
    const authToken = getItem('auth_token');
    if (!authToken) {
      return;
    }

    // listen for the FIND_PATIENTS_TEXT_BLAST action
    const { studyId, text, categoryIds, sourceIds, campaignId } = yield take(VENDOR_FIND_PATIENTS_TEXT_BLAST);
    let filter = {};
    if (text) {
      filter.text = text;
    }
    if (categoryIds && categoryIds.length > 0) {
      filter.categoryIds = categoryIds;
    }
    if (sourceIds && sourceIds.length > 0) {
      filter.sourceIds = sourceIds;
    }
    filter.campaignId = campaignId;
    filter = JSON.stringify(filter);
    try {
      const requestURL = `${API_URL}/studies/${studyId}/findPatients?filter=${filter}`;
      const response = yield call(request, requestURL, {
        method: 'GET',
      });
      yield put(findPatientsForTextBlastSuccess(response));
      yield put(addPatientsToTextBlast(response));
    } catch (e) {
      const errorMessage = get(e, 'message', translate('client.page.studyPage.toastrFetchingStatsErrorMessage'));
      toastr.error('', errorMessage);
      if (e.status === 401) {
        yield call(() => { location.href = '/login'; });
      }
    }
  }
}

function* addPatientIndication() {
  while (true) {
    // listen for the SUBMIT_ADD_PATIENT_INDICATION action
    const { patientId, patientCategoryId, indication } = yield take(VENDOR_ADD_PATIENT_INDICATION);
    const authToken = getItem('auth_token');
    if (!authToken) {
      return;
    }

    try {
      const requestURL = `${API_URL}/patientIndications`;
      const payload = yield call(request, requestURL, {
        method: 'POST',
        body: JSON.stringify({
          patientId,
          indicationId: indication.id,
        }),
      });
      yield put(addPatientIndicationSuccess(patientId, patientCategoryId, indication, payload.isOriginal));
      if (payload && payload.patient) {
        yield put(updatePatientSuccess(patientId, patientCategoryId, payload.patient));
      }
    } catch (e) {
      const errorMessage = get(e, 'message', translate('client.page.studyPage.toastrAddingIndicationErrorMessage'));
      toastr.error('', errorMessage);
      if (e.status === 401) {
        yield call(() => { location.href = '/login'; });
      }
    }
  }
}

function* submitMovePatientBetweenCategories() {
  while (true) {
    // listen for the SUBMIT_MOVE_PATIENT_BETWEEN_CATEGORIES action
    const { studyId, fromCategoryId, toCategoryId, patientId, afterPatientId } = yield take(VENDOR_SUBMIT_MOVE_PATIENT_BETWEEN_CATEGORIES);
    const authToken = getItem('auth_token');
    if (!authToken) {
      return;
    }

    try {
      yield put(movePatientBetweenCategoriesLoading());
      const requestURL = `${API_URL}/patients/updateCategory`;
      yield call(request, requestURL, {
        method: 'POST',
        body: JSON.stringify({
          studyId,
          patientId,
          patientCategoryId: toCategoryId,
          afterPatientId,
        }),
      });
      yield put(movePatientBetweenCategoriesSuccess(fromCategoryId, toCategoryId, 1, patientId, moment().toISOString()));
    } catch (e) {
      const errorMessage = get(e, 'message', translate('client.page.studyPage.toastrMoveErrorMessage'));
      toastr.error('', errorMessage);
      yield put(movePatientBetweenCategoriesFailed());
      if (e.status === 401) {
        yield call(() => { location.href = '/login'; });
      }
    }
  }
}

function* removePatientIndication() {
  while (true) {
    // listen for the SUBMIT_REMOVE_PATIENT_INDICATION action
    const { patientId, patientCategoryId, indicationId } = yield take(VENDOR_REMOVE_PATIENT_INDICATION);
    const authToken = getItem('auth_token');
    if (!authToken) {
      return;
    }

    try {
      const requestURL = `${API_URL}/patientIndications`;
      const response = yield call(request, requestURL, {
        method: 'DELETE',
        body: JSON.stringify({
          patientId,
          indicationId,
        }),
      });

      yield put(removePatientIndicationSuccess(patientId, patientCategoryId, indicationId, response && response.patient ? response.patient : null));
      if (response && response.patient) {
        yield put(updatePatientSuccess(patientId, patientCategoryId, response.patient));
      }
    } catch (e) {
      const errorMessage = get(e, 'message', translate('client.page.studyPage.toastrRemovingIndicationErrorMessage'));
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
    const { patientId, patientCategoryId, fields } = yield take(VENDOR_SUBMIT_PATIENT_UPDATE);
    const authToken = getItem('auth_token');
    const userId = getItem('user_id');
    if (!authToken) {
      return;
    }

    try {
      const requestURL = `${API_URL}/patients/${patientId}`;
      const response = yield call(request, requestURL, {
        method: 'PATCH',
        body: JSON.stringify({ ...fields, userId }),
      });
      yield put(updatePatientSuccess(patientId, patientCategoryId, response));
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

function* submitPatientNote() {
  while (true) {
    // listen for the SUBMIT_PATIENT_NOTE action
    const { patientId, patientCategoryId, studyId, currentUser, note } = yield take(VENDOR_SUBMIT_PATIENT_NOTE);
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
      yield put(addPatientNoteSuccess(patientId, patientCategoryId, currentUser, response));
      if (response && response.patient) {
        yield put(updatePatientSuccess(patientId, patientCategoryId, response.patient));
      }
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
    const { studyId, patientId, currentUser, email, message, subject } = yield take(VENDOR_SUBMIT_EMAIL);
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
        }),
      });
      yield put(submitEmailSuccess(response));
      yield put(fetchEmails(studyId, patientId));
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

function* fetchEmailsWatcher() {
  while (true) {
    // listen for the SUBMIT_EMAIL action
    const { studyId, patientId } = yield take(VENDOR_FETCH_EMAILS);
    const authToken = getItem('auth_token');
    if (!authToken) {
      return;
    }

    try {
      const queryParams = {};
      if (studyId) {
        queryParams.studyId = studyId;
      }
      if (patientId) {
        queryParams.patientId = patientId;
      }
      const queryString = composeQueryString(queryParams);
      const requestURL = `${API_URL}/patients/fetchEmails?${queryString}`;
      const response = yield call(request, requestURL, {
        method: 'GET',
      });
      yield put(emailsFetched(response));
    } catch (e) {
      const errorMessage = get(e, 'message', translate('client.page.studyPage.toastrFetchingEmailsErrorMessage'));
      yield put(emailsFetchError(e));
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
    const { patientId, patientCategoryId, noteId } = yield take(VENDOR_SUBMIT_DELETE_NOTE);
    const authToken = getItem('auth_token');
    if (!authToken) {
      return;
    }

    try {
      const requestURL = `${API_URL}/patients/${patientId}/notes/${noteId}`;
      const response = yield call(request, requestURL, {
        method: 'DELETE',
      });
      yield put(deletePatientNoteSuccess(patientId, patientCategoryId, noteId));
      if (response && response.patient) {
        yield put(updatePatientSuccess(patientId, patientCategoryId, response.patient));
      }
    } catch (e) {
      const errorMessage = get(e, 'message', translate('client.page.studyPage.toastrAddingNoneErrorMessage'));
      toastr.error('', errorMessage);
      if (e.status === 401) {
        yield call(() => { location.href = '/login'; });
      }
    }
  }
}

function* submitPatientImport() {
  while (true) {
    // listen for the SUBMIT_PATIENT_IMPORT action
    const { clientId, studyId, file, onClose } = yield take(VENDOR_SUBMIT_PATIENT_IMPORT);
    const authToken = getItem('auth_token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('clientId', clientId);
    if (!authToken) {
      return;
    }

    try {
      const requestURL = `${API_URL}/studies/${studyId}/importPatients`;
      const response = yield call(request, requestURL, {
        useDefaultContentType: 'multipart/form-data',
        method: 'POST',
        body: formData,
      });
      onClose();
      toastr.success('Import Patients', 'Patients imported successfully!');
      yield put(submitAddPatientSuccess(response, file.name));
    } catch (e) {
      const errorMessage = get(e, 'message', translate('client.page.studyPage.toastrImportingErrorMessage'));
      yield put(submitAddPatientFailure());
      toastr.error('', errorMessage);
      if (e.status === 401) {
        yield call(() => { location.href = '/login'; });
      }
    }
  }
}

function* submitAddPatient() {
  while (true) {
    // listen for the SUBMIT_ADD_PATIENT action
    const { studyId, patient, onClose } = yield take(VENDOR_SUBMIT_ADD_PATIENT);
    const authToken = getItem('auth_token');
    if (!authToken) {
      return;
    }

    try {
      const requestURL = `${API_URL}/studies/${studyId}/addPatient`;
      const response = yield call(request, requestURL, {
        method: 'POST',
        body: JSON.stringify(patient),
      });
      onClose();
      toastr.success('Add Patient', 'Patient added successfully!');
      yield put(submitAddPatientSuccess(response));
    } catch (e) {
      let errorMessages;
      if (e.details && e.details.messages) {
        if (e.details.messages.email) {
          errorMessages = e.details.messages.email[0];
        } else if (e.details.messages.phone) {
          errorMessages = e.details.messages.phone[0];
        } else {
          errorMessages = e.details.messages[0];
        }
      } else if (e.message) {
        errorMessages = e.message;
      } else {
        errorMessages = translate('client.page.studyPage.toastrAddingPatientErrorMessage');
      }
      toastr.error('', errorMessages);
      yield put(submitAddPatientFailure());
      if (e.status === 401) {
        yield call(() => { location.href = '/login'; });
      }
    }
  }
}

export function* submitSchedule() {
  while (true) {
    const { data, fromCategoryId, scheduledCategoryId } = yield take(VENDOR_SUBMIT_SCHEDULE);
    try {
      const requestURL = `${API_URL}/appointments/upsertSchedule`;
      const params = {
        method: 'POST',
        body: JSON.stringify(data),
      };
      const response = yield call(request, requestURL, params);
      yield put(movePatientBetweenCategoriesSuccess(fromCategoryId, scheduledCategoryId, 1, data.patientId, moment().toISOString()));
      yield put(submitScheduleSucceeded(response, data.patientId));
    } catch (e) {
      const errorMessage = get(e, 'message', translate('client.page.studyPage.toastrScheduleErrorMessage'));
      toastr.error('', errorMessage);
      yield put(submitScheduleFailed(e));
      if (e.status === 401) {
        yield call(() => { location.href = '/login'; });
      }
    }
  }
}

export function* deletePatient() {
  while (true) {
    const { id } = yield take(VENDOR_DELETE_PATIENT);
    try {
      const requestURL = `${API_URL}/patients/${id}`;
      const params = {
        method: 'DELETE',
      };
      yield call(request, requestURL, params);
      yield put(deletePatientSuccess(id));
    } catch (e) {
      const errorMessage = get(e, 'message', translate('client.page.studyPage.toastrDeletingErrorMessage'));
      toastr.error('', errorMessage);
      yield put(deletePatientError(e));
    }
  }
}

export function* fetchStudySaga() {
  try {
    const watcherA = yield fork(fetchStudyDetails);
    // // watch for initial fetch actions that will load the text message stats
    const watcherB = yield fork(takeLatest, VENDOR_FETCH_STUDY, fetchStudyStats);
    const watcherC = yield fork(takeLatest, VENDOR_FETCH_STUDY_STATS, fetchStudyStats);
    // const watcherD = yield fork(takeLatest, FETCH_STUDY, fetchStudyCallStats);
    // const watcherE = yield fork(takeLatest, FETCH_STUDY_STATS, fetchStudyCallStats);
    const watcherF = yield fork(fetchPatientCategories);
    const watcherG = yield fork(fetchPatientsSaga);
    const watcherI = yield fork(fetchPatientDetails);
    const watcherJ = yield fork(findPatientsSaga);
    const watcherL = yield fork(addPatientIndication);
    const watcherM = yield fork(submitMovePatientBetweenCategories);
    const watcherN = yield fork(removePatientIndication);
    const watcherO = yield fork(submitPatientUpdate);
    const watcherQ = yield fork(submitPatientImport);
    const watcherR = yield fork(submitAddPatient);
    const watcherS = yield fork(submitPatientNote);
    const watcherT = yield fork(submitDeleteNote);
    const watcherV = yield fork(submitSchedule);
    const watcherW = yield fork(downloadReport);
    const watcherX = yield fork(downloadReferral);
    // // const watcherY = yield fork(generateReferral);
    const watcherPatientCategoriesTotals = yield fork(takeLatest, VENDOR_FETCH_STUDY, fetchPatientCategoriesTotals);
    const watcherFetchPatientCategoriesTotals = yield fork(takeLatest, VENDOR_FETCH_PATIENT_CATEGORIES_TOTALS, fetchPatientCategoriesTotals);
    const watcherEmail = yield fork(submitEmail);
    const watcherEmailsFetch = yield fork(fetchEmailsWatcher);
    const deletePatientWatcher = yield fork(deletePatient);

    yield take(LOCATION_CHANGE);
    yield cancel(watcherA);
    yield cancel(watcherB);
    yield cancel(watcherC);
    // // yield cancel(watcherD);
    // // yield cancel(watcherE);
    yield cancel(watcherF);
    yield cancel(watcherG);
    yield cancel(watcherI);
    yield cancel(watcherJ);
    yield cancel(watcherL);
    yield cancel(watcherM);
    yield cancel(watcherN);
    yield cancel(watcherO);
    yield cancel(watcherQ);
    yield cancel(watcherR);
    yield cancel(watcherS);
    yield cancel(watcherT);
    yield cancel(watcherV);
    yield cancel(watcherW);
    yield cancel(watcherX);
    // yield cancel(watcherY);
    yield cancel(watcherPatientCategoriesTotals);
    yield cancel(watcherFetchPatientCategoriesTotals);
    yield cancel(deletePatientWatcher);
    yield cancel(watcherEmail);
    yield cancel(watcherEmailsFetch);
  } catch (e) {
    // if returns forbidden we remove the token from local storage
    if (e.status === 401) {
      removeItem('auth_token');
    }
  }
}
