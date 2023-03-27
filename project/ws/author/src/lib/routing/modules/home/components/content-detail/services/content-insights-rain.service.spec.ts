import { TestBed } from '@angular/core/testing'

import { ContentInsightsRainService } from './content-insights-rain.service'

describe('ContentInsightsRainService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: ContentInsightsRainService = TestBed.get(ContentInsightsRainService)
    expect(service).toBeTruthy()
  })
})
