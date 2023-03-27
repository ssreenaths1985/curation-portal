import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Subscription } from 'rxjs'
import { AccessControlService } from '../../../../../../../../public-api'
import { NSContent } from '../../../../../../../interface/content'
import { AuthInitService } from '../../../../../../../services/init.service'
import { LoaderService } from '../../../../../../../services/loader.service'
import { MyContentService } from '../../services/content-detail.service'
import { LocalDataService } from '../../services/local-data.service'

/* tslint:disable */
import _ from 'lodash'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { IEnroleType } from '../../enums/enrolment-type'
/* tslint:enable */

@Component({
  selector: 'ws-auth-content-batch-settings',
  templateUrl: './content-batch-settings.component.html',
  styleUrls: ['./content-batch-settings.component.scss'],
})
export class ContentBatchSettingsComponent implements OnInit, OnDestroy {
  public contentId: string | null = null
  public content!: NSContent.IContentMeta
  routerSubscription = <Subscription>{}
  allLanguages: any[] = []
  searchLanguage = ''
  isAdmin = false
  isAllowed = true
  contentForm!: FormGroup
  enroleTypeList = Object.values(IEnroleType)
  constructor(
    private myContSvc: MyContentService,
    private activatedRoute: ActivatedRoute,
    private loadService: LoaderService,
    private accessService: AccessControlService,
    private authInitService: AuthInitService,
    private dataService: LocalDataService,
  ) {
    this.isAdmin = this.accessService.hasRole(['admin', 'super-admin', 'content-admin', 'editor'])
    this.contentForm = new FormGroup({
      maxScore: new FormControl('', [Validators.required]),
      passCriteria: new FormControl('', [Validators.required]),
      enroleType: new FormControl(IEnroleType.Nomination, Validators.required),
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
    this.activatedRoute.queryParams.subscribe(() => {
      this.fetchContent()
    })
  }
  showError(meta: string) {
    if (this.contentForm.controls[meta] && this.contentForm.controls[meta].touched) {
      if (!this.contentForm.controls[meta].valid) {
        return true
      }
    }
    return false
  }
  fetchContent() {
    this.contentId = this.activatedRoute.snapshot.paramMap.get('contentId') || null
    const routeData = this.activatedRoute.snapshot.data.content
    if (!routeData) {
      if (this.contentId) {
        this.myContSvc.readContent(this.contentId).subscribe(s => {
          _.set(this, 'content', s)
          this.dataService.initData(s)
        })
      }
    } else {
      _.set(this, 'content', routeData)
      this.dataService.initData(routeData)
    }
  }
  create() {
    // need to do
  }
}
