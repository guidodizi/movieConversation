const database_file_test = require('./database_file_test');
const moment = require('moment-timezone');
const repositoryContainer = require('../repositories/repositoryContainer')(database_file_test)
const assert = require('assert')


describe('get_schedule_idMovies', () => {
    describe('#test on movie parameter', () => {
        it('should return array with 3 times id of movie asked since Deseo de Matar is in 2 places', () => {
            //id for Deseo de Matar
            const id = "eac6bc25-f495-451c-85fe-5e651697ea13";
            assert.deepStrictEqual([id, id, id], repositoryContainer.get_schedule_idMovies(null, null, id))
        })
        it('should return array with id for Deseo de Matar since place is Montevideo Shopping', () => {
            //id for Deseo de Matar
            const id = "eac6bc25-f495-451c-85fe-5e651697ea13";
            assert.deepStrictEqual([id], repositoryContainer.get_schedule_idMovies(null, 'Movie Montevideo', id))
        })
        it('should return array with id for Deseo de Matar since place is Montevideo Shopping and date is 2018-03-13', () => {
            //id for Deseo de Matar
            const id = "eac6bc25-f495-451c-85fe-5e651697ea13";
            assert.deepStrictEqual([id], repositoryContainer.get_schedule_idMovies('2018-03-13', 'Movie Montevideo', id))
        })
        it('should return empty array since date is 2018-04-13 and there are no shows yet for next month', () => {
            //id for Deseo de Matar
            const id = "eac6bc25-f495-451c-85fe-5e651697ea13";
            assert.deepStrictEqual([], repositoryContainer.get_schedule_idMovies('2018-04-13', null, id))
        })
    })
    describe('#test on place parameter', () => {
        it('should return array with movies on Movie Portones', () => {
            const what_should_be = database_file_test.movies.filter(movie => {
                return (movie.content.cinemasIds.some(cinema => {
                    return (cinema.name === 'Movie Portones')
                }))
            }).map(movie => movie.content.id)

            const what_is = repositoryContainer.get_schedule_idMovies(null, 'Movie Portones');
            what_is.forEach( elem => assert.notEqual(what_should_be.indexOf(elem), -1))
        })
        it('should return array with movies on Movie Portones, on date 2018-03-13', () => {
            const what_should_be = database_file_test.schedules.contentCinemaShows.filter(contentCinema => {
                return(contentCinema.cinemaShows.some(cinemaShow => {
                    if (cinemaShow.cinema.name.toLowerCase() === 'movie portones') {
                        return (cinemaShow.shows.some(show => {
                            var show_date = moment(show.date).dayOfYear();
                            var user_date = moment("2018-03-13").dayOfYear();
                            return (show.cinemaName.toLowerCase() === 'movie portones' && show_date === user_date) 
                        }))
                    }
                }))
            }).map(e => e.contentId)
            const what_is = repositoryContainer.get_schedule_idMovies('2018-03-13', 'Movie Portones');
            what_is.forEach( elem => assert.notEqual(what_should_be.indexOf(elem), -1))
        })
    })
    describe('#test on date parameter', () => {
        it('should return array with movies on date 2018-03-13', () => {
            const what_should_be = database_file_test.schedules.contentCinemaShows.filter(contentCinema => {
                return(contentCinema.cinemaShows.some(cinemaShow => {
                    return (cinemaShow.shows.some(show => {
                        var show_date = moment(show.date).dayOfYear();
                        var user_date = moment("2018-03-13").dayOfYear();
                        return (show_date === user_date) 
                    }))
                }))
            }).map(e => e.contentId)
            const what_is = repositoryContainer.get_schedule_idMovies('2018-03-13');
            what_is.forEach( elem => assert.notEqual(what_should_be.indexOf(elem), -1))
        })
    })
})