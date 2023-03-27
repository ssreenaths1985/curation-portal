// tslint:disable
import { COMMA, ENTER } from '@angular/cdk/keycodes'
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  Inject,
  HostListener,
} from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { MatAutocompleteSelectedEvent } from '@angular/material'
import { MatChipInputEvent } from '@angular/material/chips'
import { MatDialog, MatDialogConfig, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NsContent, VIEWER_ROUTE_FROM_MIME } from '@ws-widget/collection/src/public-api'
import { ConfigurationsService, ValueService } from '@ws-widget/utils'
import { ImageCropComponent } from '@ws-widget/utils/src/public-api'
import { ACTION_CONTENT_V3, CONTENT_BASE_STATIC, CONTENT_BASE_STREAM } from '@ws/author/src/lib/constants/apiEndpoints'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { IMAGE_MAX_SIZE, IMAGE_SUPPORT_TYPES } from '@ws/author/src/lib/constants/upload'
import { NSContent } from '@ws/author/src/lib/interface/content'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { EditorContentService } from '@ws/author/src/lib/routing/modules/editor/services/editor-content.service'
import { EditorService } from '@ws/author/src/lib/routing/modules/editor/services/editor.service'
import { Observable, of, Subscription } from 'rxjs'
// import { InterestService } from '../../../../../../../../../app/src/lib/routes/profile/routes/interest/services/interest.service'
import { UploadService } from '../../services/upload.service'
import { CatalogSelectComponent } from '../catalog-select/catalog-select.component'
import { IFormMeta } from '@ws/author/src/lib/interface/form'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { AuthInitService } from '@ws/author/src/lib/services/init.service'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { CompetencyAddPopUpComponent } from '../competency-add-popup/competency-add-popup'
import { ApiService } from '@ws/author/src/lib/modules/shared/services/api.service'
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  // startWith,
  switchMap,
  map,
  startWith,
} from 'rxjs/operators'
import { CompetenceService } from '../../services/competence.service'
import { NSCompetencie } from '../../../../../../interface/competencies.model'
import { CompetenceViewComponent } from './competencies-view/competencies-view.component'
import { AddThumbnailComponent } from '../../../shared/components/add-thumbnail/add-thumbnail.component'

// import { NsWidgetResolver } from '@ws-widget/resolver'
// import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper'
/* tslint:disable */
import _ from 'lodash'
import { NSApiRequest } from '../../../../../../interface/apiRequest'
import { NSApiResponse } from '../../../../../../interface/apiResponse'
import { environment } from '../../../../../../../../../../../src/environments/environment'
/* tslint:enable */
export interface IUsersData {
  name?: string
  id: string
  srclang: string
  languages: any[]
}

@Component({
  selector: 'ws-auth-edit-meta',
  templateUrl: './edit-meta.component.html',
  styleUrls: ['./edit-meta.component.scss'],
  // providers: [{
  //   provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false },
  // }],
})
export class EditMetaComponent implements OnInit, OnDestroy, AfterViewInit {
  contentMeta!: NSContent.IContentMeta
  @Output() data = new EventEmitter<string>()
  @Input() isSubmitPressed = false
  @Input() nextAction = 'done'
  @Input() stage = 1
  @Input() type = ''
  /**for side nav */
  sideNavBarOpened = true
  widgetDataa!: any
  private defaultSideNavBarOpenedSubscription: any
  public screenSizeIsLtMedium = false
  isLtMedium$ = this.valueSvc.isLtMedium$
  mode$ = this.isLtMedium$.pipe(map(isMedium => (isMedium ? 'over' : 'side')))
  /**for side nav: END */
  /**for side competency */
  searchKey = ''
  selectedId = ''
  specialCharList = `( a/A-z/Z, 0-9 . - _ $ / \ : [ ]' ' !)`
  filteredCompetencies!: NSCompetencie.ICompetencie[]
  queryControl = new FormControl('')
  allCompetencies!: any
  /**for side competency: END */
  location = CONTENT_BASE_STATIC
  display = 'none'
  selectable = true
  specialCharListMsg = false
  removable = true
  addOnBlur = true
  addConcepts = false
  isFileUploaded = false
  fileUploadForm!: FormGroup
  creatorContactsCtrl!: FormControl
  trackContactsCtrl!: FormControl
  publisherDetailsCtrl!: FormControl
  editorsCtrl!: FormControl
  creatorDetailsCtrl!: FormControl
  audienceCtrl!: FormControl
  jobProfileCtrl!: FormControl
  regionCtrl!: FormControl
  accessPathsCtrl!: FormControl
  keywordsCtrl!: FormControl
  competencyCtrl!: FormControl
  contentForm!: FormGroup
  selectedSkills: string[] = []
  canUpdate = true
  ordinals!: any
  providerList!: any
  resourceTypes: string[] = []
  employeeList: any[] = []
  audienceList: any[] = []
  jobProfileList: any[] = []
  regionList: any[] = []
  accessPathList: any[] = []
  competencyValue: any[] = []
  infoType = ''
  fetchTagsStatus: 'done' | 'fetching' | null = null
  readonly separatorKeysCodes: number[] = [ENTER, COMMA]
  selectedIndex = 0
  hours = 0
  minutes = 0
  seconds = 0
  @Input() parentContent: string | null = null
  routerSubscription!: Subscription
  imageTypes = IMAGE_SUPPORT_TYPES
  canExpiry = true
  showMoreGlance = false
  complexityLevelList: string[] = []
  isEditEnabled = false
  banners = [{ color: '#003F5C', isDefault: false }, { color: '#59468B', isDefault: false },
  { color: '#185F49', isDefault: false }, { color: '#126489', isDefault: false }]

  workFlow = [{ isActive: true, isCompleted: false, name: 'Basic Details', step: 0 },
  { isActive: false, isCompleted: false, name: 'Classification', step: 1 },
  { isActive: false, isCompleted: false, name: 'Intended for', step: 2 }]

  allLanguages: any[] = []

  selectedCatalogList: string[] = []

  file?: File

  @ViewChild('creatorContactsView', { static: false }) creatorContactsView!: ElementRef
  @ViewChild('trackContactsView', { static: false }) trackContactsView!: ElementRef
  @ViewChild('publisherDetailsView', { static: false }) publisherDetailsView!: ElementRef
  @ViewChild('editorsView', { static: false }) editorsView!: ElementRef
  @ViewChild('creatorDetailsView', { static: false }) creatorDetailsView!: ElementRef
  @ViewChild('audienceView', { static: false }) audienceView!: ElementRef
  @ViewChild('jobProfileView', { static: false }) jobProfileView!: ElementRef
  @ViewChild('regionView', { static: false }) regionView!: ElementRef
  @ViewChild('accessPathsView', { static: false }) accessPathsView!: ElementRef
  @ViewChild('keywordsSearch', { static: false }) keywordsSearch!: ElementRef<any>
  @ViewChild('competencyView', { static: true }) competencyView!: ElementRef<any>

  timer: any

  filteredOptions$: Observable<string[]> = of([])
  competencyOptions$: Observable<any[]> = of([])
  @ViewChild('stickyMenu', { static: true }) menuElement!: ElementRef
  elementPosition: any
  sticky = false

  @HostListener('window:scroll', ['$event'])
  handleScroll() {
    const windowScroll = window.pageYOffset
    if (windowScroll >= this.elementPosition - 100) {
      this.sticky = true
    } else {
      this.sticky = false
    }
  }
  constructor(
    private valueSvc: ValueService,
    private formBuilder: FormBuilder,
    private uploadService: UploadService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private editorService: EditorService,
    private contentService: EditorContentService,
    private configSvc: ConfigurationsService,
    private ref: ChangeDetectorRef,
    private comptncySvc: CompetenceService,
    private loader: LoaderService,
    private authInitService: AuthInitService,
    private accessService: AccessControlService,
    private apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) public data1: IUsersData,
  ) {
    // console.log("Parent component", this.parentContent)
    this.updateLeftMenus()
  }
  updateLeftMenus() {
    this.widgetDataa = {
      widgetType: 'menus',
      widgetSubType: 'leftMenu',
      widgetData: {
        logo: false,
        menus: [
          {
            name: 'Overview',
            key: 'basic-information',
            fragment: true,
            render: true,
            enabled: true,
            customRouting: false,
            routerLink: 'basic-information',
          },
          {
            name: 'Classification',
            key: 'classification',
            fragment: true,
            render: true,
            enabled: true,
            customRouting: false,
            routerLink: 'classification',
          },
          {
            name: 'Competencies',
            key: 'competencies',
            fragment: true,
            render: true,
            enabled: true,
            customRouting: false,
            routerLink: 'competencies',
          },
          {
            name: 'Intended for',
            key: 'intended-for',
            fragment: true,
            render: true,
            enabled: true,
            customRouting: false,
            routerLink: 'intended-for',
          },
          {
            name: 'Stakeholders',
            key: 'stakeholders',
            fragment: true,
            render: true,
            enabled: true,
            customRouting: false,
            routerLink: 'stakeholders',
          },
        ],
      },
    }
  }

  openDialog(type: string) {

    const dialogConfig = new MatDialogConfig()
    const dialogRef = this.dialog.open(AddThumbnailComponent, dialogConfig)
    const instance = dialogRef.componentInstance
    instance.isUpdate = true
    dialogRef.afterClosed().subscribe(data => {
      // this.data = data
      if (data && data.appURL) {
        if (type === 'appIcon') {
          this.contentForm.controls.appIcon.setValue(this.generateUrl(data.appURL))
          this.contentForm.controls.posterImage.setValue(this.generateUrl(data.appURL))
          this.canUpdate = true
        }
        if (type === 'cbpProviderImage') {
          this.contentForm.controls.creatorLogo.setValue(this.generateUrl(data.appURL))
          this.canUpdate = true
        }
        this.storeData()
      } else if (data && data.file) {
        this.uploadAppIcon(data.file, type)
      }
    })
  }

  ngAfterViewInit() {
    this.ref.detach()
    // this.elementPosition = this.menuElement.nativeElement.parentElement.offsetTop
    this.timer = setInterval(() => {
      this.ref.detectChanges()
      // tslint:disable-next-line: align
    }, 100)
  }

  jsonVerify(s: string) { try { JSON.parse(s); return true } catch (e) { return false } }

  ngOnInit() {
    this.refreshData()
    this.sidenavSubscribe()
    this.typeCheck()
    this.ordinals = this.authInitService.ordinals
    this.providerList = this.authInitService.providerList
    this.ordinals.licenses = ['CC BY-NC-SA 4.0', 'Standard YouTube License', 'CC BY-NC 4.0', 'CC BY-SA 4.0', 'CC BY 4.0']
    this.audienceList = this.ordinals.audience
    this.jobProfileList = this.ordinals.jobProfile
    this.complexityLevelList = this.ordinals.audience

    this.creatorContactsCtrl = new FormControl()
    this.trackContactsCtrl = new FormControl()
    this.publisherDetailsCtrl = new FormControl()
    this.editorsCtrl = new FormControl()
    this.creatorDetailsCtrl = new FormControl()
    this.keywordsCtrl = new FormControl('')
    this.competencyCtrl = new FormControl('')

    this.audienceCtrl = new FormControl()
    this.jobProfileCtrl = new FormControl()
    this.regionCtrl = new FormControl()
    this.accessPathsCtrl = new FormControl()
    this.accessPathsCtrl.disable()

    this.creatorContactsCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter(val => typeof val === 'string'),
        switchMap((value: string) => {
          if (typeof value === 'string' && value) {
            this.employeeList = <any[]>[]
            this.fetchTagsStatus = 'fetching'
            return this.editorService.fetchEmployeeList(value)
          }
          return of([])
        }),
      )
      .subscribe(
        users => {
          this.employeeList = users || <string[]>[]
          this.fetchTagsStatus = 'done'
        },
        () => {
          this.fetchTagsStatus = 'done'
        },
      )

    this.trackContactsCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter(val => typeof val === 'string'),
        switchMap((value: string) => {
          if (typeof value === 'string' && value) {
            this.employeeList = <any[]>[]
            this.fetchTagsStatus = 'fetching'
            return this.editorService.fetchEmployeeList(value, 'CONTENT_REVIEWER')
          }
          return of([])
        }),
      )
      .subscribe(
        users => {
          this.employeeList = users || <string[]>[]
          this.fetchTagsStatus = 'done'
        },
        () => {
          this.fetchTagsStatus = 'done'
        },
      )

    this.publisherDetailsCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter(val => typeof val === 'string'),
        switchMap((value: string) => {
          if (typeof value === 'string' && value) {
            this.employeeList = <any[]>[]
            this.fetchTagsStatus = 'fetching'
            return this.editorService.fetchEmployeeList(value, 'CONTENT_PUBLISHER')
          }
          return of([])
        }),
      )
      .subscribe(
        users => {
          this.employeeList = users || <string[]>[]
          this.fetchTagsStatus = 'done'
        },
        () => {
          this.fetchTagsStatus = 'done'
        },
      )

    this.editorsCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter(val => typeof val === 'string'),
        switchMap((value: string) => {
          if (typeof value === 'string' && value) {
            this.employeeList = <any[]>[]
            this.fetchTagsStatus = 'fetching'
            return this.editorService.fetchEmployeeList(value)
          }
          return of([])
        }),
      )
      .subscribe(
        users => {
          this.employeeList = users || <string[]>[]
          this.fetchTagsStatus = 'done'
        },
        () => {
          this.fetchTagsStatus = 'done'
        },
      )

    this.creatorDetailsCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter(val => typeof val === 'string'),
        switchMap((value: string) => {
          if (typeof value === 'string' && value) {
            this.employeeList = <any[]>[]
            this.fetchTagsStatus = 'fetching'
            return this.editorService.fetchEmployeeList(value, 'ANY_ROLE')
          }
          return of([])
        }),
      )
      .subscribe(
        users => {
          this.employeeList = users || <string[]>[]
          this.fetchTagsStatus = 'done'
        },
        () => {
          this.fetchTagsStatus = 'done'
        },
      )

    this.audienceCtrl.valueChanges.subscribe(() => this.fetchAudience())

    this.jobProfileCtrl.valueChanges.subscribe(() => this.fetchJobProfile())

    this.regionCtrl.valueChanges
      .pipe(
        debounceTime(400),
        filter(v => v),
      )
      .subscribe(() => this.fetchRegion())

    this.accessPathsCtrl.valueChanges.pipe(
      debounceTime(400),
      filter(v => v),
    ).subscribe(() => this.fetchAccessRestrictions())

    this.contentService.changeActiveCont.subscribe(data => {
      if (this.contentMeta && this.canUpdate) {
        this.storeData()
      }
      this.content = this.contentService.getUpdatedMeta(data)
    })
    // this.filteredOptions$ = this.keywordsCtrl.valueChanges.pipe(
    //   startWith(this.keywordsCtrl.value),
    //   debounceTime(500),
    //   distinctUntilChanged(),
    //   switchMap(value => this.interestSvc.fetchAutocompleteInterestsV2(value)),
    // )
    this.competencyOptions$ = this.competencyCtrl.valueChanges.pipe(
      startWith(this.competencyCtrl.value),
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(value => this.comptncySvc.fetchAutocompleteCompetencyV2(value)),
    )

    this.allLanguages = this.data1.languages
  }
  sidenavSubscribe() {
    this.defaultSideNavBarOpenedSubscription = this.isLtMedium$.subscribe(isLtMedium => {
      this.sideNavBarOpened = !isLtMedium
      this.screenSizeIsLtMedium = isLtMedium
    })
  }
  start() {
    const dialogRef = this.dialog.open(CompetencyAddPopUpComponent, {
      minHeight: 'auto',
      width: '80%',
      panelClass: 'remove-pad',
    })
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response === 'postCreated') {
        // this.refreshData(this.currentActivePage)
      }
    })
  }
  typeCheck() {
    if (this.type) {
      let dataName = ''
      switch (this.type) {
        case 'URL':
          dataName = 'Attach Link'
          break
        case 'UPLOAD':
          dataName = 'Upload'
          break
        case 'ASSE':
          dataName = 'Assessment'
          break
        case 'WEB':
          dataName = 'Web Pages'
          break

        default:
          break
      }
      if (dataName) {
        this.workFlow.push({
          isActive: false,
          isCompleted: true,
          name: dataName,
          step: -1,
        })
      }
    }
  }

  optionSelected(keyword: string) {
    this.keywordsCtrl.setValue(' ')
    this.keywordsSearch.nativeElement.blur()
    if (keyword && keyword.length) {
      const value = this.contentForm.controls.keywords.value || []
      if (value.indexOf(keyword) === -1) {
        value.push(keyword)
        this.contentForm.controls.keywords.setValue(value)
      }
    }
  }

  canPush(arr: any[], obj: any) {
    for (const test of arr) {
      if (test.id === obj.id) {
        return false
      }
    }
    return true

  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe()
    }
    if (this.defaultSideNavBarOpenedSubscription) {
      this.defaultSideNavBarOpenedSubscription.unsubscribe()
    }
    this.loader.changeLoad.next(false)
    this.ref.detach()
    clearInterval(this.timer)
  }
  // customStepper() {
  //   this.data.emit("next")
  // if (step >= 0) {
  //   if (this.selectedIndex !== step) {
  //     this.selectedIndex = step
  //     const oldStrip = this.workFlow.find(i => i.isActive)

  //     this.workFlow[step].isActive = true
  //     this.workFlow[step].isCompleted = false
  //     if (oldStrip && oldStrip.step >= 0) {
  //       this.workFlow[oldStrip.step].isActive = false
  //       this.workFlow[oldStrip.step].isCompleted = true
  //     }
  //   }
  // } else {
  //   this.data.emit('back')
  // }
  // }
  private set content(contentMeta: NSContent.IContentMeta) {
    this.contentMeta = contentMeta
    this.isEditEnabled = (this.configSvc.userProfile && this.configSvc.userProfile.userId === contentMeta.createdBy) ? true : false
    // this.contentMeta.name = contentMeta.name === 'Untitled Content' ? '' : contentMeta.name
    // this.contentMeta.name = contentMeta.name
    // if (!this.contentMeta.posterImage) {
    //   this.contentMeta.posterImage = this.banners[0].color
    // }
    const metaDataOfParent = this.contentService.getOriginalMeta(this.contentService.parentContent)
    if (
      metaDataOfParent.primaryCategory === NsContent.EPrimaryCategory.PROGRAM &&
      contentMeta.primaryCategory !== NsContent.EPrimaryCategory.PROGRAM
    ) {
      this.isEditEnabled = false
    }
    if (this.contentMeta.creatorContacts && typeof this.contentMeta.creatorContacts === 'string') {
      this.contentMeta.creatorContacts = this.jsonVerify(this.contentMeta.creatorContacts) ?
        JSON.parse(this.contentMeta.creatorContacts) : this.contentMeta.creatorContacts
    }
    if (this.contentMeta.reviewer && typeof this.contentMeta.reviewer === 'string') {
      this.contentMeta.trackContacts = this.jsonVerify(this.contentMeta.reviewer) ?
        JSON.parse(this.contentMeta.reviewer) : this.contentMeta.reviewer
    }
    if (this.contentMeta.creatorDetails && typeof this.contentMeta.creatorDetails === 'string') {
      this.contentMeta.creatorDetails = this.jsonVerify(this.contentMeta.creatorDetails) ?
        JSON.parse(this.contentMeta.creatorDetails) : this.contentMeta.creatorDetails
    }
    if (this.contentMeta.publisherDetails && typeof this.contentMeta.publisherDetails === 'string') {
      this.contentMeta.publisherDetails = this.jsonVerify(this.contentMeta.publisherDetails) ?
        JSON.parse(this.contentMeta.publisherDetails) : this.contentMeta.publisherDetails
    }
    // if (!this.contentMeta.draftImage) {
    //   this.contentMeta.draftImage = this.banners[0].color
    // }
    // this.contentMeta.posterImage = contentMeta.posterImage
    this.canExpiry = this.contentMeta.expiryDate !== '99991231T235959+0000'
    if (this.canExpiry) {
      this.contentMeta.expiryDate =
        contentMeta.expiryDate && contentMeta.expiryDate.indexOf('+') === 15
          ? <any>this.convertToISODate(contentMeta.expiryDate)
          : ''
    }

    this.assignFields()
    this.calculateChildDuration(contentMeta)
    this.filterOrdinals()
    this.changeResourceType()
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

  assignExpiryDate() {
    this.canExpiry = !this.canExpiry
    this.contentForm.controls.expiryDate.setValue(
      this.canExpiry
        ? new Date(new Date().setMonth(new Date().getMonth() + 6))
        : '99991231T235959+0000',
    )
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
                  this.authInitService.authConfig[v as keyof IFormMeta].defaultValue[
                    this.contentMeta.primaryCategory
                    // tslint:disable-next-line: ter-computed-property-spacing
                  ][0].value,
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
    if (this.contentForm.controls['source'].value.length === 0 && this.configSvc.userProfile) {
      this.contentForm.controls.source.setValue(this.configSvc.userProfile.departmentName)
    }
    if (this.contentForm.controls['creatorContacts'].value.length === 0 && this.configSvc.userProfile) {
      const userName = `${this.configSvc.userProfile.firstName} ${this.configSvc.userProfile.lastName}`
      this.contentForm.controls.creatorContacts.setValue(
        [{ id: this.configSvc.userProfile.userId, name: userName, email: this.configSvc.userProfile.email }])
    } else if (this.contentForm.controls['creatorContacts'].value.length === 1 && this.configSvc.userProfile) {
      this.contentForm.controls['creatorContacts'].value.forEach((element: any) => {
        if (this.configSvc.userProfile && (element.id === this.configSvc.userProfile.userId) && !element.email) {
          element['email'] = this.configSvc.userProfile.email
        }
      })
    }
    if (this.contentMeta.catalogPaths && this.contentMeta.catalogPaths.length > 0) {
      this.selectedCatalogList = this.contentMeta.catalogPaths
    } else {
      this.selectedCatalogList = []
    }
    this.canUpdate = true
    this.storeData()
    if (this.isSubmitPressed) {
      this.contentForm.markAsDirty()
      this.contentForm.markAsTouched()
    } else {
      this.contentForm.markAsPristine()
      this.contentForm.markAsUntouched()
    }
  }

  convertToISODate(date = ''): Date {
    try {
      return new Date(
        `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}${date.substring(
          8,
          11,
        )}:${date.substring(11, 13)}:${date.substring(13, 15)}.000Z`,
      )
    } catch (ex) {
      return new Date(new Date().setMonth(new Date().getMonth() + 6))
    }
  }

  changeMimeType() {
    const artifactUrl = this.contentForm.controls.artifactUrl.value
    if (this.contentForm.controls.contentType.value === 'Course') {
      this.contentForm.controls.mimeType.setValue('application/vnd.ekstep.content-collection')
    } else {
      this.contentForm.controls.mimeType.setValue('application/html')
      if (
        this.configSvc.instanceConfig &&
        this.configSvc.instanceConfig.authoring &&
        this.configSvc.instanceConfig.authoring.urlPatternMatching
      ) {
        this.configSvc.instanceConfig.authoring.urlPatternMatching.map(v => {
          if (artifactUrl && artifactUrl.match(v.pattern) && v.allowIframe && v.source === 'youtube') {
            this.contentForm.controls.mimeType.setValue('video/x-youtube')
          }
        })
      }
    }
  }

  changeResourceType() {
    if (this.contentForm.controls.contentType.value === 'Resource') {
      this.resourceTypes = this.ordinals.resourceType || this.ordinals.categoryType || []
    } else {
      this.resourceTypes = this.ordinals['Offering Mode'] || this.ordinals.categoryType || []
    }

    // if (this.resourceTypes.indexOf(this.contentForm.controls.categoryType.value) < 0) {
    //   this.contentForm.controls.resourceType.setValue('')
    // }
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
      this.contentForm.controls.duration.setValue(total)
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
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.INVALID_TIME,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
    }
  }

  showInfo(type: string) {
    this.infoType = this.infoType === type ? '' : type
  }

  storeData() {
    try {
      const originalMeta = this.contentService.getUpdatedMeta(this.contentMeta.identifier)
      if (originalMeta && this.isEditEnabled) {
        // const expiryDate = this.contentForm.value.expiryDate
        const currentMeta: NSContent.IContentMeta = JSON.parse(JSON.stringify(this.contentForm.value))
        if (originalMeta.mimeType) {
          currentMeta.mimeType = originalMeta.mimeType
        }
        // if (currentMeta) {
        //   currentMeta.duration = currentMeta.duration + ''
        // }
        const meta = <any>{}
        // if (this.canExpiry) {
        //   currentMeta.expiryDate = `${expiryDate
        //     .toISOString()
        //     .replace(/-/g, '')
        //     .replace(/:/g, '')
        //     .split('.')[0]
        //     }+0000`
        // }
        Object.keys(currentMeta).map(v => {
          if (
            v !== 'versionKey' &&
            JSON.stringify(currentMeta[v as keyof NSContent.IContentMeta]) !==
            JSON.stringify(originalMeta[v as keyof NSContent.IContentMeta])
          ) {
            if (
              currentMeta[v as keyof NSContent.IContentMeta] ||
              (this.authInitService.authConfig[v as keyof IFormMeta].type === 'boolean' &&
                currentMeta[v as keyof NSContent.IContentMeta] === false)
            ) {
              meta[v as keyof NSContent.IContentMeta] = currentMeta[v as keyof NSContent.IContentMeta]
            } else {
              meta[v as keyof NSContent.IContentMeta] = JSON.parse(
                JSON.stringify(
                  this.authInitService.authConfig[v as keyof IFormMeta].defaultValue[
                    originalMeta.primaryCategory
                    // tslint:disable-next-line: ter-computed-property-spacing
                  ][0].value,
                ),
              )
            }
          } else if (v === 'versionKey') {
            meta[v as keyof NSContent.IContentMeta] = originalMeta[v as keyof NSContent.IContentMeta]
          }
        })
        this.contentService.setUpdatedMeta(meta, this.contentMeta.identifier)
      }
    } catch (ex) {
      this.snackBar.open('Please Save Parent first and refresh page.')
    }
  }

  updateContentService(meta: string, value: any, event = false) {
    this.contentForm.controls[meta].setValue(value, { events: event })
    this.contentService.setUpdatedMeta({ [meta]: value } as any, this.contentMeta.identifier)
  }

  // formNext() {
  //   // this.selectedIndex = index
  //   this.customStepper()
  // }

  addKeyword(event: MatChipInputEvent): void {
    const input = event.input
    event.value
      .split(/[,]+/)
      .map((val: string) => val.trim())
      .forEach((value: string) => this.optionSelected(value))
    input.value = ''
  }

  addReferences(event: MatChipInputEvent): void {
    const input = event.input
    const value = event.value

    // Add our fruit
    if ((value || '').trim().length) {
      const oldArray = this.contentForm.controls.references.value || []
      oldArray.push({ title: '', url: value })
      this.contentForm.controls.references.setValue(oldArray)
    }

    // Reset the input value
    if (input) {
      input.value = ''
    }
  }

  removeKeyword(keyword: any): void {
    const index = this.contentForm.controls.keywords.value.indexOf(keyword)
    this.contentForm.controls.keywords.value.splice(index, 1)
    this.contentForm.controls.keywords.setValue(this.contentForm.controls.keywords.value)
  }
  removeReferences(index: number): void {
    this.contentForm.controls.references.value.splice(index, 1)
    this.contentForm.controls.references.setValue(this.contentForm.controls.references.value)
  }

  compareSkillFn(value1: { identifier: string }, value2: { identifier: string }) {
    return value1 && value2 ? value1.identifier === value2.identifier : value1 === value2
  }

  addCreatorDetails(event: MatChipInputEvent): void {
    const input = event.input
    const value = (event.value || '').trim()
    if (value) {
      this.contentForm.controls.creatorDetails.value.push({ id: '', name: value })
      this.contentForm.controls.creatorDetails.setValue(
        this.contentForm.controls.creatorDetails.value,
      )
    }
    // Reset the input value
    if (input) {
      input.value = ''
    }
  }

  removeCreatorDetails(keyword: any): void {
    const index = this.contentForm.controls.creatorDetails.value.indexOf(keyword)
    this.contentForm.controls.creatorDetails.value.splice(index, 1)
    this.contentForm.controls.creatorDetails.setValue(
      this.contentForm.controls.creatorDetails.value,
    )
  }

  addToFormControl(event: MatAutocompleteSelectedEvent, fieldName: string): void {
    const value = (event.option.value || '').trim()
    if (value && this.contentForm.controls[fieldName].value.indexOf(value) === -1) {
      this.contentForm.controls[fieldName].value.push(value)
      this.contentForm.controls[fieldName].setValue(this.contentForm.controls[fieldName].value)
    }

    this[`${fieldName}View` as keyof EditMetaComponent].nativeElement.value = ''
    this[`${fieldName}Ctrl` as keyof EditMetaComponent].setValue(null)
  }

  removeFromFormControl(keyword: any, fieldName: string): void {
    const index = this.contentForm.controls[fieldName].value.indexOf(keyword)
    this.contentForm.controls[fieldName].value.splice(index, 1)
    this.contentForm.controls[fieldName].setValue(this.contentForm.controls[fieldName].value)
  }

  conceptToggle() {
    this.addConcepts = !this.addConcepts
  }

  uploadAppIcon(file: File, type: string) {
    if (!file) {
      return
    }
    const formdata = new FormData()
    const fileName = (file ? file.name || this.contentMeta.identifier :
      (this.contentMeta.identifier || (new Date()).toString())).replace(/[^A-Za-z0-9.]/g, '')
    if (
      !(
        IMAGE_SUPPORT_TYPES.indexOf(
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

    const dialogRef = this.dialog.open(ImageCropComponent, {
      width: '70%',
      data: {
        isRoundCrop: false,
        imageFile: file,
        width: (type === 'appIcon') ? 265 : (type === 'cbpProviderImage') ? 72 : 0,
        height: (type === 'appIcon') ? 150 : (type === 'cbpProviderImage') ? 72 : 0,
        isThumbnail: true,
        imageFileName: fileName,
      },
    })

    dialogRef.afterClosed().subscribe({
      next: (result: File) => {
        if (result) {
          formdata.append('content', result, fileName)
          this.loader.changeLoad.next(true)

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
                mimeType: 'image/png',
                mediaType: 'image',
                name: fileName,
                language: ['English'],
                license: 'CC BY 4.0',
                primaryCategory: 'Asset',
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
                        const updateArtf: NSApiRequest.IUpdateImageMetaRequestV2 = {
                          request: {
                            content: {
                              // content_url: data.result.artifactUrl,
                              // identifier: data.result.identifier,
                              // node_id: data.result.node_id,
                              artifactUrl: this.generateUrl(data.result.artifactUrl),
                              versionKey: (new Date()).getTime().toString(),
                            },
                          },
                        }
                        this.apiService
                          .patch<NSApiRequest.ICreateMetaRequest>(
                            `${ACTION_CONTENT_V3}update/${data.result.identifier}`,
                            updateArtf,
                          )
                          .subscribe(
                            (meta1: NSApiResponse.IContentCreateResponseV2) => {
                              if (meta1) {
                              }
                              this.loader.changeLoad.next(false)
                              this.canUpdate = false
                              if (type === 'appIcon') {
                                this.contentForm.controls.appIcon.setValue(this.generateUrl(data.result.artifactUrl))
                                this.contentForm.controls.posterImage.setValue(this.generateUrl(data.result.artifactUrl))
                                this.canUpdate = true
                                this.storeData()
                              }
                              if (type === 'cbpProviderImage') {
                                this.contentForm.controls.creatorLogo.setValue(this.generateUrl(data.result.artifactUrl))
                                this.canUpdate = true
                                this.storeData()
                              }
                              this.snackBar.openFromComponent(NotificationComponent, {
                                data: {
                                  type: Notify.UPLOAD_SUCCESS,
                                },
                                duration: NOTIFICATION_TIME * 1000,
                              })
                            })
                      }
                    },
                    () => {
                      this.loader.changeLoad.next(false)
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
      },
    })
  }
  uploadSourceIcon(file: File) {
    const formdata = new FormData()
    const fileName = file.name.replace(/[^A-Za-z0-9.]/g, '')
    if (
      !(
        IMAGE_SUPPORT_TYPES.indexOf(
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

    const dialogRef = this.dialog.open(ImageCropComponent, {
      width: '70%',
      data: {
        isRoundCrop: false,
        imageFile: file,
        width: 72,
        height: 72,
        isThumbnail: true,
        imageFileName: fileName,
      },
    })

    dialogRef.afterClosed().subscribe({
      next: (result: File) => {
        if (result) {
          formdata.append('content', result, fileName)
          this.loader.changeLoad.next(true)
          this.uploadService
            .upload(formdata, {
              contentId: this.contentMeta.identifier,
              contentType: CONTENT_BASE_STATIC,
            })
            .subscribe(
              data => {
                if (data.result) {
                  this.loader.changeLoad.next(false)
                  this.canUpdate = false
                  this.contentForm.controls.creatorLogo.setValue(data.result.artifactUrl)
                  this.contentForm.controls.creatorPosterImage.setValue(data.result.artifactUrl)
                  this.canUpdate = true
                  this.storeData()
                  this.snackBar.openFromComponent(NotificationComponent, {
                    data: {
                      type: Notify.UPLOAD_SUCCESS,
                    },
                    duration: NOTIFICATION_TIME * 1000,
                  })
                }
              },
              () => {
                this.loader.changeLoad.next(false)
                this.snackBar.openFromComponent(NotificationComponent, {
                  data: {
                    type: Notify.UPLOAD_FAIL,
                  },
                  duration: NOTIFICATION_TIME * 1000,
                })
              },
            )
        }
      },
    })
  }
  changeToDefaultImg($event: any) {
    $event.target.src = this.configSvc.instanceConfig
      ? this.configSvc.instanceConfig.logos.defaultContent
      : ''
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
  showError(meta: string) {
    if (
      this.contentService.checkCondition(this.contentMeta.identifier, meta, 'required') &&
      !this.contentService.isPresent(meta, this.contentMeta.identifier)
    ) {
      if (this.isSubmitPressed) {
        return true
      }
      if (this.contentForm.controls[meta] && this.contentForm.controls[meta].touched) {
        return true
      }
      return false
    }
    return false
  }

  removeEmployee(employee: NSContent.IAuthorDetails, field: string): void {
    const index = this.contentForm.controls[field].value.indexOf(employee)
    this.contentForm.controls[field].value.splice(index, 1)
    this.contentForm.controls[field].setValue(this.contentForm.controls[field].value)
  }

  // logs(avl: any) {
  //   // console.log(avl)
  // }
  addEmployee(event: MatAutocompleteSelectedEvent, field: string) {
    if (event.option.value && event.option.value.id) {
      this.loader.changeLoad.next(true)
      const observable = ['trackContacts', 'publisherDetails'].includes(field) &&
        this.accessService.authoringConfig.doUniqueCheck
        ? this.editorService
          .checkRole(event.option.value.id)
          .pipe(
            map(
              (v: string[]) =>
                v.includes('admin') ||
                v.includes('editor') ||
                (field === 'trackContacts' && v.includes('reviewer')) ||
                (field === 'publisherDetails' && v.includes('publisher')) ||
                (field === 'publisherDetails' && event.option.value.id === this.accessService.userId),
            ),
          )
        : of(true)
      observable.subscribe(
        (data: boolean) => {
          const creatorData = this.contentForm.controls['creatorContacts'].value
          const flagCheck = creatorData.filter((v: any) => v.id === event.option.value.id)
          if ((field === 'trackContacts' || field === 'publisherDetails') && flagCheck && flagCheck.length > 0) {
            this.snackBar.openFromComponent(NotificationComponent, {
              data: {
                type: Notify.CANNOT_BE_CURATOR,
              },
              duration: NOTIFICATION_TIME * 1000,
            })
          } else {
            if (data) {
              this.contentForm.controls[field].value.push({
                id: event.option.value.id,
                name: event.option.value.displayName,
                email: event.option.value.mail,
              })
              this.contentForm.controls[field].setValue(this.contentForm.controls[field].value)
              this.employeeList = <any[]>[]
              this.fetchTagsStatus = null
            } else {
              this.snackBar.openFromComponent(NotificationComponent, {
                data: {
                  type: Notify.NO_ROLE,
                },
                duration: NOTIFICATION_TIME * 1000,
              })
            }
          }
          this[`${field}View` as keyof EditMetaComponent].nativeElement.value = ''
          this[`${field}Ctrl` as keyof EditMetaComponent].setValue(null)
        },
        () => {
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.FAIL,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
        },
        () => {
          this.loader.changeLoad.next(false)
          this[`${field}View` as keyof EditMetaComponent].nativeElement.value = ''
          this[`${field}Ctrl` as keyof EditMetaComponent].setValue(null)
        },
      )
    }
  }

  removeField(event: MatChipInputEvent) {
    // Reset the input value
    if (event.input) {
      event.input.value = ''
    }
  }

  private fetchAudience() {
    if ((this.audienceCtrl.value || '').trim()) {
      this.audienceList = this.ordinals.audience.filter(
        (v: any) => v.toLowerCase().indexOf(this.audienceCtrl.value.toLowerCase()) > -1,
      )
    } else {
      this.audienceList = this.ordinals.audience.slice()
    }
  }

  private fetchJobProfile() {
    if ((this.jobProfileCtrl.value || '').trim()) {
      this.jobProfileList = this.ordinals.jobProfile.filter(
        (v: any) => v.toLowerCase().indexOf(this.jobProfileCtrl.value.toLowerCase()) > -1,
      )
    } else {
      this.jobProfileList = this.ordinals.jobProfile.slice()
    }
  }

  private fetchRegion() {
    if ((this.regionCtrl.value || '').trim()) {
      this.regionList = this.ordinals.region.filter(
        (v: any) => v.toLowerCase().indexOf(this.regionCtrl.value.toLowerCase()) > -1,
      )
    } else {
      this.regionList = []
    }
  }

  private fetchAccessRestrictions() {
    if (this.accessPathsCtrl.value.trim()) {
      this.accessPathList = this.ordinals.accessPaths.filter((v: any) => v.toLowerCase().
        indexOf(this.accessPathsCtrl.value.toLowerCase()) === 0)
    } else {
      this.accessPathList = this.ordinals.accessPaths.slice()
    }
  }

  checkCondition(meta: string, type: 'show' | 'required' | 'disabled'): boolean {
    if (type === 'disabled' && !this.isEditEnabled) {
      return true
    }
    if (meta === 'appIcon') {
      if (this.contentMeta.status.toLowerCase() === 'draft' &&
        (this.contentMeta.prevStatus &&
          this.contentMeta.prevStatus.toLowerCase() !== 'live' && this.contentMeta.prevStatus.toLowerCase() !== 'review')) {
        return true
      }
    }
    return this.contentService.checkCondition(this.contentMeta.identifier, meta, type)
  }

  createForm() {
    const noSpecialChar = new RegExp(/^[a-zA-Z0-9()$[\]\\.:!''_/ -]*$/)
    this.contentForm = this.formBuilder.group({
      accessPaths: [],
      accessibility: [],
      appIcon: [],
      artifactUrl: [],
      audience: [],
      body: [],
      catalogPaths: [],
      // category: [],
      // categoryType: [],
      certificationList: [],
      certificationUrl: [],
      clients: [],
      complexityLevel: [],
      difficultyLevel: [],
      concepts: [],
      contentIdAtSource: [],
      contentType: [],
      creatorContacts: [],
      customClassifiers: [],
      description: [],
      dimension: [],
      duration: [],
      editors: [],
      equivalentCertifications: [],
      // expiryDate: [],
      // exclusiveContent: [],
      idealScreenSize: [],
      identifier: [],
      introductoryVideo: [],
      introductoryVideoIcon: [],
      isExternal: [],
      // isIframeSupported: [],
      // isRejected: [],
      fileType: [],
      jobProfile: [],
      kArtifacts: [],
      keywords: [],
      competencies: [],
      learningMode: [],
      learningObjective: [],
      learningTrack: [],
      license: [],
      locale: [],
      mimeType: [],
      // name: [],
      name: new FormControl('', [Validators.required, Validators.pattern(noSpecialChar), Validators.minLength(10)]),
      nodeType: [],
      org: [],
      creatorDetails: [],
      // passPercentage: [],
      plagScan: [],
      playgroundInstructions: [],
      playgroundResources: [],
      postContents: [],
      posterImage: [],
      draftImage: [],
      preContents: [],
      preRequisites: [],
      projectCode: [],
      publicationId: [],
      publisherDetails: [],
      references: [],
      region: [],
      registrationInstructions: [],
      resourceCategory: [],
      resourceType: [],
      sampleCertificates: [],
      skills: [],
      softwareRequirements: [],
      // sourceName: [],
      source: [],
      creatorLogo: [],
      creatorPosterImage: [],
      creatorThumbnail: [],
      status: [],
      // studyDuration: [],
      studyMaterials: [],
      // subTitle: [],
      purpose: '',
      subTitles: [],
      systemRequirements: [],
      thumbnail: [],
      trackContacts: [],
      transcoding: [],
      unit: [],
      verifiers: [],
      visibility: [],
      instructions: [],
      versionKey: '',
      competencies_v3: [],
    })

    this.contentForm.valueChanges.pipe(debounceTime(700)).subscribe(() => {
      if (this.canUpdate && !this.contentForm.invalid) {
        this.storeData()
      }
    })

    this.contentForm.controls.contentType.valueChanges.subscribe(() => {
      this.changeResourceType()
      this.filterOrdinals()
      this.changeMimeType()
    })

    this.contentForm.controls.resourceCategory.valueChanges.subscribe(() => {
      this.contentForm.controls.customClassifiers.setValue(
        this.contentForm.controls.resourceCategory.value,
      )
    })
  }
  openCatalogSelector() {
    const oldCatalogs = this.contentForm.controls.catalogPaths.value
    const dialogRef = this.dialog.open(CatalogSelectComponent, {
      width: '70%',
      maxHeight: '90vh',
      data: (oldCatalogs) ? JSON.parse(JSON.stringify(oldCatalogs)) : [],
    })
    dialogRef.afterClosed().subscribe((response: string[]) => {
      // const catalogs = this.removeCommonFromCatalog(response)
      this.selectedCatalogList = response
      this.contentForm.controls.catalogPaths.setValue(response)
    })
  }

  removeSkill(skill: string) {
    const index = this.selectedSkills.indexOf(skill)
    this.selectedSkills.splice(index, 1)
  }

  // removeCatalog(index: number) {
  //   const catalogs = this.contentForm.controls.catalogPaths.value
  //   catalogs.splice(index, 1)
  //   this.contentForm.controls.catalogPaths.setValue(catalogs)
  // }

  // removeCommonFromCatalog(catalogs: string[]): string[] {
  //   const newCatalog: any[] = []
  //   catalogs.forEach(catalog => {
  //     let start = 0
  //     let end = 0
  //     start = catalog.indexOf('>')
  //     end = catalog.length
  //     newCatalog.push(catalog.slice(start + 1, end))
  //   })
  //   return newCatalog
  // }

  copyData(type: 'keyword' | 'previewUrl') {
    const selBox = document.createElement('textarea')
    selBox.style.position = 'fixed'
    selBox.style.left = '0'
    selBox.style.top = '0'
    selBox.style.opacity = '0'
    if (type === 'keyword') {
      selBox.value = this.contentForm.controls.keywords.value
    } else if (type === 'previewUrl') {
      selBox.value =
        // tslint:disable-next-line: max-line-length
        `${window.location.origin}/viewer/${VIEWER_ROUTE_FROM_MIME(
          this.contentForm.controls.mimeType.value,
        )}/${this.contentMeta.identifier}?preview=true`
    }
    document.body.appendChild(selBox)
    selBox.focus()
    selBox.select()
    document.execCommand('copy')
    document.body.removeChild(selBox)
    this.snackBar.openFromComponent(NotificationComponent, {
      data: {
        type: Notify.COPY,
      },
      duration: NOTIFICATION_TIME * 1000,
    })
  }

  addCommonToCatalog(catalogs: string[]): string[] {
    const newCatalog: any[] = []
    catalogs.forEach(catalog => {
      const prefix = 'Common>'
      if (catalog.indexOf(prefix) > -1) {
        newCatalog.push(catalog)
      } else {
        newCatalog.push(prefix.concat(catalog))
      }
    })
    return newCatalog
  }

  onDrop(file: any) {
    const fileName = file.name.replace(/[^A-Za-z0-9.]/g, '')
    if (!fileName.toLowerCase().endsWith('.vtt')) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.INVALID_FORMAT,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
    } else {
      this.file = file
      // this.getDuration()
      this.upload()
    }
  }

  clearUploadedFile() {
    this.contentForm.controls.subTitles.setValue([])
    this.file = undefined
  }

  upload() {

    this.loader.changeLoad.next(true)
    const formdata = new FormData()
    formdata.append(
      'content',
      this.file as Blob,
      (this.file as File).name.replace(/[^A-Za-z0-9.]/g, ''),
    )
    this.uploadService
      .upload(
        formdata, {
        contentId: this.contentMeta.identifier,
        contentType: CONTENT_BASE_STREAM,
      }).subscribe(vtt => {

        this.loader.changeLoad.next(false)

        this.contentForm.controls.subTitles.setValue([{
          url: vtt.result.artifactUrl,
        }])

      })
  }
  addCompetency(competencySeleted: any) {
    if (competencySeleted) {
      // API is not available
      const vc = _.chain(this.allCompetencies).filter(i => {
        return i.id === competencySeleted.id
      }).first().value()
      let selectedLevel
      if (vc && vc.children && vc.children.length > 0) {
        selectedLevel = _.chain(vc.children).filter(i => {
          return i.id === competencySeleted.childId
        }).first().value()
      }
      if (vc) {
        const value = this.contentForm.controls.competencies_v3.value || []
        const tempObj = {
          id: vc.id,
          name: vc.name,
          description: vc.description,
          competencyType: vc.additionalProperties.competencyType,
          competencyArea: vc.additionalProperties.competencyArea,
          source: vc.source,
          selectedLevelId: (selectedLevel && Object.keys(selectedLevel).length > 0) ? selectedLevel.id : '',
          selectedLevelLevel: (selectedLevel && Object.keys(selectedLevel).length > 0) ? selectedLevel.level : '',
          selectedLevelName: (selectedLevel && Object.keys(selectedLevel).length > 0) ? selectedLevel.name : '',
          selectedLevelDescription: (selectedLevel && Object.keys(selectedLevel).length > 0) ? selectedLevel.description : '',
          selectedLevelSource: (selectedLevel && Object.keys(selectedLevel).length > 0) ? selectedLevel.source : '',
        }
        if (this.canPush(value, tempObj)) {
          value.push(tempObj)
          this.contentForm.controls.competencies_v3.setValue(value)
          this.refreshData()
        }
      }
    }
  }
  removeCompetency(id: any): void {
    const index = _.findIndex(this.contentForm.controls.competencies_v3.value, { id })
    this.contentForm.controls.competencies_v3.value.splice(index, 1)
    this.contentForm.controls.competencies_v3.setValue(this.contentForm.controls.competencies_v3.value)
    this.refreshData()
  }
  view(item?: any) {
    const seletedItem = this.allCompetencies.filter((v: any) => v.id === (item && item.id))[0]
    item['children'] = (seletedItem && seletedItem.children) ? seletedItem.children : []
    const dialogRef = this.dialog.open(CompetenceViewComponent, {
      // minHeight: 'auto',
      width: '80%',
      panelClass: 'remove-pad',
      data: item,
      autoFocus: false,
    })
    const instance = dialogRef.componentInstance
    instance.isUpdate = true
    dialogRef.afterClosed().subscribe((response: any) => {

      if (response && response.action === 'ADD') {
        this.addCompetency(response)
        // this.refreshData(this.currentActivePage)
      } else if (response && response.action === 'DELETE') {
        this.removeCompetency(response.id)
      }
    })
  }
  updateQuery(key: string) {
    this.searchKey = key
    this.refreshData()
  }

  reset() {
    this.searchKey = ''
    this.queryControl.setValue('')
    this.selectedId = ''
    this.refreshData()
  }

  resetSearch() {
    this.reset()
    // this.refreshData()
  }
  setSelectedCompetency(id: string) {
    this.selectedId = id
  }
  refreshData() {
    const searchJson = [
      { type: 'COMPETENCY', field: 'name', keyword: this.searchKey },
      { type: 'COMPETENCY', field: 'status', keyword: 'VERIFIED' },
    ]
    const searchObj = {
      searches: searchJson,
      childNodes: true,
    }
    this.comptncySvc.fetchCompetency(searchObj).subscribe((reponse: NSCompetencie.ICompetencieResponse) => {
      if (reponse.statusInfo && reponse.statusInfo.statusCode === 200) {
        let data = reponse.responseData
        this.allCompetencies = reponse.responseData
        const comp = this.contentForm.get('competencies_v3')
        if (comp && comp.value && comp.value.length > 0) {
          data = _.flatten(_.map(comp.value, item => {
            return _.filter(reponse.responseData, i => i.id === item.id)
          }))
          this.filteredCompetencies = reponse.responseData.filter(obj => {
            return data.indexOf(obj) === -1
          })
        } else {
          this.filteredCompetencies = reponse.responseData
        }
      }
    })
  }
  showSaveButton() {
    const metaData = this.contentService.getOriginalMeta(this.contentService.parentContent)
    if (this.configSvc.userProfile && this.configSvc.userProfile.userId === metaData.createdBy) {
      return true
    }
    return false
  }

  getUrl(url: string) {
    if (this.contentService.getChangedArtifactUrl(url)) {
      return this.contentService.getChangedArtifactUrl(url)
    }
    return '/assets/instances/eagle/app_logos/default.png'
  }

  calculateChildDuration(contentMeta: NSContent.IContentMeta) {
    if (contentMeta && contentMeta.primaryCategory === NsContent.EPrimaryCategory.COURSE) {
      if (!contentMeta.duration && contentMeta.children && contentMeta.children.length > 0) {
        let tempDuration = 0
        contentMeta.children.forEach(element => {
          if (element.duration) {
            tempDuration = tempDuration + Number(element.duration)
          }
          if (element.children && element.children.length > 0) {
            element.children.forEach(subElement => {
              if (subElement.duration) {
                tempDuration = tempDuration + Number(subElement.duration)
              }
            })
          }
        })
        this.setDuration(tempDuration)
        this.timeToSeconds()
      } else {
        this.setDuration(contentMeta.duration || '0')
      }
    } else if (contentMeta && contentMeta.primaryCategory === NsContent.EPrimaryCategory.PROGRAM) {
      if (!contentMeta.duration && contentMeta.children && contentMeta.children.length > 0) {
        let tempDuration = 0
        contentMeta.children.forEach(element => {
          if (element.duration) {
            tempDuration = tempDuration + Number(element.duration)
          }
        })
        this.setDuration(tempDuration)
        this.timeToSeconds()
      } else {
        this.setDuration(contentMeta.duration || '0')
      }
    }
  }
}
