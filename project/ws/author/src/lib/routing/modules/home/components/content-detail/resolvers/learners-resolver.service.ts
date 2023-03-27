import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router'
import { NsContent, WidgetContentService } from '@ws-widget/collection'
// import { IResolveResponse } from '@ws-widget/utils/src/public-api'
import { Observable, of } from 'rxjs'
import { catchError } from 'rxjs/operators'

@Injectable()
export class LearnersResolverService
  implements
  Resolve<
  Observable<NsContent.IContent> | null
  > {
  constructor(
    private router: Router,
    private contentSvc: WidgetContentService,
  ) { }

  resolve(
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<NsContent.IContent> | null {
    const contentId = route.paramMap.get('contentId') || null
    const batch = route.paramMap.get('batch') || null
    if (contentId && batch) {
      return this.contentSvc.fetchLearners(contentId) // need batch ID
        .pipe(
          catchError((v: any) => {
            this.router.navigateByUrl('/error-somethings-wrong')
            return of(v)
          }))
    }
    return null
  }
}
