import React, { Component, PropTypes } from 'react';
import { Currencies } from '../../common/constants';

export default class Money extends Component {
  static propTypes = {
    value: PropTypes.number,
    discount: PropTypes.bool,
    currency: PropTypes.oneOf(Object.keys(Currencies)),
    className: PropTypes.string,
  };

  static defaultProps = {
    currency: 'USD',
  };

  render() {
    const value = this.props.value;
    const discount = this.props.discount && value !== 0;
    const currency = this.props.currency || 'USD';
    const className = this.props.className;

    const absValue = Math.abs(value);
    const formattedNumber = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol',
    }).format(absValue).replace(/[A-Z]*/, '');

    return <span className={className}>{(value < 0 || discount) ? '-' : ''}{formattedNumber}</span>;
  }
}
