const database = require('../database');
const { getUserContext, mergeUserContext, updateUserContext } = require('../userContext');
const constants = require('../constants');
const moment = require('moment-timezone');
const { sendAPI, callSendAPI } = require('./sendAPI');


/**
* Get movies based on a (date)
*
*/
exports[constants.GENERIC_TEMPLATE_MOVIES] = async (sender_psid, response, context) => {
    //Answer user that search has began
    await sendAPI(sender_psid, { text: "Déjame mostrarte..." }).catch(err => { console.log(err); });

    //ids of movies available for selected date
    const id_movie_for_date = [];
    database.schedules.contentCinemaShows.forEach(contentCinema => {
        //Find content for selected movie
        contentCinema.cinemaShows.forEach(cinemaShow => {
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
        updateUserContext(sender_psid, {});
    }

    /**
    * Response is now nurtured for user to receive it, send it to user
    */
    console.log('\n GENERATED RESPONSE: ' + JSON.stringify(response, null, 1))
    await sendAPI(sender_psid, response, { with_typing: true }).catch(err => { console.log(err); });
};


/**
* Get movies based on a (date, place)
*
*/
exports[constants.GENERIC_TEMPLATE_MOVIES_PLACE] = async (sender_psid, response, context) => {
    //Answer user that search has began
    await sendAPI(sender_psid, { text: "Déjame mostrarte..." }).catch(err => { console.log(err); });

    //ids of movies available for selected date
    const id_movie_for_date = [];

    database.schedules.contentCinemaShows.forEach(contentCinema => {
        //Find content for selected movie
        contentCinema.cinemaShows.forEach(cinemaShow => {
            //Check if cinemas is for selected place            
            if (cinemaShow.cinema.name.toLowerCase() === context.data.place.toLowerCase()){

                cinemaShow.shows.some(show => {
                    //Check if show is for selected date
                    var show_date = moment(show.date).dayOfYear();
                    var user_date = moment(context.data.date).dayOfYear();
                    if (show_date === user_date) {

                        //Movie found is displayed on selected (date, place)
                        id_movie_for_date.push(contentCinema.contentId)
                        //Exit iteration
                        return true;
                    }
                });
            }
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
        response = { text: `No encontré peliculas para ${context.data.date_synonym} en ${context.data.place}. Recuerda que la cartelera cambia todos los jueves.` };
        updateUserContext(sender_psid, {});
    }

    /**
    * Response is now nurtured for user to receive it, send it to user
    */
    console.log('\n GENERATED RESPONSE: ' + JSON.stringify(response, null, 1))
    await sendAPI(sender_psid, response, { with_typing: true }).catch(err => { console.log(err); });
};


/*
* Get movies based on (genre, date)
*
*/
exports[constants.GENERIC_TEMPLATE_MOVIES_GENRE] = async (sender_psid, response, context) => {
    database.movies.forEach(movie => {
        //Example : ['comedia', 'accion']
        const movie_genres = movie.content.genre.split(', ').map(genre => genre.toLowerCase());
        if (movie_genres.indexOf(context.data.genre.toLowerCase()) !== -1) {
            // Movie contains selected genre
            response.attachment.payload.elements.push(
                {
                    title: movie.content.title,
                    subtitle: movie.content.synopsis,
                    image_url: movie.content.posterUrl,
                    buttons: [
                        {
                            type: "postback",
                            title: "Elegir",
                            payload: movie.content.title
                        }
                    ]

                }
            )
        }
    });
    /**
    * Response is now nurtured for user to receive it, send it to user
    */
    console.log('\n GENERATED RESPONSE: ' + JSON.stringify(response, null, 1))
    await sendAPI(sender_psid, response, { with_typing: true }).catch(err => { console.log(err); });
};


/*
* Get movies based on (genre, date)
*
*/
exports[constants.GENERIC_TEMPLATE_MOVIES_GENRE_PLACE] = async (sender_psid, response, context) => {
    try {
        database.movies.forEach(movie => {
            //Example : ['comedia', 'accion']
            const movie_genres = movie.content.genre.split(', ').map(genre => genre.toLowerCase());
    
            // Movie contains selected genre
            if (movie_genres.indexOf(context.data.genre.toLowerCase()) !== -1) {
                
                movie.cinemasIds.forEach(cinema => {               
                    //Movie is on selected place
                    if (cinema.name.toLowerCase() === context.data.place.toLowerCase()) {
                        response.attachment.payload.elements.push(
                            {
                                title: movie.content.title,
                                subtitle: movie.content.synopsis,
                                image_url: movie.content.posterUrl,
                                buttons: [
                                    {
                                        type: "postback",
                                        title: "Elegir",
                                        payload: movie.content.title
                                    }
                                ]
    
                            }
                        )
                    }
                })
            }
        });
    }
    catch (err) {
        console.log(err);
    }
    
    /**
    * Response is now nurtured for user to receive it, send it to user
    */
    console.log('\n GENERATED RESPONSE: ' + JSON.stringify(response, null, 1))
    await sendAPI(sender_psid, response, { with_typing: true }).catch(err => { console.log(err); });
};


/**
 * Get schedule for selected (date, movie, place)
 * 
 */
exports[constants.GENERIC_TEMPLATE_SCHEDULE] = async (sender_psid, response, context) => {

    await sendAPI(sender_psid, { text: "Te muestro los horarios..." }).catch(err => { console.log(err); });
    
    //Find id of selected movie
    const selected_movie = database.movies_id.find(movie => {
        return movie.title === context.data.movie;
    })
    database.schedules.contentCinemaShows.forEach(contentCinema => {
        //Find content for selected movie
        if (contentCinema.contentId === selected_movie.id) {
            contentCinema.cinemaShows.forEach(cinemaShow => {
                //Check if cinemas is for selected place
                if (cinemaShow.cinema.name === context.data.place) {
                    cinemaShow.shows.forEach(show => {
                        //Check if show is for selected date
                        var show_date = moment(show.date).dayOfYear();
                        var user_date = moment(context.data.date).dayOfYear();
                        if (show_date === user_date) {
                            response.attachment.payload.elements.push(
                                {
                                    title: `Día: ${show.dateToDisplay}   Hora: ${show.timeToDisplay}`,
                                    subtitle: show.formatLang,
                                }
                            )
                        }
                    })
                }
            });

        }
    })
    if (!response.attachment.payload.elements.length) {
        response = { text: `No encontré horarios para ${context.data.date_synonym}. Recuerda que la cartelera cambia todos los jueves.` };
    }
    //End of dialog, clear context
    updateUserContext(sender_psid, {});
    /**
    * Response is now nurtured for user to receive it, send it to user
    */
    console.log('\n GENERATED RESPONSE: ' + JSON.stringify(response, null, 1))
    await sendAPI(sender_psid, response, { with_typing: true }).catch(err => { console.log(err); });
};