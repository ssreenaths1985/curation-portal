import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router'
import { NsContent, PipeContentRoutePipe, WidgetContentService } from '@ws-widget/collection'
import { IResolveResponse } from '@ws-widget/utils/src/public-api'
import { Observable, of } from 'rxjs'
import { catchError, map, tap } from 'rxjs/operators'

const ADDITIONAL_FIELDS_IN_CONTENT = [
  'averageRating',
  'body',
  'creatorContacts',
  'creatorDetails',
  'curatedTags',
  'contentType',
  'collections',
  'children',
  'hasTranslations',
  'expiryDate',
  'exclusiveContent',
  'introductoryVideo',
  'introductoryVideoIcon',
  'isInIntranet',
  'isTranslationOf',
  'keywords',
  'learningMode',
  'license',
  'playgroundResources',
  'price',
  'registrationInstructions',
  'region',
  'registrationUrl',
  'resourceType',
  'subTitle',
  'softwareRequirements',
  'studyMaterials',
  'systemRequirements',
  'totalRating',
  'uniqueLearners',
  'viewCount',
  'labels',
  'sourceUrl',
  'sourceName',
  'sourceShortName',
  'sourceIconUrl',
  'locale',
  'hasAssessment',
  'preContents',
  'postContents',
  'kArtifacts',
  'equivalentCertifications',
  'certificationList',
  'posterImage',
]
@Injectable()
export class AppTocResolverService
  implements
  Resolve<
  Observable<IResolveResponse<NsContent.IContent>> | IResolveResponse<NsContent.IContent>
  > {
  constructor(
    private contentSvc: WidgetContentService,
    private routePipe: PipeContentRoutePipe,
    private router: Router,
  ) { }

  resolve(
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<IResolveResponse<NsContent.IContent>> {
    const contentId = route.paramMap.get('id')
    if (contentId) {
      const forPreview = window.location.href.includes('/author/')
      return (forPreview
        ? this.contentSvc.fetchAuthoringContentHierarchy(contentId)
        : this.contentSvc.fetchContent(contentId, 'detail', ADDITIONAL_FIELDS_IN_CONTENT)
      ).pipe(
        map(data => ({ data: data && data.result && data.result.content, error: null })),
        tap(resolveData => {
          let currentRoute: string[] | string = window.location.href.split('/')
          currentRoute = currentRoute[currentRoute.length - 1]
          if (forPreview && currentRoute !== 'contents' && currentRoute !== 'overview') {
            this.router.navigate([
              // tslint:disable-next-line: max-line-length
              `${forPreview ? '/author' : '/app'}/toc/${resolveData.data.identifier}/${resolveData.data.children.length ? 'contents' : 'overview'
              }`,
            ])
          } else if (
            currentRoute === 'contents' &&
            resolveData.data &&
            !resolveData.data.children.length
          ) {
            this.router.navigate([
              `${forPreview ? '/author' : '/app'}/toc/${resolveData.data.identifier}/single-page-view`,
            ])
          } else if (
            resolveData.data &&
            !forPreview
          ) {
            const urlObj = this.routePipe.transform(resolveData.data, forPreview)
            this.router.navigate([urlObj.url], { queryParams: urlObj.queryParams })
          }
        }),
        catchError((error: any) => of({ error, data: null })),
      )
    }
    return of({ error: 'NO_ID', data: null })
  }
}
