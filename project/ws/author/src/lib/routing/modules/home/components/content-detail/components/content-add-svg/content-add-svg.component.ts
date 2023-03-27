import { Component, OnInit, OnDestroy, Output, Inject, Input, EventEmitter } from '@angular/core'
import { CollectionStoreService } from '../../../../../editor/routing/modules/collection/services/store.service'
import { CollectionResolverService } from '../../../../../editor/routing/modules/collection/services/resolver.service'
import { EditorContentService } from '../../../../../editor/services/editor-content.service'
import { NSContent } from '../../../../../../../interface/content'
import { NsContent } from '@ws-widget/collection/src/public-api'
import { FormGroup, FormBuilder } from '@angular/forms'
import { IAuthoringPagination } from '../../../../../../../interface/authored'
import { Subscription } from 'rxjs'
import { LoaderService, AccessControlService } from '../../../../../../../../public-api'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { MyContentService } from '../../../my-content/services/my-content.service'
import { DomSanitizer } from '@angular/platform-browser'
import { environment } from '../../../../../../../../../../../../src/environments/environment'

@Component({
  selector: 'ws-auth-content-add-svg',
  templateUrl: './content-add-svg.component.html',
  styleUrls: ['./content-add-svg.component.scss'],
  providers: [CollectionStoreService, CollectionResolverService, EditorContentService, MyContentService],
})
export class AddContentSVGComponent implements OnInit, OnDestroy {
  // toggle: NsContent.IContent[] = []
  contentMeta!: NSContent.IContentMeta
  toggle: NsContent.IContent | null = null
  currentParentId!: string
  startForm!: FormGroup
  public status = 'draft'
  userId!: string
  searchLanguage = ''
  queryFilter = ''
  currentFilter = 'myimages'
  public pagination!: IAuthoringPagination
  isAdmin = false
  newDesign = true
  public imageList!: []
  public fetchError = false
  showLoadMore!: boolean
  totalContent!: number
  routerSubscription = <Subscription>{}
  isChecked: boolean
  isEditEnabled = false
  thumbanilSelectval!: string
  @Input() stage = 1
  @Input() type = ''
  @Output() addAppIcon = new EventEmitter<string>()

  canUpdate = true
  @Input() isUpdate = false
  showMainContent: Boolean = true
  srcResult: any
  public imagePath: any
  imgURL: any
  public message: string | undefined

  constructor(
    private loadService: LoaderService,
    public dialogRef: MatDialogRef<AddContentSVGComponent>,
    private myContSvc: MyContentService,
    private sanitizer: DomSanitizer,
    private accessService: AccessControlService,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.userId = this.accessService.userId
    this.isChecked = false
  }

  ngOnInit() {
    this.pagination = {
      offset: 0,
      limit: 24,
    }
    this.startForm = this.formBuilder.group({
      thumbnail: [],
    })
    this.filter('myimages')
    this.imageList = []

  }

  ngOnDestroy() {
    this.loadService.changeLoad.next(false)
  }

  onFileSelected(files: any) {
    if (files.length === 0) {
      return
    }

    const mimeType = files[0].type
    if (mimeType.match(/image\/*/) == null) {
      this.message = 'Only images are supported.'
      return
    }

    const reader = new FileReader()
    this.imagePath = files[0]
    this.isChecked = true
    reader.readAsDataURL(files[0])
    reader.onload = _event => {
      this.imgURL = reader.result
    }
  }

  showHideButton() {
    this.showMainContent = this.showMainContent ? false : true
  }

  onValChange(val: NsContent.IContent | null = null) {
    this.isChecked = true
    this.thumbanilSelectval = val ? val.identifier : ''
    this.toggle = val
  }

  filter(key: string | 'myimages' | 'all') {
    if (key) {
      this.currentFilter = key
      switch (key) {
        case 'myimages':
          this.fetchContent(false, this.userId)
          break
        case 'all':
          this.fetchContent(false, null)
          break

        default:
          this.fetchContent(false, this.userId)
          break
      }
    }
  }
  changeToDefaultImg($event: any) {
    $event.target.src = '/assets/instances/eagle/app_logos/default.png'
  }
  fetchContent(loadMoreFlag: boolean, createdBy: string | null) {
    const requestData = {
      request: {
        filters: {
          createdBy,
          compatibilityLevel: { min: 1, max: 2 },
          contentType: ['Asset'],
          mediaType: ['image'],
          mimeType: ['image/svg+xml'],
          status: ['Live', 'Review', 'Draft', 'Processing'],
        },
        query: this.queryFilter,
        // pageNo: loadMoreFlag ? this.pagination.offset : 0,
        sort_by: { lastUpdatedOn: 'desc' },
        // pageSize: this.pagination.limit

      },
    }

    const observable =
      this.myContSvc.fetchContent(requestData)
    observable.subscribe(
      data => {

        this.imageList =
          loadMoreFlag && !this.queryFilter
            ? (this.imageList || []).concat(
              data && data.result && data.result.content ? data.result.content : [],
            )
            : data && data.result.content
              ? data.result.content
              : []
        this.totalContent = data && data.result.response ? data.result.response.totalHits : 0
        // this.showLoadMore =
        //   this.pagination.offset * this.pagination.limit + this.pagination.limit < this.totalContent
        //     ? true
        //     : false
        this.fetchError = false
      },
      () => {
        this.fetchError = true
        this.imageList = []
        this.showLoadMore = false
      },
    )
  }
  public bypass(uri: string) {
    // tslint:disable-next-line: triple-equals
    // if (uri && uri.indexOf(environment.azureHost) != -1) {
    if (uri) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(this.getUrl(uri))
    }
    return '/assets/instances/eagle/app_logos/default.png'
  }
  public uploadThumbnail() {
    this.dialogRef.close({ appURL: this.toggle ? this.toggle.artifactUrl : '', ...this.toggle })
  }

  public uploadSelectedThumbnail() {
    this.dialogRef.close({ file: this.imagePath })
  }

  getUrl(url: string) {
    if (url && url.length > 0) {
      const tempData = url.split('content')
      if (url.indexOf(`/collection`) > 0) {
        return `${environment.cbpPortal}${environment.contentBucket}${tempData[tempData.length - 1]}`
      }
      return `${environment.cbpPortal}${environment.contentBucket}/content${tempData[tempData.length - 1]}`
    }
    return url
  }

}
