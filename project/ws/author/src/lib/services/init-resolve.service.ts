import { ZipJSResolverService } from './zip-js-resolve.service'
import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router'
import { ConfigurationsService } from '@ws-widget/utils'
import { ICreateEntity } from '@ws/author/src/lib/interface/create-entity'
import { forkJoin, Observable, of } from 'rxjs'
import { catchError, tap } from 'rxjs/operators'
import { ICollectionEditorConfig } from '../interface/collection-editor'
import { NSContent } from '../interface/content'
import { IFormMeta } from '../interface/form'
import { ApiService } from '../modules/shared/services/api.service'
import { AVAILABLE_LOCALES } from './../constants/constant'
import { AccessControlService } from './../modules/shared/services/access-control.service'
import { CKEditorResolverService } from './ckeditor-resolve.service'
import { AuthInitService } from './init.service'
// import { GET_DEPARTMENT_LIST } from '../constants/apiEndpoints'
// import { NSIQuality } from '../interface/content-quality'

@Injectable()
export class InitResolver implements Resolve<NSContent.IContentMeta> {
  constructor(
    private apiService: ApiService,
    private router: Router,
    private ckEditorInject: CKEditorResolverService,
    private configurationsService: ConfigurationsService,
    private accessService: AccessControlService,
    private authInitService: AuthInitService,
    private zipJSInject: ZipJSResolverService,
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const forkProcess: Observable<any>[] = [of(undefined)]
    const pushedJobs: string[] = ['']
    const data: string[] = route.data ? route.data.load || [] : []
    if (!this.authInitService.workFlowTable) {
      forkProcess.push(
        this.apiService.get<IFormMeta>(
          `${this.configurationsService.baseUrl}/feature/auth-config.json`,
        ),
      )
      pushedJobs.push('config')
    }
    if (data.includes('meta') && !this.authInitService.authConfig) {
      forkProcess.push(
        this.apiService.get<IFormMeta>(
          `${this.configurationsService.baseUrl}/feature/auth-meta-form.json`,
        ),
      )
      pushedJobs.push('meta')
    }
    if (data.includes('ordinals') && !this.authInitService.ordinals) {
      forkProcess.push(
        /* temp Fix*/
        this.apiService.get<ICreateEntity[]>(
          `${this.configurationsService.baseUrl}/feature/ordinals.json`,
        ),
        // this.apiService.get<IFormMeta>
        // (`http://localhost:3003/authApi/action/meta/v2/
        // ordinals/list${this.accessService.orgRootOrgAsQuery}`),
      )
      pushedJobs.push('ordinals')
    }
    // if (data.includes('providerList') && !this.authInitService.providerList) {
    //   forkProcess.push(
    //     this.apiService.get<any>(
    //       `${GET_DEPARTMENT_LIST}`,
    //     ),
    //   )
    //   pushedJobs.push('providerList')
    // }
    if (data.includes('create') && !this.authInitService.creationEntity.size) {
      forkProcess.push(
        this.apiService.get<ICreateEntity[]>(
          `${this.configurationsService.baseUrl}/feature/auth-create.json`,
        ),
      )
      pushedJobs.push('create')
    }
    if (data.includes('collection') && !this.authInitService.collectionConfig) {
      forkProcess.push(
        this.apiService.get<ICollectionEditorConfig>(
          `${this.configurationsService.baseUrl}/feature/auth-collection-editor.json`,
        ),
      )
      pushedJobs.push('collection')
    }
    if (!this.authInitService.assessmentQuestion) {
      forkProcess.push(
        this.apiService.get<IFormMeta>(
          `${this.configurationsService.baseUrl}/feature/assessment-questions.json`,
        ),
      )
      pushedJobs.push('assessmentQuestion')
    }
    // if (data.includes('content-quality') && !this.authInitService.collectionConfig) {
    //   forkProcess.push(
    //     this.apiService.get<NSIQuality.IContentQualityConfig>(
    //       `${this.configurationsService.baseUrl}/feature/auth-content-quality.json`,
    //     ),
    //   )
    //   pushedJobs.push('content-quality')
    // }
    if (data.includes('ckeditor')) {
      forkProcess.push(this.ckEditorInject.inject())
      forkProcess.push(this.zipJSInject.inject())
    }

    return forkJoin(forkProcess).pipe(
      tap(v => {
        if (pushedJobs.includes('config')) {
          this.authInitService.authAdditionalConfig = v[pushedJobs.indexOf('config')]
          this.authInitService.optimizedWorkFlow = v[pushedJobs.indexOf('config')].optimizedWorkFlow
          this.authInitService.workFlowTable = v[pushedJobs.indexOf('config')].workFlowTable
          this.authInitService.ownerDetails = v[pushedJobs.indexOf('config')].ownerDetails
          this.authInitService.permissionDetails = v[pushedJobs.indexOf('config')].permissionDetails
        }
        if (pushedJobs.includes('meta')) {
          this.authInitService.authConfig = v[pushedJobs.indexOf('meta')]
        }
        if (pushedJobs.includes('ordinals')) {
          if (!v[pushedJobs.indexOf('ordinals')].locale) {
            // tslint:disable-next-line: ter-computed-property-spacing
            v[pushedJobs.indexOf('ordinals')].subTitles = v[
              pushedJobs.indexOf('ordinals')
              // tslint:disable-next-line: ter-computed-property-spacing
            ].subTitles.filter((val: any) => AVAILABLE_LOCALES.indexOf(val.srclang) > -1)
          } else {
            v[pushedJobs.indexOf('ordinals')].subTitles = v[pushedJobs.indexOf('ordinals')].locale
          }
          this.authInitService.ordinals = v[pushedJobs.indexOf('ordinals')]
        }

        if (pushedJobs.includes('assessmentQuestion')) {
          this.authInitService.assessmentQuestion = v[pushedJobs.indexOf('assessmentQuestion')]
        }

        if (pushedJobs.includes('create')) {
          v[pushedJobs.indexOf('create')].forEach((ele: ICreateEntity) => {
            ele.enabled = ele.enabled ? this.accessService.hasRole(ele.hasRole) : false
            this.authInitService.creationEntity.set(ele.id, ele)
          })
        }
        if (pushedJobs.includes('collection')) {
          this.authInitService.collectionConfig = v[pushedJobs.indexOf('collection')]
        }
        if (pushedJobs.includes('providerList')) {
          this.authInitService.providerList = v[pushedJobs.indexOf('providerList')]
        }
        // if (pushedJobs.includes('content-quality')) {
        //   this.authInitService.contentQuality = v[pushedJobs.indexOf('content-quality')]
        // }
      }),
      catchError((v: any) => {
        this.router.navigateByUrl('/error-somethings-wrong')
        return of(v)
      }),
    )
  }
}
