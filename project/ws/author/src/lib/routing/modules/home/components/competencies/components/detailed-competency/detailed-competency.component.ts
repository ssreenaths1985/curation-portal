import { Component, OnInit, OnDestroy } from '@angular/core'
import { map } from 'rxjs/operators'
import { ConfigurationsService, ValueService } from '@ws-widget/utils/src/public-api'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
/* tslint:disable */
import _ from 'lodash'
import { ActivatedRoute } from '@angular/router'
import { ILeftMenu } from '../../../../../../../../../../../../library/ws-widget/collection/src/public-api'
import { Subject } from 'rxjs'
import { NSCompetencyV2 } from '../../interface/competency'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
/* tslint:enable */

@Component({
  selector: 'ws-auth-detailed-competency',
  templateUrl: './detailed-competency.component.html',
  styleUrls: ['./detailed-competency.component.scss'],
})
export class DetailedCompetencyComponent implements OnInit, OnDestroy {
  eventsSubject: Subject<void> = new Subject<void>()
  public sideNavBarOpenedMain = true
  compId!: string
  isAdmin = false
  leftmenues!: ILeftMenu[]
  departmentData: any
  myRoles!: Set<string>
  selectedCompId!: string
  selectedCompData!: NSCompetencyV2.ICompetencyDictionary
  userId!: string
  isLtMedium$ = this.valueSvc.isLtMedium$
  private defaultSideNavBarOpenedSubscription: any
  mode$ = this.isLtMedium$.pipe(map(isMedium => (isMedium ? 'over' : 'side')))
  public screenSizeIsLtMedium = false
  status = 'levels'
  /**Tagged CBPs */
  filterType = 'all'
  filtertext!: string
  /**Tagged CBPs */

  constructor(
    private activatedRoute: ActivatedRoute,
    private valueSvc: ValueService,
    private accessService: AccessControlService,
    private configService: ConfigurationsService,
    private sanitized: DomSanitizer,
    // private router: Router,
  ) {
    this.userId = this.accessService.userId
    if (this.configService.userRoles) {
      this.myRoles = this.configService.userRoles
    }

    this.leftmenues = this.activatedRoute.snapshot.data &&
      this.activatedRoute.snapshot.data.pageData.data.detailMenu || []

    this.isAdmin = this.accessService.hasRole(['admin', 'super-admin', 'content-admin', 'editor', 'content_creator'])
    this.fetchInitData()
  }

  ngOnInit() {
    this.defaultSideNavBarOpenedSubscription = this.isLtMedium$.subscribe(isLtMedium => {
      this.sideNavBarOpenedMain = !isLtMedium
      this.screenSizeIsLtMedium = isLtMedium
    })
    this.activatedRoute.params.subscribe(params =>
      this.compId = params['competencyId']
    )
    // this.activatedRoute.queryParams.subscribe(pParams => {
    //   if (pParams && pParams['typ']) {
    //     this.status = pParams['typ']
    //   }
    // })
    // this.activatedRoute.paramMap.subscribe(params => {
    //   this.selectedCompId = params.get('competencyId') || ''
    // }, () => {
    //   this.router.navigate(['error-internal-server'])
    // })
  }
  fetchInitData() {
    const data = _.get(this.activatedRoute, 'snapshot.data.competency.data.responseData')
    if (data) {
      this.selectedCompData = data
    }
  }
  updateStatus(newStatus: 'levels' | 'roles' | 'positions') {
    this.status = newStatus
  }
  get filterPath() {
    return `${'/author/competencies/competency'}/${this.compId}`
  }
  ngOnDestroy() {
    if (this.defaultSideNavBarOpenedSubscription) {
      this.defaultSideNavBarOpenedSubscription.unsubscribe()
    }
  }

  save() {
    this.eventsSubject.next()

  }

  formate(text: string): SafeHtml {
    let newText = '<ul>'
    if (text) {
      const splitTest = text.split('\n')
      for (let index = 0; index < splitTest.length; index += 1) {
        const text1 = splitTest[index]
        if (text1 && text1.trim()) {
          newText += `<li>${text1.trim()}</li>`
        }
      }
    }
    newText += `</ul>`
    return this.sanitized.bypassSecurityTrustHtml(newText)
  }

  /**Tagged CBPs */
  filterCBP(filter: 'all' | 'own') {
    if (filter && !this.filtertext) {
      this.filterType = filter
    }
  }
  /**Tagged CBPs */

}
