import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { UserContentRatingComponent } from './user-content-rating.component'
import { MatCardModule, MatIconModule, MatButtonModule, MatProgressBarModule, MatTooltipModule } from '@angular/material'
import { InViewPortModule } from '../../../../../utils/src/lib/directives/in-view-port/in-view-port.module'
import { PipeCountTransformModule } from '../../../../../utils/src/public-api'

@NgModule({
  declarations: [UserContentRatingComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    InViewPortModule,
    MatProgressBarModule,
    PipeCountTransformModule,
    MatTooltipModule,
  ],
  exports: [UserContentRatingComponent],
})
export class UserContentRatingModule { }
