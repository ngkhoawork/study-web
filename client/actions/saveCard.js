import { ActionTypes } from 'ActionTypes'
import { createEntity, updateEntity } from 'utils/entityReadWrite'
import _ from 'lodash'
import asyncAction from 'utils/asyncAction'

export default function saveCard (customerId, cardData) {
  const actionType = cardData.id ? ActionTypes.UPDATE_CARD : ActionTypes.CREATE_CARD

  return asyncAction(actionType, { customerId, cardData }, (cb, dispatch) => {
    dispatch(createEntity('/clients/save_card/' + customerId, cardData, cb))
  })
}
