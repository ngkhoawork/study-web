import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'react-bootstrap'
import t from 'tcomb-form'
import { clearSelectedSite } from 'actions'

import {
  getModel as getFormType,
  options as formOptions
} from 'forms/EditSite'

import SiteItem from './SiteItem'
import './styles.less'

const TCombForm = t.form.Form

export default class SitesList extends Component {

  static propTypes = {
    sites: PropTypes.array,
    users: PropTypes.array,
    selectedSite: PropTypes.object,
    clearSelectedSite: PropTypes.func
  }

  constructor (props) {
    super(props)
  }

  modalShouldBeShown () {
    return (this.props.selectedSite !== null)
  }

  closeModal () {
    this.props.clearSelectedSite()
  }

  updateSite (ev) {
    ev.preventDefault()
    const value = this.refs.form.getValue()

    if (value) {
      console.log(value)
    }
  }

  render () {
    const { sites, users, selectedSite } = this.props
    const sitesListContents = sites.map((item, index) => (
      <SiteItem {...item} key={index} />
    ))

    if (sites.length > 0) {
      return (
        <div className="row">
          <div className="col-sm-12">
            <h3>Sites</h3>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>SITE NAME</th>
                    <th>PRINCIPAL INVESTIGATOR</th>
                    <th>SITE PHONE</th>
                    <th>SITE ADDRESS</th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {sitesListContents}
                </tbody>
              </table>
            </div>
            <Modal className="edit-site" show={this.modalShouldBeShown()} onHide={this.closeModal.bind(this)}>
              <form className="form-green" onSubmit={this.updateSite.bind(this)}>
                <Modal.Header closeButton>
                  <Modal.Title>Edit Site</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <TCombForm ref="form" type={getFormType(selectedSite)} options={formOptions} />
                </Modal.Body>
                <Modal.Footer>
                  <button type="submit" className="btn btn-default">UPDATE</button>
                </Modal.Footer>
              </form>
            </Modal>
          </div>
        </div>
      )
    } else {
      return <div />
    }
  }
}

const mapStateToProps = (state) => ({
  sites: state.sites,
  users: state.users,
  selectedSite: state.selectedSite
})
const mapDispatchToProps = {
  clearSelectedSite
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SitesList)
