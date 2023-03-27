import { FlatTreeControl } from '@angular/cdk/tree'
import { Component, Input, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { AuthInitService } from '../../../../../../../../services/init.service'
import { IContentNode, IContentTreeNode } from '../../interface/icontent-tree'
import { CollectionStoreService } from '../../services/store.service'
import { NSApiRequest } from '../../../../../../../../interface/apiRequest'
import { EditorService } from '../../../../../services/editor.service'
import { EditorContentService } from '../../../../../services/editor-content.service'
import { LoaderService } from '../../../../../../../../services/loader.service'
import { MatDialog, MatSnackBar, MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { NsContent } from '../../../../../../../../../../../../../library/ws-widget/collection/src/public-api'
import { EMPTY, forkJoin } from 'rxjs'
import { catchError, map, tap } from 'rxjs/operators'
import { NSContent } from '../../../../../../../../interface/content'
import { ConfigurationsService } from '../../../../../../../../../../../../../library/ws-widget/utils/src/public-api'
import { ContentLiveEditDialogComponent } from '@ws/author/src/lib/modules/shared/components/content-live-edit-dialog/content-live-edit-dialog.component'
// import { EditorContentService } from '@ws/author/src/lib/routing/modules/editor/services/editor-content.service'
// import { CollectionResolverService } from './../../services/resolver.service'

@Component({
  selector: 'ws-auth-select-type',
  templateUrl: './auth-select-type.component.html',
  styleUrls: ['./auth-select-type.component.scss'],
})
export class AuthSelectTypeComponent implements OnInit {
  @Input() parentType!: string
  @Input() selectedNodeIdentifier!: string
  @Input() selectedNodeData!: IContentTreeNode
  treeControl!: FlatTreeControl<IContentTreeNode>
  treeFlattener!: MatTreeFlattener<IContentNode, IContentTreeNode>
  dataSource!: MatTreeFlatDataSource<IContentNode, IContentTreeNode>
  avalibleType: any[] = []
  selectedData = 'start'
  moduleForm!: FormGroup
  selectedContentType!: any
  licensesList = ['CC BY-NC-SA 4.0', 'Standard YouTube License', 'CC BY-NC 4.0', 'CC BY-SA 4.0', 'CC BY 4.0']
  currentSelectedNodeData: IContentTreeNode | undefined
  selectedFilterNodeData!: {
    filter: any
    selectedIds: any
  }
  expandedNodes = new Set<number>()
  isEditEnabled = true
  assessmentCategory = ''
  showRememberThis = false
  specialCharList = `( a/A-z/Z, 0-9 . - _  $ / \ : [ ]' ' !)`

  constructor(
    private authInitService: AuthInitService,
    private collectionstoreService: CollectionStoreService,
    private formBuilder: FormBuilder,
    private editorService: EditorService,
    private contentService: EditorContentService,
    private loaderService: LoaderService,
    private snackBar: MatSnackBar,
    private configService: ConfigurationsService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnChanges() {
    this.collectionstoreService.assessmentHierarchyTree = {}
    this.contentService.assessmentOriginalContent = {}
    this.avalibleType = []
    const contentMeta = this.contentService.getOriginalMeta(this.contentService.currentContent)
    this.isEditEnabled = (
      contentMeta && this.configService.userProfile && this.configService.userProfile.userId === contentMeta.createdBy
    ) ? true : false
    const metaDataOfParent = this.contentService.getOriginalMeta(this.contentService.parentContent)
    if (
      metaDataOfParent.primaryCategory === NsContent.EPrimaryCategory.PROGRAM &&
      contentMeta && contentMeta.primaryCategory !== NsContent.EPrimaryCategory.PROGRAM
    ) {
      this.isEditEnabled = false
    }
    this.createModuleForm()
    if (this.authInitService && this.authInitService.collectionConfig && this.authInitService.collectionConfig.childrenConfig) {
      if (this.authInitService.collectionConfig.childrenConfig[this.parentType]) {
        const childType = this.authInitService.collectionConfig.childrenConfig[this.parentType].childTypes
        if (childType && childType.length > 0) {
          childType.forEach((element: any) => {
            if (element.enabled) {
              if (this.parentType === NsContent.EPrimaryCategory.COURSE
                || this.parentType === NsContent.EPrimaryCategory.MODULE
                || this.parentType === NsContent.EPrimaryCategory.PROGRAM) {
                this.avalibleType.push({
                  name: element.name,
                  description: element.description,
                  icon: element.icon,
                  primaryCategory: element.primaryCategory,
                })
              }
            }
          })
        }
      }
    }
    if (this.parentType === NsContent.EPrimaryCategory.PROGRAM) {
      this.avalibleType = this.avalibleType.filter(v => v.primaryCategory === NsContent.EPrimaryCategory.COURSE)
      const tempData = this.collectionstoreService.flatNodeMap.get(this.collectionstoreService.currentSelectedNode)
      this.currentSelectedNodeData = (tempData) ? this._transformer(tempData) : undefined
      if (this.currentSelectedNodeData && Object.keys(this.currentSelectedNodeData).length > 0) {
        const children = (this.currentSelectedNodeData.children || []).map(v => this.collectionstoreService.uniqueIdMap.get(v))
        this.selectedFilterNodeData = {
          filter: this.authInitService.collectionConfig.childrenConfig[this.currentSelectedNodeData.primaryCategory].searchFilter,
          selectedIds: children,
        }
      }
    }
    if (this.parentType === 'editModule') {
      this.selectedData = 'contentCreate'
      this.selectedContentType = {
        name: 'collection',
        type: 'Module',
        primaryCategory: NsContent.EPrimaryCategory.MODULE,
      }
      this.assignModuleData()
    } else if (this.parentType === 'editAssessment') {
      this.selectedData = 'assessmentHome'
    } else {
      this.selectedData = 'start'
    }
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
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener)
    this.collectionstoreService.treeStructureChange.subscribe(treeData => {
      this.dataSource.data = [treeData as IContentNode]
    })
    if (contentMeta && contentMeta.status.toLowerCase() === 'live' ||
      (contentMeta.prevStatus && contentMeta.prevStatus.toLowerCase() === 'live')) {
      this.showRememberThis = true
      if (!this.contentService.shownLiveEditOnce) {
        this.showLiveEditDialog()
        this.contentService.shownLiveEditOnce = true
      }
    }
    if (contentMeta && (contentMeta.primaryCategory === NsContent.EPrimaryCategory.ASSESSMENT
      || contentMeta.primaryCategory === NsContent.EPrimaryCategory.FINALASSESSMENT)) {
      this.assessmentCategory = contentMeta.primaryCategory
    }
  }

  get avalibleResourceType() {
    const tempArray: any = []
    if (this.authInitService && this.authInitService.creationEntity) {
      this.authInitService.creationEntity.forEach((element: any) => {
        if (element.primaryCategory === NsContent.EPrimaryCategory.RESOURCE && element.enabled && element.available) {
          tempArray.push(element)
        }
      })
    }
    return tempArray
  }

  private _transformer = (node: IContentNode): IContentTreeNode => {
    return {
      level: this.getLevel(node, 0),
      id: node.id,
      identifier: node.identifier,
      contentType: node.contentType,
      primaryCategory: node.primaryCategory,
      expandable: true,
      children: node.children ? node.children.map(v => v.id) : [],
      editable: node.editable,
      childLoaded: node.childLoaded,
      parentId: node.parentId,
    }
  }

  getLevel(node: IContentNode, nodeLevel: any) {
    if (node && node.parentId) {
      const getNodeDetails = this.collectionstoreService.flatNodeMap.get(node.parentId)
      if (getNodeDetails && getNodeDetails.parentId) {
        this.getLevel(getNodeDetails, nodeLevel + 1)
      }
    }
    return nodeLevel
  }

  createModuleForm() {
    const noSpecialChar = new RegExp(/^[a-zA-Z0-9()$[\]\\.:!''_/ -]*$/)
    this.moduleForm = this.formBuilder.group({
      name: new FormControl('', [Validators.required, Validators.pattern(noSpecialChar), Validators.minLength(10)]),
      description: new FormControl(''),
      license: new FormControl('CC BY 4.0'),
    })
  }

  async createContent() {
    this.loaderService.changeLoad.next(true)
    const selectedNode = this.collectionstoreService.flatNodeMap.get(this.collectionstoreService.currentSelectedNode)
    const parentNode = this.collectionstoreService.flatNodeMap.get(this.collectionstoreService.currentParentNode)
    let createdContent: any
    if (selectedNode && parentNode) {
      this.expandedNodes.add(parentNode.id)
      this.expandedNodes.add(selectedNode.id)
      this.collectionstoreService.expendedNode = this.expandedNodes
      if (this.selectedContentType.primaryCategory === NsContent.EPrimaryCategory.MODULE
        && selectedNode.primaryCategory === NsContent.EPrimaryCategory.MODULE
      ) {
        createdContent = await this.collectionstoreService.createChildOrSibling(
          this.selectedContentType.name,
          this._transformer(parentNode),
          selectedNode.id,
          'below',
          this.moduleForm.controls['name'].value,
          this.moduleForm.controls['description'].value,
          this.moduleForm.controls['license'].value
        )
      } else {
        createdContent = await this.collectionstoreService.createChildOrSibling(
          this.selectedContentType.name,
          this._transformer(selectedNode),
          undefined,
          'below',
          this.moduleForm.controls['name'].value,
          this.moduleForm.controls['description'].value,
          this.moduleForm.controls['license'].value
        )
      }
      if (createdContent && createdContent.identifier) {
        this.preserveExpandedNodes()
        this.expandNodesById()
        if (createdContent.primaryCategory === NsContent.EPrimaryCategory.MODULE) {
          this.loaderService.changeLoad.next(false)
          this.showTosterMessage('success')
          this.selectedData = 'start'
          this.moduleForm.reset()
          this.moduleForm.controls['license'].setValue('CC BY 4.0')
        } else {
          this.updateTreeHierarchy()
        }
      } else {
        this.loaderService.changeLoad.next(false)
      }
    } else {
      this.loaderService.changeLoad.next(false)
    }
  }

  async updateCotent(meta: any) {
    const nodesModify = this.contentService.getNodeModifyData()
    nodesModify[this.selectedNodeIdentifier]['metadata'] = meta
    const requestBody: NSApiRequest.IContentUpdateV3 = {
      request: {
        data: {
          nodesModified: nodesModify,
          hierarchy: this.collectionstoreService.getTreeHierarchy(),
        },
      },
    }
    const updateContentData = await this.editorService.updateContentV4(requestBody).toPromise().catch(_error => { })
    if (updateContentData && updateContentData.params && updateContentData.params.status === 'successful') {
      const readContentData = await this.editorService.readcontentV3(this.contentService.parentContent).toPromise().catch(_error => { })
      if (readContentData && readContentData.identifier) {
        this.contentService.resetOriginalMetaWithHierarchy(readContentData)
      }
      this.loaderService.changeLoad.next(false)
      this.showTosterMessage('success')
    } else {
      this.loaderService.changeLoad.next(false)
      this.showTosterMessage('fail')
    }
  }

  async updateTreeHierarchy() {
    const requestBodyV2: NSApiRequest.IContentUpdateV3 = {
      request: {
        data: {
          nodesModified: this.contentService.getNodeModifyData(),
          hierarchy: this.collectionstoreService.getTreeHierarchy(),
        },
      },
    }
    const updateContentRes = await this.editorService.updateContentV4(requestBodyV2).toPromise().catch(_error => { })
    if (updateContentRes && updateContentRes.params && updateContentRes.params.status === 'successful') {
      const readContentRes = await this.editorService.readcontentV3(this.contentService.parentContent).toPromise().catch(_error => { })
      if (readContentRes && readContentRes.identifier) {
        this.contentService.resetOriginalMetaWithHierarchy(readContentRes)
        this.selectedData = 'start'
        this.moduleForm.reset()
        this.moduleForm.controls['license'].setValue('CC BY 4.0')
        this.loaderService.changeLoad.next(false)
        this.showTosterMessage('success')
      } else {
        this.loaderService.changeLoad.next(false)
        this.showTosterMessage('fail')
      }
    } else {
      this.loaderService.changeLoad.next(false)
      this.showTosterMessage('fail')
    }
  }

  takeAction(item: any) {
    const parentContent = this.contentService.getOriginalMeta(this.contentService.parentContent)
    let collectionData: any = this.authInitService.collectionConfig.childrenConfig[parentContent.primaryCategory].childTypes
    collectionData = collectionData.filter((v: any) => v.primaryCategory === item.primaryCategory)[0]
    if (item) {
      switch (item.primaryCategory) {
        case NsContent.EPrimaryCategory.MODULE:
          this.selectedData = 'contentCreate'
          this.selectedContentType = {
            name: 'collection',
            type: 'Module',
            primaryCategory: NsContent.EPrimaryCategory.MODULE,
          }
          break
        case NsContent.EPrimaryCategory.RESOURCE:
          this.selectedData = 'selectResourceType'
          break
        case NsContent.EPrimaryCategory.COURSE:
          this.selectedData = 'addCourse'
          break
        case NsContent.EPrimaryCategory.ASSESSMENT:
        case NsContent.EPrimaryCategory.FINALASSESSMENT:
          if (NsContent.EPrimaryCategory.FINALASSESSMENT === item.primaryCategory &&
            parentContent.children.filter(v => v.primaryCategory === 'Course Assessment').length === collectionData.maximum) {
            this.showTosterMessage('finalAssessmentAvalible')
            break
          } else {
            this.selectedData = 'assessmentHome'
            this.assessmentCategory = item.primaryCategory
            break
          }
      }
    }
  }

  showTosterMessage(type: string) {
    switch (type) {
      case 'success':
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SAVE_SUCCESS,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        break
      case 'fail':
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SAVE_FAIL,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        break
      case 'upToDate':
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.UP_TO_DATE,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        break
      case 'finalAssessmentAvalible':
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.FINALASSESSMENT_AVALIBLE,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        break
    }
  }

  resourceSelected(selectedItem: any) {
    this.selectedContentType = {
      name: selectedItem.id,
      type: 'Resource',
      primaryCategory: NsContent.EPrimaryCategory.RESOURCE,
    }
    this.selectedData = 'contentCreate'
  }

  assignModuleData() {
    const contentMeta = this.contentService.getOriginalMeta(this.selectedNodeIdentifier)
    this.moduleForm.setValue({
      name: contentMeta.name,
      description: contentMeta.description,
      license: contentMeta.license,
    })
  }

  checkAndSave() {
    const contentMeta: any = this.contentService.getOriginalMeta(this.selectedNodeIdentifier)
    const updateContentMeta: any = {}
    let flag = 0
    if (this.selectedContentType.primaryCategory === NsContent.EPrimaryCategory.MODULE && contentMeta
      && contentMeta.primaryCategory === NsContent.EPrimaryCategory.MODULE) {
      Object.keys(this.moduleForm.value).forEach((element: any) => {
        if (this.moduleForm.controls[element].value !== contentMeta[element]) {
          updateContentMeta[element] = this.moduleForm.controls[element].value
        } else {
          flag += 1
        }
      })
      if (flag === Object.keys(this.moduleForm.value).length) {
        this.showTosterMessage('upToDate')
      } else if (flag > 0) {
        updateContentMeta['versionKey'] = contentMeta['versionKey']
        this.loaderService.changeLoad.next(true)
        this.updateCotent(updateContentMeta)
      }
    } else {
      this.createContent()
    }
  }

  async takeActionOnSelectedCourse(content: NSContent.IContentMeta[], asSibling = false) {
    if (content && content.length > 0 && this.currentSelectedNodeData) {
      this.loaderService.changeLoad.next(true)
      const fullcontentData = await this.getfullContents(content).toPromise().catch(_error => { })
      const parentNode = (asSibling ? this.getParentNode(this.currentSelectedNodeData) : this.currentSelectedNodeData) as IContentTreeNode
      this.expandedNodes.add(this.currentSelectedNodeData.id)
      this.collectionstoreService.expendedNode = this.expandedNodes
      this.expandNodesById()
      const isDone = await this.collectionstoreService.addChildOrSibling(
        (fullcontentData) ? fullcontentData : [],
        parentNode,
        asSibling ? this.currentSelectedNodeData.id : undefined,
        'below',
      )
      if (isDone) {
        this.triggerSave({}).subscribe()
      } else {
        this.showTosterMessage('fail')
        this.selectedData = 'start'
        this.loaderService.changeLoad.next(false)

      }
    } else {
      this.selectedData = 'start'
    }
  }

  triggerSave(
    createdContent: any
  ) {

    const requestBodyV2: NSApiRequest.IContentUpdateV3 = {
      request: {
        data: {
          nodesModified: this.contentService.getNodeModifyData(),
          hierarchy: this.collectionstoreService.getTreeHierarchy(),
        },
      },
    }
    return this.editorService.updateContentV4(requestBodyV2).pipe(
      tap(() => {
        this.collectionstoreService.changedHierarchy = {}
      }),
      tap(async () => {
        this.editorService.readcontentV3(this.contentService.parentContent).subscribe((data: NSContent.IContentMeta) => {
          if (data && data.children && data.primaryCategory
            === NsContent.EPrimaryCategory.PROGRAM) {
            this.getfullContents(data.children).subscribe(async fullContents => {
              data.children = fullContents
              this.contentService.resetOriginalMetaWithHierarchy(data)
              this.showTosterMessage('success')
              this.selectedData = 'start'
              this.loaderService.changeLoad.next(false)
            })
          } else {
            this.contentService.resetOriginalMetaWithHierarchy(data)
            this.showTosterMessage('success')
            this.selectedData = 'start'
            this.loaderService.changeLoad.next(false)
          }
          // tslint:disable-next-line: align
        }, _error => {
          this.showTosterMessage('fail')
          this.selectedData = 'start'
          this.loaderService.changeLoad.next(false)
        })
      }),
      catchError(() => {
        this.showTosterMessage('fail')
        this.selectedData = 'start'
        this.collectionstoreService.deleteContentNode(createdContent)
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

  getParentNode(node: IContentTreeNode): IContentTreeNode | null {
    const currentLevel = node.level

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

  expandNodesById(ids?: number[]) {
    let idSet = ids ? new Set(ids) : this.expandedNodes
    if (!idSet || idSet.size === 0) {
      idSet = this.collectionstoreService.expendedNode
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

  preserveExpandedNodes() {
    this.expandedNodes = new Set<number>()
    this.treeControl.dataNodes.forEach(v => {
      if (this.treeControl.isExpandable(v) && this.treeControl.isExpanded(v)) {
        this.expandedNodes.add(v.id)
      }
    })
    this.collectionstoreService.expendedNode = this.expandedNodes
  }

  takeActionOnClose(item: any) {
    this.selectedData = item
  }

  async takeActionOnSaveForAssessment(item: any) {
    const selectedNode = this.collectionstoreService.flatNodeMap.get(this.collectionstoreService.currentSelectedNode)
    if (selectedNode) {
      this.expandedNodes.add(selectedNode.id)
      this.collectionstoreService.expendedNode = this.expandedNodes
      const createdContent = await this.collectionstoreService.createChildOrSibling(
        item.type,
        this._transformer(selectedNode),
        undefined,
        'below',
        item.name,
        item.description,
        '',
        item.purpose,
        item.scoreCutoffType,
        item.expectedDuration,
        item.showTimer,
        item.totalQuestions,
        item.maxQuestions
      )
      if (createdContent && createdContent.identifier) {
        this.preserveExpandedNodes()
        this.expandNodesById()
        this.updateTreeHierarchy()
      } else {
        this.loaderService.changeLoad.next(false)
      }
    }
  }

  showLiveEditDialog() {
    this.dialog.open(ContentLiveEditDialogComponent, {
      width: '900px',
      height: '475px',
      data: {},
      autoFocus: false,
    })
  }

}
