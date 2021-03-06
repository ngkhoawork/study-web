import React, { PropTypes } from 'react';
import { Modal } from 'react-bootstrap';
import moment from 'moment-timezone';
import _ from 'lodash';

import CenteredModal from '../../../../components/CenteredModal';

import { SchedulePatientModalType } from '../../../../common/constants';
import { translate } from '../../../../../common/utilities/localization';

const AllEventsModal = ({ visible, events, date, handleCloseModal, handleEdit, setAllModalDeferred, sortBy, paginationOptions }) => {
  let sorted = events;

  if (paginationOptions.activeDirection && paginationOptions.activeSort) {
    const dir = ((paginationOptions.activeDirection === 'down') ? 'desc' : 'asc');

    sorted = _.orderBy(events, [(o) => {
      if (paginationOptions.activeSort === 'patientName') {
        return `${o.data.patient.firstName} ${o.data.patient.lastName}`;
      } else if (paginationOptions.activeSort === 'time') {
        return o.data.time;
      }
      return false;
    }], [dir]);
  }
  return (
    <Modal dialogComponentClass={CenteredModal} show={visible} onHide={handleCloseModal} id="all-patients-modal">
      <Modal.Header>
        <Modal.Title>{moment(date).format(translate('portals.component.calendarPage.allEventsModal.modalTitleDateMask'))}</Modal.Title>
        <a className="lightbox-close close" onClick={handleCloseModal}>
          <i className="icomoon-icon_close" />
        </a>
      </Modal.Header>
      <Modal.Body>
        <div className="scroll-holder jcf--scrollable">
          <div className="list-head clearfix">
            <div onClick={sortBy} data-sort="patientName" className={(paginationOptions.activeSort === 'patientName') ? `${paginationOptions.activeDirection} col patient-name` : 'col patient-name'}>
              {translate('portals.component.calendarPage.allEventsModal.patientColumn')} <i className="caret-arrow" />
            </div>
            <div className="col site-location hidden">
              {translate('portals.component.calendarPage.allEventsModal.siteColumn')} <i className="caret-arrow" />
            </div>
            <div className="col protocol hidden">
              {translate('portals.component.calendarPage.allEventsModal.protocolColumn')} <i className="caret-arrow" />
            </div>
            <div onClick={sortBy} data-sort="time" className={(paginationOptions.activeSort === 'time') ? `${paginationOptions.activeDirection} col time` : 'col time'}>
              {translate('portals.component.calendarPage.allEventsModal.timeColumn')} <i className="caret-arrow" />
            </div>
          </div>
          <div className="patient-list">
            <div className="list-holder">
              <div className="list-unstyled">
                {
                  sorted.map((event, index) => (
                    <li key={index}>
                      <a className="btn btn-gray-outline lightbox-opener">
                        <span className="patient-name">{`${event.data.patient.firstName ? event.data.patient.firstName : ''} ${event.data.patient.lastName ? event.data.patient.lastName : ''}`}</span>
                        <span className="time">{event.data.time.format(translate('portals.component.calendarPage.allEventsModal.timeMask'))}</span>
                        <span
                          className="btn btn-primary"
                          onClick={() => {
                            setTimeout(() => {
                              handleCloseModal();
                              setAllModalDeferred(true);
                            }, 700);
                            handleEdit(SchedulePatientModalType.UPDATE, event);
                          }}
                        >
                          {translate('portals.component.calendarPage.allEventsModal.editBtn')}
                        </span>
                      </a>
                    </li>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

AllEventsModal.propTypes = {
  visible: PropTypes.bool,
  events: PropTypes.array,
  date: PropTypes.object,
  handleCloseModal: PropTypes.func,
  handleEdit: PropTypes.func,
  setAllModalDeferred: PropTypes.func,
  sortBy: PropTypes.func,
  paginationOptions: PropTypes.object,
};

export default AllEventsModal;
