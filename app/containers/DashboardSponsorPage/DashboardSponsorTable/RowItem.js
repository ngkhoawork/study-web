import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import Modal from 'react-bootstrap/lib/Modal';
import CenteredModal from '../../../components/CenteredModal/index';
import { AddSponsorForm } from '../DashboardSponsorSearch/AddSponsorForm';

class RowItem extends Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    item: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.state = {
      addSponsorModalOpen: false,
    };

    this.closeAddSponsorModal = this.closeAddSponsorModal.bind(this);
    this.openAddSponsorModal = this.openAddSponsorModal.bind(this);
  }

  closeAddSponsorModal() {
    this.setState({ addSponsorModalOpen: false });
  }

  openAddSponsorModal() {
    this.setState({ addSponsorModalOpen: true });
  }

  render() {
    const initialValues = {
      initialValues: {
        sponsor: this.props.item.name,
        id: this.props.item.id,
      },
    };

    return (
      <tr>
        <td>
          {this.props.item.name}
        </td>
        <td>
          <a className="btn btn-primary btn-edit-site pull-right" onClick={this.openAddSponsorModal}>
            <span>Edit</span>
          </a>
        </td>

        <Modal dialogComponentClass={CenteredModal} className="new-user" id="new-user" show={this.state.addSponsorModalOpen} onHide={this.closeAddSponsorModal}>
          <Modal.Header>
            <Modal.Title>Edit Sponsor</Modal.Title>
            <a className="lightbox-close close" onClick={this.closeAddSponsorModal}>
              <i className="icomoon-icon_close" />
            </a>
          </Modal.Header>
          <Modal.Body>
            <div className="holder clearfix">
              <AddSponsorForm
                {...initialValues}
                isEdit
              />
            </div>
          </Modal.Body>
        </Modal>
      </tr>
    );
  }
}

const mapStateToProps = createStructuredSelector({
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RowItem);
