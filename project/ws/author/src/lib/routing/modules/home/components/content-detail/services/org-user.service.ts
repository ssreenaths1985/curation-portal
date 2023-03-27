import { Injectable } from '@angular/core'
import { ConfigurationsService } from '@ws-widget/utils/src/public-api'
import { ApiService } from '../../../../../../modules/shared/services/api.service'
import { map } from 'rxjs/operators'
/* tslint:disable */
import _ from 'lodash'
import { of } from 'rxjs';
/* tslint:enable */

const API_END_POINTS = {
  LIST_ALL_USERS: '/apis/proxies/v8/user/v1/search',
  ADD_TO_BATCH: '/apis/authApi/batch/addUser',
  READ_OTHER_USER: (userId: string) => `/apis/proxies/v8/api/user/v2/read/${userId}`,
  REMOVE_USER_FROM_BATCH: '/apis/authApi/batch/removeUser',
  AUTO_USERSEARCH: (usertext: string) => `/apis/proxies/v8/user/v1/autocomplete/${usertext}`,
}
@Injectable({
  providedIn: 'root',
})
export class OrgUserService {
  constructor(
    private apiService: ApiService,
    private configSvc: ConfigurationsService
  ) { }

  getUserSearchList(userText: string) {
    return this.apiService.get(API_END_POINTS.AUTO_USERSEARCH(userText)).pipe(map(res => _.get(res, 'result.response')))
  }

  getOrgUsersList() {
    const rootOrgId = this.configSvc.userProfile && this.configSvc.userProfile.rootOrgId
    if (!rootOrgId) {
      return of([])
    }
    return this.apiService.post(API_END_POINTS.LIST_ALL_USERS, {
      request: {
        filters: {
          'organisations.organisationId': rootOrgId,
        },
      },
    }).pipe(map(res => {
      if (res.responseCode === 'OK') {
        return res.result.response
      }
    }))
  }
  addToBatch(data: any) {
    return this.apiService.post(API_END_POINTS.ADD_TO_BATCH, data)
  }
  getUser(userId: string) {
    return this.apiService.get(API_END_POINTS.READ_OTHER_USER(userId)).pipe(map(res => _.get(res, 'result.response')))
  }
  removeUserFromBatch(data: { request: { courseId: string, batchId: string, userId: string } }) {
    return this.apiService.post(API_END_POINTS.REMOVE_USER_FROM_BATCH, data)
  }
}
