import { GET_ANIMES } from './anilist';
import {
    IAnimeJsonItem,
    animeFlvRawTypeToAnilistType,
    animeFlvToInternal,
    AnimeGenreEnum,
    AnimeGenre,
    AnimeAirState,
    AnimeType,
    IIntermediateAnimeItemStep
} from './HELPER_TYPES'
import {
    readFile,
    writeFile
} from 'fs/promises'
import { ZodError, z } from 'zod'
const animeSchema = z.object({
    id: z.number(),
    cover: z.string(),
    description: z.string(),
    title: z.string(),
    genres: z.array(z.string().refine(value => value as AnimeGenre)),
    related: z.record(z.array(z.number())),
    state: z.string().refine(v => v as AnimeAirState),
    type: z.string().refine(v => v as AnimeType),
})

const pc = z.object({
    id: z.number(),
    cover: z.string(),
    description: z.string(),
    title: z.string(),
    genres: z.array(z.string().refine(value => value as AnimeGenre)),
    related: z.record(z.array(z.number())),
    state: z.string().refine(v => v as AnimeAirState),
    type: z.string().refine(v => v as AnimeType),
    normalizedPopularity: z.number(),
    popularityByGenere: z.record(z.number()),
    popularityIndex: z.number(),
    ranking: z.number(),
    url: z.string(),
})

type IAnimeItem = Database["public"]["Tables"]["flv"]["Insert"]

const mapJsonItemToAnimeItem = (item: IIntermediateAnimeItemStep, allItems: IIntermediateAnimeItemStep[]): IAnimeItem | null => {




    const mapRelated = (values: string[]) => {
        if (!values) return [];
        return values.map(value => {
            const relatedItem = allItems.find(item => item.title === value);
            if (!relatedItem) {
                return null;
            }
            return relatedItem;
        }).filter(r => r !== null).map(relatedItem => parseInt(relatedItem!.id));
    }
    const result = {
        ...item,
        id: parseInt(item.id),
        type: animeFlvRawTypeToAnilistType(item.type),
        state: item.state === 'Finalizado' ? 'FINISHED' : 'AIRING',
        related: {
            movies: mapRelated(item.related.movies),
            ovas: mapRelated(item.related.ovas),
            specials: mapRelated(item.related.specials),
            prequels: mapRelated(item.related.prequels),
            sequels: mapRelated(item.related.sequels),
            spinoffs: mapRelated(item.related.spinoffs),
        },

    };
    const isValid = animeSchema.safeParse(result)
    if (!isValid.success) {
        return null;
    }

    return result as any;
}


const getAnimes = async (
    slice: number = 0,
): Promise<(IAnimeItem | null)[]> => {
    const animes = await GET_ANIMES(slice) as IIntermediateAnimeItemStep[];


    return animes.map(m => mapJsonItemToAnimeItem(m, animes));
}




import * as express from 'express'
// import {apiKeyAuth} from '@vpriem/express-api-key-auth'
import * as dotenv from 'dotenv';
import * as http from 'http';
import * as bodyParser from 'body-parser';

const app = express()
import * as cors from "cors";
import { createClient } from '@supabase/supabase-js';
import moment = require('moment');
import { Database } from './HELPER_TYPES';
import { toZod } from 'tozod';
import path = require('path');
const server = http.createServer(app);


dotenv.config();


const client = createClient<
    Database
>('https://dbpznlljunitpguktzvu.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRicHpubGxqdW5pdHBndWt0enZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3NjU2NTY1NSwiZXhwIjoxOTkyMTQxNjU1fQ.PRhhtef-rIP3DUXCQHYM73fc76hm0vl201LNQMswl9E');

//Dump IN_MEMORY to firebase




// app.use(apiKeyAuth([process.env.API_KEY!]))

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(bodyParser.json());
const insert = {
    cover: "string",
    description: "string",
    genres: [],
    id: "number",
    normalizedPopularity: "number",
    popularityByGenere: {} as any,
    popularityIndex: "number",
    ranking: "number",
    related: {} as any,
    state: "string",
    title: "string",
    type: "string",
}
app.get('/rebuild', async (req, res) => {


    //get slice query param
    const slice = parseInt(req.query.slice as string);
    const start = moment();
    console.log('Starting rebuild');
    let animes = await getAnimes(
        slice ? isNaN(slice) ? 0 : slice : 0
    );

    //Open ws connection



    let notNullAnimes = animes.filter(a => a !== null) as IAnimeItem[];

    const preLength = notNullAnimes.length;
    console.log(`Got ${preLength} of ${animes.length} animes`)
    const ids = notNullAnimes.map(a => a.id);
    const uniqueIds = new Set(ids);

    let notUnique = ids.filter((item, index) => ids.indexOf(item) != index).map(id => {
        const same = notNullAnimes.filter(a => a.id === id);
        const first = same[0]!;

        if (same.some(s => s.title !== first.title)) {
            console.log(same);
            throw new Error('not same title');
        }

        return id;
    });



    const unique = notNullAnimes.filter(a => !notUnique.includes(a.id));
    await writeFile('notUnique.json', JSON.stringify(notUnique, null, 2));

    console.log(`Got ${unique.length} of ${notUnique.length} animes`)

    const keys = Object.keys(insert);

    const uniqueWithOnlyKeys = unique.map(u => {
        const result = {} as any;
        keys.forEach(k => {
            result[k] = u[k];
        })
        return result;
    })


    const batch = client.from('flv').upsert(uniqueWithOnlyKeys as any, { onConflict: 'id' });
    const { data, error } = await batch;

    if (error) {
        console.log(error);
        res.status(500).send({});
    } else {

        console.log(`Rebuild finished in ${moment().diff(start, 'seconds')} seconds`);
        res.status(200).send({});
    }

})


const validQueries = z.union([
    z.literal('cover'),
    z.literal('description'),
    z.literal('genres'),
    z.literal('id'),
    z.literal('normalizedPopularity'),
    z.literal('popularityByGenere'),
    z.literal('popularityIndex'),
    z.literal('ranking'),
    z.literal('related'),
    z.literal('state'),
    z.literal('title'),
    z.literal('type'),
]);

const validPg = Object.keys(AnimeGenreEnum).map(k => animeFlvToInternal[k as any]);


const parseQuery = (q: string,
    pg: string | undefined,
    res: express.Response,
) => {
    const asArray = (q as string).split(',');
    const failed: string[] = [];
    const valid: string[] = [];
    let hasId = false;
    let popByGenere = false;
    const isValid = asArray.map(a => {
        const is = validQueries.safeParse(a);
        if (!is.success) {
            failed.push(a);
        } else {
            if (a === 'id') {
                hasId = true;
            }
            if (a === 'popularityByGenere') {
                popByGenere = true;
            } else {
                valid.push(a);
            }
        }
        return is;
    });

    if (popByGenere && !pg) {
        return res.status(400).send({
            error: `Query parameter 'popularityByGenere' requires 'pg' query parameter`
        });
    } else if (popByGenere && pg) {
        const pgs = (pg as string).split(',');
        const validPgs = pgs.filter(p => validPg.includes(p as any));
        const invalidPgs = pgs.filter(p => !validPg.includes(p as any));
        if (invalidPgs.length > 0) {
            return res.status(400).send({
                error: `Invalid 'pg' query parameter -> [${invalidPgs.join(', ')}]`
            });
        }

        validPgs.forEach(p => {
            valid.push(`popularityByGenere -> ${p}`);
        })
    }

    if (!hasId) {
        valid.push('id');
    }
    if (isValid.some(v => !v.success)) {
        return res.status(400).send({
            error: `Invalid query parameters -> [${failed.join(', ')}]`
        });
    }

    return valid.join(', ');
}

app.get('/anime/:id', async (req, res) => {
    const id = req.params.id;
    if (!id) {
        res.status(404).send({});
    }

    const q = req.query?.q;
    const pg = req.query?.pg;
    let query: string = 'title, related'
    if (q) {

        const parsed = parseQuery(q as string, pg as string | undefined, res);
        if (typeof parsed === 'string')
            query = parsed;
        else
            return parsed;

    }

    console.log(query);

    const result = await client.from('flv').select(query).eq('id', id).single();


    if (result.error) {
        console.log(result.error);
        return res.status(500).send({});
    }

    if (!result.data) {
        return res.status(404).send({});
    }
    const sanitizedData = result.data as any;
    const keys = Object.keys(sanitizedData);
    keys.forEach(k => {
        const value = sanitizedData[k];
        if (validPg.includes(k) && typeof value !== 'number') {
            sanitizedData[k] = 0;
        }
    })



    return res.status(200).send(sanitizedData);

})

app.get('/similar/:id', async (req, res) => {
    const id = req.params.id;
    let offSet = 0;
    if (req.query.offset) {
        const _offSet = parseInt(req.query.offset as string);
        if (!isNaN(_offSet)) {
            offSet = Math.max(0, _offSet);
        }
    }
    if (!id) {
        res.status(404).send({});
    }
    const q = req.query?.q;
    const pg = req.query?.pg;

    let query: string = 'title, genres'
    if (q) {
        const parsed = parseQuery(q as string,
            pg as string | undefined,
            res);
        if (typeof parsed === 'string')
            query = parsed;
        else
            return parsed;
    }

    const originalNoGeneres = !query.includes('genres');
    if (!query.includes('genres')) {
        query += ', genres';
    }
    const result = await client.from('flv').select('title, genres, popularityByGenere').eq('id', id).single();
    const { data, error } = result;
    if (error || !data) {
        console.log(error);
        res.status(
            error ? 500 : 404
        ).send({});
    }
    const genere = data!.genres as AnimeGenre[];
    const pop = data!.popularityByGenere as Record<AnimeGenre, number>;
    const topGeneres = genere.sort((a, b) => pop[b] - pop[a]).slice(0, 2);

    console.log(topGeneres.map(g => `${g} - ${pop[g]}`));

    const similar = await client.from('flv').select(query)
        .contains('genres', topGeneres)
        .order(`popularityByGenere ->> ${topGeneres[0]}` as any, { ascending: false })
        .order(`normalizedPopularity`, { ascending: false })
        .range(
            offSet, 9 + offSet
        )
        .neq('id', id);

    //If there are less than 10 results, get more

    if (similar.error) {
        console.log(similar.error);
        res.status(500).send({});
    }


    if (similar.data?.length! < 10) {
        const nRange = 10 - similar.data!.length;
        const more = await client.from('flv').select(query)
            .contains('genres', topGeneres)
            .order(`popularityByGenere ->> ${topGeneres[0]}` as any, { ascending: false })
            .order(`normalizedPopularity`, { ascending: false })
            .limit(nRange)
            .neq('id', id);
        similar.data = [...similar.data!, ...more.data!];
    }

    console.log(`Retrieved ${similar.data?.length} similar animes`);

    const intersections = similar.data!.map(d => {
        const dGenres = (d as any).genres as AnimeGenre[];
        const intersection = dGenres.filter(g => topGeneres.includes(g));
        const toReturn = {
            ...(d as any),
            intersection
        }
        if (originalNoGeneres) {
            delete toReturn.genres;
        }
        return toReturn;
    })

    return res.status(200).json(intersections);
})


const CSS = `@import url(https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap);.ext_loader-container,.ext_loader-container>*{box-sizing:border-box!important;margin:0!important;border:none!important}body{background:#add8e6}.ext_loader-container>*{padding:0!important;font-family:Roboto,sans-serif!important}.ext_loader-container{width:5rem;display:flex;row-gap:25px;flex-direction:column;align-items:center;justify-content:center}.ext_circular-progress{position:relative;height:4rem;width:4rem;animation:1s linear infinite fillIn;background:conic-gradient(#7d2ae8 3.6deg,#3333334c 0deg);border-radius:50%;display:flex;align-items:center;justify-content:center}.ext_circular-progress::before{content:"";position:absolute;height:80%;width:80%;background:#fff;border-radius:50%}.ext_circular-progress-value{font-size:1.5rem;font-weight:600;color:#7d2ae8;z-index:90;font-family:Roboto,sans-serif!important}`

app.get('/css', async (req, res) => {

    res.set('Content-Type', 'text/css');


    return res.send(CSS);
});




server.listen(3000, '0.0.0.0', () => {

    //get app listening port
    const add: any = server.address();
    const port = add.port;
    //get app host
    const host = add.address;

    console.log(`Server listening at http://${host}:${port}`);
});