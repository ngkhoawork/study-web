import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { find } from 'lodash';
import { selectSelectedSite, selectSelectedUser } from '../../containers/App/selectors';
import { fetchSite, fetchUser } from '../../containers/App/actions';
import LoadingSpinner from '../../components/LoadingSpinner';

class ClientSiteItem extends Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    id: PropTypes.number,
    name: PropTypes.string,
    piFirstName: PropTypes.string,
    piLastName: PropTypes.string,
    redirectPhone: PropTypes.string,
    address: PropTypes.string,
    roles: PropTypes.array,
    selectedSite: PropTypes.object,
    selectedUser: PropTypes.object,
    fetchSite: PropTypes.func,
    fetchUser: PropTypes.func,
    userFilter: PropTypes.any,
    bDisabled: PropTypes.bool,
    city: PropTypes.string,
    state: PropTypes.string,
    zip: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.state = {
      assignedUsersCollapsed: true,
    };

    this.toggleAssignedUsers = this.toggleAssignedUsers.bind(this);
    this.editSite = this.editSite.bind(this);
  }

  componentWillReceiveProps(newProps) {
    const { roles, userFilter } = newProps;

    const filteredUser = find(roles, (item) => {
      if (userFilter.trim() === '') {
        return false;
      }
      const fullName = `${item.user.firstName} ${item.user.lastName}`;
      return (fullName.toUpperCase().includes(userFilter.toUpperCase()));
    });

    this.setState({ assignedUsersCollapsed: !filteredUser });
  }

  toggleAssignedUsers() {
    const collapsed = !this.state.assignedUsersCollapsed;
    this.setState({ assignedUsersCollapsed: collapsed });
  }

  editSite() {
    this.props.fetchSite(this.props.id);
  }

  editAssignedUser(assignedUser) {
    this.props.fetchUser(assignedUser.user.id);
  }

  currentSiteIsBeingFetched() {
    const { selectedSite, id } = this.props;

    return (selectedSite.fetching && selectedSite.id === id);
  }

  assignedUserIsBeingFetched(assignedUser) {
    const { selectedUser } = this.props;

    return (selectedUser.fetching && selectedUser.id === assignedUser.id);
  }

  render() {
    const { name, piFirstName, piLastName, redirectPhone, address, roles, city, zip, state } = this.props;

    const addressArr = address.split(',');
    let assignedUsersContent = (roles) ? roles.map((item, index) => (
      !item.user.isArchived && !item.isAdmin
        ? <div className="assigned-user" key={index}>
          <span>{item.user.firstName} {item.user.lastName}</span>
          <span className="edit-assigned-user">
            {(this.assignedUserIsBeingFetched(item))
              ? <span><LoadingSpinner showOnlyIcon size={20} className="fetching-assigned-user" /></span>
              : <a disabled={this.props.bDisabled} className="btn toggle edit-icon" onClick={() => (this.props.bDisabled ? null : this.editAssignedUser(item))}><i className="pencil-square" /></a>
            }
          </span>
        </div>
        : null
    )) : null;

    assignedUsersContent = assignedUsersContent.filter(item => (
      item !== null
    ));
    return (
      <tr className="client-site-container">
        <td className="name">
          <span>{name}</span>
        </td>
        <td className="principal-investigator">
          <span>{piFirstName} {piLastName}</span>
        </td>
        <td className="redirectPhone">
          <span>{redirectPhone}</span>
        </td>
        <td className="address">
          <span>{addressArr[0]}<br />{city}, {state} {zip}</span>
        </td>
        <td className="assigned-users">
          <div className="toggle-assigned-users">
            <span>ASSIGNED USERS ({assignedUsersContent.length ? assignedUsersContent.length : 0})</span>
            {(this.state.assignedUsersCollapsed)
              ? <a className="btn toggle toggle-plus" onClick={this.toggleAssignedUsers}></a>
              : <a className="btn toggle toggle-minus" onClick={this.toggleAssignedUsers}></a>
            }
          </div>
          {(!this.state.assignedUsersCollapsed) &&
            <div className="assigned-users-list">{assignedUsersContent}</div>
          }
        </td>
        <td className="action">
          <button type="button" className="btn btn-primary btn-edit-site pull-right" onClick={this.editSite} disabled={(this.currentSiteIsBeingFetched() || this.props.bDisabled)}>
            {(this.currentSiteIsBeingFetched())
              ? <span><LoadingSpinner showOnlyIcon size={20} /></span>
              : <span>Edit</span>
            }
          </button>
        </td>
      </tr>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  selectedSite: selectSelectedSite(),
  selectedUser: selectSelectedUser(),
});

function mapDispatchToProps(dispatch) {
  return {
    fetchSite: (id) => dispatch(fetchSite(id)),
    fetchUser: (id) => dispatch(fetchUser(id)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ClientSiteItem);
