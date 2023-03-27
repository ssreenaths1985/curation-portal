import { Injectable } from '@angular/core'
import { map } from 'rxjs/operators'
import { ApiService } from '../../../../../../../public-api'
import { NSSurvey } from '../models/survey.model'

const API_END_POINTS = {
  CREATE_SURVEY: 'apis/proxies/v8/forms/createForm',
  ALL_SURVEYS: 'apis/proxies/v8/forms/getAllForms',
  GET_SURVEY_BY_ID: 'apis/proxies/v8/forms/getFormById',
  ALL_SURVEYS_RESPONSES: 'apis/proxies/v8/forms/getAllApplications',
}

@Injectable({
  providedIn: 'root',
})

export class SurveyService {
  public surveyData: NSSurvey.ISurvey = {
    id: '',
    version: '',
    title: '',
    fields: [],
  }
  constructor(
    private apiService: ApiService,
  ) { }

  addField(field: NSSurvey.IField) {
    if (this.surveyData.fields.filter(e => e.identifier === field.identifier).length <= 0) {
      this.surveyData.fields.push(field)
    }
    // console.log('this.surveyData: ', this.surveyData)
  }

  updateFieldByIndex(index: number, field: NSSurvey.IField) {
    if (this.surveyData.fields[index]) {
      this.surveyData.fields[index] = field
    }
  }

  deleteFieldByIndex(index: number) {
    if (this.surveyData.fields[index]) {
      this.surveyData.fields.splice(index, 1)
    }
  }

  getFieldById(id: string) {
    return this.surveyData.fields.find(e => e.identifier === id)
  }

  getFieldIndexById(id: string) {
    return this.surveyData.fields.findIndex(e => e.identifier === id)
  }

  convertToSurveyType(questionType: any) {
    let type = ''
    switch (questionType) {
      case 'star-rating':
        type = 'rating'
        break
      case 'mcq-sca':
        type = 'radio'
        break
      case 'mcq-mca':
        type = 'checkbox'
        break
      case 'textarea':
        type = 'textarea'
        break
    }
    return type
  }

  convertFromSurveyType(questionType: any) {
    let type = ''
    switch (questionType) {
      case 'rating':
        type = 'star-rating'
        break
      case 'checkbox':
        type = 'mcq-mca'
        break
      case 'radio':
        type = 'mcq-sca'
        break
      case 'textarea':
        type = 'textarea'
        break
    }
    return type
  }

  createSurvey() {
    const finalPayload = this.formatRequest()
    // console.log('finalPayload', finalPayload)
    return this.apiService.post<null>(
      API_END_POINTS.CREATE_SURVEY, finalPayload
    )
  }

  fetchAllSurveys() {
    return this.apiService.get<NSSurvey.ISurveysResponse>(API_END_POINTS.ALL_SURVEYS)
  }

  resetSurveyData() {
    this.surveyData = {
      id: '',
      version: '',
      title: '',
      fields: [],
    }
  }

  formatRequest() {
    const finalReq = {
      ...this.surveyData,
    }
    // format fieldType and order of each field
    finalReq.fields = this.surveyData.fields.map((f, i: number) => {
      return {
        ...f,
        order: i + 1,
        fieldType: this.convertToSurveyType(f.fieldType),
      }
    })
    return finalReq
  }

  formatResponse(res: any) {
    if (res && res.fields) {
      res.fields = res.fields.map((f: any) => {
        return {
          ...f,
          fieldType: this.convertFromSurveyType(f.fieldType),
        }
      })
    }
    return res
  }

  getSurveyByID(id: string) {
    return this.apiService.get<NSSurvey.ISurveysResponse>(`${API_END_POINTS.GET_SURVEY_BY_ID}?id=${id}`).pipe(
      map(
        res => {
          return this.formatResponse(res.responseData)
        }
      )
    )
  }

  fetchAttachedCourses(req: any) {
    return this.apiService.post<any>(`${API_END_POINTS.ALL_SURVEYS_RESPONSES}`, req)
  }
}
