const database = require('../database');
const userContext = require('../userContext');
const constants = require('../constants');
const moment = require('moment-timezone');
const { sendAPI, callSendAPI } = require('./sendAPI');


exports[constants.GENERIC_TEMPLATE_MOVIES] = async (sender_psid, response, context) => {
    //Answer user that search has began
    await sendAPI(sender_psid, { text: "Déjame mostrarte..." }).catch(err => { console.log(err); });

    //ids of movies available for selected date
    const id_movie_for_date = [];
    database.schedules.contentCinemaShows.forEach(contentCinema => {
        //Find content for selected movie
        contentCinema.cinemaShows.forEach(cinemaShow => {
            //Check if cinemas is for selected place
            cinemaShow.shows.some(show => {
                //Check if show is for selected date
                var show_date = moment(show.date).dayOfYear();
                var user_date = moment(context.data.date).dayOfYear();
                if (show_date === user_date) {
                    id_movie_for_date.push(contentCinema.contentId)
                    //Exit iteration
                    return true;
                }
            });
        });

    });
    database.movies.forEach(movie => {
        if (id_movie_for_date.indexOf(movie.content.id) !== -1) {
            response.attachment.payload.elements.push({
                title: movie.content.title,
                subtitle: movie.content.synopsis,
                image_url: movie.content.posterUrl,
                buttons: [{
                    type: "postback",
                    title: "Elegir",
                    payload: movie.content.title
                }]

            })
        }
    });
    if (!response.attachment.payload.elements.length) {
        response = { text: `No encontré peliculas para ${context.data.date_synonym}. Recuerda que la cartelera cambia todos los jueves.` };
        userContext.updateUserContext(sender_psid, {});
    }

    /**
    * Response is now nurtured for user to receive it, send it to user
    */
    console.log('\n GENERATED RESPONSE: ' + JSON.stringify(response, null, 1))
    await sendAPI(sender_psid, response, { with_typing: true }).catch(err => { console.log(err); });
}