import { DeleteDialogComponent } from '@ws/author/src/lib/modules/shared/components/delete-dialog/delete-dialog.component'
import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild, ViewEncapsulation } from '@angular/core'
import { MatDialog, MatSnackBar, MatTab, MatTabGroup, MatTabHeader } from '@angular/material'
import { ActivatedRoute, Router } from '@angular/router'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { IActionButton, IActionButtonConfig } from '@ws/author/src/lib/interface/action-button'
import { NSApiRequest } from '@ws/author/src/lib/interface/apiRequest'
// import { IAuthSteps } from '@ws/author/src/lib/interface/auth-stepper'
import { NSContent } from '@ws/author/src/lib/interface/content'
// import { CommentsDialogComponent } from '@ws/author/src/lib/modules/shared/components/comments-dialog/comments-dialog.component'
import { ConfirmDialogComponent } from '@ws/author/src/lib/modules/shared/components/confirm-dialog/confirm-dialog.component'
import { ErrorParserComponent } from '@ws/author/src/lib/modules/shared/components/error-parser/error-parser.component'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { EditorContentService } from '@ws/author/src/lib/routing/modules/editor/services/editor-content.service'
import { EditorService } from '@ws/author/src/lib/routing/modules/editor/services/editor.service'
import { AuthInitService } from '@ws/author/src/lib/services/init.service'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { of, Subscription, forkJoin } from 'rxjs'
import { map, mergeMap, tap } from 'rxjs/operators'
import { IContentNode, IContentTreeNode } from '../../interface/icontent-tree'
import { CollectionResolverService } from './../../services/resolver.service'
import { CollectionStoreService } from './../../services/store.service'
import { NsContent, VIEWER_ROUTE_FROM_MIME } from '@ws-widget/collection'
// import { NotificationService } from '@ws/author/src/lib/services/notification.service'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout'
import { isNumber } from 'lodash'
import { ContentQualityService } from '../../../../../shared/services/content-quality.service'
import { ConfigurationsService } from '../../../../../../../../../../../../../library/ws-widget/utils/src/public-api'
/* tslint:disable */
import _ from 'lodash'
import { NSIQuality } from '../../../../../../../../interface/content-quality'
import { environment } from '../../../../../../../../../../../../../src/environments/environment'
import { PublishContentModalComponent } from '../../../../../shared/components/publish-content-modal/publish-content-modal.component'
import { ViewReviewCommentDialogComponent } from '../../../../../../../../modules/shared/components/view-review-comment-dialog/view-review-comment-dialog.component'
/* tslint:enable */
/**
 * @description
 * Parent component for the Collection editor. All the child component are loaded here. It decides the flow and the logic and
 * controls the api calls that are made for save and send for review and other
 *
 * @export
 * @class CollectionComponent
 * @implements {OnInit}
 */

@Component({
  selector: 'ws-auth-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss'],
  /* tslint:disable */
  encapsulation: ViewEncapsulation.None,
  /* tslint:enable */
  providers: [CollectionStoreService, CollectionResolverService],
})
export class CollectionComponent implements OnInit, AfterViewInit, OnDestroy {
  contents: NSContent.IContentMeta[] = []
  currentParentId!: string
  // stepper: IAuthSteps[] = [
  //   { title: 'Choose Type', disabled: true },
  //   { title: 'Content', disabled: false },
  //   { title: 'Details', disabled: false },
  // ]
  selectedIndex: number | null  // for tabs
  isSubmitPressed = false
  showLanguageBar = false
  actionButton: IActionButtonConfig | null = null
  currentStep = 1
  currentContent!: string
  activeContentSubscription: Subscription | null = null
  routerSubscription: Subscription | null = null
  isChanged = false
  previewIdentifier: string | null = null
  viewMode = 'meta'
  mimeTypeRoute = ''
  currentContents: any
  mediumScreen = false
  sideBarOpened = false
  dataLoaded = false
  mediumSizeBreakpoint$ = this.breakpointObserver
    .observe([Breakpoints.XSmall, Breakpoints.Small])
    .pipe(map((res: BreakpointState) => res.matches))
  mode$ = this.mediumSizeBreakpoint$.pipe(map(isMedium => (isMedium ? 'over' : 'side')))
  leftArrow = true
  @ViewChild('tabGroup', { static: false }) tabGroup!: MatTabGroup
  selectedIdentifier: any
  selectedNodeData!: IContentTreeNode
  showContentSetting = false
  contentRejectComment = ''
  constructor(
    private contentService: EditorContentService,
    private activateRoute: ActivatedRoute,
    private storeService: CollectionStoreService,
    private resolverService: CollectionResolverService,
    private initService: AuthInitService,
    private loaderService: LoaderService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private editorService: EditorService,
    private router: Router,
    // private notificationSvc: NotificationService,
    private accessControlSvc: AccessControlService,
    private breakpointObserver: BreakpointObserver,
    private _qualityService: ContentQualityService,
    private _configurationsService: ConfigurationsService,
  ) {
    this.selectedIndex = 0
    this.contentService.changeActiveCont.subscribe(data => {
      this.currentContent = data
      this.viewMode = 'meta'
      this.currentContents = this.contentService.getUpdatedMeta(data)
      this.checkTabCondition()
      // if (this.contentService.getUpdatedMeta(data).contentType !== 'Resource') {
      //   this.viewMode = 'meta'
      // }
    })
  }

  ngOnInit() {
    if (this.activateRoute.parent && this.activateRoute.parent.parent) {
      this.routerSubscription = this.activateRoute.parent.parent.data.subscribe(newData => {
        if (newData && newData.contents) {
          const data = _.get(_.first(newData.contents), 'content') as NSContent.IContentMeta
          if (data && data.children && data.children.length > 0 && data.primaryCategory
            === NsContent.EPrimaryCategory.PROGRAM) {
            this.getfullContents(data.children).subscribe(async fullContents => {
              // const children = fullContents
              const fullContentArray: NSContent.IContentMeta[] = []
              _.each(fullContents, c => fullContentArray.push(this.contentService.originalMetaWithHierarchyUpdate(c)))
              _.set(_.get(_.first(newData.contents), 'content'), 'children', fullContentArray)
              this.init(newData)
              this.dataLoaded = true
            })
          } else {
            this.init(newData)
            this.dataLoaded = true
          }
        }
      })
    }
    this.contentService.shownLiveEditOnce = false
  }
  init(newData: any) {
    // TODO: proper implementation required
    const contentDataMap = new Map<string, NSContent.IContentMeta>()
    newData.contents.map((v: { content: NSContent.IContentMeta; data: any }) => {
      this.storeService.parentNode.push(v.content.identifier)
      this.resolverService.buildTreeAndMap(
        v.content,
        contentDataMap,
        this.storeService.flatNodeMap,
        this.storeService.uniqueIdMap,
        this.storeService.lexIdMap,
      )
    })
    contentDataMap.forEach(content => this.contentService.setOriginalMeta(content))
    const currentNode = (this.storeService.lexIdMap.get(this.currentContent) as number[])[0]
    this.currentParentId = this.currentContent
    this.storeService.treeStructureChange.next(
      this.storeService.flatNodeMap.get(currentNode) as IContentNode,
    )
    this.storeService.currentParentNode = currentNode
    this.storeService.currentSelectedNode = currentNode
    this.storeService.selectedNodeChange.next(currentNode)
    // NEW CHANGES
    // this.stepper = this.initService.collectionConfig.stepper
    this.showLanguageBar = this.initService.collectionConfig.languageBar
    const actionButton: IActionButton[] = []
    this.initService.collectionConfig.actionButtons.buttons.forEach(action => {
      if (
        this.contentService.checkConditionV2(
          this.contentService.getOriginalMeta(this.currentParentId),
          action.conditions,
        )
      ) {
        actionButton.push({
          title: action.title,
          icon: action.icon,
          event: action.event,
          conditions: action.conditions,
        })
      }
    })
    this.actionButton = {
      enabled: this.initService.collectionConfig.actionButtons.enabled,
      buttons: actionButton,
    }
    this.mediumSizeBreakpoint$.subscribe(isLtMedium => {
      this.mediumScreen = isLtMedium
      this.sideBarOpened = !isLtMedium
    })
    this.setVeiwMetaByType(this.currentContents)
  }
  ngAfterViewInit(): void {
    if (this.tabGroup) {
      this.tabGroup._handleClick = this.myTabChange.bind(this)
    }
  }
  ngOnDestroy() {
  }
  // tabClick(event: MatTabChangeEvent) {
  //   // if (this.currentContent || this.currentParentId) {
  //   //   this.selectedIndex = event.tab.position
  //   // } else {
  //   //   this.selectedIndex = 0
  //   // }
  //   // will do something if required
  // }
  myTabChange(tab: MatTab, tabHeader: MatTabHeader, idx: number) {
    let result = false
    // here I added all checks/conditions ; if everything is Ok result is changed to true
    // ==> this way the tab change is allowed.

    if (tab && tabHeader && idx >= 1 && (this.currentContent || this.currentParentId)) {
      result = true
      this.selectedIndex = idx
    } else if (idx === 0) {
      this.selectedIndex = idx
      result = true
    }
    return result
  }
  sidenavClose() {
    setTimeout(() => (this.leftArrow = true), 500)
  }

  save(nextAction?: string) {
    _.forOwn(this.contentService.upDatedContent, (v, k) => {
      if (k === this.contentService.currentContent) {
      } else if (Object.keys(v).length) {
        _.unset(_.get(this.contentService, 'upDatedContent'), k)
      }
    })
    const updatedContent = this.contentService.upDatedContent || {}
    Object.keys(updatedContent).forEach(ele => {
      if (Object.values(updatedContent[ele]).length === 0) {
        delete updatedContent[ele]
      }
    })
    if (
      (Object.keys(updatedContent).length &&
        (Object.values(updatedContent).length && JSON.stringify(Object.values(updatedContent)[0]) !== '{}')) ||
      Object.keys(this.storeService.changedHierarchy).length
    ) {
      this.isChanged = true
      this.loaderService.changeLoad.next(true)
      if (this.checkForEmptyData) {
        this.triggerSave().subscribe(
          () => {
            if (nextAction) {
              this.action(nextAction)
            }
            const currentResourse = this.contentService.getOriginalMeta(this.contentService.currentContent)
            if (currentResourse.mimeType === 'application/survey') {
              this.tagSurveyLink(currentResourse)
            }
            this.loaderService.changeLoad.next(false)
            this.showToasterMessage('success')
          },
          (error: any) => {
            if (error.status === 409) {
              const errorMap = new Map<string, NSContent.IContentMeta>()
              Object.keys(this.contentService.originalContent).forEach(v =>
                errorMap.set(v, this.contentService.originalContent[v]),
              )
              const dialog = this.dialog.open(ErrorParserComponent, {
                width: '80vw',
                height: '90vh',
                data: {
                  errorFromBackendData: error.error,
                  dataMapping: errorMap,
                },
              })
              dialog.afterClosed().subscribe(v => {
                if (v) {
                  if (typeof v === 'string') {
                    this.storeService.selectedNodeChange.next(
                      (this.storeService.lexIdMap.get(v) as number[])[0],
                    )
                    this.contentService.changeActiveCont.next(v)
                  } else {
                    this.storeService.selectedNodeChange.next(v)
                    this.contentService.changeActiveCont.next(
                      this.storeService.uniqueIdMap.get(v) as string,
                    )
                  }
                }
              })
            }
            this.loaderService.changeLoad.next(false)
            this.showToasterMessage('fail')
          },
        )
      } else {
        this.loaderService.changeLoad.next(false)
        if (nextAction) {
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.UP_TO_DATE,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
          this.action(nextAction)
        } else {
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.UP_TO_DATE,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
        }
      }
    } else {
      if (nextAction) {
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.UP_TO_DATE,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        this.action(nextAction)
      } else {
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.UP_TO_DATE,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
      }
    }
  }

  get validationCheck(): boolean {
    const currentNodeId = this.storeService.lexIdMap.get(this.currentParentId) as number[]
    const returnValue = this.storeService.validationCheck(currentNodeId[0])
    if (returnValue) {
      const dialog = this.dialog.open(ErrorParserComponent, {
        width: '80vw',
        height: '90vh',
        data: {
          processErrorData: returnValue,
        },
      })
      dialog.afterClosed().subscribe(v => {
        if (v) {
          if (typeof v === 'string') {
            this.storeService.selectedNodeChange.next(
              (this.storeService.lexIdMap.get(v) as number[])[0],
            )
            this.contentService.changeActiveCont.next(v)
          } else {
            this.storeService.selectedNodeChange.next(v)
            this.contentService.changeActiveCont.next(
              this.storeService.uniqueIdMap.get(v) as string,
            )
          }
        }
      })
      return false
    }
    return true
  }

  takeAction(contentAction: string) {
    this.isSubmitPressed = true
    if (this.validationCheck && this._configurationsService.userProfile) {
      /** final call */
      const reqObj = {
        resourceId: this.currentContent,
        resourceType: 'content',
        // userId: this._configurationsService.userProfile.userId,
        getLatestRecordEnabled: true,
      }
      let minPassPercentage = 20
      this._qualityService.fetchresult(reqObj).subscribe((result: any) => {
        const currentContentData = this.contentService.originalContent[this.currentContent]
        if (result && result.result && result.result.resources) {
          const rse = result.result.resources || []
          if (rse.length === 1 && (
            this.accessControlSvc.hasRole(['content_reviewer'])
            || this.accessControlSvc.hasRole(['content_publisher'])
            || rse[0].versionKey === currentContentData.versionKey
          )
          ) {
            let qualityScore: NSIQuality.IQualityResponse
            qualityScore = rse[0]
            if (qualityScore) {
              if (qualityScore) {
                const score = qualityScore.finalWeightedScore || 0
                if (this.initService.authAdditionalConfig.contentQuality) {
                  minPassPercentage = this.initService.authAdditionalConfig.contentQuality.passPercentage
                }
                if (contentAction === 'rejectContent') {
                  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                    width: '500px',
                    height: '275px',
                    data: contentAction,
                  })
                  dialogRef.afterClosed().subscribe(async confirmDialogRes => {
                    if (confirmDialogRes && confirmDialogRes.action) {
                      this.contentRejectComment = confirmDialogRes.comment
                      this.finalCall(contentAction)
                    }
                  })
                } else if (score >= minPassPercentage && qualityScore.qualifiedMinCriteria) {
                  /** final call */
                  if (contentAction === 'acceptConent') {
                    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                      width: '500px',
                      height: '170px',
                      data: contentAction,
                    })
                    dialogRef.afterClosed().subscribe(async confirmDialogRes => {
                      if (confirmDialogRes) {
                        this.finalCall(contentAction)
                      }
                    })
                  } else if (contentAction === 'publishConent') {
                    this.finalCall(contentAction)
                  }
                  /** final call */
                } else {
                  this.snackBar.open(`To proceed further minimum quality score must be
                  ${minPassPercentage}% or greater, and need to qualify in all the sections`)
                }
              } else {
                this.snackBar.open(`To proceed further minimum quality score must be
                ${minPassPercentage}% or greater, and need to qualify in all the sections`)
              }
            } else {
              this.snackBar.open(`To proceed further minimum quality score must be
               ${minPassPercentage}% or greater, and need to qualify in all the sections`)
            }
          } else {
            this.snackBar.open(`To proceed further minimum quality score is required, and need to qualify in all the sections`)
          }
        }
      })
    }
  }

  sendModuleToReviewOrPublish(moduleList: any, updatedMeta: any) {
    let flag = 0
    moduleList.forEach(async (element: any) => {
      await this.editorService.sendToReview(element.identifier, element.parentStatus).subscribe(() => {
        flag += 1
        if (moduleList.length === flag) {
          this.finalSaveAndRedirect(updatedMeta)
        }
      })
    })
  }

  async finalCall(contentActionTaken: string) {
    let flag = 0
    const updatedMeta = this.contentService.getUpdatedMeta(this.currentParentId)
    const originalData = this.contentService.getOriginalMeta(this.contentService.parentContent)
    if (contentActionTaken === 'acceptConent' || contentActionTaken === 'publishConent') {
      if (originalData && originalData.children && originalData.children.length > 0) {
        const childListData = await this.getChildListData(originalData, updatedMeta)
        if (originalData.reviewStatus === 'InReview' && originalData.status === 'Review') {
          this.reviewerApproved(originalData, childListData)
        } else if (originalData.reviewStatus === 'Reviewed' && originalData.status === 'Review') {
          this.contentPublish(originalData, childListData)
        } else if (childListData.length > 0) {
          this.loaderService.changeLoad.next(true)
          for await (const element of childListData) {
            if ((element.status === 'Live' || element.status === 'Review') && updatedMeta.status === 'Draft') {
              flag += 1
            } else if ((element.status === 'Live') && updatedMeta.status === 'Review') {
              flag += 1
            } else {
              const requestPayload = {
                request: {
                  content: {
                    reviewStatus: 'InReview',
                    versionKey: element.versionKey,
                  },
                },
              }
              const questionSetReq = {
                request: {
                  questionset: {
                    reviewStatus: 'InReview',
                    versionKey: element.versionKey,
                  },
                },
              }
              const assessmentPayload = {
                request: {
                  question: {},
                },
              }
              const reviewRes = (element.primaryCategory === NsContent.EPrimaryCategory.RESOURCE) ?
                await this.editorService.sendToReview(element.identifier, updatedMeta.status).toPromise().catch(_error => { }) :
                (element.primaryCategory === NsContent.EPrimaryCategory.ASSESSMENT
                  || element.primaryCategory === NsContent.EPrimaryCategory.FINALASSESSMENT) ?
                  await this.editorService.sendAssessmentToReview(assessmentPayload, element.identifier).toPromise().catch(_error => { })
                  : ''
              if (reviewRes && reviewRes.params && reviewRes.params.status === 'successful') {
                const updateContentRes = (element.primaryCategory === NsContent.EPrimaryCategory.RESOURCE) ?
                  await this.editorService.updateContentWithFewFields(requestPayload, element.identifier).toPromise().catch(_error => { }) :
                  (element.primaryCategory === NsContent.EPrimaryCategory.ASSESSMENT
                    || element.primaryCategory === NsContent.EPrimaryCategory.FINALASSESSMENT) ?
                    await this.editorService.updateAssessmentContent(questionSetReq, element.identifier).toPromise().catch(_error => { })
                    : ''
                if (updateContentRes && updateContentRes.params && updateContentRes.params.status === 'successful') {
                  flag += 1
                } else {
                  flag -= 1
                }
              } else {
                flag -= 1
              }
            }
          }
          if (childListData.length === flag) {
            const tempRequest: NSApiRequest.IContentUpdateV3 = {
              request: {
                data: {
                  nodesModified: this.contentService.getNodeModifyData(),
                  hierarchy: this.storeService.getTreeHierarchy(),
                },
              },
            }
            if (updatedMeta.status === 'Draft') {
              this.editorService.updateContentV4(tempRequest).subscribe(() => {
                this.finalSaveAndRedirect(updatedMeta)
              })
            } else {
              this.finalSaveAndRedirect(updatedMeta)
            }
          } else {
            this.loaderService.changeLoad.next(false)
          }
        }
      }
    } else {
      this.changeStatusToDraft((this.contentRejectComment) ? this.contentRejectComment : 'Content Rejected')
    }
  }

  getChildListData(metaData: NSContent.IContentMeta, parentData: NSContent.IContentMeta) {
    const listData = []
    for (const element of metaData.children) {
      if (element.primaryCategory === NsContent.EPrimaryCategory.MODULE) {
        if (element.children.length > 0) {
          element.children.forEach((subElement: any) => {
            const tempChildData = {
              identifier: subElement.identifier,
              status: subElement.status,
              parentStatus: parentData.status,
              versionKey: subElement.versionKey,
              reviewerStatus: subElement.reviewStatus,
              primaryCategory: subElement.primaryCategory,
            }
            listData.push(tempChildData)
          })
        }
      } else {
        const tempData = {
          identifier: element.identifier,
          status: element.status,
          parentStatus: parentData.status,
          versionKey: element.versionKey,
          reviewerStatus: element.reviewStatus,
          primaryCategory: element.primaryCategory,
        }
        listData.push(tempData)
      }
    }
    const checkData = listData.filter((v: any) => v.primaryCategory === NsContent.EPrimaryCategory.COURSE
      && v.status.toLowerCase() === 'draft')
    if (checkData.length > 0) {
      this.showToasterMessage('courseDraft')
      return []
    }
    return listData
  }

  async contentPublish(metaData: NSContent.IContentMeta, childListData: any) {
    if (metaData.primaryCategory === NsContent.EPrimaryCategory.COURSE) {
      const dialogRef = this.dialog.open(PublishContentModalComponent, {
        width: '500px',
        height: '500px',
        data: metaData.identifier,
        autoFocus: false,
      })
      dialogRef.afterClosed().subscribe(async confirmDialogRes => {
        const assessmentPayload = {
          request: {
            questionset: {},
          },
        }
        if (confirmDialogRes === 'sendChildToPublish') {
          const updateReviewStatus = await this.publisherApproved(metaData, childListData)
          if (updateReviewStatus) {
            this.loaderService.changeLoad.next(true)
            let flag = 0
            if (childListData && childListData.length > 0) {
              for await (const element of childListData) {
                if (element.status === 'Live' && element.parentStatus === 'Review') {
                  flag += 1
                } else if (element.reviewerStatus === 'Reviewed' && element.status === 'Review') {
                  const publishRes = (element.primaryCategory === NsContent.EPrimaryCategory.RESOURCE) ?
                    await this.editorService.publishContent(element.identifier).toPromise().catch(_error => { }) :
                    (element.primaryCategory === NsContent.EPrimaryCategory.ASSESSMENT
                      || element.primaryCategory === NsContent.EPrimaryCategory.FINALASSESSMENT) ?
                      await this.editorService.publishAssessmentApi(assessmentPayload, element.identifier).toPromise().catch(_error => { })
                      : ''
                  if (publishRes && publishRes.params && publishRes.params.status === 'successful') {
                    flag += 1
                  } else {
                    flag -= 1
                  }
                }
              }
              if (flag === childListData.length) {
                this.loaderService.changeLoad.next(false)
                this.showToasterMessage('success')
              } else {
                this.loaderService.changeLoad.next(false)
                this.showToasterMessage('fail')
              }
            }
          }
        } else if (confirmDialogRes === 'sendContentToPublish') {
          const requestPayload = {
            request: {
              content: {
                reviewStatus: 'SentToPublish',
                versionKey: 0,
              },
            },
          }
          requestPayload.request.content.versionKey = metaData.versionKey
          const parentMetaRes =
            await this.editorService.updateContentForReviwer(requestPayload, metaData.identifier).toPromise().catch(_error => { })
          if (parentMetaRes && parentMetaRes.params && parentMetaRes.params.status === 'successful') {
            this.sendParentToPublish(metaData)
          }
        }
      })
    } else if (metaData.primaryCategory === NsContent.EPrimaryCategory.PROGRAM) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '500px',
        height: '170px',
        data: 'acceptConent',
      })
      dialogRef.afterClosed().subscribe(async confirmDialogRes => {
        if (confirmDialogRes) {
          this.sendParentToPublish(metaData)
        }
      })
    }
  }

  async sendParentToPublish(metaData: NSContent.IContentMeta) {
    const publishParentRes = await this.editorService.publishContent(metaData.identifier).toPromise().catch(_error => { })
    if (publishParentRes && publishParentRes.params && publishParentRes.params.status === 'successful') {
      this.loaderService.changeLoad.next(false)
      this.showToasterMessage('successPublish')
      await this.sendEmailNotification('publishCompleted')
      this.router.navigate(['author', 'cbp'])
    } else {
      this.loaderService.changeLoad.next(false)
      this.showToasterMessage('fail')
    }
  }

  async reviewerApproved(metaData: NSContent.IContentMeta, childListData: any) {
    this.loaderService.changeLoad.next(true)
    let flag = 0
    if (childListData && childListData.length > 0) {
      const requestPayload = {
        request: {
          content: {
            reviewStatus: 'Reviewed',
            versionKey: 0,
          },
        },
      }
      const questionSetReq = {
        request: {
          questionset: {
            reviewStatus: 'Reviewed',
            versionKey: 0,
          },
        },
      }
      for await (const element of childListData) {
        requestPayload.request.content.versionKey = element.versionKey
        questionSetReq.request.questionset.versionKey = element.versionKey
        if (element.status === 'Live' && element.parentStatus === 'Review') {
          flag += 1
        } else if (element.reviewerStatus === 'InReview' && element.status === 'Review') {
          const updateRes = (element.primaryCategory === NsContent.EPrimaryCategory.RESOURCE) ?
            await this.editorService.updateContentForReviwer(requestPayload, element.identifier).toPromise().catch(_error => { }) :
            (element.primaryCategory === NsContent.EPrimaryCategory.ASSESSMENT
              || element.primaryCategory === NsContent.EPrimaryCategory.FINALASSESSMENT) ?
              await this.editorService.updateAssessmentContent(questionSetReq, element.identifier).toPromise().catch(_error => { }) : ''
          if (updateRes && updateRes.params && updateRes.params.status === 'successful') {
            flag += 1
          } else {
            flag -= 1
          }
        } else if (element.reviewerStatus === 'Reviewed' && element.status === 'Review') {
          flag += 1
        }
      }
      if (flag === childListData.length) {
        requestPayload.request.content.versionKey = metaData.versionKey
        const tempRequest: NSApiRequest.IContentUpdateV3 = {
          request: {
            data: {
              nodesModified: {},
              hierarchy: this.storeService.getTreeHierarchy(),
            },
          },
        }
        const updateHierarchyRes = await this.editorService.updateHierarchyForReviwer(tempRequest).toPromise().catch(_error => { })
        if (updateHierarchyRes && updateHierarchyRes.params && updateHierarchyRes.params.status === 'successful') {
          const parentMetaRes =
            await this.editorService.updateContentForReviwer(requestPayload, metaData.identifier).toPromise().catch(_error => { })
          if (parentMetaRes && parentMetaRes.params && parentMetaRes.params.status === 'successful') {
            this.loaderService.changeLoad.next(false)
            this.showToasterMessage('success')
            await this.sendEmailNotification('sendForPublish')
            this.router.navigate(['author', 'cbp'])
          } else {
            this.loaderService.changeLoad.next(false)
            this.showToasterMessage('fail')
          }
        } else {
          this.loaderService.changeLoad.next(false)
          this.showToasterMessage('fail')
        }
      } else {
        this.loaderService.changeLoad.next(false)
        this.showToasterMessage('fail')
      }
    }
  }

  async publisherApproved(metaData: NSContent.IContentMeta, childListData: any) {
    this.loaderService.changeLoad.next(true)
    let flag = 0
    if (childListData && childListData.length > 0) {
      const requestPayload = {
        request: {
          content: {
            reviewStatus: 'SentToPublish',
            versionKey: 0,
          },
        },
      }
      const questionSetReq = {
        request: {
          questionset: {
            reviewStatus: 'SentToPublish',
            versionKey: 0,
          },
        },
      }
      for await (const element of childListData) {
        requestPayload.request.content.versionKey = element.versionKey
        questionSetReq.request.questionset.versionKey = element.versionKey
        if (element.status === 'Live' && element.parentStatus === 'Review') {
          flag += 1
        } else if (element.reviewerStatus === 'Reviewed' && element.status === 'Review') {
          const updateRes = (element.primaryCategory === NsContent.EPrimaryCategory.RESOURCE) ?
            await this.editorService.updateContentForReviwer(requestPayload, element.identifier).toPromise().catch(_error => { }) :
            (element.primaryCategory === NsContent.EPrimaryCategory.ASSESSMENT) ?
              await this.editorService.updateAssessmentContent(questionSetReq, element.identifier).toPromise().catch(_error => { }) : ''
          if (updateRes && updateRes.params && updateRes.params.status === 'successful') {
            flag += 1
          } else {
            flag -= 1
          }
        } else if (element.reviewerStatus === 'Reviewed' && element.status === 'Review') {
          flag += 1
        }
      }
      if (flag === childListData.length) {
        requestPayload.request.content.versionKey = metaData.versionKey
        const tempRequest: NSApiRequest.IContentUpdateV3 = {
          request: {
            data: {
              nodesModified: {},
              hierarchy: this.storeService.getTreeHierarchy(),
            },
          },
        }
        const updateHierarchyRes = await this.editorService.updateHierarchyForReviwer(tempRequest).toPromise().catch(_error => { })
        if (updateHierarchyRes && updateHierarchyRes.params && updateHierarchyRes.params.status === 'successful') {
          return true
        }
      }
    }
    return false
  }

  async changeStatusToDraft(comment: string) {
    const originalData = this.contentService.getOriginalMeta(this.contentService.parentContent)
    const updatedMeta = this.contentService.getUpdatedMeta(this.currentParentId)
    const childListData = await this.getChildListData(originalData, updatedMeta)
    let flag = 0
    const updateContentReq: any = {
      request: {
        content: {
          reviewStatus: 'InReview',
          versionKey: 0,
        },
      },
    }
    const questionSetReq: any = {
      request: {
        questionset: {
          reviewStatus: 'InReview',
          versionKey: 0,
        },
      },
    }
    if (originalData.primaryCategory !== NsContent.EPrimaryCategory.PROGRAM && childListData.length > 0) {
      const requestBody: any = {
        request: {
          content: {
            rejectComment: comment,
          },
        },
      }
      for await (const element of childListData) {
        this.loaderService.changeLoad.next(true)
        updateContentReq.request.content.versionKey = element.versionKey
        questionSetReq.request.questionset.versionKey = element.versionKey
        const updateContentRes = (element.primaryCategory === NsContent.EPrimaryCategory.RESOURCE) ?
          await await this.editorService.updateContentForReviwer(updateContentReq, element.identifier).toPromise().catch(_error => { }) :
          (element.primaryCategory === NsContent.EPrimaryCategory.ASSESSMENT
            || element.primaryCategory === NsContent.EPrimaryCategory.FINALASSESSMENT) ?
            await this.editorService.updateAssessmentContent(questionSetReq, element.identifier).toPromise().catch(_error => { })
            : ''
        if (updateContentRes && updateContentRes.params && updateContentRes.params.status === 'successful') {
          const rejectRes: any = await this.editorService.rejectContentApi(requestBody, element.identifier).toPromise().catch(_error => { })
          if (rejectRes && rejectRes.params && rejectRes.params.status === 'successful') {
            flag += 1
          } else {
            flag -= 1
          }
        } else {
          flag -= 1
        }
      }
      if (flag === childListData.length) {
        updateContentReq.request.content.versionKey = originalData.versionKey
        const tempRequest: NSApiRequest.IContentUpdateV3 = {
          request: {
            data: {
              nodesModified: {},
              hierarchy: this.storeService.getTreeHierarchy(),
            },
          },
        }
        const updateHierarchyRes = await this.editorService.updateHierarchyForReviwer(tempRequest).toPromise().catch(_error => { })
        if (updateHierarchyRes && updateHierarchyRes.params && updateHierarchyRes.params.status === 'successful') {
          const parentMetaRes =
            await this.editorService.updateContentForReviwer(updateContentReq, originalData.identifier).toPromise().catch(_error => { })
          if (parentMetaRes && parentMetaRes.params && parentMetaRes.params.status === 'successful') {
            const rejectParentRes: any =
              await this.editorService.rejectContentApi(requestBody, originalData.identifier).toPromise().catch(_error => { })
            if (rejectParentRes && rejectParentRes.params && rejectParentRes.params.status === 'successful') {
              this.loaderService.changeLoad.next(false)
              this.showToasterMessage('success')
              if (originalData.reviewStatus === 'InReview' && originalData.status === 'Review') {
                await this.sendEmailNotification('reviewFailed')
              } else if (originalData.reviewStatus === 'Reviewed' && originalData.status === 'Review') {
                await this.sendEmailNotification('publishFailed')
              }
              this.router.navigate(['author', 'cbp'])
            } else {
              this.loaderService.changeLoad.next(false)
              this.showToasterMessage('fail')
            }
          } else {
            this.loaderService.changeLoad.next(false)
            this.showToasterMessage('fail')
          }
        } else {
          this.loaderService.changeLoad.next(false)
          this.showToasterMessage('fail')
        }
      } else {
        this.loaderService.changeLoad.next(false)
        this.showToasterMessage('fail')
      }
    } else if (originalData.status === 'Review') {
      const requestBody: any = {
        request: {
          content: {
            rejectComment: comment,
          },
        },
      }
      const updateRequestBody: any = {
        request: {
          content: {
            reviewStatus: 'InReview',
            versionKey: originalData.versionKey,
          },
        },
      }
      const updateRes: any =
        await this.editorService.updateContentForReviwer(updateRequestBody, originalData.identifier).toPromise().catch(_error => { })
      if (updateRes && updateRes.params && updateRes.params.status === 'successful') {
        this.editorService.rejectContentApi(requestBody, originalData.identifier).subscribe((parentData: any) => {
          if (parentData && parentData.params && parentData.params.status === 'successful') {
            this.loaderService.changeLoad.next(false)
            this.showToasterMessage('success')
            this.router.navigate(['author', 'cbp'])
          } else {
            this.loaderService.changeLoad.next(false)
            this.showToasterMessage('fail')
          }
        },
          // tslint:disable-next-line: align
          _error => {
            this.loaderService.changeLoad.next(false)
            this.showToasterMessage('fail')
          })
      } else {
        this.loaderService.changeLoad.next(false)
        this.showToasterMessage('fail')
      }
    } else {
      this.showToasterMessage('fail')
    }
  }

  finalSaveAndRedirect(updatedMeta: any) {
    const saveCall = (of({} as any)).pipe(
      mergeMap(() =>
        this.editorService
          // .forwardBackward(
          //   body,
          //   this.currentParentId,
          //   this.contentService.originalContent[this.currentParentId].status,
          // )
          .sendToReview(updatedMeta.identifier, updatedMeta.status)
          .pipe(
            mergeMap(() => {
              // this.notificationSvc
              //   .triggerPushPullNotification(
              //     updatedMeta,
              //     body.comment,
              //     body.operation ? true : false,
              //   )
              // .pipe(
              //   catchError(() => {
              //     return of({} as any)
              //   }),
              // ),
              return of({} as any)
            }
            ),
          ),
      ),
    )
    this.loaderService.changeLoad.next(true)
    saveCall.subscribe(
      async () => {
        const requestPayload = {
          request: {
            content: {
              reviewStatus: 'InReview',
              versionKey: updatedMeta.versionKey,
            },
          },
        }
        const updateConentRes =
          await this.editorService.updateContentWithFewFields(requestPayload, updatedMeta.identifier).toPromise().catch(_error => { })
        if (updateConentRes && updateConentRes.params && updateConentRes.params.status === 'successful') {
          this.loaderService.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: this.getMessage('success'),
            },
            duration: NOTIFICATION_TIME * 1000,
          })
          await this.sendEmailNotification('sendForReview')
          this.contents = this.contents.filter(v => v.identifier !== this.currentParentId)
          if (this.contents.length) {
            this.contentService.changeActiveCont.next(this.contents[0].identifier)
          } else {
            this.router.navigate(['author', 'cbp'])
          }
        } else {
          this.loaderService.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: this.getMessage('failure'),
            },
            duration: NOTIFICATION_TIME * 1000,
          })
        }
      },
      (error: any) => {
        if (error.status === 409) {
          const errorMap = new Map<string, NSContent.IContentMeta>()
          Object.keys(this.contentService.originalContent).forEach(v =>
            errorMap.set(v, this.contentService.originalContent[v]),
          )
          const dialog = this.dialog.open(ErrorParserComponent, {
            width: '80vw',
            height: '90vh',
            data: {
              errorFromBackendData: error.error,
              dataMapping: errorMap,
            },
          })
          dialog.afterClosed().subscribe(v => {
            if (v) {
              if (typeof v === 'string') {
                this.storeService.selectedNodeChange.next(
                  (this.storeService.lexIdMap.get(v) as number[])[0],
                )
                this.contentService.changeActiveCont.next(v)
              } else {
                this.storeService.selectedNodeChange.next(v)
                this.contentService.changeActiveCont.next(
                  this.storeService.uniqueIdMap.get(v) as string,
                )
              }
            }
          })
        }
        this.loaderService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: this.getMessage('failure'),
          },
          duration: NOTIFICATION_TIME * 1000,
        })
      },
    )
  }

  preview(id: string) {
    const updatedContent = this.contentService.upDatedContent || {}
    let isContentUpdated = false
    _.each(updatedContent, i => { if (Object.keys(i).length > 0) { isContentUpdated = true } })

    const saveCall =
      (isContentUpdated || Object.keys(this.storeService.changedHierarchy).length) && this.checkForEmptyData
        ? this.triggerSave()
        : of({} as any)
    this.loaderService.changeLoad.next(true)
    saveCall.subscribe(
      () => {
        this.mimeTypeRoute = VIEWER_ROUTE_FROM_MIME(
          this.contentService.getUpdatedMeta(id).mimeType as any,
        )
        this.loaderService.changeLoad.next(false)
        this.previewIdentifier = id
      },
      error => {
        if (error.status === 409) {
          const errorMap = new Map<string, NSContent.IContentMeta>()
          Object.keys(this.contentService.originalContent).forEach(v =>
            errorMap.set(v, this.contentService.originalContent[v]),
          )
          const dialog = this.dialog.open(ErrorParserComponent, {
            width: '750px',
            height: '450px',
            data: {
              errorFromBackendData: error.error,
              dataMapping: errorMap,
            },
          })
          dialog.afterClosed().subscribe(v => {
            if (v) {
              if (typeof v === 'string') {
                this.storeService.selectedNodeChange.next(
                  (this.storeService.lexIdMap.get(v) as number[])[0],
                )
                this.contentService.changeActiveCont.next(v)
              } else {
                this.storeService.selectedNodeChange.next(v)
                this.contentService.changeActiveCont.next(
                  this.storeService.uniqueIdMap.get(v) as string,
                )
              }
            }
          })
        }
        this.loaderService.changeLoad.next(false)
        this.showToasterMessage('fail')
      },
    )
  }

  closePreview() {
    this.previewIdentifier = null
    this.setVeiwMetaByType(this.contentService.getOriginalMeta(this.contentService.currentContent))
  }

  triggerSave() {
    const nodesModified: any = {}
    let isRootPresent = false
    Object.keys(this.contentService.upDatedContent).forEach(v => {
      if (!isRootPresent) {
        isRootPresent = this.storeService.parentNode.includes(v)
      }
      nodesModified[v] = {
        isNew: false,
        root: this.storeService.parentNode.includes(v),
        metadata: this.contentService.upDatedContent[v],
      }
    })
    if (!isRootPresent) {
      nodesModified[this.currentParentId] = {
        isNew: false,
        root: true,
        metadata: {},
      }
    }
    const requestBodyV2: NSApiRequest.IContentUpdateV3 = {
      request: {
        data: {
          nodesModified: this.contentService.getNodeModifyData(),
          hierarchy: this.storeService.changedHierarchy,
        },
      },
    }
    if (Object.keys(this.contentService.upDatedContent).length > 0 && nodesModified[this.contentService.currentContent]) {
      const requestBody: NSApiRequest.IContentUpdateV2 = {
        request: {
          content: nodesModified[this.contentService.currentContent].metadata,
        },
      }
      requestBody.request.content = this.contentService.cleanProperties(requestBody.request.content)
      requestBody.request.content.versionKey = this.contentService.getOriginalMeta(this.contentService.currentContent)['versionKey']
      if (requestBody.request.content.duration) {
        requestBody.request.content.duration =
          (isNumber(requestBody.request.content.duration)
            ? `${requestBody.request.content.duration}` : requestBody.request.content.duration)
      }
      if (requestBody.request.content.trackContacts && requestBody.request.content.trackContacts.length > 0) {
        requestBody.request.content.reviewer = JSON.stringify(requestBody.request.content.trackContacts)
        requestBody.request.content.reviewerIDs = []
        const tempTrackRecords: string[] = []
        requestBody.request.content.trackContacts.forEach(element => {
          tempTrackRecords.push(element.id)
        })
        requestBody.request.content.reviewerIDs = tempTrackRecords
        delete requestBody.request.content.trackContacts
      }
      if (requestBody.request.content.publisherDetails && requestBody.request.content.publisherDetails.length > 0) {
        requestBody.request.content.publisherIDs = []
        const tempPublisherRecords: string[] = []
        requestBody.request.content.publisherDetails.forEach(element => {
          tempPublisherRecords.push(element.id)
        })
        requestBody.request.content.publisherIDs = tempPublisherRecords
      }
      if (requestBody.request.content.creatorContacts && requestBody.request.content.creatorContacts.length > 0) {
        requestBody.request.content.creatorIDs = []
        const tempCreatorsRecords: string[] = []
        requestBody.request.content.creatorContacts.forEach(element => {
          tempCreatorsRecords.push(element.id)
        })
        requestBody.request.content.creatorIDs = tempCreatorsRecords
      }
      if (requestBody.request.content.catalogPaths && requestBody.request.content.catalogPaths.length > 0) {
        requestBody.request.content.topics = []
        const tempTopicData: string[] = []
        requestBody.request.content.catalogPaths.forEach((element: any) => {
          tempTopicData.push(element.identifier)
        })
        requestBody.request.content.topics = tempTopicData
      }
      return this.editorService.updateContentV3(requestBody, this.contentService.currentContent).pipe(
        tap(() => {
          this.storeService.changedHierarchy = {}
          Object.keys(this.contentService.upDatedContent).forEach(id => {
            this.contentService.resetOriginalMeta(this.contentService.upDatedContent[id], id)
          })
          this.contentService.upDatedContent = {}
        }),
        tap(async () => {
          const tempRequest: NSApiRequest.IContentUpdateV3 = {
            request: {
              data: {
                nodesModified: this.contentService.getNodeModifyData(),
                hierarchy: this.storeService.getTreeHierarchy(),
              },
            },
          }
          await this.editorService.updateContentV4(tempRequest).subscribe(() => {
            this.editorService.readcontentV3(this.contentService.parentContent).subscribe((data: any) => {
              this.contentService.resetOriginalMetaWithHierarchy(data) // TODO
              // tslint:disable-next-line: align
            })
          })
        })
      )
    }

    return this.editorService.updateContentV4(requestBodyV2).pipe(
      tap(() => {
        this.storeService.changedHierarchy = {}
        Object.keys(this.contentService.upDatedContent).forEach(async id => {
          this.contentService.resetOriginalMeta(this.contentService.upDatedContent[id], id)
        })
        this.editorService.readcontentV3(this.contentService.parentContent).subscribe((data: any) => {
          this.contentService.resetOriginalMetaWithHierarchy(data) // TODO
        })
        this.contentService.upDatedContent = {}
      })
    )
  }

  getMessage(type: 'success' | 'failure') {
    if (type === 'success') {
      switch (this.contentService.originalContent[this.currentParentId].status) {
        case 'Draft':
        case 'Live':
          return Notify.SEND_FOR_REVIEW_SUCCESS
        case 'InReview':
          return Notify.REVIEW_SUCCESS
        case 'Reviewed':
        case 'Review':
          return Notify.PUBLISH_SUCCESS
        default:
          return ''
      }
    }
    switch (this.contentService.originalContent[this.currentParentId].status) {
      case 'Draft':
      case 'Live':
        return Notify.SEND_FOR_REVIEW_FAIL
      case 'InReview':
        return Notify.REVIEW_FAIL
      case 'Reviewed':
      case 'Review':
        return Notify.PUBLISH_FAIL
      default:
        return ''
    }
  }

  subAction(event: { type: string; identifier: string; selectedNode: IContentTreeNode }) {
    const currentNode = (this.storeService.lexIdMap.get(event.identifier) as number[])[0]
    this.contentService.changeActiveCont.next(event.identifier)
    switch (event.type) {
      case 'editMeta':
        this.viewMode = 'meta'
        break
      case 'editContent':
        const content = this.contentService.getUpdatedMeta(event.identifier)
        this.selectedIdentifier = event.identifier
        this.setVeiwMetaByType(content)
        break
      case 'preview':
        this.preview(event.identifier)
        break
      case 'addContenToCourse':
        this.storeService.currentSelectedNode = currentNode
        this.storeService.selectedNodeChange.next(currentNode)
        this.viewMode = 'courseChildType'
        break
      case 'addContenToModule':
        this.storeService.currentSelectedNode = currentNode
        this.storeService.selectedNodeChange.next(currentNode)
        this.viewMode = 'addContenToModule'
        break
      case 'addCourseToProgram':
        this.storeService.currentSelectedNode = currentNode
        this.storeService.selectedNodeChange.next(currentNode)
        this.selectedNodeData = event.selectedNode
        this.viewMode = 'programChildSelect'
        this.showContentSetting = false
        break
    }
  }

  setVeiwMetaByType(content: NSContent.IContentMeta) {
    if (['application/pdf', 'application/x-mpegURL', 'application/vnd.ekstep.html-archive', 'audio/mpeg', 'video/mp4'].
      includes(content.mimeType)) {
      this.viewMode = 'upload'
    } else if ((content.mimeType === 'application/html' && !content.isExternal)) {
      this.viewMode = 'upload'
    } else if (['text/x-url', 'video/x-youtube', 'application/survey'].includes(content.mimeType)) {
      this.viewMode = 'curate'
    } else if (content.mimeType === 'application/quiz' || content.mimeType === 'application/json') {
      this.viewMode = 'quiz'
    } else if (content.primaryCategory === NsContent.EPrimaryCategory.COURSE) {
      this.viewMode = 'courseChildType'
    } else if (content.primaryCategory === NsContent.EPrimaryCategory.MODULE) {
      this.viewMode = 'editModuleData'
    } else if (content.primaryCategory === NsContent.EPrimaryCategory.PROGRAM) {
      this.viewMode = 'programChildSelect'
    } else if (content.primaryCategory === NsContent.EPrimaryCategory.ASSESSMENT
      || content.primaryCategory === NsContent.EPrimaryCategory.FINALASSESSMENT) {
      this.viewMode = 'editAssessmentData'
    } else {
      this.viewMode = 'meta'
    }
  }

  action(type: string) {
    switch (type) {
      case 'next':
        // this.viewMode = ''
        if (this.selectedIndex != null) {
          this.selectedIndex += 1
        } else {
          this.selectedIndex = 0
        }
        break
      case 'back':
        // this.viewMode = 'meta'
        if (this.selectedIndex) {
          this.selectedIndex -= 1
        } else {
          this.selectedIndex = 0
        }
        break
      case 'save':
        this.save()
        break

      case 'saveAndNext':
        this.save('next')
        break

      case 'preview':
        this.preview(this.currentContent)
        break

      case 'push':
        if (this.getAction() === 'publish') {
          const dialogRefForPublish = this.dialog.open(ConfirmDialogComponent, {
            width: '70%',
            data: 'publishMessage',
          })
          dialogRefForPublish.afterClosed().subscribe(result => {
            if (result) {
              this.takeAction('push')
            }
          })
        } else {
          this.takeAction('acceptConent')
        }
        break

      case 'delete':
        const dialog = this.dialog.open(DeleteDialogComponent, {
          width: '600px',
          height: 'auto',
          data: this.contentService.getUpdatedMeta(this.currentParentId),
        })
        dialog.afterClosed().subscribe(confirm => {
          if (confirm) {
            this.contents = this.contents.filter(v => v.identifier !== this.currentParentId)
            if (this.contents.length) {
              this.contentService.changeActiveCont.next(this.contents[0].identifier)
            } else {
              this.router.navigateByUrl('/author/cbp/me')
            }
          }
        })
        break

      case 'fullscreen':
      case 'fulls':
        this.fullScreenToggle()
        break

      case 'close':
        this.router.navigateByUrl('/author/cbp/me')
        break

      case 'acceptConent':
        this.takeAction('acceptConent')
        break

      case 'publishConent':
        this.takeAction('publishConent')
        break

      case 'rejectContent':
        this.takeAction('rejectContent')
        break
      case 'showReviewComment':
        this.showReviewComment()
        break
    }
  }

  delete() {
    this.loaderService.changeLoad.next(true)
    this.editorService.deleteContent(this.currentParentId).subscribe(
      () => {
        this.loaderService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SUCCESS,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        this.contents = this.contents.filter(v => v.identifier !== this.currentParentId)
        if (this.contents.length) {
          this.contentService.changeActiveCont.next(this.contents[0].identifier)
        } else {
          this.router.navigateByUrl('/author/cbp')
        }
      },
      error => {
        if (error.status === 409) {
          const errorMap = new Map<string, NSContent.IContentMeta>()
          Object.keys(this.contentService.originalContent).forEach(v =>
            errorMap.set(v, this.contentService.originalContent[v]),
          )
          const dialog = this.dialog.open(ErrorParserComponent, {
            width: '750px',
            height: '450px',
            data: {
              errorFromBackendData: error.error,
              dataMapping: errorMap,
            },
          })
          dialog.afterClosed().subscribe(v => {
            if (v) {
              if (typeof v === 'string') {
                this.storeService.selectedNodeChange.next(
                  (this.storeService.lexIdMap.get(v) as number[])[0],
                )
                this.contentService.changeActiveCont.next(v)
              } else {
                this.storeService.selectedNodeChange.next(v)
                this.contentService.changeActiveCont.next(
                  this.storeService.uniqueIdMap.get(v) as string,
                )
              }
            }
          })
        }
        this.loaderService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.CONTENT_FAIL,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
      },
    )
  }

  fullScreenToggle = () => {
    const doc: any = document
    // const elm: any = doc.getElementById('auth-toc')
    let elm: any = doc.getElementById('auth-toc')
    if (!elm) {
      elm = doc.getElementById('edit-meta')
    }
    if (!elm) {
      elm = doc.getElementById('auth-root')
    }
    if (elm.requestFullscreen) {
      !doc.fullscreenElement ? elm.requestFullscreen() : doc.exitFullscreen()
    } else if (elm.mozRequestFullScreen) {
      !doc.mozFullScreen ? elm.mozRequestFullScreen() : doc.mozCancelFullScreen()
    } else if (elm.msRequestFullscreen) {
      !doc.msFullscreenElement ? elm.msRequestFullscreen() : doc.msExitFullscreen()
    } else if (elm.webkitRequestFullscreen) {
      !doc.webkitIsFullscreen ? elm.webkitRequestFullscreen() : doc.webkitCancelFullscreen()
    }
  }

  getAction(): string {
    switch (this.contentService.originalContent[this.currentParentId].status) {
      case 'Draft':
      case 'Live':
        return 'sendForReview'
      case 'InReview':
        return 'review'
      case 'Reviewed':
        return 'publish'
      default:
        return 'sendForReview'
    }
  }

  canDelete() {
    return (
      this.accessControlSvc.hasRole(['editor', 'admin']) ||
      (['Draft', 'Live'].includes(
        this.contentService.originalContent[this.currentParentId].status,
      ) &&
        this.contentService.originalContent[this.currentParentId].creatorContacts.find(
          v => v.id === this.accessControlSvc.userId,
        ))
    )
  }

  jsonVerify(s: string) { try { JSON.parse(s); return true } catch (e) { return false } }

  get checkForEmptyData(): boolean {
    const updatedContent = this.contentService.upDatedContent || {}
    let nodesModified = {}
    let flag = false
    Object.keys(updatedContent).forEach(ele => {
      nodesModified = this.contentService.cleanProperties(updatedContent[ele])
    })
    if (Object.keys(nodesModified).length > 0) {
      if (Object.keys(nodesModified).length === 1) {
        Object.keys(nodesModified).forEach(subEle => {
          if (subEle === 'versionKey') {
            flag = false
          } else {
            flag = true
          }
        })
      } else {
        flag = true
      }
    }
    return flag
  }

  async sendEmailNotification(actionType: string) {
    const originalData = this.contentService.getOriginalMeta(this.contentService.parentContent)
    const emailReqPayload = {
      contentState: actionType,
      contentLink: `${environment.cbpPortal}author/editor/${originalData.identifier}/collection`,
      contentName: (this._configurationsService.userProfile) ? this._configurationsService.userProfile.userName : '',
      sender: (this._configurationsService.userProfile) ? this._configurationsService.userProfile.email : '',
      recipientEmails: <any>[],
    }
    switch (actionType) {
      case 'sendForReview':
        let reviewerData: any[]
        if (typeof originalData.reviewer === 'string') {
          reviewerData = JSON.parse(originalData.reviewer)
        } else {
          reviewerData = originalData.reviewer
        }
        if (reviewerData && reviewerData.length > 0) {
          reviewerData.forEach((element: any) => {
            if (element.email) {
              emailReqPayload.recipientEmails.push(element.email)
            }
          })
        }
        break
      case 'sendForPublish':
        let publisherData: any[]
        if (typeof originalData.publisherDetails === 'string') {
          publisherData = JSON.parse(originalData.publisherDetails)
        } else {
          publisherData = originalData.publisherDetails
        }
        if (publisherData && publisherData.length > 0) {
          publisherData.forEach((element: any) => {
            if (element.email) {
              emailReqPayload.recipientEmails.push(element.email)
            }
          })
        }
        break
      case 'reviewFailed':
      case 'publishFailed':
      case 'publishCompleted':
        let creatorData: any[]
        if (typeof originalData.creatorContacts === 'string') {
          creatorData = JSON.parse(originalData.creatorContacts)
        } else {
          creatorData = originalData.creatorContacts
        }
        if (creatorData && creatorData.length > 0) {
          creatorData.forEach((element: any) => {
            if (element.email) {
              emailReqPayload.recipientEmails.push(element.email)
            }
          })
        }
        break
    }
    if (emailReqPayload.recipientEmails && emailReqPayload.recipientEmails.length > 0) {
      await this.editorService.sendEmailNotificationAPI(emailReqPayload).toPromise().catch(_error => { })
    }
  }
  getfullContents(contents: NSContent.IContentMeta[]) {
    return forkJoin(
      contents.map(c => {
        return this.editorService.readcontentV3(c.identifier).pipe(
          map((response: any) => {
            return response
          }))
      })
    )
  }

  checkTabCondition() {
    if (this.contentService.parentContent && this.contentService.currentContent) {
      const parentData = this.contentService.getOriginalMeta(this.contentService.parentContent)
      const currentData = this.contentService.getOriginalMeta(this.contentService.currentContent)
      if (parentData.primaryCategory === NsContent.EPrimaryCategory.PROGRAM &&
        currentData.primaryCategory === NsContent.EPrimaryCategory.COURSE) {
        this.showContentSetting = true
      } else {
        this.showContentSetting = false
      }
    }
  }

  async tagSurveyLink(metaData: any) {
    const parentData = this.contentService.getOriginalMeta(this.contentService.parentContent)
    const surveyId = _.last(metaData.artifactUrl.split(`${environment.karmYogi}surveys/`))
    if (metaData) {
      const requestBody = {
        courseName: parentData.name,
        courseId: parentData.identifier,
        formId: surveyId,
      }
      const tagSurveyRes = await this.editorService.surveyLinkTag(requestBody).toPromise().catch(_error => { })
      if (tagSurveyRes && tagSurveyRes.statusInfo && tagSurveyRes.statusInfo.statusMessage.toLowerCase() === 'success') {
        this.showToasterMessage('surveyTagSuccess')
      } else {
        this.showToasterMessage('surveyTagFail')
      }
    }
  }

  showReviewComment() {
    this.dialog.open(ViewReviewCommentDialogComponent, {
      width: '500px',
      height: '185px',
      data: this.contentService.getOriginalMeta(this.currentContent),
      autoFocus: false,
    })
  }

  showToasterMessage(type: string) {
    switch (type) {
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
      case 'successPublish':
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.PUBLISH_SUCCESS_LATE,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        break
      case 'courseDraft':
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.COURSE_DRAFT_ERROR,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        break

      case 'surveyTagFail':
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SURVEY_LINK_TAG_FAIL,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        break

      case 'surveyTagSuccess':
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SURVEY_LINK_TAG_SUCCESS,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        break
    }
  }
}
