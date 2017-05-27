/**
 * Price.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    connection: 'userMongodbServer',
    schema: true,
    //autoUpdatedAt:false,
    attributes: {
        vendor: {
            type: 'string',
            required: true
        },
        dax_id: {
            type: 'integer',
            required: true
            //  maxLength: 50
        },
        vendor_id: {
            type: 'string'
        },
        vendor_id2: {
            type: 'string'
        },
        description: {
            type: 'string',
            required: true
        },
        status: {
            type: 'string'
        },
        currency: {
            type: 'string'
            // required: true
        },
        dealer_price: {
            type: 'string',
            required: true
        },
        special_price: {
            type: 'string'
        },
        open_price: {
            type: 'string'
            // required: true
        },
        date_price:{
            
        },
        note: {
            type: 'string'
        }
    }
};

