import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { RainDashboardHomeComponent } from './components/rain-dashboard-home/rain-dashboard-home.component'

const routes: Routes = []

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: RainDashboardHomeComponent,
        children: routes,
      },
    ]),
  ],
  exports: [RouterModule],
})
export class RainDashboardRoutingModule { }
