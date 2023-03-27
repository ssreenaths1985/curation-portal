import { Injectable } from '@angular/core'
import { ApiService } from '@ws/author/src/lib/modules/shared/services/api.service'

@Injectable()
export class RainDashboardService {

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
