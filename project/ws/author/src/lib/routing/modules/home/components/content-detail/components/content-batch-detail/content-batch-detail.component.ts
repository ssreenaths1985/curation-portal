import { Component, OnDestroy, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { MatSnackBar, MatDialog } from '@angular/material'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
// tslint:disable-next-line
import _ from 'lodash'
import { AccessControlService } from '../../../../../../../modules/shared/services/access-control.service'
import { EBatchPath } from '../../enums/batch-options'
import { IEnroleType } from '../../enums/enrolment-type'
import { IBatch } from '../../interface/content-batch.model'
import { MyContentService } from '../../services/content-detail.service'
import { LocalDataService } from '../../services/local-data.service'
import { ContentBatchAddLearnersComponent } from '../content-batch-add-learners/content-batch-add-learners.component'
import { IRLearners } from '../content-batch-add-learners/iIRLearners.model'
// import { OrgUserService } from '../../services/org-user.service'
import moment from 'moment'
import { NsContent } from '@ws-widget/collection/src/public-api'
import { NSContent } from '../../../../../../../interface/content'

@Component({
  selector: 'ws-auth-content-batch-detail',
  templateUrl: './content-batch-detail.component.html',
  styleUrls: ['./content-batch-detail.component.scss'],
})
export class ContentBatchDetailComponent implements OnInit, OnDestroy {
  contentForm!: FormGroup
  filterPath = '/'
  content!: NSContent.IContentMeta

  public contentId: string | null = null
  enroleTypeList = Object.values(IEnroleType)
  batchUsersCount = 0
  batchId!: string | null
  rawBatch!: string
  batch!: IBatch | null
  statusType = EBatchPath
  batchDefaults: any
  isAllowedToAdd = true
  status = EBatchPath.Learners.toLocaleLowerCase()
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    // private orgUserService: OrgUserService,
    private myContSvc: MyContentService,
    private dataService: LocalDataService,
    private snackBar: MatSnackBar,
    private accessService: AccessControlService,
    public dialog: MatDialog,
  ) {
    this.rawBatch = this.activatedRoute.snapshot.params.batch
    if (this.dataService.batchDefaults.value) {
      this.batchDefaults = this.dataService.batchDefaults.value
    } else {
      const menus = this.activatedRoute.snapshot.data.pageData.data.batch
      this.dataService.batchDefaults.next(menus)
      this.batchDefaults = menus
    }
    this.batch = JSON.parse(atob(this.rawBatch || '{}'))
    this.batchId = this.batch && this.batch.batchId
    this.contentId = this.activatedRoute.snapshot.paramMap.get('contentId') || null
    this.filterPath = `/author/content-detail/${this.contentId}/batches/${this.rawBatch}`
    this.contentForm = new FormGroup({
      batchName: new FormControl('', [Validators.required]),
      batchId: new FormControl('', [Validators.required]),
      identifier: new FormControl(this.contentId, [Validators.required]),
      StartDate: new FormControl('', [Validators.required]),
      EndDate: new FormControl('', [Validators.required]),
      enroleType: new FormControl(IEnroleType.Nomination, Validators.required),
    })
    this.fetchContent()
    this.subsRoute()
  }
  ngOnInit(): void {
    if (!this.activatedRoute.snapshot.params.batch) {
      this.dataService.currentBatch.subscribe(res => {
        if (res) {
          this.batch = res
        } else {
          // API CALL
        }
      })
    } else {
      this.fetchBatch()
    }
    const today = moment(new Date())
    const batchEndDate = moment(_.get(this.batch, 'enrollmentEndDate'))
    this.isAllowedToAdd = today.isSameOrBefore(batchEndDate, 'day')
    this.dataService.batchUsers.subscribe(res => {
      if (res) {
        res.forEach(r => {
          if (r.batchId === this.batchId) {
            this.batchUsersCount = r.count
          }
        })
      } else {
        this.batchUsersCount = 0
      }
    })
  }
  ngOnDestroy(): void {
  }
  get auto() {
    return (new Date()).toISOString()
  }
  showError(meta: string) {
    if (this.contentForm.controls[meta] && this.contentForm.controls[meta].touched) {
      if (!this.contentForm.controls[meta].valid) {
        return true
      }
    }
    return false
  }
  moveBack() {
    if (this.batch && this.content.primaryCategory === NsContent.EPrimaryCategory.PROGRAM) {
      this.router.navigate(
        [
          'author',
          'content-detail',
          this.batch.identifier,
          'batches',
        ],
      )
    }
    // this condition is due to auto redirect
    if (this.batch && this.content.primaryCategory === NsContent.EPrimaryCategory.COURSE) {
      this.router.navigate(
        [
          'author',
          'content-detail',
          this.batch.identifier,
          'overview',
        ],
      )
    }
  }
  subsRoute() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const path = (event.url || '').split('/')
        const list = Object.values(EBatchPath).map(i => i.toLocaleLowerCase())
        if (list.indexOf(path[path.length - 1]) >= 0) {
          this.status = path[path.length - 1]
        }
      }
    })
  }
  addLearners(onlyRemove: boolean = false) {
    const dialogRef = this.dialog.open(ContentBatchAddLearnersComponent, {
      width: '70%',
      maxHeight: '90vh',
      data: { batchId: this.batchId, courseId: this.contentId, isEnrolmentActive: !onlyRemove },
    })
    dialogRef.afterClosed().subscribe((response: IRLearners) => {
      if (response && response.data && response.data.ok) {
        // this.addLearner(response.data.data || [])
        this.fetchBatch(EBatchPath.Learners)
      }
    })
  }
  fetchContent() {
    const routeData = this.activatedRoute.snapshot.data.content
    if (!routeData) {
      if (this.contentId) {
        this.myContSvc.readContent(this.contentId).subscribe(s => {
          _.set(this, 'content', s)
          this.dataService.initData(s)
          if (this.activatedRoute.snapshot.params.batch) {
            this.dataService.initBatch(this.activatedRoute.snapshot.params.batch)
          }
        })
      }
    } else {
      _.set(this, 'content', routeData)
      this.dataService.initData(routeData)
      if (this.activatedRoute.snapshot.params.batch) {
        let batchLocal!: IBatch
        try {
          batchLocal = JSON.parse(atob(this.activatedRoute.snapshot.params.batch))
        } catch {
          this.snackBar.open('Something went wrong! Please try again', 'X')
        }

        this.dataService.initBatch(batchLocal)
      }
      // this.resetAndFetchTocStructure()
    }
  }
  fetchBatch(routeTo?: EBatchPath) {
    if (this.batchId) {
      try {
        this.batch = JSON.parse(atob(
          this.activatedRoute.snapshot.params.batch
          || ''
        )
          || '{}'
        )
        if (routeTo) {
          this.routeToScreen(routeTo)
        }
      } catch {
        this.snackBar.open('Something went wrong! Please try again', 'X')
      }
    }
  }

  isAllowed(roles: string[]) {
    if (roles && roles.length > 0) {
      return this.accessService.hasRole(roles)
    }
    return true // should be false
  }
  routeToScreen(paramater: EBatchPath) {
    if (this.batch && this.batch.identifier && this.batch.batchId) {
      const path: Readonly<string> = paramater
      if (path) {
        this.router.navigate(
          [
            'author',
            'content-detail',
            this.batch.identifier,
            'batches',
            this.rawBatch,
            path,
          ],
        )
      }
    }
  }
  get getBatchData() {
    return btoa(JSON.stringify(this.batch))
  }
}
