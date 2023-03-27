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
import { IAuthorData } from '@ws-widget/collection/src/public-api'
import { OrgUserService } from '../../services/org-user.service'
import { NSProfileDataV2 } from '../../../../../../../../../../app/src/lib/routes/home/models/profile-v2.model'
import { IBatch } from '../../interface/content-batch.model'
/* tslint:enable */

@Component({
  selector: 'ws-auth-content-learner-detail',
  templateUrl: './content-learner-detail.component.html',
  styleUrls: ['./content-learner-detail.component.scss'],
})
export class ContentLearnerDetailComponent implements OnInit, OnDestroy {
  public contentId: string | null = null
  public content!: NSContent.IContentMeta
  public learner!: IAuthorData
  private userId!: string
  routerSubscription = <Subscription>{}
  allLanguages: any[] = []
  rawBatch!: string
  searchLanguage = ''
  isAdmin = false
  constructor(
    private router: Router,
    private myContSvc: MyContentService,
    private activatedRoute: ActivatedRoute,
    private loadService: LoaderService,
    private accessService: AccessControlService,
    private authInitService: AuthInitService,
    private dataService: LocalDataService,
    private usrSvc: OrgUserService,

    // private contentSvc: WidgetContentService,
  ) {
    this.rawBatch = _.get(this.activatedRoute, 'snapshot.parent.params.batch') || null
    this.isAdmin = this.accessService.hasRole(['admin', 'super-admin', 'content-admin', 'editor'])
    this.userId = this.activatedRoute.snapshot.params.id
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
      // this.fetchContent()
      this.fetchLearner()
    })
  }
  fetchLearner() {
    if (this.dataService.currentBatch.value && this.dataService.currentBatch.value.batchId) {
      // const currentBatchId = this.dataService.currentBatch.value.batchId
      this.usrSvc.getUser(this.userId).subscribe(res => {
        this.learner = {
          department: _.get(res, 'profileDetails.employmentDetails.departmentName'),
          profileImage: _.get(res, 'avatar'),
          name: `${_.get(res, 'firstName')} ${_.get(res, 'lastName')}`,
          authorType: '',
          email: _.get(res, 'email'),
          profileLink: this.getProfileLink(res.profileDetails),
          userId: _.get(res, 'userId'),
          designation: 'ccccccc',
        }
        this.dataService.setCurrentUser(this.learner)
      })
    }
  }
  getProfileLink(res: NSProfileDataV2.IProfile) {
    if (res && res.userId) {
      return `/app/profile/${res.userId}`
    }
    return '#'
  }
  fetchContent() {
    this.contentId = this.activatedRoute.snapshot.parent && this.activatedRoute.snapshot.parent.paramMap.get('contentId') || null
    const routeData = this.activatedRoute.snapshot.parent &&
      this.activatedRoute.snapshot.parent.data.content
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
  get getLearner() {
    return this.learner || null
  }
  get batch(): IBatch | undefined {
    if (this.rawBatch) {
      return JSON.parse(atob(this.rawBatch || '{}'))
    }
    return undefined
  }
  moveBack() {
    if (this.batch) {
      this.router.navigate(
        [
          'author',
          'content-detail',
          this.batch.identifier,
          'batches',
          this.rawBatch,
          'learners',
        ],
      )
    }
  }
}
