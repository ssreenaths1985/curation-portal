import { Component, OnInit, OnDestroy } from '@angular/core'
import { map } from 'rxjs/operators'
import { ConfigurationsService, ValueService } from '@ws-widget/utils'
import { AccessControlService } from '../../../../../../../modules/shared/services/access-control.service'
import { AuthInitService } from '../../../../../../../services/init.service'
import { ILeftMenu } from '@ws-widget/collection'
/* tslint:disable */
import _ from 'lodash'
/* tslint:enable */

@Component({
  selector: 'ws-auth-surveys-base',
  templateUrl: './surveys-base.component.html',
  styleUrls: ['./surveys-base.component.scss'],
})
export class SurveysBaseComponent implements OnInit, OnDestroy {
  public sideNavBarOpenedMain = true
  isAdmin = false
  isLtMedium$ = this.valueSvc.isLtMedium$
  private defaultSideNavBarOpenedSubscription: any
  mode$ = this.isLtMedium$.pipe(map(isMedium => (isMedium ? 'over' : 'side')))
  public screenSizeIsLtMedium = false
  leftmenues!: ILeftMenu[]
  myRoles!: Set<string>
  userId!: string
  constructor(
    private valueSvc: ValueService,
    private accessService: AccessControlService,
    private configService: ConfigurationsService,
    private authInitService: AuthInitService,
  ) {
    this.userId = this.accessService.userId
    if (this.configService.userRoles) {
      this.myRoles = this.configService.userRoles
    }
    // if (this.activatedRoute.snapshot.data.competencies) {
    //   this.competencies = _.get(this.activatedRoute, 'snapshot.data.competencies.data')
    // }
    const leftData = this.authInitService.authAdditionalConfig.menus
    _.set(leftData, 'widgetData.logo', true)
    _.set(leftData, 'widgetData.logoPath', (this.configService.userProfile) ? this.configService.userProfile.departmentImg : '')
    _.set(leftData, 'widgetData.name', (this.configService.userProfile) ? this.configService.userProfile.departmentName : '')
    _.set(leftData, 'widgetData.userRoles', this.myRoles)
    this.leftmenues = leftData
    this.isAdmin = this.accessService.hasRole(['admin', 'super-admin', 'content-admin', 'editor', 'content_creator'])
  }

  ngOnInit() {
    this.defaultSideNavBarOpenedSubscription = this.isLtMedium$.subscribe(isLtMedium => {
      this.sideNavBarOpenedMain = !isLtMedium
      this.screenSizeIsLtMedium = isLtMedium
    })
  }

  ngOnDestroy() {
    if (this.defaultSideNavBarOpenedSubscription) {
      this.defaultSideNavBarOpenedSubscription.unsubscribe()
    }
  }
}
