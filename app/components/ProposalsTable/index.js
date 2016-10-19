/**
*
* Proposals Table
*
*/

import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import moment from 'moment';
import './styles.less';

const headers = [
  {
    text: 'Date',
    sort: 'date',
  },
  {
    text: 'Site name',
    sort: 'site',
  },
  {
    text: 'Proposal number',
    sort: 'proposal',
  },
  {
    text: 'Protocol number',
    sort: 'protocol',
  },
  {
    text: 'Total',
    sort: 'total',
  },
];

class ProposalsTable extends Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    selectCurrent:  PropTypes.func,
    selectAll:  PropTypes.func,
    range:  PropTypes.any,
    searchBy:  PropTypes.any, proposals:  PropTypes.any,
    /* selected:  PropTypes.any, */
  };

  constructor(props) {
    super(props);

    this.onClickAll = this.onClickAll.bind(this);
    this.onClickCurrent = this.onClickCurrent.bind(this);
    this.sortBy = this.sortBy.bind(this);

    this.state = {
      checkAll: false,
      proposals: false,
      filteredProposals: null,
      activeSort: null,
      activeDirection: null,
    };
  }

  componentWillReceiveProps(nextProps) {
    // console.log('componentWillReceiveProps', nextProps);
    if (nextProps.proposals) {
      this.setState({
        filteredProposals: null,
      });
    }

    if (nextProps.range) {
      this.rangeSort(nextProps.range);
    }
    if (nextProps.site) {
      this.siteSort(nextProps.site);
    }
    if (nextProps.searchBy) {
      this.searchSort(nextProps.searchBy);
    }
  }

  componentDidUpdate() {}

  onClickCurrent(ev) {
    ev.preventDefault();
    const scope = this;
    let selectedArr = [];
    let key = 0;
    const proposals = this.props.proposals;

    for (const proposal of proposals) {
      if (key === parseInt(ev.currentTarget.firstChild.name, 10)) {
        proposal.selected = (!proposal.selected);

        if (proposal.selected) {
          if (_.isEmpty(this.selectedProposal)) {
            this.selectedProposal = [];
            this.selectedProposal.push(proposal);
          } else {
            selectedArr = this.selectedProposal;
            selectedArr.push(proposal);

            this.selectedProposal = selectedArr;
          }
        } else {
          this.selectedProposal = _.filter(this.selectedProposal, (o) => { return o.site !== proposal.site; });
          if (!this.selectedProposal.length) {
            this.selectedProposal = null;
          }
        }
      }
      key++;
    }

    this.props.selectCurrent(this.selectedProposal);

    this.setState({ proposals }, () => {
      let all = true;
      this.props.proposals.forEach((proposal) => {
        if (!proposal.selected) {
          all = false;
        }
      });

      if (scope.state.checkAll && !all) {
        this.setState({ checkAll: false });
      } else if (!scope.state.checkAll && all) {
        this.setState({ checkAll: true });
      }
    });
  }

  onClickAll(ev) {
    ev.preventDefault();
    const proposals = this.props.proposals;
    for (const proposal of proposals) {
      proposal.selected = (!this.state.checkAll);
    }

    this.setState({ checkAll: (!this.state.checkAll), proposals }, () => {
      this.selectedProposal = (this.state.checkAll) ? proposals : null;
      this.props.selectAll(this.selectedProposal);
    });
  }

  get selectedProposal() {
    return this.SelectedProposal;
  }

  set selectedProposal(value) {
    this.SelectedProposal = value;
  }

  sortBy(ev) {
    ev.preventDefault();
    const sort = ev.currentTarget.dataset.sort;
    let direction = 'down';

    if (ev.currentTarget.className && ev.currentTarget.className === 'down') {
      direction = 'up';
    }

    const proposalsArr = this.state.filteredProposals || this.props.proposals;
    const directionUnits = (direction === 'up') ? {
      more: 1,
      less: -1,
    } : {
      more: -1,
      less: 1,
    };

    switch (sort) {
      case 'date':
        proposalsArr.sort((a, b) => {
          const aDate = new Date(a.created).getTime();
          const bDate = new Date(b.created).getTime();
          if (aDate > bDate) {
            return directionUnits.more;
          }
          if (aDate < bDate) {
            return directionUnits.less;
          }
          return 0;
        });
        break;
      case 'site':
        proposalsArr.sort((a, b) => {
          if (a.site > b.site) {
            return directionUnits.more;
          }
          if (a.site < b.site) {
            return directionUnits.less;
          }
          return 0;
        });
        break;
      case 'proposal':
        proposalsArr.sort((a, b) => {
          if (a.proposalNumber > b.proposalNumber) {
            return directionUnits.more;
          }
          if (a.proposalNumber < b.proposalNumber) {
            return directionUnits.less;
          }
          return 0;
        });
        break;
      case 'protocol':
        proposalsArr.sort((a, b) => {
          if (a.protocol > b.protocol) {
            return directionUnits.more;
          }
          if (a.protocol < b.protocol) {
            return directionUnits.less;
          }
          return 0;
        });
        break;
      case 'total':
        proposalsArr.sort((a, b) => {
          if (a.total > b.total) {
            return directionUnits.more;
          }
          if (a.total < b.total) {
            return directionUnits.less;
          }
          return 0;
        });
        break;
      default:
        break;
    }

    this.setState({ filteredProposals: proposalsArr, activeSort: sort, activeDirection: direction });
  }

  rangeSort(range) {
    const proposalsInRange = [];
    const proposalsArr = this.props.proposals;
    for (const proposal of proposalsArr) {
      const created = new Date(proposal.created).getTime();
      const endDate = new Date(range.endDate).getTime();
      const startDate = new Date(range.startDate).getTime();

      if (created > startDate && created < endDate) {
        proposalsInRange.push(proposal);
      }
    }

    this.setState({ filteredProposals: proposalsInRange });
  }

  siteSort(site) {
    const proposalsMatchSite = [];
    const proposalsArr = this.state.proposals;
    for (const proposal of proposalsArr) {
      if (proposal.site === site.name) {
        proposalsMatchSite.push(proposal);
      }
    }

    this.setState({ filteredProposals: proposalsMatchSite });
  }

  searchSort(searchBy) {
    const proposalsMatchSearch = [];
    const proposalsArr = this.state.proposals;
    for (const proposal of proposalsArr) {
      const number = parseInt(searchBy, 10);
      if (!_.isNaN(number)) {
        if (number === proposal.proposalNumber || number === proposal.protocol) {
          proposalsMatchSearch.push(proposal);
        }
      } else {
        if (searchBy === proposal.site) {
          proposalsMatchSearch.push(proposal);
        }
      }
    }

    this.setState({ filteredProposals: proposalsMatchSearch });
  }

  mapHeaders(raw, state, result) {
    _.map(raw, (header, key) => {
      result.push(
        <th
          key={key}
          data-sort={header.sort}
          onClick={this.sortBy}
          className={(state.activeSort === header.sort) ? state.activeDirection : ''}
        >
          {header.text} <i className="caret-arrow" />
        </th>
      );
    });
  }

  mapProposals(raw, result) {
    _.map(raw, (source, key) => {
      const date = new Date(source.created);
      const dateWrapper = moment(date);
      result.push(
        <tr key={key}>
          <td>
            <span className={(source.selected) ? 'sm-container checked' : 'sm-container'}>
              <span
                className="input-style"
                onClick={this.onClickCurrent}
              >
                <input
                  type="checkbox"
                  name={key}
                />
              </span>
            </span>
          </td>
          <td>{dateWrapper.calendar()}</td>
          <td>{source.site}</td>
          <td>{source.proposalNumber}</td>
          <td>{source.protocol}</td>
          <td>${source.total}</td>
        </tr>
      );
    });
  }

  render() {
    const state = this.state;
    const proposalsArr = state.filteredProposals || this.props.proposals;
    let proposals = [];
    let heads = [];

    this.mapHeaders(headers, state, heads);
    this.mapProposals(proposalsArr, proposals);

    return (
      <div className="table-holder">
        <table className="table">
          <colgroup>
            <col style={{ width: '9%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '24%' }} />
            <col style={{ width: '25%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: 'auto' }} />
          </colgroup>
          <thead>
            <tr>
              <th>
                <span className={(this.state.checkAll) ? 'sm-container checked' : 'sm-container'}>
                  <span className="input-style" onClick={this.onClickAll}>
                    <input name="all" type="checkbox" />
                  </span>
                </span>
                <span>#</span><i className="caret-arrow" />
              </th>
              {heads}
            </tr>
          </thead>
          <tbody>
            {proposals}
          </tbody>
        </table>
      </div>
    );
  }
}

export default ProposalsTable;
