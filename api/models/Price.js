/**
 * Price.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  connection: 'remoteMSSQLServer',
  attributes: {
    iden:{
      type:'number'
    },
    vendor: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 50
    },
    id: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 50
    },
    vendor_id: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 50
    },
    vendor_id2: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 50
    },
    description: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 50
    },
    status: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 50
    },
    currency: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 50
    },
    dealer_price: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 50
    },
    special_price: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 50
    },
    open_price: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 50
    },
    note: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 50
    }
  }
};

