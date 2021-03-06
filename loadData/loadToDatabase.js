const request = require ('request');
const fs = require ('fs');

function fetchToMovie (endpoint) {
  return new Promise ((resolve, reject) => {
    request (
      {
        uri: `https://api.movie.com.uy/api` + endpoint,
        method: `GET`,
      },
      (err, res, body) => {
        if (!err) {
          console.log ('done ' + endpoint);
          resolve (JSON.parse (body));
        } else {
          console.log (`error fetching on ${endpoint}`);
          reject (err);
        }
      }
    );
  });
}

Promise.all ([
  fetchToMovie (`/billboard/cinema/weekly?nextReleases=false`),
  fetchToMovie (`/shows/cinema/scheduledShows?begin=22/03/2018`),
  fetchToMovie (`/billboard/cinema/weekly?nextReleases=true`),
])
  .then (results => {
    const movies_id = results[0].items.map (movie => ({
      id: movie.content.id,
      title: movie.content.title,
    }));
    fs.writeFileSync (
      './database/database_file.js',
      `module.exports = ${JSON.stringify ({movies_id, movies: results[0].items, schedules: results[1], movies_newRelease: results[2].items}, null, 2)}`
    );
    console.log ('All done boy.');
  })
  .catch (err => console.log (err));
