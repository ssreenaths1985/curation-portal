import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Data } from '@angular/router'
import { Subscription } from 'rxjs'
import { DomSanitizer, SafeStyle } from '@angular/platform-browser'
import { NsContent, viewerRouteGenerator, ROOT_WIDGET_CONFIG } from '@ws-widget/collection'
import { NsAppToc } from '../../models/app-toc.model'
import { AppTocService } from '../../services/app-toc.service'
import { ConfigurationsService } from '@ws-widget/utils'
import { NsWidgetResolver } from '@ws-widget/resolver'
// tslint:disable
import _ from 'lodash'
// tslint:enable

@Component({
  selector: 'ws-app-app-toc-contents',
  templateUrl: './app-toc-contents.component.html',
  styleUrls: ['./app-toc-contents.component.scss'],
})
export class AppTocContentsComponent implements OnInit, OnDestroy {
  content: NsContent.IContent | null = null
  forPreview = false
  isPlayable = false
  contentPlayWidgetConfig: NsWidgetResolver.IRenderConfigWithTypedData<any> | null = null
  defaultThumbnail = ''
  errorCode: NsAppToc.EWsTocErrorCode | null = null
  private routeSubscription: Subscription | null = null
  private routeQuerySubscription: Subscription | null = null
  contentParents: NsContent.IContentMinimal[] = []
  expandAll = false
  expandPartOf = false
  contextId!: string
  contextPath!: string

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private tocSvc: AppTocService,
    private configSvc: ConfigurationsService,
  ) { }

  ngOnInit() {
    this.forPreview = window.location.href.includes('/author/')
    this.routeQuerySubscription = this.route.queryParamMap.subscribe(qParamsMap => {
      const contextId = qParamsMap.get('contextId')
      const contextPath = qParamsMap.get('contextPath')
      if (contextId && contextPath) {
        this.contextId = contextId
        this.contextPath = contextPath
      }
    })
    if (this.route && this.route.parent) {
      this.routeSubscription = this.route.parent.data.subscribe((data: Data) => {
        this.initData(data)
      })
    }
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
      this.defaultThumbnail = instanceConfig.logos.defaultContent
    }
  }
  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe()
    }
    if (this.routeQuerySubscription) {
      this.routeQuerySubscription.unsubscribe()
    }
  }

  private initData(data: Data) {
    const initData = this.tocSvc.initData(data)
    // if (initData.content) {
    //   if (_.get(initData.content, 'creatorDetails')) {
    //     _.set(initData.content, 'creatorDetails', JSON.parse(_.get(initData.content, 'creatorDetails')))
    //   }
    //   if (_.get(initData.content, 'publisherDetails')) {
    //     _.set(initData.content, 'publisherDetails', JSON.parse(_.get(initData.content, 'publisherDetails')))
    //   }
    //   if (_.get(initData.content, 'revie wer')) {
    //     _.set(initData.content, 'reviewer', JSON.parse(_.get(initData.content, 'reviewer')))
    //   }
    //   _.each(initData.content.children, ch => {
    //     if (_.get(ch, 'creatorDetails')) {
    //       console.log("====>", _.get(ch, 'creatorDetails'))
    //       _.set(ch, 'creatorDetails', JSON.parse(_.get(ch, 'creatorDetails')))
    //     }
    //     if (_.get(ch, 'publisherDetails')) {
    //       _.set(ch, 'publisherDetails', JSON.parse(_.get(ch, 'publisherDetails')))
    //     }
    //     if (_.get(ch, 'reviewer')) {
    //       _.set(ch, 'reviewer', JSON.parse(_.get(ch, 'reviewer')))
    //     }
    //   })
    // }
    this.content = initData.content
    this.errorCode = initData.errorCode
    if (this.content) {
      if (!this.contextId || !this.contextPath) {
        this.contextId = this.content.identifier
        this.contextPath = this.content.primaryCategory
      }
      // this.fetchContentParents(this.content.identifier)
      this.populateContentPlayWidget(this.content)
    }
  }
  // private fetchContentParents(contentId: string) {
  //   this.tocSvc.fetchContentParents(contentId).subscribe(contents => {
  //     this.contentParents = contents || []
  //   })
  // }
  private populateContentPlayWidget(content: NsContent.IContent) {
    if (
      content.primaryCategory === NsContent.EPrimaryCategory.RESOURCE
    ) {
      switch (content.mimeType) {
        case NsContent.EMimeTypes.M3U8:
        case NsContent.EMimeTypes.MP4:
          this.assignWidgetData(ROOT_WIDGET_CONFIG.player.video, {
            url: content.artifactUrl,
            autoplay: true,
            posterImage: content.appIcon,
          })
          break
        case NsContent.EMimeTypes.MP3:
        case NsContent.EMimeTypes.M4A:
          this.assignWidgetData(ROOT_WIDGET_CONFIG.player.audio, {
            url: content.artifactUrl,
            autoplay: true,
            posterImage: content.appIcon,
          })
          break
        case NsContent.EMimeTypes.PDF:
          this.assignWidgetData(ROOT_WIDGET_CONFIG.player.pdf, {
            pdfUrl: content.artifactUrl,
          })
          break
        case NsContent.EMimeTypes.YOUTUBE:
          this.assignWidgetData(ROOT_WIDGET_CONFIG.player.youtube, {
            url: content.artifactUrl,
            autoplay: true,
            posterImage: content.appIcon,
          })
          break
      }
    }
  }
  private assignWidgetData(widgetSubType: string, widgetData: any) {
    this.contentPlayWidgetConfig = {
      widgetSubType,
      widgetData,
      widgetType: ROOT_WIDGET_CONFIG.player._type,
      widgetHostClass: 'video-full block',
      widgetHostStyle: {
        height: '375px',
      },
    }
    this.isPlayable = true
  }
  sanitizedBackgroundImage(url: string): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(`url(${url})`)
  }
  resourceLink(resource: NsContent.IContent): { url: string; queryParams: { [key: string]: any } } {
    return viewerRouteGenerator(resource.identifier, resource.mimeType)
  }

  public contentTrackBy(_index: number, content: NsContent.IContent) {
    if (!content) {
      return null
    }
    return content.identifier
  }

  get showYouMayAlsoLikeTab(): boolean {
    switch (this.configSvc.rootOrg) {
      default:
        return true
    }
  }
}
