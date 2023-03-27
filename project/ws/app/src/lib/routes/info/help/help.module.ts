import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  MatToolbarModule,
  MatDividerModule,
  MatButtonModule,
  MatRippleModule,
  MatIconModule,
  MatCardModule,
} from '@angular/material'

import { BtnPageBackModule } from '@ws-widget/collection'
import { HelpComponent } from './components/help.component'

@NgModule({
  declarations: [HelpComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatDividerModule,
    MatButtonModule,
    MatRippleModule,
    MatIconModule,
    BtnPageBackModule,
    MatCardModule,
  ],
  providers: [],
})
export class HelpModule { }
