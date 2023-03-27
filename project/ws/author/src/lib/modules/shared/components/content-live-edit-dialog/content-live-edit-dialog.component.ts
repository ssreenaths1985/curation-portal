import { Component, OnInit, Inject } from '@angular/core'
import { MAT_DIALOG_DATA } from '@angular/material'

@Component({
  selector: 'ws-auth-content-live-edit-dialog',
  templateUrl: './content-live-edit-dialog.component.html',
  styleUrls: ['./content-live-edit-dialog.component.scss'],
})
export class ContentLiveEditDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
  }

}
