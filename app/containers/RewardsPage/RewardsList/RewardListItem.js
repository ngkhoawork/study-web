/* eslint-disable camelcase */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment-timezone';
import { findIndex } from 'lodash';

import defaultImage from '../../../assets/images/site_location.png';

class RewardListItem extends Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    id: PropTypes.number,
    points: PropTypes.number,
    balance: PropTypes.number,
    reward_data: PropTypes.string,
    rewardData: PropTypes.object,
    userImageURL: PropTypes.string,
    created: PropTypes.string,
    timezone: PropTypes.string,
    siteLocations: PropTypes.array,
  };

  render() {
    const { balance, points, reward_data, created, timezone } = this.props;
    let { rewardData } = this.props;
    const localTime = moment(created).tz(timezone);
    const date = localTime.format('MM/DD/YYYY');
    const time = localTime.format('hh:mm A');
    if (reward_data) {
      rewardData = JSON.parse(reward_data);
    } else {
      const foundIndex = findIndex(this.props.siteLocations, { id: this.props.site_id });
      if (foundIndex !== -1) {
        rewardData = {
          siteLocationName: this.props.siteLocations[foundIndex].name,
        }
      }
    }

    let content = null;
    content = (
      <tr>
        <td>
          <div className="info clearfix">
            <div className="img-holder bg-gray">
              <img src={defaultImage} alt="" />
            </div>
            { points > 0 ?
              <div className="desc">
                <p><strong>{(rewardData && rewardData.siteLocationName) ? rewardData.siteLocationName : null}</strong> earned {points} KIKs</p>
                <p>{(rewardData && rewardData.description) ? rewardData.description : null}</p>
                <p><strong>{(rewardData && rewardData.siteLocationName) ? rewardData.siteLocationName : null}</strong> now has {balance} KIKs</p>
              </div>
              :
              <div className="desc">
                <p><strong>{rewardData.userName}</strong> {(rewardData && rewardData.description) ? rewardData.description : null}</p>
                <p><strong>{(rewardData && rewardData.siteLocationName) ? rewardData.siteLocationName : null}</strong> now has {balance} KIKs</p>
              </div>
            }
          </div>
        </td>
        <td>{ date }</td>
        <td>{ time } </td>
        <td>{ points > 0 ? `+${points}` : points }</td>
        <td>{ balance }</td>
      </tr>
    );
    return content;
  }
}

export default connect(null, null)(RewardListItem);
