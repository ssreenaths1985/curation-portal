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
import { IAuthorData, WidgetContentService } from '@ws-widget/collection/src/public-api'
/* tslint:enable */

@Component({
  selector: 'ws-auth-content-learners',
  templateUrl: './content-learners.component.html',
  styleUrls: ['./content-learners.component.scss'],
})
export class ContentLearnersComponent implements OnInit, OnDestroy {
  public contentId: string | null = null
  public content!: NSContent.IContentMeta
  private learners: IAuthorData[] = []
  routerSubscription = <Subscription>{}
  allLanguages: any[] = []
  searchLanguage = ''
  isAdmin = false

  constructor(
    private myContSvc: MyContentService,
    private activatedRoute: ActivatedRoute,
    private loadService: LoaderService,
    private accessService: AccessControlService,
    private authInitService: AuthInitService,
    private dataService: LocalDataService,
    private contentSvc: WidgetContentService,
    private router: Router,
  ) {
    this.isAdmin = this.accessService.hasRole(['admin', 'super-admin', 'content-admin', 'editor'])
    this.subscribeLearners()
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
    const currentBatch = this.dataService.currentBatch.value
    if (currentBatch && currentBatch.batchId) {
      this.dataService.batchUsers.subscribe(u => {
        const learners = _.get(_.first(_.filter(u, { batchId: currentBatch.batchId })), 'learners') || []
        if ((this.learners || []).length !== learners.length) {
          this.learners = learners
        }
      })
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
              authorType: usr.designation || 'Designation not available',
              designation: usr.designation || 'Designation not available',
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
  get getLearners() {
    return this.learners || []
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
}
