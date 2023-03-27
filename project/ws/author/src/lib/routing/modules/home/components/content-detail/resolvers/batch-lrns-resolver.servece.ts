import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot, Router } from '@angular/router'
import { Observable, of } from 'rxjs'
/* tslint:disable */
import _ from 'lodash'
import { IBatch } from '../interface/content-batch.model'
/* tslint:enable */
import { catchError, map } from 'rxjs/operators'
import { ContentBatchService } from '../services/content-batch.service'

@Injectable()
export class BatchLearnersResolverService
  implements Resolve<Observable<any>> {
  constructor(
    private router: Router,
    private contentBatchSvc: ContentBatchService,
  ) { }

  resolve(
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<any> {
    const rawBatch: Readonly<string | null> = _.get(route, 'parent.parent.params.batch') || ''
    const batch: Readonly<IBatch | null> = this.batch(rawBatch)
    if (batch) {
      const data: Readonly<any> = {
        request: {
          batchList: [{
            batchId: batch.batchId,
            userList: [],
          },
          ],
        },
      }
      return this.contentBatchSvc.fetchBatchLearners(data) // need batch ID
        .pipe(
          catchError((v: any) => {
            this.router.navigateByUrl('/error-somethings-wrong')
            return of(v)
          })).pipe(map(r => r.result))
    }
    return of(null)
  }

  batch(rawBatch: any): IBatch | null {
    try {
      return JSON.parse(atob(rawBatch))
    } catch {
      return null
    }
  }
}
