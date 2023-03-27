import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core'
import { ActivatedRoute, Data, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { NsContent } from '../../../../../../../../../../../../library/ws-widget/collection/src/public-api'
import { ConfigurationsService, NsPage } from '../../../../../../../../../../../../library/ws-widget/utils/src/public-api'
import { ContentInsightsRainService } from '../../services/content-insights-rain.service'
// tslint:disable
import _ from 'lodash'
// tslint:enable

@Component({
  selector: 'ws-auth-content-insights-rain',
  templateUrl: './content-insights-rain.component.html',
  styleUrls: ['./content-insights-rain.component.scss', 'bootstrap-rain.scss'],
  /* tslint:disable-next-line */
  encapsulation: ViewEncapsulation.None,
  /* tslint:enable */
})
export class ContentInsightsRainComponent implements OnInit, OnDestroy {
  content: NsContent.IContent | null = null
  contentId!: any
  routeParentSubscription: Subscription | null = null
  getDashboardForKM!: string
  getDashboardForProfile!: string
  getChartV2!: string
  selectedDashboardId = ''
  mapPath!: string
  currentDashboard: any = []
  dashboardEmpty!: any
  token = ''
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private configSvc: ConfigurationsService,
    private rainService: ContentInsightsRainService,
  ) { }

  ngOnInit() {
    this.getJsonData()
    if (this.route && this.route.parent) {
      const parentRoute = this.route
      this.routeParentSubscription = parentRoute.data.subscribe((data: Data) => {
        this.initData(_.get(data, 'content.result'))
      })
    }
  }
  private initData(_data: Data) {
    this.contentId = this.route.snapshot.paramMap.get('contentId') || null
    this.content = this.route.snapshot.data.content
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
    this.getDashboardForProfile = `${rainJsonData.dashboardForProfile}?realm=${rainJsonData.realmCa}`
    this.getChartV2 = rainJsonData.chartForKarmayogi
    if (this.selectedDashboardId === '') {
      this.currentDashboard = []
      this.currentDashboard.push(this.dashboardEmpty)
    }
  }

  ngOnDestroy() {
    if (this.routeParentSubscription) {
      this.routeParentSubscription.unsubscribe()
    }
  }
}
