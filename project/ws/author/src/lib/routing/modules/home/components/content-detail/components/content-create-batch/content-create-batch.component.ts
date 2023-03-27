import { Component, OnDestroy, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
// tslint:disable-next-line
import _ from 'lodash'
import { IEnroleType } from '../../enums/enrolment-type'
import { MyContentService } from '../../services/content-detail.service'
import { LocalDataService } from '../../services/local-data.service'
import { ContentBatchService } from '../../services/content-batch.service'
import { MatSnackBar } from '@angular/material'
import { ConfigurationsService } from '@ws-widget/utils/src/public-api'
import { NSContent } from '../../../../../../../interface/content'
import moment from 'moment'
@Component({
  selector: 'ws-auth-content-create-batch',
  templateUrl: './content-create-batch.component.html',
  styleUrls: ['./content-create-batch.component.scss'],
})
export class ContentCreateBatchComponent implements OnInit, OnDestroy {
  contentForm!: FormGroup
  public contentId: string | null = null
  isAllowed = true
  content!: NSContent.IContentMeta
  minDate = new Date()
  enroleTypeList = Object.values(IEnroleType)
  constructor(
    // private router: Router,
    private activatedRoute: ActivatedRoute,
    private myContSvc: MyContentService,
    private dataService: LocalDataService,
    private batchService: ContentBatchService,
    private snack: MatSnackBar,
    private configService: ConfigurationsService,
    private router: Router,
  ) {

    this.contentForm = new FormGroup({
      batchName: new FormControl('', [Validators.required]),
      batchId: new FormControl('', []),
      StartDate: new FormControl('', [Validators.required]),
      EndDate: new FormControl('', [Validators.required]),
      EndEnrolment: new FormControl('', [Validators.required]),
      enroleType: new FormControl(IEnroleType.Nomination, Validators.required),
    })
    this.contentForm.controls['StartDate'].valueChanges.subscribe((value: any) => {
      this.contentForm.controls['EndDate'].setValue(moment(value).add(1, 'day').toDate())
    })
    this.fetchContent()
  }
  ngOnInit(): void {
  }
  ngOnDestroy(): void {
  }
  get getMaxDate() {
    if (this.contentForm.get('StartDate')) {
      return moment((this.contentForm.get('StartDate') as FormControl).value).add(1, 'day').toDate()
    } return moment(new Date()).add(1, 'day').toDate()
  }
  get getMinEEndDate() {
    if (this.contentForm.get('StartDate')) {
      return (this.contentForm.get('StartDate') as FormControl).value
    } return (new Date())
  }
  get getMmaxEEndDate() {
    if (this.contentForm.get('EndDate')) {
      return (this.contentForm.get('EndDate') as FormControl).value
    } return (new Date())
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
  fetchContent() {
    this.contentId = this.activatedRoute.snapshot.paramMap.get('contentId') || null
    const routeData = this.activatedRoute.snapshot.data.content
    if (!routeData) {
      if (this.contentId) {
        this.myContSvc.readContent(this.contentId).subscribe(s => {
          _.set(this, 'content', s)
          this.dataService.initData(s)
          // this.dataService.batchCreated.next(false)
          // this.resetAndFetchTocStructure()
        })
      }
    } else {
      _.set(this, 'content', routeData)
      this.dataService.initData(routeData)
      // this.resetAndFetchTocStructure()
    }
  }
  onSubmit() {
    if (this.contentForm.invalid) {
      this.snack.open('You are missing Something!')
      return
    }

    const data = {
      courseId: this.contentId,
      name: this.contentForm.controls['batchName'].value,
      description: `Batch for ${this.content.name}`,
      enrollmentType: this.contentForm.controls['enroleType'].value === 'Nomination' ? 'invite-only' : 'open', // need to check
      startDate: moment(new Date(this.contentForm.controls['StartDate'].value)).format('YYYY-MM-DD'),
      endDate: moment(new Date(this.contentForm.controls['EndDate'].value)).format('YYYY-MM-DD'),
      enrollmentEndDate: moment(new Date(this.contentForm.controls['EndEnrolment'].value)).format('YYYY-MM-DD'),
      createdBy: this.configService.unMappedUser.id,
      createdFor: [
        this.configService.unMappedUser.rootOrgId,
      ],
      mentors: [
        this.configService.unMappedUser.id,
      ],
    }
    this.batchService.createABatch({ request: data }).subscribe(response => {
      if (response) {
        this.snack.open('Success, Batch created successfully!')
        this.dataService.batchCreated.next(true)
        this.router.navigate(['/author', 'content-detail', this.contentId, 'batches'])
      } else {
        this.snack.open('Error!')
      }
      // tslint:disable-next-line
    }, (error: any) => {
      this.snack.open('Error!', _.get(error, 'params.errmsg'))
    })
  }
  cancel() {
    this.router.navigate(['/author', 'content-detail', this.contentId, 'batches'])
  }
}
