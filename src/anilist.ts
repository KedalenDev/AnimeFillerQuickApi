
import { load as html } from 'cheerio';
import * as moment from 'moment';
import { AnimeGenre, IAnimeJsonItem, IIntermediateAnimeItemStep, IRelated, animeFlvToInternal } from './HELPER_TYPES';
import { executablePath, Browser, DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } from 'puppeteer';

import puppeteer from 'puppeteer-extra';
const Stealth = require('puppeteer-extra-plugin-stealth')
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')


import path = require('path');


puppeteer.use(Stealth())

puppeteer.use(AdblockerPlugin({
    interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY
}))



const crawlUrl = 'https://www3.animeflv.net/browse?order=default&page={{page}}'


const selectors = {
    animeList: 'body > div.Wrapper > div > div > main > ul',
    generes: 'body > div.Wrapper > div > div > div.Container > div > main > section:nth-child(1) > nav',
    state: 'body > div.Wrapper > div > div > div.Container > div > aside > p > span',
    popularity: 'body > div.Wrapper > div > div > div.Container > div > aside > section > div > div > span',
    relatedAnime: 'body > div.Wrapper > div > div > div.Container > div > main > section:nth-child(1) > ul',
    listCaps: '#episodeList',
    topEp: '#episodeList > li:nth-child({{$1}}) > a > p',
    desc: 'body > div.Wrapper > div > div > div.Container > div > main > section:nth-child(1) > div.Description > p',
    type: 'body > div.Wrapper > div > div > div.Ficha.fchlt > div.Container > span',
    coverImage: 'body > div.Wrapper > div > div > div.Container > div > aside > div.AnimeCover > div > figure > img',
    episodeTitle: '#XpndCn > div.CpCnA > div.CapiTop > h1',
    episodeSelectors: {
        likeButton: '#reactions > div.reaction-items > div > div:nth-child(1) > div.reaction-item__button.reaction-item__button--refresh > div > img',
        commentCount: '#main-nav > div > nav > ul > li.nav-tab.nav-tab--primary.tab-conversation.tab-conversation--refresh.active > a > span',
        reactions: {
            likes: '#reactions > div.reaction-items.has-selection.counts-visible > div > div.reaction-item.reaction-item--refresh.reaction-item__enabled.reaction-item__selected > div.reaction-item__button.reaction-item__button--refresh > div > div > div',
            fun: '#reactions > div.reaction-items.has-selection.counts-visible > div > div:nth-child(2) > div.reaction-item__button.reaction-item__button--refresh > div > div > div',
            love: '#reactions > div.reaction-items.has-selection.counts-visible > div > div:nth-child(3) > div.reaction-item__button.reaction-item__button--refresh > div > div > div',
            surprise: '#reactions > div.reaction-items.has-selection.counts-visible > div > div:nth-child(4) > div.reaction-item__button.reaction-item__button--refresh > div > div > div',
            angry: '#reactions > div.reaction-items.has-selection.counts-visible > div > div:nth-child(5) > div.reaction-item__button.reaction-item__button--refresh > div > div > div',
            sad: '#reactions > div.reaction-items.has-selection.counts-visible > div > div:nth-child(6) > div.reaction-item__button.reaction-item__button--refresh > div > div > div'
        }
    }

} as const;


const urlToHtml = async (url: string) => {
    const response = await fetch(url);
    const page = await response.text();
    return html(page);
}

const fetchFlvPage = async (page: number) => {
    const url = crawlUrl.replace('{{page}}', 
    Math.max(1, page).toString()
    );
    const $ =  await urlToHtml(url);

    //From each li get the a tag -> href and h2 tag -> text
    const p = $('body > div.Wrapper > div > div > main > ul > li').map((_, el) => {
        const href = $(el).find('a').attr('href');
        const title = $(el).find('h3').text();
        return {
            href: `https://www3.animeflv.net${href}`,
            title
        }
    }).get();


    return p;
}


const getPageCount = async () => {
    const url = `https://www3.animeflv.net/browse?order=default`;
    const response = await fetch(url);
    const _page = await response.text();
    const $ = html(_page);
    const pages = $('body > div.Wrapper > div > div > main > div > ul')
    //Get the one before the last element
    const oneBefore = pages.find('li').eq(-2).find('a').text();

    //Only digits
    const lastPage = oneBefore.replace(/\D/g, '');


    return Array.from({
        length: parseInt(lastPage) + 1
    }, (_, i) => i);

}

const getAnimesUrls = async (
    
): Promise<{
    href: string,
    title: string
}[]> => {


    //Delete previous file


    const p = await getPageCount();


   

    const results = await Promise.all(p.map(async (page) => {
        const data = await fetchFlvPage(page);
        
        return data;
    }));

    //Flatten the array
    const flattened = results.flat();




    return flattened as {
        href: string,
        title: string
    }[];



}

export const getAnimeInfo = async (
    browser: Browser,
    url: string,
) => {

    
    const p = await urlToHtml(url);
    

    const getOtherInfo = async () => {
        

        const tags = p(selectors.generes);
        const tagsText = tags.find('a').map((_, el) => {
            const text = p(el).text();
            return text;
        }).get();

        const ranking = p("body > div.Wrapper > div > div > div.Ficha.fchlt > div.Container > div.vtshr > div");

        const rankingCount = p('#votes_prmd').text();
        const rankingVoteCount = ranking.find('span').last().text();

        const tagsInternal = tagsText.filter(t => t !== null && t !== undefined).map(genere => {
            return animeFlvToInternal[genere!] as AnimeGenre;
        });

        const _relatedAnimeSelect = p(selectors.relatedAnime).map((_, el) => {
             
            
            return p(el).find('li').map((_, el2) => {
                return p(el2).text();
             }).get();
        }).get();
        const _relatedAnime = await Promise.all(_relatedAnimeSelect?.map(async (el) => {
            const hrefText = el;
            let type: keyof IAnimeJsonItem['related'] | null = null;
            let found = "";
            if (hrefText.includes('(Precuela)')) {
                found = '(Precuela)';
                type = 'prequels';
            }
    
            if (hrefText.includes('(Secuela)')) {
                found = '(Secuela)';
                type = 'sequels';
            }
    
            if (hrefText.includes('(OVA)')) {
                found = '(OVA)';
                type = 'ovas';
            }
            if (hrefText.includes('(Película)')) {
                found = '(Película)';
                type = 'movies';
            }
            if (hrefText.includes('(Especial)')) {
                found = '(Especial)';
                type = 'specials';
            }
            if (hrefText.includes('(Historia Paralela)')) {
                found = '(Historia Paralela)';
                type = 'spinoffs';
            }
            
            if (!type)
            return null;
            
            const title = hrefText.replace(found, '').trim();
    
            return {
                title,
                type
            };
        }) ?? []);
        
        const state = p(selectors.state).text();
       
        let related: IAnimeJsonItem['related'] = {} as IAnimeJsonItem['related'];
        if(_relatedAnime){

            const clearn =_relatedAnime.filter((el) => el !== null).reduce((acc, curr) => {
                    if (!curr) return acc;
                    const { type, title } = curr;
                    if (!acc[type]) acc[type] = [];
                    acc[type].push(title);
                    return acc;
                }, {} as IAnimeJsonItem['related']);
            related = clearn;
        }

        const title = p(
            "body > div.Wrapper > div > div > div.Ficha.fchlt > div.Container > h1").text();
            
        //GET TEXT CONTENT
        const type = await p(selectors.type).text();
        


        


        return [
            tagsInternal,
            related,
            state,
            type,
            title,
            rankingCount,
            rankingVoteCount
        ] as [AnimeGenre[], IAnimeJsonItem['related'], string, string, string, string, string];
    
    
    }

    const getIdAndCover = async () => {
        const animeIdHeader = p('body > div.Wrapper > div > div > div.Container > div > aside > div.AnimeCover > div > figure > img').attr('src');
        const animeCover = animeIdHeader?.toString().replace('JSHandle:', '').trim();
        const animeIdText = animeCover?.split('/');
        const animeId = animeIdText?.[animeIdText.length - 1]?.split('.')[0];

        const followers = p('body > div.Wrapper > div > div > div.Container > div > aside > section > div > div > span').text();

        return [animeId || '', animeCover || '', followers || '0']
    }
    const getDescriptions = async () => {
        try {
        const animeDescription =  p('body > div.Wrapper > div > div > div.Container > div > main > section:nth-child(1) > div.Description > p').text();
        
        return animeDescription;
        } catch (error) {
         
            throw new Error("Error getting anime description for " + url);
            
        }
    }


    const [
        [animeId, animeCover, followers],
        animeDescriptionText,
        [tags, related, state, type, animeTitle, rankingCount, rankingVoteCount]
    ] = await Promise.all([
        getIdAndCover(),
        getDescriptions(),
        getOtherInfo()
    ]);





    return {
        id: animeId,
        cover: animeCover,
        description: animeDescriptionText,
        title: animeTitle,
        genres: tags,
        related,
        state,
        type,
        url: url,
        "followers": parseInt(followers!),
        "popularityByGenere": tags.reduce((acc, curr) => {
            if (!acc[curr]) acc[curr] = 0;
            return acc;
        }, {} as IAnimeJsonItem['popularityByGenere']),
        "ranking": parseFloat(rankingCount),
        "rankingVotes": parseInt(rankingVoteCount),
    } as IAnimeJsonItem
}

const chunkArray = <T>(arr: T[], chunkSize: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize)! as T[];
        chunks.push(chunk);
    }
    return chunks;
}

export const GET_ANIMES = async (
    slice: number,
) => {

    //Full Pipeline for getting all the animes from animeflv

    //CLear process.stdout
    console.clear();
    const start = moment();
    console.log('Getting animes from animeflv.net');
    const n = moment().format('YYYY|MMMM|DD');
    const [
        year,
        month,
        day
    ] = n.split('|');
    const FOLDER = `./${year}/${month}/${day}`;
    const [
        URLS,
        ANIMEINFO,
        FINAL
    ] = [
            path.join(FOLDER, 'URLS.json'),
            path.join(FOLDER, 'ANIMEINFO.json'),
            path.join(FOLDER, 'FINAL.json'),
        ]
    let urls = (await getAnimesUrls())

    if (slice > 0) {
        urls = urls.slice(0, slice);
    }

    const browser = await puppeteer.launch({
        headless: true,
        executablePath: executablePath()
    });



    const series = chunkArray(urls.map(v => v.href), 25);
    let _series : ({
        id: string | undefined;
        cover: string | undefined;
        description: string | null;
        title: string;
        genres: AnimeGenre[];
        related: IRelated<string>;
        state: string;
        type: string;
    } | null)[] = [];
    console.log('Getting anime info');
    for (const chunk of series) {
        const chunkSeries = await Promise.all(chunk.map(async s => {

            const result = await getAnimeInfo(browser, s);


            return result;

        }));
        _series = [..._series, ...chunkSeries];
    }
    const cleanSeries = _series.filter(v => v !== null).flat() as IAnimeJsonItem[];


    const popStart = moment();
    console.log('Calculating popularity');

    const calculatePopularityIndex = (animes: IAnimeJsonItem) => {
        let {
            ranking,
            rankingVotes,
            followers
        } = animes;

        //Ensure that the values are numbers
        ranking = ranking ? 
        typeof ranking === 'number' ? ranking : parseFloat(ranking) : 0;
        rankingVotes = rankingVotes ?
        typeof rankingVotes === 'number' ? rankingVotes : parseInt(rankingVotes) : 0;
        followers = followers ?
        typeof followers === 'number' ? followers : parseInt(followers) : 0;

        //Ensure that the values are not NaN
        ranking = isNaN(ranking) ? 0 : ranking;
        rankingVotes = isNaN(rankingVotes) ? 0 : rankingVotes;
        followers = isNaN(followers) ? 0 : followers;


        const weights = {
            ranking: 0.5,
            rankingVotes: 0.2,
            followers: 0.3
        }

        const popularity = (ranking * weights.ranking) + (rankingVotes * weights.rankingVotes) + (followers * weights.followers);

        return {
            ...animes,
            popularityIndex: popularity,
            normalizedPopularity: 0
        } as IIntermediateAnimeItemStep

    }
    const calculatePopularity = (animes: IAnimeJsonItem[]) : IIntermediateAnimeItemStep[] => {
        const p = animes.map(v => calculatePopularityIndex(v));

        const min = Math.min(...p.map(v => v.popularityIndex));
        const max = Math.max(...p.map(v => v.popularityIndex));
        const range = max - min;
        for (const anime of p) {
            const normalized = (anime.popularityIndex - min) / range;
            //Normalize to 6 decimals
            const normalizedFixed = parseFloat(normalized.toFixed(6));
            anime.normalizedPopularity = normalizedFixed;
        }

        const generes = p.map(v => v.genres).flat().filter((v, i, a) => a.indexOf(v) === i);

        for (const genere of generes) {
            const animesWithGenere = p.filter(v => v.genres.includes(genere));
            //Now we have to calculate the popularity of each genere from 0 to 1 (Normalized)
            const min = Math.min(...animesWithGenere.map(v => v.popularityIndex));
            const max = Math.max(...animesWithGenere.map(v => v.popularityIndex));
            const range = max - min;
            for (const anime of animesWithGenere) {
                const normalized = (anime.popularityIndex - min) / range;
                const normalizedFixed = parseFloat(normalized.toFixed(6));              
                const setToMain = p.find(v => v.id === anime.id);
                if (setToMain) {
                    setToMain.popularityByGenere[genere] = normalizedFixed;
                }
            }

            
        }
        return p;
    }
    const popEnd = moment();
    
    const withPop = calculatePopularity(cleanSeries);
    console.log(`Popularity calculated in ${moment.duration(popEnd.diff(popStart)).asSeconds()} seconds`);


   

    const end = moment();
    const duration = moment.duration(end.diff(start));
    console.log(`Finished in ${duration.asSeconds()} seconds`);
    return withPop;

};