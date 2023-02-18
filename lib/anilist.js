"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET_ANIMES = void 0;
const cheerio_1 = require("cheerio");
const fs = require("fs/promises");
const moment = require("moment");
const anime_1 = require("./schema/anime");
const puppeteer_1 = require("puppeteer");
const puppeteer_extra_1 = require("puppeteer-extra");
const crypto = require("crypto");
const ProgressBar = require("cli-progress");
const Stealth = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const path = require("path");
puppeteer_extra_1.default.use(Stealth());
puppeteer_extra_1.default.use(AdblockerPlugin({
    interceptResolutionPriority: puppeteer_1.DEFAULT_INTERCEPT_RESOLUTION_PRIORITY
}));
const crawlUrl = 'https://www3.animeflv.net/browse?order=default&page={{page}}';
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
};
const urlToHtml = async (url) => {
    const response = await fetch(url);
    const page = await response.text();
    return (0, cheerio_1.load)(page);
};
const getAnimeFlv = async (page) => {
    const url = crawlUrl.replace('{{page}}', page.toString()).replace(`&page=${page}`, page === 0 ? '' : `&page=${page}`);
    const $ = await urlToHtml(url);
    const results = [];
    $(selectors.animeList).each((i, el) => {
        //Get all the li elements and iterate over them
        const li = $(el).find('li');
        li.each((i, el) => {
            //Get the href attribute from the a tag
            const href = $(el).find('a').attr('href');
            if (!href)
                return;
            //Get the title from the a tag
            const title = $(el).find('h3').text();
            results.push({
                href,
                title
            });
        });
    });
    return results.map(result => {
        return {
            title: result.title,
            href: `https://www3.animeflv.net${result.href}`
        };
    });
};
const getPageCount = async () => {
    const url = `https://www3.animeflv.net/browse?order=default`;
    const response = await fetch(url);
    const _page = await response.text();
    const $ = (0, cheerio_1.load)(_page);
    const pages = $('body > div.Wrapper > div > div > main > div > ul');
    //Get the one before the last element
    const oneBefore = pages.find('li').eq(-2).find('a').text();
    //Only digits
    const lastPage = oneBefore.replace(/\D/g, '');
    return Array.from({
        length: parseInt(lastPage) + 1
    }, (_, i) => i);
};
const shouldRerun = async (discriminator, hours = 24, force, _path) => {
    if (force)
        return [];
    const now = moment();
    //Find file in directory with the latest date format is AnimeFlv_YYYY-MM-DD_HH-mm-ss.json
    const files = await fs.readdir(_path || './');
    const latestFile = files.filter(file => file.includes(discriminator)).sort((a, b) => {
        //@ts-ignore
        const aDate = moment(a.split('_')[1].split('.')[0], 'YYYY-MM-DD_HH-mm-ss');
        //@ts-ignore
        const bDate = moment(b.split('_')[1].split('.')[0], 'YYYY-MM-DD_HH-mm-ss');
        return aDate.diff(bDate);
    }).pop();
    if (!latestFile)
        return [];
    //@ts-ignore
    const latestFileDate = moment(latestFile.split('_')[1].split('.')[0], 'YYYY-MM-DD_HH-mm-ss');
    const diff = now.diff(latestFileDate, 'hours');
    if (diff > hours) {
        //Delete previous file
        await fs.unlink(latestFile);
        return [];
    }
    //Return the array of pages
    const _filePath = path.join(_path || './', latestFile);
    const arr = JSON.parse(await fs.readFile(_filePath, 'utf-8'));
    return arr;
};
const getAnimesUrls = async (force) => {
    const rerunOrData = await shouldRerun('AnimeFlv_', 72, force);
    if (rerunOrData.length > 0)
        return rerunOrData;
    //Delete previous file
    const p = await getPageCount();
    const bar = new ProgressBar.SingleBar({
        clearOnComplete: false
    }, ProgressBar.Presets.rect);
    bar.start(p.length, 0);
    const results = await Promise.all(p.map(async (page) => {
        const data = await getAnimeFlv(page);
        bar.increment(1, {
            task: `Page ${page}`
        });
        return data;
    }));
    bar.stop();
    //Flatten the array
    const flattened = results.flat();
    const now = moment().format('YYYY-MM-DD_HH-mm-ss');
    //Write to file
    await fs.writeFile(`./AnimeFlv_${now}.json`, JSON.stringify(flattened, null, 4));
    return flattened;
};
const parseAnimeInfo = async (url, title) => {
    const $ = await urlToHtml(url);
    const tags = $(selectors.generes).find('a').map((i, el) => {
        return $(el).text();
    }).get().map(genere => {
        return anime_1.animeFlvToInternal[genere];
    });
    const state = $(selectors.state).text();
    const internalState = (0, anime_1.animeFlvStateToAnilistState)(state);
    const popularity = $(selectors.popularity).text();
    const relatedAnime = $(selectors.relatedAnime).find('li').map((i, el) => {
        const href = $(el).text();
        //Check for 'Precuela' or 'Secuela'
        let type = null;
        let found = "";
        if (href.includes('(Precuela)')) {
            found = '(Precuela)';
            type = 'prequels';
        }
        if (href.includes('(Secuela)')) {
            found = '(Secuela)';
            type = 'sequels';
        }
        if (href.includes('(OVA)')) {
            found = '(OVA)';
            type = 'ovas';
        }
        if (href.includes('(Película)')) {
            found = '(Película)';
            type = 'movies';
        }
        if (href.includes('(Especial)')) {
            found = '(Especial)';
            type = 'specials';
        }
        if (href.includes('(Historia Paralela)')) {
            found = '(Historia Paralela)';
            type = 'spinoffs';
        }
        if (!type)
            return;
        const title = href.replace(found, '').trim();
        return {
            title,
            type
        };
    }).get().reduce((acc, curr) => {
        if (!curr)
            return acc;
        const { type, title } = curr;
        if (!acc[type])
            acc[type] = [];
        acc[type].push(title);
        return acc;
    }, {});
    const description = $(selectors.desc).text();
    const type = $(selectors.type).text();
    //We will crawl the page later with puppeteer to get the rest of the info
    const hash = crypto.createHash('sha256');
    hash.update(url);
    return {
        name: title,
        id: hash.digest('hex'),
        genres: tags,
        state: internalState,
        popularity: parseInt(popularity),
        related: relatedAnime,
        episodes: [],
        type: (0, anime_1.animeFlvRawTypeToAnilistType)(type),
        url,
        description,
        episodeTemplate: '',
        episodeCount: 0,
        coverImage: ''
    };
};
const crawlAnimePage = async (browser, anime) => {
    const page = await browser.newPage();
    await page.goto(anime.url, {
        waitUntil: 'networkidle2',
    });
    page.removeAllListeners();
    const $ = (0, cheerio_1.load)(await page.content());
    await page.close();
    const coverImage = $(selectors.coverImage).attr('src');
    if (anime.type === 'MOVIE') {
        //We don't need to crawl the page
        return Object.assign(Object.assign({}, anime), { coverImage: `https://animeflv.net${coverImage}` });
    }
    const epInfos = {
        count: -1,
        template: ''
    };
    $('#episodeList').find('li').each((i, el) => {
        if (epInfos.count !== -1)
            return;
        const a = $(el).find('a');
        if (!a.text().includes('PROXIMO')) {
            const p = a.find('p');
            const text = p.text();
            const ep = parseInt(text.split(' ')[1]);
            const href = a.attr('href');
            const split = href.split('-');
            const rebuild = split.slice(0, split.length - 1).join('-');
            const template = `https://animeflv.net${rebuild}-{{EP}}`;
            epInfos.count = ep;
            epInfos.template = template;
        }
    });
    return Object.assign(Object.assign({}, anime), { episodes: [], episodeTemplate: epInfos.template, episodeCount: epInfos.count, coverImage: `https://animeflv.net${coverImage}` });
};
const getFlvSeries = async (urls, force) => {
    const rerun = await shouldRerun('AnimeINFO_', 72, force);
    if (rerun.length > 0) {
        return rerun;
    }
    const bar = new ProgressBar.SingleBar({}, ProgressBar.Presets.shades_classic);
    bar.start(urls.length, 0);
    const p1 = await Promise.all(urls.map(async (url, _i) => {
        try {
            const data = await parseAnimeInfo(url.href, url.title);
            const tick = '✅';
            bar.increment(undefined, {
                task: `${tick} ${url.title}`
            });
            return data;
        }
        catch (e) {
            await fs.appendFile('./errors.txt', `${url.href}\n`);
            bar.increment(undefined, {
                task: `❌ ${url.title}`
            });
            return;
        }
    }));
    let minPopularity = -1;
    let maxPopularity = -1;
    const _cleanAnimes = [];
    //Convert the p1 related to ids
    for (let i = 0; i < p1.length; i++) {
        const anime = p1[i];
        if (!anime)
            continue;
        if (minPopularity === -1)
            minPopularity = anime.popularity;
        if (maxPopularity === -1)
            maxPopularity = anime.popularity;
        if (anime.popularity < minPopularity)
            minPopularity = anime.popularity;
        if (anime.popularity > maxPopularity)
            maxPopularity = anime.popularity;
        const related = anime.related;
        for (let key in related) {
            const arr = related[key];
            for (let i = 0; i < arr.length; i++) {
                const title = arr[i];
                const found = p1.find(anime => (anime === null || anime === void 0 ? void 0 : anime.name) === title);
                if (!found)
                    continue;
                arr[i] = found.id;
            }
            anime.related[key] = arr;
        }
        _cleanAnimes.push(anime);
        //@ts-ignore
    }
    //Normalize popularity
    for (let i = 0; i < _cleanAnimes.length; i++) {
        const anime = _cleanAnimes[i];
        const normalizedPopularity = (anime.popularity - minPopularity) / (maxPopularity - minPopularity);
        anime.popularity = normalizedPopularity;
        _cleanAnimes[i] = anime;
    }
    const now = moment().format('YYYY-MM-DD_HH-mm-ss');
    await fs.writeFile(`./AnimeINFO_${now}.json`, JSON.stringify(_cleanAnimes.filter((v) => v !== undefined), null, 4));
    return _cleanAnimes;
};
const chunkArray = (arr, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        chunks.push(chunk);
    }
    return chunks;
};
const retryUntil = async (maxTries, call, check) => {
    let tries = 0;
    let result = null;
    while (tries < maxTries) {
        result = await call;
        if (check(result)) {
            return result;
        }
        tries++;
    }
    return result;
};
const GET_ANIMES = async () => {
    //Full Pipeline for getting all the animes from animeflv
    //CLear process.stdout
    process.stdout.write('\x1Bc');
    const urls = await getAnimesUrls(true);
    const series = await getFlvSeries(urls);
    const browser = await puppeteer_extra_1.default.launch({
        headless: true,
        executablePath: (0, puppeteer_1.executablePath)()
    });
    const animeSeries = series.filter((anime) => anime.type === 'TV');
    const nonAnimeSeries = series.filter((anime) => anime.type !== 'TV');
    const crawlChunks = chunkArray(animeSeries, 25);
    const bars = new ProgressBar.MultiBar({
        clearOnComplete: false,
        hideCursor: false,
        format: '{name} |' + '{bar}' + '| {percentage}% || {value}/{total} {of} || {task}',
    });
    const overallBar = bars.create(crawlChunks.length, 0, {
        name: 'Overall',
        of: 'Chunks',
        task: '⏳'
    });
    const chunkBar = bars.create(1, 0, {
        name: 'Chunk',
        of: 'Animes',
        task: '⏳'
    });
    const finalAnimes = [];
    for (const chunk of crawlChunks) {
        chunkBar.start(chunk.length, 0, {
            task: '⏳',
            name: 'Chunk',
            of: 'Animes',
        });
        const promises = chunk.map(async (anime) => {
            const result = await crawlAnimePage(browser, anime);
            chunkBar.increment(1, {
                task: `✅ ${anime.name}`,
                of: 'Animes',
                name: 'Chunk'
            });
            return result;
        });
        const animes = await Promise.all(promises);
        const okAnimes = animes.filter((anime) => anime !== null);
        overallBar.increment(1, {
            task: `✅`,
            of: 'Chunks',
            name: 'Overall'
        });
        finalAnimes.push(...okAnimes);
    }
    await browser.close();
    const now = moment().format('YYYY-MM-DD_HH-mm-ss');
    finalAnimes.push(...nonAnimeSeries);
    //This will be read by the main process
    //Write the animes to a file
    const _filePath = `./FLV.json`;
    const absolutePath = path.resolve(_filePath);
    await fs.writeFile(`./FLV.json`, JSON.stringify(finalAnimes, null, 4));
    process.stdout.write('RESULT-' + absolutePath);
};
exports.GET_ANIMES = GET_ANIMES;
//# sourceMappingURL=anilist.js.map