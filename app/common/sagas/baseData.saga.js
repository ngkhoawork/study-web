/* eslint-disable no-constant-condition, consistent-return */

import { take, call, put, fork, select, cancel } from 'redux-saga/effects';
import { toastr } from 'react-redux-toastr';
import { get } from 'lodash';
import { takeLatest } from 'redux-saga';
import { reset } from 'redux-form';
import moment from 'moment-timezone';
import { LOCATION_CHANGE, push } from 'react-router-redux';

import { removeItem, setItem } from '../../utils/localStorage';
import request from '../../utils/request';
import composeQueryString from '../../utils/composeQueryString';
import { logout } from '../../containers/LoginPage/actions';
import { fetchPatientMessagesSucceeded } from '../../containers/HomePage/actions';
import { translate } from '../../../common/utilities/localization';

import {
  FETCH_INDICATIONS,
  FETCH_SOURCES,
  FETCH_LEVELS,
  FETCH_COUPON,
  FETCH_REWARDS,
  FETCH_REWARDS_BALANCE,
  REDEEM,
  FETCH_CARDS,
  SAVE_CARD,
  DELETE_CARD,
  ADD_CREDITS,
  FETCH_CLIENT_SITES,
  FETCH_SITE_PATIENTS,
  FETCH_CLIENT_CREDITS,
  SEARCH_SITE_PATIENTS,
  FETCH_PATIENT_MESSAGES,
  FETCH_CLIENT_ROLES,
  FETCH_SITE,
  FETCH_USER,
  DELETE_USER,
  SAVE_SITE,
  SAVE_USER,
  UPDATE_USER,
  GET_CREDITS_PRICE,
  FETCH_INDICATION_LEVEL_PRICE,

  CHANGE_USERS_TIMEZONE,
  GET_TIMEZONE,

  FETCH_LANDING,
  SUBSCRIBE_FROM_LANDING,
  FIND_OUT_PATIENTS,
  CLINICAL_TRIALS_SEARCH,
  LIST_SITE_NOW,
  GET_PROPOSAL,
  LEARN_ABOUT_FUTURE_TRIALS,
  NEW_CONTACT,
  FETCH_CLIENT_ADMINS,
  SEND_THANK_YOU_EMAIL,
  FETCH_SPONSORS,
  FETCH_PROTOCOLS,
  FETCH_CRO,
  FETCH_USERS_BY_ROLE,
  CHANGE_TEMPORARY_PASSWORD,
  GET_CNS_INFO,
  SUBMIT_CNS,
  FETCH_PATIENT_MESSAGE_UNREAD_COUNT,
  FETCH_PATIENT_CATEGORIES,
  FETCH_MEDIA_TYPES,
  PRIVACY_REQUEST,
} from '../../containers/App/constants';

import { READ_STUDY_PATIENT_MESSAGES } from '../../containers/StudyPage/constants';
import { readStudyPatientMessagesSuccess, readStudyPatientMessagesError } from '../../containers/StudyPage/actions';

import {
  SUBMIT_TO_CLIENT_PORTAL,
  SUBMIT_TO_SPONSOR_PORTAL,
} from '../../containers/DashboardPortalsPage/constants';

import {
  selectGlobalPMSFormValues,
} from '../../components/GlobalPMSModal/selectors';

import {
  selectCards,
} from '../../containers/App/selectors';

import {
  indicationsFetched,
  indicationsFetchingError,
  sourcesFetched,
  sourcesFetchingError,
  levelsFetched,
  levelsFetchingError,
  couponFetched,
  couponFetchingError,
  rewardsFetched,
  rewardsFetchingError,
  rewardsBalanceFetched,
  rewardsBalanceFetchingError,
  redeemSuccess,
  redeemError,
  cardsFetched,
  cardsFetchingError,
  cardSaved,
  cardSavingError,
  cardDeleted,
  cardDeletingError,
  creditsAdded,
  creditsAddingError,

  clientSitesFetched,
  clientSitesFetchingError,
  sitePatientsFetched,
  sitePatientsFetchingError,
  clientCreditsFetched,
  clientCreditsFetchingError,
  sitePatientsSearched,
  sitePatientsSearchingError,
  patientMessagesFetched,
  patientMessagesFetchingError,
  patientMessageUnreadCountFetched,
  clientRolesFetched,
  clientRolesFetchingError,
  siteFetched,
  siteFetchingError,
  userFetched,
  userFetchingError,
  userDeleted,
  userDeletingError,
  siteSaved,
  siteSavingError,
  userSaved,
  userSavingError,
  updateUserSuccess,
  updateUserError,
  getCreditsPriceSuccess,
  getCreditsPriceError,
  fetchIndicationLevelPriceSuccess,
  fetchIndicationLevelPriceError,
  changeUsersTimezoneSuccess,
  changeUsersTimezoneError,
  getTimezoneSuccess,
  getTimezoneError,
  landingFetched,
  fetchLandingError,
  patientSubscribed,
  patientSubscriptionError,
  findOutPatientsPosted,
  findOutPatientsError,
  clinicalTrialsSearchSuccess,
  clinicalTrialsSearchError,
  listSiteNowSuccess,
  getProposalSuccess,
  learnAboutFutureTrialsSuccess,
  newContactSuccess,
  fetchClientAdminsSuccess,
  fetchClientAdminsError,
  fetchSponsorsSuccess,
  fetchSponsorsError,
  fetchProtocolsSuccess,
  fetchProtocolsError,
  fetchCroSuccess,
  fetchCroError,
  fetchUsersByRoleSuccess,
  fetchUsersByRoleError,
  getCnsInfoSuccess,
  getCnsInfoError,
  submitCnsSuccess,
  submitCnsError,
  patientCategoriesFetched,
  patientCategoriesFetchingError,
  fetchMediaTypesSuccess,
  fetchMediaTypesError,
} from '../../containers/App/actions';
import { DELETE_MEDIA_TYPE } from '../../components/CallTrackingPageModal/constants';
import { deleteMediaTypeSuccess } from '../../components/CallTrackingPageModal/actions';
import { fetchStudySources } from '../../../common/sagas/studySources';


let deleteMediaTypesWatcher = false;
export default function* baseDataSaga() {
  yield fork(fetchIndicationsWatcher);
  yield fork(fetchSourcesWatcher);
  yield fork(fetchLevelsWatcher);
  yield fork(fetchCouponWatcher);
  yield fork(fetchCardsWatcher);
  yield fork(fetchRewardsWatcher);
  yield fork(fetchRewardsBalanceWatcher);
  yield fork(redeemWatcher);
  yield fork(saveCardWatcher);
  yield fork(deleteCardWatcher);
  yield fork(addCreditsWatcher);

  yield fork(fetchClientSitesWatcher);
  yield fork(fetchSitePatientsWatcher);
  yield fork(fetchClientCreditsWatcher);
  yield fork(searchSitePatientsWatcher);
  yield fork(fetchPatientMessagesWatcher);
  yield fork(fetchPatientMessageUnreadCountWatcher);
  yield fork(fetchPatientCategoriesWatcher);
  yield fork(fetchClientRolesWatcher);
  yield fork(fetchSiteWatcher);
  yield fork(fetchUserWatcher);
  yield fork(deleteUserWatcher);
  yield fork(saveSiteWatcher);
  yield fork(saveUserWatcher);
  yield fork(updateUserWatcher);
  yield fork(fetchCreditsPrice);
  yield fork(fetchIndicationLevelPriceWatcher);
  yield fork(changeUsersTimezoneWatcher);
  yield fork(getTimezoneWatcher);
  yield fork(fetchClientAdminsWatcher);
  yield fork(changeTemporaryPassword);
  yield fork(fetchLanding);
  yield fork(takeLatest, SUBSCRIBE_FROM_LANDING, subscribeFromLanding);
  yield fork(takeLatest, FIND_OUT_PATIENTS, postFindOutPatients);
  yield fork(takeLatest, CLINICAL_TRIALS_SEARCH, searchClinicalTrials);
  yield fork(takeLatest, LIST_SITE_NOW, listNowSite);
  yield fork(takeLatest, GET_PROPOSAL, getProposal);
  yield fork(takeLatest, LEARN_ABOUT_FUTURE_TRIALS, learnAboutFutureTrials);
  yield fork(takeLatest, NEW_CONTACT, newContact);
  yield fork(takeLatest, PRIVACY_REQUEST, submitPrivacyRequest);
  yield fork(takeLatest, SEND_THANK_YOU_EMAIL, sendThankYouEmail);
  yield fork(fetchSponsorsWatcher);
  yield fork(fetchProtocolsWatcher);
  yield fork(fetchCroWatcher);
  yield fork(fetchUsersByRoleWatcher);
  yield fork(submitToClientPortalWatcher);
  yield fork(submitToSponsorPortalWatcher);
  yield fork(getCnsInfoWatcher);
  yield fork(submitCnsWatcher);
  yield fork(readStudyPatientMessagesWatcher);
  yield fork(fetchStudySources);
  yield fork(fetchMediaTypes);
  if (!deleteMediaTypesWatcher) {
    deleteMediaTypesWatcher = yield fork(deleteMediaType);
  }

  // Suspend execution until location changes
  const options = yield take(LOCATION_CHANGE);
  if (options.payload.pathname !== '/app') {
    if (deleteMediaTypesWatcher) {
      yield cancel(deleteMediaTypesWatcher);
      deleteMediaTypesWatcher = false;
    }
  }
}

function* fetchIndicationsWatcher() {
  while (true) {
    yield take(FETCH_INDICATIONS);

    try {
      const requestURL = `${API_URL}/indications`;

      const options = {
        method: 'GET',
        query: {
          filter: JSON.stringify({
            order: 'name',
            where: {
              isArchived: false,
            },
          }),
        },
      };

      const response = yield call(request, requestURL, options);

      yield put(indicationsFetched(response));
    } catch (e) {
      yield put(indicationsFetchingError(e));
    }
  }
}

function* fetchSourcesWatcher() {
  while (true) {
    yield take(FETCH_SOURCES);

    try {
      const options = {
        method: 'GET',
        query: {
          filter: JSON.stringify({
            order: 'orderNumber ASC',
          }),
        },
      };
      const requestURL = `${API_URL}/sources`;
      const response = yield call(request, requestURL, options);

      yield put(sourcesFetched(response));
    } catch (e) {
      yield put(sourcesFetchingError(e));
    }
  }
}

function* fetchLevelsWatcher() {
  while (true) {
    yield take(FETCH_LEVELS);

    try {
      const filterObj = {
        where: {
          isArchived: false,
          isActive: true,
        },
        order: 'position DESC',
      };

      const queryParams = {
        filter: JSON.stringify(filterObj),
      };
      const queryString = composeQueryString(queryParams);
      const requestURL = `${API_URL}/levels?${queryString}`;
      const response = yield call(request, requestURL);

      yield put(levelsFetched(response));
    } catch (e) {
      yield put(levelsFetchingError(e));
    }
  }
}

function* fetchCouponWatcher() { // 1
  while (true) {
    const { couponId } = yield take(FETCH_COUPON);
    const encodedCouponId = encodeURIComponent(couponId);

    try {
      const requestURL = `${API_URL}/clients/payments/retrieveCoupon/${encodedCouponId}`;
      const response = yield call(request, requestURL);

      yield put(couponFetched(response));
    } catch (err) {
      yield put(couponFetchingError(err));
      toastr.error('', translate('portals.component.shoppingCartForm.invalidCouponToastrError'));
    }
  }
}

function* fetchRewardsWatcher() {
  while (true) {
    try {
      const { siteId, clientId } = yield take(FETCH_REWARDS);
      let requestURL;
      let options = {};
      if (siteId) {
        requestURL = `${API_URL}/rewards`;
        options = {
          query: { filter: `{"where":{"site_id":${siteId}}}` },
        };
      } else {
        requestURL = `${API_URL}/rewards/byClient`;
        options = {
          query: { clientId },
        };
      }
      const response = yield call(request, requestURL, options);

      yield put(rewardsFetched(response));
    } catch (err) {
      yield put(rewardsFetchingError(err));
    }
  }
}

function* fetchRewardsBalanceWatcher() {
  while (true) {
    try {
      const { siteId, clientId } = yield take(FETCH_REWARDS_BALANCE);
      const requestURL = `${API_URL}/rewards/balance`;
      const options = {
        query: { siteId, clientId },
      };
      const response = yield call(request, requestURL, options);

      yield put(rewardsBalanceFetched(siteId, response));
    } catch (err) {
      yield put(rewardsBalanceFetchingError(err));
    }
  }
}

function* redeemWatcher() {
  while (true) {
    // listen for the SUBMIT_FORM action dispatched on form submit
    const { payload } = yield take(REDEEM);

    try {
      const requestURL = `${API_URL}/rewards/redeem`;
      const params = {
        method: 'POST',
        body: JSON.stringify(payload),
      };
      const response = yield call(request, requestURL, params);

      toastr.success(translate('portals.component.rewardModal.redeemToastrSuccessTitle'), translate('portals.component.rewardModal.redeemToastrSuccessMessage'));
      yield put(redeemSuccess(response));

      // Clear the form values
      yield put(reset('rewardRedemptions'));
    } catch (err) {
      const errorMessage = get(err, 'message', translate('portals.component.rewardModal.redeemToastrErrorMessage'));
      toastr.error('', errorMessage);
      yield put(redeemError(err));
    }
  }
}

function* fetchCardsWatcher() {
  while (true) {
    const { clientId, customerId } = yield take(FETCH_CARDS);

    try {
      const requestURL = `${API_URL}/clients/${clientId}/payments/${customerId}/retrieve_cardsList`;
      const response = yield call(request, requestURL);

      yield put(cardsFetched(response));
    } catch (err) {
      yield put(cardsFetchingError(err));
    }
  }
}

function* saveCardWatcher() {
  while (true) {
    const { clientId, customerId, cardData } = yield take(SAVE_CARD);
    const cards = yield select(selectCards());

    if (cards && cards.details && cards.details.data.length >= 10) {
      toastr.error('', translate('portals.component.addNewCardForm.saveCardToastrError'));
      yield put(cardSavingError(new Error('Error! Too many cards on file.')));
    } else {
      try {
        const requestURL = `${API_URL}/clients/${clientId}/payments/${customerId}/saveCard`;
        const options = {
          method: 'POST',
          body: JSON.stringify(cardData),
        };
        const response = yield call(request, requestURL, options);
        toastr.success('', translate('portals.component.addNewCardForm.saveCardToastrSuccess'));
        yield put(cardSaved(response));
      } catch (err) {
        const errorMessage = get(err, 'message', translate('portals.component.addNewCardForm.saveCardToastrOtherError'));
        toastr.error('', errorMessage);
        yield put(cardSavingError(err));
      }
    }
  }
}

function* deleteCardWatcher() {
  while (true) {
    const { clientId, customerId, cardId } = yield take(DELETE_CARD);
    const options = {
      method: 'DELETE',
      body: JSON.stringify({
        customerId,
        cardId,
      }),
    };

    try {
      const requestURL = `${API_URL}/clients/${clientId}/payments/deleteCard`;
      const response = yield call(request, requestURL, options);

      toastr.success('', translate('client.component.cardItem.toastrSuccess'));
      yield put(cardDeleted(response));
    } catch (err) {
      const errorMessage = get(err, 'message', translate('client.component.cardItem.toastrDefaultError'));
      toastr.error('', errorMessage);
      yield put(cardDeletingError(err));
    }
  }
}

function* addCreditsWatcher() {
  while (true) {
    const { clientId, customerId, data } = yield take(ADD_CREDITS);
    const options = {
      method: 'POST',
      body: JSON.stringify(data),
    };

    try {
      const requestURL = `${API_URL}/clients/${clientId}/payments/${customerId}/checkout_credits`;
      const response = yield call(request, requestURL, options);

      toastr.success('Add Credits', 'Credits added successfully!');
      yield put(creditsAdded(response));
    } catch (err) {
      const errorMessage = get(err, 'message', 'Something went wrong while submitting your request');
      toastr.error('', errorMessage);
      yield put(creditsAddingError(err));
    }
  }
}

function* fetchClientSitesWatcher() {
  while (true) {
    const { clientId, searchParams } = yield take(FETCH_CLIENT_SITES);

    try {
      const filterObj = {
        include: [{
          relation: 'roles',
          scope: {
            include: [{
              relation: 'user',
              scope: {
                where: { isArchived: false },
              },
            }],
          },
        }, {
          relation: 'studies',
          scope: {
            include: ['studyNotificationEmails'],
          },
        }],
      };

      if (searchParams && searchParams.name) {
        filterObj.where = {
          name: {
            like: `%${searchParams.name}%`,
            options: 'i',
          },
        };
      }

      const params = {
        method: 'GET',
        query: {
          filter: JSON.stringify(filterObj),
        },
      };
      const requestURL = `${API_URL}/clients/${clientId}/sites`;
      const response = yield call(request, requestURL, params);

      yield put(clientSitesFetched(response));
    } catch (err) {
      yield put(clientSitesFetchingError(err));
    }
  }
}

function* fetchSitePatientsWatcher() {
  while (true) {
    const { clientRoleId, limit, offset } = yield take(FETCH_SITE_PATIENTS);
    const formValues = yield select(selectGlobalPMSFormValues());
    try {
      const requestURL = `${API_URL}/patients/patientsForUser`;
      let query = {};
      if (formValues) {
        query = {
          clientRoleId,
          limit: limit || 50,
          offset: offset || 0,
          search: formValues.name,
          siteId: formValues.siteLocation,
        };
      } else {
        query = {
          clientRoleId,
          limit: limit || 50,
          offset: offset || 0,
        };
      }
      const params = {
        method: 'GET',
        query,
      };

      const response = yield call(request, requestURL, params);

      let hasMore = true;
      const page = ((offset || 0) / 50) + 1;
      if (response.length < 50) {
        hasMore = false;
      }

      yield put(sitePatientsFetched(response, hasMore, page));
    } catch (err) {
      yield put(sitePatientsFetchingError(err));
    }
  }
}

function* fetchClientCreditsWatcher() {
  while (true) {
    const { userId } = yield take(FETCH_CLIENT_CREDITS);

    try {
      const requestURL = `${API_URL}/users/${userId}/getClientCreditsByUser`;
      const response = yield call(request, requestURL);

      yield put(clientCreditsFetched(response));
    } catch (err) {
      yield put(clientCreditsFetchingError(err));
    }
  }
}

function* searchSitePatientsWatcher() {
  while (true) {
    const { keyword } = yield take(SEARCH_SITE_PATIENTS);

    try {
      const requestURL = `${API_URL}/patients/getPatientMessagesByName?name=${keyword}&message=${keyword}`;
      const response = yield call(request, requestURL);

      yield put(sitePatientsSearched(response));
    } catch (err) {
      yield put(sitePatientsSearchingError(err));
    }
  }
}

function* fetchPatientMessagesWatcher() {
  while (true) {
    const { patientId } = yield take(FETCH_PATIENT_MESSAGES);
    if (patientId && patientId > 0) {
      const params = {
        method: 'GET',
      };
      try {
        const requestURL = `${API_URL}/patients/${patientId}/messages`;
        const response = yield call(request, requestURL, params);

        yield put(patientMessagesFetched(response));
      } catch (err) {
        yield put(patientMessagesFetchingError(err));
      }
    } else {
      yield put(patientMessagesFetched([]));
    }
  }
}

function* fetchPatientMessageUnreadCountWatcher() {
  while (true) {
    const { currentUser } = yield take(FETCH_PATIENT_MESSAGE_UNREAD_COUNT);
    try {
      const requestURL = `${API_URL}/clients/${currentUser.roleForClient.client_id}/patientMessageStats`;
      const params = {
        method: 'GET',
        query: {
          userId: currentUser.id,
        },
      };
      const response = yield call(request, requestURL, params);
      yield put(patientMessageUnreadCountFetched(response));
      yield put(fetchPatientMessagesSucceeded(response));
    } catch (err) {
      console.trace(err);
    }
  }
}

function* fetchPatientCategoriesWatcher() {
  while (true) {
    yield take(FETCH_PATIENT_CATEGORIES);

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

      yield put(patientCategoriesFetched(response));
    } catch (err) {
      yield put(patientCategoriesFetchingError(err));
    }
  }
}

function* fetchClientRolesWatcher() {
  while (true) {
    const { clientId, searchParams } = yield take(FETCH_CLIENT_ROLES);

    try {
      const filterObj = {
        include: [{
          relation: 'user',
          scope: {
            where: { isArchived: false },
          },
        }],
      };

      if (searchParams && searchParams.name) {
        filterObj.where = {
          name: {
            like: `%${searchParams.name}%`,
            options: 'i',
          },
        };
      }

      const params = {
        method: 'GET',
        query: {
          filter: JSON.stringify(filterObj),
        },
      };
      const requestURL = `${API_URL}/clients/${clientId}/roles`;
      const response = yield call(request, requestURL, params);

      yield put(clientRolesFetched(response));
    } catch (err) {
      yield put(clientRolesFetchingError(err));
    }
  }
}

function* fetchSiteWatcher() {
  while (true) {
    const { id } = yield take(FETCH_SITE);

    try {
      const requestURL = `${API_URL}/sites/${id}`;
      const response = yield call(request, requestURL);

      yield put(siteFetched(response));
    } catch (err) {
      yield put(siteFetchingError(err));
    }
  }
}

function* fetchUserWatcher() {
  while (true) {
    const { id } = yield take(FETCH_USER);

    try {
      const queryParams = { filter: '{"include":"roleForClient"}' };
      const queryString = composeQueryString(queryParams);
      const requestURL = `${API_URL}/users/${id}?${queryString}`;
      const response = yield call(request, requestURL);

      yield put(userFetched(response));
    } catch (err) {
      yield put(userFetchingError(err));
    }
  }
}

function* deleteUserWatcher() {
  while (true) {
    const { id } = yield take(DELETE_USER);

    try {
      const requestURL = `${API_URL}/users/${id}`;
      const options = {
        method: 'DELETE',
        body: JSON.stringify({
          id,
        }),
      };
      const response = yield call(request, requestURL, options);

      toastr.success('Delete User', 'User deleted successfully!');
      yield put(userDeleted(id, response));
    } catch (err) {
      const errorMessage = get(err, 'message', 'Something went wrong while submitting your request');
      toastr.error('', errorMessage);
      yield put(userDeletingError(err));
    }
  }
}

function* saveSiteWatcher() {
  while (true) {
    const { clientId, id, data } = yield take(SAVE_SITE);

    try {
      let requestURL = null;
      let options = null;
      data.client_id = clientId;

      let messageHeader = translate('portals.component.editSiteForm.editSiteSuccessToastrTitle');
      let message = translate('portals.component.editSiteForm.editSiteSuccessToastrMessage');
      if (id) {
        requestURL = `${API_URL}/sites/${id}/updateSite`;
        options = {
          method: 'PUT',
          body: JSON.stringify(data),
        };
      } else {
        messageHeader = translate('portals.component.editSiteForm.addSiteSuccessToastrTitle');
        message = translate('portals.component.editSiteForm.addSiteSuccessToastrMessage');
        requestURL = `${API_URL}/sites`;
        options = {
          method: 'POST',
          body: JSON.stringify(data),
        };
      }

      const response = yield call(request, requestURL, options);

      toastr.success(messageHeader, message);
      yield put(siteSaved(response));
    } catch (err) {
      const errorMessage = get(err, 'message', translate('portals.component.editSiteForm.errorToastrMessage'));
      toastr.error('', errorMessage);
      yield put(siteSavingError(err));
    }
  }
}

function* saveUserWatcher() {
  while (true) {
    const { clientId, id, data } = yield take(SAVE_USER);

    try {
      let requestURL = null;
      let options = null;

      let messageHeader = translate('client.component.editUserForm.toastrHeaderEditUser');
      let message = translate('client.component.editUserForm.toastrMessageEditUser');
      if (id) {
        data.userId = id;
        requestURL = `${API_URL}/clients/${clientId}/updateUserWithClientRole`;
        options = {
          method: 'PUT',
          body: JSON.stringify(data),
        };
      } else {
        messageHeader = translate('client.component.editUserForm.toastrHeaderAddUser');
        message = translate('client.component.editUserForm.toastrMessageAddUser');
        requestURL = `${API_URL}/clients/${clientId}/addUserWithClientRole`;
        options = {
          method: 'POST',
          body: JSON.stringify(data),
        };
      }

      const response = yield call(request, requestURL, options);

      toastr.success(messageHeader, message);
      if (data.editSelf) {
        yield put(logout());
        yield call(() => { location.href = '/login'; });
      } else {
        yield put(userSaved(data.clientRole.siteId, response, messageHeader));
      }
    } catch (err) {
      const errorMessage = get(err, 'message', translate('client.component.editUserForm.toastrErrorMessage'));
      toastr.error('', errorMessage);
      yield put(userSavingError(err));
    }
  }
}

function* updateUserWatcher() {
  while (true) {
    const { id, data } = yield take(UPDATE_USER);
    let requestURL = null;
    let options = null;

    try {
      requestURL = `${API_URL}/users/${id}`;
      options = {
        method: 'PATCH',
        body: JSON.stringify(data),
      };

      yield call(request, requestURL, options);
      yield put(updateUserSuccess(data));
    } catch (err) {
      yield put(updateUserError(err));
    }
  }
}


function* fetchCreditsPrice() {
  while (true) {
    yield take(GET_CREDITS_PRICE);

    try {
      const requestURL = `${API_URL}/twilioCreditsSkus/getPrice`;
      const response = yield call(request, requestURL);

      yield put(getCreditsPriceSuccess(response));
    } catch (err) {
      yield put(getCreditsPriceError(err));
    }
  }
}

function* fetchIndicationLevelPriceWatcher() {
  while (true) {
    const { levelId } = yield take(FETCH_INDICATION_LEVEL_PRICE);

    try {
      const requestURL = `${API_URL}/levels/getPrice`;
      const params = {
        query: {
          levelId,
        },
      };
      const response = yield call(request, requestURL, params);
      yield put(fetchIndicationLevelPriceSuccess(response));
    } catch (err) {
      const errorMessage = get(err, 'message', translate('portals.page.listNewStudyPage.fetchLevelPriceErrorToastr'));
      toastr.error('', errorMessage);
      yield put(fetchIndicationLevelPriceError(err));
    }
  }
}

function* changeUsersTimezoneWatcher() {
  while (true) {
    const { userId, params } = yield take(CHANGE_USERS_TIMEZONE);
    try {
      const requestURL = `${API_URL}/users/${userId}`;
      const reqParams = {
        method: 'PATCH',
        body: JSON.stringify(params),
      };
      const response = yield call(request, requestURL, reqParams);
      toastr.success('Time Zone', translate('client.component.profileForm.updateProfileToastrSuccess'));
      moment.tz.setDefault(response.timezone);
      yield put(changeUsersTimezoneSuccess(response));
    } catch (err) {
      const errorMessage = get(err, 'message', translate('client.component.profileForm.updateProfileToastrError'));
      toastr.error('', errorMessage);
      yield put(changeUsersTimezoneError(err));
    }
  }
}

function* getTimezoneWatcher() {
  yield* takeLatest(GET_TIMEZONE, getTimezoneWorker);
}

function* getTimezoneWorker(action) {
  try {
    const requestURL = `${API_URL}/sites/getTimezone`;

    const params = {
      method: 'GET',
      query: {
        lat: action.lat,
        lng: action.lng,
      },
    };
    const response = yield call(request, requestURL, params);

    yield put(getTimezoneSuccess(response));
  } catch (err) {
    const errorMessage = get(err, 'message', 'Something went wrong while fetching timezone');
    toastr.error('', errorMessage);
    yield put(getTimezoneError(err));
  }
}

function* fetchClientAdminsWatcher() {
  yield* takeLatest(FETCH_CLIENT_ADMINS, fetchClientAdminsWorker);
}

function* fetchClientAdminsWorker(action) {
  try {
    const requestURL = `${API_URL}/clients/${action.id}/admins`;

    const params = {
      method: 'GET',
    };
    const response = yield call(request, requestURL, params);

    yield put(fetchClientAdminsSuccess(response));
  } catch (err) {
    const errorMessage = get(err, 'message', translate('portals.page.listNewStudyPage.fetchClientAdminsToastrError'));
    toastr.error('', errorMessage);
    yield put(fetchClientAdminsError(err));
  }
}

function* changeTemporaryPassword() {
  while (true) {
    const { payload } = yield take(CHANGE_TEMPORARY_PASSWORD);

    try {
      const requestURL = `${API_URL}/userPasswordChange/change-password`;
      const params = {
        method: 'POST',
        body: JSON.stringify(payload),
      };
      yield call(request, requestURL, params);
      toastr.success('', 'You have successfully changed your password.');
      yield put(logout());
    } catch (err) {
      const errorMessage = get(err, 'message', 'Something went wrong!');
      toastr.error('', errorMessage);
    }
  }
}

function* fetchLanding() {
  while (true) {
    const { studyId, utm } = yield take(FETCH_LANDING);

    // put the fetching study action in case of a navigation action
    try {
      const requestURL = `${API_URL}/landingPages/${studyId}/fetchLanding`;
      const response = yield call(request, requestURL, {
        method: 'GET',
        query: {
          utm,
        },
      });
      yield put(landingFetched(response));
      if (!response.isUtmValid) {
        // toastr.error('', 'Error! Invalid UTM.');
      }
    } catch (err) {
      yield put(fetchLandingError(err));
    }
  }
}

function* subscribeFromLanding(action) {
  try {
    const params = action.params;
    const requestURL = `${API_URL}/landingPages/newPatient`;
    const options = {
      method: 'POST',
      body: JSON.stringify(params),
    };

    const response = yield call(request, requestURL, options);
    yield put(patientSubscribed(response));
  } catch (err) {
    yield put(patientSubscriptionError(err));
  }
}

function* postFindOutPatients(action) {
  try {
    const params = action.params;
    const requestURL = `${API_URL}/findOutPatients`;
    const options = {
      method: 'POST',
      body: JSON.stringify(params),
    };

    const response = yield call(request, requestURL, options);
    toastr.success('', translate('corporate.page.trials.findOutPatientsForm.toastrSuccess'));
    yield put(findOutPatientsPosted(response));
  } catch (err) {
    const errorMessage = get(err, 'message', translate('corporate.page.trials.findOutPatientsForm.toastrDefaultError'));
    toastr.error('', errorMessage);
    yield put(findOutPatientsError(err));
  }
}

function* searchClinicalTrials(action) { // eslint-disable-line prefer-template
  try {
    const { countryCode, distance, from, indicationId, postalCode } = action.params;
    const queryParams = {};
    if (countryCode) {
      queryParams.countryCode = countryCode;
    }
    if (distance) {
      queryParams.distance = distance;
    }
    if (from !== false || from !== null) {
      queryParams.from = from;
    }
    if (indicationId) {
      queryParams.indicationId = indicationId;
    }
    if (postalCode) {
      queryParams.postalCode = postalCode;
    }
    const queryString = composeQueryString(queryParams);
    const requestURL = `${API_URL}/studies/getNearbyStudies?${queryString}`;
    const response = yield call(request, requestURL, {
      method: 'GET',
    });
    yield put(clinicalTrialsSearchSuccess(response));
  } catch (err) {
    yield put(clinicalTrialsSearchError(err));
    if (err.message.indexOf('postal code.') !== -1) {
      toastr.error('', err.message);
    }
  }
}

function* listNowSite(action) {
  try {
    const params = action.params;
    const size = Object.keys(params).length;
    const requestURL = `${API_URL}/sites/listNowFormRequest`;
    const options = {
      method: 'POST',
      body: JSON.stringify(params),
    };

    if (size >= 5) {
      const response = yield call(request, requestURL, options);
      toastr.success('', translate('corporate.page.trials.listNowModal.toastrSuccess'));
      yield put(listSiteNowSuccess(response));
    } else {
      toastr.error('', translate('corporate.page.trials.listNowModal.toastrError'));
    }
  } catch (err) {
    const errorMessage = get(err, 'message', translate('corporate.page.trials.listNowModal.toastrDefaultError'));
    toastr.error('', errorMessage);
  }
}

function* getProposal(action) {
  try {
    const params = action.params;
    const size = Object.keys(params).length;
    const requestURL = `${API_URL}/sites/getProposalFormRequest`;
    const options = {
      method: 'POST',
      body: JSON.stringify(params),
    };

    if (size === 6) {
      const response = yield call(request, requestURL, options);
      toastr.success('', translate('corporate.page.trials.getProposalModal.toastrSuccess'));
      yield put(getProposalSuccess(response));
    } else {
      toastr.error('', translate('corporate.page.trials.getProposalModal.toastrError'));
    }
  } catch (err) {
    const errorMessage = get(err, 'message', translate('corporate.page.trials.getProposalModal.toastrDefaultError'));
    toastr.error('', errorMessage);
  }
}

function* learnAboutFutureTrials(action) {
  try {
    const params = action.params;
    const requestURL = `${API_URL}/futureClinicalTrials`;
    const options = {
      method: 'POST',
      body: JSON.stringify(params),
    };

    const response = yield call(request, requestURL, options);
    toastr.success('', 'Thank you for submitting your information.');
    yield put(learnAboutFutureTrialsSuccess(response));
  } catch (err) {
    const errorMessage = get(err, 'message', 'Something went wrong while submitting your request.');
    toastr.error('', errorMessage);
  }
}

function* newContact(action) {
  try {
    const params = action.params;
    const requestURL = `${API_URL}/sites/newContact`;
    const options = {
      method: 'POST',
      body: JSON.stringify(params),
    };

    const response = yield call(request, requestURL, options);
    toastr.success('', translate('corporate.page.contactPage.toastrSuccessMessage'));
    yield put(newContactSuccess(response));
  } catch (err) {
    const errorMessage = get(err, 'message', translate('corporate.page.contactPage.toastrErrorMessage'));
    toastr.error('', errorMessage);
  }
}

function* submitPrivacyRequest(action) {
  try {
    const params = action.params;
    const requestURL = `${API_URL}/sites/privacyRequest`;
    const options = {
      method: 'POST',
      body: JSON.stringify(params),
    };

    yield call(request, requestURL, options);
    toastr.success('', translate('corporate.page.contactPage.toastrSuccessMessage'));
    action.recaptcha.reset();
    yield put(action.resetForm());
  } catch (err) {
    const errorMessage = get(err, 'message', translate('corporate.page.contactPage.toastrErrorMessage'));
    toastr.error('', errorMessage);
  }
}

function* sendThankYouEmail(action) {
  try {
    const params = action.payload;
    const requestURL = `${API_URL}/thankYouPages/sendThankYouEmail`;
    const options = {
      method: 'POST',
      body: JSON.stringify(params),
    };

    yield call(request, requestURL, options);
  } catch (err) {
    const errorMessage = get(err, 'message', 'Something went wrong.');
    toastr.error('', errorMessage);
  }
}

function* fetchSponsorsWatcher() {
  while (true) {
    yield take(FETCH_SPONSORS);

    try {
      const requestURL = `${API_URL}/sponsors`;

      const params = {
        method: 'GET',
      };
      const response = yield call(request, requestURL, params);

      yield put(fetchSponsorsSuccess(response));
    } catch (err) {
      const errorMessage = get(err, 'message', 'Something went wrong while fetching sponsors');
      toastr.error('', errorMessage);
      yield put(fetchSponsorsError(err));
    }
  }
}

function* fetchProtocolsWatcher() {
  while (true) {
    const { clientRoleId, sponsorRoleId } = yield take(FETCH_PROTOCOLS);

    try {
      const requestURL = `${API_URL}/protocols`;

      const params = {
        method: 'GET',
        query: {
          clientRoleId,
          sponsorRoleId,
        },
      };
      const response = yield call(request, requestURL, params);

      yield put(fetchProtocolsSuccess(response));
    } catch (err) {
      const errorMessage = get(err, 'message', 'Something went wrong while fetching protocols');
      toastr.error('', errorMessage);
      yield put(fetchProtocolsError(err));
    }
  }
}

function* fetchCroWatcher() {
  while (true) {
    yield take(FETCH_CRO);

    try {
      const requestURL = `${API_URL}/cros`;

      const params = {
        method: 'GET',
      };
      const response = yield call(request, requestURL, params);

      yield put(fetchCroSuccess(response));
    } catch (err) {
      const errorMessage = get(err, 'message', 'Something went wrong while fetching cros');
      toastr.error('', errorMessage);
      yield put(fetchCroError(err));
    }
  }
}

function* fetchUsersByRoleWatcher() {
  while (true) {
    yield take(FETCH_USERS_BY_ROLE);

    try {
      const requestURL = `${API_URL}/users/fetchDashboardUsersByRole`;

      const params = {
        method: 'GET',
      };
      const response = yield call(request, requestURL, params);

      yield put(fetchUsersByRoleSuccess(response));
    } catch (err) {
      const errorMessage = get(err, 'message', 'Something went wrong while fetching users');
      toastr.error('', errorMessage);
      yield put(fetchUsersByRoleError(err));
    }
  }
}

function* submitToClientPortalWatcher() {
  yield* takeLatest(SUBMIT_TO_CLIENT_PORTAL, submitToClientPortalWorker);
}

function* submitToClientPortalWorker(action) {
  try {
    yield call(setItem, 'user_id', action.userId);
    yield put(push('/app'));
    window.location.reload(false);
  } catch (err) {
    const errorMessage = get(err, 'message', 'Something went wrong');
    toastr.error('', errorMessage);
  }
}

function* submitToSponsorPortalWatcher() {
  yield* takeLatest(SUBMIT_TO_SPONSOR_PORTAL, submitToSponsorPortalWorker);
}

function* submitToSponsorPortalWorker(action) {
  try {
    yield call(setItem, 'user_id', action.userId);
    yield put(push('/app'));
    window.location.reload(false);
  } catch (err) {
    const errorMessage = get(err, 'message', 'Something went wrong');
    toastr.error('', errorMessage);
  }
}

function* getCnsInfoWatcher() {
  yield* takeLatest(GET_CNS_INFO, getCnsInfoWorker);
}

function* getCnsInfoWorker(action) {
  try {
    const requestURL = `${API_URL}/thankYouPages/getCnsInfo?cns=${action.payload}`;
    const response = yield call(request, requestURL);

    yield put(getCnsInfoSuccess(response));
  } catch (err) {
    const errorMessage = get(err, 'message', 'Something went wrong while fetching cns info');
    toastr.error('', errorMessage);
    yield put(getCnsInfoError(err));
  }
}

function* submitCnsWatcher() {
  yield* takeLatest(SUBMIT_CNS, submitCnsWorker);
}

function* submitCnsWorker(action) {
  try {
    const requestURL = `${API_URL}/thankYouPages/submitCns`;
    const options = {
      method: 'POST',
      body: JSON.stringify(action.payload),
    };
    const response = yield call(request, requestURL, options);
    yield put(submitCnsSuccess(response));
  } catch (err) {
    const errorMessage = get(err, 'message', 'Something went wrong while submitting cns info');
    toastr.error('', errorMessage);
    yield put(submitCnsError(err));
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

function* fetchMediaTypes() {
  while (true) {
    const { studyId } = yield take(FETCH_MEDIA_TYPES);
    try {
      const options = {
        method: 'GET',
      };

      const requestURL = `${API_URL}/studies/${studyId}/studyMediaTypes`;
      const response = yield call(request, requestURL, options);

      yield put(fetchMediaTypesSuccess(response));
    } catch (err) {
      yield put(fetchMediaTypesError(err));
    }
  }
}

export function* deleteMediaType() {
  yield* takeLatest(DELETE_MEDIA_TYPE, deleteMediaTypeWorker);
}

export function* deleteMediaTypeWorker(action) {
  try {
    if (action.studySourceId) {
      const requestURL = `${API_URL}/studies/${action.studyId}/canDeleteSource/${action.studySourceId}`;
      const response = yield call(request, requestURL);
      if (response.canDelete) {
        yield put(deleteMediaTypeSuccess(action.index));
      } else {
        toastr.error('', 'Error! There is patient data for a deleted media type in the study.');
      }
    } else {
      // if there is no study source id, this means that there is no studySource created on the server either, so we
      // can just remove this straightaway from the client side
      yield put(deleteMediaTypeSuccess(action.index));
    }
  } catch (err) {
    // give a redux toastr message in case there's an error
    const errorMessage = get(err, 'message', 'Something went wrong when validating the delete for media type.');
    toastr.error('', errorMessage);
    if (err.status === 401) {
      yield call(() => { location.href = '/login'; });
    }
  }
}
