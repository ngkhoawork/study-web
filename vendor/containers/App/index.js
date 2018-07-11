/**
 *
 * App.react.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a neccessity for you then you can refactor it and remove
 * the linting exception.
 */

import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import ReactGA from 'react-ga';
import IdleTimer from 'react-idle-timer';
import moment from 'moment-timezone';

import LoadingSpinner from '../../../app/components/LoadingSpinner';
import { logout } from '../../../app/containers/LoginPage/actions';
import { fetchMeFromToken } from './actions';
import { getItem } from '../../../common//utils/localStorage';
import IdleModal from '../../../app/components/IdleModal';
import TopHeaderBar from '../../components/TopHeaderBar';
import SideNavBar from '../../components/SideNavBar';
import SetTimeZoneModal from '../../components/SetTimeZoneModal';

import { selectAuthState, selectCurrentUser } from './selectors';

class App extends React.Component { // eslint-disable-line react/prefer-stateless-function

  static propTypes = {
    children: React.PropTypes.node,
    logout: React.PropTypes.func,
    fetchMeFromToken: React.PropTypes.func.isRequired,
    isLoggedIn: React.PropTypes.bool.isRequired,
    location: React.PropTypes.object,
    userData: React.PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.idleHandler = this.idleHandler.bind(this);
    this.stayLoggedIn = this.stayLoggedIn.bind(this);
    this.state = {
      forceLogout: parseInt(FORCE_LOGOUT), // should be 10 hours in milliseconds
      timeout: parseInt(IDLE_TIMEOUT), // should be 2 hours in milliseconds
      showIdleModal: false,
      showSetTimeZoneModal: false,
    };
  }

  componentWillMount() {
    const authTime = getItem('auth_time');
    // Always load user details from the localStorage Token
    this.props.fetchMeFromToken(true);

    const timerId = setInterval(() => {
      const currentTime = moment();
      if ((currentTime.valueOf() - parseInt(authTime)) > this.state.forceLogout) {
        clearInterval(this.state.timerId);
        this.props.logout();
      }
    }, 600000);

    this.setState({ timerId });

    if (ONE_SIGNAL_APP_ID) {
      const OneSignal = window.OneSignal || [];
      OneSignal.push(['init', {
        appId: ONE_SIGNAL_APP_ID,
        autoRegister: true,
        notifyButton: {
          enable: true, /* Set to false to hide */
        },
      }]);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (window.OneSignal && nextProps.userData) {
      window.OneSignal.push(() => {
        window.OneSignal.sendTags({
          userId: nextProps.userData.id,
        }, () => {});
      });
    }

    if (nextProps.userData && nextProps.userData.needSetup && nextProps.location.pathname !== '/app/me/profile') {
      this.setState({ showSetTimeZoneModal: true });
    } else {
      this.setState({ showSetTimeZoneModal: false });
    }

    if (process.env.NODE_ENV !== 'development') {
      if (!this.props.userData && nextProps.userData) {
        ReactGA.initialize('UA-91568063-1', {
          debug: true,
        });
      }
      if (this.props.location.pathname !== nextProps.location.pathname) {
        ReactGA.set({ page: nextProps.location.pathname });
        ReactGA.pageview(nextProps.location.pathname);
      }
    }
  }

  idleHandler() { // eslint-disable-line react/prefer-stateless-function
    this.setState({ showIdleModal: true });
  }

  stayLoggedIn() { // eslint-disable-line react/prefer-stateless-function
    this.setState({ showIdleModal: false });
  }

  render() {
    const { isLoggedIn, userData } = this.props;

    if (!isLoggedIn) {
      return (
        <div className="container-fluid">
          {React.Children.toArray(this.props.children)}
        </div>
      );
    }

    if (!userData) {
      return (
        <div className="container-fluid">
          <div className="row">
            <div className="col-xs-12 text-center spinner-container">
              <LoadingSpinner showOnlyIcon />
            </div>
          </div>
        </div>
      );
    }

    return (
      <IdleTimer
        element={document}
        events={['mousemove', 'keydown', 'mousedown', 'touchstart']}
        activeAction={this.activeHandler}
        idleAction={this.idleHandler}
        timeout={this.state.timeout}
        startOnLoad
        format="MM-DD-YYYY HH:MM:ss.SSS"
      >
        <div id="wrapper">
          <TopHeaderBar />
          <SideNavBar
            location={this.props.location}
          />
          <main id="main">
            {React.Children.toArray(this.props.children)}
          </main>

          <SetTimeZoneModal show={this.state.showSetTimeZoneModal} currentUserRoleType="vendor" />

          {this.state.showIdleModal && <IdleModal show={this.state.showIdleModal} logout={this.props.logout} stayLoggedIn={this.stayLoggedIn} />}
        </div>
      </IdleTimer>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  isLoggedIn: selectAuthState(),
  userData: selectCurrentUser(),
});

function mapDispatchToProps(dispatch) {
  return {
    fetchMeFromToken: (redirect) => dispatch(fetchMeFromToken(redirect)),
    logout: () => dispatch(logout()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
