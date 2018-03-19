const { mergeUserContext, updateUserContext } = require('../database/userContext');
const constants = require('../constants');
const moment = require('moment-timezone');
const { sendAPI } = require('./serviceSendAPI');
const database = require('../database/database_file')
const RepositoryContainer = require('../repositories/repositoryContainer');
const repositoryContainer = new RepositoryContainer(database);


/**
* Get movies based on a (date)
*
*/
exports[constants.templates.GENERIC_TEMPLATE_MOVIES] = async (sender_psid, response, context) => {
    try {
        //Answer user that search has began
        await sendAPI(sender_psid, { text: "Déjame mostrarte..." }).catch(err => { console.log(err); });

        //Set pageview to 0 on context
        if (!context.data || !context.data.movies_pageview) {
            const data = {
                movies_pageview: 0
            }
            mergeUserContext(sender_psid, data)
        }

        response = repositoryContainer.get_template_movies(response, context);

        //No movies found, reset context
        if (response.text && !response.attachment) {
            updateUserContext(sender_psid, {});
        }

        // Response is now nurtured for user to receive it, send it to user
        console.log('\n GENERATED RESPONSE: ' + JSON.stringify(response, null, 1))
        await sendAPI(sender_psid, response, { with_typing: true }).catch(err => { console.log(err); });

    } catch (err) { console.log(err); }
};



/**
* Get movies based on a (date, place)
*
*/
exports[constants.templates.GENERIC_TEMPLATE_MOVIES_PLACE] = async (sender_psid, response, context) => {
    try {
        //Answer user that search has began
        await sendAPI(sender_psid, 
            { text: `Déjame mostrarte que hay en ${context.data.place}...` }
        ).catch(err => { console.log(err); });

        //Set pageview to 0 on context
        if (!context.data || !context.data.movies_pageview) {
            const data = {
                movies_pageview: 0
            }
            mergeUserContext(sender_psid, data)
        }

        response = repositoryContainer.get_template_movies_place(response, context);

        //No movies found, reset context    
        if (response.text && !response.attachment) {
            updateUserContext(sender_psid, {});
        }

        // Response is now nurtured for user to receive it, send it to user
        console.log('\n GENERATED RESPONSE: ' + JSON.stringify(response, null, 1))
        await sendAPI(sender_psid, response, { with_typing: true }).catch(err => { console.log(err); });
    } catch (err) { console.log(err); }
};



/*
* Get movies based on (genre, date)
*
*/
exports[constants.templates.GENERIC_TEMPLATE_MOVIES_GENRE] = async (sender_psid, response, context) => {
    try {
        await sendAPI(sender_psid, 
            { text: `Déjame mostrarte que hay del género ${context.data.genre}...` }
        ).catch(err => { console.log(err); });        

        //Set pageview to 0 on context
        if (!context.data || !context.data.movies_pageview) {
            const data = {
                movies_pageview: 0
            }
            mergeUserContext(sender_psid, data)
        }

        response = repositoryContainer.get_template_movies_genre(response, context)

        console.log(response)
        //No movies found, reset context
        if (response.text && !response.attachment) {
            updateUserContext(sender_psid, {});
        }

        //Response is now nurtured for user to receive it, send it to user
        console.log('\n GENERATED RESPONSE: ' + JSON.stringify(response, null, 1))
        await sendAPI(sender_psid, response, { with_typing: true }).catch(err => { console.log(err); });
    } catch (err) { console.log(err); }
};


/*
* Get movies based on (genre, date)
*
*/
exports[constants.templates.GENERIC_TEMPLATE_MOVIES_GENRE_PLACE] = async (sender_psid, response, context) => {
    try {
        await sendAPI(sender_psid, 
            { text: `Déjame mostrarte que hay del género ${context.data.genre} en ${context.data.place}...` }
        ).catch(err => { console.log(err); });
        
        //Set pageview to 0 on context
        if (!context.data || !context.data.movies_pageview) {
            const data = {
                movies_pageview: 0
            }
            mergeUserContext(sender_psid, data)
        }

        response = repositoryContainer.get_template_movies_genre_place(response, context)

        //No movies found, reset context
        if (response.text && !response.attachment) {
            updateUserContext(sender_psid, {});
        }

        //Response is now nurtured for user to receive it, send it to user
        console.log('\n GENERATED RESPONSE: ' + JSON.stringify(response, null, 1))
        await sendAPI(sender_psid, response, { with_typing: true }).catch(err => { console.log(err); });
    } catch (err) { console.log(err); }
};



/**
 * Get schedule for selected (date, movie, place)
 * 
 */
exports[constants.templates.GENERIC_TEMPLATE_SCHEDULE] = async (sender_psid, response, context) => {
    try {
        await sendAPI(sender_psid, { text: "Te muestro los horarios..." }).catch(err => { console.log(err); });

        response = repositoryContainer.get_template_schedule(response, context);

        //End of dialog, clear context
        updateUserContext(sender_psid, {});

        //Response is now nurtured for user to receive it, send it to user
        console.log('\n GENERATED RESPONSE: ' + JSON.stringify(response, null, 1))
        await sendAPI(sender_psid, response, { with_typing: true }).catch(err => { console.log(err); });
    } catch (err) { console.log(err); }
};


/**
* Get movies based on a (date)
*
*/
exports[constants.templates.GENERIC_TEMPLATE_NEW_RELEASES] = async (sender_psid, response, context) => {
    try {
        //Answer user that search has began
        await sendAPI(sender_psid, { text: "Déjame mostrarte los nuevos estrenos..." }).catch(err => { console.log(err); });

        //Set pageview to 0 on context
        if (!context.data || !context.data.movies_pageview) {
            const data = {
                movies_pageview: 0
            }
            mergeUserContext(sender_psid, data)
        }

        response = repositoryContainer.get_template_new_releases(response, context);

        updateUserContext(sender_psid, {});

        // Response is now nurtured for user to receive it, send it to user
        console.log('\n GENERATED RESPONSE: ' + JSON.stringify(response, null, 1))
        await sendAPI(sender_psid, response, { with_typing: true }).catch(err => { console.log(err); });

    } catch (err) { console.log(err); }
};
