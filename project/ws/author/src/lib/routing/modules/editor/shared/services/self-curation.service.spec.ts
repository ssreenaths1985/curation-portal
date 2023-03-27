import { TestBed, getTestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { SelfCurationService, API_END_POINTS } from './self-curation.service'

describe('SelfCurationService', () => {
  let injector: TestBed
  let service: SelfCurationService
  let httpMock: HttpTestingController
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [SelfCurationService],
  }))
  injector = getTestBed()
  service = injector.get(SelfCurationService)
  httpMock = injector.get(HttpTestingController)

  afterEach(() => {
    httpMock.verify()
  })
  // it('should be created', () => {
  //   const service: SelfCurationService = TestBed.get(SelfCurationService)
  //   expect(service).toBeTruthy()
  // })
  // https://github.com/cironunes/httpclient-testing/blob/master/src/app/shared/github-api.service.spec.ts
  describe('#search', () => {
    // const dummyParams = new HttpParams().set('q', 'cironunes')

    it('should throw an error if trying to search for not supported `what`', () => {
      service.fetchresult('unknown')
        .subscribe(() => { }, (err: any) => {
          expect(err).toBe(`Searching for unknown is not supported. The available types are: ${service}.`)
        })

      // const req = httpMock.expectNone(`${API_END_POINTS.GET_PROFANITY}/${'null'}`)
    })

    it('should return an Observable<SearchResults>', () => {
      const contentId = 'do_113410649876586496153'
      service.fetchresult(contentId)
        .subscribe(result => {
          expect(result.length).toBe(1)
        })

      const req = httpMock.expectOne(`${API_END_POINTS.GET_PROFANITY}/${contentId}`)
      expect(req.request.url).toBe(`${API_END_POINTS.GET_PROFANITY}/${contentId}`)
      // expect(req.request.params).toEqual({ 'foo': ['bar', 'baz'] })

      req.flush({
        incomplete_results: false,
        items: [{}, {}],
        total_count: 1,
      })
    })
  })
})
