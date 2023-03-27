import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PublicLogoutComponent } from './public-logout.component'
import {
  MatToolbarModule,
  MatCardModule,
  MatDividerModule,
  MatIconModule,
  MatExpansionModule,
} from '@angular/material'

@NgModule({
  declarations: [PublicLogoutComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatExpansionModule,
  ],
  exports: [PublicLogoutComponent],
})
export class PublicLogoutModule { }
