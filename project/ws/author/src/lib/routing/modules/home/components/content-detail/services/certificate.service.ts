import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { ApiService } from '../../../../../../modules/shared/services/api.service'
import { ICertificate } from '../interface/certificate-template'
const AUTH_API_SLUG = '/apis/authApi/'
const PROTECTED_SLAG_V8 = '/apis/protected/v8'
const API_END_POINTS = {
  C_CREATE: `${AUTH_API_SLUG}/batch/create`,
  C_LIST: (id: any) => `${AUTH_API_SLUG}/readbatch/${id}`,
  // ISSUE_CERTIFICATE: '/api/course/batch/cert/v1/issue?reIssue=true',
  ISSUE_CERTIFICATE: '/apis/protected/v8/cohorts/course/batch/cert/issue',
  GET_CERTIFICATE: (contentId: string) => `/apis/proxies/v8/action/content/v3/read/${contentId}`,
  CERT_DOWNLOAD: (certId: any) => `${PROTECTED_SLAG_V8}/cohorts/course/batch/cert/download/${certId}`,
}
@Injectable({
  providedIn: 'root',
})
export class ContentCertificateService {
  constructor(
    private api: ApiService,
    // private configSvc: ConfigurationsService
  ) { }
  createCertificate(data: any): Observable<any> {
    return this.api.post<any>(API_END_POINTS.C_CREATE, data)
  }
  getAllBatchCertificates(batchId: string | number): Observable<{ result: { response: ICertificate } }> {
    return this.api.get(API_END_POINTS.C_LIST(batchId))
  }
  issueCertificate(data: any): Observable<any> {
    return this.api.post(API_END_POINTS.ISSUE_CERTIFICATE, data)
  }
  getCertificate(url: string) {
    return this.api.get(url, { responseType: 'text' })
  }
  downloadCert(certId: any) {
    return this.api.get<any>(`${API_END_POINTS.CERT_DOWNLOAD(certId)}`)
  }
}
