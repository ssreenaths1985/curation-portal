import { Component, OnInit, OnDestroy } from '@angular/core'
import { map, startWith } from 'rxjs/operators'
import { ConfigurationsService, ValueService } from '@ws-widget/utils/src/public-api'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
/* tslint:disable */
import _ from 'lodash'
import { ActivatedRoute, Router } from '@angular/router'
import { ILeftMenu } from '@ws-widget/collection'
import { Observable, Subject } from 'rxjs'
import { ICompLevel } from './add-comp-level/add-comp.model'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { NSCompetencyV2 } from '../../interface/competency'
import { CompService } from '../../services/competencies.service'
import { AddCompLevelComponent } from './add-comp-level/add-comp-level.component'
import { MatDialog, MatSnackBar } from '@angular/material'
import { ITable } from '../comp-card-table/comp-card-table.model'
/* tslint:enable */

@Component({
  selector: 'ws-auth-request-competency',
  templateUrl: './request-competency.component.html',
  styleUrls: ['./request-competency.component.scss'],
})
export class RequestCompetencyComponent implements OnInit, OnDestroy {
  eventsSubject: Subject<void> = new Subject<void>()
  public sideNavBarOpenedMain = true
  competencyDetailsForm!: FormGroup
  isAdmin = false
  table!: ITable
  public levelTableContent!: any[]
  leftmenues!: ILeftMenu[]
  areaList!: any[]
  compList: ICompLevel[] = []
  options = [
    { name: 'Behavioural', weight: 'Behavioural' },
    { name: 'Domain', weight: 'Domain' },
    { name: 'Functional', weight: 'Functional' },
  ]
  departmentData: any
  myRoles!: Set<string>
  userId!: string
  isLtMedium$ = this.valueSvc.isLtMedium$
  private defaultSideNavBarOpenedSubscription: any
  mode$ = this.isLtMedium$.pipe(map(isMedium => (isMedium ? 'over' : 'side')))
  public screenSizeIsLtMedium = false
  filteredOptions?: Observable<string[]>

  constructor(
    private activatedRoute: ActivatedRoute,
    private valueSvc: ValueService,
    private accessService: AccessControlService,
    private configService: ConfigurationsService,
    private compService: CompService,
    private dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    this.userId = this.accessService.userId
    if (this.configService.userRoles) {
      this.myRoles = this.configService.userRoles
    }

    this.leftmenues = this.activatedRoute.snapshot.data &&
      this.activatedRoute.snapshot.data.pageData.data.requestMenu || []
    this.initCardTable()
    this.isAdmin = this.accessService.hasRole(['admin', 'super-admin', 'content-admin', 'editor', 'content_creator'])
    this.fetchInitData()
  }

  ngOnInit() {
    this.defaultSideNavBarOpenedSubscription = this.isLtMedium$.subscribe(isLtMedium => {
      this.sideNavBarOpenedMain = !isLtMedium
      this.screenSizeIsLtMedium = isLtMedium
    })

  }
  private areaFilter(value: string): string[] {
    const filterValue = (value) ? value.toLowerCase() : ''
    return this.areaList.filter(option => option.name.toLowerCase().includes(filterValue))
  }
  fetchInitData() {
    this.competencyDetailsForm = new FormGroup({
      label: new FormControl('', [Validators.required]),
      desc: new FormControl('', [Validators.required]),
      typ: new FormControl('Behavioural', [Validators.required]),
      area: new FormControl('', [Validators.required]),
      children: new FormControl(null, [Validators.required, Validators.minLength(2)]),
    })
    if (this.competencyDetailsForm) {
      this.filteredOptions = this.competencyDetailsForm.controls['area'].valueChanges.pipe(
        startWith(''),
        map(value => this.areaFilter(value))
      )
    }
    this.getList()
  }

  ngOnDestroy() {
    if (this.defaultSideNavBarOpenedSubscription) {
      this.defaultSideNavBarOpenedSubscription.unsubscribe()
    }
  }

  onSubmit() {
    if (this.competencyDetailsForm.valid) {
      if (this.compList && this.compList.length >= 3) {
        const data: NSCompetencyV2.ICompetencyDictionary = {
          additionalProperties: {
            competencyType: _.get(this.competencyDetailsForm.value, 'typ'),
            // cod: '',
            competencyArea: _.get(this.competencyDetailsForm.value, 'area'),
          },
          competencyType: '',
          description: _.get(this.competencyDetailsForm.value, 'desc'),
          id: undefined,
          name: _.get(this.competencyDetailsForm.value, 'label'),
          source: 'CBP',
          type: 'COMPETENCY',
          children: _.map(this.compList, (l: ICompLevel) => {
            return {
              type: 'COMPETENCIESLEVEL',
              name: l.name || l.level,
              level: l.level,
              description: l.description,
            }
          }),
        }
        this.compService.requestCompWithCheild(data).subscribe(resp => {
          if (resp && _.get(resp, 'statusInfo.statusCode') === 200) {
            this.snackBar.open('Success')
            this.competencyDetailsForm.reset()
            this.router.navigate(['author', 'competencies'])
          }
        })
      } else {
        this.snackBar.open('Minimum Three(3) competence level required to request this Competency.')
      }
    } else {
      this.snackBar.open('Please fill all mandatory fileds first.')
    }
  }
  create(data?: ICompLevel) {
    this.dialog.open<AddCompLevelComponent>(AddCompLevelComponent, { data: data || {} })
      .afterClosed()
      .subscribe((res: any) => {
        if (res && res.result) {
          if (this.compList.length === 0) {
            this.compList = [res.result]
          } else {
            const idx = _.findIndex(this.compList, i => i.level === _.get(res, 'result.level'))
            if (idx === -1) {
              this.compList.push(res.result)
            } else {
              delete this.compList[idx]
              this.compList[idx] = res.result
            }
          }
          this.competencyDetailsForm.controls['children'].setValue(this.compList)
        }
      })
  }
  open($event: any) {
    this.create($event)
  }
  getList() {
    this.areaList = _.get(this.activatedRoute, 'snapshot.data.areaList.data.responseData') || []
  }
  initCardTable() {
    this.table = {
      columns: [
        {
          displayName: 'Name', key: 'name', isList: false, prop: '',
          // link: { path: '/author/content-detail/', dParams: 'identifier' },
          defaultValue: 'Untitled Competency',
          // image: 'appIcon',
        },
        { displayName: 'Level', key: 'level', isList: false, prop: '', defaultValue: 'NA' },
        { displayName: 'Description', key: 'description', defaultValue: 0 },
      ], //  :> this will load from json
      actions: [], // :> this will load from json
      needCheckBox: false,
      needHash: false,
      sortColumn: 'name',
      sortState: 'asc',
      display: 'card',
      darkCard: true,
      removeCardHead: true,
      actionsMenu: {
        headIcon: 'apps',
        menus: [
          { name: 'Edit', action: 'edit', disabled: false, icon: 'edit' },
          { name: 'Delete', action: 'delete', disabled: false, icon: 'delete' },
        ],
        rowIcon: 'more_vert',
      },
    }
  }
  get getTableData(): ICompLevel[] {
    return _.map(this.compList, (l: ICompLevel) => {
      return {
        // type: 'COMPETENCIESLEVEL',
        name: l.name || l.level,
        level: l.level,
        description: l.description,
      }
    })
  }
  cancel() {
    this.router.navigate(['author', 'competencies', 'competency', 'dictionary'])
  }
}
