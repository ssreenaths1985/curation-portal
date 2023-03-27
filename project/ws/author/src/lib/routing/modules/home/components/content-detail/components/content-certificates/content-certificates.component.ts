import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { AccessControlService } from '../../../../../../../../public-api'
import { NSContent } from '../../../../../../../interface/content'
import { AuthInitService } from '../../../../../../../services/init.service'
import { LoaderService } from '../../../../../../../services/loader.service'
import { MyContentService } from '../../services/content-detail.service'
import { LocalDataService } from '../../services/local-data.service'

/* tslint:disable */
import _ from 'lodash'
import { MatDialog, MatSnackBar } from '@angular/material'
import { ContentAddCertificateComponent } from './add-certificate/add-certificate.component'
import { ContentBatchService } from '../../services/content-batch.service'
import { IBatch } from '../../interface/content-batch.model'
import { ContentCertificateService } from '../../services/certificate.service'
import { ICertificate, ICertificateTemplate } from '../../interface/certificate-template'
import { CertificateDialogComponent } from '@ws-widget/collection/src/lib/_common/certificate-dialog/certificate-dialog.component'
import moment from 'moment'
import { environment } from '../../../../../../../../../../../../src/environments/environment'
/* tslint:enable */

@Component({
  selector: 'ws-auth-content-certificates',
  templateUrl: './content-certificates.component.html',
  styleUrls: ['./content-certificates.component.scss'],
})
export class ContentCertificatesComponent implements OnInit, OnDestroy {
  public contentId: string | null = null
  public content!: NSContent.IContentMeta
  private batch!: IBatch | null
  routerSubscription = <Subscription>{}
  certificate!: ICertificate
  allLanguages: any[] = []
  searchLanguage = ''
  certificateData: any
  certificateConfig: any
  isAdmin = false
  constructor(
    private router: Router,
    private myContSvc: MyContentService,
    private activatedRoute: ActivatedRoute,
    private loadService: LoaderService,
    private accessService: AccessControlService,
    private authInitService: AuthInitService,
    private dataService: LocalDataService,
    private contentBatchService: ContentBatchService,
    private certificateService: ContentCertificateService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    // handler: HttpBackend,
    // private sanitize: DomSanitizer
    // private httpClient: HttpClient,
  ) {
    // this.httpClient = new HttpClient(handler)
    this.isAdmin = this.accessService.hasRole(['admin', 'super-admin', 'content-admin', 'editor'])
    if (this.dataService.currentBatch && this.dataService.currentBatch.value) {
      //   this.dataService.currentBatch.subscribe(val => {
      //     this.batch = val
      //   })
      this.batch = this.dataService.currentBatch.value
      this.certificateData = _.first(
        _.filter(
          _.get(
            this.activatedRoute,
            'snapshot.parent.parent.data.pageData.data.batch.tabs'
          ),
          { name: 'Certificates' }
        ))
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
  get isAllowed() {
    if (this.certificateData && this.certificateData.settings && this.certificateData.settings.maxCertificates) {
      return this.certificateTemplates.length < this.certificateData.settings.maxCertificates
    }
    return false
  }
  fetchContent() {
    this.loadService.changeLoad.next(true)
    const parent = _.get(this.activatedRoute, 'parent.parent') || this.activatedRoute
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
  markFinished(doc: Document) {
    const nodes = doc.getElementsByTagName('text')
    for (let i = nodes.length - 1; i >= 0; i -= 1) {
      if (nodes && nodes[i] && (nodes[i].textContent || '').trim()) {
        if ((nodes[i].textContent || '').trim().indexOf('${recipientName}') !== -1) {
          (nodes[i] as Element).innerHTML =
            ((nodes[i] as Element).innerHTML || '').replace(/\${recipientName}/g, 'Participant Name')
        }
        if ((nodes[i].textContent || '').trim().indexOf('${courseName}') !== -1) {
          (nodes[i] as Element).innerHTML =
            ((nodes[i] as Element).innerHTML || '').replace(/\${courseName}/g, this.content.name)
        }
        if ((nodes[i].textContent || '').trim().indexOf('${issuedDate}') !== -1) {
          (nodes[i] as Element).innerHTML =
            ((nodes[i] as Element).innerHTML || '').replace(/\${issuedDate}/g, moment().format('dd-MMM-yy'))
        }
      }
    }
    return doc
  }
  preview(template: ICertificateTemplate) {
    // this.certificateService.getCertificate(this.getUrl(template.previewUrl)).subscribe((svg: string) => {
    // const parser = new DOMParser()
    // const doc = this.markFinished(parser.parseFromString(svg, 'application/xml'))
    // const serializer = new XMLSerializer()
    // const xmlStr = serializer.serializeToString(doc)
    this.dialog.open(CertificateDialogComponent, {
      // height: '400px',
      width: '1300px',
      data: {
        cet: this.getUrl(template.previewUrl),
        url: template.previewUrl,
      },
      panelClass: 'custom-dialog-container',
    })
    // })
  }
  get certificateTemplates(): ICertificateTemplate[] {
    if (this.certificate && this.certificate.certTemplates) {
      return Object.entries(this.certificate.certTemplates).map(i => i[1]) as unknown as ICertificateTemplate[]
    } return []
  }
  viewLearners(cert: ICertificateTemplate) {
    if (cert && this.batch) {
      this.router.navigate([
        'author',
        'content-detail',
        this.batch.identifier,
        'batches',
        this.getBatchData,
        'certificates',
        'view-learners',
        cert.identifier,
      ])
    }
  }
  get getBatchData() {
    return btoa(JSON.stringify(this.batch))
  }
  getcertConfig() {
    this.contentBatchService.getCertificateConfig().then((data: any) => {
      this.certificateConfig = data.addCertificate
    })
  }
  addNewCertificate() {
    const dialogRef = this.dialog.open(ContentAddCertificateComponent, {
      width: '70%',
      maxHeight: '90vh',
      data: [],
    })
    this.getcertConfig()
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response && response.data.ok) {
        this.loadService.changeLoad.next(true)
        // tslint:disable-next-line
        // console.log(response)
        const name = _.get(response, 'data.data.certName')
        const resourseIdentifier = _.get(response, 'data.data.identifier')
        // tslint:disable-next-line
        const desc = _.get(response, 'data.data.certMsg')
        const template = _.get(response, 'data.data.certImage')
        const currentBatch = this.dataService.currentBatch.value
        const currentContent = this.dataService.content.getValue()
        if (
          currentBatch &&
          currentBatch.batchId &&
          currentContent &&
          currentContent.identifier &&
          resourseIdentifier && name && template
        ) {
          const req = {
            request: {
              batch: {
                batchId: currentBatch.batchId,
                courseId: currentContent.identifier,
                template: {
                  template,
                  displayName: name,
                  description: desc,
                  identifier: resourseIdentifier,
                  previewUrl: template,
                  criteria: {
                    enrollment: {
                      status: 2,
                    },
                  },
                  issuer: {
                    name: this.certificateConfig.issuer.name,
                    url: this.certificateConfig.issuer.url,
                  },
                  signatoryList: [
                    {
                      image: this.certificateConfig.signatoryList.image,
                      name: this.certificateConfig.signatoryList.name,
                      id: this.certificateConfig.signatoryList.id,
                      designation: this.certificateConfig.signatoryList.designation,
                    },
                  ],
                  notifyTemplate: {
                    emailTemplateType: this.certificateConfig.notifyTemplate.emailTemplateType,
                    subject: this.certificateConfig.notifyTemplate.subject,
                    stateImgUrl: 'https://sunbirddev.blob.core.windows.net/orgemailtemplate/img/File-0128212938260643843.png',
                    regards: this.certificateConfig.notifyTemplate.regards,
                    regardsperson: this.certificateConfig.notifyTemplate.regardsperson,
                  },
                },
              },
            },
          }
          this.contentBatchService.createABatchCertificate(req).subscribe(res => {
            // tslint:disable-next-line
            if (res) {
              this.snackBar.open('Success!!')
              this.loadService.changeLoad.next(false)
              this.getCertificateDetails()
            }
          },
            // tslint:disable-next-line
            () => {
              this.snackBar.open('Failure!!')
              this.loadService.changeLoad.next(false)
            })
        }
      }
    })
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
