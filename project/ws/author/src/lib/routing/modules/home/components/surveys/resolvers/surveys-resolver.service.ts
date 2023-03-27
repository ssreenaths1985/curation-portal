import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router'
import { IResolveResponse } from '@ws-widget/utils'
import { Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { NSSurvey } from '../models/survey.model'
import { SurveyService } from '../services/survey.service'

@Injectable({
  providedIn: 'root',
})
export class SurveysResolverService implements
  Resolve<Observable<IResolveResponse<NSSurvey.ISurveysResponse>> |
  IResolveResponse<NSSurvey.ISurveysResponse>> {
  constructor(private surveyService: SurveyService) { }

  resolve(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<IResolveResponse<NSSurvey.ISurveysResponse>> {
    return this.surveyService.fetchAllSurveys().pipe(
      map((data: any) => ({ data: data.responseData, error: null })),
      catchError(error => of({ error, data: null })),
    )
  }
}
