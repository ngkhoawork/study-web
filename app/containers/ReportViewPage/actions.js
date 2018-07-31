/*
 *
 * ReportViewPage actions
 *
 */

import {
  GET_REPORTS_LIST,
  GET_REPORTS_LIST_SUCCESS,
  GET_REPORTS_LIST_ERROR,
  SET_ACTIVE_SORT,
  SORT_REPORTS_SUCCESS,
  CHANGE_PROTOCOL_STATUS,
  CHANGE_PROTOCOL_STATUS_SUCCESS,
  CHANGE_PROTOCOL_STATUS_ERROR,
  EXPORT_STUDIES,
  GET_REPORTS_TOTALS,
  GET_REPORTS_TOTALS_SUCCESS,
  GET_REPORTS_TOTALS_ERROR,
  GET_CATEGORY_NOTES,
  GET_CATEGORY_NOTES_SUCCESS,
  GET_CATEGORY_NOTES_ERROR,
  CLEAR_REPORT_LIST,
  FETCH_DISPOSITION_TOTALS,
  FETCH_DISPOSITION_TOTALS_SUCCESS,
  FETCH_DISPOSITION_TOTALS_ERROR,
  FETCH_MEDIA_SOURCES,
  FETCH_MEDIA_SOURCES_SUCCESS,
  FETCH_MEDIA_SOURCES_ERROR,
  FETCH_TOTAL_SIGNUPS,
  FETCH_TOTAL_SIGNUPS_SUCCESS,
  FETCH_TOTAL_SIGNUPS_ERROR,
  GET_STUDY_REPORTS_TOTALS,
  GET_STUDY_REPORTS_TOTALS_SUCCESS,
  GET_STUDY_REPORTS_TOTALS_ERROR,
  FETCH_STUDY_DISPOSITION_TOTALS,
  FETCH_STUDY_DISPOSITION_TOTALS_SUCCESS,
  FETCH_STUDY_DISPOSITION_TOTALS_ERROR,
  FETCH_STUDY_MEDIA_SOURCES,
  FETCH_STUDY_MEDIA_SOURCES_SUCCESS,
  FETCH_STUDY_MEDIA_SOURCES_ERROR,
} from './constants';

export function getReportsList(searchParams, limit, offset, sort, order) {
  return {
    type: GET_REPORTS_LIST,
    searchParams,
    limit,
    offset,
    sort,
    order,
  };
}

export function getReportsListSuccess(payload, hasMoreItems, page) {
  return {
    type: GET_REPORTS_LIST_SUCCESS,
    payload,
    hasMoreItems,
    page,
  };
}

export function getReportsListError(payload) {
  return {
    type: GET_REPORTS_LIST_ERROR,
    payload,
  };
}

export function setActiveSort(sort, direction) {
  return {
    type: SET_ACTIVE_SORT,
    sort,
    direction,
  };
}

export function sortReportsSuccess(reports) {
  return {
    type: SORT_REPORTS_SUCCESS,
    reports,
  };
}

export function changeProtocolStatus(payload) {
  return {
    type: CHANGE_PROTOCOL_STATUS,
    payload,
  };
}

export function changeProtocolStatusSuccess(payload) {
  return {
    type: CHANGE_PROTOCOL_STATUS_SUCCESS,
    payload,
  };
}

export function changeProtocolStatusError(payload) {
  return {
    type: CHANGE_PROTOCOL_STATUS_ERROR,
    payload,
  };
}

export function exportStudies(payload) {
  return {
    type: EXPORT_STUDIES,
    payload,
  };
}

export function getReportsTotals(searchParams) {
  return {
    type: GET_REPORTS_TOTALS,
    searchParams,
  };
}

export function getReportsTotalsSuccess(source, payload) {
  return {
    type: GET_REPORTS_TOTALS_SUCCESS,
    source,
    payload,
  };
}

export function getReportsTotalsError(payload) {
  return {
    type: GET_REPORTS_TOTALS_ERROR,
    payload,
  };
}

export function getCategoryNotes(searchParams, category, studyId, limit, offset) {
  return {
    type: GET_CATEGORY_NOTES,
    searchParams,
    category,
    studyId,
    limit,
    offset,
  };
}

export function getCategoryNotesSuccess(payload, hasMoreItems, page) {
  return {
    type: GET_CATEGORY_NOTES_SUCCESS,
    payload,
    hasMoreItems,
    page,
  };
}

export function getCategoryNotesError(payload) {
  return {
    type: GET_CATEGORY_NOTES_ERROR,
    payload,
  };
}

export function clearReportList() {
  return {
    type: CLEAR_REPORT_LIST,
  };
}

// ///////////////////////////////////////////
// disposition
// ///////////////////////////////////////////
export function getDispositionTotals(searchParams) {
  return {
    type: FETCH_DISPOSITION_TOTALS,
    searchParams,
  };
}

export function getDispositionTotalsSuccess(payload) {
  return {
    type: FETCH_DISPOSITION_TOTALS_SUCCESS,
    payload,
  };
}

export function getDispositionTotalsError(payload) {
  return {
    type: FETCH_DISPOSITION_TOTALS_ERROR,
    payload,
  };
}

// ///////////////////////////////////////////
// media sources
// ///////////////////////////////////////////
export function fetchMediaSources(searchParams) {
  return {
    type: FETCH_MEDIA_SOURCES,
    searchParams,
  };
}

export function mediaSourcesFetched(payload) {
  return {
    type: FETCH_MEDIA_SOURCES_SUCCESS,
    payload,
  };
}

export function mediaSourcesFetchingError(payload) {
  return {
    type: FETCH_MEDIA_SOURCES_ERROR,
    payload,
  };
}

export function fetchTotalSignUps(roleId, protocol, indication, timezone, searchFilter) {
  return {
    type: FETCH_TOTAL_SIGNUPS,
    roleId,
    protocol,
    indication,
    timezone,
    searchFilter,
  };
}

export function fetchTotalSignUpsSuccess(payload) {
  return {
    type: FETCH_TOTAL_SIGNUPS_SUCCESS,
    payload,
  };
}

export function fetchTotalSignUpsError(payload) {
  return {
    type: FETCH_TOTAL_SIGNUPS_ERROR,
    payload,
  };
}

// ///////////////////////////////////////////
// study stats
// ///////////////////////////////////////////

export function getStudyReportsTotals(searchParams) {
  return {
    type: GET_STUDY_REPORTS_TOTALS,
    searchParams,
  };
}

export function getStudyReportsTotalsSuccess(source, payload) {
  return {
    type: GET_STUDY_REPORTS_TOTALS_SUCCESS,
    source,
    payload,
  };
}

export function getStudyReportsTotalsError(payload) {
  return {
    type: GET_STUDY_REPORTS_TOTALS_ERROR,
    payload,
  };
}

export function getStudyDispositionTotals(searchParams) {
  return {
    type: FETCH_STUDY_DISPOSITION_TOTALS,
    searchParams,
  };
}

export function getStudyDispositionTotalsSuccess(payload) {
  return {
    type: FETCH_STUDY_DISPOSITION_TOTALS_SUCCESS,
    payload,
  };
}

export function getStudyDispositionTotalsError(payload) {
  return {
    type: FETCH_STUDY_DISPOSITION_TOTALS_ERROR,
    payload,
  };
}

export function fetchStudyMediaSources(searchParams) {
  return {
    type: FETCH_STUDY_MEDIA_SOURCES,
    searchParams,
  };
}

export function studyMediaSourcesFetched(payload) {
  return {
    type: FETCH_STUDY_MEDIA_SOURCES_SUCCESS,
    payload,
  };
}

export function studyMediaSourcesFetchingError(payload) {
  return {
    type: FETCH_STUDY_MEDIA_SOURCES_ERROR,
    payload,
  };
}
