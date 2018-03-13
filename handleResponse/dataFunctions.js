const moment = require('moment-timezone');
const { getUserContext, mergeUserContext, updateUserContext } = require('../userContext');

function schedule_getIdMovies(database, date, place, movie) {
    var arr = [];
    database.schedules.contentCinemaShows.forEach(contentCinema => {
        if (!movie || contentCinema.contentId === movie) {
            contentCinema.cinemaShows.forEach(cinemaShow => {
                if (!place || cinemaShow.cinema.name.toLowerCase() === place.toLowerCase()) {
                    cinemaShow.shows.some(show => {
                        if (date) {
                            var show_date = moment(show.date).dayOfYear();
                            var user_date = moment(date).dayOfYear();
                        }
                        if (!date || show_date === user_date) {
                            arr.push(contentCinema.contentId)
                            return true;
                        }
                    })
                }
            });
        }
    });
    return arr;
}


exports.schedule_getIdMovies = schedule_getIdMovies;