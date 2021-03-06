/**
*
* CardItem
*
*/

import React, { PropTypes } from 'react';
import { translate } from '../../../common/utilities/localization';


class CardItem extends React.Component { // eslint-disable-line react/prefer-stateless-function

  static propTypes = {
    clientId: PropTypes.number,
    customerId: PropTypes.string,
    deleteCreditCard: PropTypes.func,
    id: PropTypes.string,
    brand: PropTypes.string,
    name: PropTypes.string,
    last4: PropTypes.string,
    exp_month: PropTypes.number,
    exp_year: PropTypes.number,
    isRemoving: PropTypes.bool,
  }

  constructor(props) {
    super(props);
    this.removeItem = this.removeItem.bind(this);
  }

  removeItem() {
    const { id, clientId, customerId } = this.props;
    this.props.deleteCreditCard(clientId, customerId, id);
  }

  render() {
    const { brand, name, last4, isRemoving } = this.props;
    const expMonth = this.props.exp_month;
    const expYear = this.props.exp_year;
    const expMonthStr = (expMonth < 10)? '0' + expMonth: expMonth.toString(); //eslint-disable-line
    const expYearStr = expYear.toString(); //eslint-disable-line
    let brandClassName = '';

    switch (brand) {
      case 'Visa':
        brandClassName = 'brand visa';
        break;
      case 'American Express':
        brandClassName = 'brand american-express';
        break;
      case 'MasterCard':
        brandClassName = 'brand mastercard';
        break;
      case 'Discover':
        brandClassName = 'brand discover';
        break;
      case 'JCB':
        brandClassName = 'brand jcb';
        break;
      case 'Diners Club':
        brandClassName = 'brand diners-club';
        break;
      default:
        brandClassName = 'brand unknown';
    }

    return (
      <tr className="card-container">
        <td className="card-type">
          <span className={brandClassName}></span>
        </td>
        <td className="name-on-card">
          <span>{name}</span>
        </td>
        <td className="last-4-digits">
          <span>{last4}</span>
        </td>
        <td className="expiration-date">
          <span>{expMonthStr}/{expYearStr}</span>
        </td>
        <td className="action">
          <div>
            <button className="btn btn-primary btn-remove-card pull-right" onClick={this.removeItem} disabled={isRemoving}>
              {isRemoving
                ? <span></span>
                : <span>{translate('client.component.cardItem.buttonRemove')}</span>
              }
            </button>
          </div>
        </td>
      </tr>
    );
  }
}

export default CardItem;
