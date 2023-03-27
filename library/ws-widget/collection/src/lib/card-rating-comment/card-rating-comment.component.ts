import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { WidgetContentService } from '../_services/widget-content.service'
import { FormGroup, FormControl } from '@angular/forms'
import { HttpClient } from '@angular/common/http'

@Component({
  selector: 'ws-widget-card-rating-comment',
  templateUrl: './card-rating-comment.component.html',
  styleUrls: ['./card-rating-comment.component.scss'],
})
export class CardRatingCommentComponent implements OnInit {
  @Input() review: any | null = null
  @Output() reply?: EventEmitter<any> = new EventEmitter<any>()
  @Input() creatorDetails: any | null = null
  @Input() contenDetails: any | null = null
  replyForm: FormGroup | undefined
  PROXY_SLAG_V8 = '/apis/proxies/v8'
  showReplyBox = false
  showReplyComment = false
  sent = false
  authorReply!: string | null | undefined
  constructor(
    private ratingService: WidgetContentService,
    private httpClient: HttpClient,
  ) { }

  ngOnInit() {
    this.replyForm = new FormGroup({
      replyText: new FormControl(),
    })
  }

  getRatingIcon(ratingIndex: number, avg: number): 'star' | 'star_border' | 'star_half' {
    return this.ratingService.getRatingIcon(ratingIndex, avg)
  }

  getRatingIconClass(ratingIndex: number, avg: number): boolean {
    return this.ratingService.getRatingIconClass(ratingIndex, avg)
  }
  onClickSubmit() {
    this.sent = true
    const value = this.replyForm && this.replyForm.get('replyText')
    if (value && value.value && this.reply) {
      this.reply.emit({ root: this.review, reply: value.value })
      setTimeout(() => {
        this.sent = false
        this.showReply()
        // tslint:disable-next-line: align
      }, 3000)
    }
  }
  edit() {
    if (this.replyForm) {
      this.replyForm.setValue({ replyText: this.authorReply })
      this.showReplyBox = true
      this.showReplyComment = true
    } else {
      this.showReplyBox = false
      this.showReplyComment = true
    }
  }
  async showReply() {
    const reviewUserId = (this.review.userId) ? this.review.userId : (this.review.user_id) ? this.review.user_id : ''
    // const reviewUserId = (this.creatorDetails && this.creatorDetails.userId) ? this.creatorDetails.userId : ''
    this.httpClient.get(`${this.PROXY_SLAG_V8}/ratings/v1/read/${this.contenDetails.identifier}/Course/${reviewUserId}`)
      .subscribe((res: any) => {
        if (res.result.response.comment) {
          this.showReplyBox = false
          this.showReplyComment = true
          this.authorReply = res.result.response.comment
          if (this.replyForm) {
            this.replyForm.setValue({ replyText: '' })
          }
        } else {
          this.showReplyBox = true
          this.showReplyComment = false
          this.authorReply = null
        }
      })
  }

  getFullName(review: any) {
    if (!review && !review.firstName) {
      return ''
    }
    return `${review.firstName} ${review.lastName}`
  }
}
