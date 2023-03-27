import { ISearchResult } from '@ws/author/src/lib/interface/search'
import { HttpHeaders } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ConfigurationsService } from '@ws-widget/utils'
import {
  CONTENT_CREATE,
  CONTENT_DELETE,
  CONTENT_READ,
  SEARCH,
  STATUS_CHANGE,
  UNPUBLISH,
  EXPIRY_DATE_ACTION,
  CONTENT_RESTORE,
  SEARCH_V6_ADMIN,
  SEARCH_V6_AUTH,
  COPY_CONTENT_API,
  ACTION_CONTENT_V3,
} from '@ws/author/src/lib/constants/apiEndpoints'
import { NSApiRequest } from '@ws/author/src/lib/interface/apiRequest'
import { NSApiResponse } from '@ws/author/src/lib/interface/apiResponse'
import { NSContent } from '@ws/author/src/lib/interface/content'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { ApiService } from '@ws/author/src/lib/modules/shared/services/api.service'
import { Observable } from 'rxjs'
import { map, mergeMap } from 'rxjs/operators'
import { IFormMeta } from '@ws/author/src/lib/interface/form'
import { AuthInitService } from '@ws/author/src/lib/services/init.service'
import { NsContent } from '@ws-widget/collection/src/public-api'

@Injectable()
export class MyContentService {
  constructor(
    private authInitService: AuthInitService,
    private apiService: ApiService,
    private accessService: AccessControlService,
    private configSvc: ConfigurationsService,
  ) { }

  fetchContent(searchData: any): Observable<any> {
    return this.apiService
      .post<NSApiResponse.ISearchApiResponse>(SEARCH, searchData)
      .pipe(map((data: NSApiResponse.IApiResponse<NSApiResponse.ISearchApiResponse>) => data))
  }

  deleteContent(id: string, isKnowledgeBoard = false): Observable<null> {
    return isKnowledgeBoard
      ? this.apiService.delete(`${CONTENT_DELETE}/${id}/kb${this.accessService.orgRootOrgAsQuery}`)
      : this.apiService.post(`${CONTENT_DELETE}${this.accessService.orgRootOrgAsQuery}`, {
        identifier: id,
        author: this.accessService.userId,
        isAdmin: this.accessService.hasRole(['editor', 'admin']),
      })
  }

  restoreContent(id: string): Observable<null> {
    return this.apiService.post(`${CONTENT_RESTORE}${this.accessService.orgRootOrgAsQuery}`, {
      identifier: id,
      author: this.accessService.userId,
      isAdmin: this.accessService.hasRole(['editor', 'admin']),
    })
  }

  fetchFromSearchV6(searchData: any, forAdmin = false): Observable<ISearchResult> {
    return this.apiService.post<ISearchResult>(
      forAdmin ? SEARCH_V6_ADMIN : SEARCH_V6_AUTH,
      searchData,
    )
  }

  readContent(id: string): Observable<NSContent.IContentMeta> {
    return this.apiService.get<NSContent.IContentMeta>(
      `${CONTENT_READ}${id}?mode=edit`,
    ).pipe(
      map((data: any) => {
        return data.result.content
      })
    )
  }

  createInAnotherLanguage(id: string, lang: string): Observable<string> {
    return this.readContent(id).pipe(
      mergeMap(content => {
        let requestObj: any = {}
        Object.keys(this.authInitService.authConfig).map(
          v =>
          (requestObj[v as any] = content[v as keyof NSContent.IContentMeta]
            ? content[v as keyof NSContent.IContentMeta]
            : JSON.parse(
              JSON.stringify(
                this.authInitService.authConfig[v as keyof IFormMeta].defaultValue[
                  content.primaryCategory
                  // tslint:disable-next-line: ter-computed-property-spacing
                ][0].value,
              ),
            )),
        )
        requestObj = {
          ...requestObj,
          name: '',
          description: '',
          body: '',
          locale: lang,
          subTitle: '',
          appIcon: '',
          posterImage: '',
          thumbnail: '',
          isTranslationOf: id,
        }
        delete requestObj.identifier
        delete requestObj.status
        delete requestObj.categoryType
        delete requestObj.accessPaths
        return this.create(requestObj)
      }),
    )
  }

  create(meta: any): Observable<string> {
    const requestBody: NSApiRequest.ICreateMetaRequest = {
      content: {
        isExternal: false,
        ...meta,
        createdBy: this.accessService.userId,
        locale: meta.locale ? meta.locale : this.accessService.locale,
      },
    }
    if (this.accessService.rootOrg === 'client2') {
      if (meta.contentType === 'Knowledge Artifact') {
        try {
          const userPath = `client2/Australia/dealer_code-${this.configSvc.unMappedUser.json_unmapped_fields.dealer_group_code}`
          requestBody.content.accessPaths = userPath
        } catch {
          requestBody.content.accessPaths = 'client2'
        }
      } else {
        requestBody.content.accessPaths = 'client2'
      }
    }
    return this.apiService
      .post<NSApiRequest.ICreateMetaRequest>(
        // tslint:disable-next-line:max-line-length
        `${CONTENT_CREATE}${this.accessService.orgRootOrgAsQuery}`,
        requestBody,
      )
      .pipe(
        map((data: NSApiResponse.IContentCreateResponse) => {
          return data.identifier
        }),
      )
  }

  forwardBackward(
    meta: NSApiRequest.IForwardBackwardActionGeneral,
    id: string,
    status: string,
  ): Observable<null> {
    const requestBody: NSApiRequest.IForwardBackwardAction = {
      actor: this.accessService.userId,
      ...meta,
      org: this.accessService.org,
      rootOrg: this.accessService.rootOrg || '',
      appName: this.accessService.appName,
      appUrl: window.location.origin,
      actorName: this.accessService.userName,
      action: this.accessService.getAction(status, meta.operation),
    }
    return this.apiService.post<null>(STATUS_CHANGE + id, requestBody)
  }

  actionOnExpiry(meta: { expiryDate?: string; isExtend: boolean }, id: string): Observable<null> {
    const requestBody = {
      ...meta,
      identifier: id,
      org: this.accessService.org,
      rootOrg: this.accessService.rootOrg || '',
    }
    return this.apiService.post<null>(EXPIRY_DATE_ACTION, requestBody)
  }

  upPublishOrDraft(id: string, unpublish = true): Observable<null> {
    const requestBody = {
      unpublish,
      identifier: id,
    }
    return this.apiService.post<any>(
      `${UNPUBLISH}${this.accessService.orgRootOrgAsQuery}`,
      requestBody,
      true,
      {
        headers: new HttpHeaders({
          Accept: 'text/plain',
        }),
        responseType: 'text',
      },
    )
  }

  getSearchBody(
    mode: string,
    locale: string[] = [],
    pageNo = 0,
    query = '*',
    forAdmin = false,
    pageSize = 24,
  ): any {
    const searchV6Body = {
      locale,
      pageSize,
      pageNo,
      query,
      filters: [
        {
          andFilters: [
            {
              status: <string[]>[],
              creatorContacts: undefined as any,
              trackContacts: undefined as any,
              publisherDetails: undefined as any,
              expiryDate: undefined as any,
            } as any,
          ],
        },
      ],
      visibleFilters: {
        learningMode: { displayName: 'Mode' },
        duration: { displayName: 'Duration' },
        contentType: { displayName: 'Content Type' },
        exclusiveContent: { displayName: 'Costs' },
        complexityLevel: { displayName: 'Level' },
        catalogPaths: { displayName: 'Catalog', order: [{ _key: 'asc' }] },
        sourceShortName: { displayName: 'Source' },
        resourceType: { displayName: 'Format' },
        region: { displayName: 'Region' },
        concepts: { displayName: 'Concepts' },
        lastUpdatedOn: { displayName: 'Last Updated' },
        creatorContacts: { displayName: 'Curators', order: [{ _key: 'asc' }] },
      },
      sort: undefined as any,
      uuid: this.accessService.userId,
      rootOrg: this.accessService.rootOrg,
    }
    if (mode === 'all') {
      searchV6Body.sort = [{ lastUpdatedOn: 'desc' }]
      if (!forAdmin) {
        searchV6Body.filters[0] = {
          andFilters: [
            {
              creatorContacts: [this.accessService.userId],
              status: [
                'Draft',
                'InReview',
                'Reviewed',
                'Processing',
                'Live',
                'Deleted',
                'Unpublished',
                'QualityReview',
                'Expired',
                'MarkedForDeletion',
              ],
            },
          ],
        }
        searchV6Body.filters[1] = {
          andFilters: [{ trackContacts: [this.accessService.userId], status: ['InReview'] }],
        }
        searchV6Body.filters[2] = {
          andFilters: [{ publisherDetails: [this.accessService.userId], status: ['Reviewed'] }],
        }
      } else {
        searchV6Body.filters[0].andFilters[0].status = [
          'Draft',
          'InReview',
          'Reviewed',
          'Processing',
          'Live',
          'Deleted',
          'Unpublished',
          'QualityReview',
          'Expired',
          'MarkedForDeletion',
        ]
      }
    } else if (mode === 'expiry') {
      searchV6Body.filters[0].andFilters[0].creatorContacts = [this.accessService.userId]
      searchV6Body.filters[0].andFilters[0].status.push('Live')
      searchV6Body.filters[0].andFilters[0].expiryDate = [
        {
          lte: this.accessService.convertToESDate(
            new Date(new Date().setMonth(new Date().getMonth() + 1)),
          ),
          gte: this.accessService.convertToESDate(new Date()),
        },
      ]
      searchV6Body.sort = [{ expiryDate: 'asc' }]
    } else if (mode === 'draft') {
      searchV6Body.filters[0].andFilters[0].creatorContacts = [this.accessService.userId]
      searchV6Body.filters[0].andFilters[0].status.push('Draft')
      searchV6Body.sort = [{ lastUpdatedOn: 'desc' }]
    } else if (mode === 'inreview') {
      searchV6Body.filters[0].andFilters[0].creatorContacts = [this.accessService.userId]
      searchV6Body.sort = [{ lastUpdatedOn: 'desc' }]
      searchV6Body.filters[0].andFilters[0].status = ['InReview', 'Reviewed', 'QualityReview']
    } else if (mode === 'published') {
      searchV6Body.filters[0].andFilters[0].creatorContacts = [this.accessService.userId]
      searchV6Body.sort = [{ lastUpdatedOn: 'desc' }]
      searchV6Body.filters[0].andFilters[0].status.push('Live')
    } else if (mode === 'unpublished') {
      searchV6Body.filters[0].andFilters[0].creatorContacts = [this.accessService.userId]
      searchV6Body.sort = [{ lastUpdatedOn: 'desc' }]
      searchV6Body.filters[0].andFilters[0].status.push('Unpublished')
    } else if (mode === 'deleted') {
      searchV6Body.filters[0].andFilters[0].creatorContacts = [this.accessService.userId]
      searchV6Body.sort = [{ lastUpdatedOn: 'desc' }]
      searchV6Body.filters[0].andFilters[0].status.push('Deleted')
    } else if (mode === 'processing') {
      searchV6Body.filters[0].andFilters[0].creatorContacts = [this.accessService.userId]
      searchV6Body.sort = [{ lastUpdatedOn: 'desc' }]
      searchV6Body.filters[0].andFilters[0].status.push('Processing')
    } else if (mode === 'review') {
      searchV6Body.filters[0].andFilters[0].trackContacts = [this.accessService.userId]
      searchV6Body.sort = [{ lastUpdatedOn: 'asc' }]
      searchV6Body.filters[0].andFilters[0].status.push('InReview')
    } else if (mode === 'qualityReview') {
      searchV6Body.sort = [{ lastUpdatedOn: 'asc' }]
      searchV6Body.filters[0].andFilters[0].status.push('QualityReview')
    } else if (mode === 'publish') {
      searchV6Body.sort = [{ lastUpdatedOn: 'asc' }]
      searchV6Body.filters[0].andFilters[0].publisherDetails = [this.accessService.userId]
      searchV6Body.filters[0].andFilters[0].status.push('Reviewed')
    }
    if (forAdmin) {
      searchV6Body.filters[0].andFilters[0].publisherDetails = undefined
      searchV6Body.filters[0].andFilters[0].creatorContacts = undefined
      searchV6Body.filters[0].andFilters[0].trackContacts = undefined
    }
    if (query && query !== 'all' && query !== '*') {
      searchV6Body.sort = undefined
    }
    return searchV6Body
  }

  getTreeHierarchy(contentData: NSContent.IContentMeta) {
    const hierarchyTree: any = {}
    const parentNode = contentData.identifier
    const newParentNode = contentData
    hierarchyTree[newParentNode.identifier] = {
      root: parentNode.includes(newParentNode.identifier),
      children: (newParentNode.children) ? newParentNode.children.map(v => {
        const child = v.identifier
        if (v.primaryCategory === NsContent.EPrimaryCategory.RESOURCE) {
          hierarchyTree[v.identifier] = {
            root: false,
            primaryCategory: v.primaryCategory,
            name: v.name,
            children: [],
          }
        }
        return child
      }) : [],
      primaryCategory: newParentNode.primaryCategory,
    }
    if (newParentNode.children && newParentNode.children.length > 0) {
      newParentNode.children.forEach(element => {
        if (element.children && element.children.length > 0) {
          hierarchyTree[element.identifier] = {
            root: parentNode.includes(element.identifier),
            contentType: element.contentType,
            primaryCategory: element.primaryCategory,
            children: element.children.map(v => {
              const child = v.identifier
              if (v.primaryCategory === NsContent.EPrimaryCategory.RESOURCE) {
                hierarchyTree[v.identifier] = {
                  root: false,
                  primaryCategory: v.primaryCategory,
                  name: v.name,
                  children: [],
                }
              }
              return child
            }),
          }
          element.children.forEach(subElement => {
            if (subElement.children && subElement.children.length > 0) {
              hierarchyTree[subElement.identifier] = {
                root: parentNode.includes(subElement.identifier),
                contentType: subElement.contentType,
                primaryCategory: subElement.primaryCategory,
                children: subElement.children.map(v => {
                  const child = v.identifier
                  if (v.primaryCategory === NsContent.EPrimaryCategory.RESOURCE) {
                    hierarchyTree[v.identifier] = {
                      root: false,
                      primaryCategory: v.primaryCategory,
                      name: v.name,
                      children: [],
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
      Object.keys(hierarchyTree).forEach((element: any) => {
        if (hierarchyTree[element].primaryCategory !== NsContent.EPrimaryCategory.COURSE &&
          hierarchyTree[element].primaryCategory !== NsContent.EPrimaryCategory.PROGRAM) {
          delete hierarchyTree[element]
        } else if (hierarchyTree[element].primaryCategory === NsContent.EPrimaryCategory.COURSE) {
          hierarchyTree[element].children = []
        }
      })
    }
    return hierarchyTree
  }

  updateHierarchy(meta: NSApiRequest.IContentUpdateV3) {
    return this.apiService.patch<null>(
      `${ACTION_CONTENT_V3}hierarchy/update`,
      meta,
    )
  }

  copyContentApi(id: string, requestPayload: any) {
    return this.apiService.post<null>(
      `${COPY_CONTENT_API}${id}`,
      requestPayload
    )
  }

  getNodeModifyData(contentData: NSContent.IContentMeta) {
    const nodesModify: any = {}
    let randomNumber = ''
    // tslint:disable-next-line: no-increment-decrement
    for (let i = 0; i < 16; i++) {
      randomNumber += Math.floor(Math.random() * 10)
    }
    const parentData = contentData
    if (parentData) {
      nodesModify[parentData.identifier] = {
        isNew: false,
        root: true,
      }
      parentData.children.forEach((element: any) => {
        if (element.primaryCategory === NSContent.EPrimaryCategoryType.Collection) {
          nodesModify[element.identifier] = {
            isNew: true,
            root: (element.identifier === parentData.identifier) ? true : false,
            metadata: {
              code: randomNumber,
              contentType: element.contentType,
              createdBy: element.createdBy,
              createdFor: element.createdFor,
              creator: element.creator,
              description: element.description,
              framework: element.framework,
              mimeType: element.mimeType,
              name: `${element.name}-COPY-CONTENT`,
              organisation: element.organisation,
              isExternal: element.isExternal,
              primaryCategory: element.primaryCategory,
              license: element.license,
              ownershipType: element.ownershipType,
              purpose: element.purpose,
              visibility: element.visibility,
            },
          }
        }
      })
    }
    return nodesModify
  }
}
