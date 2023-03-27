import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Subscription } from 'rxjs'
import { AccessControlService } from '../../../../../../../../public-api'
import { IAuthoringPagination } from '../../../../../../../interface/authored'
import { NSContent } from '../../../../../../../interface/content'
import { AuthInitService } from '../../../../../../../services/init.service'
import { LoaderService } from '../../../../../../../services/loader.service'
import { MyContentService } from '../../services/content-detail.service'
import { LocalDataService } from '../../services/local-data.service'
import { NestedTreeControl } from '@angular/cdk/tree'
import { MatTreeNestedDataSource } from '@angular/material/tree'

/* tslint:disable */
import _ from 'lodash'
import { NsContent } from '../../../../../../../../../../../../library/ws-widget/collection/src/public-api'
/* tslint:enable */
interface ITreeNode {
  name: string
  primaryCategory: string
  children?: ITreeNode[]
  expanded: boolean,
  time: number,
  icon: string,
  depth: number,
  hasChildren: boolean
}

@Component({
  selector: 'ws-auth-content-content',
  templateUrl: './content-content.component.html',
  styleUrls: ['./content-content.component.scss'],
})
export class ContentContentComponent implements OnInit, AfterViewInit, OnDestroy {

  public contentId: string | null = null
  public content!: NSContent.IContentMeta
  public pagination!: IAuthoringPagination
  routerSubscription = <Subscription>{}
  public status = 'published'
  TREE_DATA!: ITreeNode[]
  TYPE = NSContent.EPrimaryCategoryType
  finalFilters: any = []
  currentAction: 'author' | 'reviewer' | 'expiry' | 'deleted' = 'author'
  allLanguages: any[] = []
  searchLanguage = ''
  isAdmin = false
  treeControl = new NestedTreeControl<ITreeNode>(node => node.children)
  dataSource = new MatTreeNestedDataSource<ITreeNode>()
  @ViewChild('tree', { static: true }) tree!: any

  constructor(
    private myContSvc: MyContentService,
    private activatedRoute: ActivatedRoute,
    private loadService: LoaderService,
    private accessService: AccessControlService,
    private authInitService: AuthInitService,
    private dataService: LocalDataService,
  ) {
    this.isAdmin = this.accessService.hasRole(['admin', 'super-admin', 'content-admin', 'editor'])
  }
  // tslint:disable-next-line
  hasChild = (_: number, node: ITreeNode) => !!node.children && node.children.length > 0;
  ngOnDestroy() {
    if (this.routerSubscription.unsubscribe) {
      this.routerSubscription.unsubscribe()
    }
    // if (this.defaultSideNavBarOpenedSubscription) {
    //   this.defaultSideNavBarOpenedSubscription.unsubscribe()
    // }
    this.loadService.changeLoad.next(false)
  }
  ngOnInit() {
    this.pagination = {
      offset: 0,
      limit: 24,
    }
    this.allLanguages = this.authInitService.ordinals.subTitles || []
    this.activatedRoute.queryParams.subscribe(params => {
      this.status = params.status || 'published'
      this.setAction()
      this.fetchContent()
    })
  }
  ngAfterViewInit() {
    this.treeControl.expandAll()
  }
  setAction() {
    switch (this.status) {
      case 'draft':
      case 'rejected':
      case 'inreview':
      case 'review':
      case 'published':
      case 'publish':
      case 'processing':
      case 'unpublished':
      case 'deleted':
        this.currentAction = 'author'
        break
      case 'expiry':
        this.currentAction = 'expiry'
        break
    }
  }
  getClassName(primaryCategory: string): string {
    switch (primaryCategory) {
      case NsContent.EPrimaryCategory.RESOURCE:
        return 'resource'
      case NsContent.EPrimaryCategory.MODULE:
        return 'module'
      case NsContent.EPrimaryCategory.COURSE:
        return 'course'
      case NsContent.EPrimaryCategory.PROGRAM:
        return 'program'
      default:
        return ''
    }
  }
  fetchContent() {
    this.contentId = this.activatedRoute.snapshot.paramMap.get('contentId') || null
    const routeData = this.activatedRoute.snapshot.data.content
    if (!routeData) {
      if (this.contentId) {
        this.myContSvc.readContent(this.contentId).subscribe(s => {
          _.set(this, 'content', s)
          this.dataService.initData(s)
          this.buildTree()
        })
      }
    } else {
      _.set(this, 'content', routeData)
      this.dataService.initData(routeData)
      this.buildTree()
    }
  }
  buildTree() {
    const data = this.buildTreeStruct(this.content, 0)
    this.TREE_DATA = data.children || []
    this.dataSource.data = this.TREE_DATA
    // console.log(data)
    this.treeControl.dataNodes = this.TREE_DATA
    this.treeControl.expandAll()
  }
  buildTreeStruct(content: NSContent.IContentMeta, depth: number): ITreeNode {
    const depths = depth
    return {
      name: content.name,
      primaryCategory: content.primaryCategory,
      time: parseInt(content.duration || '0', 10) || 0,
      icon: this.accessService.getIcon(content),
      expanded: true,
      depth: depths,
      hasChildren: !!(content.children && content.children.length),
      children: content.children && content.children.length > 0
        ? _.map(content.children, cnt => this.buildTreeStruct(cnt, depths + 1))
        : [],
    }
  }
}
