import { Component, OnInit, ViewEncapsulation } from '@angular/core'
import { Router } from '@angular/router'
import { ConfigurationsService, NsPage } from '@ws-widget/utils/src/public-api'
import { RainDashboardService } from '../../rain-dashboard-cbp.service'

@Component({
  selector: 'ws-auth-rain-dashboard-home',
  templateUrl: './rain-dashboard-home.component.html',
  styleUrls: ['./rain-dashboard-home.component.scss', 'bootstrap-rain.scss'],
  /* tslint:disable-next-line */
  encapsulation: ViewEncapsulation.None,
  /* tslint:enable */
})
export class RainDashboardHomeComponent implements OnInit {

  constructor(
    private router: Router,
    private configSvc: ConfigurationsService,
    private rainService: RainDashboardService,
  ) { }
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar

  getDashboardForKM!: string
  getDashboardForProfile!: string
  getChartV2!: string
  selectedDashboardId = ''
  mapPath!: string
  currentDashboard: any = []
  dashboardEmpty!: any
  token = ''

  ngOnInit() {
    this.getJsonData()
  }

  getDashboardId(value: string) {
    if (value && value !== null) {
      this.selectedDashboardId = value
    } else {
      this.currentDashboard = []
      this.currentDashboard.push(this.dashboardEmpty)
    }
  }

  backToHome() {
    this.router.navigate(['author', 'cbp', 'me'])
  }

  async getJsonData() {
    const rainJsonData = await this.rainService.getRainDashboardJsonData().toPromise().catch(_error => { })
    this.mapPath = rainJsonData.mapFilePath
    this.dashboardEmpty = rainJsonData.dashboardEmptyData
    this.getDashboardForKM = rainJsonData.dashboardForKarmayogi
    this.getDashboardForProfile = `${rainJsonData.dashboardForProfile}?realm=${rainJsonData.portal}`
    this.getChartV2 = rainJsonData.chartForKarmayogi
    if (this.selectedDashboardId === '') {
      this.currentDashboard = []
      this.currentDashboard.push(this.dashboardEmpty)
    }
  }

}
