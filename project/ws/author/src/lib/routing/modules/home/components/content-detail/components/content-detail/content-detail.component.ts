import { AuthExpiryDateConfirmComponent } from '@ws/author/src/lib/modules/shared/components/auth-expiry-date-confirm/auth-expiry-date-confirm.component'
// import { FlatTreeControl } from '@angular/cdk/tree'
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core'
import { FormGroup, FormControl } from '@angular/forms'
import { MatDialog, MatSnackBar } from '@angular/material'
import { ActivatedRoute, Router } from '@angular/router'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { NSApiRequest } from '@ws/author/src/lib/interface/apiRequest'
import {
  IAuthoringPagination,
  // IFilterMenuNode,
  // IMenuFlatNode,
} from '@ws/author/src/lib/interface/authored'
import { NSContent } from '@ws/author/src/lib/interface/content'
import { CommentsDialogComponent } from '@ws/author/src/lib/modules/shared/components/comments-dialog/comments-dialog.component'
import { ConfirmDialogComponent } from '@ws/author/src/lib/modules/shared/components/confirm-dialog/confirm-dialog.component'
import { ErrorParserComponent } from '@ws/author/src/lib/modules/shared/components/error-parser/error-parser.component'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { AuthInitService } from '@ws/author/src/lib/services/init.service'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { Subscription, Subject } from 'rxjs'
import { MyContentService } from '../../services/content-detail.service'
import { map, debounceTime, switchMap, takeUntil } from 'rxjs/operators'
import { PipeDurationTransformPipe, ValueService, LoggerService, ConfigurationsService } from '@ws-widget/utils'
import { v4 as uuidv4 } from 'uuid'

/* tslint:disable */
import _ from 'lodash'
import { IAtGlanceComponentData, IAuthorData, ITable, NsContent, WidgetContentService } from '@ws-widget/collection'
import { LocalDataService } from '../../services/local-data.service'
// import { NsAppToc } from '../../interface/app-toc.model'
import { MyTocService, IReply } from '../../services/my-toc.service'
import { ICON_TYPE } from '@ws/author/src/lib/constants/icons'
import { environment } from '../../../../../../../../../../../../src/environments/environment'
/* tslint:enable */

@Component({
  selector: 'ws-auth-content-detail',
  templateUrl: './content-detail.component.html',
  styleUrls: ['./content-detail.component.scss'],
  providers: [PipeDurationTransformPipe],
})
export class ContentDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  public sideNavBarOpened = true
  newDesign = true
  tableData!: ITable
  // currentFilter = 'publish'
  // filterMenuTreeControl: FlatTreeControl<IMenuFlatNode>
  tocStructure: IAtGlanceComponentData.ICounts | null = null
  filterMenuTreeFlattener: any
  public cardContent!: any[]
  public contentId: string | null = null
  public content!: NSContent.IContentMeta
  public filters: any[] = []
  // public status = 'draft'
  public status = 'published'
  public defaultLogo = '/assets/instances/eagle/app_logos/source.png'
  public fetchError = false
  contentType: string[] = []
  complexityLevel: string[] = []
  unit: string[] = []
  finalFilters: any = []
  allLanguages: any[] = []
  searchLanguage = ''
  public pagination!: IAuthoringPagination
  userId!: string
  totalContent!: number
  showLoadMore!: boolean
  displayLoader = false
  routerSubscription = <Subscription>{}
  private unsubscribe = new Subject<void>()
  queryFilter = ''
  ordinals: any
  isAdmin = false
  currentAction: 'author' | 'reviewer' | 'expiry' | 'deleted' = 'author'
  count: any = {}
  isLtMedium$ = this.valueSvc.isLtMedium$
  private defaultSideNavBarOpenedSubscription: any
  mode$ = this.isLtMedium$.pipe(map(isMedium => (isMedium ? 'over' : 'side')))
  public screenSizeIsLtMedium = false
  searchForm: FormGroup | undefined
  sortReviewValues = ['topReviews', 'latestReviews']
  disableLoadMore = false
  previousFilter = this.sortReviewValues[0]
  lastLookUp: any
  ratingSummary: any
  ratingLookup: any[] = []
  ratingSummaryProcessed: any
  ratingReviewsAll: any[] = []
  ratingReviews: any[] = []
  reviewPage = 1
  reviewDefaultLimit = 2
  ratingViewCount = 3
  ratingViewCountDefault = 3
  lookupLimit = 3
  @ViewChild('searchInput', { static: false }) searchInputElem: ElementRef<any> = {} as ElementRef<
    any
  >
  getAuthorsArray!: IAuthorData[]

  constructor(
    private myContSvc: MyContentService,
    private activatedRoute: ActivatedRoute,
    private contentSvc: WidgetContentService,
    private router: Router,
    private loadService: LoaderService,
    private accessService: AccessControlService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authInitService: AuthInitService,
    // private durationPipe: PipeDurationTransformPipe,
    private valueSvc: ValueService,
    private dataService: LocalDataService,
    private myTocService: MyTocService,
    private logger: LoggerService,
    private configSvc: ConfigurationsService,
  ) {
    this.isAdmin = this.accessService.hasRole(['admin', 'super-admin', 'content-admin', 'editor'])
  }

  ngOnDestroy() {
    if (this.routerSubscription.unsubscribe) {
      this.routerSubscription.unsubscribe()
    }
    if (this.defaultSideNavBarOpenedSubscription) {
      this.defaultSideNavBarOpenedSubscription.unsubscribe()
    }
  }

  ngOnInit() {
    this.pagination = {
      offset: 0,
      limit: 24,
    }
    this.searchForm = new FormGroup({
      sortByControl: new FormControl(this.sortReviewValues[0]),
      searchKey: new FormControl(''),
    })
    this.newDesign = this.accessService.authoringConfig.newDesign
    this.ordinals = this.authInitService.ordinals
    this.allLanguages = this.authInitService.ordinals.subTitles || []
    this.activatedRoute.queryParams.subscribe(params => {
      this.status = params.status || 'published'
      this.setAction()
      this.fetchContent()
    })
    this.searchForm.valueChanges
      .pipe(
        debounceTime(500),
        switchMap(async formValue => {
          if (this.previousFilter !== formValue.sortByControl) {
            this.previousFilter = formValue.sortByControl
            this.ratingReviews = []
            this.sortReviews(formValue.sortByControl)
            this.reviewPage = 1
            this.lastLookUp = null
          }
        }),
        takeUntil(this.unsubscribe)
      ).subscribe()
  }
  ngAfterViewInit(): void {
    this.sortReviews(this.sortReviewValues[0])
    this.getAuthorsArray = this.getAuthors()
  }
  sortReviews(sort: string) {
    this.ratingViewCount = this.ratingViewCountDefault
    if (sort === this.sortReviewValues[0]) {
      // console.log('Fetching rating summary')
      this.fetchRatingSummary()
    } else {
      // console.log('Fetching lookup')
      this.fetchRatingLookup()
    }
  }
  fetchRatingSummary() {
    this.displayLoader = true
    if (this.content && this.content.identifier && this.content.primaryCategory) {
      this.contentSvc.getRatingSummary(this.content.identifier, this.content.primaryCategory).subscribe(
        (res: any) => {
          this.displayLoader = false
          // console.log('Rating summary res ', res)
          if (res && res.result && res.result.response) {
            this.ratingSummary = res.result.response
          }

          // TODO: To be removed
          // this.hardcodeData()

          this.ratingSummaryProcessed = this.processRatingSummary()
        },
        (err: any) => {
          this.displayLoader = false
          this.logger.error('USER RATING FETCH ERROR >', err)
          // TODO: To be removed
          // this.hardcodeData()
          this.ratingSummaryProcessed = this.processRatingSummary()
        }
      )
    }
  }

  fetchRatingLookup() {
    this.displayLoader = true
    if (this.content && this.content.identifier && this.content.primaryCategory) {
      const req = {
        activityId: this.content.identifier,
        activityType: this.content.primaryCategory,
        limit: this.lookupLimit,
        ...((this.lastLookUp && this.lastLookUp.updatedOnUUID) ? { updateOn: (this.lastLookUp && this.lastLookUp.updatedOnUUID) } : null),
      }
      this.contentSvc.getRatingLookup(req).subscribe(
        (res: any) => {
          this.displayLoader = false
          if (res && res.result && res.result.response) {
            this.ratingLookup = _.map(res.result.response, k => _.set(k, 'user_id', `${k.firstName} ${k.lastName}`))
          }

          // TODO: To be removed
          // this.hardcodeData1()
          this.processRatingLookup()
        },
        (err: any) => {
          this.displayLoader = false
          this.logger.error('USER RATING FETCH ERROR >', err)
          // TODO: To be removed
          // this.hardcodeData1()
          this.processRatingLookup()
        }
      )
    }
  }
  processRatingLookup() {
    if (this.ratingLookup && (this.ratingLookup.length < this.lookupLimit)) {
      this.disableLoadMore = true
    } else {
      this.disableLoadMore = false
    }
    // this.lastLookUp = this.ratingLookup.pop()
    this.lastLookUp = this.ratingLookup[this.ratingLookup.length - 1]
    this.ratingReviews = _.uniqBy([...this.ratingReviews, ...this.ratingLookup], 'updatedOnUUID')
    this.ratingReviews.sort((a: any, b: any) => {
      return <any>new Date(b.updatedon) - <any>new Date(a.updatedon)
    })
  }
  processRatingSummary() {
    const breakDownArray: any[] = []
    const ratingSummaryPr = {
      breakDown: breakDownArray,
      latest50reviews: breakDownArray,
      ratingsNumber: breakDownArray,
      total_number_of_ratings: (this.ratingSummary) ? this.ratingSummary.total_number_of_ratings || 0 : 0,
      avgRating: 0,
    }
    const totRatings = (this.ratingSummary) ? this.ratingSummary.sum_of_total_ratings : 0
    ratingSummaryPr.breakDown.push({
      percent: this.countStarsPercentage(_.get(this.ratingSummary, 'totalcount1stars'), totRatings),
      key: 1,
      value: _.get(this.ratingSummary, 'totalcount1stars'),
    })
    ratingSummaryPr.breakDown.push({
      percent: this.countStarsPercentage(_.get(this.ratingSummary, 'totalcount2stars'), totRatings),
      key: 2,
      value: _.get(this.ratingSummary, 'totalcount2stars'),
    })
    ratingSummaryPr.breakDown.push({
      percent: this.countStarsPercentage(_.get(this.ratingSummary, 'totalcount3stars'), totRatings),
      key: 3,
      value: _.get(this.ratingSummary, 'totalcount3stars'),
    })
    ratingSummaryPr.breakDown.push({
      percent: this.countStarsPercentage(_.get(this.ratingSummary, 'totalcount4stars'), totRatings),
      key: 4,
      value: _.get(this.ratingSummary, 'totalcount4stars'),
    })
    ratingSummaryPr.breakDown.push({
      percent: this.countStarsPercentage(_.get(this.ratingSummary, 'totalcount5stars'), totRatings),
      key: 5,
      value: _.get(this.ratingSummary, 'totalcount5stars'),
    })
    ratingSummaryPr.latest50reviews = JSON.parse(_.get(this.ratingSummary, 'latest50Reviews') || '[]')
    // JSON.parse(this.ratingSummary.latest50Reviews || '[]')
    this.ratingReviews = ratingSummaryPr.latest50reviews // this.ratingSummary.latest50Reviews
    this.ratingReviews.sort((a: any, b: any) => {
      return <any>new Date(b.date) - <any>new Date(a.date)
    })
    // ratingSummaryPr.avgRating = parseFloat(((((totRatings / this.ratingSummary.total_number_of_ratings) * 100) * 5) / 100).toFixed(1))
    const meanRating = ratingSummaryPr.breakDown.reduce((val, item) => {
      // console.log('item', item)
      return val + (item.key * item.value)
      // tslint:disable-next-line: align
    }, 0)
    if (this.ratingSummary) {
      ratingSummaryPr.avgRating = parseFloat((meanRating / this.ratingSummary.total_number_of_ratings).toFixed(1))
    }
    if (this.content) {
      this.content.averageRating = ratingSummaryPr.avgRating
    }
    // ratingSummaryPr.avgRating = 5
    // console.log(ratingSummaryPr)
    return ratingSummaryPr
  }
  countStarsPercentage(value: any, total: any) {
    return ((value / total) * 100).toFixed(2)
  }
  changeToDefaultImg($event: any) {
    $event.target.src = '/assets/instances/eagle/app_logos/default.png'
  }
  fetchStatus() {
    switch (this.status) {
      case 'draft':
      case 'rejected':
        return ['Draft']
      case 'inreview':
        return ['InReview', 'Reviewed', 'QualityReview']
      case 'review':
        return ['InReview']
      case 'published':
      case 'expiry':
        return ['Live']
      case 'publish':
        return ['Reviewed']
      case 'processing':
        return ['Processing']
      case 'unpublished':
        return ['Unpublished']
      case 'deleted':
        return ['Deleted']
    }
    return ['Draft']
  }
  resetAndFetchTocStructure() {
    this.tocStructure = {
      assessment: 0,
      course: 0,
      handsOn: 0,
      interactiveVideo: 0,
      learningModule: 0,
      other: 0,
      pdf: 0,
      podcast: 0,
      quiz: 0,
      video: 0,
      webModule: 0,
      webPage: 0,
      youtube: 0,
    }
    if (this.content) {
      this.tocStructure.learningModule = this.content.primaryCategory === NsContent.EPrimaryCategory.MODULE ? -1 : 0
      this.tocStructure.course = this.content.primaryCategory === NsContent.EPrimaryCategory.COURSE ? -1 : 0
      this.tocStructure = this.myTocService.getTocStructure(this.content, this.tocStructure)
      // for (const progType in this.tocStructure) {
      //   if (this.tocStructure[progType] > 0) {
      //     break
      //   }
      // }
    }
  }

  getGlanceData(): IAtGlanceComponentData.IData | null {
    if (this.contentId && this.content && this.tocStructure) {
      return {
        displayName: 'At a glance', // now not using JSON
        contentId: this.contentId,
        contentType: this.content.contentType,
        cost: this.content.exclusiveContent ? 'Paid' : 'Free',
        duration: (this.content.duration || '0').toString(),
        lastUpdate: this.content.lastUpdatedOn,
        counts: this.tocStructure,
        primaryCategory: this.content.primaryCategory,
        showCopyContent: (this.content.primaryCategory === NsContent.EPrimaryCategory.COURSE &&
          this.content.status.toLowerCase() === 'live' && this.configSvc.userProfile
          && this.configSvc.userProfile.userId === this.content.createdBy) ? true : false,
      }
    }
    return null
  }
  parseJson(str: any) {
    try {
      return JSON.parse(str)
    } catch {
      return {}
    }
  }
  getAuthors(): IAuthorData[] {
    if (this.content) {
      const lst = []
      const cc = this.parseJson(_.get(this.content, 'creatorContacts'))
      const curators = _.map(cc, i => {
        return {
          name: i.name,
          authorType: 'Curator',
        }
      })
      const cd = this.parseJson(_.get(this.content, 'creatorDetails'))
      const authors = _.map(cd, i => {
        return {
          name: i.name,
          authorType: 'Author',
        }
      })
      lst.push(...authors)
      lst.push(...curators)
      return lst
    }
    return []
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
  actionClick(event: any) {
    if (event) {
      /* tslint:disable */
      console.log(event)
      /* tslint:enable */
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
          this.resetAndFetchTocStructure()
        })
      }
    } else {
      _.set(this, 'content', routeData)
      this.dataService.initData(routeData)
      this.resetAndFetchTocStructure()
    }
  }

  // search() {
  //   if (this.searchInputElem.nativeElement) {
  //     this.queryFilter = this.searchInputElem.nativeElement.value.trim()
  //   }
  //   this.fetchContent(false, false)
  // }

  deleteContent(request: NSContent.IContentMeta) {
    this.loadService.changeLoad.next(true)
    this.myContSvc
      .deleteContent(request.identifier, request.contentType === 'Knowledge Board')
      .subscribe(
        () => {
          this.loadService.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.SUCCESS,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
          this.cardContent = (this.cardContent || []).filter(
            v => v.identifier !== request.identifier,
          )
        },
        error => {
          if (error.status === 409) {
            this.dialog.open(ErrorParserComponent, {
              width: '80vw',
              height: '90vh',
              data: {
                errorFromBackendData: error.error,
              },
            })
          }
          this.loadService.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.CONTENT_FAIL,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
        },
      )
  }

  restoreContent(request: NSContent.IContentMeta) {
    this.loadService.changeLoad.next(true)
    this.myContSvc.restoreContent(request.identifier).subscribe(
      () => {
        this.loadService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SUCCESS,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        this.cardContent = (this.cardContent || []).filter(v => v.identifier !== request.identifier)
      },
      error => {
        if (error.status === 409) {
          this.dialog.open(ErrorParserComponent, {
            width: '80vw',
            height: '90vh',
            data: {
              errorFromBackendData: error.error,
            },
          })
        }
        this.loadService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.CONTENT_FAIL,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
      },
    )
  }

  createContent(request: NSContent.IContentMeta) {
    this.loadService.changeLoad.next(true)
    this.myContSvc.createInAnotherLanguage(request.identifier, request.locale).subscribe(
      (id: string) => {
        this.loadService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.CONTENT_CREATE_SUCCESS,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        this.router.navigateByUrl(`/author/editor/${id}`)
      },
      error => {
        if (error.status === 409) {
          this.dialog.open(ErrorParserComponent, {
            width: '750px',
            height: '450px',
            data: {
              errorFromBackendData: error.error,
            },
          })
        }
        this.loadService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.CONTENT_FAIL,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
      },
    )
  }

  // clearAllFilters() {
  //   this.finalFilters = []
  //   this.searchInputElem.nativeElement.value = ''
  //   this.queryFilter = ''
  //   this.filterMenuItems.map((val: any) => val.content.map((v: any) => (v.checked = false)))
  //   this.dataSource.data = this.filterMenuItems
  //   this.filters = []
  //   this.fetchContent(false)
  // }

  loadMore() {
    if (!this.disableLoadMore) {
      // tslint:disable-next-line: no-non-null-assertion
      if ((this.searchForm!.get!('sortByControl')!.value === this.sortReviewValues[0])) {
        if ((this.reviewPage * this.ratingViewCount) > this.ratingReviews.length) {
          this.disableLoadMore = true
        }
        this.reviewPage = this.reviewPage + 1
        this.ratingViewCount = this.reviewPage * this.ratingViewCount
      } else {
        this.reviewPage = this.reviewPage + 1
        this.ratingViewCount = this.reviewPage * this.reviewDefaultLimit
        this.fetchRatingLookup()
      }
    }
  }

  confirmAction(content: any) {
    let message = ''
    if (content.type === 'delete') {
      message = 'delete'
    } else if (content.type === 'restoreDeleted') {
      message = 'restoreDeleted'
    } else if (content.type === 'unpublish') {
      message = 'unpublish'
    } else if (content.type === 'moveToDraft' || content.type === 'moveToInReview') {
      if (content.data.mimeType.indexOf('collection') >= 0) {
        message = 'retrieveParent'
      } else {
        message = 'retrieveChild'
      }
    } else {
      this.forwardBackward(content)
      return
    }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '600px',
      height: '200px',
      data: message,
    })

    dialogRef.afterClosed().subscribe((confirm: any) => {
      if (confirm) {
        if (content.type === 'delete') {
          this.deleteContent(content.data)
        } else if (content.type === 'restoreDeleted') {
          this.restoreContent(content.data)
        } else if (
          content.type === 'unpublish' ||
          (content.type === 'moveToDraft' && content.data.status === 'Unpublished')
        ) {
          this.unPublishOrDraft(content.data)
        } else {
          this.forwardBackward(content)
        }
      }
    })
  }

  unPublishOrDraft(request: NSContent.IContentMeta) {
    this.loadService.changeLoad.next(true)
    this.myContSvc.upPublishOrDraft(request.identifier, request.status !== 'Unpublished').subscribe(
      () => {
        this.loadService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SUCCESS,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        this.cardContent = (this.cardContent || []).filter(v => v.identifier !== request.identifier)
      },
      error => {
        if (error.status === 409) {
          this.dialog.open(ErrorParserComponent, {
            width: '750px',
            height: '450px',
            data: {
              errorFromBackendData: error.error,
            },
          })
        }
        this.loadService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.CONTENT_FAIL,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
      },
    )
  }

  forwardBackward(content: any) {
    const dialogRef = this.dialog.open(CommentsDialogComponent, {
      width: '750px',
      height: '450px',
      data: { ...content.data, status: 'Draft' },
    })

    dialogRef.afterClosed().subscribe((commentsForm: FormGroup) => {
      if (commentsForm) {
        this.finalCall(commentsForm, content)
      }
    })
  }

  finalCall(commentsForm: FormGroup, content: any) {
    if (commentsForm) {
      let operationValue: any
      switch (content.type) {
        case 'moveToDraft':
          operationValue = 0
          break
        case 'moveToInReview':
          operationValue = -1
          break
      }
      const body: NSApiRequest.IForwardBackwardActionGeneral = {
        comment: commentsForm.controls.comments.value,
        operation: operationValue,
      }
      this.loadService.changeLoad.next(true)
      this.myContSvc.forwardBackward(body, content.data.identifier, content.data.status).subscribe(
        () => {
          this.loadService.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.SUCCESS,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
          this.cardContent = (this.cardContent || []).filter(
            v => v.identifier !== content.data.identifier,
          )
        },
        error => {
          if (error.status === 409) {
            this.dialog.open(ErrorParserComponent, {
              width: '80vw',
              height: '90vh',
              data: {
                errorFromBackendData: error.error,
              },
            })
          }
          this.loadService.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.CONTENT_FAIL,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
        },
      )
    }
  }

  action(event: { data: NSContent.IContentMeta; type: string }) {
    switch (event.type) {
      case 'create':
        this.createContent(event.data)
        break

      case 'review':
      case 'publish':
      case 'edit':
        this.router.navigateByUrl(`/author/editor/${event.data.identifier}`)
        break
      case 'remove':
        this.cardContent = (this.cardContent || []).filter(
          v => v.identifier !== event.data.identifier,
        )
        break
      case 'moveToInReview':
      case 'moveToDraft':
      case 'delete':
      case 'unpublish':
      case 'restoreDeleted':
        this.confirmAction(event)
        break
      case 'expiryExtend':
        this.actionOnExpiry(event.data)
    }
  }

  actionOnExpiry(content: NSContent.IContentMeta) {
    const dialogRef = this.dialog.open(AuthExpiryDateConfirmComponent, {
      width: '750px',
      height: '300px',
      data: content,
    })

    dialogRef.afterClosed().subscribe((userAction?: { isExtend: boolean; expiryDate?: string }) => {
      if (userAction) {
        this.cardContent = (this.cardContent || []).filter(v => v.identifier !== content.identifier)
      }
    })
  }

  setCurrentLanguage(lang: string) {
    this.searchLanguage = lang
  }
  get getContentImage() {
    if (this.content) {
      return this.accessService.getIcon(this.content)
    } return ICON_TYPE.default
  }
  get getClassName(): string {
    switch (this.content.primaryCategory) {
      case NsContent.EPrimaryCategory.RESOURCE:
        return 'resource'
      case NsContent.EPrimaryCategory.MODULE:
        return 'module'
      case NsContent.EPrimaryCategory.COURSE:
        return 'course'
      case NsContent.EPrimaryCategory.PROGRAM:
        return 'program'
      default:
        return ''
    }
  }
  reply(obj: { root: any, reply: String }) {
    if (obj && obj.root && obj.reply) {
      const reply = {
        activityId: (obj.root.activityId) ? obj.root.activityId : this.content.identifier,
        userId: (obj.root.userId) ? obj.root.userId : (obj.root.user_id) ? obj.root.user_id : '',
        activityType: (obj.root.activityType) ? obj.root.activityType : this.content.primaryCategory,
        rating: obj.root.rating,
        comment: obj.reply,
        commentBy: this.accessService.userFUllName,
        review: obj.root.review,
      } as IReply
      this.myTocService.submitReply(reply)
        .subscribe(() => { })
    }
  }

  getUrl(url: string) {
    if (url && url.length > 0) {
      const tempData = url.split('content')
      if (url.indexOf(`/collection`) > 0) {
        return `${environment.cbpPortal}${environment.contentBucket}${tempData[tempData.length - 1]}`
      }
      return `${environment.cbpPortal}${environment.contentBucket}/content${tempData[tempData.length - 1]}`
    }
    return '/assets/instances/eagle/app_logos/default.png'
  }

  takeActionForCopyContent() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '275px',
      data: 'copyContent',
      autoFocus: false,
    })
    dialogRef.afterClosed().subscribe(async v => {
      if (v) {
        if (v.name) {
          const parentContentData = this.content
          if (parentContentData) {
            this.loadService.changeLoad.next(true)
            const ccIdentifersArray: any = []
            const hierarchy = this.myContSvc.getTreeHierarchy(parentContentData)
            const nodesModify = this.myContSvc.getNodeModifyData(parentContentData)
            let ccIdentifers = await this.copyContent(parentContentData, v.name)
            if (ccIdentifers) {
              ccIdentifersArray.push(ccIdentifers)
              if (parentContentData.children && parentContentData.children.length > 0) {
                for await (const element of parentContentData.children) {
                  if (element.primaryCategory === NsContent.EPrimaryCategory.RESOURCE) {
                    ccIdentifers = await this.copyContent(element)
                    ccIdentifersArray.push(ccIdentifers)
                  }
                  if (element.primaryCategory === NsContent.EPrimaryCategory.MODULE) {
                    ccIdentifersArray.push({
                      oldId: element.identifier,
                      newId: uuidv4(),
                      parentId: parentContentData.identifier,
                      primaryCategory: element.primaryCategory,
                    })
                  }
                  if (element.children && element.children.length > 0) {
                    for await (const subEle of element.children) {
                      if (subEle.primaryCategory === NsContent.EPrimaryCategory.RESOURCE) {
                        ccIdentifers = await this.copyContent(subEle)
                        ccIdentifersArray.push(ccIdentifers)
                      }
                    }
                  }
                }
              }
              this.modifyRequestStructure(hierarchy, ccIdentifersArray, nodesModify)
            } else {
              this.loadService.changeLoad.next(false)
              this.showTosterMessage('fail')
            }
          }
        } else {
          this.showTosterMessage('nameRequried')
        }
      }
    })
  }

  modifyRequestStructure(hierarchy: any, ccIdentifersArray: any, nodesModify: any) {
    Object.keys(hierarchy).forEach(subElement => {
      const tempArrayData = ccIdentifersArray.filter((v: any) => v.oldId === subElement)[0]
      if (hierarchy[subElement].primaryCategory === NsContent.EPrimaryCategory.COURSE ||
        hierarchy[subElement].primaryCategory === NsContent.EPrimaryCategory.MODULE) {
        if (hierarchy[subElement].children && hierarchy[subElement].children.length > 0) {
          hierarchy[subElement].children = []
          const childNewIds = ccIdentifersArray.filter((v: any) => v.parentId === subElement)
          if (childNewIds && childNewIds.length > 0) {
            childNewIds.forEach((newChild: any) => {
              hierarchy[subElement].children.push(newChild.newId)
            })
          }
        }
      }
      hierarchy[tempArrayData.newId] = hierarchy[subElement]
      delete hierarchy[subElement]
    })
    Object.keys(nodesModify).forEach((element: any) => {
      const newIdArray = ccIdentifersArray.filter((v: any) => v.oldId === element)[0]
      nodesModify[newIdArray.newId] = nodesModify[element]
      delete nodesModify[element]
    })
    this.updateContentHierarchy(nodesModify, hierarchy)
  }

  async updateContentHierarchy(nodesModify: any, hierarchyData: any) {
    const requestBody: NSApiRequest.IContentUpdateV3 = {
      request: {
        data: {
          nodesModified: nodesModify,
          hierarchy: hierarchyData,
        },
      },
    }
    const updateContentData = await this.myContSvc.updateHierarchy(requestBody).toPromise().catch(_error => { })
    if (updateContentData && updateContentData.params && updateContentData.params.status === 'successful') {
      this.loadService.changeLoad.next(false)
      this.showTosterMessage('success')
      this.router.navigateByUrl(`/author/editor/${updateContentData.result.content_id}`)
    } else {
      this.loadService.changeLoad.next(false)
      this.showTosterMessage('fail')
    }
  }

  async copyContent(metaData: any, courseName?: any) {
    const requestPayload = {
      request: {
        content: {
          name: (courseName) ? `${courseName}` : `${metaData.name}-COPY-CONTENT`,
          createdFor: metaData.createdFor,
          framework: metaData.framework,
          createdBy: metaData.createdBy,
          organisation: metaData.organisation,
        },
      },
    }
    const responseData = await this.myContSvc.copyContentApi(metaData.identifier, requestPayload).toPromise().catch(_error => { })
    if (responseData && responseData.params && responseData.params.status.toLowerCase() === 'successful') {
      const tempdata = {
        oldId: Object.keys(responseData.result.node_id)[0],
        newId: Object.values(responseData.result.node_id)[0],
        parentId: (metaData.parent) ? metaData.parent : '',
        primaryCategory: (metaData.primaryCategory) ? metaData.primaryCategory : '',
      }
      return tempdata
    }
    return false
  }

  showTosterMessage(type: string) {
    switch (type) {
      case 'nameRequried':
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.COPY_CONTENT_NAME_REQURIED,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        break
      case 'invalidTime':
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.INVALID_TIME,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        break
      case 'success':
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SAVE_SUCCESS,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        break
      case 'fail':
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SAVE_FAIL,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        break
    }
  }
}
