import { Injectable } from '@angular/core'
import { LoggerService } from '@ws-widget/utils'
import { DEPTH_RUE } from '@ws/author/src/lib/constants/depth-rule'
import { IAllowedType } from '@ws/author/src/lib/interface/collection-child-config'
import { NSContent } from '@ws/author/src/lib/interface/content'
import { ICreateEntity } from '@ws/author/src/lib/interface/create-entity'
import { EditorContentService } from '@ws/author/src/lib/routing/modules/editor/services/editor-content.service'
import { EditorService } from '@ws/author/src/lib/routing/modules/editor/services/editor.service'
import { AuthInitService } from '@ws/author/src/lib/services/init.service'
import { BehaviorSubject, ReplaySubject } from 'rxjs'
import { NsContent } from '../../../../../../../../../../../../library/ws-widget/collection/src/public-api'
import { IContentNode, IContentTreeNode } from './../interface/icontent-tree'
import { CollectionResolverService } from './resolver.service'
import { v4 as uuidv4 } from 'uuid'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { ConfigurationsService } from '@ws-widget/utils/src/public-api'
import { environment } from '../../../../../../../../../../../../src/environments/environment'

interface IProcessedError {
  id: string | number
  name: string
  message: string[]
}
@Injectable()
export class CollectionStoreService {
  parentNode: string[] = []
  invalidIds: number[] = []

  onInvalidNodeChange = new ReplaySubject<number[]>()
  /**
   * Map from flat node to nested node. This helps us finding the nested node to be modified
   */
  flatNodeMap = new Map<number, IContentNode>()

  /**
   * Map for unique id and lex id. This helps us finding the lex id of the node
   */
  uniqueIdMap = new Map<number, string>()

  /**
   * Map for Lex id with unique id. This helps us tracking the change
   */
  lexIdMap = new Map<string, number[]>()

  changedHierarchy: any = {}

  hierarchyTree: any = {}

  assessmentHierarchyTree: any = {}

  currentParentNode!: number
  currentSelectedNode!: number
  expendedNode = new Set<number>()
  constructor(
    private contentService: EditorContentService,
    private editorService: EditorService,
    private resolver: CollectionResolverService,
    private authInitService: AuthInitService,
    private logger: LoggerService,
    private accessService: AccessControlService,
    private configSvc: ConfigurationsService,
  ) { }

  treeStructureChange = new BehaviorSubject<IContentNode | null>(null)
  selectedNodeChange = new BehaviorSubject<number | null>(null)
  get selectedNode() {
    return this.selectedNodeChange.value
  }

  allowDrop(dragNode: IContentTreeNode, dropNode: IContentTreeNode): boolean {
    let allow = true
    if (!dragNode.editable || !dropNode.editable) {
      allow = false
    } else if (!this.authInitService.collectionConfig.childrenConfig[dropNode.primaryCategory]) {
      allow = false
    } else if (dragNode.primaryCategory === NsContent.EPrimaryCategory.MODULE &&
      dropNode.primaryCategory === NsContent.EPrimaryCategory.MODULE) {
      allow = false
    } else if (dragNode.primaryCategory === NsContent.EPrimaryCategory.FINALASSESSMENT &&
      dropNode.primaryCategory === NsContent.EPrimaryCategory.MODULE) {
      allow = false
    } else if (
      !this.resolver.hasAccess(
        this.contentService.getUpdatedMeta(dropNode.identifier),
        dropNode.parentId
          ? this.contentService.getUpdatedMeta(
            (this.flatNodeMap.get(dropNode.parentId) as IContentNode).identifier,
          )
          : undefined,
      )
    ) {
      allow = false
    } else if (
      this.authInitService.collectionConfig.maxDepth <=
      dropNode.level + DEPTH_RUE[dragNode.contentType]
    ) {
      allow = false
    }
    return allow
  }

  dragAndDrop(
    dragNode: IContentTreeNode | IContentNode,
    dropNode: IContentTreeNode,
    adjacentId?: number,
    dropLocation: 'above' | 'below' = 'below',
    emitChange = true,
  ) {
    const oldParentNode = dragNode.parentId ? this.flatNodeMap.get(dragNode.parentId) : undefined
    const newParentNode = this.flatNodeMap.get(dropNode.id) as IContentNode
    const oldParentChildList = oldParentNode ? (oldParentNode.children as IContentNode[]) : []
    const newParentChildList = newParentNode.children as IContentNode[]
    let dropPosition = 0
    oldParentChildList.splice(
      oldParentChildList.findIndex(v => v.id === dragNode.id),
      1,
    )
    const childNode = this.flatNodeMap.get(dragNode.id) as IContentNode
    childNode.parentId = dropNode.id
    if (adjacentId) {
      const indexNumber = (dropNode.children || []).indexOf(adjacentId)
      const dragNodeIndex = (dropNode.children || []).indexOf(dragNode.id)
      if (indexNumber === 0 && dropLocation === 'above') {
        dropPosition = 0
      } else if (dragNodeIndex < 0 && dropLocation === 'below') {
        dropPosition = indexNumber + 1
      } else {
        dropPosition = indexNumber
      }
      const children = newParentNode.children as IContentNode[]
      children.splice(dropPosition, 0, childNode)
    } else {
      if (newParentChildList) {
        newParentChildList.push(childNode)
      } else {
        newParentNode.children = [childNode]
      }
    }
    if (oldParentNode) {
      this.changedHierarchy[oldParentNode.identifier] = {
        root: this.parentNode.includes(oldParentNode.identifier),
        contentType: oldParentNode.contentType,
        primaryCategory: oldParentNode.primaryCategory,
        children: oldParentChildList.map(v => {
          const child = v.identifier
          return child
        }),
      }
    }
    this.changedHierarchy[newParentNode.identifier] = {
      root: this.parentNode.includes(newParentNode.identifier),
      contentType: newParentNode.contentType,
      primaryCategory: newParentNode.primaryCategory,
      children: newParentChildList.map(v => {
        const child = v.identifier
        return child
      }),
    }
    if (newParentChildList.length > 0) {
      newParentChildList.forEach(element => {
        if (element.children && element.children.length > 0 && !(Object.keys(this.changedHierarchy).includes(element.identifier))) {
          this.changedHierarchy[element.identifier] = {
            root: this.parentNode.includes(element.identifier),
            contentType: element.contentType,
            primaryCategory: element.primaryCategory,
            children: element.children.map(v => {
              const child = v.identifier
              return child
            }),
          }
        }
      })
    }
    if (this.parentNode.length > 0) {
      this.parentNode.forEach(element => {
        if (!Object.keys(this.changedHierarchy).includes(element)) {
          const tempData: any = this.contentService.getOriginalMeta(element)
          const childrenArray: any = []
          if (tempData.children.length > 0) {
            tempData.children.forEach((childData: any) => {
              childrenArray.push(childData.identifier)
            })
          }
          this.changedHierarchy[element] = {
            root: this.parentNode.includes(element),
            contentType: tempData.contentType,
            primaryCategory: tempData.primaryCategory,
            children: childrenArray,
          }
        }
      })
    }
    if (emitChange) {
      this.treeStructureChange.next(this.treeStructureChange.value)
    }
  }

  async addChildOrSibling(
    contents: NSContent.IContentMeta[],
    dropNode: IContentTreeNode,
    adjacentId?: number,
    dropLocation: 'above' | 'below' = 'below',
  ): Promise<boolean> {
    try {
      const ids = contents.map(v => v.identifier)
      const contentDataMap = new Map<string, NSContent.IContentMeta>()
      contents.map((v, index) => {
        this.contentService.setOriginalMeta(v)
        const treeStructure = this.resolver.buildTreeAndMap(
          v,
          contentDataMap,
          this.flatNodeMap,
          this.uniqueIdMap,
          this.lexIdMap,
        )
        this.dragAndDrop(
          treeStructure,
          dropNode,
          adjacentId,
          dropLocation,
          index === ids.length - 1,
        )
      })
      return true
    } catch (ex) {
      this.logger.error(ex)
      return false
    }
  }

  async createChildOrSibling(
    type: string,
    dropNode: IContentTreeNode,
    adjacentId?: number,
    dropLocation: 'above' | 'below' = 'below',
    name: string = 'Untitled Content',
    description?: string,
    license?: string,
    purpose?: string,
    scoreCutoffType?: string,
    expectedDuration?: number,
    showTimer?: string,
    maxQuestions?: string,
    totalQuestions?: string
  ): Promise<any> {
    try {
      /* tslint:disable */
      // const parentMeta = this.contentService.originalContent[
      //   (this.flatNodeMap.get(this.currentParentNode) as IContentNode).identifier]
      /* tslint:disable */
      const meta = this.authInitService.creationEntity.get(type) as ICreateEntity
      const requestBody = {
        name,
        description: (description) ? description : '',
        mimeType: meta.mimeType,
        contentType: meta.contentType,
        resourceType: meta.resourceType,
        locale:
          // tslint:disable-next-line: ter-computed-property-spacing
          this.contentService.originalContent[
            (this.flatNodeMap.get(this.currentParentNode) as IContentNode).identifier
            // tslint:disable-next-line: ter-computed-property-spacing
          ].locale || 'en',
        ...(meta.additionalMeta || {}),
        primaryCategory: meta.primaryCategory,
        purpose: (purpose) ? purpose : '',
        license: (license) ? license : '',
        scoreCutoffType: (scoreCutoffType) ? scoreCutoffType : '',
        expectedDuration: (expectedDuration) ? expectedDuration : 0,
        showTimer: (showTimer) ? showTimer : '',
        maxQuestions: (maxQuestions) ? maxQuestions : 0,
        totalQuestions: (totalQuestions) ? totalQuestions : 0
      }
      const parentData = this.contentService.getOriginalMeta(this.contentService.parentContent)
      let content
      if (meta.primaryCategory === NsContent.EPrimaryCategory.ASSESSMENT
        || meta.primaryCategory === NsContent.EPrimaryCategory.FINALASSESSMENT) {
        content = await this.editorService.createAndReadAssessment(requestBody).toPromise()
      } else if (meta.primaryCategory === NsContent.EPrimaryCategory.MODULE) {
        const tempData =
          await this.editorService.createAndReadModule(this.getModuleRequest(meta, name, description, license, purpose),
            parentData.identifier).toPromise()
        this.contentService.resetOriginalMetaWithHierarchy(tempData.parentData)
        content = tempData.moduleData
      } else {
        content = await this.editorService.createAndReadContentV2(requestBody).toPromise()
      }
      if (content) {
        this.contentService.setOriginalMeta(content)
        const contentDataMap = new Map<string, NSContent.IContentMeta>()
        const treeStructure = this.resolver.buildTreeAndMap(
          content,
          contentDataMap,
          this.flatNodeMap,
          this.uniqueIdMap,
          this.lexIdMap,
        )
        this.dragAndDrop(treeStructure, dropNode, adjacentId, dropLocation)
        return content
      }
    } catch (ex) {
      this.logger.error(ex)
      return false
    }
  }

  addContentToTree(
    content: NSContent.IContentMeta,
    dropNode: IContentTreeNode,
    adjacentId?: number,
    dropLocation: 'above' | 'below' = 'below',
  ) {
    if (content) {
      this.contentService.setOriginalMeta(content)
      const contentDataMap = new Map<string, NSContent.IContentMeta>()
      const treeStructure = this.resolver.buildTreeAndMap(
        content,
        contentDataMap,
        this.flatNodeMap,
        this.uniqueIdMap,
        this.lexIdMap,
      )
      this.dragAndDrop(treeStructure, dropNode, adjacentId, dropLocation)
      return true
    }
    return false
  }

  getModuleRequest(meta: any, name: any, description: any, license: any, purpose: any) {
    const parentData = this.contentService.getOriginalMeta(this.contentService.parentContent)
    const nodesModify: any = {}
    const uuidValue = uuidv4()
    let randomNumber = ''
    // tslint:disable-next-line: no-increment-decrement
    for (let i = 0; i < 16; i++) {
      randomNumber += Math.floor(Math.random() * 10)
    }
    if (parentData && parentData.children && parentData.children.length > 0) {
      nodesModify[parentData.identifier] = {
        isNew: false,
        root: true,
      }
      parentData.children.forEach((element: any) => {
        if (element.primaryCategory === NsContent.EPrimaryCategory.MODULE) {
          nodesModify[element.identifier] = {
            isNew: false,
            root: (element.identifier === parentData.identifier) ? true : false,
          }
        }
        if (element.children && element.children.length > 0) {
          parentData.children.forEach((subEle: any) => {
            if (subEle.primaryCategory === NsContent.EPrimaryCategory.MODULE) {
              nodesModify[subEle.identifier] = {
                isNew: false,
                root: (subEle.identifier === parentData.identifier) ? true : false,
              }
            }
          })
        }
      })
    } else {
      nodesModify[parentData.identifier] = {
        isNew: false,
        root: true,
      }
    }
    nodesModify[uuidValue] = {
      isNew: true,
      root: false,
      metadata: {
        code: randomNumber,
        contentType: meta.contentType,
        createdBy: this.accessService.userId,
        createdFor: [(this.configSvc.userProfile && this.configSvc.userProfile.rootOrgId) ? this.configSvc.userProfile.rootOrgId : ''],
        creator: this.accessService.userName,
        description: description,
        framework: environment.framework,
        mimeType: meta.mimeType,
        name: name,
        organisation: [
          (this.configSvc.userProfile && this.configSvc.userProfile.departmentName) ? this.configSvc.userProfile.departmentName : '',
        ],
        isExternal: meta.mimeType === 'application/html',
        primaryCategory: meta.primaryCategory,
        license: (license) ? license : 'CC BY 4.0',
        ownershipType: ['createdFor'],
        purpose: (purpose) ? purpose : '',
        visibility: (meta.primaryCategory === NSContent.EPrimaryCategoryType.Collection) ? 'Parent' : 'Default',
      }
    }
    const hierarchyData = this.getTreeHierarchy()
    hierarchyData[uuidValue] = {
      root: false,
      contentType: meta.contentType,
      primaryCategory: meta.primaryCategory,
      children: []
    }
    Object.keys(hierarchyData).forEach((ele: any) => {
      if (hierarchyData[ele].root) {
        hierarchyData[ele].children.push(uuidValue)
      }
    })
    const modulePayload = {
      request: {
        data: {
          nodesModified: nodesModify,
          hierarchy: hierarchyData
        }
      }
    }
    return modulePayload
  }

  deleteNode(id: number) {
    const deleteIds = this.resolver.getFlatHierarchy(id, this.flatNodeMap, false)
    const node = this.flatNodeMap.get(id) as IContentNode
    const parentNode = node.parentId ? this.flatNodeMap.get(node.parentId) : undefined
    deleteIds.forEach(v => {
      this.flatNodeMap.delete(v)
      const lexId = this.uniqueIdMap.get(v) as string
      this.uniqueIdMap.delete(v)
      const uniqueIds = this.lexIdMap.get(lexId) as number[]
      if (uniqueIds.length > 1) {
        uniqueIds.splice(
          uniqueIds.findIndex(currId => v === currId),
          1,
        )
      } else {
        this.lexIdMap.delete(lexId)
        delete this.contentService.originalContent[lexId]
        delete this.contentService.upDatedContent[lexId]
        delete this.changedHierarchy[lexId]
      }
    })

    if (parentNode) {
      const children = parentNode.children || []
      children.splice(
        children.findIndex(v => v.id === id),
        1,
      )

      this.changedHierarchy[parentNode.identifier] = {
        root: this.parentNode.includes(parentNode.identifier),
        children: children.map(v => {
          const child = v.identifier
          // const child = {
          //   identifier: v.identifier,
          //   reasonAdded: 'Added from Authoring Tool',
          //   childrenClassifiers: [],
          // }
          return child
        }),
      }
      if (children.length > 0) {
        children.forEach(element => {
          if (element.children && element.children.length > 0 && !(Object.keys(this.changedHierarchy).includes(element.identifier))) {
            this.changedHierarchy[element.identifier] = {
              root: this.parentNode.includes(element.identifier),
              contentType: element.contentType,
              primaryCategory: element.primaryCategory,
              children: element.children.map(v => {
                const child = v.identifier
                return child
              }),
            }
          }
        })
      }
      if (this.parentNode.length > 0) {
        this.parentNode.forEach(element => {
          if (!Object.keys(this.changedHierarchy).includes(element)) {
            const tempData: any = this.contentService.getOriginalMeta(element)
            const childrenArray: any = []
            if (tempData.children.length > 0) {
              tempData.children.forEach((childData: any) => {
                childrenArray.push(childData.identifier)
              })
            }
            this.changedHierarchy[element] = {
              root: this.parentNode.includes(element),
              contentType: tempData.contentType,
              primaryCategory: tempData.primaryCategory,
              children: childrenArray,
            }
          }
        })
      }
    }
    this.treeStructureChange.next(this.treeStructureChange.value)
  }

  cascadeDown(id: number, value: any, field: string, single = false): boolean {
    const dependantIds = this.resolver.getFlatHierarchy(id, this.flatNodeMap, true)
    if (dependantIds.length <= 1) {
      return false
    }
    dependantIds
      .filter(v => v !== id)
      .forEach(v => {
        const lexId = this.uniqueIdMap.get(v) as string
        if (single) {
          // tslint:disable-next-line: ter-computed-property-spacing
          let meta = this.contentService.getUpdatedMeta(lexId)[
            field as keyof NSContent.IContentMeta
            // tslint:disable-next-line: ter-computed-property-spacing
          ]
          if (meta) {
            meta.push(value)
          } else {
            meta = [value]
          }
          this.contentService.setUpdatedMeta(
            ({ field: meta } as unknown) as NSContent.IContentMeta,
            lexId,
          )
        } else {
          this.contentService.setUpdatedMeta(
            ({ field: value } as unknown) as NSContent.IContentMeta,
            lexId,
          )
        }
      })
    return true
  }

  validationCheck(id: number): IProcessedError[] | null {
    const returnValue: Map<number, IProcessedError> = new Map<number, IProcessedError>()
    const errorIds = new Set<number>()
    const hierarchy = this.resolver.getFlatHierarchy(id, this.flatNodeMap)
    this.metaValidationCheck(hierarchy, errorIds, returnValue)
    this.hierarchyStructureCheck(hierarchy, errorIds, returnValue)
    this.onInvalidNodeChange.next(Array.from(errorIds))
    return returnValue.size ? Array.from(returnValue.values()) : null
  }

  hierarchyStructureCheck(
    ids: number[],
    errorId: Set<number>,
    errorMap: Map<number, IProcessedError>,
  ) {
    ids.forEach(v => {
      const contentNode = this.flatNodeMap.get(v) as IContentNode
      const primaryCategory = contentNode.primaryCategory as any
      const childConfig = this.authInitService.collectionConfig.childrenConfig[primaryCategory]
      const errorMsg: string[] = []
      const lexId = this.uniqueIdMap.get(v) as string
      const content = this.contentService.getUpdatedMeta(lexId)

      let currNode = contentNode
      let currentLevel = 0
      while (currNode.parentId) {
        currentLevel = currentLevel + 1
        currNode = this.flatNodeMap.get(currNode.parentId) as IContentNode
      }
      const excessLevel =
        DEPTH_RUE[contentNode.contentType] +
        currentLevel -
        this.authInitService.collectionConfig.maxDepth
      if (excessLevel > 0) {
        errorMsg.push(
          `Reached maximum level of depth allowed. It should be ${excessLevel} level above`,
        )
      }

      if (childConfig) {
        const allowedTypes = childConfig.childTypes
        const childTypeMap: number[] = allowedTypes.map(() => 0)
        const children = this.getChildrenDetails(contentNode.children || [])
        if (childConfig.minChildren && children.length < childConfig.minChildren) {
          errorMsg.push(
            `Minimum ${childConfig.minChildren} resources is required. But ${children.length ? children.length : 'nothing'
            } present`,
          )
        }
        if (childConfig.maxChildren && children.length > childConfig.maxChildren) {
          errorMsg.push(
            `Maximum ${childConfig.minChildren} children is allowed. But ${children.length} present`,
          )
        }
        children.forEach((child: IContentNode, position: number) => {
          const childContent = this.contentService.getUpdatedMeta(child.identifier)
          let canPresent = false
          allowedTypes.forEach((element: IAllowedType, index: number) => {
            const canAllow = this.contentService.checkConditionV2(childContent, element.conditions)
            if (canAllow) {
              canPresent = true
              childTypeMap[index] = childTypeMap[index] + 1
              if (element.position === 'n' && position !== children.length - 1) {
                let isSameChild = true
                children.slice(position).forEach((sibling: any) => {
                  const siblingChild = this.contentService.getUpdatedMeta(sibling.identifier)
                  isSameChild = this.contentService.checkConditionV2(
                    siblingChild,
                    element.conditions,
                  )
                  if (!isSameChild) {
                    errorMsg.push(`${childContent.name || 'Untitled Content'} should be last child`)
                    return
                  }
                })
              }
              return
            }
          })
          if (!canPresent) {
            errorMsg.push(`${childContent.name || 'Untitled Content'} is not allowed to add here`)
          }
        })
        allowedTypes.forEach((type: IAllowedType, index: number) => {
          if (type.minimum && childTypeMap[index] < type.minimum) {
            errorMsg.push(
              `Minimum ${type.minimum} contents of type ${this.formStringFromCondition(
                type.conditions,
              )} is required. But only ${childTypeMap[index]} is present`,
            )
          }
          if (type.maximum && type.maximum < childTypeMap[index]) {
            errorMsg.push(
              `Maximum ${type.maximum} contents of type ${this.formStringFromCondition(
                type.conditions,
              )} is allowed. But ${childTypeMap[index]} is present`,
            )
          }
        })
      } else if (contentNode.children && contentNode.children.length) {
        errorMsg.push(`Should not contain any child. But ${contentNode.children.length} were added`)
      }
      this.populateErrorMsg(v, errorMsg, content, errorId, errorMap)
    })
  }

  formStringFromCondition(condition: any): string {
    let returnValue = ''
    if (condition.fit) {
      condition.fit.forEach((subCondition: any, majorIndex: number) => {
        Object.keys(subCondition).forEach((v: any, index: number) => {
          returnValue = `${returnValue}${majorIndex > 0 ? ' or ' : ''}${index > 0 ? ' ' : ''
            }${v} in ${subCondition[v].join(' or ')}`
        })
      })
    }
    return returnValue
  }

  metaValidationCheck(ids: number[], errorId: Set<number>, errorMap: Map<number, IProcessedError>) {
    ids.forEach(v => {
      const errorMsg: string[] = []
      const lexId = this.uniqueIdMap.get(v) as string
      const content = this.contentService.getUpdatedMeta(lexId)
      let checkUnSavedData = this.contentService.upDatedContent[lexId]
      checkUnSavedData = this.contentService.cleanProperties(checkUnSavedData)
      if (checkUnSavedData) {
        if (Object.keys(checkUnSavedData).length > 1) {
          errorMsg.push('Please save the data')
        } else if (Object.keys(checkUnSavedData).length === 1 && Object.keys(checkUnSavedData)[0] !== 'versionKey') {
          errorMsg.push('Please save the data')
        }
      }
      if (!this.contentService.isValid(lexId)) {
        errorMsg.push('Mandatory fields are missing')
      }
      if (content.primaryCategory === NsContent.EPrimaryCategory.RESOURCE) {
        if (content.mimeType === 'application/html' && !content.artifactUrl && !content.body) {
          errorMsg.push('Provide URL or populate "Body" field')
        } else if (
          ['application/pdf',
            'application/x-mpegURL',
            'application/vnd.ekstep.html-archive',
            'audio/mpeg', 'video/mp4', 'text/x-url',
            'video/x-youtube']
            .includes(content.mimeType) &&
          !content.artifactUrl
        ) {
          errorMsg.push('Upload file')
        } else if (content.mimeType === 'application/json' && !(content.artifactUrl || content.downloadUrl)) {
          errorMsg.push('Please Create a valid Assessment.')
        }
      }
      this.populateErrorMsg(v, errorMsg, content, errorId, errorMap)
    })
  }

  populateErrorMsg(
    id: number,
    errorMsg: string[],
    content: NSContent.IContentMeta,
    errorId: Set<number>,
    errorMap: Map<number, IProcessedError>,
  ) {
    if (errorMsg.length) {
      errorId.add(id)
      if (errorMap.has(id)) {
        // tslint:disable-next-line: semicolon    // tslint:disable-next-line: whitespace
        ; (errorMap.get(id) as IProcessedError).message = (errorMap.get(
          id,
        ) as IProcessedError).message.concat(errorMsg)
      } else {
        errorMap.set(id, {
          id,
          name: content.name || 'Untitled Content',
          message: errorMsg,
        })
      }
    }
  }

  getTreeHierarchy() {
    this.hierarchyTree = {}
    const newParentNode = this.flatNodeMap.get(this.currentParentNode) as IContentNode
    this.hierarchyTree[newParentNode.identifier] = {
      root: this.parentNode.includes(newParentNode.identifier),
      children: (newParentNode.children) ? newParentNode.children.map(v => {
        const child = v.identifier
        if (v.primaryCategory === NsContent.EPrimaryCategory.RESOURCE) {
          this.hierarchyTree[v.identifier] = {
            root: false,
            primaryCategory: v.primaryCategory,
            name: v.name,
            children: []
          }
        }
        return child
      }) : [],
      primaryCategory: newParentNode.primaryCategory,
    }
    if (newParentNode.children && newParentNode.children.length > 0) {
      newParentNode.children.forEach(element => {
        if (element.children && element.children.length > 0) {
          this.hierarchyTree[element.identifier] = {
            root: this.parentNode.includes(element.identifier),
            contentType: element.contentType,
            primaryCategory: element.primaryCategory,
            children: element.children.map(v => {
              const child = v.identifier
              if (v.primaryCategory === NsContent.EPrimaryCategory.RESOURCE) {
                this.hierarchyTree[v.identifier] = {
                  root: false,
                  primaryCategory: v.primaryCategory,
                  name: v.name,
                  children: []
                }
              }
              return child
            }),
          }
          element.children.forEach(subElement => {
            if (subElement.children && subElement.children.length > 0) {
              this.hierarchyTree[subElement.identifier] = {
                root: this.parentNode.includes(subElement.identifier),
                contentType: subElement.contentType,
                primaryCategory: subElement.primaryCategory,
                children: subElement.children.map(v => {
                  const child = v.identifier
                  if (v.primaryCategory === NsContent.EPrimaryCategory.RESOURCE) {
                    this.hierarchyTree[v.identifier] = {
                      root: false,
                      primaryCategory: v.primaryCategory,
                      name: v.name,
                      children: []
                    }
                  }
                  return child
                }),
              }
            }
          })
        }
      })
    }
    if (newParentNode.primaryCategory === NsContent.EPrimaryCategory.PROGRAM) {
      Object.keys(this.hierarchyTree).forEach((element: any) => {
        if (this.hierarchyTree[element].primaryCategory !== NsContent.EPrimaryCategory.COURSE &&
          this.hierarchyTree[element].primaryCategory !== NsContent.EPrimaryCategory.PROGRAM) {
          delete this.hierarchyTree[element]
        } else if (this.hierarchyTree[element].primaryCategory === NsContent.EPrimaryCategory.COURSE) {
          this.hierarchyTree[element].children = []
        }
      })
    }
    return this.hierarchyTree
  }

  getAssessmentTreeHierarchy(id: string, questionSet?: any, question?: any) {
    const contentData = this.contentService.getAssessmentOriginalMeta(id)
    this.assessmentHierarchyTree[contentData.identifier] = {
      name: contentData.name,
      root: true,
      children: (contentData.children) ? contentData.children.map(v => {
        const child = v.identifier
        return child
      }) : [],
    }
    if (contentData.children && contentData.children.length > 0) {
      contentData.children.forEach(element => {
        this.assessmentHierarchyTree[element.identifier] = {
          children: (element.children && element.children.length > 0) ? element.children.map(v => {
            const child = v.identifier
            return child
          }) : [],
        }
      })
    }
    if (questionSet) {
      if (Object.keys(this.assessmentHierarchyTree).includes(questionSet)) {
        this.assessmentHierarchyTree[questionSet].children.push(question)
      } else {
        this.assessmentHierarchyTree[contentData.identifier].children.push(questionSet)
      }
    }
    return this.assessmentHierarchyTree
  }

  deleteQuestion(parentId: string, deleteID: string, action: string) {
    const contentData = this.contentService.getAssessmentOriginalMeta(parentId)
    if (contentData && contentData.children && contentData.children.length > 0) {
      if (action === 'deleteQuestion') {
        contentData.children.forEach((element: any) => {
          if (element && element.children && element.children.length > 0) {
            element.children = element.children.filter((v: any) => v.identifier !== deleteID)
          }
        })
      } else if (action === 'deleteSection') {
        contentData.children = contentData.children.filter((v: any) => v.identifier !== deleteID)
      }
    }
    this.contentService.setAssessmentOriginalMetaHierarchy(contentData)
  }

  async deleteContentNode(content: any) {
    const newParentNode = this.flatNodeMap.get(this.currentParentNode) as IContentNode
    if (newParentNode && newParentNode.children && newParentNode.children.length > 0) {
      let contentNodeId: number = 0
      await newParentNode.children.forEach((element: any) => {
        if (element.identifier === content.identifier) {
          contentNodeId = element.id
        }
        if (element.children && element.children.length > 0) {
          element.children.forEach((subEle: any) => {
            if (subEle.identifier === content.identifier) {
              contentNodeId = subEle.id
            }
          })
        }
      })
      if (contentNodeId > 0) {
        this.deleteNode(contentNodeId)
      }
    }
  }

  getChildrenDetails(meta: any) {
    let tempData: any = []
    meta.forEach((element: any) => {
      if (element.primaryCategory === NsContent.EPrimaryCategory.COURSE) {
        tempData.push(element)
      } else if (element.primaryCategory === NsContent.EPrimaryCategory.MODULE && element.children && element.children.length > 0) {
        element.children.forEach((subEle: any) => {
          tempData.push(subEle)
        })
      } else if (element.primaryCategory === NsContent.EPrimaryCategory.RESOURCE ||
        element.primaryCategory === NsContent.EPrimaryCategory.FINALASSESSMENT ||
        element.primaryCategory === NsContent.EPrimaryCategory.ASSESSMENT) {
        tempData.push(element)
      }
    })
    return tempData
  }
}
