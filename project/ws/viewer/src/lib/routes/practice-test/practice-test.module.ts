import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import {
  MatCardModule,
  MatDividerModule,
  MatButtonModule,
  MatToolbarModule,
  MatIconModule,
  MatSnackBarModule,
  MatChipsModule,
  MatProgressSpinnerModule,

} from '@angular/material'

import {
  BtnPlaylistModule,
  DisplayContentTypeModule,
  UserImageModule,
  UserContentRatingModule,
  BtnContentFeedbackV2Module,
  BtnPageBackModule,
} from '@ws-widget/collection'

import {
  PipeDurationTransformModule,
  PipeLimitToModule,
  PipePartialContentModule,
} from '@ws-widget/utils'

import { WidgetResolverModule } from '@ws-widget/resolver'

// import { QuizModule as QuizPluginModule } from '../../plugins/quiz/quiz.module'
import { PracticeModule as PracticeViewContainerModule } from '../../route-view-container/practice/practice.module'

import { PracticeTestComponent } from './practice-test.component'
import { PracticeRoutingModule } from './practice-routing.module'

@NgModule({
  declarations: [PracticeTestComponent],
  imports: [
    CommonModule,
    PracticeRoutingModule,
    PracticeViewContainerModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatToolbarModule,
    MatChipsModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    BtnPlaylistModule,
    DisplayContentTypeModule,
    UserImageModule,
    PipeDurationTransformModule,
    PipeLimitToModule,
    PipePartialContentModule,
    WidgetResolverModule,
    UserContentRatingModule,
    BtnContentFeedbackV2Module,
    BtnPageBackModule,
  ],
  // exports: [
  //   PracticeTestComponent,
  // ],
})
export class PracticeTestModule { }
