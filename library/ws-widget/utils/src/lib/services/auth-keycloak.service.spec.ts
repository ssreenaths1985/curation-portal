import { TestBed } from '@angular/core/testing'

import { AuthKeycloakService } from './auth-keycloak.service'
import { KeycloakService } from 'keycloak-angular'
import { HttpClient, HttpHandler } from '@angular/common/http'

describe('AuthKeycloakService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [KeycloakService, HttpClient, HttpHandler],
  }))

  it('should be created', () => {
    const service: AuthKeycloakService = TestBed.get(AuthKeycloakService)
    expect(service).toBeTruthy()
  })
})
