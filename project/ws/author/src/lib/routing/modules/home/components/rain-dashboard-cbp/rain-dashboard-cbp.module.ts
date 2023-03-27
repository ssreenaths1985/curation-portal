import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatButtonModule, MatCardModule, MatIconModule, MatToolbarModule } from '@angular/material'
import { RainDashboardHomeComponent } from './components/rain-dashboard-home/rain-dashboard-home.component'
import { RainDashboardRoutingModule } from './rain-dashboard-cbp-routing.module'
import { RainDashboardsModule } from '@sunbird-cb/rain-dashboards'
import { RainDashboardService } from './rain-dashboard-cbp.service'
import { ApiService } from '@ws/author/src/lib/modules/shared/services/api.service'

@NgModule({
  declarations: [RainDashboardHomeComponent],
  imports: [
    CommonModule,
    RainDashboardRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    RainDashboardsModule,
  ],
  providers: [RainDashboardService, ApiService],
  exports: [RainDashboardHomeComponent],
})

export class CbpRainDashboardModule { }
