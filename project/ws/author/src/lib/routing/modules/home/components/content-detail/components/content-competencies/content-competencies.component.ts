import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { ConfigurationsService } from '@ws-widget/utils/src/public-api'
import { AccessControlService } from '../../../../../../../../public-api'
import { IAuthoringPagination } from '../../../../../../../interface/authored'
import { NSContent } from '../../../../../../../interface/content'
import { AuthInitService } from '../../../../../../../services/init.service'
import { LoaderService } from '../../../../../../../services/loader.service'
import { MyContentService } from '../../services/content-detail.service'
import { LocalDataService } from '../../services/local-data.service'

/* tslint:disable */
import _ from 'lodash'
import { ITable } from '@ws-widget/collection/src/public-api'
/* tslint:enable */

@Component({
  selector: 'ws-auth-content-competencies',
  templateUrl: './content-competencies.component.html',
  styleUrls: ['./content-competencies.component.scss'],
})
export class ContentCompetenciesComponent implements OnInit, OnDestroy {

  public contentId: string | null = null
  public content!: NSContent.IContentMeta
  public pagination!: IAuthoringPagination
  routerSubscription = <Subscription>{}
  myRoles!: Set<string>
  userId!: string
  public status = 'published'
  finalFilters: any = []
  table!: ITable
  currentAction: 'author' | 'reviewer' | 'expiry' | 'deleted' = 'author'
  allLanguages: any[] = []
  searchLanguage = ''
  isAdmin = false
  @ViewChild('searchInput', { static: false }) searchInputElem: ElementRef<any> = {} as ElementRef<
    any
  >

  constructor(
    private myContSvc: MyContentService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private loadService: LoaderService,
    private accessService: AccessControlService,
    // private snackBar: MatSnackBar,
    // private dialog: MatDialog,
    private authInitService: AuthInitService,
    // private valueSvc: ValueService,
    private dataService: LocalDataService,
    // private myTocService: MyTocService,
    private configService: ConfigurationsService,
  ) {
    this.userId = this.accessService.userId
    if (this.configService.userRoles) {
      this.myRoles = this.configService.userRoles
    }
    this.isAdmin = this.accessService.hasRole(['admin', 'super-admin', 'content-admin', 'editor'])
  }
  ngOnDestroy() {
    if (this.routerSubscription.unsubscribe) {
      this.routerSubscription.unsubscribe()
    }
    // if (this.defaultSideNavBarOpenedSubscription) {
    //   this.defaultSideNavBarOpenedSubscription.unsubscribe()
    // }
    this.loadService.changeLoad.next(false)
  }
  ngOnInit() {
    this.pagination = {
      offset: 0,
      limit: 24,
    }
    this.allLanguages = this.authInitService.ordinals.subTitles || []
    this.activatedRoute.queryParams.subscribe(params => {
      this.status = params.status || 'published'
      this.initCardTable()
      this.setAction()
      this.fetchContent()
    })
  }
  setAction() {
    switch (this.status) {
      case 'draft':
      case 'rejected':
      case 'inreview':
      case 'review':
      case 'published':
      case 'publish':
      case 'processing':
      case 'unpublished':
      case 'deleted':
        this.currentAction = 'author'
        break
      case 'expiry':
        this.currentAction = 'expiry'
        break
    }
  }
  fetchContent() {
    this.contentId = this.activatedRoute.snapshot.paramMap.get('contentId') || null
    const routeData = this.activatedRoute.snapshot.data.content
    if (!routeData) {
      if (this.contentId) {
        this.myContSvc.readContent(this.contentId).subscribe(s => {
          _.set(this, 'content', s)
          this.dataService.initData(s)
          // this.resetAndFetchTocStructure()
        })
      }
    } else {
      _.set(this, 'content', routeData)
      this.dataService.initData(routeData)
      // this.resetAndFetchTocStructure()
    }
  }
  initCardTable() {
    this.table = {
      columns: [
        {
          displayName: 'Competency', key: 'name', isList: false, prop: '',
          // link: { path: '/author/content-detail/', dParams: 'identifier' },
          defaultValue: 'Untitled Competency',
          // image: 'appIcon',
        },
        { displayName: 'Type', key: 'competencyType', isList: false, prop: '', defaultValue: 'NA' },
        {
          displayName: 'Area', key: 'competencyArea', isList: false, prop: '', defaultValue: 'NA',
        },
        {
          displayName: 'Tagged level', key: 'selectedLevelName', isList: false, prop: '', defaultValue: 'NA',
        },
        { displayName: 'Description', key: 'description', defaultValue: 0 },
      ], //  :> this will load from json
      actions: [], // :> this will load from json
      needCheckBox: false,
      needHash: false,
      sortColumn: 'name',
      sortState: 'asc',
      actionsMenu: {
        headIcon: 'apps',
        menus: [
          { name: 'Edit', action: 'edit', disabled: false, icon: 'edit' },
          { name: 'Delete', action: 'delete', disabled: false, icon: 'delete' },
        ],
        rowIcon: 'more_vert',
      },
    }
  }
  action($event: any) {
    if ($event) {

    }
  }
  clicked($event: any) {
    if ($event) {
      this.router.navigate(['/author/competencies/competency', _.get($event, 'id')])
    }
  }
  get getTableData(): any[] {
    const compData = _.get(this.activatedRoute, 'snapshot.data.content.competencies_v3')
    if (typeof (compData) === 'string') {
      return JSON.parse(compData)
    } return compData || []
  }
}
