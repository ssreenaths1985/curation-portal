
import { Component, OnDestroy, OnInit, AfterViewInit, Output, EventEmitter, ViewChild, ElementRef, Input } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material'
import { ConfigurationsService } from '@ws-widget/utils/src/public-api'
import { environment } from '../../../../../../../../../../../../src/environments/environment'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { NSApiRequest } from '@ws/author/src/lib/interface/apiRequest'
import { MyContentService } from '../../services/my-content.service'

/* tslint:disable */
import _ from 'lodash'
/* tslint:enable */

@Component({
  selector: 'ws-auth-add-users-form-meta',
  templateUrl: './add-users-form-meta.component.html',
  styleUrls: ['./add-users-form-meta.component.scss'],
})
export class AddUsersFormMetaComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('roles', { static: false }) roles!: ElementRef

  @Output() data = new EventEmitter<any>()
  @Input() selectedAction!: any

  contentForm!: FormGroup
  listOfRoles = environment.portalRoles
  userCompleteData!: any

  constructor(
    private formBuilder: FormBuilder,
    private configSvc: ConfigurationsService,
    private contentService: MyContentService,
    private loaderService: LoaderService,
    private snackBar: MatSnackBar,
  ) {
  }

  ngOnDestroy() {
  }

  ngAfterViewInit() {
  }

  ngOnInit() {
    switch (this.selectedAction.type) {
      case 'existingUser':
        this.assignValues(this.selectedAction.userId)
        break
      case 'createNew':
        this.createFormContent()
        break
    }
  }

  async assignValues(userId: string) {
    this.createFormContent()
    this.loaderService.changeLoadState(true)
    const getUserData = await this.contentService.getExistingUserData(userId).toPromise().catch(_error => { })
    if (getUserData && getUserData.params && getUserData.params.status.toLowerCase() === 'success') {
      this.userCompleteData = getUserData.result.response
      let userRoles: any = []
      getUserData.result.response.organisations.forEach((orgEle: any) => {
        userRoles = (orgEle.roles) ? orgEle.roles : []
      })
      this.contentForm.setValue({
        firstName: getUserData.result.response.firstName,
        channel: getUserData.result.response.channel,
        lastName: getUserData.result.response.lastName,
        email: getUserData.result.response.maskedEmail,
        selectedRoles: userRoles,
      })
      this.loaderService.changeLoad.next(false)
    } else {
      this.loaderService.changeLoad.next(false)
      this.showToastMessage('fail')
    }
  }

  createFormContent() {
    this.contentForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      channel: [(this.configSvc.userProfile) ? this.configSvc.userProfile.departmentName : '', Validators.required],
      selectedRoles: ['', Validators.required],
    })
  }

  actionBtn(actionType: string) {
    this.data.emit({
      type: actionType,
    })
  }

  async createUser() {
    if (this.contentForm.status === 'INVALID') {
      this.showToastMessage('requriedFieldsMissing')
    } else {
      this.loaderService.changeLoadState(true)
      const requestPayload: NSApiRequest.ICreateNewUser = {
        personalDetails: {
          email: this.contentForm.controls.email.value,
          // tslint:disable-next-line: prefer-template
          userName: this.contentForm.controls.firstName.value + ' ' + this.contentForm.controls.lastName.value,
          firstName: this.contentForm.controls.firstName.value,
          lastName: this.contentForm.controls.lastName.value,
          channel: this.contentForm.controls.channel.value,
        },
      }
      const createUserRes = await this.contentService.createNewUserApi(requestPayload).toPromise().catch(_error => { })
      if (createUserRes && createUserRes.userId) {
        this.assignRoleToUser(createUserRes.userId)
      } else {
        this.showToastMessage('fail')
        this.loaderService.changeLoad.next(false)
      }
    }
  }

  updateuser() {
    this.loaderService.changeLoad.next(true)
    let userDataRoles: any = []
    this.userCompleteData.organisations.forEach((orgEle: any) => {
      userDataRoles = (orgEle.roles) ? orgEle.roles : []
    })
    let flag = false
    this.contentForm.controls['selectedRoles'].value.forEach((element: any) => {
      if (userDataRoles.includes(element)) {
        flag = true
      } else {
        flag = false
      }
    })
    if (flag && this.contentForm.controls['selectedRoles'].value.length === userDataRoles.length) {
      this.showToastMessage('upToDate')
      this.loaderService.changeLoad.next(false)
    } else {
      this.assignRoleToUser(this.userCompleteData.userId)
    }
  }

  async assignRoleToUser(id: string) {
    const requestPayload: NSApiRequest.IAssignUserRoles = {
      request: {
        organisationId: (this.configSvc.userProfile) ? this.configSvc.userProfile.rootOrgId : '',
        userId: id,
        roles: this.contentForm.controls['selectedRoles'].value,
      },
    }
    const assignUserRoleRes = await this.contentService.assignUserRoleApi(requestPayload).toPromise().catch(_error => { })
    if (assignUserRoleRes && assignUserRoleRes.params && assignUserRoleRes.params.status.toLowerCase() === 'success') {
      this.loaderService.changeLoad.next(false)
      this.showToastMessage('success')
      setTimeout(() => {
        this.actionBtn('addUserCancel')
        // tslint:disable-next-line: align
      }, 1500)
    } else {
      this.loaderService.changeLoad.next(false)
      this.showToastMessage('fail')
    }
  }

  showToastMessage(type: string) {
    switch (type) {
      case 'fail':
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SAVE_FAIL,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        break
      case 'success':
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SAVE_SUCCESS,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        break
      case 'requriedFieldsMissing':
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.REQURIED_FIELDS_MISSING,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        break
      case 'upToDate':
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.UP_TO_DATE,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        break
    }
  }

}
