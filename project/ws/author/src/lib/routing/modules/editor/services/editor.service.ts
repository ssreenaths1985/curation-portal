import { Injectable } from '@angular/core'
import { NsAutoComplete, UserAutocompleteService } from '@ws-widget/collection'
// import { ConfigurationsService } from '@ws-widget/utils'
import {
  AUTHORING_CONTENT_BASE,
  CONTENT_BASE_COPY,
  CONTENT_CREATE,
  CONTENT_DELETE,
  // CONTENT_READ,
  CONTENT_SAVE,
  CONTENT_SAVE_V2,
  SEARCH,
  STATUS_CHANGE,
  SEARCH_V6_ADMIN,
  SEARCH_V6_AUTH,
  AUTHORING_BASE,
  SEND_TO_REVIEW,
  PUBLISH_CONTENT,
  REJECT_CONTENT,
  EMAIL_NOTIFICATION,
  ACTION_CONTENT_V3,
  CREATE_ASSESSMENT_QUESTION_SET,
  GET_ASSESSMENT_DATA,
  UPDATE_ASSESSMENT_HIERARCHY,
  GET_ASSESSMENT_HIERARCHY,
  GET_QUESTION_DETAILS,
  SEND_ASSESSMENT_TO_REVIEW,
  UPDATE_ASSESSMENT_CONTENT,
  PUBLISH_ASSESSMENT_CONTENT,
  COPY_CONTENT_API,
  SURVEY_LINK_TAG,
  SURVEY_LINK_UNTAG,
} from '@ws/author/src/lib/constants/apiEndpoints'
import { NSApiResponse } from '@ws/author/src/lib/interface//apiResponse'
import { NSApiRequest } from '@ws/author/src/lib/interface/apiRequest'
import { NSContent } from '@ws/author/src/lib/interface/content'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { ApiService } from '@ws/author/src/lib/modules/shared/services/api.service'
import { EMPTY, Observable, of } from 'rxjs'
import { map, mergeMap, catchError } from 'rxjs/operators'
// import { CONTENT_READ_MULTIPLE_HIERARCHY } from './../../../../constants/apiEndpoints'
import { ISearchContent, ISearchResult } from '../../../../interface/search'
import { environment } from '../../../../../../../../../src/environments/environment'
import { ConfigurationsService } from '@ws-widget/utils/src/public-api'

@Injectable()
export class EditorService {
  accessPath: string[] = []
  constructor(
    private apiService: ApiService,
    private accessService: AccessControlService,
    private userAutoComplete: UserAutocompleteService,
    private configSvc: ConfigurationsService,
  ) { }

  create(meta: NSApiRequest.ICreateMetaRequestGeneral): Observable<string> {
    const requestBody: NSApiRequest.ICreateMetaRequest = {
      content: {
        locale: 'en',
        isExternal: false,
        authoringDisabled: false,
        isMetaEditingDisabled: false,
        isContentEditingDisabled: false,
        category: meta.contentType,
        ...meta,
        createdBy: this.accessService.userId,
      },
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

  createV2(meta: NSApiRequest.ICreateMetaRequestGeneralV2): Observable<string> {
    let randomNumber = ''
    // tslint:disable-next-line: no-increment-decrement
    for (let i = 0; i < 16; i++) {
      randomNumber += Math.floor(Math.random() * 10)
    }
    const requestBody: NSApiRequest.ICreateMetaRequestV2 = {
      request: {
        content: {
          code: randomNumber,
          contentType: meta.contentType,
          createdBy: this.accessService.userId,
          createdFor: [(this.configSvc.userProfile && this.configSvc.userProfile.rootOrgId) ? this.configSvc.userProfile.rootOrgId : ''],
          creator: this.accessService.userName,
          description: meta.description,
          framework: environment.framework,
          mimeType: meta.mimeType,
          name: meta.name,
          organisation: [
            (this.configSvc.userProfile && this.configSvc.userProfile.departmentName) ? this.configSvc.userProfile.departmentName : '',
          ],
          isExternal: meta.mimeType === 'application/html',
          primaryCategory: meta.primaryCategory,
          license: (meta.license) ? meta.license : 'CC BY 4.0',
          ownershipType: ['createdFor'],
          purpose: (meta.purpose) ? meta.purpose : '',
          visibility: (meta.primaryCategory === NSContent.EPrimaryCategoryType.Collection) ? 'Parent' : 'Default',
        },
      },
    }

    return this.apiService
      .post<NSApiRequest.ICreateMetaRequestV2>(
        // tslint:disable-next-line:max-line-length
        `${ACTION_CONTENT_V3}create`,
        requestBody,
      )
      .pipe(
        map((data: NSApiResponse.IContentCreateResponseV2) => {
          return data.result.identifier
        }),
      )
  }

  createAssessment(meta: any) {
    let randomNumber = ''
    // tslint:disable-next-line: no-increment-decrement
    for (let i = 0; i < 16; i++) {
      randomNumber += Math.floor(Math.random() * 10)
    }
    const requestBody = {
      request: {
        questionset: {
          code: randomNumber,
          createdBy: this.accessService.userId,
          createdFor: [(this.configSvc.userProfile && this.configSvc.userProfile.rootOrgId) ? this.configSvc.userProfile.rootOrgId : ''],
          scoreCutoffType: (meta.scoreCutoffType) ? meta.scoreCutoffType : '',
          description: meta.description,
          framework: environment.framework,
          license: (meta.license) ? meta.license : 'CC BY 4.0',
          mimeType: meta.mimeType,
          name: meta.name,
          primaryCategory: meta.primaryCategory,
          purpose: (meta.purpose) ? meta.purpose : '',
          expectedDuration: (meta.expectedDuration) ? meta.expectedDuration : 0,
          showTimer: (meta.showTimer) ? meta.showTimer : '',
          totalQuestions: (meta.totalQuestions) ? meta.totalQuestions : 0,
          maxQuestions: (meta.maxQuestions) ? meta.maxQuestions : 0,
        },
      },
    }
    return this.apiService
      .post<any>(
        // tslint:disable-next-line:max-line-length
        `${CREATE_ASSESSMENT_QUESTION_SET}`,
        requestBody,
      )
      .pipe(
        map((data: any) => {
          return data.result.identifier
        }),
      )
  }

  createModule(meta: any) {
    return this.apiService.patch<null>(
      `${ACTION_CONTENT_V3}hierarchy/update`,
      meta,
    ).pipe(
      map((data: any) => {
        const temp = Object.keys(data.result.identifiers).filter((v: any) => !v.includes('do_'))
        return data.result.identifiers[temp[0]]
      })
    )
  }

  getModuleContent(id: string, moduleId: any): Observable<any> {
    return this.apiService.get<NSContent.IContentMeta>(
      `${ACTION_CONTENT_V3}hierarchy/${id}?mode=edit`
    ).pipe(
      map((data: any) => {
        const tempReturnData = data.result.content.children.filter((v: NSContent.IContentMeta) => v.identifier === moduleId)
        return { parentData: data.result.content, moduleData: tempReturnData[0] }
      })
    )
  }

  readContent(id: string): Observable<NSContent.IContentMeta> {
    return this.apiService.get<NSContent.IContentMeta>(
      `${AUTHORING_BASE}${id}${this.accessService.orgRootOrgAsQuery}`,
    )
  }

  readContentV2(id: string): Observable<NSContent.IContentMeta> {
    return this.apiService.get<NSContent.IContentMeta>(
      `${ACTION_CONTENT_V3}read/${id}?mode=edit`,
    ).pipe(
      map((data: any) => {
        return data.result.content
      })
    )
  }

  readAssessmentQuestionSet(id: string): Observable<any> {
    return this.apiService.get<any>(
      `${GET_ASSESSMENT_DATA}${id}`,
    ).pipe(
      map((data: any) => {
        return data.result.questionset
      })
    )
  }

  readcontentV3(id: string): Observable<NSContent.IContentMeta> {
    return this.apiService.get<NSContent.IContentMeta>(
      `${ACTION_CONTENT_V3}hierarchy/${id}?mode=edit`
    ).pipe(
      map((data: any) => {
        return data.result.content
      })
    )
  }

  // readMultipleContent(ids: string[]): Observable<NSContent.IContentMeta[]> {
  //   return this.apiService.get<NSContent.IContentMeta>(
  //     `${CONTENT_READ_MULTIPLE_HIERARCHY}${ids.join()}`,
  //   )
  // }

  createAndReadContent(
    meta: any, // NSApiRequest.ICreateMetaRequestGeneral to enable top-bottom Aproach
  ): Observable<NSContent.IContentMeta> {
    return this.create(meta).pipe(mergeMap(data => this.readContent(data)))
  }

  createAndReadContentV2(
    meta: NSApiRequest.ICreateMetaRequestGeneralV2,
  ): Observable<NSContent.IContentMeta> {
    return this.createV2(meta).pipe(mergeMap(data => this.readContentV2(data)))
  }

  createAndReadAssessment(
    meta: any,
  ): Observable<any> {
    return this.createAssessment(meta).pipe(mergeMap(data => this.readAssessmentQuestionSet(data)))
  }

  createAndReadModule(
    requestPayload: any,
    parentId: any
  ): Observable<any> {
    return this.createModule(requestPayload).pipe(mergeMap(data => this.getModuleContent(parentId, data)))
  }

  updateContent(meta: NSApiRequest.IContentUpdate): Observable<null> {
    return this.apiService.post<null>(
      `${CONTENT_SAVE}${this.accessService.orgRootOrgAsQuery}`,
      meta,
    )
  }

  updateContentV2(meta: NSApiRequest.IContentUpdate): Observable<null> {
    return this.apiService.post<null>(
      `${CONTENT_SAVE_V2}${this.accessService.orgRootOrgAsQuery}`,
      meta,
    )
  }

  updateContentV3(meta: NSApiRequest.IContentUpdateV2, id: string): Observable<any> {
    return this.apiService.patch<any>(
      `${ACTION_CONTENT_V3}update/${id}`,
      meta,
    )
  }

  updateContentWithFewFields(requestBody: any, identifier: string): Observable<any> {
    return this.apiService.patch<any>(
      `${ACTION_CONTENT_V3}update/${identifier}`,
      requestBody,
    )
  }

  updateContentForReviwer(requestBody: any, identifier: string): Observable<any> {
    return this.apiService.patch<any>(
      `${ACTION_CONTENT_V3}updateReviewStatus/${identifier}`,
      requestBody
    )
  }

  updateHierarchyForReviwer(meta: NSApiRequest.IContentUpdateV3): Observable<any> {
    return this.apiService.patch<null>(
      `${ACTION_CONTENT_V3}hierarchyUpdate`,
      meta,
    )
  }

  rejectContentApi(requestPayload: any, id: string): Observable<null> {
    return this.apiService.post<any>(REJECT_CONTENT + id, requestPayload)
  }

  updateContentV4(meta: NSApiRequest.IContentUpdateV3) {
    return this.apiService.patch<null>(
      `${ACTION_CONTENT_V3}hierarchy/update`,
      meta,
    )
  }

  updateAssessmentHierarchy(meta: NSApiRequest.IContentUpdateV3) {
    return this.apiService.patch<null>(
      `${UPDATE_ASSESSMENT_HIERARCHY}`,
      meta,
    )
  }

  getQuestionDetailsApi(requestPayload: any) {
    return this.apiService.post<null>(
      `${GET_QUESTION_DETAILS}`, requestPayload
    )
  }

  sendAssessmentToReview(requestPayload: any, identifier: string) {
    return this.apiService.post<null>(
      `${SEND_ASSESSMENT_TO_REVIEW}${identifier}`, requestPayload
    )
  }

  surveyLinkTag(requestPayload: any) {
    return this.apiService.post<null>(
      `${SURVEY_LINK_TAG}`, requestPayload
    )
  }

  surveyLinkUntag(requestPayload: any) {
    return this.apiService.post<null>(
      `${SURVEY_LINK_UNTAG}`, requestPayload
    )
  }

  updateAssessmentContent(requestPayload: any, identifier: string) {
    return this.apiService.patch<null>(
      `${UPDATE_ASSESSMENT_CONTENT}${identifier}`, requestPayload
    )
  }

  publishAssessmentApi(requestPayload: any, identifier: string) {
    return this.apiService.post<null>(
      `${PUBLISH_ASSESSMENT_CONTENT}${identifier}`, requestPayload
    )
  }

  getAssessmentHierarchy(id: string) {
    return this.apiService.get<null>(
      `${GET_ASSESSMENT_HIERARCHY}${id}?mode=edit`
    )
  }

  fetchEmployeeList(data: string, roleType?: string): Observable<any[]> {
    return this.userAutoComplete.fetchAutoCompleteV2(data, roleType).pipe(
      map((v: NsAutoComplete.IUserAutoComplete[]) => {
        return v.map(user => {
          return {
            displayName: `${user.first_name || ''} ${user.last_name || ''}`,
            id: user.wid,
            mail: user.email,
            department: user.department_name,
          }
        })
      }),
      catchError(_ => of([])),
    )
  }

  searchSkills(query: string): Observable<any> {
    return this.apiService.get(`/LA/api/search?search_text=${query}&type=skill`).pipe(
      map((v: any) =>
        v.map((val: any) => {
          return {
            identifier: val.identifier,
            name: val.name,
            skill: val.skill,
            category: val.category,
          }
        }),
      ),
    )
  }

  searchV6Content(query = '*', locale: string): Observable<ISearchContent[]> {
    return this.apiService
      .post<ISearchResult>(
        this.accessService.hasRole(['editor', 'admin']) ? SEARCH_V6_ADMIN : SEARCH_V6_AUTH,
        {
          query: query || '*',
          locale: [locale],
          pageSize: 20,
          pageNo: 0,
          filters: [
            {
              andFilters: [
                {
                  status: ['Live'],
                  contentType: ['Course', 'Collection', 'Learning Path', 'Resource', 'CourseUnit'],
                },
              ],
            },
          ],
          uuid: this.accessService.userId,
          rootOrg: this.accessService.rootOrg,
        },
      )
      .pipe(
        map(v => (v && v.result ? v.result : [])),
        catchError(_ => of([])),
      )
  }

  checkUrl(url: string): Observable<any> {
    return this.apiService.get<any>(url)
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

  sendToReview(id: string, parentStatus: string) {
    if (parentStatus === 'Draft') {
      const requestbody = {}
      return this.apiService.post<any>(SEND_TO_REVIEW + id, requestbody)
    }
    return EMPTY
  }

  publishContent(id: string) {
    const requestbody = {
      request: {
        content: {
          publisher: this.accessService.userName,
          lastPublishedBy: this.accessService.userName,
        },
      },
    }
    return this.apiService.post<any>(PUBLISH_CONTENT + id, requestbody)
  }

  sendEmailNotificationAPI(requestBody: any): Observable<any> {
    return this.apiService.post<any>(EMAIL_NOTIFICATION, requestBody)
  }

  readJSON(artifactUrl: string): Observable<any> {
    return this.apiService.get(`${AUTHORING_CONTENT_BASE}${encodeURIComponent(artifactUrl)}`)
  }

  searchContent(searchData: any): Observable<any> {
    return this.apiService
      .post<NSApiResponse.ISearchApiResponse>(SEARCH, searchData)
      .pipe(map((data: NSApiResponse.IApiResponse<NSApiResponse.ISearchApiResponse>) => data))
  }

  checkRole(id: string): Observable<string[]> {
    return this.apiService.get<string[]>(`/apis/protected/V8/user/roles/${id}`).pipe(
      map((v: { default_roles: string[]; user_roles: string[] }) => {
        if (v) {
          let roles: string[] = []
          if (v.default_roles) {
            roles = roles.concat(v.default_roles)
          }
          if (v.user_roles) {
            roles = roles.concat(v.user_roles)
          }
          return roles
        }
        return []
      }),
    )
  }

  getAccessPath(): Observable<string[]> {
    return this.accessPath.length
      ? of()
      : this.apiService.get<string[]>(`/apis/protected/V8/user/accessControl`).pipe(
        map((v: { special: { accessPaths: string[] }[] }) => {
          if (v) {
            v.special.forEach(acc => {
              this.accessPath = this.accessPath.concat(acc.accessPaths)
            })
          }
          return this.accessPath
        }),
      )
  }

  copy(lexId: string, url: string) {
    // tslint:disable-next-line: max-line-length
    const destination = `${this.accessService.rootOrg.replace(
      / /g,
      '_',
    )}%2F${this.accessService.org.replace(/ /g, '_')}%2FPublic%2F${lexId.replace('.img', '')}`
    const location = url.split('/').slice(4, 8).join('%2F')
    return this.apiService.post(
      CONTENT_BASE_COPY,
      {
        destination,
        location,
      },
      false,
    )
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

  copyContentApi(id: string, requestPayload: any) {
    return this.apiService.post<null>(
      `${COPY_CONTENT_API}${id}`,
      requestPayload
    )
  }
}
