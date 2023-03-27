import { Component, Inject, OnDestroy, OnInit } from '@angular/core'
import { MatSnackBar, MAT_DIALOG_DATA } from '@angular/material'
import { NsContent } from '../../../../../../../../../../../library/ws-widget/collection/src/public-api'
import { NOTIFICATION_TIME } from '../../../../../../constants/constant'
import { Notify } from '../../../../../../constants/notificationMessage'
import { NSContent } from '../../../../../../interface/content'
import { NotificationComponent } from '../../../../../../modules/shared/components/notification/notification.component'
import { EditorService } from '../../../services/editor.service'

@Component({
  selector: 'ws-auth-publish-content-modal',
  templateUrl: './publish-content-modal.component.html',
  styleUrls: ['./publish-content-modal.component.scss'],
})
export class PublishContentModalComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = ['name', 'status']
  dataSource!: any[]
  interval: any
  timeInterval = 60
  takeAction!: string

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: string,
    private editorService: EditorService,
    private snackBar: MatSnackBar,
  ) {
  }

  async ngOnInit(): Promise<void> {
    if (this.data) {
      const tempArrayData: any = []
      const contentData = await this.editorService.readcontentV3(this.data).toPromise().catch(_error => { })
      if (contentData && contentData.identifier && contentData.children) {
        contentData.children.forEach((element: any) => {
          if (element.primaryCategory === NsContent.EPrimaryCategory.MODULE) {
            element.children.forEach((subEle: any) => {
              tempArrayData.push(subEle)
            })
          } else {
            tempArrayData.push(element)
          }
        })
      }
      this.dataSource = tempArrayData
      this.checkChildrenStatus()
    }
  }

  ngOnDestroy(): void {
  }

  async getLatestData() {
    this.dataSource = []
    const tempArrayData: any = []
    this.interval = setInterval(() => {
      this.timeInterval -= 1
      if (this.timeInterval < 0) {
        clearInterval(this.interval)
        this.timeInterval = 60
      }
      // tslint:disable-next-line: align
    }, 1000)
    const contentData = await this.editorService.readcontentV3(this.data).toPromise().catch(_error => { })
    if (contentData && contentData.identifier && contentData.children) {
      contentData.children.forEach((element: any) => {
        if (element.primaryCategory === NsContent.EPrimaryCategory.MODULE) {
          element.children.forEach((subEle: any) => {
            tempArrayData.push(subEle)
          })
        } else {
          tempArrayData.push(element)
        }
      })
      this.dataSource = tempArrayData
      this.checkChildrenStatus()
    } else {
      this.showMessage('fail')
    }
  }

  showMessage(type: string) {
    switch (type) {
      case 'fail': this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.SUCCESS,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
        break
    }
  }

  async checkChildrenStatus() {
    this.takeAction = ''
    const childrenToPublish = await this.verifyStatusForChild()
    const parentToPublish = await this.verifyStatusForParent()
    if (childrenToPublish) {
      this.takeAction = 'sendChildToPublish'
    } else if (parentToPublish) {
      this.takeAction = 'sendContentToPublish'
    }
  }

  verifyStatusForChild() {
    const courseChildCheck = this.dataSource.filter(
      (v: NSContent.IContentMeta) => v.primaryCategory === NsContent.EPrimaryCategory.RESOURCE
        && v.status.toLowerCase() === 'review' && v.reviewStatus.toLowerCase() === 'reviewed')
    const assessmentChildCheck = this.dataSource.filter(
      (v: NSContent.IContentMeta) => (v.primaryCategory === NsContent.EPrimaryCategory.ASSESSMENT
        || v.primaryCategory === NsContent.EPrimaryCategory.FINALASSESSMENT)
        && v.status.toLowerCase() === 'review' && v.reviewStatus.toLowerCase() === 'reviewed')
    if (courseChildCheck.length > 0 || assessmentChildCheck.length > 0) {
      return true
    }
    return false
  }

  verifyStatusForParent() {
    const courseChildCheck = this.dataSource.filter(
      (v: NSContent.IContentMeta) => v.primaryCategory === NsContent.EPrimaryCategory.RESOURCE
        && v.status.toLowerCase() === 'live')
    const assessmentChildCheck = this.dataSource.filter(
      (v: NSContent.IContentMeta) => (v.primaryCategory === NsContent.EPrimaryCategory.ASSESSMENT
        || v.primaryCategory === NsContent.EPrimaryCategory.FINALASSESSMENT) && v.status.toLowerCase() === 'live')
    if ((courseChildCheck.length + assessmentChildCheck.length) === this.dataSource.length) {
      return true
    }
    return false
  }

}
