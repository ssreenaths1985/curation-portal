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
import { IAuthorData, WidgetContentService, NsContent } from '@ws-widget/collection/src/public-api'
import { IBatch, IBatchLearnerProgress, IIssuedCertificates } from '../../interface/content-batch.model'
import { ContentCertificateService } from '../../services/certificate.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { CertificateDialogComponent } from '../../../../../../../../../../../../library/ws-widget/collection/src/lib/_common/certificate-dialog/certificate-dialog.component';
/* tslint:enable */

@Component({
  selector: 'ws-auth-content-certificate-learners',
  templateUrl: './content-certificate-learners.component.html',
  styleUrls: ['./content-certificate-learners.component.scss'],
})
export class ContentCertificateLearnersComponent implements OnInit, OnDestroy {
  public contentId: string | null = null
  public content!: NSContent.IContentMeta
  private learners: IAuthorData[] = []
  private learnersProgress: IBatchLearnerProgress[] = []
  currentBatch: IBatch | null = null
  routerSubscription = <Subscription>{}
  // private selectedCertId = ''
  allLanguages: any[] = []
  searchLanguage = ''
  isAdmin = false
  certificateData: any
  constructor(
    private myContSvc: MyContentService,
    private activatedRoute: ActivatedRoute,
    private loadService: LoaderService,
    private accessService: AccessControlService,
    private authInitService: AuthInitService,
    private dataService: LocalDataService,
    private contentSvc: WidgetContentService,
    private certificateSvc: ContentCertificateService,
    private snackBar: MatSnackBar,
    private router: Router,
    public dialog: MatDialog,
  ) {
    this.currentBatch = this.dataService.currentBatch.value
    this.isAdmin = this.accessService.hasRole(['admin', 'super-admin', 'content-admin', 'editor'])
    this.subscribeLearners()
    // this.selectedCertId = _.get(this.activatedRoute.snapshot, 'params.certificate') || ''
    this.certificateData = _.first(
      _.filter(
        _.get(
          this.activatedRoute,
          'snapshot.parent.parent.data.pageData.data.batch.tabs'
        ),
        { name: 'Certificates' }
      ))
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
      this.fetchLearners()
    })
  }
  subscribeLearners() {
    if (this.currentBatch && this.currentBatch.batchId) {
      let allLearners: any[] = []
      this.dataService.batchUsers.subscribe(u => {
        const learners = _.get(_.first(_.filter(u, { batchId: this.currentBatch ? this.currentBatch.batchId : '' })), 'learners') || []
        if ((this.learners || []).length !== learners.length) {
          this.learners = learners
        }
        allLearners = learners
        const users: IBatchLearnerProgress[] = []
        _.each(_.get(this.activatedRoute.snapshot, 'data.learners'), ler => {
          const usr: Readonly<IAuthorData> = _.first(_.filter(allLearners, { userId: ler.userId })) || {}
          const usrRecord = {
            batchId: ler.batchId,
            completionPercentage: ler.completionPercentage || 0,
            courseId: ler.courseId,
            firstName: ler.firstname,
            issuedCertificates: ler.issuedCertificates || [],
            lastName: ler.lastname,
            progress: ler.progress || 0,
            status: ler.status || 0,
            userId: ler.userId,
            department: usr.department,
            designation: usr.designation,
            email: usr.email,
            name: usr.name,
            profileImage: usr.profileImage,
          } as IBatchLearnerProgress
          if (usr.userId) {
            users.push(usrRecord)
          }
        })
        this.learnersProgress = users
      })
      // this.learners = _.get(this.activatedRoute.snapshot, 'data.learners') || []
    }

  }
  fetchLearners() {
    if (this.dataService.currentBatch.value && this.dataService.currentBatch.value.batchId) {
      const currentBatchId = this.dataService.currentBatch.value.batchId
      this.contentSvc.fetchLearners(currentBatchId).subscribe(l => {
        if (l && l.length) {
          this.learners = _.map(l, (usr: any) => {
            return {
              name: `${usr.first_name} ${usr.last_name}`,
              designation: usr.designation || 'n/a',
              // designation: usr.designation || 'Designation not available',
              department: usr.department,
              profileImage: '', // need
              profileLink: usr.user_id,
              userId: usr.user_id,
              email: usr.email,
            }
          }) as IAuthorData[]
          this.dataService.batchUsersCount({ batchId: currentBatchId, learners: this.learners, count: (l || []).length })
        }
      })
    }
  }

  fetchContent() {
    this.contentId = _.get(this.activatedRoute, 'snapshot.parent.parent.params.contentId') || null
    const routeData = _.get(this.activatedRoute, 'snapshot.parent.parent.data.content') || null
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
  get getLearners() {
    return this.learnersProgress || []
  }
  isCertificateIssued(userId: string): boolean {
    const user: Readonly<IBatchLearnerProgress | undefined> = _.first(_.filter(this.learnersProgress, { userId }))
    if (user && user.issuedCertificates) {
      if (this.maxLimit === 1) {
        return user.issuedCertificates.length === 1
      }
      if (this.maxLimit > 1) {
        // need to work for multi certificates check ids of batch
        return false
      }
      return false
    }
    return false
  }
  get maxLimit() {
    if (this.certificateData && this.certificateData.settings && this.certificateData.settings.maxCertificates) {
      return this.certificateData.settings.maxCertificates
    }
    return 1
  }
  issueCertificate(userId: String) {
    const issueData: Readonly<any> = {
      request: {
        courseId: this.contentId,
        batchId: (this.dataService.currentBatch.value as IBatch).batchId,
        userIds: [userId],
      },
    }
    this.certificateSvc.issueCertificate(issueData).subscribe(res => {
      if (res.responseCode === 'OK') {
        this.snackBar.open('Certificate issues! successfully')
      } else {
        this.snackBar.open('Please Try again later')
      }
    },
      // tslint:disable-next-line
      () => {
        this.snackBar.open('Some error occured! , Please Try again later')
      })
  }
  clicked(eventData: any, learner: IAuthorData) {
    if (eventData && learner) {
      this.dataService.setCurrentUser(learner)
      this.router.navigate([
        'author',
        'content-detail',
        this.contentId,
        'batches',
        btoa(JSON.stringify(this.dataService.currentBatch.value)),
        'learner',
        learner.profileLink])
    }
  }
  moveBack() {
    if (this.currentBatch && this.content.primaryCategory === NsContent.EPrimaryCategory.PROGRAM ||
      this.content.primaryCategory === NsContent.EPrimaryCategory.COURSE) {
      this.router.navigate(
        [
          'author',
          'content-detail',
          // tslint:disable-next-line: no-non-null-assertion
          this.currentBatch!.identifier,
          'batches',
          btoa(JSON.stringify(this.dataService.currentBatch.value)),
          'certificates',
        ],
      )
    }

  }
  percentFix(num: number) {
    return num.toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false,
      maximumFractionDigits: 0,
    })
  }
  viewCert(user: IBatchLearnerProgress) {
    if (this.maxLimit === 1 && user.issuedCertificates.length >= 1) {
      this.previewCert(user.issuedCertificates[0])
    }
  }

  previewCert(cert: IIssuedCertificates) {
    this.certificateSvc.downloadCert(cert.identifier).subscribe((response: { result: { printUri: string } }) => {
      const certData = response.result.printUri
      this.dialog.open(CertificateDialogComponent, {
        // height: '400px',
        width: '1300px',
        data: {
          base64: certData,
          // url: template.previewUrl,
        },
        // panelClass: 'custom-dialog-container',
      })
    })
  }
}
