const { mergeUserContext, updateUserContext } = require('../database/userContext');
const constants = require('../constants');
const moment = require('moment-timezone');
const { sendAPI } = require('./serviceSendAPI');
const database = require('../database/database_file');
const RepositoryContainer = require('../repositories/repositoryContainer');
const repositoryContainer = new RepositoryContainer(database);

/**
* Get quick replies of locations available for (date, movie)
*
*/
exports[constants.quickReplies.QUICK_REPLIES_LOCATIONS] = async (sender_psid, response, context) => {
    try {
        //Save on context the cinema options for selected movie
        if (context.data) {
            context.data.cinemas = [];
        } else { throw new Error('No property data in context') }

        response = repositoryContainer.get_quickReplies_location(response, context)

        //Update user context with cinema
        updateUserContext(sender_psid, context);

        //Response is now nurtured for user to receive it, send it to user
        console.log('\n GENERATED RESPONSE: ' + JSON.stringify(response, null, 1))
        await sendAPI(sender_psid, response, { with_typing: true }).catch(err => { console.log(err); });
    } catch (err) { console.log(err); }
};


/**
* Get quick repies of possible dates for selected (movie)
*
*/
exports[constants.quickReplies.QUICK_REPLIES_DATE] = async (sender_psid, response, context) => {
    try {
        response = repositoryContainer.get_quickReplies_data(response, context)

        /**
        * Response is now nurtured for user to receive it, send it to user
        */
        console.log('\n GENERATED RESPONSE: ' + JSON.stringify(response, null, 1))
        await sendAPI(sender_psid, response, { with_typing: true }).catch(err => { console.log(err); });
    } catch (err) { console.log(err); }
};


/**
* Get quick repies of possible dates for selected (movie, place)
*
*/
exports[constants.quickReplies.QUICK_REPLIES_DATE_PLACE] = async (sender_psid, response, context) => {
    try {
        response = repositoryContainer.get_quickReplies_date_place(response, context);

        //No posible response
        if (!response.quick_replies.length) {
            // Clear conversation context
            updateUserContext(sender_psid, {});
        }

        /**
        * Response is now nurtured for user to receive it, send it to user
        */
        console.log('\n GENERATED RESPONSE: ' + JSON.stringify(response, null, 1))
        await sendAPI(sender_psid, response, { with_typing: true }).catch(err => { console.log(err); });
    } catch (err) { console.log(err); }
};

