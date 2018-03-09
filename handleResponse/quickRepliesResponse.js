const database = require('../database');
const { getUserContext, mergeUserContext, updateUserContext } = require('../userContext');
const constants = require('../constants');
const moment = require('moment-timezone');
const { sendAPI, callSendAPI } = require('./sendAPI');


/**
* Get quick replies of locations available for (date, movie)
*
*/
exports[constants.QUICK_REPLIES_LOCATIONS] = async (sender_psid, response, context) => {
    //Find id of selected movie
    const { id } = database.movies_id.find(movie => {
        return movie.title === context.data.movie;
    });
    database.schedules.contentCinemaShows.forEach(contentCinema => {
        //Find content for selected movie
        if (contentCinema.contentId === id) {
            //Save on context the cinema options for selected movie
            const data_to_change = {
                cinemas: []
            };
            contentCinema.cinemaShows.forEach(cinemaShow => {
                cinemaShow.shows.some(show => {
                    var show_date = moment(show.date).dayOfYear();
                    var user_date = moment(context.data.date).dayOfYear();
                    // shows for selected date
                    if (show_date === user_date) {
                        response.quick_replies.push({
                            content_type: "text",
                            title: show.cinemaName,
                            payload: show.cinemaName,
                        });
                        //Modify user watson context to update what locations are availabe for that movie
                        data_to_change.cinemas.push(show.cinemaName);
                        // Exit cinemaShow.shows iteration as it already found 
                        // a show for selected date on that cinema
                        return true;
                    }
                })
            });
            //Update user context with cinema
            userContext.mergeUserContext(sender_psid, data_to_change);
        }
    });
    //No posible response
    if (!response.quick_replies.length) {
        response = { text: `Lo siento! No hay lugares donde pasen ${context.data.movie}` };
    }
    /**
    * Response is now nurtured for user to receive it, send it to user
    */
    console.log('\n GENERATED RESPONSE: ' + JSON.stringify(response, null, 1))
    await sendAPI(sender_psid, response, { with_typing: true }).catch(err => { console.log(err); });
};


/**
* Get quick repies of possible dates for selected (movie)
*
*/
exports[constants.QUICK_REPLIES_DATE] = async (sender_psid, response, context) => {
    const weekdays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
    //Array so as not to repeat days of show => 2 Saturday options
    const days_of_show = [];
    //Find id of selected movie
    const { id } = database.movies_id.find(movie => {
        return movie.title === context.data.movie;
    });
    database.schedules.contentCinemaShows.forEach(contentCinema => {
        //Find content for selected movie
        if (contentCinema.contentId === id) {
            contentCinema.cinemaShows.forEach(cinemaShow => {
                //Check if cinemas is for selected place
                cinemaShow.shows.forEach(show => {
                    //Check if show is for selected date
                    const show_date = moment(show.date);
                    const now_date = moment().tz("America/Montevideo");
                    if (show_date.dayOfYear() >= now_date.dayOfYear()) {
                        if (days_of_show.indexOf(show_date.weekday()) === -1) {
                            days_of_show.push(show_date.weekday());
                            response.quick_replies.push({
                                content_type: "text",
                                title: weekdays[show_date.weekday()],
                                payload: show_date.format("DD/MM/YYYY"),
                            });
                        }
                    }
                })
            });
        }
    });
    //No posible response
    if (!response.quick_replies.length) {
        response = { text: `Lo siento! No hay días que pasen ${context.data.movie}` };
    }
    /**
    * Response is now nurtured for user to receive it, send it to user
    */
    console.log('\n GENERATED RESPONSE: ' + JSON.stringify(response, null, 1))
    await sendAPI(sender_psid, response, { with_typing: true }).catch(err => { console.log(err); });
};


/**
* Get quick repies of possible dates for selected (movie, place)
*
*/
exports[constants.QUICK_REPLIES_DATE_PLACE] = async (sender_psid, response, context) => {
    const weekdays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
    //Array so as not to repeat days of show => 2 Saturday options
    const days_of_show = [];
    //Find id of selected movie
    const { id } = database.movies_id.find(movie => {
        return movie.title === context.data.movie;
    });
    database.schedules.contentCinemaShows.forEach(contentCinema => {
        //Find content for selected movie
        if (contentCinema.contentId === id) {
            contentCinema.cinemaShows.forEach(cinemaShow => {
                //Check if cinemas is for selected place
                if (cinemaShow.cinema.name === context.data.place) {
                    cinemaShow.shows.forEach(show => {
                        //Check if show is for selected date
                        const show_date = moment(show.date);
                        const now_date = moment().tz("America/Montevideo");
                        if (show_date.dayOfYear() >= now_date.dayOfYear()) {
                            if (days_of_show.indexOf(show_date.weekday()) === -1) {
                                days_of_show.push(show_date.weekday());
                                response.quick_replies.push({
                                    content_type: "text",
                                    title: weekdays[show_date.weekday()],
                                    payload: show_date.format("DD/MM/YYYY"),
                                });
                            }
                        }
                    })
                }
            });
        }
    });
    //No posible response
    if (!response.quick_replies.length) {
        response = { text: `Lo siento! No hay horarios para ${context.data.movie} en ${context.data.place}` };
        // Clear conversation context
        userContext.updateUserContext(sender_psid, {});
    }
    /**
    * Response is now nurtured for user to receive it, send it to user
    */
    console.log('\n GENERATED RESPONSE: ' + JSON.stringify(response, null, 1))
    await sendAPI(sender_psid, response, { with_typing: true }).catch(err => { console.log(err); });
};

