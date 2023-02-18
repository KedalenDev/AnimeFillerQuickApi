// import * as express from 'express'
// import { IAnime, reBuilDb } from './scrapper';
// // import {apiKeyAuth} from '@vpriem/express-api-key-auth'
// import * as dotenv from 'dotenv';
// import * as http from 'http';
// import * as bodyParser from 'body-parser';

// const app = express()
// import * as cors from "cors";

// import {fb} from './firebase';
// import { collection, where, query as fbQuery, getDocs, doc, getDoc } from 'firebase/firestore';

// const server = http.createServer(app);


// dotenv.config();


// //Dump IN_MEMORY to firebase




// // app.use(apiKeyAuth([process.env.API_KEY!]))

// app.use(cors({
//     origin: '*',
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     credentials: true,
// }));

// app.use(bodyParser.json());
// app.get('/rebuild', async (req, res) => {

//     await reBuilDb();

    

//     res.status(200).send({});
// })


// app.get('/animes', async (req, res) => {
//     const query = req.query.q;
//     const title = req.query.t;
//     const animes =  collection(fb, 'animes');
//     let q : ReturnType<typeof fbQuery> | undefined; 
//     if(query) {
//         //Query
//         q = fbQuery(animes, where('keywords', 'array-contains', query as string))
//     }
//     if(title) {
//         const capitalizeTitle = (title as string).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
//         q = fbQuery(animes, where('name', '==', capitalizeTitle))
//     }

//     if(q) {
//         const querySnapshot = await getDocs(q);
//         const animes : IAnime[] = [];
//         querySnapshot.forEach((doc) => {
//             animes.push(doc.data() as IAnime);
//         });
//         return res.status(200).send(animes.map(anime => ({
//             id: anime.id,
//             name: anime.name,
//         })));
//     }

//     return res.status(404).send({});
// })

// app.get('/animes/:id', async (req, res) => {
//     const id = req.params.id;
//     if(!id) {
//         res.status(404).send({});
//     }
//     const result = await getDoc(doc(fb, 'animes', id.toString()))
//     if(result && result.exists() && result.data()) {
//         res.status(200).send(result.data());
//     } else {
//         res.status(404).send({});
//     }
// })

// app.get('/animes/:id/:ep', async (req, res) => {
//     const id = req.params.id;
//     const episodeParam = req.params.ep;
//     if(!episodeParam || !id) {
//         res.status(404).send({});
//         return;
//     }
//     const result = await getDoc(doc(fb, 'animes', id.toString()))

//     if(result && result.exists() && result.data()) {

//         const _data = result.data() as IAnime;
//         const episode = _data.episodes.find(ep => ep.ep === parseInt(episodeParam));
//         if(episode) {

//             //Knowing this fetch all the episodes
//             if(episode.type === 'RELLENO') {
//                 //Find the next episode with type !== RELLENO
//                 const nextEpisode = _data.episodes.find(ep => ep.ep > episode.ep && ep.type !== 'RELLENO');
//                 if(nextEpisode) {
//                     res.status(200).send({
//                         ...episode,
//                         nextEpisode: nextEpisode.ep,
//                     });
//                     return;
//                 }
//             }

//             res.status(200).send(episode);
//         } else {
//             res.status(404).send({
//                 message: 'Episode not found'
//             });
//         }
//     } else {
//         res.status(404).send({});
//     }
// })

// server.listen(3003,'0.0.0.0', () => {

//     //get app listening port
//     const add : any = server.address();
//     const port =add.port;
//     //get app host
//     const host = add.address;

//     console.log(`Server listening at http://${host}:${port}`);
// });

// import {main} from '../anilist';

// main();