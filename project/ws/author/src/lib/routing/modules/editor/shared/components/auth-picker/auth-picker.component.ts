import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core'
import { MatDialogRef } from '@angular/material'
import { ConfigurationsService, TFetchStatus } from '@ws-widget/utils'
import { SEARCH } from '@ws/author/src/lib/constants/apiEndpoints'
import { NSContent } from '@ws/author/src/lib/interface/content'
// import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { ApiService } from '@ws/author/src/lib/modules/shared/services/api.service'
/* tslint:disable */
import _ from 'lodash'
/* tslint:enable */
import { BehaviorSubject, EMPTY, Subscription, timer } from 'rxjs'
import { debounce, mergeMap } from 'rxjs/operators'

interface IAuthPickerData {
  filter: any
  selectedIds: string[]
}
@Component({
  selector: 'ws-auth-picker',
  templateUrl: './auth-picker.component.html',
  styleUrls: ['./auth-picker.component.scss'],
  // tslint:disable-next-line: use-component-view-encapsulation
  encapsulation: ViewEncapsulation.None,
})
export class AuthPickerComponent implements OnInit, OnDestroy {

  @Input() filterData!: IAuthPickerData
  @Output() selectedCourseData = new EventEmitter<any>()

  query = ''
  selectedContents: NSContent.IContentMeta[] = []
  selectedContentIds = new Set<string>()
  searchFetchStatus: TFetchStatus = 'none'
  searchResults: NSContent.IContentMeta[] = []
  debounceSubject = new BehaviorSubject<boolean>(false)
  debounceSubscription: Subscription | null = null
  defaultThumbnail = ''
  preSelected = new Set()
  showMine = true

  constructor(
    private configSvc: ConfigurationsService,
    private apiService: ApiService,
    public dialogRef: MatDialogRef<AuthPickerComponent>,
    // private accessService: AccessControlService,
    // @Inject(MAT_DIALOG_DATA) public data: IAuthPickerData,
  ) {
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
      this.defaultThumbnail = instanceConfig.logos.defaultContent
    }
  }

  ngOnInit() {
    this.initializeSearchSubject()
    if (this.filterData) {
      this.preSelected = new Set(Array.from(this.filterData.selectedIds || new Set()))
    }
  }

  async initializeSearchSubject() {
    this.debounceSubscription = this.debounceSubject
      .pipe(
        debounce(shouldDebounce => (shouldDebounce ? timer(500) : EMPTY)),
        mergeMap(() => {
          this.searchFetchStatus = 'fetching'
          this.searchResults = []
          const searchQuery = {
            locale: this.configSvc.activeLocale && [(this.configSvc.activeLocale.locals[0] || 'en')],
            query: this.query || '',
            request: {
              facets: ['primaryCategory', 'mimeType'],
              query: this.query || '',
              filters:
              {
                // andFilters: [
                //   {
                ...this.filterData.filter,
                // },
                // ],
              },
              // rootOrg: this.accessService.rootOrg,
              sort_by: { lastUpdatedOn: 'desc' },
              // uuid: this.accessService.userId,
              limit: 200,
              offset: 0,
            },

          }
          if (this.showMine && this.configSvc.userProfile) {
            _.set(searchQuery.request.filters, 'createdBy', this.configSvc.userProfile.userId)
            // searchQuery.filters[0].andFilters[0].status = searchQuery.filters[0].andFilters[0]
            //   .status
            //   ? searchQuery.filters[0].andFilters[0].status
            //   : ['Draft', 'InReview', 'QualityReview', 'Reviewed', 'Live']
          } // else {
          //   _.set(searchQuery.request.filters, 'createdFor', (this.configSvc.userProfile ? [this.configSvc.userProfile.rootOrgId] : []))
          // }
          return this.apiService.post<any>(SEARCH, searchQuery)
        }),
      )
      .subscribe(
        search => {
          this.searchFetchStatus = 'done'
          if (search && search.result && search.result.content) {
            this.searchResults = search.result.content
          }
        },
        () => {
          this.searchFetchStatus = 'error'
        },
      )
  }

  selectedContentChanged(content: NSContent.IContentMeta, checked: boolean) {
    if (checked) {
      this.selectedContents.push(content)
      this.selectedContentIds.add(content.identifier)
    } else {
      this.selectedContentIds.delete(content.identifier)
      this.selectedContents = this.selectedContents.filter(v => v.identifier !== content.identifier)
    }
  }

  takeAction(type: string) {
    switch (type) {
      case 'add': this.selectedCourseData.emit(this.selectedContents)
        break
      case 'close': this.selectedCourseData.emit([])
        break
    }
  }

  ngOnDestroy() {
    if (this.debounceSubscription) {
      this.debounceSubscription.unsubscribe()
    }
  }
}
