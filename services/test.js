const { setTimeout } = require('timers');

const constants = require('../constants');
const serviceResponseTemplate = require('./serviceResponseTemplate');
const {mergeUserContext, getUserContext} = require('../database/userContext');

var context = {}

//Set pageview to 0 on context
if (!context.data || !context.data.movies_pageview) {
    const data = {
        movies_pageview: 0
    }
    mergeUserContext(1, data)
}

var context2 = getUserContext(1)
console.log(context2)
console.log(context)