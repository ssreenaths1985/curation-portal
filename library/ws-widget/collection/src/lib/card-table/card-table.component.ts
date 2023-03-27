import { SelectionModel } from '@angular/cdk/collections'
import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core'
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { IColums, ITable } from './card-table.model'
/* tslint:disable */
import _ from 'lodash'
import { NSContent } from '@ws/author/src/lib/interface/content'
import { ConfigurationsService } from '@ws-widget/utils'
import { NsContent } from '../_services/widget-content.model'
import { environment } from '../../../../../../src/environments/environment'
/* tslint:enable */
@Component({
  selector: 'ws-widget-table-card-content',
  templateUrl: './card-table.component.html',
  styleUrls: ['./card-table.component.scss'],
})
export class CardTableComponent extends WidgetBaseComponent
  implements OnInit, OnDestroy, AfterViewInit, OnChanges, NsWidgetResolver.IWidgetData<ITable> {
  @Input() widgetData!: ITable
  @HostBinding('id')
  public id = `ws-card_${Math.random()}`
  @HostBinding('class') class = 'flex-1'

  @Input() data?: []
  selection = new SelectionModel<any>(true, [])
  @Input() userRoles: Set<string> | null = null
  @Input() userId!: string
  @Output() clicked?: EventEmitter<any>
  @Output() actionsClick?: EventEmitter<any>
  bodyHeight = document.body.clientHeight - 125
  displayedColumns!: IColums[]
  dataSource = new MatTableDataSource<any>()
  display = 'table'
  cardTableColumns!: IColums[]
  pCategory = NsContent.EPrimaryCategory
  @ViewChild(MatSort, { static: false }) set matSort(sort: MatSort) {
    if (!this.dataSource.sort) {
      this.dataSource.sort = sort
    }
  }
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator
  constructor(
    private configSvc: ConfigurationsService,
  ) {
    super()
    this.actionsClick = new EventEmitter()
    this.clicked = new EventEmitter()
  }

  jsonVerify(s: string) { try { JSON.parse(s); return true } catch (e) { return false } }

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.')
  }
  updatedisplay() {
    this.display = this.display === 'table' ? 'card' : 'table'
  }
  ngOnInit() {
    if (this.widgetData) {
      this.displayedColumns = this.widgetData.columns || []
      if (this.data) {
        this.dataSource.data = this.data
        this.dataSource.paginator = this.paginator
      }
    }
  }

  ngOnChanges(data: any) {
    this.dataSource.data = _.get(data, 'data.currentValue')
  }

  ngAfterViewInit() {
    // this.cd.detectChanges();
  }
  changeToDefaultImg($event: any) {
    $event.target.src = '/assets/instances/eagle/app_logos/default.png'
  }
  changeToDefaultSourceImg($event: any) {
    $event.target.src = '/assets/instances/eagle/app_logos/sourcenew.png'
  }
  getRatingIcon(content: any, ratingIndex: number): 'star' | 'star_border' | 'star_half' {
    if (content && content.averageRating) {
      const avgRating = content.averageRating
      const ratingFloor = Math.floor(avgRating)
      if (ratingIndex <= ratingFloor) {
        return 'star'
      }
      if (ratingFloor === ratingIndex - 1 && avgRating % 1 > 0) {
        return 'star_half'
      }
    }
    return 'star_border'
  }
  applyFilter(filterValue: any) {
    if (filterValue && filterValue.value) {
      let fValue = filterValue.value.trim()
      fValue = filterValue.value.toLowerCase()
      this.dataSource.filter = fValue
    } else {
      this.dataSource.filter = ''
    }
  }
  buttonClick(action: string, row: any) {
    // console.log(action, row);
    const isDisabled = _.get(_.find(this.widgetData.actions, ac => ac.name === action), 'disabled') || false
    if (!isDisabled && this.actionsClick) {
      this.actionsClick.emit({ action, row })
    }
  }
  getFinalColumns() {
    const columns = _.map(this.widgetData.columns, c => c.key)
    if (this.widgetData.needCheckBox) {
      columns.splice(0, 0, 'select')
    }
    if (this.widgetData.needHash) {
      columns.splice(0, 0, 'SR')
    }
    if (this.widgetData.actions && this.widgetData.actions.length > 0) {
      columns.push('Actions')
    }
    if (this.widgetData.actionsMenu && this.widgetData.actionsMenu.menus.length > 0) {
      columns.push('ActionsMenu')
    }
    // console.log(columns);

    return columns || []
  }

  getCardHeadRows() {
    const col = _.first(this.widgetData.columns)
    if (col) {
      this.cardTableColumns = [col]
      const newColumns = [_.first(_.map(this.widgetData.columns, c => c.key))]
      newColumns.push('ActionsMenu')
      return newColumns
    }
    return []
  }
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length
    const numRows = this.dataSource.data.length
    return numSelected === numRows
  }
  filterList(list: any[], key: string) {
    return list.map(lst => lst[key])
  }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row))
  }
  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`
  }

  showMenuItem(menuType: string, row: any) {
    let returnValue = false
    if (row && row.primaryCategory === NsContent.EPrimaryCategory.RESOURCE) {
      returnValue = false
    } else {
      switch (menuType) {
        case 'edit':
          if (row.status === 'Draft' || row.status === 'Live') {
            returnValue = this.hasAccess(row)
          }
          if (row.authoringDisabled && menuType === 'edit') {
            returnValue = false
          }
          break
        case 'delete':
          if (row.status === 'Draft') {
            returnValue = this.hasAccess(row)
          }
          break
        case 'moveToDraft':
          if (
            row.status === 'InReview' ||
            row.status === 'Unpublished' ||
            row.status === 'Reviewed' ||
            row.status === 'QualityReview'
          ) {
            returnValue = this.hasAccess({ ...row, status: 'Draft' })
          }
          break
        case 'moveToInReview':
          if (row.status === 'Reviewed' || row.status === 'QualityReview') {
            returnValue = this.hasAccess({ ...row, status: 'InReview' })
          }
          break
        case 'publish':
          if (row.reviewStatus === 'Reviewed' && row.status === 'Review') {
            returnValue = this.hasAccess(row)
          }
          break
        case 'unpublish':
          if (row.status === 'Live') {
            returnValue = this.hasAccess(row)
          }
          break
        case 'review':
          if (row.reviewStatus === 'InReview' && row.status === 'Review') {
            returnValue = this.hasAccess(row)
          }
          break
        case 'lang':
          returnValue = this.hasAccess({ ...row, status: 'Draft' })
          break
      }
    }
    return returnValue
  }
  takeAction(action: string, row: any) {
    const isDisabled = _.get(_.find(this.widgetData.actions, ac => ac.name === action), 'disabled') || false
    if (!isDisabled && this.actionsClick) {
      this.actionsClick.emit({ type: action, data: row })
    }
  }
  hasAccess(
    meta: NSContent.IContentMeta,
    forPreview = false,
    parentMeta?: NSContent.IContentMeta,
  ): boolean {
    if (this.hasRole(['editor', 'admin']) && this.configSvc.userProfileV2) {
      if (meta.status === 'Review' && meta.createdBy === this.configSvc.userProfileV2.userId) {
        return false
      }
      return true
    }
    let returnValue = false
    if (['Draft', 'Live'].indexOf(meta.status) > -1) {
      if (meta.createdBy && meta.createdBy.length) {
        if (meta.createdBy === this.userId) {
          returnValue = true
        }
      }
    }
    if ((meta.reviewStatus === 'InReview' && meta.status === 'Review') && this.hasRole(['content_reviewer'])) {
      if (meta.reviewerIDs && meta.reviewerIDs.length > 0) {
        if (meta.reviewerIDs.includes(this.userId)) {
          returnValue = true
        }
      }
      if (!returnValue && parentMeta && parentMeta.createdBy && meta.createdBy) {
        returnValue = (parentMeta.createdBy === meta.createdBy) ? true : false
      }
    }
    if ((meta.reviewStatus === 'Reviewed' && meta.status === 'Review') && this.hasRole(['content_publisher'])) {
      if (meta.publisherIDs && meta.publisherIDs.length > 0) {
        if (meta.publisherIDs.includes(this.userId)) {
          returnValue = true
        }
      }
      if (!returnValue && parentMeta && parentMeta.createdBy && meta.createdBy) {
        returnValue = (parentMeta.createdBy === meta.createdBy) ? true : false
      }
    }
    if (forPreview && meta.visibility === 'Public') {
      returnValue = true
    }
    return returnValue
  }
  hasRole(role: string[]): boolean {
    let returnValue = false
    role.forEach(v => {
      if ((this.userRoles || new Set()).has(v)) {
        returnValue = true
      }
    })
    return returnValue
  }

  getUrl(url: string) {
    if (url && url.length > 0) {
      const tempData = url.split('content')
      if (url.indexOf(`/collection`) > 0) {
        return `${environment.cbpPortal}${environment.contentBucket}${tempData[tempData.length - 1]}`
      }
      return `${environment.cbpPortal}${environment.contentBucket}/content${tempData[tempData.length - 1]}`
    }
    return url
  }

  getRedirectUrl(col: any, contentData: any) {
    switch (contentData.status.toLowerCase()) {
      case 'draft':
        if (contentData.createdBy === this.userId) {
          return `${col.draftLink.path}${contentData['identifier']}`
        }
        break
      case 'review':
        if (contentData.reviewStatus.toLowerCase() === 'inreview' &&
          (contentData.reviewerIDs && contentData.reviewerIDs.length > 0 && contentData.reviewerIDs.includes(this.userId))) {
          return `${col.draftLink.path}${contentData['identifier']}`
        }
        if (contentData.reviewStatus.toLowerCase() === 'reviewed' &&
          (contentData.publisherIDs && contentData.publisherIDs.length > 0 && contentData.publisherIDs.includes(this.userId))) {
          return `${col.draftLink.path}${contentData['identifier']}`
        }
        break
    }
    return `${col.link.path}${contentData['identifier']}`
  }
}
