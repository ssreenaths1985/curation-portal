import { Injectable } from '@angular/core'
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router'
import { Observable, of } from 'rxjs'
import { ApiService } from '../modules/shared/services/api.service'
import { NSContent } from '../interface/content'
// import { AUTHORING_BASE } from '../constants/apiEndpoints'
import { catchError, map } from 'rxjs/operators'
import { ACTION_CONTENT_V3 } from '../constants/apiEndpoints'

@Injectable()
export class ContentAndDataReadMultiLangTOCResolver implements Resolve<{ content: NSContent.IContentMeta, data: any }[] | null> {

  constructor(
    private apiService: ApiService,
    private router: Router,
  ) {
  }

  jsonVerify(s: string) { try { JSON.parse(s); return true } catch (e) { return false } }

  resolve(
    route: ActivatedRouteSnapshot,
  ): Observable<{ content: NSContent.IContentMeta, data: any }[]> | null {
    const id = route.params['id']
    if (id !== 'new') {
      return this.apiService.get<{ content: NSContent.IContentMeta, data: any }[]>(
        `${ACTION_CONTENT_V3}hierarchy/${id}?mode=edit`,
      ).pipe(
        map((data: any) => {
          if (data.result && data.result.content) {
            data.result.content.creatorContacts =
              this.jsonVerify(data.result.content.creatorContacts) ? JSON.parse(data.result.content.creatorContacts) : []
            data.result.content.trackContacts =
              this.jsonVerify(data.result.content.reviewer) ? JSON.parse(data.result.content.reviewer) : []
            data.result.content.creatorDetails =
              this.jsonVerify(data.result.content.creatorDetails) ? JSON.parse(data.result.content.creatorDetails) : []
            data.result.content.publisherDetails = this.jsonVerify(data.result.content.publisherDetails) ?
              JSON.parse(data.result.content.publisherDetails) : []
            if (data.result.content.children.length > 0) {
              data.result.content.children.forEach((element: any) => {
                element.creatorContacts = this.jsonVerify(element.creatorContacts) ? JSON.parse(element.creatorContacts) : []
                element.trackContacts = this.jsonVerify(element.reviewer) ? JSON.parse(element.reviewer) : []
                element.creatorDetails = this.jsonVerify(element.creatorDetails) ? JSON.parse(element.creatorDetails)
                  : element.creatorDetails
                element.publisherDetails = this.jsonVerify(element.publisherDetails) ? JSON.parse(element.publisherDetails) : []
                if (element.children && element.children.length > 0) {
                  element.children.forEach((subEle: any) => {
                    subEle.creatorContacts = this.jsonVerify(subEle.creatorContacts) ? JSON.parse(subEle.creatorContacts) : []
                    subEle.trackContacts = this.jsonVerify(subEle.reviewer) ? JSON.parse(subEle.reviewer) : []
                    subEle.creatorDetails = this.jsonVerify(subEle.creatorDetails) ? JSON.parse(subEle.creatorDetails) : []
                    subEle.publisherDetails = this.jsonVerify(subEle.publisherDetails) ? JSON.parse(subEle.publisherDetails) : []
                  })
                }
              })
            }
          }
          return [data.result]
        }),
        catchError((v: any) => {
          this.router.navigateByUrl('/error-somethings-wrong')
          return of(v)
        }),
      )
    }
    return null
  }

  // resolve(
  //   route: ActivatedRouteSnapshot,
  // ): Observable<{ content: NSContent.IContentMeta, data: any }[]> | null {
  //   const id = route.params['id']
  //   if (id !== 'new') {
  //     return this.apiService.get<{ content: NSContent.IContentMeta, data: any }[]>(
  //       `${AUTHORING_BASE}${id}`,
  //     ).pipe(
  //       catchError((v: any) => {
  //         this.router.navigateByUrl('/error-somethings-wrong')
  //         return of(v)
  //       }),
  //     )
  //   }
  //   return null
  // }
}
