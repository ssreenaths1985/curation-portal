import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { SurveysRoutingModule } from './surveys-routing.module'
import { SurveysListComponent } from './components/surveys-list/surveys-list.component'
import { CreateSurveyComponent } from './components/create-survey/create-survey.component'
import { SurveysBaseComponent } from './components/surveys-base/surveys-base.component'
import { SharedModule } from '../../../../../../public-api'
import { MatDividerModule, MatPaginatorModule, MatSortModule, MatTableModule } from '@angular/material'
import { PipeContentRouteModule } from '../../../../../../../../../../library/ws-widget/collection/src/public-api'
import { WidgetResolverModule } from '../../../../../../../../../../library/ws-widget/resolver/src/public-api'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { QuizModule } from '../../../editor/routing/modules/quiz/quiz.module'
import { SurveyService } from './services/survey.service'
import { SurveysResolverService } from './resolvers/surveys-resolver.service'
import { SurveyResponsesComponent } from './components/survey-responses/survey-responses.component'
import { MicroSurveyModule } from '@sunbird-cb/micro-surveys'
import { PipeCourseNameModule } from '../../../../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-coursename/PipeCourseNameModule'
import { PipeOrderByModule } from '../../../../../../../../../../library/ws-widget/utils/src/public-api'
import { PipeFilterSearchModule } from '../../../../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-filter-search/pipe-filter-search.module'
import { PreviewSurveyComponent } from './components/preview-survey/preview-survey.component'
import { DragDropModule } from '@angular/cdk/drag-drop'

@NgModule({
  declarations: [SurveysListComponent, CreateSurveyComponent, SurveysBaseComponent, SurveyResponsesComponent, PreviewSurveyComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SurveysRoutingModule,
    CommonModule,
    SharedModule,
    MatTableModule,
    MatSortModule,
    MatDividerModule,
    PipeContentRouteModule,
    WidgetResolverModule,
    QuizModule,
    MicroSurveyModule,
    PipeCourseNameModule,
    PipeOrderByModule,
    PipeFilterSearchModule,
    MatPaginatorModule,
    DragDropModule,
  ],
  providers: [
    SurveyService,
    SurveysResolverService,
  ],
})
export class SurveysModule { }
