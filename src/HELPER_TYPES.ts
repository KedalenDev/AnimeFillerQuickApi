


export interface IRelated<T> {
    "sequels": T[],
    "prequels": T[],
    "spinoffs": T[],
    "ovas": T[],
    "specials": T[],
    "movies": T[],
}


export type ANIME_FLV_RAW_TYPE = 'Anime' | 'Película' | 'Especial' | 'OVA'

export type AnimeType = 'TV' | 'MOVIE' | 'SPECIAL' | 'OVA'

export const animeFlvRawTypeToAnilistType = (type: ANIME_FLV_RAW_TYPE): AnimeType => {
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
}


export interface IAnimeJsonItem {
    "id": string,
    "cover": string,
    "description": string,
    "title": string,
    "genres": AnimeGenre[],
    "related": IRelated<string>,
    "state": string,
    "type": ANIME_FLV_RAW_TYPE,
    "url": string,
    "followers": number,
    "popularityByGenere": {
        [key in AnimeGenre]: number
    },
    "ranking": number,
    "rankingVotes": number,
}

export interface IIntermediateAnimeItemStep {
    "id": string,
    "cover": string,
    "description": string,
    "title": string,
    "genres": AnimeGenre[],
    "related": IRelated<string>,
    "state": string,
    "type": ANIME_FLV_RAW_TYPE,
    "url": string,
    "popularityByGenere": {
        [key in AnimeGenre]: number
    },
    "popularityIndex": number,
    "normalizedPopularity": number,
}

export type AnimeAirState = 'NOT_YET' | 'AIRING' | 'FINISHED'


export const animeTypeToRaw = (type: AnimeType): ANIME_FLV_RAW_TYPE => {
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
}





export const animeFlvStateToAnilistState = (state: string) => {
    if(state.includes('Fin')){
        return 'FINISHED';
    }
    if(state.includes('En')){
        return 'ONGOING';
    }
    return 'FINISHED';
}

type ANIME_FLV_DIRECT_GENERE = "Acción" |
    "Artes Marciales" |
    "Aventuras" |
    "Carreras" |
    "Ciencia Ficción" |
    "Comedia" |
    "Demencia" |
    "Demonios" |
    "Deportes" |
    "Drama" |
    "Ecchi" |
    "Escolares" |
    "Espacial" |
    "Fantasía" |
    "Harem" |
    "Historico" |
    "Infantil" |
    "Josei" |
    "Juegos" |
    "Magia" |
    "Mecha" |
    "Militar" |
    "Misterio" |
    "Música" |
    "Parodia" |
    "Policía" |
    "Psicológico" |
    "Recuentos de la vida" |
    "Romance" |
    "Samurai" |
    "Seinen" |
    "Shoujo" |
    "Shounen" |
    "Sobrenatural" |
    "Superpoderes" |
    "Suspenso" |
    "Terror" |
    "Vampiros" |
    "Yaoi" |
    "Yuri"

export type AnimeGenre = "action" | "martial arts" | "adventure" | "racing" | "sci-fi" | "comedy" | "dementia" | "demons" | "sports" | "drama" | "ecchi" | "school" | "space" | "fantasy" | "harem" | "historical" | "kids" | "josei" | "games" | "magic" | "mecha" | "military" | "mystery" | "music" | "parody" | "police" | "psychological" | "sol" | "romance" | "samurai" | "seinen" | "shoujo" | "shounen" | "supernatural" | "superpowers" | "suspense" | "horror" | "vampires" | "yaoi" | "yuri";


export enum AnimeGenreEnum {
    "Acción" = "action",
    "Artes Marciales" = "martial arts",
    "Aventuras" = "adventure",
    "Carreras" = "racing",
    "Ciencia Ficción" = "sci-fi",
    "Comedia" = "comedy",
    "Demencia" = "dementia",
    "Demonios" = "demons",
    "Deportes" = "sports",
    "Drama" = "drama",
    "Ecchi" = "ecchi",
    "Escolares" = "school",
    "Espacial" = "space",
    "Fantasía" = "fantasy",
    "Harem" = "harem",
    "Historico" = "historical",
    "Infantil" = "kids",
    "Josei" = "josei",
    "Juegos" = "games",
    "Magia" = "magic",
    "Mecha" = "mecha",
    "Militar" = "military",
    "Misterio" = "mystery",
    "Música" = "music",
    "Parodia" = "parody",
    "Policía" = "police",
    "Psicológico" = "psychological",
    "Recuentos de la vida" = "sol",
    "Romance" = "romance",
    "Samurai" = "samurai",
    "Seinen" = "seinen",
    "Shoujo" = "shoujo",
    "Shounen" = "shounen",
    "Sobrenatural" = "supernatural",
    "Superpoderes" = "superpowers",
    "Suspenso" = "suspense",
    "Terror" = "horror",
    "Vampiros" = "vampires",
    "Yaoi" = "yaoi",
    "Yuri" = "yuri",
}

export const animeFlvToInternal: Record<ANIME_FLV_DIRECT_GENERE, AnimeGenre> = {
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
export const internalToAnimeFlv: Record<AnimeGenre, ANIME_FLV_DIRECT_GENERE> = {
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



// SUAPABASE

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      animes: {
        Row: {
          _id: number
          alternativetitles: string[]
          episodes: number
          flvpopularity: number
          flvurl: string
          genres: string[]
          hasepisode: boolean
          hasflvid: boolean
          hasranking: boolean
          image: string
          link: string
          movies: string[]
          ovas: string[]
          prequels: string[]
          ranking: number
          sequels: string[]
          specials: string[]
          spinoffs: string[]
          state: string
          synopsis: string
          thumb: string
          title: string
          type: string
        }
        Insert: {
          _id: number
          alternativetitles: string[]
          episodes: number
          flvpopularity: number
          flvurl: string
          genres: string[]
          hasepisode: boolean
          hasflvid: boolean
          hasranking: boolean
          image: string
          link: string
          movies: string[]
          ovas: string[]
          prequels: string[]
          ranking: number
          sequels: string[]
          specials: string[]
          spinoffs: string[]
          state: string
          synopsis: string
          thumb: string
          title: string
          type: string
        }
        Update: {
          _id?: number
          alternativetitles?: string[]
          episodes?: number
          flvpopularity?: number
          flvurl?: string
          genres?: string[]
          hasepisode?: boolean
          hasflvid?: boolean
          hasranking?: boolean
          image?: string
          link?: string
          movies?: string[]
          ovas?: string[]
          prequels?: string[]
          ranking?: number
          sequels?: string[]
          specials?: string[]
          spinoffs?: string[]
          state?: string
          synopsis?: string
          thumb?: string
          title?: string
          type?: string
        }
      }
      flv: {
        Row: {
          cover: string
          description: string
          genres: string[]
          id: number
          normalizedPopularity: number
          popularityByGenere: Json
          popularityIndex: number
          ranking: number
          related: Json
          state: string
          title: string
          type: string
        }
        Insert: {
          cover: string
          description: string
          genres: string[]
          id: number
          normalizedPopularity: number
          popularityByGenere: Json
          popularityIndex: number
          ranking: number
          related: Json
          state: string
          title: string
          type: string
        }
        Update: {
          cover?: string
          description?: string
          genres?: string[]
          id?: number
          normalizedPopularity?: number
          popularityByGenere?: Json
          popularityIndex?: number
          ranking?: number
          related?: Json
          state?: string
          title?: string
          type?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
