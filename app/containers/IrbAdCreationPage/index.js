/*
 *
 * IrbAdCreationPage
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { StickyContainer, Sticky } from 'react-sticky';
import { createStructuredSelector } from 'reselect';
import IrbAdCreationForm from 'components/IrbAdCreationForm';
import ShoppingCartForm from 'components/ShoppingCartForm';
import { selectIrbAdCreationFormValues, selectIrbAdCreationFormError } from 'components/IrbAdCreationForm/selectors';
import { selectIrbProductList } from 'containers/IrbAdCreationPage/selectors';
import { submitForm, fetchIrbProductList } from 'containers/IrbAdCreationPage/actions';

import {
  fetchSites,
  fetchIndications,
} from 'containers/App/actions';
import {
  selectSiteLocations,
  selectIndications,
  selectCurrentUser,
} from 'containers/App/selectors';

import _ from 'lodash';

export class IrbAdCreationPage extends React.Component { // eslint-disable-line react/prefer-stateless-function

  static propTypes = {
    siteLocations: PropTypes.array,
    indications: PropTypes.array,
    submitForm: PropTypes.func.isRequired,
    fetchSites: PropTypes.func,
    fetchIndications: PropTypes.func,
    formValues: PropTypes.object,
    hasError: PropTypes.bool,
    currentUser: PropTypes.object,
    productList: PropTypes.array,
    fetchProductList: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.submitForm = this.props.submitForm.bind(this);
    this.onSubmitForm = this.onSubmitForm.bind(this);
  }

  componentDidMount() {
    this.props.fetchSites();
    this.props.fetchIndications();
    this.props.fetchProductList();
  }

  onSubmitForm(params) {
    const siteLocation = _.find(this.props.siteLocations, { id: this.props.formValues.siteLocation });
    this.submitForm(params, {
      ...this.props.formValues,
      siteLocationName: siteLocation.name,
      user_id: this.props.currentUser.id,
      stripeProductId: this.props.productList[0].stripeProductId,
    });
  }

  render() {
    const { siteLocations, indications, hasError, productList } = this.props;

    if (productList[0]) {
      const addOns = [{
        title: productList[0].name,
        price: productList[0].price,
        quantity: 1,
        total: productList[0].price,
      }];

      return (
        <StickyContainer className="container-fluid">
          <section className="study-portal">
            <h2 className="main-heading">ORDER IRB AD CREATION</h2>
            <div className="form-study row">
              <div className="col-xs-6 form-holder">
                <IrbAdCreationForm
                  siteLocations={siteLocations}
                  indications={indications}
                />
              </div>

              <div className="fixed-block">
                <div className="fixed-block-holder">
                  <Sticky className="sticky-shopping-cart">

                    <ShoppingCartForm showCards addOns={addOns} onSubmit={this.onSubmitForm} disableSubmit={hasError} />

                  </Sticky>
                </div>
              </div>

            </div>
          </section>
        </StickyContainer>
      );
    }
    return <div></div>;
  }
}

const mapStateToProps = createStructuredSelector({
  siteLocations : selectSiteLocations(),
  indications   : selectIndications(),
  formValues: selectIrbAdCreationFormValues(),
  hasError: selectIrbAdCreationFormError(),
  currentUser: selectCurrentUser(),
  productList: selectIrbProductList(),
});

function mapDispatchToProps(dispatch) {
  return {
    fetchSites:       () => dispatch(fetchSites()),
    fetchIndications: () => dispatch(fetchIndications()),
    fetchProductList: () => dispatch(fetchIrbProductList()),
    submitForm:     (cartValues, formValues) => dispatch(submitForm(cartValues, formValues)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(IrbAdCreationPage);
