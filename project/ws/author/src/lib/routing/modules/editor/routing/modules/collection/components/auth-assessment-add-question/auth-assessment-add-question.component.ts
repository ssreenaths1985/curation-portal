import { Component, Input, OnChanges } from '@angular/core'
import { EditorContentService } from '../../../../../services/editor-content.service'
import { v4 as uuidv4 } from 'uuid'
import { EditorService, LoaderService } from '../../../../../../../../../public-api'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { MatSnackBar } from '@angular/material'
import { ConfigurationsService } from '@ws-widget/utils'

@Component({
  selector: 'ws-auth-assessment-add-question',
  templateUrl: './auth-assessment-add-question.component.html',
  styleUrls: ['./auth-assessment-add-question.component.scss'],
})
export class AuthAssessmentAddQuestionComponent implements OnChanges {

  @Input() selectedData!: any

  contentData: any
  listOfSection: any = []
  isEditEnabled = false

  constructor(
    private contentService: EditorContentService,
    private loaderService: LoaderService,
    private editorService: EditorService,
    private snackBar: MatSnackBar,
    private configSvc: ConfigurationsService,
  ) { }

  async ngOnChanges() {
    const contentMeta = this.contentService.getOriginalMeta(this.contentService.parentContent)
    this.isEditEnabled = (this.configSvc.userProfile && this.configSvc.userProfile.userId === contentMeta.createdBy) ? true : false
    this.listOfSection = []
    if (this.selectedData && this.selectedData.identifier) {
      this.loaderService.changeLoad.next(true)
      const assessmentDataRes =
        await this.editorService.getAssessmentHierarchy(this.selectedData.identifier).toPromise().catch(_error => { })
      if (assessmentDataRes && assessmentDataRes.params && assessmentDataRes.params.status === 'successful') {
        this.loaderService.changeLoad.next(false)
        this.contentService.assessmentOriginalContent = {}
        this.contentService.setAssessmentOriginalMetaHierarchy(assessmentDataRes.result.questionSet)
      } else {
        this.loaderService.changeLoad.next(true)
        this.showMessage('fail')
      }
      this.contentData = this.contentService.getAssessmentOriginalMeta(this.selectedData.identifier)
      if (this.contentData && this.contentData.children && this.contentData.children.length > 0) {
        this.contentData.children.forEach((element: any) => {
          this.listOfSection.push(element.identifier)
        })
      }
    }
    if (this.listOfSection.length === 0) {
      this.listOfSection.push(uuidv4())
    }
  }

  showMessage(item: string) {
    switch (item) {
      case 'createParent':
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.CREATE_CONTENT,
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
    }

  }

  addSectionContent() {
    this.listOfSection.push(uuidv4())
  }

  takeSectionSaveAction(item: any) {
    this.listOfSection[this.listOfSection.indexOf(Object.keys(item)[0])] = Object.values(item)[0]
  }

  takeDeleteAction(item: any) {
    this.listOfSection = this.listOfSection.filter((v: any) => v !== item)
  }
}
