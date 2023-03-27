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
import { MatDialog } from '@angular/material'
import { IBatch } from '../../interface/content-batch.model'
import { ContentCertificateService } from '../../services/certificate.service'
import { ICertificate } from '../../interface/certificate-template'
// import { DomSanitizer } from '@angular/platform-browser';
// import { HttpClient, HttpBackend } from '@angular/common/http';
// import moment from 'moment';
/* tslint:enable */

@Component({
  selector: 'ws-auth-content-certificates-home',
  templateUrl: './content-certificates-home.component.html',
  styleUrls: ['./content-certificates-home.component.scss'],
})
export class ContentCertificatesHomeComponent implements OnInit, OnDestroy {
  public contentId: string | null = null
  public content!: NSContent.IContentMeta
  private batch!: IBatch | null
  routerSubscription = <Subscription>{}
  certificate!: ICertificate
  allLanguages: any[] = []
  searchLanguage = ''
  isAdmin = false
  // private httpClient!: HttpClient
  constructor(
    private myContSvc: MyContentService,
    private activatedRoute: ActivatedRoute,
    private loadService: LoaderService,
    private accessService: AccessControlService,
    private authInitService: AuthInitService,
    private dataService: LocalDataService,
    private certificateService: ContentCertificateService,
    public dialog: MatDialog,
    // handler: HttpBackend,
    // private sanitize: DomSanitizer
  ) {
    // this.httpClient = new HttpClient(handler)
    this.isAdmin = this.accessService.hasRole(['admin', 'super-admin', 'content-admin', 'editor'])
    if (this.dataService.currentBatch && this.dataService.currentBatch.value) {
      //   this.dataService.currentBatch.subscribe(val => {
      //     this.batch = val
      //   })
      this.batch = this.dataService.currentBatch.value
    }
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

  fetchContent() {
    this.loadService.changeLoad.next(true)
    const parent = this.activatedRoute.parent || this.activatedRoute
    this.contentId = parent.snapshot.paramMap.get('contentId') || null
    const routeData = parent.snapshot.data.content
    if (!routeData) {
      if (this.contentId) {
        this.myContSvc.readContent(this.contentId).subscribe(s => {
          _.set(this, 'content', s)
          this.dataService.initData(s)
          this.loadService.changeLoad.next(false)
          this.getCertificateDetails()
        })
      }
    } else {
      _.set(this, 'content', routeData)
      this.dataService.initData(routeData)
      this.loadService.changeLoad.next(false)
      this.getCertificateDetails()
    }
  }
  getCertificateDetails() {
    if (this.batch) {
      this.certificateService.getAllBatchCertificates(this.batch.batchId).subscribe(r => {
        this.certificate = _.get(r, 'result.response') || {}
      })
    }

  }

}
