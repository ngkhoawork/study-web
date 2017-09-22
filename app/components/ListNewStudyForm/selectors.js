import { createSelector } from 'reselect';
import { get, forEach } from 'lodash';

/**
 * Direct selector to the routing state domain
 */
const selectFormDomain = () => state => state.form;

/**
 * RequestProposalForm -> all values
 */
const selectListNewStudyFormValues = () => createSelector(
  selectFormDomain(),
  (substate) => get(substate, 'listNewStudy.values', {})
);

/**
 * RequestProposalForm -> checking validation error
 */
const selectListNewStudyFormError = () => createSelector(
  selectFormDomain(),
  (substate) => {
    const errors = get(substate, 'listNewStudy.syncErrors', {});
    return Object.keys(errors).length > 0;
  }
);

/**
 * RequestProposalForm -> `callTracking`
 */
const selectCallTracking = () => createSelector(
  selectFormDomain(),
  (substate) => get(substate, 'listNewStudy.values.callTracking')
);

/**
 * RequestProposalForm -> count of `leads`
 */
const selectLeadsCount = () => createSelector(
  selectFormDomain(),
  (substate) => {
    const leads = get(substate, 'listNewStudy.values.leadSource', []);
    return leads.length;
  }
);

const selectRegisteredFields = () => createSelector(
  selectFormDomain(),
  (substate) => Object.keys(get(substate, 'listNewStudy.registeredFields', []))
);

export default selectFormDomain;
export {
  selectListNewStudyFormValues,
  selectListNewStudyFormError,
  selectCallTracking,
  selectLeadsCount,
  selectRegisteredFields,
};
