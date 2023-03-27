import { Injectable } from '@angular/core'
import { ConfigurationsService } from '@ws-widget/utils/src/public-api'
import { ACTION_CONTENT_V3, CONTENT_CREATE } from '@ws/author/src/lib/constants/apiEndpoints'
import { NSApiResponse } from '@ws/author/src/lib/interface//apiResponse'
import { NSApiRequest } from '@ws/author/src/lib/interface/apiRequest'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { ApiService } from '@ws/author/src/lib/modules/shared/services/api.service'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { NsContent } from '../../../../../../../../../../library/ws-widget/collection/src/public-api'
import { environment } from '../../../../../../../../../../src/environments/environment'

@Injectable()
export class CreateService {
  constructor(
    private apiService: ApiService,
    private configSvc: ConfigurationsService,
    private accessService: AccessControlService,
  ) { }

  create(meta: { mimeType: string; contentType: string; locale: string, name: string }): Observable<string> {
    const requestBody: NSApiRequest.ICreateMetaRequest = {
      content: {
        ...meta,
        name: meta.name,
        description: '',
        category: meta.contentType,
        createdBy: this.accessService.userId,
        authoringDisabled: false,
        isContentEditingDisabled: false,
        isMetaEditingDisabled: false,
        isExternal: meta.mimeType === 'text/x-url',
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
        `${CONTENT_CREATE}${this.accessService.orgRootOrgAsQuery}`,
        requestBody,
      )
      .pipe(
        map((data: NSApiResponse.IContentCreateResponse) => {
          return data.identifier
        }),
      )
  }

  createV2(meta:
    {
      mimeType: string; contentType: string; locale: string, name: string, primaryCategory: string, purpose: string
    }): Observable<string> {
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
          description: '',
          framework: environment.framework,
          mimeType: meta.mimeType,
          name: meta.name,
          purpose: (meta.purpose) ? meta.purpose : '',
          organisation: [
            (this.configSvc.userProfile && this.configSvc.userProfile.departmentName) ? this.configSvc.userProfile.departmentName : '',
          ],
          isExternal: meta.mimeType === 'text/x-url',
          primaryCategory: meta.primaryCategory,
          license: 'CC BY 4.0',
          ownershipType: ['createdFor'],
          visibility: (meta.primaryCategory === NsContent.EPrimaryCategory.MODULE) ? 'Parent' : 'Default',
        },
      },
    }
    // if (this.accessService.rootOrg === 'client2') {
    //   if (meta.contentType === 'Knowledge Artifact') {
    //     try {
    //       const userPath = `client2/Australia/dealer_code-${this.configSvc.unMappedUser.json_unmapped_fields.dealer_group_code}`
    //       requestBody.content.accessPaths = userPath
    //     } catch {
    //       requestBody.content.accessPaths = 'client2'
    //     }
    //   } else {
    //     requestBody.content.accessPaths = 'client2'
    //   }
    // }
    return this.apiService
      .post<NSApiRequest.ICreateMetaRequest>(
        `${ACTION_CONTENT_V3}create`,
        requestBody,
      )
      .pipe(
        map((data: NSApiResponse.IContentCreateResponseV2) => {
          return data.result.identifier
        }),
      )
  }
}
