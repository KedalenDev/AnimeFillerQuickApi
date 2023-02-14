import * as express from 'express'
import { IAnime, reBuilDb } from './scrapper';
import * as fs from 'fs';
// import {apiKeyAuth} from '@vpriem/express-api-key-auth'
import * as dotenv from 'dotenv';
import * as http from 'http';
import * as bodyParser from 'body-parser';

const app = express()
import * as cors from "cors";
const IN_MEMORY : IAnime[] = JSON.parse(fs.readFileSync('./animes.json', 'utf8'));

const server = http.createServer(app);


dotenv.config();


// app.use(apiKeyAuth([process.env.API_KEY!]))

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(bodyParser.json());
app.get('/rebuild', async (req, res) => {

    await reBuilDb();

    

    res.status(200).send({});
})


app.get('/animes', (req, res) => {
    console.log(req.query);
    const query = req.query.q;
    const title = req.query.t;
    if(query) {
        const results = IN_MEMORY.filter(anime => anime.keywords.includes(query as string));
        res.status(200).send(results.map(anime => ({id: anime.id, name: anime.name})));
    }
    if(title) {
        const results = IN_MEMORY.filter(anime => anime.name.toLowerCase().includes((title as string).toLowerCase()));
        res.status(200).send(results.map(anime => ({id: anime.id, name: anime.name})));
    }
})

app.get('/animes/:id', (req, res) => {
    const id = req.params.id;
    if(!id) {
        res.status(404).send({});
    }
    const result = IN_MEMORY.find(anime => anime.id === parseInt(id!));
    if(result) {
        res.status(200).send(result);
    } else {
        res.status(404).send({});
    }
})

app.get('/animes/:id/:ep', (req, res) => {
    const id = req.params.id;
    const episodeParam = req.params.ep;
    if(!episodeParam || !id) {
        res.status(404).send({});
        return;
    }
    const result = IN_MEMORY.find(anime => anime.id === parseInt(id));
    if(result) {
        const episode = result.episodes.find(ep => ep.ep === parseInt(episodeParam));
        if(episode) {
            res.status(200).send(episode);
        } else {
            res.status(404).send({
                message: 'Episode not found'
            });
        }
    } else {
        res.status(404).send({});
    }
})

server.listen(3000,'0.0.0.0', () => {

    //get app listening port
    const add : any = server.address();
    const port =add.port;
    //get app host
    const host = add.address;

    console.log(`Server listening at http://${host}:${port}`);
});