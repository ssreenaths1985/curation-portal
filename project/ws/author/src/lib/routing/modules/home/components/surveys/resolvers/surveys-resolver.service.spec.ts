import { TestBed } from '@angular/core/testing'

import { SurveysResolverService } from './surveys-resolver.service'

describe('SurveysResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: SurveysResolverService = TestBed.get(SurveysResolverService)
    expect(service).toBeTruthy()
  })
})
