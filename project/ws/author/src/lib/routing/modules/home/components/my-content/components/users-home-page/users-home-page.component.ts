
import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core'
import { AuthInitService } from '@ws/author/src/lib/services/init.service'
import { ValueService, ConfigurationsService } from '@ws-widget/utils'
/* tslint:disable */
import _ from 'lodash'
import { ILeftMenu } from '@ws-widget/collection'
import { map } from 'rxjs/operators'
/* tslint:enable */

@Component({
  selector: 'ws-auth-users-home-page',
  templateUrl: './users-home-page.component.html',
  styleUrls: ['./users-home-page.component.scss'],
})
export class UserHomePageComponent implements OnInit, OnDestroy, AfterViewInit {
  // left menu variables
  leftmenues!: ILeftMenu
  myRoles!: Set<string>
  public sideNavBarOpenedMain = true
  public screenSizeIsLtMedium = false
  private defaultSideNavBarOpenedSubscription: any
  isLtMedium$ = this.valueSvc.isLtMedium$
  mode$ = this.isLtMedium$.pipe(map(isMedium => (isMedium ? 'over' : 'side')))

  // local varibles used
  viewContentData!: string
  actionItem: any

  constructor(
    private valueSvc: ValueService,
    private authInitService: AuthInitService,
    private configService: ConfigurationsService,
  ) {
    if (this.configService.userRoles) {
      this.myRoles = this.configService.userRoles
    }
    const leftData = this.authInitService.authAdditionalConfig.menus
    _.set(leftData, 'widgetData.logo', true)
    _.set(leftData, 'widgetData.logoPath', (this.configService.userProfile) ? this.configService.userProfile.departmentImg : '')
    _.set(leftData, 'widgetData.name', (this.configService.userProfile) ? this.configService.userProfile.departmentName : '')
    _.set(leftData, 'widgetData.userRoles', this.myRoles)
    this.leftmenues = leftData
  }

  ngOnDestroy() {
    if (this.defaultSideNavBarOpenedSubscription) {
      this.defaultSideNavBarOpenedSubscription.unsubscribe()
    }
  }

  ngAfterViewInit() {
  }

  ngOnInit() {
    this.defaultSideNavBarOpenedSubscription = this.isLtMedium$.subscribe(isLtMedium => {
      this.sideNavBarOpenedMain = !isLtMedium
      this.screenSizeIsLtMedium = isLtMedium
    })
    this.viewContentData = 'listOfUsers'
  }

  takeAction(item: any) {
    switch (item.type) {
      case 'createNew':
      case 'existingUser':
        this.viewContentData = 'addNewUser'
        this.actionItem = item
        break
      case 'addUserCancel':
        this.viewContentData = 'listOfUsers'
        break
    }
  }

}
