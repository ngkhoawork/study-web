import keymirror from 'keymirror'

export const ActionTypes = keymirror({
  ROUTE_CHANGED: null,

  SET_AUTH_DATA: null,

  LOGIN: null,
  LOGOUT: null,
  EXPIRE_SESSION: null,
  REQUEST_PASSWORD_RESET: null,
  RESET_PASSWORD: null,
  CHANGE_PASSWORD: null,
  CHANGE_EMAIL: null,

  CREATE_PATIENT: null,
  UPDATE_PATIENT: null,

  SUBMIT_GET_TRIAL_NOTIFICATION_FORM: null,

  FETCH_SITES: null,
  CLEAR_SITES: null,
  FETCH_SITE: null,
  CLEAR_SELECTED_SITE: null,
  UPDATE_SITE: null,
  CREATE_SITE: null,
  FINISH_SAVE_SITE: null,

  FETCH_USERS: null,
  CLEAR_USERS: null,
  FETCH_USER: null,
  CLEAR_SELECTED_USER: null,
  UPDATE_USER: null,
  CREATE_USER: null,
  DELETE_USER: null,
  FINISH_SAVE_USER: null,
  FINISH_DELETE_USER: null,

  FETCH_STUDIES: null,
  FETCH_STUDY: null,
  CLEAR_STUDIES: null,

  FETCH_PATIENT_CATEGORIES: null,
  FETCH_PATIENTS: null,
  FETCH_PATIENTS_BY_STUDY: null,

  UPDATE_PATIENT_CATEGORY: null,

  FETCH_SITE_LOCATIONS: null,
  FETCH_STUDY_CATEGORIES: null,
  SUBMIT_ORDER_IRB_AD: null,

  FETCH_NOTIFICATIONS: null,
  FETCH_UNREAD_NOTIFICATIONS_COUNT: null,
  SET_NOTIFICATION_AS_READ: null,

  NOTIFICATION_ARRIVED: null,
  FETCH_PATIENT_SIGN_UPS: null,

  SAVE_REFERRAL_FORM: null,
  SCHEDULE_PATIENT: null,
  FETCH_SCHEDULES: null,

  FETCH_PROTOCOLS: null,
})
