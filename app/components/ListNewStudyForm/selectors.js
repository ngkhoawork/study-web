import { createSelector } from 'reselect';
import { get } from 'lodash';

/**
 * Direct selector to the routing state domain
 */
const selectFormDomain = () => state => state.form;

/**
 * ListNewStudyForm -> all values
 */
const selectListNewStudyFormValues = () => createSelector(
  selectFormDomain(),
  (substate) => get(substate, 'listNewStudy.values', {})
);

/**
 * ListNewStudyForm -> checking validation error
 */
const selectListNewStudyFormError = () => createSelector(
  selectFormDomain(),
  (substate) => {
    const errors = get(substate, 'listNewStudy.syncErrors', {});
    return Object.keys(errors).length > 0;
  }
);

/**
 * ListNewStudyForm -> getting validation errors
 */
const selectGetListNewStudyFormErrors = () => createSelector(
  selectFormDomain(),
  (substate) => get(substate, 'listNewStudy.syncErrors', {})
);

/**
 * ListNewStudyForm -> `callTracking`
 */
const selectCallTracking = () => createSelector(
  selectFormDomain(),
  (substate) => get(substate, 'listNewStudy.values.callTracking')
);

/**
 * ListNewStudyForm -> count of `leads`
 */
const selectLeadsCount = () => createSelector(
  selectFormDomain(),
  (substate) => {
    const leads = get(substate, 'listNewStudy.values.leads', []);
    return leads.length;
  }
);

export default selectFormDomain;
export {
  selectListNewStudyFormValues,
  selectListNewStudyFormError,
  selectGetListNewStudyFormErrors,
  selectCallTracking,
  selectLeadsCount,
};
