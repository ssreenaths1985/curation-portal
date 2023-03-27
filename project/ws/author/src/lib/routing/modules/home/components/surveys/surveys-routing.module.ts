import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { SurveysListComponent } from './components/surveys-list/surveys-list.component'
import { CreateSurveyComponent } from './components/create-survey/create-survey.component'
import { SurveysBaseComponent } from './components/surveys-base/surveys-base.component'
import { PageResolve } from '../../../../../../../../../../library/ws-widget/utils/src/public-api'
import { SurveysResolverService } from './resolvers/surveys-resolver.service'
import { SurveyResponsesComponent } from './components/survey-responses/survey-responses.component'
import { PreviewSurveyComponent } from './components/preview-survey/preview-survey.component'

const routes: Routes = [
  {
    path: '',
    component: SurveysBaseComponent,
    resolve: {
      // departmentData: DepartmentResolver,
    },
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        component: SurveysListComponent,
        // data: {
        //   pageType: 'feature',
        //   pageKey: 'Survey-list',
        // },
        resolve: {
          pageData: PageResolve,
          surveys: SurveysResolverService,
        },
      },
      {
        path: 'create-survey',
        component: CreateSurveyComponent,
        // data: {
        //   pageType: 'feature',
        //   pageKey: 'survey-create',
        // },
        resolve: {
          pageData: PageResolve,
        },
      },
      {
        path: ':surveyId/:courseId',
        component: SurveyResponsesComponent,
        // data: {
        //   pageType: 'feature',
        //   pageKey: 'survey-create',
        // },
        resolve: {
          pageData: PageResolve,
        },
      },
      {
        path: 'preview',
        component: PreviewSurveyComponent,
        resolve: {
          pageData: PageResolve,
        },
      },
    ],
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SurveysRoutingModule { }
