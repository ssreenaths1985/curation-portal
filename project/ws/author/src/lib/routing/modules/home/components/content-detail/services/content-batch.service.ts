import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, of } from 'rxjs'
import { ConfigurationsService } from '@ws-widget/utils'
const AUTH_API_SLUG = '/apis/authApi/'
const API_END_POINTS = {
  CONTENT__BATCH_CREATE: `${AUTH_API_SLUG}/batch/create`,
  CONTENT_BATCH_TEMPLATE_CREATE: `${AUTH_API_SLUG}batch/addCert`,
  CONTENT_LEARNERS_DETAILS: `${AUTH_API_SLUG}batch/getUserProgress`,
}
@Injectable({
  providedIn: 'root',
})
export class ContentBatchService {
  certificateConfig: any = null
  constructor(
    private http: HttpClient,
    private configSvc: ConfigurationsService
  ) { }
  createABatch(data: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.CONTENT__BATCH_CREATE, data)
  }
  createABatchCertificate(data: any): Observable<any> {
    return this.http.patch<any>(API_END_POINTS.CONTENT_BATCH_TEMPLATE_CREATE, data)
  }
  fetchBatchLearners(data: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.CONTENT_LEARNERS_DETAILS, data)
  }

  async getCertificateConfig(): Promise<any> {
    this.certificateConfig = {}
    const baseUrl = this.configSvc.sitePath
    this.certificateConfig = await this.http.get<any>(`${baseUrl}/feature/certificate.json`).toPromise()
    // return this.certificateConfig
    return of(this.certificateConfig).toPromise()
  }
}
