import { Component, OnInit, OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs'
import {
  NsContent,
  IWidgetsPlayerMediaData,
  NsDiscussionForum,
  // WidgetContentService,
} from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ValueService } from '@ws-widget/utils'
import { ActivatedRoute } from '@angular/router'
import { Platform } from '@angular/cdk/platform'

@Component({
  selector: 'viewer-youtube',
  templateUrl: './youtube.component.html',
  styleUrls: ['./youtube.component.scss'],
})
export class YoutubeComponent implements OnInit, OnDestroy {
  private routeDataSubscription: Subscription | null = null
  private screenSizeSubscription: Subscription | null = null
  private viewerDataSubscription: Subscription | null = null
  forPreview = false
  isScreenSizeSmall = false
  isFetchingDataComplete = false
  youtubeData: NsContent.IContent | null = null
  widgetResolverYoutubeData: NsWidgetResolver.IRenderConfigWithTypedData<
    IWidgetsPlayerMediaData
  > | null = null
  discussionForumWidget: NsWidgetResolver.IRenderConfigWithTypedData<
    NsDiscussionForum.IDiscussionForumInput
  > | null = null
  isScreenSizeLtMedium = false
  constructor(
    private activatedRoute: ActivatedRoute,
    private valueSvc: ValueService,
    // private contentSvc: WidgetContentService,
    private platform: Platform,
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.forPreview = params.get('preview') === 'true'
    })
  }

  ngOnInit() {
    this.screenSizeSubscription = this.valueSvc.isXSmall$.subscribe(data => {
      this.isScreenSizeSmall = data
    })
    this.routeDataSubscription = this.activatedRoute.data.subscribe(
      async data => {
        this.widgetResolverYoutubeData = null
        this.youtubeData = data.content.data
        if (this.youtubeData) {
          this.formDiscussionForumWidget(this.youtubeData)
        }

        this.widgetResolverYoutubeData = this.initWidgetResolverYoutubeData()
        if (this.forPreview) {
          this.widgetResolverYoutubeData.widgetData.disableTelemetry = true
        }
        this.widgetResolverYoutubeData.widgetData.url = this.youtubeData
          ? this.youtubeData.artifactUrl
          : ''
        this.widgetResolverYoutubeData.widgetData.identifier = this.youtubeData
          ? this.youtubeData.identifier
          : ''
        if (this.platform.ANDROID) {
          this.widgetResolverYoutubeData.widgetData.isVideojs = false
        } else {
          this.widgetResolverYoutubeData.widgetData.isVideojs = true
        }
        // if (this.youtubeData && this.youtubeData.artifactUrl.indexOf('content-store') >= 0) {
        //   await this.setS3Cookie(this.youtubeData.identifier)
        // }
        this.isFetchingDataComplete = true
      },
      () => { },
    )
  }

  ngOnDestroy() {
    if (this.routeDataSubscription) {
      this.routeDataSubscription.unsubscribe()
    }
    if (this.screenSizeSubscription) {
      this.screenSizeSubscription.unsubscribe()
    }
    if (this.viewerDataSubscription) {
      this.viewerDataSubscription.unsubscribe()
    }
  }

  initWidgetResolverYoutubeData() {
    return {
      widgetType: 'player',
      widgetSubType: 'playerYoutube',
      widgetData: {
        disableTelemetry: false,
        url: '',
        identifier: '',
      },
      widgetHostClass: 'video-full',
    }
  }

  formDiscussionForumWidget(content: NsContent.IContent) {
    this.discussionForumWidget = {
      widgetData: {
        description: content.description,
        id: content.identifier,
        name: NsDiscussionForum.EDiscussionType.LEARNING,
        title: content.name,
        initialPostCount: 2,
        isDisabled: this.forPreview,
      },
      widgetSubType: 'discussionForum',
      widgetType: 'discussionForum',
    }
  }

  // private async setS3Cookie(contentId: string) {
  //   await this.contentSvc
  //     .setS3Cookie(contentId)
  //     .toPromise()
  //     .catch(() => { })
  //   return
  // }
}
