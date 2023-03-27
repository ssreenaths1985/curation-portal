import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CardRatingCommentComponent } from './card-rating-comment.component'
import { MatProgressBarModule, MatIconModule, MatTooltipModule, MatCardModule, MatFormFieldModule, MatInputModule } from '@angular/material'
import { AvatarPhotoModule } from '../_common/avatar-photo/avatar-photo.module'
import { PipeCountTransformModule, PipeRelativeTimeModule } from '../../../../utils/src/public-api'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

@NgModule({
  declarations: [CardRatingCommentComponent],
  imports: [
    CommonModule,
    PipeCountTransformModule,
    MatProgressBarModule,
    MatIconModule,
    MatTooltipModule,
    AvatarPhotoModule,
    PipeRelativeTimeModule,
    MatCardModule,
    FormsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
  ],
  exports: [
    CardRatingCommentComponent,
  ],
})
export class CardRatingCommentModule { }
