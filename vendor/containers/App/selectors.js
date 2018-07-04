import { createSelector } from 'reselect';
import { get } from 'lodash';
/**
 * Direct selector to the app state domain
 */
const selectGlobal = () => state => state.global;

const selectAuthState = () => createSelector(
  selectGlobal(),
  (substate) => substate.loggedIn
);

const selectCurrentUser = () => createSelector(
  selectGlobal(),
  (substate) => substate.userData
);

const selectCurrentUserEmail = () => createSelector(
  selectGlobal(),
  (substate) => substate.userData.email
);

const selectCurrentUserFullName = () => createSelector(
  selectGlobal(),
  (substate) => `${substate.userData.firstName} ${substate.userData.lastName}`
);

const selectCurrentUserId = () => createSelector(
  selectGlobal(),
  (substate) => substate.userData.id
);

const selectUserRoleType = () => createSelector(
  selectGlobal(),
  (substate) => substate.userRoleType
);

const selectSites = () => createSelector(
  selectGlobal(),
  (substate) => get(substate, 'baseData.sites.details', [])
);

export {
  selectGlobal,
  selectAuthState,
  selectCurrentUser,
  selectUserRoleType,
  selectCurrentUserEmail,
  selectCurrentUserFullName,
  selectCurrentUserId,
  selectSites,
};
