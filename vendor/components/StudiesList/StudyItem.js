import React, { PropTypes, Component } from 'react';
import moment from 'moment-timezone';
import classNames from 'classnames';
import Button from 'react-bootstrap/lib/Button';
import ReactTooltip from 'react-tooltip';
import { push } from 'react-router-redux';
import { connect } from 'react-redux';
import { translate } from '../../../common/utilities/localization';

class StudyItem extends Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    currentUser: PropTypes.object,
    index: PropTypes.number,
    studyId: PropTypes.number,
    indication: PropTypes.object,
    campaign: PropTypes.object,
    location: PropTypes.string,
    siteName: PropTypes.string,
    sponsor: PropTypes.string,
    protocol: PropTypes.string,
    patientQualificationSuite: PropTypes.string,
    unreadMessageCount: PropTypes.number,
    status: PropTypes.string,
    siteUsers: PropTypes.array,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    push: PropTypes.func,
    orderNumber: PropTypes.number,
    siteId: PropTypes.number,
    siteTimezone: PropTypes.string,
    url: PropTypes.string,
    level_id: PropTypes.number,
  };

  constructor(props) {
    super(props);

    this.state = {
      buttonsShown: false,
    };

    this.onViewClick = this.onViewClick.bind(this);
    this.showButtons = this.showButtons.bind(this);
    this.hideButtons = this.hideButtons.bind(this);
  }

  onViewClick() {
    const { push, studyId } = this.props;
    push(`/app/vendor/study/${studyId}`);
  }

  showButtons() {
    this.setState({ buttonsShown: true });
  }

  hideButtons() {
    this.setState({ buttonsShown: false });
  }

  parseDate(date, timezone = null) {
    if (!date) {
      return '';
    }
    if (!timezone) {
      return moment(date).utc().format(translate('portals.client.component.studiesList.studyItem.dateMask'));
    }
    return moment(date).tz(timezone).format(translate('portals.client.component.studiesList.studyItem.dateMask'));
  }

  render() {
    const { indication, location, siteName, siteTimezone, sponsor, protocol, patientQualificationSuite, status,
      startDate, endDate, unreadMessageCount, orderNumber, studyId, url } = this.props;
    const buttonsShown = this.state.buttonsShown;

    const landingHref = url ? `/${studyId}-${url.toLowerCase().replace(/ /ig, '-')}` : '';
    let messageCountContent = null;
    if (unreadMessageCount > 0) {
      messageCountContent = (
        <span className="counter-circle">{unreadMessageCount}</span>
      );
    }

    return (
      <tr
        className={classNames('study-container', { 'tr-active': buttonsShown, 'tr-inactive': !buttonsShown })}
        onMouseEnter={this.showButtons} onMouseLeave={this.hideButtons}
      >
        <td className="index">
          <span>{orderNumber}</span>
        </td>
        <td className="indication">
          <a data-for={`indication-${orderNumber}`} data-tip={studyId} href={landingHref} className="tooltip-element landing-link" target="_blank">{indication.name}</a>
          <ReactTooltip id={`indication-${orderNumber}`} type="info" class="tooltipClass wide" delayHide={500} effect="solid" />
        </td>
        <td className="location">
          <span>{location || siteName}</span>
        </td>
        <td className="sponsor">
          <span>{sponsor}</span>
        </td>
        <td className="protocol">
          <span>{protocol}</span>
        </td>
        <td className={classNames('patient-messaging-suite', { off: (patientQualificationSuite === 'Off') })}>
          <span className="patient-messaging-suite-status">{(patientQualificationSuite === 'Off') ? translate('portals.client.component.studiesList.studyItem.off') : translate('portals.client.component.studiesList.studyItem.on')}</span>
          <span>{messageCountContent}</span>
        </td>
        <td className={classNames('status', { inactive: (status === 'Inactive') })}>
          <span>{(status === 'Active' || status === 'Inactive') ? translate(`portals.client.component.studiesList.studyItem.study${status}`) : status}</span>
        </td>
        <td className="start-date">
          <span>{startDate ? this.parseDate(startDate, siteTimezone) : translate('portals.client.component.studiesList.studyItem.tbd')}</span>
        </td>
        <td className="end-date">
          <span>{endDate ? this.parseDate(endDate, siteTimezone) : translate('portals.client.component.studiesList.studyItem.tbd')}</span>
          <div className="btns-slide pull-right">
            <div className="btns">
              <Button bsStyle="default" className="btn-view-patients" onClick={this.onViewClick}>
                {translate('portals.client.component.studiesList.studyItem.viewPatientsBtn')}
              </Button>
            </div>
          </div>
        </td>
      </tr>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  push: (path) => dispatch(push(path)),
});

export default connect(null, mapDispatchToProps)(StudyItem);
