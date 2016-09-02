import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import DocumentTitle from 'react-document-title'

import _ from 'lodash'

import {
  notificationArrived,
  subscribe,
  unsubscribeFromAll,
  displayNotification,
  setSocket
} from 'actions'

import './styles.less'

import TopBar from './TopBar'
import SideBar from './SideBar'
import GlobalNotifications from '../globalNotifications'
import Dispatcher from '../../../utils/dispatcher'

class Application extends React.Component {
  static propTypes = {
    authorization: PropTypes.any,
    socket: PropTypes.any,
    location: PropTypes.any,
    children: PropTypes.any,
    subscribe: PropTypes.func,
    setSocket: PropTypes.func,
    unsubscribeFromAll: PropTypes.func,
    unsubscribeCurrent: PropTypes.func,
    notificationArrived: PropTypes.func,
    displayNotification: PropTypes.func
  }

  getEventTypes () {
    switch (this.props.location.pathname) {
      case '/dashboard':
        return [
          'create-study',
          'create-patient',
        ]
      case '/studies/-100/patient-details':
        return [
          'twilio-message',
        ]
      default:
        return []
    }
  }

  componentDidMount () {
    const scope = this
    this.appDispatcher = new Dispatcher()
    this.subscribe(this.props)

    this.appDispatcher.register(function (payload) {
      if (payload.actionType === 'changePathname') {
        scope.props.unsubscribeFromAll(scope.props.socket, { pathname: scope.props.location.pathname }, (err, data, cb) => {
          cb(err, data)

          scope.props.socket.disconnect()
          //scope.props.socket = null
          // scope.subscribe(scope.props)
        })
      }
    })
  }

  componentWillReceiveProps (nextProps) {
    const events = this.getEventTypes()
    console.log('componentWillReceiveProps')
    //this.subscribe(nextProps)

    if (!_.isEmpty(nextProps.socket)) {
      nextProps.socket.on('connect', () => {
        for (const event of events) {
          nextProps.subscribe(this.props.socket, event,
            { pathname: nextProps.location.pathname }, (err, data, cb) => {
              cb(err, data)
            })
        }
      })
    } else {
      console.error('problem with socket connection')
    }
  }

  subscribe (props) {
    const { setSocket } = this.props
    setSocket(props, 'nsp', (socket) => {
      if (socket) {
        socket.on('notification', (notification) => {
          props.displayNotification(notification)
        })
      }
    })
  }

  render () {
    const { authorized } = this.props.authorization
    return (
      <DocumentTitle title="StudyKik Home Page">
        <div id="wrapper">
          <TopBar authorization={this.props.authorization} location={this.props.location} />
          <SideBar />

          <main id="main">
            {this.props.children}
          </main>

          <GlobalNotifications />
        </div>
      </DocumentTitle>
    )
  }
}

const mapStateToProps = (state) => ({
  authorization: state.authorization,
  location: state.location,
  socket: state.socket
})
const mapDispatchToProps = {
  notificationArrived,
  subscribe,
  unsubscribeFromAll,
  displayNotification,
  setSocket
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Application)
