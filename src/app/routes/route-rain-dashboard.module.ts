import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { CbpRainDashboardModule } from '../../../project/ws/author/src/lib/routing/modules/home/components/rain-dashboard-cbp/rain-dashboard-cbp.module'

@NgModule({
  declarations: [],
  imports: [CommonModule, CbpRainDashboardModule],
  exports: [CbpRainDashboardModule],
})
export class RouteRainDashboardModule { }
