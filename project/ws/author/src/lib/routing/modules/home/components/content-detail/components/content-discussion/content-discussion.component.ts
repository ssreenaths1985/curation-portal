import { Component, OnInit, Input, OnChanges } from '@angular/core'
import { NsDiscussionForum, NsContent } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ActivatedRoute } from '@angular/router'
import { ConfigurationsService } from '@ws-widget/utils'

@Component({
  selector: 'ws-auth-content-discussion',
  templateUrl: './content-discussion.component.html',
  styleUrls: ['./content-discussion.component.scss'],
})
export class ContentDiscussionComponent implements OnChanges, OnInit {
  @Input() content!: NsContent.IContent
  showDiscussionForum = false
  isRestricted = true
  @Input() forPreview = false
  discussionForumWidget: NsWidgetResolver.IRenderConfigWithTypedData<
    NsDiscussionForum.IDiscussionForumInput
  > | null = null
  constructor(private activatedRoute: ActivatedRoute, private configSvc: ConfigurationsService) { }

  ngOnChanges() {
    this.forPreview = false
    if (this.content) {
      this.discussionForumWidget = {
        widgetData: {
          description: this.content.description,
          id: this.content.identifier,
          name: NsDiscussionForum.EDiscussionType.LEARNING,
          title: this.content.name,
          initialPostCount: 2,
          isDisabled: this.forPreview,
        },
        widgetSubType: 'discussionForum',
        widgetType: 'discussionForum',
      }
    }
  }

  ngOnInit() {
    if (this.configSvc.restrictedFeatures) {
      this.isRestricted =
        this.configSvc.restrictedFeatures.has('disscussionForum') ||
        this.configSvc.restrictedFeatures.has('disscussionForumTRPU')
    }
    if (this.activatedRoute.parent && this.activatedRoute.parent.data) {
      this.activatedRoute.parent.data.subscribe((data: any) => {
        if (data && data.content) {
          this.content = data.content
          this.ngOnChanges()
        }
      })
    }
  }
}
