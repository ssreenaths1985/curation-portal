import { TestBed } from '@angular/core/testing'
import { SubapplicationRespondService } from './subapplication-respond.service'
import { HttpClientModule, HttpClient } from '@angular/common/http'
import { ConfigurationsService } from './configurations.service'
import { WidgetContentService } from '../../../../collection/src/public-api'
import { ActivatedRoute, Router } from '@angular/router'
import { EventService } from './event.service'
import { TelemetryService } from '../../public-api'
const fakeActivatedRoute = { snapshot: { data: {} } } as ActivatedRoute
const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl'])
describe('SubapplicationRespondService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientModule],
    providers: [
      { provide: Router, useValue: routerSpy },
      HttpClient,
      ConfigurationsService,
      WidgetContentService,
      { provide: ActivatedRoute, useValue: fakeActivatedRoute },
      EventService,
      TelemetryService],
  }))

  it('should be created', () => {
    const service: SubapplicationRespondService = TestBed.get(SubapplicationRespondService)
    expect(service).toBeTruthy()
  })
})
