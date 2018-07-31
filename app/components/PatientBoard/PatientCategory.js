/* eslint-disable no-cond-assign */
/**
 * Created by mike on 10/24/16.
 */

import React from 'react';
import { connect } from 'react-redux';
import { DropTarget } from 'react-dnd';
import { createStructuredSelector } from 'reselect';
import _ from 'lodash';
import classNames from 'classnames';
import { List, AutoSizer, WindowScroller } from 'react-virtualized';
import VirtualList from 'react-virtual-list';
import moment from 'moment-timezone';

import * as Selector from '../../containers/StudyPage/selectors';
import { selectCurrentUser } from '../../containers/App/selectors';
import DragTypes from './dragSourceTypes';
import Patient from './Patient';
import {
  schedulePatient,
  submitMovePatientBetweenCategories,
  showScheduledModal,
} from '../../containers/StudyPage/actions';
import { translate } from '../../../common/utilities/localization';
/**
 * Specifies the drop target contract.
 * All methods are optional.
 */
const shouldLock = (props, patient) => {
  const { campaign, campaigns, category, currentUser } = props;
  let shouldLock;
  if (currentUser.isProxy) {
    shouldLock = false;
  } else if (category.id <= CALL_ATTEMPT_ID) {
    if (campaign && campaign !== -1) {
      const c = _.find(campaigns, { id: campaign });
      shouldLock = c.patientQualificationSuite;
    } else {
      shouldLock =  _.findIndex(campaigns, c => {
        if (c.patientQualificationSuite) {
          const createdAt = moment(patient.createdAt);
          const start = moment(c.dateFrom);
          const end = moment(c.dateTo);
          return createdAt.isAfter(start) && createdAt.isBefore(end);
        }
        return false;
      }) > -1;
    }
  } else {
    shouldLock = false;
  }
  return shouldLock;
};
const patientTarget = {
  drop(props, monitor) {
    if (monitor.didDrop()) {
      return;
    }

    const patientDragSwitcher = (category, item, patientId) => {
      if (category.name === 'Scheduled') {
        // store the scheduled patient information temporarily since the user could cancel out of their category movement
        // props.schedulePatient(props.studyId, item.patientCategoryId, props.category.id, item.id);
        props.onPatientDraggedToScheduled(item.id, item.patientCategoryId, category.id);
      } else if (item.patientCategoryId !== category.id) {
        props.submitMovePatientBetweenCategories(props.studyId, item.patientCategoryId, category.id, item.id, patientId);
      }
    };

    // access the coordinates
    const clientOffset = monitor.getClientOffset();
    const el = document.elementFromPoint(clientOffset.x, clientOffset.y);
    // Obtain the dragged item
    const item = monitor.getItem();
    let patientId = null;
    let ancestor = null;

    const findAncestor = (el, cls) => {
      let i = el;
      while ((i = i.parentElement) && !i.classList.contains(cls));
      return i;
    };

    ancestor = findAncestor(el, 'patient-li');

    if (ancestor) {
      patientId = parseInt(ancestor.dataset.patientId);
      if (!ancestor.previousSibling) {
        patientId = null;
      } else {
        patientId = parseInt(ancestor.previousSibling.dataset.patientId);
        // patientId = parseInt(ancestor.dataset.patientId);

        if (!ancestor.nextSibling) {
          patientId = parseInt(ancestor.dataset.patientId);
        }

        if (item.id === patientId) {
          patientId = parseInt(ancestor.dataset.patientId);
        }
      }
    }

    if (!props.study.suvodaProtocolId || props.study.suvodaProtocolId === '') {
      patientDragSwitcher(props.category, item, patientId);
    } else if (props.category.id !== 6 && props.category.id !== 7 && props.category.id !== 8 && item.patientCategoryId !== 6 && item.patientCategoryId !== 7 && item.patientCategoryId !== 8) {
      patientDragSwitcher(props.category, item, patientId);
    }
  },
  canDrop(props, monitor) {
    const { patient } = monitor.getItem();
    return !shouldLock(props, patient);
  },
};

const collect = (connect, monitor) => ({
  // Call this function inside render()
  // to let React DnD handle the drag events:
  connectDropTarget: connect.dropTarget(),
  // You can ask the monitor about the current drag state:
  isOver: monitor.isOver(),
  isOverCurrent: monitor.isOver({ shallow: true }),
  canDrop: monitor.canDrop(),
  itemType: monitor.getItemType(),
});

const CALL_ATTEMPT_ID = 2;
@DropTarget(DragTypes.PATIENT, patientTarget, collect)
class PatientCategory extends React.Component {
  static propTypes = {
    itemType: React.PropTypes.any,
    study: React.PropTypes.object.isRequired,
    studyId: React.PropTypes.number.isRequired,
    category: React.PropTypes.object.isRequired,
    campaign: React.PropTypes.number,
    campaigns: React.PropTypes.any,
    connectDropTarget: React.PropTypes.func.isRequired,
    currentPatientId: React.PropTypes.number,
    currentSite: React.PropTypes.object,
    submitMovePatientBetweenCategories: React.PropTypes.func.isRequired,
    onPatientClick: React.PropTypes.func.isRequired,
    isOver: React.PropTypes.bool.isRequired,
    onPatientTextClick: React.PropTypes.func.isRequired,
    currentUser: React.PropTypes.object,
    patientCategoriesTotals: React.PropTypes.array,
  };

  constructor(props) {
    super(props);
    this.state = {
      columnWidth: '',
      hover: false,
    };
    this.handleResize = this.handleResize.bind(this);
    this.renderPatients = this.renderPatients.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      hover: nextProps.isOver,
    });
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.itemType === 'patient' && !this.props.itemType) {
      return false;
    }

    return true;
  }

  componentDidUpdate() {
    if (this.state.columnWidth === '') {
      this.handleResize();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize() {
    const patientColumn = this.patientColumn;

    this.setState({ columnWidth: `${patientColumn.clientWidth}px` });
  }

  rowRenderer = ({ key, index, style }) => {
    const { category, currentPatientId, onPatientClick, onPatientTextClick, currentSite } = this.props;
    const patient = category.patients[index];
    return (
      <Patient
        key={key}
        category={category}
        currentUser={this.props.currentUser}
        currentPatientId={currentPatientId}
        patient={patient}
        unreadMessageCount={patient.unreadMessageCount}
        currentSite={currentSite}
        onPatientClick={onPatientClick}
        onPatientTextClick={onPatientTextClick}
        style={style}
      />
    );
  }

  myList = ({
    virtual,
    itemHeight,
  }) => (
    <ul className="list-unstyled auto-height" style={virtual.style}>
      {virtual.items.map(patient => (
        <Patient
          key={patient.id}
          category={this.props.category}
          currentUser={this.props.currentUser}
          currentPatientId={this.props.currentPatientId}
          patient={patient}
          unreadMessageCount={patient.unreadMessageCount}
          currentSite={this.props.currentSite}
          onPatientClick={this.props.onPatientClick}
          onPatientTextClick={this.props.onPatientTextClick}
          style={{ height: itemHeight }}
          isLocked={shouldLock(this.props, patient)}
        />
      ))}
    </ul>
  );

  renderWithReactVirtualized = (count) => (
    <WindowScroller>
      {({ height, isScrolling, onChildScroll, scrollTop }) => (
        <AutoSizer disableHeight>
          {({ width }) => (
            <List
              autoHeight
              height={height}
              width={width}
              isScrolling={isScrolling}
              onScroll={onChildScroll}
              rowCount={count}
              rowHeight={120}
              rowRenderer={this.rowRenderer}
              scrollTop={scrollTop}
            />
          )}
        </AutoSizer>
      )}
    </WindowScroller>
  );

  renderWithVirutalList = () => {

  }

  renderPatients() {
    const { category } = this.props;
    if (category.patients.length > 0) {
      const MyVirtualList = VirtualList()(this.myList);
      return (
        <div className="slide">
          <div className="slide-holder">
            <MyVirtualList
              items={category.patients}
              itemHeight={178}
            />
          </div>
        </div>
      );
    }
    return null;
  }

  render() {
    const { category, connectDropTarget, patientCategoriesTotals } = this.props;
    const name = translate(`common.patientCategory.id${category.id}`);
    const total = _.find(patientCategoriesTotals, item => (
      item.patientCategoryId === category.id
    ));

    const openerStyle = {
      width: this.state.columnWidth,
    };

    return connectDropTarget(
      <li
        key={category.id}
        ref={(patientColumn) => {
          this.patientColumn = patientColumn;
        }}
        className={classNames({ active: this.state.hover, hover: this.state.hover })}
      >
        <span className="opener" style={openerStyle}>
          <strong className="number">{(total) ? total.count : 0}</strong>
          <span className="text">{name}</span>
        </span>
        {this.renderPatients()}
      </li>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  currentPatientId: Selector.selectCurrentPatientId(),
  currentSite: Selector.selectSite(),
  study: Selector.selectStudy(),
  studyId: Selector.selectStudyId(),
  currentUser: selectCurrentUser(),
  campaigns: Selector.selectCampaigns(),
});

const mapDispatchToProps = (dispatch) => ({
  /* action to schedule patient with a corresponding modal */
  schedulePatient: (studyId, fromCategoryId, toCategoryId, patientId) => dispatch(schedulePatient(studyId, fromCategoryId, toCategoryId, patientId)),
  showScheduledModal: () => dispatch(showScheduledModal()),
  submitMovePatientBetweenCategories: (studyId, fromCategoryId, toCategoryId, patientId, afterPatientId) => dispatch(submitMovePatientBetweenCategories(studyId, fromCategoryId, toCategoryId, patientId, afterPatientId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PatientCategory);
