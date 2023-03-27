import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve } from '@angular/router'
import { Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { IResolveResponse } from '@ws-widget/utils'
import { NSCompetencyV2 } from '../interface/competency'
import { CompService } from '../services/competencies.service'

@Injectable()
export class CompetencyResolverService
  implements
  Resolve<Observable<IResolveResponse<NSCompetencyV2.ICompetencyDictionary>> | IResolveResponse<NSCompetencyV2.ICompetencyDictionary[]>
  > {
  constructor(
    private mySvc: CompService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot): Observable<IResolveResponse<NSCompetencyV2.ICompetencyDictionary[]>> {
    const typ = 'dictionary'
    const data: string = route.data ? route.data.load || typ : typ
    return this.mySvc.fetchByTyp(data).pipe(
      // tslint:disable-next-line: no-shadowed-variable
      map(data => ({ data, error: null })),
      catchError(error => of({ error, data: null })),
    )
  }
}
