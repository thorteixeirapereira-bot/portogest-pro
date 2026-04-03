import { create } from 'zustand'
import type { Survey, SurveyResponse } from '../types'
import { dbGetAll, dbPut } from '../lib/db'

interface SurveysState {
  surveys: Survey[]
  loading: boolean
  fetchSurveys: () => Promise<void>
  addSurvey: (survey: Survey) => Promise<void>
  updateSurvey: (survey: Survey) => Promise<void>
  addResponse: (surveyId: string, response: SurveyResponse) => Promise<void>
}

export const useSurveysStore = create<SurveysState>((set, get) => ({
  surveys: [],
  loading: false,

  fetchSurveys: async () => {
    set({ loading: true })
    const surveys = await dbGetAll<Survey>('surveys')
    set({ surveys, loading: false })
  },

  addSurvey: async (survey) => {
    await dbPut('surveys', survey)
    set(s => ({ surveys: [...s.surveys, survey] }))
  },

  updateSurvey: async (survey) => {
    await dbPut('surveys', survey)
    set(s => ({ surveys: s.surveys.map(sv => sv.id === survey.id ? survey : sv) }))
  },

  addResponse: async (surveyId, response) => {
    const { surveys } = get()
    const survey = surveys.find(s => s.id === surveyId)
    if (!survey) return
    const updated = { ...survey, responses: [...survey.responses, response] }
    await dbPut('surveys', updated)
    set(s => ({ surveys: s.surveys.map(sv => sv.id === surveyId ? updated : sv) }))
  },
}))
