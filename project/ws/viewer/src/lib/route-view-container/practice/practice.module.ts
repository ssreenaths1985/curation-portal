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
import { PracticePlModule as PracticePluginModule } from '../../plugins/practice/practice.module'
import { PracticeComponent } from './practice.component'
import { PracticeRoutingModule } from './practice-routing.module'

@NgModule({
  declarations: [PracticeComponent],
  imports: [
    CommonModule,
    PracticeRoutingModule,
    PracticePluginModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatToolbarModule,
    MatChipsModule,
    MatIconModule,
    MatSnackBarModule,
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
  exports: [
    PracticeComponent,
  ],
})
export class PracticeModule { }
