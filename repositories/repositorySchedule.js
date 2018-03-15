const moment = require('moment-timezone');
const database = require('../database/database_file')
const repositoryContainer = require('../repositories/repositoryContainer')

// exports.test = function(a,b,c){
//     const database = this.database
//     console.log(a)
//     console.log(b)
//     console.log(JSON.stringify(c))
// }

exports.get_schedule_idMovies = function (date, place, movie) {
    const database = this.database

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
