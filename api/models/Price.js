/**
 * Price.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  connection: 'remoteMSSQLServer',
  attributes: {
    vendor: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 50
    },
    idV: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 50
    },
    vendorId: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 50
    },
    vendorId2: {
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
    dealerPrice: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 50
    },
    specialPrice: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 50
    },
    openPrice: {
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

