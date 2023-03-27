import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { NSContent } from '../../../../../../../interface/content'
import { MyContentService } from '../../../my-content/services/my-content.service'
import { IBatch } from '../../interface/content-batch.model'
import { LocalDataService } from '../../services/local-data.service'

/* tslint:disable */
import _ from 'lodash'
import { NsContent } from '@ws-widget/collection/src/public-api'
import moment from 'moment'
/* tslint:enable */

@Component({
  selector: 'ws-auth-content-batches',
  templateUrl: './content-batches.component.html',
  styleUrls: ['./content-batches.component.scss'],
  providers: [MyContentService],
})
export class ContentBatchesComponent implements OnInit, OnDestroy {
  BATCH_LIST!: IBatch[]
  ARCH_BATCH_LIST!: IBatch[]
  isAllowed = false
  public contentId: string | null = null
  public content!: NSContent.IContentMeta
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private myContSvc: MyContentService,
    private dataService: LocalDataService,
  ) {
    this.fetchContent()
  }
  ngOnInit(): void {
    if (_.get(this, 'content')) {
      this.init()
    }
  }
  init() {
    const today = moment(new Date())
    this.BATCH_LIST = _.filter(_.map(_.get(this.content, 'batches'), (batch: IBatch) =>
      _.set(batch, 'identifier', this.contentId)) || [],
      // tslint:disable-next-line: align
      (b: IBatch) => {
        return today.isSameOrBefore(moment(b.endDate || new Date()), 'day')
      })

    this.ARCH_BATCH_LIST = _.filter(_.map(_.get(this.content, 'batches'), (batch: IBatch) =>
      _.set(batch, 'identifier', this.contentId)) || [],
      // tslint:disable-next-line: align
      (b: IBatch) => {
        return today.isAfter(moment(b.endDate || new Date()), 'day')
      })
    if (this.BATCH_LIST.length === 1
      && this.content.primaryCategory !== NsContent.EPrimaryCategory.PROGRAM) {
      this.router.navigate([
        'author',
        'content-detail',
        this.contentId,
        'batches',
        btoa(JSON.stringify(this.BATCH_LIST[0] || {})),
      ])
    }
  }
  ngOnDestroy(): void {
  }
  createNewBatch() {
    if (this.content && this.contentId) {
      this.router.navigate(['author', 'content-detail', this.contentId, 'new-batch'])
    }
  }
  async fetchContent() {
    this.contentId = this.activatedRoute.snapshot.paramMap.get('contentId') || null
    const routeData = this.activatedRoute.snapshot.data.content
    if (!routeData || this.dataService.batchCreated.value) {
      if (this.contentId) {
        await this.myContSvc.readContent(this.contentId).subscribe(s => {
          _.set(this, 'content', s)
          this.dataService.initData(s)
          this.dataService.batchCreated.next(false)
          // this.resetAndFetchTocStructure()
          this.isAllowed = this.content.primaryCategory === NsContent.EPrimaryCategory.PROGRAM
          this.init()
        })
      }
    } else {
      _.set(this, 'content', routeData)
      this.dataService.initData(routeData)
      // this.resetAndFetchTocStructure()
      this.isAllowed = this.content.primaryCategory === NsContent.EPrimaryCategory.PROGRAM
    }
  }
  get getBatchList() {
    if (this.contentId && this.content) {
      return _.sortBy(_.sortBy(_.map(this.BATCH_LIST, b => {
        return {
          batchId: b.batchId,
          createdFor: b.createdFor || '',
          endDate: b.endDate || null,
          enrollmentEndDate: b.enrollmentEndDate || null,
          enrollmentType: b.enrollmentType || 'Open',
          name: b.name,
          startDate: b.startDate || (new Date()),
          status: b.status,
          identifier: b.identifier || this.contentId,
        } as IBatch
      }),
        // tslint:disable-next-line
        ['status']), function (dateObj) {
          return new Date(dateObj.startDate)
        })
    }
    return [{
      batchId: 'xxxxxx',
      createdFor: [],
      endDate: 'Thu, 21 Oct 2021 11:22:13 GMT',
      enrollmentEndDate: 'Thu, 21 Oct 2021 11:22:13 GMT',
      enrollmentType: 'Open',
      name: 'Untitled',
      startDate: 'Thu, 21 Oct 2021 11:22:13 GMT',
      status: 1,
      identifier: this.contentId,
    }]
  }
  get getArcBatchList() {
    if (this.contentId && this.content) {
      return _.sortBy(_.sortBy(_.map(this.ARCH_BATCH_LIST, b => {
        return {
          batchId: b.batchId,
          createdFor: b.createdFor || '',
          endDate: b.endDate || null,
          enrollmentEndDate: b.enrollmentEndDate || null,
          enrollmentType: b.enrollmentType || 'Open',
          name: b.name,
          startDate: b.startDate || (new Date()),
          status: b.status,
          identifier: b.identifier || this.contentId,
        } as IBatch
      }),
        // tslint:disable-next-line
        ['status']), function (dateObj) {
          return new Date(dateObj.startDate)
        })
    }
    return []
  }
}
