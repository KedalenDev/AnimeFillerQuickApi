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
