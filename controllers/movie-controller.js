const axios = require('axios');
const {translate} = require("./translate-controller");

exports.search = (req, res) => {
    const query = req.query.q.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    const book = query.charAt(0)
    const url = 'https://v2.sg.media-imdb.com/suggestion/' + book + '/' + query + '.json'

    axios.get(url)
        .then(response => {
            const movies = response.data.d.filter(movie => {
                const type = movie.q;

                if (typeof type === 'undefined') {
                    return false;
                }

                return [
                    'TV mini-series',
                    'TV series',
                    'feature',
                ].includes(type) !== false;


            }).map(movie => {
                return {
                    id: movie.id,
                    rank: movie.rank,
                    title: movie.l,
                    year: movie.y,
                    cast: movie.s,
                    type: movie.q,
                    img: {
                        height: movie.i.height,
                        width: movie.i.width,
                        url: movie.i.imageUrl,
                    },
                };
            })

            req.search =  {q: response.data.q, movies};

            return translate(req, res);

        }).catch(error => {
        return res.status(500).send({
            url,
            error
        });
    });
}
