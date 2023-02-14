import puppeteer, { Browser } from "puppeteer";
import { URLS } from "./urls";
// import * as jsdom from "jsdom";
import {load as CherrioLoad} from "cheerio";

import * as fs from 'fs/promises';
import * as crypto from 'crypto';

//Page is dynamically loaded so we need puppeteer ...
    type EP_TYPES = 'CANON' | 'MIXTO' | 'RELLENO' | 'ANIME CANON' | 'NOVELA'
    interface IEpisode {
        ep: number,
        title: string,
        date: Date,
        type: EP_TYPES
    }


    export interface IAnime {
        name: string,
        episodes: IEpisode[],
        episodesCountByType: {[key in EP_TYPES]: number},
        totalEpisodes: number,
        keywords: string[],
        id: number
    }

const getHtml = async (browser: Browser,url: string) : Promise<IAnime | null> => {

  const page = await browser.newPage();
    await page.goto(url);
    page.removeAllListeners()
    const cookie = await page.waitForSelector('body > div.cookie.notification.is-warning.js-cookie-consent > div.columns.is-mobile > div:nth-child(2) > span');
    if(cookie) {
        try {
            await cookie.click();
        } catch(e) {
            //Ignore
        }
    }

    //Keep scrolling until the page is fully loaded
    await page.evaluate(async () => {
        await new Promise<void>((resolve, reject) => {
            let totalHeight = 0;
            let distance = 100;
            let timer = setInterval(() => {
                let scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 5);
        });
    });
    



 

    const dom = CherrioLoad(await page.content());

    const animeTitle = dom('#app > main > section.hero.is-grey > div.hero-body.pt-5.pb-5 > div > div > div:nth-child(3) > h1').text();
    const table = dom('#episodes-table-detail > div > div > table')
    const rows = table.find('tbody > tr');
    const cleanString = (str: string) => {
        //Remove all new lines
        str = str.replace(/(\r\n|\n|\r)/gm, "");
        //Remove all trailing spaces or end of line spaces
        str = str.replace(/\s+/g, " ").trim();
        return str;
    }
    const episodes = rows.map((i, el) => {
        const row = dom(el);
        //If row class is == 'is-hidden' then skip
        if(row.hasClass('is-hidden')) return;
        const episode = row.find('td:nth-child(1)').text();
        const title = row.find('td:nth-child(3) > span').text();
        const date = row.find('td:nth-child(4)').text();
        const type = row.find('td:nth-child(5) > span').text();
        const _date = cleanString(date);


        //Convert to date from format DD/MM/YYYY

        const dateParts = _date.split('/');
        //Validate  
        if(dateParts.length !== 3) return;
        const day = parseInt(dateParts[0]!);
        const month = parseInt(dateParts[1]!);
        const year = parseInt(dateParts[2]!);
        if(isNaN(day) || isNaN(month) || isNaN(year)) return;
        const __date = new Date(year, month, day);

            

        return {
            ep: parseInt(cleanString(episode)),
            title: cleanString(title),
            date: __date,
            type: cleanString(type) as EP_TYPES
        } as IEpisode
    }).get();

    // const getPinCOlums = () => {
    //     const colums = dom('#app > main > section.hero.is-grey > div.hero-body.pt-5.pb-5 > div > div');
    //     //Get all P tags inside the colums
    //     const pTags = colums.find('p');

    //     //Get all the text from the p tags
    //     const pText = pTags.map((i, el) => {
    //         const p = dom(el);
    //         return p.text();
    //     }).get();

    //     return pText;
    // }

    const generateKeyWords = (title: string) => {
        //From the title remove all non alphanumeric characters
        const cleanTitle = title.replace(/[^a-zA-Z0-9 ]/g, "");
        //Split the title into words
        const words = cleanTitle.split(' ');
        //Remove all words that are less than 3 characters
        const filteredWords = words.filter(word => word.length > 1);
        //Remove all duplicate words
        const uniqueWords = [...new Set(filteredWords)];
        //Return the unique words both in lowercase and uppercase
        const returnWords = uniqueWords.map(word => [word.toLowerCase(), word.toUpperCase()]);
        return returnWords.flat();
    }


    // const convertDescriptionToKeywords = (description: string) => {
    //     //From the description remove all non alphanumeric characters
    //     const cleanDescription = description.replace(/[^a-zA-Z0-9 ]/g, "");
    //     //Split the description into words
    //     const words = cleanDescription.split(' ');
    //     //Remove all words that are less than 3 characters
    //     const filteredWords = words.filter(word => word.length > 6);
    //     //Remove all duplicate words
    //     const uniqueWords = [...new Set(filteredWords)];
    //     //Return the unique words both in lowercase and uppercase
    //     const returnWords = uniqueWords.map(word => [word.toLowerCase(), word.toUpperCase()]);
    //     return returnWords.flat();
    // }


    // const description = getPinCOlums().join(' ');

    const keywords = generateKeyWords(animeTitle)
    await page.close();

    return {
        name: animeTitle,
        episodes,
        keywords: keywords,
        totalEpisodes: episodes.length,
        episodesCountByType: {
            CANON: episodes.filter(ep => ep.type === 'CANON').length,
            MIXTO: episodes.filter(ep => ep.type === 'MIXTO').length,
            RELLENO: episodes.filter(ep => ep.type === 'RELLENO').length,
            'ANIME CANON': episodes.filter(ep => ep.type === 'ANIME CANON').length,
            NOVELA: episodes.filter(ep => ep.type === 'NOVELA').length,
        },
        id: crypto.getRandomValues(new Uint32Array(1))[0]
    } as IAnime;
}


const handleChunk = async (urls: string[]) => {
    const browser = await puppeteer.launch({
        headless: true,
        });
    const promises = urls.map(url => getHtml(browser, url));
    const results = await Promise.all(promises);
    await browser.close();
    return results.filter(result => result !== null) as IAnime[];
    
}

const getUrls = async () => {
    const CHUNK_SIZE = 10;
    const CHUNKS = Math.ceil(URLS.length / CHUNK_SIZE);
    const animes: IAnime[] = [];
    for(let i = 0; i < CHUNKS; i++) {
        const urls = URLS.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        console.log(`Processing chunk ${i + 1} of ${CHUNKS}`);
        const results = await  handleChunk(urls);
        animes.push(...results.filter(result => result !== null) as IAnime[]);
        console.log(`Finished chunk ${i + 1} of ${CHUNKS}`);
    }
    return animes;
}

export const reBuilDb = async () => {
    const urls = await getUrls();
    
    await fs.writeFile('animes.json', JSON.stringify(urls, null, 2));
}

