import { Injectable } from '@angular/core'
import { ApiService } from '../../../../../../../public-api'

@Injectable({
  providedIn: 'root',
})
export class ContentInsightsRainService {

  endpoint = {
    rainAssests: '/assets/configurations/feature/rain-dashboard.json',
  }

  constructor(
    private apiService: ApiService,
  ) { }

  getRainDashboardJsonData() {
    return this.apiService.get<null>(
      `${this.endpoint.rainAssests}`
    )
  }
}
