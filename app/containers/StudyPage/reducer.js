/*
 *
 * ProfilePage reducer
 *
 */

import {
  FETCH_CAMPAIGNS_SUCCESS,
  FETCH_CAMPAIGNS_ERROR,
  FETCH_PATIENTS_SUCCESS,
  FETCH_PATIENTS_ERROR,
  FETCH_PATIENT_DETAILS_SUCCESS,
  FETCH_PATIENT_DETAILS_ERROR,
  FETCH_PATIENT_CATEGORIES_SUCCESS,
  FETCH_PATIENT_CATEGORIES_ERROR,
  FETCH_SITES_SUCCESS,
  FETCH_SITES_ERROR,
  FETCH_SOURCES_SUCCESS,
  FETCH_SOURCES_ERROR,
  FETCH_STUDY_SUCCESS,
  FETCH_STUDY_ERROR,
} from './constants';
import _ from 'lodash';

const initialState = {
};

function studyPageReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_CAMPAIGNS_SUCCESS:
      return {
        ...state,
        campaigns: action.payload,
      };
    case FETCH_CAMPAIGNS_ERROR:
      return {
        ...state,
        campaigns: false,
      };
    case FETCH_PATIENTS_SUCCESS:
      return {
        ...state,
        patientCategories: state.patientCategories.map(patientCategory => {
          const tempCategory = _.find(action.payload, category => {
            return category.id === patientCategory.id
          })
          if (tempCategory) {
            return tempCategory;
          }
          patientCategory.patients = [];
          return patientCategory;
        }),
        fetchingPatients: false,
      };
    case FETCH_PATIENTS_ERROR:
      return {
        ...state,
        patientCategories: state.patientCategories.map(patientCategory => {
          const patientCategoryTemp = Object.assign({}, patientCategory);
          delete patientCategoryTemp.patients;
          return patientCategoryTemp;
        }),
        fetchingPatients: false,
      };
    case FETCH_PATIENT_DETAILS_SUCCESS:
    case FETCH_PATIENT_DETAILS_ERROR:
      return {
        ...state,
        patientCategories: patientCategories(state.patientCategories, action),
      };
    case FETCH_PATIENT_CATEGORIES_SUCCESS:
      return {
        ...state,
        patientCategories: action.payload.map(patientCategory => {
          const patientCategoryTemp = Object.assign({}, patientCategory);
          patientCategoryTemp.patients = [];
          return patientCategoryTemp;
        }),
      };
    case FETCH_PATIENT_CATEGORIES_ERROR:
      return {
        ...state,
        patientCategories: false,
      };
    case FETCH_SITES_SUCCESS:
      return {
        ...state,
        sites: action.payload,
      };
    case FETCH_SITES_ERROR:
      return {
        ...state,
        sites: false,
      };
    case FETCH_SOURCES_SUCCESS:
      return {
        ...state,
        sources: action.payload,
      };
    case FETCH_SOURCES_ERROR:
      return {
        ...state,
        sources: false,
      };
    case FETCH_STUDY_SUCCESS:
      return {
        ...state,
        study: action.payload,
        fetchingStudy: false,
      };
    case FETCH_STUDY_ERROR:
      return {
        ...state,
        study: false,
        fetchingStudy: false,
      };
    default:
      return state;
  }
}

function patientCategories(state, action) {
  switch (action.type) {
    case FETCH_PATIENT_DETAILS_SUCCESS:
      return state.map(patientCategory => {
        if (patientCategory.id === action.patientCategoryId) {
          return {
            ...patientCategory,
            patients: patientCategory.patients.map(patient => {
              if (patient.id == action.patientId) {
                return {
                  ...patient,
                  ...action.payload,
                };
              } else {
                return patient;
              }
            })
          };
        } else {
          return patientCategory;
        }
      });
    case FETCH_PATIENT_DETAILS_ERROR:
      return state.map(patientCategory => {
        if (patientCategory.id === action.patientCategoryId) {
          return {
            ...patientCategory,
            patients: patientCategory.patients.map(patient => {
              if (patient.id == action.patientId) {
                return {
                  ...patient,
                  error: action.payload.error,
                };
              } else {
                return patient;
              }
            })
          };
        } else {
          return patientCategory;
        }
      });
    default:
      return state;
  }
}

export default studyPageReducer;
