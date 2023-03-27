import { TestBed } from '@angular/core/testing'

import { UserPreferenceService } from './user-preference.service'
import { ConfigurationsService } from './configurations.service'
import { HttpClientModule, HttpClient } from '@angular/common/http'

describe('UserPreferenceService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientModule],
    providers: [HttpClient, ConfigurationsService],
  }))

  it('should be created', () => {
    const service: UserPreferenceService = TestBed.get(UserPreferenceService)
    expect(service).toBeTruthy()
  })
})
