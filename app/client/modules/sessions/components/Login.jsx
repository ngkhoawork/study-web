import React, { Component, PropTypes } from 'react';
import Input from '../../forms/Input';
import { Button } from 'react-bootstrap';
import classnames from 'classnames';
const styles = require('./styles/Login');

export default class Login extends Component {
  static propTypes = {
    createSession: PropTypes.func.isRequired,
    redirect: PropTypes.string.isRequired,
    replace: PropTypes.func.isRequired,
    isAuthenticated: PropTypes.bool
  }

  constructor(props) {
    super(props);
    this.state = {
      fields: ['email', 'password']
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    this.ensureNotLoggedIn(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.ensureNotLoggedIn(nextProps);
  }

  ensureNotLoggedIn(props) {
    const { isAuthenticated, replace, redirect } = props;

    if (isAuthenticated) {
      replace(redirect);
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    let isValid = true;
    this.state.fields.forEach((ref) => {
      isValid = this.refs[ref].validate() && isValid;
    });
    if (isValid) {
      // params: payload { email, password}, redirect to onSuccess
      this.props.createSession(this.formData(), '/landing');
    }
  }

  formData() {
    const data = {};
    this.state.fields.forEach(ref => {
      data[ref] = this.refs[ref].state.value;
    });
    return data;
  }

  render() {
    return (
      <div className={classnames('container', styles.container)}>
        <div className="row">
          <div className={classnames(styles.center, styles['is-responsive'])}>
            <div classNames="col-sm-12 col-md-10 col-md-offset-1">
              <form ref="login" onSubmit={this.handleSubmit}>
                  <div className={classnames('form-group', 'input-group')}>
                    <span className="input-group-addon">
                      <i className={classnames('glyphicon', 'glyphicon-user')}></i>
                    </span>
                    <Input ref="email"
                      attr={{ placeholder: 'Email' }}
                      label=""
                      name="email"
                      value={this.state.fields.email}
                      validator={[{ fn: v => v.trim().length > 0,
                        message: 'Email is required' }]} />
                  </div>
                  <div className={classnames('form-group', 'input-group')}>
                    <span className="input-group-addon">
                      <i className={classnames('glyphicon', 'glyphicon-lock')}></i>
                    </span>
                    <Input ref="password"
                      attr={{ type: 'password', placeholder: 'Password' }}
                      label=""
                      name="password"
                      value={this.state.fields.password}
                      validator={[{ fn: v => v.trim().length > 0,
                        message: 'Password is required' }]} />
                  </div>
                  <div className={classnames('form-group')}>
                    <Button type="submit"
                      bsStyle={'primary'} block>Login</Button>
                  </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
