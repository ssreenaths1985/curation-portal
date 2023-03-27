import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { AuthInitService } from '../../../../../../../../services/init.service'
// import { IContentNode, IContentTreeNode } from '../../interface/icontent-tree'
// import { CollectionStoreService } from '../../services/store.service'
// import { NSApiRequest } from '../../../../../../../../interface/apiRequest'
// import { EditorService } from '../../../../../services/editor.service'
// import { LoaderService } from '../../../../../../../../services/loader.service'
import { MatSnackBar, MatChipInputEvent } from '@angular/material'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { EditorContentService } from '@ws/author/src/lib/routing/modules/editor/services/editor-content.service'
import { ConfigurationsService } from '../../../../../../../../../../../../../library/ws-widget/utils/src/public-api'
import { NSContent } from '../../../../../../../../interface/content'
import { NsContent } from '../../../../../../../../../../../../../library/ws-widget/collection/src/public-api'
import { IFormMeta } from '../../../../../../../../interface/form'
import { Observable, of } from 'rxjs'
import { debounceTime } from 'rxjs/operators'
// import { CollectionResolverService } from './../../services/resolver.service'

@Component({
  selector: 'ws-auth-form-meta',
  templateUrl: './auth-form-meta.component.html',
  styleUrls: ['./auth-form-meta.component.scss'],
})
export class AuthFormMetaComponent implements OnChanges {
  contentMeta!: NSContent.IContentMeta
  @Input() typeOfResorce!: string
  @Output() data = new EventEmitter<any>()
  @Input() isSubmitPressed = false
  @Input() selectedNodeIdentifier!: string

  filteredOptions$: Observable<string[]> = of([])

  contentForm!: FormGroup
  isEditEnabled = false
  hours = 0
  minutes = 0
  seconds = 0
  complexityLevelList!: any
  ordinals!: any
  resourceTypes: string[] = []
  canUpdate = true
  removable = true
  specialCharListMsg = false
  specialCharList = `( a/A-z/Z, 0-9 . _ - $ / \ : [ ]' ' !)`
  keywordsCtrl!: FormControl
  creatorDetailsCtrl!: FormControl

  readonly separatorKeysCodes: number[] = [ENTER, COMMA]

  constructor(
    private authInitService: AuthInitService,
    // private collectionstoreService: CollectionStoreService,
    private formBuilder: FormBuilder,
    // private editorService: EditorService,
    private editorContentService: EditorContentService,
    // private loaderService: LoaderService,
    private snackBar: MatSnackBar,
    private configService: ConfigurationsService,
  ) { }

  ngOnChanges() {
    this.ordinals = this.authInitService.ordinals
    this.ordinals.licenses = ['CC BY-NC-SA 4.0', 'Standard YouTube License', 'CC BY-NC 4.0', 'CC BY-SA 4.0', 'CC BY 4.0']
    this.setContentData = this.editorContentService.getOriginalMeta(this.editorContentService.currentContent)
    this.keywordsCtrl = new FormControl('')
    this.creatorDetailsCtrl = new FormControl('')
  }

  private set setContentData(contentMeta: NSContent.IContentMeta) {
    this.contentMeta = contentMeta
    this.isEditEnabled = (
      this.configService.userProfile && this.configService.userProfile.userId === contentMeta.createdBy
    ) ? true : false
    const metaDataOfParent = this.editorContentService.getOriginalMeta(this.editorContentService.parentContent)
    if (
      metaDataOfParent.primaryCategory === NsContent.EPrimaryCategory.PROGRAM &&
      contentMeta.primaryCategory !== NsContent.EPrimaryCategory.PROGRAM
    ) {
      this.isEditEnabled = false
    }
    this.setDuration(contentMeta.duration || '0')
    this.filterOrdinals()
    this.changeResourceType()
    this.assignFields()
  }

  createForm() {
    const noSpecialChar = new RegExp(/^[a-zA-Z0-9()$[\]\\.:!''_/ -]*$/)
    this.contentForm = this.formBuilder.group({
      // name: [],
      name: new FormControl('', [Validators.required, Validators.pattern(noSpecialChar), Validators.minLength(10)]),
      purpose: [],
      description: [],
      duration: [],
      instructions: [],
      source: [],
      primaryCategory: [],
      mimeType: [],
      creatorContacts: [],
      license: [],
      keywords: [],
      creatorDetails: [],
    })

    this.contentForm.controls.primaryCategory.valueChanges.subscribe(() => {
      this.changeResourceType()
      this.filterOrdinals()
      this.changeMimeType()
    })

    this.contentForm.valueChanges.pipe(debounceTime(700)).subscribe(() => {
      if (this.canUpdate && !this.contentForm.invalid) {
        this.storeData()
      }
    })

  }

  action(type: string) {
    if (this.canUpdate) {
      this.storeData()
      const updatedData = this.editorContentService.getUpdatedMeta(this.contentMeta.identifier)
      if (updatedData && updatedData.duration) {
        this.setDuration(updatedData.duration)
        this.timeToSeconds()
      }
    }
    this.data.emit(type)
  }

  showError(meta: string) {
    if (
      this.editorContentService.checkCondition(this.contentMeta.identifier, meta, 'required') &&
      !this.editorContentService.isPresent(meta, this.contentMeta.identifier)
    ) {
      if (this.isSubmitPressed) {
        return true
      }
      return false
    }
    return false
  }

  checkCondition(meta: string, type: 'show' | 'required' | 'disabled'): boolean {
    if (type === 'disabled' && !this.isEditEnabled) {
      return true
    }
    return this.editorContentService.checkCondition(this.contentMeta.identifier, meta, type)
  }

  private setDuration(seconds: any) {
    const minutes = seconds > 59 ? Math.floor(seconds / 60) : 0
    const second = seconds % 60
    this.hours = minutes ? (minutes > 59 ? Math.floor(minutes / 60) : 0) : 0
    this.minutes = minutes ? minutes % 60 : 0
    this.seconds = second || 0
  }

  timeToSeconds() {
    if (this.hours < 100 && this.minutes < 60 && this.seconds < 60) {
      let total = 0
      total += this.seconds ? (this.seconds < 60 ? this.seconds : 59) : 0
      total += this.minutes ? (this.minutes < 60 ? this.minutes : 59) * 60 : 0
      total += this.hours ? this.hours * 60 * 60 : 0
      this.contentForm.controls.duration.setValue(JSON.stringify(total))
    } else {
      if (this.hours >= 100) {
        this.hours = 0
      }
      if (this.minutes >= 60) {
        this.minutes = 0
      }
      if (this.seconds >= 60) {
        this.seconds = 0
      }
      this.showTosterMessage('invalidTime')
    }
  }

  filterOrdinals() {
    this.complexityLevelList = []
    this.ordinals.complexityLevel.map((v: any) => {
      if (v.condition) {
        let canAdd = false
          // tslint:disable-next-line: whitespace
          ; (v.condition.showFor || []).map((con: any) => {
            let innerCondition = false
            Object.keys(con).map(meta => {
              if (
                con[meta].indexOf(
                  (this.contentForm.controls[meta] && this.contentForm.controls[meta].value) ||
                  this.contentMeta[meta as keyof NSContent.IContentMeta],
                ) > -1
              ) {
                innerCondition = true
              }
            })
            if (innerCondition) {
              canAdd = true
            }
          })
        if (canAdd) {
          // tslint:disable-next-line: semicolon // tslint:disable-next-line: whitespace
          ; (v.condition.nowShowFor || []).map((con: any) => {
            let innerCondition = false
            Object.keys(con).map(meta => {
              if (
                con[meta].indexOf(
                  (this.contentForm.controls[meta] && this.contentForm.controls[meta].value) ||
                  this.contentMeta[meta as keyof NSContent.IContentMeta],
                ) < 0
              ) {
                innerCondition = true
              }
            })
            if (innerCondition) {
              canAdd = false
            }
          })
        }
        if (canAdd) {
          this.complexityLevelList.push(v.value)
        }
      } else {
        if (typeof v === 'string') {
          this.complexityLevelList.push(v)
        } else {
          this.complexityLevelList.push(v.value)
        }
      }
    })
  }

  changeResourceType() {
    if (this.contentMeta.primaryCategory === NsContent.EPrimaryCategory.RESOURCE) {
      this.resourceTypes = this.ordinals.resourceType || this.ordinals.categoryType || []
    } else {
      this.resourceTypes = this.ordinals['Offering Mode'] || this.ordinals.categoryType || []
    }
  }

  changeMimeType() {
    const artifactUrl = this.contentMeta.artifactUrl
    if (this.contentMeta.primaryCategory === NsContent.EPrimaryCategory.COURSE) {
      this.contentForm.controls.mimeType.setValue('application/vnd.ekstep.content-collection')
    } else {
      this.contentForm.controls.mimeType.setValue('application/html')
      if (
        this.configService.instanceConfig &&
        this.configService.instanceConfig.authoring &&
        this.configService.instanceConfig.authoring.urlPatternMatching
      ) {
        this.configService.instanceConfig.authoring.urlPatternMatching.map(v => {
          if (artifactUrl && artifactUrl.match(v.pattern) && v.allowIframe && v.source === 'youtube') {
            this.contentForm.controls.mimeType.setValue('video/x-youtube')
          }
        })
      }
    }
  }

  assignFields() {
    if (!this.contentForm) {
      this.createForm()
    }
    this.canUpdate = false
    Object.keys(this.contentForm.controls).map(v => {
      try {
        if (v === 'competencies_v3' && (typeof this.contentMeta['competencies_v3'] === 'string')) {
          this.contentMeta['competencies_v3'] = JSON.parse(this.contentMeta['competencies_v3'])
        }
        if (
          this.contentMeta[v as keyof NSContent.IContentMeta] ||
          (this.authInitService.authConfig[v as keyof IFormMeta].type === 'boolean' &&
            this.contentMeta[v as keyof NSContent.IContentMeta] === false)
        ) {
          if (v === 'visibility' && this.contentMeta[v as keyof NSContent.IContentMeta] === 'Private') {
            this.contentForm.controls[v].setValue('Default')
          } else {
            this.contentForm.controls[v].setValue(this.contentMeta[v as keyof NSContent.IContentMeta])
          }
        } else {
          if (v === 'expiryDate') {
            this.contentForm.controls[v].setValue(
              new Date(new Date().setMonth(new Date().getMonth() + 6)),
            )
          } else {
            this.contentForm.controls[v].setValue(
              JSON.parse(
                JSON.stringify(
                  this.authInitService.authConfig[v as keyof IFormMeta].defaultValue[this.contentMeta.primaryCategory][0].value,
                ),
              ),
            )
          }
        }
        if (this.isSubmitPressed) {
          this.contentForm.controls[v].markAsDirty()
          this.contentForm.controls[v].markAsTouched()
        } else {
          this.contentForm.controls[v].markAsPristine()
          this.contentForm.controls[v].markAsUntouched()
        }
      } catch (ex) { }
    })
    if (this.contentForm.controls['source'].value.length === 0
      && this.configService.userProfile) {
      this.contentForm.controls.source.setValue(this.configService.userProfile.departmentName)
    }
    if (this.contentForm.controls['creatorContacts'].value.length === 0 && this.configService.userProfile) {
      const userName = `${this.configService.userProfile.firstName} ${this.configService.userProfile.lastName}`
      this.contentForm.controls.creatorContacts.setValue(
        [{ id: this.configService.userProfile.userId, name: userName, email: this.configService.userProfile.email }])
    } else if (this.contentForm.controls['creatorContacts'].value.length === 1 && this.configService.userProfile) {
      const tempData = this.contentForm.controls['creatorContacts'].value
      tempData.forEach((element: any) => {
        if (this.configService.userProfile && (element.id === this.configService.userProfile.userId) && !element.email) {
          element['email'] = this.configService.userProfile.email
        }
      })
    }
    this.canUpdate = true
    if (this.isSubmitPressed) {
      this.contentForm.markAsDirty()
      this.contentForm.markAsTouched()
    } else {
      this.contentForm.markAsPristine()
      this.contentForm.markAsUntouched()
    }
  }

  storeData() {
    try {
      const originalMeta = this.editorContentService.getOriginalMeta(this.contentMeta.identifier)
      if (originalMeta && this.isEditEnabled) {
        const currentMeta: NSContent.IContentMeta = JSON.parse(JSON.stringify(this.contentForm.value))
        if (originalMeta.mimeType) {
          currentMeta.mimeType = originalMeta.mimeType
        }
        const meta = <any>{}
        Object.keys(currentMeta).map(v => {
          if (
            JSON.stringify(currentMeta[v as keyof NSContent.IContentMeta]) !==
            JSON.stringify(originalMeta[v as keyof NSContent.IContentMeta])
          ) {
            meta[v as keyof NSContent.IContentMeta] = currentMeta[v as keyof NSContent.IContentMeta]
          }
        })
        if (Object.keys(meta).length > 0) {
          Object.keys(meta).forEach(element => {
            if (element === 'keywords') {
              meta[element] = (typeof (meta[element]) === 'string') ? meta[element].split(',') : meta[element]
            }
          })
        }
        this.editorContentService.setUpdatedMeta(meta, this.contentMeta.identifier)
      }
    } catch (ex) {
      this.snackBar.open('Please Save Parent first and refresh page.')
    }
  }

  optionSelected(selectedString: string, type: string) {
    const value: any = (type === 'keyword') ? this.contentForm.controls.keywords.value :
      (type === 'authors') ? this.contentForm.controls.creatorDetails.value : []
    if (selectedString && selectedString.length) {
      if (value.indexOf(selectedString) === -1) {
        value.push(selectedString)
      }
    }
    switch (type) {
      case 'keyword':
        this.keywordsCtrl.setValue(' ')
        this.contentForm.controls.keywords.setValue(value)
        break
      case 'authors':
        this.creatorDetailsCtrl.setValue(' ')
        this.contentForm.controls.creatorDetails.setValue(value)
        break
    }
  }

  addKeyword(event: MatChipInputEvent, type: string): void {
    const input = event.input
    event.value
      .split(/[,]+/)
      .map((val: string) => val.trim())
      .forEach((value: string) => this.optionSelected(value, type))
    input.value = ''
  }

  removeKeyword(keyword: any, type: string): void {
    switch (type) {
      case 'keyword':
        const keywordIndex = this.contentForm.controls.keywords.value.indexOf(keyword)
        this.contentForm.controls.keywords.value.splice(keywordIndex, 1)
        this.contentForm.controls.keywords.setValue(this.contentForm.controls.keywords.value)
        break
      case 'authors':
        const authorIndex = this.contentForm.controls.creatorDetails.value.indexOf(keyword)
        this.contentForm.controls.creatorDetails.value.splice(authorIndex, 1)
        this.contentForm.controls.creatorDetails.setValue(this.contentForm.controls.creatorDetails.value)
        break
    }
  }

  showSaveButton() {
    const metaData = this.editorContentService.getOriginalMeta(this.editorContentService.parentContent)
    if (this.configService.userProfile && this.configService.userProfile.userId === metaData.createdBy) {
      return true
    }
    return false
  }

  saveDataAndProceed() {
    let flag = true
    Object.keys(this.contentForm.controls).forEach((element: any) => {
      if (element !== 'creatorDetails' && element !== 'keywords') {
        if (this.contentForm.controls[element].value === '') {
          this.showTosterMessage('requried')
          flag = false
        } else if (this.contentForm.controls[element].status === 'INVALID') {
          const el = document.getElementById('desTitle')
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
          this.showTosterMessage('invalidValue')
          flag = false
        }
      }
    })
    if (flag) {
      this.storeData()
      this.data.emit('save')
    }
  }
  showTosterMessage(type: string) {
    switch (type) {
      case 'requried':
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.MANDATORY_FIELD_ERROR,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        break
      case 'invalidTime':
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.INVALID_TIME,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        break
      case 'invalidValue':
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.INVALID_VALUE_ENTERED,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        break
    }
  }

}
