import { TestBed } from '@angular/core/testing'

import { AuthMicrosoftService } from './auth-microsoft.service'
import { HttpClientModule, HttpClient } from '@angular/common/http'

describe('AuthMicrosoftService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientModule],
    providers: [HttpClient],
  }))

  it('should be created', () => {
    const service: AuthMicrosoftService = TestBed.get(AuthMicrosoftService)
    expect(service).toBeTruthy()
  })
})
