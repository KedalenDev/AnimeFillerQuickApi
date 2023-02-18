"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalToAnimeFlv = exports.animeFlvToInternal = exports.animeFlvStateToAnilistState = exports.animeTypeToRaw = exports.animeFlvRawTypeToAnilistType = void 0;
const animeFlvRawTypeToAnilistType = (type) => {
    switch (type) {
        case 'Anime':
            return 'TV';
        case 'Película':
            return 'MOVIE';
        case 'Especial':
            return 'SPECIAL';
        case 'OVA':
            return 'OVA';
    }
};
exports.animeFlvRawTypeToAnilistType = animeFlvRawTypeToAnilistType;
const animeTypeToRaw = (type) => {
    switch (type) {
        case 'TV':
            return 'Anime';
        case 'MOVIE':
            return 'Película';
        case 'SPECIAL':
            return 'Especial';
        case 'OVA':
            return 'OVA';
    }
};
exports.animeTypeToRaw = animeTypeToRaw;
const animeFlvStateToAnilistState = (state) => {
    if (state.includes('Fin')) {
        return 'FINISHED';
    }
    if (state.includes('En')) {
        return 'ONGOING';
    }
    return 'FINISHED';
};
exports.animeFlvStateToAnilistState = animeFlvStateToAnilistState;
exports.animeFlvToInternal = {
    "Acción": "action",
    "Artes Marciales": "martial arts",
    "Aventuras": "adventure",
    "Carreras": "racing",
    "Ciencia Ficción": "sci-fi",
    "Comedia": "comedy",
    "Demencia": "dementia",
    "Demonios": "demons",
    "Deportes": "sports",
    "Drama": "drama",
    "Ecchi": "ecchi",
    "Escolares": "school",
    "Espacial": "space",
    "Fantasía": "fantasy",
    "Harem": "harem",
    "Historico": "historical",
    "Infantil": "kids",
    "Josei": "josei",
    "Juegos": "games",
    "Magia": "magic",
    "Mecha": "mecha",
    "Militar": "military",
    "Misterio": "mystery",
    "Música": "music",
    "Parodia": "parody",
    "Policía": "police",
    "Psicológico": "psychological",
    "Recuentos de la vida": "sol",
    "Romance": "romance",
    "Samurai": "samurai",
    "Seinen": "seinen",
    "Shoujo": "shoujo",
    "Shounen": "shounen",
    "Sobrenatural": "supernatural",
    "Superpoderes": "superpowers",
    "Suspenso": "suspense",
    "Terror": "horror",
    "Vampiros": "vampires",
    "Yaoi": "yaoi",
    "Yuri": "yuri",
};
exports.internalToAnimeFlv = {
    "action": "Acción",
    "martial arts": "Artes Marciales",
    "adventure": "Aventuras",
    "racing": "Carreras",
    "sci-fi": "Ciencia Ficción",
    "comedy": "Comedia",
    "dementia": "Demencia",
    "demons": "Demonios",
    "sports": "Deportes",
    "drama": "Drama",
    "ecchi": "Ecchi",
    "school": "Escolares",
    "space": "Espacial",
    "fantasy": "Fantasía",
    "harem": "Harem",
    "historical": "Historico",
    "kids": "Infantil",
    "josei": "Josei",
    "games": "Juegos",
    "magic": "Magia",
    "mecha": "Mecha",
    "military": "Militar",
    "mystery": "Misterio",
    "music": "Música",
    "parody": "Parodia",
    "police": "Policía",
    "psychological": "Psicológico",
    "sol": "Recuentos de la vida",
    "romance": "Romance",
    "samurai": "Samurai",
    "seinen": "Seinen",
    "shoujo": "Shoujo",
    "shounen": "Shounen",
    "supernatural": "Sobrenatural",
    "superpowers": "Superpoderes",
    "suspense": "Suspenso",
    "horror": "Terror",
    "vampires": "Vampiros",
    "yaoi": "Yaoi",
    "yuri": "Yuri",
};
//# sourceMappingURL=anime.js.map