const database_file_test = require('./database_file_test');
const moment = require('moment-timezone');
const assert = require('assert')
const RepositoryContainer = require('../repositories/repositoryContainer')
const repositoryContainer = new RepositoryContainer(database_file_test);

/**
 * Test all functions on templateResponse
 */
describe('Template movies', () => {
    describe('#Movies from 0 - 8', () => {
        var response;
        before(() => {
            response = { attachment: { type: "template", payload: { elements: [] } } };
            var context = {
                data: {
                    movies_pageview: 0
                }
            }
            repositoryContainer.get_template_movies(response, context);

        });
        it('should return 10 items', () => {
            assert.equal(response.attachment.payload.elements.length, 10);
        })
        it('should return movies from 0 to 8 and \"Ver mas\" button', () => {
            var database_movie_titles = database_file_test.movies.slice(0, 9).map(movie => movie.content.title);
            response.attachment.payload.elements.forEach((elem, index) => {
                if (index < response.attachment.payload.elements.length - 1) {
                    assert.notEqual(database_movie_titles.indexOf(elem.title), -1)
                }
            })

            var database_movie_subtitles = database_file_test.movies.slice(0, 9).map(movie => movie.content.synopsis);
            response.attachment.payload.elements.forEach((elem, index) => {
                if (index < response.attachment.payload.elements.length - 1) {
                    assert.notEqual(database_movie_subtitles.indexOf(elem.subtitle), -1)
                }
            })

            var database_movie_posterUrl = database_file_test.movies.slice(0, 9).map(movie => movie.content.posterUrl);
            response.attachment.payload.elements.forEach((elem, index) => {
                if (index < response.attachment.payload.elements.length - 1) {
                    assert.notEqual(database_movie_posterUrl.indexOf(elem.image_url), -1)
                }
            })

            assert.deepStrictEqual(response.attachment.payload.elements[9], {
                title: "Ver más opciones",
                subtitle: "Clickea el botón debajo para ver más opciones de películas",
                image_url: "http://iponline.in/images/view-more.png",
                buttons: [{
                    type: "postback",
                    title: "Ver más",
                    payload: "ver mas"
                }]
            })
        })
        it('all movie buttons on response are correctly formed', () => {
            var database_movie_titles = database_file_test.movies.slice(0, 9).map(movie => movie.content.title);
            response.attachment.payload.elements.forEach((elem, index) => {
                if (index < response.attachment.payload.elements.length - 1) {
                    var i = database_movie_titles.indexOf(elem.buttons[0].payload)
                    assert.deepStrictEqual(elem.buttons, [
                        {
                            type: "postback",
                            title: "Elegir",
                            payload: database_movie_titles[i]
                        }
                    ])
                }
            })
        })
    })

    describe('#Movies from 9-17 ', () => {
        var response;
        before(() => {
            response = { attachment: { type: "template", payload: { elements: [] } } };
            var context = {
                data: {
                    movies_pageview: 1
                }
            }
            repositoryContainer.get_template_movies(response, context);
        })
        it('should return 10 items', () => {
            assert.equal(response.attachment.payload.elements.length, 10);
        })
        it('should return movies from 9 to 17 and \"Ver mas\" button', () => {

            var database_movie_titles = database_file_test.movies.slice(9, 18).map(movie => movie.content.title);
            response.attachment.payload.elements.forEach((elem, index) => {
                if (index < response.attachment.payload.elements.length - 1) {
                    assert.notEqual(database_movie_titles.indexOf(elem.title), -1)
                }
            })
        })
    })

    describe('#Movies from 18 - 26', () => {
        var response;
        before(() => {
            response = { attachment: { type: "template", payload: { elements: [] } } };
            var context = {
                data: {
                    movies_pageview: 2
                }
            }
            repositoryContainer.get_template_movies(response, context);
        })
        it('should return 6 items', () => {
            assert.equal(response.attachment.payload.elements.length, 6);
        })
        it('should return movies from 18 to 23 and \"Ver mas\" button', () => {

            var database_movie_titles = database_file_test.movies.slice(18, 24).map(movie => movie.content.title);
            response.attachment.payload.elements.forEach((elem, index) => {
                if (index < response.attachment.payload.elements.length - 1) {
                    assert.notEqual(database_movie_titles.indexOf(elem.title), -1)
                }
            })
        })
    })
})

describe('Template movies place', () => {
    var response;
    var context;
    beforeEach(() => {
        response = { attachment: { type: "template", payload: { elements: [] } } };
        context = {
            data: {
                movies_pageview: 0,
                place: 'Movie Montevideo',
                date: '2018-03-13'
            }
        }
    })
    it('should return movies for Montevideo Shopping for 2018-03-13', () => {
        repositoryContainer.get_template_movies_place(response, context);
        
        const place_movies_date = [];
        database_file_test.schedules.contentCinemaShows.forEach(contentCinema => {
            contentCinema.cinemaShows.forEach(cinemaShow => {
                cinemaShow.shows.some(show => {
                    var show_date = moment(show.date).dayOfYear();
                    var user_date = moment("2018-03-13").dayOfYear();
                    if (show.cinemaName.toLowerCase() === 'movie montevideo' && show_date === user_date) {
                        place_movies_date.push(contentCinema.contentId)
                        return true;
                    }
                })
            })
        })
        const place_movies_date_title = database_file_test.movies_id.filter(e => place_movies_date.indexOf(e.id) !== -1).map(e => e.title)
        response.attachment.payload.elements.forEach((elem, index) => {
            if (index < response.attachment.payload.elements.length - 1) {
                assert.notEqual(place_movies_date_title.indexOf(elem.title), -1);
            }
        })
    })
    it('should return movies for Portones Shopping for 2018-03-13', () => {
        context.data.place = 'Movie Portones';
        repositoryContainer.get_template_movies_place(response, context);
        
        const place_movies_date = [];
        database_file_test.schedules.contentCinemaShows.forEach(contentCinema => {
            contentCinema.cinemaShows.forEach(cinemaShow => {
                cinemaShow.shows.some(show => {
                    var show_date = moment(show.date).dayOfYear();
                    var user_date = moment("2018-03-13").dayOfYear();
                    if (show.cinemaName.toLowerCase() === 'movie portones' && show_date === user_date) {
                        place_movies_date.push(contentCinema.contentId)
                        return true;
                    }
                })
            })
        })
        const place_movies_date_title = database_file_test.movies_id.filter(e => place_movies_date.indexOf(e.id) !== -1).map(e => e.title)
        response.attachment.payload.elements.forEach((elem, index) => {
            if (index < response.attachment.payload.elements.length - 1) {
                assert.notEqual(place_movies_date_title.indexOf(elem.title), -1);
            }
        })
    })
    it('should return movies for Nuevocentro Shopping for 2018-03-13', () => {
        context.data.place = 'Movie Nuevocentro';
        repositoryContainer.get_template_movies_place(response, context);

        const place_movies_date = [];
        database_file_test.schedules.contentCinemaShows.forEach(contentCinema => {
            contentCinema.cinemaShows.forEach(cinemaShow => {
                cinemaShow.shows.some(show => {
                    var show_date = moment(show.date).dayOfYear();
                    var user_date = moment("2018-03-13").dayOfYear();
                    if (show.cinemaName.toLowerCase() === 'movie nuevocentro' && show_date === user_date) {
                        place_movies_date.push(contentCinema.contentId)
                        return true;
                    }
                })
            })
        })
        const place_movies_date_title = database_file_test.movies_id.filter(e => place_movies_date.indexOf(e.id) !== -1).map(e => e.title)
        response.attachment.payload.elements.forEach((elem, index) => {
            if (index < response.attachment.payload.elements.length - 1) {
                assert.notEqual(place_movies_date_title.indexOf(elem.title), -1);
            }
        })
    })

    it('should return movies for Punta Carretas Shopping for 2018-03-13', () => {
        context.data.place = 'Movie Punta Carretas';
        repositoryContainer.get_template_movies_place(response, context);

        const place_movies_date = [];
        database_file_test.schedules.contentCinemaShows.forEach(contentCinema => {
            contentCinema.cinemaShows.forEach(cinemaShow => {
                cinemaShow.shows.some(show => {
                    var show_date = moment(show.date).dayOfYear();
                    var user_date = moment("2018-03-13").dayOfYear();
                    if (show.cinemaName.toLowerCase() === 'movie punta carretas' && show_date === user_date) {
                        place_movies_date.push(contentCinema.contentId)
                        return true;
                    }
                })
            })
        })
        const place_movies_date_title = database_file_test.movies_id.filter(e => place_movies_date.indexOf(e.id) !== -1).map(e => e.title)
        response.attachment.payload.elements.forEach((elem, index) => {
            if (index < response.attachment.payload.elements.length - 1) {
                assert.notEqual(place_movies_date_title.indexOf(elem.title), -1);
            }
        })
    })
})