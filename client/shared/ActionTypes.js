import KeyKey from 'keykey'

export const ActionTypes = KeyKey(
  'ROUTE_CHANGED',

  'SET_AUTH_DATA',

  'LOGIN',
  'LOGOUT',
  'EXPIRE_SESSION',
  'REQUEST_PASSWORD_RESET',
  'RESET_PASSWORD',
  'CHANGE_PASSWORD',
  'CHANGE_EMAIL',

  'CREATE_PATIENT',
  'UPDATE_PATIENT',

  'SUBMIT_GET_TRIAL_NOTIFICATION_FORM',

  'FETCH_SITES',
  'CLEAR_SITES',
  'FETCH_SITE',
  'CLEAR_SELECTED_SITE',
  'UPDATE_SITE',
  'CREATE_SITE',
  'FINISH_SAVE_SITE',
  'UPDATE_STUDY',
  'CREATE_STUDY',
  'FINISH_SAVE_STUDY',

  'FETCH_USERS',
  'CLEAR_USERS',
  'FETCH_USER',
  'CLEAR_SELECTED_USER',
  'UPDATE_USER',
  'CREATE_USER',
  'DELETE_USER',
  'DELETE_CLIENT_ROLE',
  'FINISH_SAVE_USER',
  'FINISH_DELETE_USER',
  'FINISH_DELETE_CLIENT_ROLE',

  'FETCH_INDICATIONS',
  'FETCH_INFO_SOURCES',

  'FETCH_STUDIES',
  'FETCH_STUDY',
  'CLEAR_STUDIES',
  'FETCH_STUDY_SOURCES',

  'FETCH_PATIENT_CATEGORIES',
  'FETCH_PATIENTS',
  'CLEAR_PATIENTS',
  'FETCH_PATIENTS_BY_STUDY',

  'UPDATE_PATIENT_CATEGORY',

  'FETCH_PATIENT',
  'CLEAR_SELECTED_PATIENT',
  'FINISH_SAVE_PATIENT',

  'FETCH_STUDY_CATEGORIES',
  'FETCH_STUDY_LEVELS',
  'SUBMIT_ORDER_IRB_AD',
  'SUBMIT_LIST_STUDY',

  'FETCH_COUPON',
  'CLEAR_COUPON',

  'FETCH_NOTIFICATIONS',
  'FETCH_UNREAD_NOTIFICATIONS_COUNT',
  'SET_NOTIFICATION_AS_READ',

  'NOTIFICATION_ARRIVED',
  'FETCH_PATIENT_SIGN_UPS',
  'FETCH_PATIENT_MESSAGES',
  'FETCH_REWARDS_POINT',

  'FETCH_SITE_LOCATIONS',

  'SAVE_REFERRAL_FORM',
  'SUBSCRIBE_REQUEST',
  'UNSUBSCRIBE_REQUEST',
  'RECEIVE_MESSAGE',
  'FETCH_AVAIL_NUMBERS',
  'FETCH_TWILIO_MESSAGES',
  'SAVE_TWILIO_MESSAGE',
  'SET_ACTIVE_CHAT',
  'SET_ACTIVE_BLAST_FORM',
  'UNSET_ACTIVE_BLAST_FORM',
  'UNSET_ACTIVE_CHAT',
  'JOIN_TWILIO_CHAT',
  'LEAVE_TWILIO_CHAT',
  'SCHEDULE_PATIENT',
  'FETCH_SCHEDULES',
  'DELETE_SCHEDULE',
  'SET_SOCKET',
)
