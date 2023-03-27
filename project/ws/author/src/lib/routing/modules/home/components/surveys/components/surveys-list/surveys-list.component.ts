import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router'
import { ConfigurationsService } from '@ws-widget/utils/src/public-api'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { copyToClipboard, NSSurvey } from '../../models/survey.model'
import { LoaderService } from '../../../../../../../services/loader.service'
import { animate, state, style, transition, trigger } from '@angular/animations'
import { MatPaginator, MatSnackBar, MatSort, MatTableDataSource } from '@angular/material'
import { environment } from '../../../../../../../../../../../../src/environments/environment'
import { SurveyService } from '../../services/survey.service'
// tslint:disable-next-line:import-name
import _ from 'lodash'

@Component({
  selector: 'ws-auth-surveys-list',
  templateUrl: './surveys-list.component.html',
  styleUrls: ['./surveys-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class SurveysListComponent implements OnInit, AfterViewInit {
  myRoles!: Set<string>
  userId!: string
  surveys!: NSSurvey.ISurveysResponse[]
  attachedCourses: any = []
  isExpand = true
  actionsMenu = {
    headIcon: 'apps',
    menus: [
      { name: 'Edit', action: 'edit', disabled: false, icon: 'edit' },
      { name: 'Delete', action: 'delete', disabled: false, icon: 'delete' },
    ],
    rowIcon: 'more_horiz',
  }
  @ViewChild('searchInput', { static: true }) searchInputElem: ElementRef<any> = {} as ElementRef<any>
  allResponsesData: any
  expandedElement = null
  searchValue!: string
  displayedColumns: string[] = ['surveyTitle', 'createdDate', 'responses', 'surveyLink', 'action', 'expand']
  tableDataSource = new MatTableDataSource<any>()
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator | null = null
  @ViewChild(MatPaginator, { static: false }) set matPaginator(paginator: MatPaginator) {
    this.paginator = paginator
    this.setDataSourceAttributes()
  }
  @ViewChild(MatSort, { static: false }) sort: MatSort | null = null
  setDataSourceAttributes() {
    this.tableDataSource.paginator = this.paginator
  }

  constructor(
    private router: Router,
    private accessService: AccessControlService,
    private configService: ConfigurationsService,
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService,
    private snackBar: MatSnackBar,
    private surveySvc: SurveyService,
  ) {
    this.userId = this.accessService.userId
    if (this.configService.userRoles) {
      this.myRoles = this.configService.userRoles
    }
  }

  ngOnInit() {
    this.surveys = this.activatedRoute.snapshot.data.surveys.data
    if (this.surveys && this.surveys.length > 0) {
      this.surveys.map(s => {
        s.expand = false
        if (s.expand) {
          this.isExpand = true
        } else {
          this.isExpand = false
        }
      })
    }
    this.tableDataSource = new MatTableDataSource<NSSurvey.ISurveysResponse>(this.surveys)
  }

  ngAfterViewInit(): void {
    this.tableDataSource.sort = this.sort
  }

  createNewSurvey() {
    this.router.navigate(['author', 'surveys', 'create-survey'])
  }

  getAttachedCourses(survey: any) {
    survey.expand = !survey.expand

    if (survey && survey.expand === true) {
      this.loaderService.changeLoad.next(true)
      this.attachedCourses = []
      const survObj = {
        searchObjects: [
          {
            key: 'formId',
            values: survey.id,
          },
        ],
      }
      this.surveySvc.fetchAttachedCourses(survObj).subscribe(
        (_res: any) => {
          this.allResponsesData = _res.responseData
          this.attachedCourses = this.allResponsesData.reduce((acc: any, it: any) => {
            acc[it.dataObject['Course ID and Name']] = acc[it.dataObject['Course ID and Name']] + 1 || 1
            return acc
            // tslint:disable-next-line:align
          }, {})

          // tslint:disable-next-line:align
          this.loaderService.changeLoad.next(false)
        },
        (_err: any) => {
          this.openSnackbar('Error in fetching attached courses for this survey!')
          this.loaderService.changeLoad.next(false)
        },
        () => this.loaderService.changeLoad.next(false)
      )
    }
  }

  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }

  copyLink(id: string) {
    const surveyLink = `${environment.karmYogi}surveys/${id}`
    copyToClipboard({ value: surveyLink }).then(
      (_res: any) => {
        this.snackBar.open('Survey link copied to clipboard!')
      },
      (_err: any) => {
        this.snackBar.open('Error while copying the survey link!')
      }
    )
  }

  // showMenuItem(menuType: string, survey: any) {
  //   let returnValue = false
  //   switch (menuType) {
  //     case 'edit':
  //       if (survey) {
  //         returnValue = this.hasAccess(survey)
  //       }
  //       break
  //     case 'preview':
  //       if (survey) {
  //         returnValue = this.hasAccess(survey)
  //       }
  //       break
  //     case 'delete':
  //       if (survey) {
  //         returnValue = this.hasAccess(survey)
  //       }
  //       break
  //   }
  //   return returnValue
  // }

  // hasAccess(
  //   _meta: any,
  // ): boolean {
  //   if (this.hasRole(['content_reviewer', 'content_publisher', 'content_editor']) && this.configService.userProfileV2) {
  //     // if (meta.createdBy === this.configService.userProfileV2.userId) {
  //     //   return false
  //     // }
  //     return true
  //   }
  //   return false
  // }
  // hasRole(role: string[]): boolean {
  //   let returnValue = false
  //   role.forEach(v => {
  //     if ((this.myRoles || new Set()).has(v)) {
  //       returnValue = true
  //     }
  //   })
  //   return returnValue
  // }

  takeAction(action: any, survey: any) {
    if (action) {
      switch (action) {
        case 'edit':
          // tslint:disable-next-line:no-console
          // console.log('Edit clicked')
          this.router.navigate(['author/surveys/create-survey'], { queryParams: { mode: 'edit', survey: survey.id } })
          break
        case 'preview':
          // tslint:disable-next-line:no-console
          // console.log('Preview clicked')
          this.router.navigate(['author/surveys/preview'], { queryParams: { survey: survey.id } })
          break
        case 'delete':
          // this.action({ type: event.action, data: event.data })
          // tslint:disable-next-line:no-console
          console.log('delete clicked')
          break
        default:
          break
      }
    }
  }

  navigateToResponses(sid: any, cid: any) {
    const cd = cid.split(',')
    const courseID = cd[0]
    const res = this.allResponsesData.filter((it: any) => it.dataObject.courseId === courseID)
    const data: NavigationExtras = {
      state: {
        responsesList: res,
      },
    }
    // tslint:disable-next-line:prefer-template
    this.router.navigate(['author/surveys/' + sid + '/' + courseID], data)
  }

  filterData() {
    const filteredData = this.surveys.filter((v: any) => v.title.toLowerCase().match(this.searchValue.toLowerCase()))
    this.tableDataSource = new MatTableDataSource<NSSurvey.ISurveysResponse>(filteredData)
    this.tableDataSource.paginator = this.paginator
    this.tableDataSource.sort = this.sort
  }
}
