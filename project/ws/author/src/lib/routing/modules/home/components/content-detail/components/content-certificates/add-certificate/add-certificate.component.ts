import { Component, OnDestroy, OnInit, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig, MatDialog, MatSnackBar } from '@angular/material'
import { Subscription } from 'rxjs'
import { NSContent } from '../../../../../../../../interface/content'
import { LoaderService, AccessControlService } from '../../../../../../../../../public-api'
import { AuthInitService } from '../../../../../../../../services/init.service'
/* tslint:disable */
import _ from 'lodash'
/* tslint:enable */
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms'
import { AddContentSVGComponent } from '../../content-add-svg/content-add-svg.component'
import { environment } from '../../../../../../../../../../../../../src/environments/environment'
import { SVG_IMAGE_SUPPORT_TYPES, IMAGE_MAX_SIZE } from '../../../../../../../../constants/upload'
import { NotificationComponent } from '../../../../../../../../modules/shared/components/notification/notification.component'
import { Notify } from '../../../../../../../../constants/notificationMessage'
import { NOTIFICATION_TIME } from '../../../../../../../../constants/constant'
import { NSApiRequest } from '../../../../../../../../interface/apiRequest'
import { ACTION_CONTENT_V3, CONTENT_BASE_STATIC } from '../../../../../../../../constants/apiEndpoints'
import { NSApiResponse } from '../../../../../../../../interface/apiResponse'
import { ApiService } from '../../../../../../../../modules/shared/services/api.service'
import { UploadService } from '../../../../../../editor/shared/services/upload.service'
import { ConfigurationsService } from '@ws-widget/utils/src/public-api'

@Component({
  selector: 'ws-auth-content-add-certificate',
  templateUrl: './add-certificate.component.html',
  styleUrls: ['./add-certificate.component.scss'],
})
export class ContentAddCertificateComponent implements OnInit, OnDestroy {
  public contentId: string | null = null
  public content!: NSContent.IContentMeta
  routerSubscription = <Subscription>{}
  defaultCertificateImage = '/assets/images/batch/sample-batch .png'
  uploadData!: any
  cretForm!: FormGroup
  allLanguages: any[] = []
  searchLanguage = ''
  isAdmin = false

  constructor(
    // private myContSvc: MyContentService,
    private loadService: LoaderService,
    private accessService: AccessControlService,
    private configSvc: ConfigurationsService,
    private authInitService: AuthInitService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private apiService: ApiService,
    private uploadService: UploadService,
    public dialogRef: MatDialogRef<ContentAddCertificateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: String[]
  ) {
    this.isAdmin = this.accessService.hasRole(['admin', 'super-admin', 'content-admin', 'editor'])
    this.cretForm = new FormGroup({
      certName: new FormControl('', [Validators.required]),
      certMsg: new FormControl('', [Validators.required]),
      certImage: new FormControl('', [Validators.required]),
    })
  }
  ngOnDestroy() {
    if (this.routerSubscription.unsubscribe) {
      this.routerSubscription.unsubscribe()
    }
    this.loadService.changeLoad.next(false)
  }
  ngOnInit() {
    this.allLanguages = this.authInitService.ordinals.subTitles || []
    // this.activatedRoute.queryParams.subscribe(() => {
    // })
  }
  showError(formControl: AbstractControl) {
    if (formControl.invalid) {
      if (formControl.touched) {
        return true
      }
      if (formControl && formControl.touched) {
        return true
      }
      return false
    }
    return false
  }
  changeToDefaultSourceImg($event: any) {
    $event.target.src = this.defaultCertificateImage
  }
  close() {
    if (this.cretForm.valid && this.uploadData && this.uploadData.identifier) {
      this.dialogRef.close({
        data: {
          ok: true,
          data: { ...this.cretForm.value, identifier: this.uploadData.identifier },
        },
      })
    }
  }
  cancel() {
    this.loadService.changeLoad.next(false)
    this.dialogRef.close({
      data: {
        ok: false,
        data: [],
      },
    })
  }
  openBrowse() {
    const dialogConfig = new MatDialogConfig()
    const dialogRef = this.dialog.open(AddContentSVGComponent, dialogConfig)
    const instance = dialogRef.componentInstance
    instance.isUpdate = true
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data && data.appURL) {
        this.uploadData = data
        this.cretForm.controls.certImage.setValue(this.generateUrl(data.appURL))
        // this.canUpdate = true
        // this.storeData()
      } else if (data && data.file) {
        this.uploadAppIcon(data.file)
      }
    })
  }
  generateUrl(oldUrl: string) {
    const chunk = oldUrl.split('/')
    const newChunk = environment.azureHost.split('/')
    const newLink = []
    for (let i = 0; i < chunk.length; i += 1) {
      if (i === 2) {
        newLink.push(newChunk[i])
      } else if (i === 3) {
        newLink.push(environment.azureBucket)
      } else {
        newLink.push(chunk[i])
      }
    }
    const newUrl = newLink.join('/')
    return newUrl
  }
  uploadAppIcon(file: File) {
    this.loadService.changeLoad.next(true)
    if (!file) {
      return
    }
    const formdata = new FormData()
    const fileName = (file ? file.name || this.content.identifier :
      (this.content.identifier || (new Date()).toString())).replace(/[^A-Za-z0-9.]/g, '')
    if (
      !(
        SVG_IMAGE_SUPPORT_TYPES.indexOf(
          `.${fileName
            .toLowerCase()
            .split('.')
            .pop()}`,
        ) > -1
      )
    ) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.INVALID_FORMAT,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
      return
    }

    if (file.size > IMAGE_MAX_SIZE) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.SIZE_ERROR,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
      return
    }
    if (file) {
      formdata.append('content', file, fileName)
      this.loadService.changeLoad.next(true)

      let randomNumber = ''
      // tslint:disable-next-line: no-increment-decrement
      for (let i = 0; i < 16; i++) {
        randomNumber += Math.floor(Math.random() * 10)
      }
      const requestBody: NSApiRequest.ICreateImageMetaRequestV2 = {
        request: {
          content: {
            code: randomNumber,
            contentType: 'Asset',
            createdBy: this.accessService.userId,
            creator: this.accessService.userName,
            mimeType: 'image/svg+xml',
            mediaType: 'image',
            name: fileName,
            organisation: [_.get(this.configSvc.unMappedUser, 'rootOrg.orgName')],
            language: ['English'],
            license: 'CC BY 4.0',
            primaryCategory: 'Asset',
            generateDIALCodes: 'Yes',
            dialcodeRequired: 'Yes',
            createdFor: [this.configSvc.unMappedUser.rootOrgId],
          },
        },
      }

      this.apiService
        .post<NSApiRequest.ICreateMetaRequest>(
          `${ACTION_CONTENT_V3}create`,
          requestBody,
        )
        .subscribe(
          (meta: NSApiResponse.IContentCreateResponseV2) => {
            // return data.result.identifier

            this.uploadService
              .upload(formdata, {
                contentId: meta.result.identifier,
                contentType: CONTENT_BASE_STATIC,
              })
              .subscribe(
                data => {
                  if (data.result) {
                    const url = data.result.artifactUrl
                    this.uploadData = data.result
                    this.loadService.changeLoad.next(false)
                    this.cretForm.controls.certImage.setValue(this.generateUrl(url))
                    this.loadService.changeLoad.next(false)
                  }
                },
                () => {
                  this.loadService.changeLoad.next(false)
                  this.snackBar.openFromComponent(NotificationComponent, {
                    data: {
                      type: Notify.UPLOAD_FAIL,
                    },
                    duration: NOTIFICATION_TIME * 1000,
                  })
                },
              )
          },
        )

    }
  }

  getUrl(url: string) {
    if (url && url.length > 0) {
      const tempData = url.split('content')
      if (url.indexOf(`/collection`) > 0) {
        return `${environment.cbpPortal}${environment.contentBucket}${tempData[tempData.length - 1]}`
      }
      if (url.indexOf('/public/content') > 0) {
        return `${environment.cbpPortal}${environment.certImage}${tempData[tempData.length - 1]}`
      }
      return `${environment.cbpPortal}${environment.contentBucket}/content${tempData[tempData.length - 1]}`
    }
    return url
  }
}
