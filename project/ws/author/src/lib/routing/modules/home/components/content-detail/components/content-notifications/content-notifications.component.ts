import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Subscription } from 'rxjs'
import { AccessControlService } from '../../../../../../../../public-api'
import { NSContent } from '../../../../../../../interface/content'
import { AuthInitService } from '../../../../../../../services/init.service'
import { LoaderService } from '../../../../../../../services/loader.service'
import { MyContentService } from '../../services/content-detail.service'
import { LocalDataService } from '../../services/local-data.service'

/* tslint:disable */
import _ from 'lodash'
import { EBatchTimeLines } from '../../enums/batch-options'
import { ConfigurationsService } from '@ws-widget/utils/src/public-api'
import { INotifications } from '../../interface/notifications.model'
import { ITable } from '@ws-widget/collection/src/public-api'
/* tslint:enable */

@Component({
  selector: 'ws-auth-content-notifications',
  templateUrl: './content-notifications.component.html',
  styleUrls: ['./content-notifications.component.scss'],
})
export class ContentNotificationsComponent implements OnInit, OnDestroy {

  public contentId: string | null = null
  public content!: NSContent.IContentMeta
  routerSubscription = <Subscription>{}
  allLanguages: any[] = []
  searchLanguage = ''
  isAdmin = false
  tableData!: ITable
  notifications!: INotifications[]
  batchTimeline = EBatchTimeLines
  status = this.batchTimeline.Scheduled
  userId!: string
  myRoles!: Set<string>
  constructor(
    private myContSvc: MyContentService,
    private activatedRoute: ActivatedRoute,
    private loadService: LoaderService,
    private accessService: AccessControlService,
    private authInitService: AuthInitService,
    private dataService: LocalDataService,
    private configService: ConfigurationsService,
  ) {
    if (this.configService.userRoles) {
      this.myRoles = this.configService.userRoles
    }
    this.userId = this.accessService.userId

    this.isAdmin = this.accessService.hasRole(['admin', 'super-admin', 'content-admin', 'editor'])
    this.initCardTable()
  }
  ngOnDestroy() {
    if (this.routerSubscription.unsubscribe) {
      this.routerSubscription.unsubscribe()
    }
    this.loadService.changeLoad.next(false)
  }
  ngOnInit() {
    this.allLanguages = this.authInitService.ordinals.subTitles || []
    this.activatedRoute.queryParams.subscribe(() => {
      this.fetchContent()
    })
  }

  fetchContent() {
    this.contentId = this.activatedRoute.snapshot.parent && this.activatedRoute.snapshot.parent.paramMap.get('contentId') || null
    const routeData = this.activatedRoute.snapshot.parent &&
      this.activatedRoute.snapshot.parent.data.content
    if (!routeData) {
      if (this.contentId) {
        this.myContSvc.readContent(this.contentId).subscribe(s => {
          _.set(this, 'content', s)
          this.dataService.initData(s)
          this.fetchNotifications()
        })
      }
    } else {
      _.set(this, 'content', routeData)
      this.dataService.initData(routeData)
      this.fetchNotifications()
    }
  }
  routeToScreen(type: EBatchTimeLines) {
    switch (type) {
      case EBatchTimeLines.Scheduled:
        break
      case EBatchTimeLines.Past:
        break
      default:
        break
    }
  }
  isAllowed(roles: string[]) {
    if (roles && roles.length > 0) {
      return this.accessService.hasRole(roles)
    }
    return true // should be false
  }
  fetchNotifications() {
    this.notifications = [{
      title: 'New knowledge resource added',
      scheduled: '1st Jan 2020 23:30:55',
      position: [{ name: 'All' }],
      location: [{ name: 'All' }],
      role: [{ name: 'All' }],
    }]
  }
  get getTableData(): any[] {
    if (this.notifications && this.notifications.length > 0) {
      return _.map(this.notifications, i => {
        // const duration = this.durationPipe.transform(i.duration || 0, 'hms') || '0'
        // i.duration = duration
        return i
      })
    }
    return []
  }
  action(event: { data: any; type: string }) {
    switch (event.type) {
      case 'create':
        break
    }
  }
  initCardTable() {
    this.tableData = {
      columns: [
        {
          displayName: 'Title', key: 'title', isList: false, prop: '',
          defaultValue: 'Untitled',
        },
        { displayName: 'Scheduled for', key: 'scheduled', isList: false, prop: '', defaultValue: 'NA' },
        { displayName: 'Position', key: 'position', prop: 'name', isList: true, defaultValue: 'NA' },
        { displayName: 'Role', key: 'role', prop: 'name', isList: true, defaultValue: 'NA' },
        { displayName: 'Location', key: 'location', prop: 'name', isList: true, defaultValue: 'NA' },
      ], //  :> this will load from json
      actions: [], // :> this will load from json
      needCheckBox: false,
      needHash: false,
      sortColumn: 'name',
      sortState: 'asc',
    }
  }
}
