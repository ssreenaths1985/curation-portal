import { Component, ElementRef, OnDestroy, OnInit, ViewChild, Input } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Subscription } from 'rxjs'
import { AccessControlService } from '../../../../../../../../public-api'
import { IAuthoringPagination } from '../../../../../../../interface/authored'
import { NSContent } from '../../../../../../../interface/content'
import { AuthInitService } from '../../../../../../../services/init.service'
import { LoaderService } from '../../../../../../../services/loader.service'
import { MyContentService } from '../../services/content-detail.service'
import { LocalDataService } from '../../services/local-data.service'

/* tslint:disable */
import _ from 'lodash'
/* tslint:enable */

@Component({
  selector: 'ws-auth-content-rating',
  templateUrl: './content-rating.component.html',
  styleUrls: ['./content-rating.component.scss'],
})
export class ContentRatingComponent implements OnInit, OnDestroy {
  @Input() content!: NSContent.IContentMeta
  public contentId: string | null = null
  public pagination!: IAuthoringPagination
  routerSubscription = <Subscription>{}
  public status = 'published'
  finalFilters: any = []
  currentAction: 'author' | 'reviewer' | 'expiry' | 'deleted' = 'author'
  allLanguages: any[] = []
  searchLanguage = ''
  isAdmin = false
  isPreviewMode = false
  forPreview = false
  @ViewChild('searchInput', { static: false }) searchInputElem: ElementRef<any> = {} as ElementRef<
    any
  >

  constructor(
    private myContSvc: MyContentService,
    private activatedRoute: ActivatedRoute,
    // private router: Router,
    private loadService: LoaderService,
    private accessService: AccessControlService,
    // private snackBar: MatSnackBar,
    // private dialog: MatDialog,
    private authInitService: AuthInitService,
    // private valueSvc: ValueService,
    private dataService: LocalDataService,
    // private myTocService: MyTocService
  ) {
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
}
