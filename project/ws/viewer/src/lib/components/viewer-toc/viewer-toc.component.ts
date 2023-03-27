import { NestedTreeControl } from '@angular/cdk/tree'
import { Component, EventEmitter, OnDestroy, OnInit, Output, Input } from '@angular/core'
import { MatTreeNestedDataSource } from '@angular/material'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import { ActivatedRoute, NavigationExtras } from '@angular/router'
import {
  ContentProgressService,
  NsContent,
  VIEWER_ROUTE_FROM_MIME,
  WidgetContentService,
} from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import {
  // LoggerService,
  ConfigurationsService,
  UtilityService,
} from '@ws-widget/utils'
import { of, Subscription } from 'rxjs'
import { delay } from 'rxjs/operators'
import { ViewerDataService } from '../../viewer-data.service'
export interface IViewerTocCard {
  identifier: string
  viewerUrl: string
  thumbnailUrl: string
  title: string
  duration: number
  type: string
  mimeType: NsContent.EMimeTypes
  complexity: string
  children: null | IViewerTocCard[]
  primaryCategory: NsContent.EPrimaryCategory
  collectionId: string | null
  collectionType: string,
  batchId: string | number,
  viewMode: string,
}

export type TCollectionCardType = 'content' | 'playlist' | 'goals'

interface ICollectionCard {
  type: TCollectionCardType | null
  id: string
  title: string
  thumbnail: string
  subText1: string
  subText2: string
  duration: number
  redirectUrl: string | null
}

@Component({
  selector: 'viewer-viewer-toc',
  templateUrl: './viewer-toc.component.html',
  styleUrls: ['./viewer-toc.component.scss'],
})
export class ViewerTocComponent implements OnInit, OnDestroy {
  @Output() hidenav = new EventEmitter<boolean>()
  @Input() forPreview = false

  constructor(
    private activatedRoute: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    // private logger: LoggerService,
    private contentSvc: WidgetContentService,
    private utilitySvc: UtilityService,
    private viewerDataSvc: ViewerDataService,
    private configSvc: ConfigurationsService,
    private contentProgressSvc: ContentProgressService,
  ) {
    this.nestedTreeControl = new NestedTreeControl<IViewerTocCard>(this._getChildren)
    this.nestedDataSource = new MatTreeNestedDataSource()
  }
  resourceId: string | null = null
  collection: IViewerTocCard | null = null
  collectionType = 'course'
  collectionId: string | null = ''
  batchId: any
  viewMode = 'START'
  queue: IViewerTocCard[] = []
  tocMode: 'FLAT' | 'TREE' = 'FLAT'
  nestedTreeControl: NestedTreeControl<IViewerTocCard>
  nestedDataSource: MatTreeNestedDataSource<IViewerTocCard>
  defaultThumbnail: SafeUrl | null = null
  isFetching = true
  pathSet = new Set()
  contentProgressHash: { [id: string]: number } | null = null
  errorWidgetData: NsWidgetResolver.IRenderConfigWithTypedData<any> = {
    widgetType: 'errorResolver',
    widgetSubType: 'errorResolver',
    widgetData: {
      errorType: '',
    },
  }
  enumContentTypes = NsContent.EDisplayContentTypes
  collectionCard: ICollectionCard | null = null
  isErrorOccurred = false
  private paramSubscription: Subscription | null = null
  private viewerDataServiceSubscription: Subscription | null = null
  hasNestedChild = (_: number, nodeData: IViewerTocCard) =>
    nodeData && nodeData.children && nodeData.children.length
  private _getChildren = (node: IViewerTocCard) => {
    return node && node.children ? node.children : []
  }

  ngOnInit() {
    if (this.configSvc.instanceConfig) {
      this.defaultThumbnail = this.domSanitizer.bypassSecurityTrustResourceUrl(
        this.configSvc.instanceConfig.logos.defaultContent,
      )
    }
    this.paramSubscription = this.activatedRoute.queryParamMap.subscribe(async params => {
      const collectionId = params.get('collectionId')
      const collectionType = params.get('collectionType')
      const primaryCategory = params.get('primaryCategory')
      this.collectionId = collectionId
      this.collectionType = collectionType || 'course'
      this.viewMode = params.get('viewMode') || 'START'
      try {
        this.batchId = params.get('batchId')
      } catch {
        this.batchId = 0
      }
      if (collectionId && collectionType && primaryCategory) {
        if (
          collectionType.toLowerCase() ===
          NsContent.EMiscPlayerSupportedCollectionTypes.PLAYLIST.toLowerCase()
        ) {
          this.collection = await this.getPlaylistContent(collectionId, primaryCategory)
        } else if (
          collectionType.toLowerCase() === NsContent.EPrimaryCategory.MODULE.toLowerCase() ||
          collectionType.toLowerCase() === NsContent.EPrimaryCategory.COURSE.toLowerCase() ||
          collectionType.toLowerCase() === NsContent.EPrimaryCategory.PROGRAM.toLowerCase()
        ) {
          this.collection = await this.getCollection(collectionId, primaryCategory)
        } else {
          this.isErrorOccurred = true
        }
        if (this.collection) {
          this.queue = this.utilitySvc.getLeafNodes(this.collection, [])
        }
      }
      if (this.resourceId) {
        this.processCurrentResourceChange()
      }
    })
    this.viewerDataServiceSubscription = this.viewerDataSvc.changedSubject.subscribe(_data => {
      if (this.resourceId !== this.viewerDataSvc.resourceId) {
        this.resourceId = this.viewerDataSvc.resourceId
        this.processCurrentResourceChange()
      }
    })
  }

  private getContentProgressHash() {
    this.contentProgressSvc.getProgressHash().subscribe(progressHash => {
      this.contentProgressHash = progressHash
    })
  }

  ngOnDestroy() {
    if (this.paramSubscription) {
      this.paramSubscription.unsubscribe()
    }
    if (this.viewerDataServiceSubscription) {
      this.viewerDataServiceSubscription.unsubscribe()
    }
  }
  changeTocMode() {
    if (this.tocMode === 'FLAT') {
      this.tocMode = 'TREE'
      // this.processCollectionForTree()
    } else {
      this.tocMode = 'FLAT'
    }
  }

  private processCurrentResourceChange() {
    if (this.collection && this.resourceId) {
      const currentIndex = this.queue.findIndex(c => c.identifier === this.resourceId)
      const next =
        currentIndex + 1 < this.queue.length ? this.queue[currentIndex + 1] : null
      const prev = currentIndex - 1 >= 0 ? this.queue[currentIndex - 1] : null
      this.viewerDataSvc.updateNextPrevResource(Boolean(this.collection), prev, next)
      this.processCollectionForTree()
      this.expandThePath()
      if (next && next.viewerUrl === '0') { // temp
        this.getContentProgressHash()
      }
    }
  }
  private async getCollection(
    collectionId: string,
    _collectionType: string,
  ): Promise<IViewerTocCard | null> {
    try {
      // const content: NsContent.IContent = await (this.forPreview
      //   ? this.contentSvc.fetchAuthoringContent(collectionId)
      //   : this.contentSvc.fetchContent(collectionId, 'detail')
      // ).toPromise()
      const content: NsContent.IContent = await (this.contentSvc.fetchContent(collectionId, 'detail')
      ).toPromise()
      this.collectionCard = this.createCollectionCard(content)
      const viewerTocCardContent = this.convertContentToIViewerTocCard(content)
      this.isFetching = false
      return viewerTocCardContent
    } catch (err) {
      switch (err.status) {
        case 403: {
          this.errorWidgetData.widgetData.errorType = 'accessForbidden'
          break
        }
        case 404: {
          this.errorWidgetData.widgetData.errorType = 'notFound'
          break
        }
        case 500: {
          this.errorWidgetData.widgetData.errorType = 'internalServer'
          break
        }
        case 503: {
          this.errorWidgetData.widgetData.errorType = 'serviceUnavailable'
          break
        }
        default: {
          this.errorWidgetData.widgetData.errorType = 'somethingWrong'
          break
        }
      }
      this.isFetching = false
      return null
    }
  }

  private async getPlaylistContent(
    collectionId: string,
    _collectionType: string,
  ): Promise<IViewerTocCard | null> {
    try {
      const playlistFetchResponse = await this.contentSvc
        .fetchCollectionHierarchy('playlist', collectionId, 0, 1000)
        .toPromise()

      const content: NsContent.IContent = playlistFetchResponse.data
      this.collectionCard = this.createCollectionCard(content)
      const viewerTocCardContent = this.convertContentToIViewerTocCard(content)
      this.isFetching = false
      return viewerTocCardContent
    } catch (err) {
      switch (err.status) {
        case 403: {
          this.errorWidgetData.widgetData.errorType = 'accessForbidden'
          break
        }
        case 404: {
          this.errorWidgetData.widgetData.errorType = 'notFound'
          break
        }
        case 500: {
          this.errorWidgetData.widgetData.errorType = 'internalServer'
          break
        }
        case 503: {
          this.errorWidgetData.widgetData.errorType = 'serviceUnavailable'
          break
        }
        default: {
          this.errorWidgetData.widgetData.errorType = 'somethingWrong'
          break
        }
      }
      this.isFetching = false
      return null
    }
  }

  private convertContentToIViewerTocCard(content: NsContent.IContent): IViewerTocCard {
    // return {
    //   identifier: content.identifier,
    //   viewerUrl: `/viewer/${VIEWER_ROUTE_FROM_MIME(content.mimeType)}/${content.identifier}`,
    //   thumbnailUrl: content.appIcon,
    //   title: content.name,
    //   duration: content.duration,
    //   type: content.displayContentType,
    //   complexity: content.complexityLevel,
    //   children: Array.isArray(content.children) && content.children.length ?
    //     content.children.map(child => this.convertContentToIViewerTocCard(child)) : null,
    // }
    return {
      identifier: content.identifier,
      viewerUrl: `${this.forPreview ? '/author' : ''}/viewer/${VIEWER_ROUTE_FROM_MIME(
        content.mimeType,
        // )}/${content.identifier}?primaryCategory=${content.primaryCategory}
        // &collectionId=${this.viewerDataSvc.collectionId}&collectionType=${this.collectionType}
        // &batchId=${this.batchId}&viewMode=${this.viewMode}`,
      )}/${content.identifier}`,
      thumbnailUrl: content.appIcon,
      title: content.name,
      duration: content.duration,
      collectionId: this.collectionId,
      collectionType: this.collectionType,
      batchId: this.batchId,
      viewMode: this.viewMode,
      type: content.primaryCategory,
      mimeType: content.mimeType,
      complexity: content.difficultyLevel || 'Easy',
      primaryCategory: content.primaryCategory,
      children:
        Array.isArray(content.children) && content.children.length
          && content.mimeType !== NsContent.EMimeTypes.QUESTION_SET // this is because of ne api ( questionset structure)
          ? content.children.map(child => this.convertContentToIViewerTocCard(child))
          : null,
    }
  }

  private createCollectionCard(
    collection: NsContent.IContent | NsContent.IContentMinimal,
  ): ICollectionCard {
    // return {
    //   type: this.getCollectionTypeCard(collection.displayContentType),
    //   id: collection.identifier,
    //   title: collection.name,
    //   thumbnail: collection.appIcon,
    //   subText1: collection.displayContentType || collection.contentType,
    //   subText2: collection.complexityLevel,
    //   duration: collection.duration,
    //   redirectUrl: this.getCollectionTypeRedirectUrl(collection.displayContentType, collection.identifier),
    // }
    return {
      type: this.getCollectionTypeCard(collection.primaryCategory),
      id: collection.identifier,
      title: collection.name,
      thumbnail: collection.appIcon,
      subText1: collection.primaryCategory,
      subText2: collection.complexityLevel,
      duration: collection.duration,
      redirectUrl: this.getCollectionTypeRedirectUrl(
        collection.identifier,
        collection.primaryCategory,
      ),
    }
  }

  private getCollectionTypeCard(
    displayContentType?: NsContent.EPrimaryCategory,
  ): TCollectionCardType | null {
    switch (displayContentType) {
      case NsContent.EPrimaryCategory.PROGRAM:
      case NsContent.EPrimaryCategory.COURSE:
      case NsContent.EPrimaryCategory.MODULE:
        return 'content'
      // case NsContent.EPrimaryCategory.GOALS:
      //   return 'goals'
      // case NsContent.EPrimaryCategory.PLAYLIST:
      //   return 'playlist'
      default:
        return null
    }
  }

  private getCollectionTypeRedirectUrl(
    identifier: string,
    displayContentType?: NsContent.EPrimaryCategory,
  ): string | null {
    switch (displayContentType) {
      case NsContent.EPrimaryCategory.PROGRAM:
      case NsContent.EPrimaryCategory.COURSE:
      case NsContent.EPrimaryCategory.MODULE:
        return `${this.forPreview ? '/author' : '/app'}/toc/${identifier}/overview`
      // case NsContent.EPrimaryCategory.GOALS:
      //   return `/app/goals/${identifier}`
      // case NsContent.EPrimaryCategory.PLAYLIST:
      //   return `/app/playlist/${identifier}`
      default:
        return null
    }
  }

  private processCollectionForTree() {
    if (this.collection && this.collection.children) {
      this.nestedDataSource.data = this.collection.children
      this.pathSet = new Set()
      // if (this.resourceId && this.tocMode === 'TREE') {
      if (this.resourceId) {
        of(true)
          .pipe(delay(2000))
          .subscribe(() => {
            this.expandThePath()
          })
      }
    }
  }

  expandThePath() {
    if (this.collection && this.resourceId) {
      const path = this.utilitySvc.getPath(this.collection, this.resourceId)
      this.pathSet = new Set(path.map((u: { identifier: any }) => u.identifier))
      path.forEach((node: IViewerTocCard) => {
        this.nestedTreeControl.expand(node)
      })
    }
  }
  getParams(content: IViewerTocCard): NavigationExtras {
    return {
      queryParams: {
        primaryCategory: content.primaryCategory,
        collectionId: content.collectionId,
        collectionType: content.collectionType,
        batchId: content.batchId,
        viewMode: content.viewMode,
      },
      fragment: '',
    }
  }
  minimizenav() {
    this.hidenav.emit(false)
  }
}
