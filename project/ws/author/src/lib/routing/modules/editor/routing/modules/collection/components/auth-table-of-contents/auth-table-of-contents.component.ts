import { FlatTreeControl } from '@angular/cdk/tree'
import { Component, EventEmitter, OnDestroy, OnInit, Output, AfterViewInit } from '@angular/core'
import { MatDialog, MatSnackBar } from '@angular/material'
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { ConfirmDialogComponent } from '@ws/author/src/lib/modules/shared/components/confirm-dialog/confirm-dialog.component'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { AuthInitService } from '@ws/author/src/lib/services/init.service'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { EditorContentService } from '../../../../../services/editor-content.service'
import { IContentNode, IContentTreeNode } from '../../interface/icontent-tree'
import { AuthPickerComponent } from '../../../../../shared/components/auth-picker/auth-picker.component'
import { CollectionStoreService } from '../../services/store.service'
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout'
import { catchError, map, tap } from 'rxjs/operators'
import { PickNameComponent } from './pick-name/pick-name.component'
import { NSApiRequest } from '../../../../../../../../interface/apiRequest'
import { EditorService } from '@ws/author/src/lib/routing/modules/editor/services/editor.service'
import { ConfirmModalComponent } from '../../../../../shared/components/confirm-modal/confirm-modal.component'
/* tslint:disable */
import _ from 'lodash'
import { EMPTY, forkJoin } from 'rxjs'
import { NsContent } from '../../../../../../../../../../../../../library/ws-widget/collection/src/public-api'
import { NSContent } from '../../../../../../../../interface/content'
import { ConfigurationsService } from '../../../../../../../../../../../../../library/ws-widget/utils/src/public-api'
/* tslint:enable */
@Component({
  selector: 'ws-auth-table-of-contents',
  templateUrl: './auth-table-of-contents.component.html',
  styleUrls: ['./auth-table-of-contents.component.scss'],
})
export class AuthTableOfContentsComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() action = new EventEmitter<{ type: string; identifier: string; selectedNode: IContentTreeNode }>()
  @Output() closeEvent = new EventEmitter<boolean>()
  treeControl!: FlatTreeControl<IContentTreeNode>
  treeFlattener!: MatTreeFlattener<IContentNode, IContentTreeNode>
  dataSource!: MatTreeFlatDataSource<IContentNode, IContentTreeNode>
  isDragging = false
  dropContainer: IContentTreeNode | null = null
  dragContainer: IContentTreeNode | null = null
  expandDelay = 500
  isDropDisabled = false
  expandTimeout: any
  draggingPosition: 'above' | 'below' | 'center' | null = null
  selectedNode: number | null = null
  expandedNodes = new Set<number>()
  parentNodeId!: number
  drawer = true
  menubtn = true
  parentHierarchy: number[] = []
  backUpInformation = {
    isDragging: false,
    dropContainer: null as any,
    dragContainer: null as any,
    draggingPosition: null as any,
  }
  invalidIds: number[] = []
  mediumScreen = false
  mediumSizeBreakpoint$ = this.breakpointObserver
    .observe([Breakpoints.XSmall, Breakpoints.Small])
    .pipe(map((res: BreakpointState) => res.matches))
  leftarrow = true
  currentContent!: string
  primaryCategoryValues = NsContent.EPrimaryCategory
  parentContentMeta?: NSContent.IContentMeta
  addContentsAsChild = false
  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private store: CollectionStoreService,
    private editorStore: EditorContentService,
    private loaderService: LoaderService,
    private authInitService: AuthInitService,
    private breakpointObserver: BreakpointObserver,
    private editorService: EditorService,
    private configService: ConfigurationsService,
  ) { }

  private _transformer = (node: IContentNode, level: number): IContentTreeNode => {
    return {
      level,
      id: node.id,
      identifier: node.identifier,
      contentType: node.contentType,
      primaryCategory: node.primaryCategory,
      expandable: !!node.children && node.children.length > 0,
      children: node.children ? node.children.map(v => v.id) : [],
      editable: node.editable,
      childLoaded: node.childLoaded,
      parentId: node.parentId,
    }
  }

  ngOnInit() {
    // const contentMeta = this.editorStore.getOriginalMeta(this.editorStore.parentContent)
    // if (contentMeta && contentMeta.children && contentMeta.primaryCategory
    //   !== NsContent.EPrimaryCategory.PROGRAM) {
    this.init()
    // }
  }
  ngAfterViewInit(): void {
    // const contentMeta = this.editorStore.getOriginalMeta(this.editorStore.parentContent)
    // const dataNew = this.editorStore.getOriginalMeta(contentMeta.identifier)
    // if (dataNew && dataNew.children && dataNew.primaryCategory
    //   === NsContent.EPrimaryCategory.PROGRAM) {
    //   this.getfullContents(dataNew.children).subscribe(async fullContents => {
    //     // const children = fullContents
    //     dataNew.children = fullContents // TODO: proper implementation required
    //     for (let i = 0; fullContents && i < fullContents.length; i = +1) {
    //       if (fullContents[i]) {
    //         this.editorStore.resetOriginalMetaWithHierarchy(dataNew)
    //         // return [{ content: data }]
    //       }
    //     }
    //     this.init()
    //   })
    // }
  }
  init() {
    this.editorStore.onContentChange.subscribe(v => {
      if (v === this.editorStore.parentContent) {
        this.parentContentMeta = this.editorStore.getOriginalMeta(this.editorStore.parentContent)
      }
    })
    this.parentContentMeta = this.editorStore.getOriginalMeta(this.editorStore.parentContent)
    this.editorStore.changeActiveCont.subscribe(data => {
      this.currentContent = data
    })
    this.parentNodeId = this.store.currentParentNode
    if (this.parentNodeId) {
      this.treeControl = new FlatTreeControl<IContentTreeNode>(
        node => node.level,
        node => node.expandable,
      )

      this.treeFlattener = new MatTreeFlattener(
        this._transformer,
        node => node.level,
        node => node.expandable,
        node => node.children,
      )

      this.store.onInvalidNodeChange.subscribe(v => {
        this.invalidIds = v
        this.expandNodesById(v)
      })
      this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener)

      this.store.treeStructureChange.subscribe(data => {
        this.dataSource.data = [data as IContentNode]
        if (this.parentNodeId === this.store.currentParentNode) {
          this.expandNodesById()
          if (this.selectedNode && !this.store.flatNodeMap.get(this.selectedNode)) {
            this.parentHierarchy.forEach(v => {
              if (this.store.flatNodeMap.get(v)) {
                const identifier = this.store.uniqueIdMap.get(v) as string
                this.selectedNode = v
                this.editorStore.currentContent = identifier
                this.store.currentSelectedNode = v
                this.editorStore.changeActiveCont.next(identifier)
                return
              }
            })
          }
        } else {
          this.parentNodeId = this.store.currentParentNode
        }
      })
      this.store.selectedNodeChange.subscribe(data => {
        if (data) {
          this.selectedNode = data
        }
      })
    }

    this.mediumSizeBreakpoint$.subscribe(isLtMedium => {
      this.mediumScreen = isLtMedium
      if (isLtMedium) {
        this.drawer = true
        this.leftarrow = false
        this.menubtn = false
      } else {
        this.leftarrow = true
        this.menubtn = true
      }
    })
  }
  ngOnDestroy() {
  }

  onNodeSelect(node: IContentTreeNode) {
    let flag = false
    if (node.id !== this.selectedNode) {
      const updatedContent = this.editorStore.upDatedContent || {}
      if (Object.keys(updatedContent).length > 0) {
        let tempUpdateContent: any = this.editorStore.upDatedContent[this.editorStore.currentContent]
        let tempOriginalContent: any = this.editorStore.originalContent[this.editorStore.currentContent]
        if (tempUpdateContent) {
          tempUpdateContent = this.editorStore.cleanProperties(tempUpdateContent)
          tempOriginalContent = this.editorStore.cleanProperties(tempOriginalContent)
          Object.keys(tempUpdateContent).forEach(ele => {
            if (JSON.stringify(tempUpdateContent[ele]) === JSON.stringify(tempOriginalContent[ele])) {
              flag = false
            } else {
              flag = true
            }
          })
          // if (!flag &&
          //   ((Object.keys(tempUpdateContent).length === 1 && tempUpdateContent.versionKey)
          //     || Object.keys(tempUpdateContent).length === 0)) {
          //   flag = false
          // } else {
          //   flag = true
          // }
        }
      }
      if (flag) {
        this.dialog.open<ConfirmModalComponent>(ConfirmModalComponent)
          .afterClosed()
          .subscribe((res: any) => {
            if (res.result) {
              this.selectedNode = node.id
              this.editorStore.currentContent = node.identifier
              this.store.currentSelectedNode = node.id
              this.editorStore.changeActiveCont.next(node.identifier)
              this.action.emit({ type: 'editContent', identifier: node.identifier, selectedNode: node })
              this.store.selectedNodeChange.next(node.id)
              this.editorStore.upDatedContent = {}
              // this.store.selectedNode
              this.preserveExpandedNodes()
            }
          })
      } else {
        this.selectedNode = node.id
        this.editorStore.currentContent = node.identifier
        this.store.currentSelectedNode = node.id
        this.editorStore.changeActiveCont.next(node.identifier)
        this.action.emit({ type: 'editContent', identifier: node.identifier, selectedNode: node })
        this.store.selectedNodeChange.next(node.id)
        // this.store.selectedNode
        this.preserveExpandedNodes()
      }
    }
  }

  closeSidenav() {
    this.closeEvent.emit(true)
  }

  dragStart(node: IContentTreeNode) {
    this.isDragging = true
    this.dragContainer = node
  }

  dragEnd() {
    this.backUpInformation = {
      isDragging: this.isDragging,
      dropContainer: this.dropContainer,
      dragContainer: this.dragContainer,
      draggingPosition: this.draggingPosition,
    }
    this.isDragging = false
    this.dropContainer = null
    this.dragContainer = null
    this.draggingPosition = null
  }

  dragHover(node: IContentTreeNode, event: MouseEvent) {
    event.preventDefault()
    if (this.isDragging) {
      this.dropContainer = node
      clearTimeout(this.expandTimeout)
      this.expandTimeout = setTimeout(() => {
        this.treeControl.expand(node)
        // tslint:disable-next-line: align
      }, this.expandDelay)
      const percentageY = event.offsetY / (event.target as any).clientHeight
      if (percentageY >= 0 && percentageY < 0.2) {
        this.draggingPosition = 'above'
      } else if (percentageY > 0.8) {
        this.draggingPosition = 'below'
      } else if (percentageY >= 0.2 && percentageY <= 0.8) {
        this.draggingPosition = 'center'
      }
      const parentHierarchy: number[] = []
      let currNode: IContentTreeNode | null = node
      while (currNode) {
        if (currNode && currNode.parentId) {
          parentHierarchy.push(currNode.parentId)
        }
        currNode = this.getParentNode(currNode)
      }
      if (parentHierarchy.includes((this.dragContainer as IContentTreeNode).id)) {
        this.isDropDisabled = true
      } else if (this.dragContainer === this.dropContainer) {
        this.isDropDisabled = true
      } else if (['above', 'below'].includes(this.draggingPosition as string)) {
        const parentNode = this.getParentNode(node)
        this.isDropDisabled = !parentNode
          ? true
          : !this.store.allowDrop(
            this.dragContainer as IContentTreeNode,
            parentNode as IContentTreeNode,
          )
      } else {
        this.isDropDisabled = !this.store.allowDrop(
          this.dragContainer as IContentTreeNode,
          this.dropContainer as IContentTreeNode,
        )
      }
    }
  }

  dragHoverEnd($event: Event) {
    $event.preventDefault()
    if (this.isDragging) {
      clearTimeout(this.expandTimeout)
      this.backUpInformation.dropContainer = this.dropContainer as any
      this.dropContainer = null
    }
  }

  drop() {
    this.isDragging = false
    if (!this.isDropDisabled) {
      this.preserveExpandedNodes()
      const isAdjacentDrop = ['above', 'below'].includes(
        this.backUpInformation.draggingPosition as string,
      )
      const dropContainer = isAdjacentDrop
        ? this.getParentNode(this.backUpInformation.dropContainer as IContentTreeNode)
        : this.backUpInformation.dropContainer

      if (dropContainer && dropContainer.id !== this.backUpInformation.dragContainer.id) {
        this.store.dragAndDrop(
          this.backUpInformation.dragContainer as IContentTreeNode,
          dropContainer as IContentTreeNode,
          isAdjacentDrop ? this.backUpInformation.dropContainer.id : undefined,
          this.backUpInformation.draggingPosition,
        )
      }
    }
  }

  preserveExpandedNodes() {
    this.expandedNodes = new Set<number>()
    this.treeControl.dataNodes.forEach(v => {
      if (this.treeControl.isExpandable(v) && this.treeControl.isExpanded(v)) {
        this.expandedNodes.add(v.id)
      }
    })
    this.store.expendedNode = this.expandedNodes
  }

  expandNodesById(ids?: number[]) {
    let idSet = ids ? new Set(ids) : this.expandedNodes
    if (!idSet || idSet.size === 0) {
      idSet = this.store.expendedNode
    }
    if (this.treeControl.dataNodes && this.treeControl.dataNodes.length > 0) {
      this.treeControl.dataNodes.forEach(node => {
        if (idSet.has(node.id)) {
          this.treeControl.expand(node)
          let parent = this.getParentNode(node)
          while (parent) {
            this.treeControl.expand(parent)
            parent = this.getParentNode(parent)
          }
        }
      })
    }
  }
  /*
   Get the parent node of a node
    */
  getParentNode(node: IContentTreeNode): IContentTreeNode | null {
    const currentLevel = (node && node.level) ? node.level : 0

    if (currentLevel < 1) {
      return null
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1

    for (let i = startIndex; i >= 0; i = i - 1) {
      const currentNode = this.treeControl.dataNodes[i]

      if (currentNode.level < currentLevel) {
        return currentNode
      }
    }
    return null
  }

  delete(node: IContentTreeNode) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '175px',
      data: 'deleteTreeNode',
    })
    this.preserveExpandedNodes()
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.parentHierarchy = []
        let currNode: IContentTreeNode | null = node
        while (currNode) {
          if (currNode && currNode.parentId) {
            this.parentHierarchy.push(currNode.parentId)
          }
          currNode = this.getParentNode(currNode)
        }
        this.store.deleteNode(node.id)
        const requestBodyV2: NSApiRequest.IContentUpdateV3 = {
          request: {
            data: {
              nodesModified: this.editorStore.getNodeModifyData(),
              hierarchy: this.store.getTreeHierarchy(),
            },
          },
        }
        this.loaderService.changeLoad.next(true)
        this.editorService.updateContentV4(requestBodyV2).subscribe(() => {
          this.showTosterMessage('success')
          this.editorService.readcontentV3(this.editorStore.parentContent).subscribe((data: any) => {
            this.editorStore.resetOriginalMetaWithHierarchy(data)
          })
          this.store.changedHierarchy = {}
          this.loaderService.changeLoad.next(false)
          // tslint:disable-next-line: align
        }, _error => {
          this.showTosterMessage('fail')
          this.loaderService.changeLoad.next(false)
        })
      }
    })
  }

  async addChildOrSibling(node: IContentTreeNode, asSibling = false) {
    const children = (node.children || []).map(v => this.store.uniqueIdMap.get(v))
    // neet to remove
    const typ = node.primaryCategory === NsContent.EPrimaryCategory.PROGRAM ? node.primaryCategory : node.contentType
    const dialogRef = this.dialog.open(AuthPickerComponent, {
      width: '90vw',
      height: '90vh',
      data: {
        filter: this.authInitService.collectionConfig.childrenConfig[typ].searchFilter,
        selectedIds: children,
      },
    })
    this.preserveExpandedNodes()
    dialogRef.afterClosed().subscribe(async (contents: NSContent.IContentMeta[]) => {
      if (contents && contents.length) {
        this.getfullContents(contents).subscribe(async fullContents => {
          const parentNode = (asSibling ? this.getParentNode(node) : node) as IContentTreeNode
          this.expandedNodes.add(parentNode.id)
          this.loaderService.changeLoad.next(true)
          const isDone = await this.store.addChildOrSibling(
            fullContents,
            parentNode,
            asSibling ? node.id : undefined,
            'below',
          )
          if (isDone) {
            this.triggerSave({}).subscribe()
          }
          this.loaderService.changeLoad.next(false)
          this.showTosterMessage('success')
        })
      }
    })
  }

  async createNewChildOrSibling(type: string, node: IContentTreeNode, asSibling = false) {
    const dialog = this.dialog.open(PickNameComponent, {
      width: 'auto',
      height: 'auto',
      data: {},
    })
    dialog.afterClosed().subscribe(async v => {
      if (v && v.action === 'YES' && v.name) {
        const parentNode = (asSibling ? this.getParentNode(node) : node) as IContentTreeNode
        this.loaderService.changeLoad.next(true)
        this.preserveExpandedNodes()
        this.expandedNodes.add(parentNode.id)
        const createdContent = await this.store.createChildOrSibling(
          type,
          parentNode,
          asSibling ? node.id : undefined,
          'below',
          v.name
        )
        if (createdContent && createdContent.identifier) {
          this.triggerSave(createdContent).subscribe()
        } else {
          this.loaderService.changeLoad.next(false)
        }
      }
    })
  }

  takeAction(action: string, node: IContentTreeNode, type?: string) {
    switch (action) {
      case 'editMeta':
      case 'editContent':
      case 'preview':
        this.onNodeSelect(node)
        this.action.emit({ type: action, identifier: node.identifier, selectedNode: node })
        break
      case 'delete':
        this.delete(node)
        break

      case 'addChild':
        this.addChildOrSibling(node)
        break

      case 'addSibling':
        this.addChildOrSibling(node, true)
        break

      case 'createChild':
        this.createNewChildOrSibling(type as string, node)
        break

      case 'createSibling':
        this.createNewChildOrSibling(type as string, node, true)
        break

      case 'copyContent':
        this.copyContentData(node)
        break

      default:
        break
    }
  }

  triggerSave(
    createdContent: any
  ) {
    const requestBodyV2: NSApiRequest.IContentUpdateV3 = {
      request: {
        data: {
          nodesModified: this.editorStore.getNodeModifyData(),
          hierarchy: this.store.getTreeHierarchy(),
        },
      },
    }
    return this.editorService.updateContentV4(requestBodyV2).pipe(
      tap(() => {
        this.store.changedHierarchy = {}
      }),
      tap(async () => {
        this.editorService.readcontentV3(this.editorStore.parentContent).subscribe((data: NSContent.IContentMeta) => {
          if (data && data.children && data.primaryCategory
            === NsContent.EPrimaryCategory.PROGRAM) {
            this.getfullContents(data.children).subscribe(async fullContents => {
              // const children = fullContents
              data.children = fullContents
              this.editorStore.resetOriginalMetaWithHierarchy(data)
              this.showTosterMessage('success')
              this.loaderService.changeLoad.next(false)
            })
          } else {
            this.editorStore.resetOriginalMetaWithHierarchy(data)
            this.showTosterMessage('success')
            this.loaderService.changeLoad.next(false)
          }

          // tslint:disable-next-line: align
        }, _error => {
          this.showTosterMessage('fail')
          this.loaderService.changeLoad.next(false)
        })
      }),
      catchError(() => {
        this.showTosterMessage('fail')
        this.store.deleteContentNode(createdContent)
        this.loaderService.changeLoad.next(false)
        return EMPTY
      })
    )
  }
  getfullContents(contents: NSContent.IContentMeta[]) {
    return forkJoin(
      contents.map(c => {
        return this.editorService.readcontentV3(c.identifier).pipe(
          map((response: any) => {
            return response
          }))
      })
    )
  }
  addContent(node: IContentTreeNode) {
    const action = node.primaryCategory === this.primaryCategoryValues.COURSE ? 'addContenToCourse' :
      node.primaryCategory === this.primaryCategoryValues.MODULE ? 'addContenToModule' :
        node.primaryCategory === this.primaryCategoryValues.PROGRAM ? 'addCourseToProgram' : ''
    this.action.emit({ type: action, identifier: node.identifier, selectedNode: node })
  }

  checkContionToAddContent(node: IContentTreeNode): boolean {
    const parentData = this.editorStore.getOriginalMeta(this.editorStore.parentContent)
    if (this.configService.userProfile && (parentData.createdBy === this.configService.userProfile.userId)) {
      if (
        node && node.primaryCategory === parentData.primaryCategory
        && (NsContent.EPrimaryCategory.COURSE || NsContent.EPrimaryCategory.PROGRAM)) {
        return true
        // tslint:disable-next-line: no-else-after-return
      } else if (
        (parentData.primaryCategory === NsContent.EPrimaryCategory.COURSE) &&
        node && node.primaryCategory === NsContent.EPrimaryCategory.MODULE
      ) {
        return true
      }
    }
    return false
  }

  checkForParentContent(node: any) {
    const parentData = this.editorStore.getOriginalMeta(this.editorStore.parentContent)
    if (parentData && parentData.primaryCategory === NsContent.EPrimaryCategory.PROGRAM) {
      if (node.primaryCategory === NsContent.EPrimaryCategory.RESOURCE || node.primaryCategory === NsContent.EPrimaryCategory.MODULE) {
        return false
      }
    }
    return true
  }

  async copyContentData(node: any) {
    this.loaderService.changeLoad.next(true)
    const contentData: any = this.editorStore.getOriginalMeta(node.identifier)
    const requestPayload = {
      request: {
        content: {
          name: `${contentData.name}-COPY-CONTENT`,
          createdFor: [(this.configService.userProfile) ? this.configService.userProfile.rootOrgId : ''],
          framework: contentData.framework,
          createdBy: contentData.createdBy,
          organisation: [(this.configService.userProfile) ? this.configService.userProfile.departmentName : ''],
        },
      },
    }
    const responseData = await this.editorService.copyContentApi(contentData.identifier, requestPayload).toPromise().catch(_error => { })
    if (responseData && responseData.params && responseData.params.status.toLowerCase() === 'successful') {
      const newContentData = await this.getSingleContent(responseData.result.node_id).toPromise().catch(_error => { })
      const parentNode = (this.getParentNode(node)) as IContentTreeNode
      this.expandedNodes.add(parentNode.id)
      const isDone = await this.store.addContentToTree(
        newContentData,
        parentNode,
        node.id,
        'below',
      )
      if (isDone) {
        const requestBody: NSApiRequest.IContentUpdateV3 = {
          request: {
            data: {
              nodesModified: this.editorStore.getNodeModifyData(),
              hierarchy: this.store.getTreeHierarchy(),
            },
          },
        }
        const updateContentData = await this.editorService.updateContentV4(requestBody).toPromise().catch(_error => { })
        if (updateContentData && updateContentData.params && updateContentData.params.status === 'successful') {
          const readContentData = await this.editorService.readcontentV3(this.editorStore.parentContent).toPromise().catch(_error => { })
          if (readContentData && readContentData.identifier) {
            this.editorStore.resetOriginalMetaWithHierarchy(readContentData)
            this.loaderService.changeLoad.next(false)
            this.showTosterMessage('saveSuccess')
          } else {
            this.loaderService.changeLoad.next(false)
            this.showTosterMessage('saveFail')
          }
        } else {
          this.loaderService.changeLoad.next(false)
          this.showTosterMessage('saveFail')
        }
      } else {
        this.loaderService.changeLoad.next(false)
        this.showTosterMessage('saveFail')
      }
    } else {
      this.loaderService.changeLoad.next(false)
      this.showTosterMessage('saveFail')
    }
  }

  getSingleContent(identifier: string) {
    return this.editorService.readContentV2(Object.values(identifier)[0]).pipe(
      map((response: any) => {
        return response
      }))
  }

  showTosterMessage(type: string) {
    switch (type) {
      case 'saveSuccess':
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SAVE_SUCCESS,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        break
      case 'success':
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SUCCESS,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        break
      case 'saveFail':
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SAVE_FAIL,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        break
      case 'fail':
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.FAIL,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        break
    }
  }
}
