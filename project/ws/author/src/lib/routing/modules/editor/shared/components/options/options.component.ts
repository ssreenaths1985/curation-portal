import { Component, OnInit, OnDestroy, AfterViewInit, EventEmitter, Input, Output } from '@angular/core'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { EditorContentService } from '@ws/author/src/lib/routing/modules/editor/services/editor-content.service'
import { NSContent } from '@ws/author/src/lib/interface/content'
import { NsContent } from '../../../../../../../../../../../library/ws-widget/collection/src/public-api'
import { ConfigurationsService } from '@ws-widget/utils'

@Component({
  selector: 'ws-auth-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
})
export class OptionsComponent implements OnInit, OnDestroy, AfterViewInit {
  contents: NSContent.IContentMeta[] = []
  @Input() currentContent = ''
  @Output() action = new EventEmitter<string>()
  showSettingButtons = false
  currentMetaData: NSContent.IContentMeta | undefined
  isPublisher?: boolean
  isReviewer?: boolean
  isContentCreator?: boolean
  isRejectComment?: boolean
  constructor(
    private accessService: AccessControlService,
    private contentService: EditorContentService,
    private configSvc: ConfigurationsService,
  ) { }

  ngAfterViewInit() {

  }

  ngOnInit() {
    this.currentMetaData = this.contentService.getOriginalMeta(this.currentContent)
    this.isRejectComment = (this.currentMetaData && this.currentMetaData.rejectComment) ? true : false
    this.isPublisher = (
      this.currentMetaData.publisherIDs
      && this.currentMetaData.status.toLowerCase() === 'review'
      && this.currentMetaData.reviewStatus.toLowerCase() === 'reviewed' &&
      this.currentMetaData.publisherIDs.includes((this.configSvc.userProfile) ? this.configSvc.userProfile.userId : '')) ? true : false
    this.isReviewer = (
      this.currentMetaData.reviewerIDs &&
      this.currentMetaData.status.toLowerCase() === 'review'
      && this.currentMetaData.reviewStatus.toLowerCase() === 'inreview' &&
      this.currentMetaData.reviewerIDs.includes((this.configSvc.userProfile) ? this.configSvc.userProfile.userId : '')) ? true : false
    this.isContentCreator = (
      this.configSvc.userProfile && (this.currentMetaData.createdBy === this.configSvc.userProfile.userId)) ? true : false
  }

  toggleSettingButtons() {
    this.showSettingButtons = !this.showSettingButtons
  }

  isPublisherSame(): boolean {
    const publisherDetails =
      this.contentService.getUpdatedMeta(this.currentContent).publisherDetails || []
    return publisherDetails.find(v => v.id === this.accessService.userId) ? true : false
  }

  isDirectPublish(): boolean {
    return (
      ['Draft', 'Live'].includes(this.contentService.originalContent[this.currentContent].status) &&
      this.isPublisherSame()
    )
  }
  getPreview() {
    return this.contentService.originalContent[this.currentContent].primaryCategory === NsContent.EPrimaryCategory.RESOURCE
  }

  getAction(): string {
    if (this.contentService.getParentUpdatedMeta().identifier === this.currentContent) {
      if (
        ((this.accessService.authoringConfig.isMultiStepFlow && this.isDirectPublish()) ||
          !this.accessService.authoringConfig.isMultiStepFlow) &&
        this.accessService.rootOrg.toLowerCase() === 'client1'
      ) {
        return 'publish'
      }
      if (this.contentService.originalContent &&
        this.contentService.originalContent[this.currentContent] &&
        this.contentService.originalContent[this.currentContent].contentType === 'Knowledge Artifact'
      ) {
        return 'publish'
      }
      switch (this.contentService.originalContent[this.currentContent].status) {
        case 'Draft':
          return 'sendForReview'
        case 'InReview':
          return 'review'
        case 'Review':
          return 'publish'
        case 'Live':
          return 'sendForReview'
        default:
          return 'sendForReview'
      }
    }
    return ''
  }
  canDelete() {
    return this.accessService.hasRole(['editor', 'admin']) ||
      (['Draft', 'Live'].includes(this.contentService.originalContent[this.currentContent].status) &&
        this.contentService.originalContent[this.currentContent].creatorContacts.find(v => v.id === this.accessService.userId)
      )
  }
  ngOnDestroy() {

  }

  showButton(action: string) {
    const metaData = this.contentService.getOriginalMeta(this.currentContent)
    switch (action) {
      case 'save':
        if (this.accessService.userId === metaData.createdBy && this.accessService.hasRole(['editor', 'content_creator'])) {
          return true
        }
        break
      case 'reviewer':
        if (metaData.reviewerIDs && metaData.reviewerIDs.length > 0 &&
          metaData.reviewerIDs.includes(this.accessService.userId) && this.accessService.hasRole(['editor', 'content_reviewer'])) {
          return true
        }
        break
      case 'publisher':
        if (metaData.publisherIDs && metaData.publisherIDs.length > 0 &&
          metaData.publisherIDs.includes(this.accessService.userId) && this.accessService.hasRole(['editor', 'content_publisher'])) {
          return true
        }
        break
    }
    return false
  }

}
