import { Component, OnInit, Inject } from '@angular/core'
import { MAT_DIALOG_DATA } from '@angular/material'

@Component({
  selector: 'ws-auth-view-review-comment-dialog',
  templateUrl: './view-review-comment-dialog.component.html',
  styleUrls: ['./view-review-comment-dialog.component.scss'],
})
export class ViewReviewCommentDialogComponent implements OnInit {

  rejectComment = ''
  copyContentName = ''
  returnDataValue!: any
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
  }

}
