import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MatButtonModule, MatCardModule, MatIconModule } from '@angular/material'
import { BtnPageBackComponent } from './btn-page-back.component'

@NgModule({
  declarations: [BtnPageBackComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
  ],
  exports: [BtnPageBackComponent],
  entryComponents: [BtnPageBackComponent],
})
export class BtnPageBackModule { }
