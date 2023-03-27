import { TestBed } from '@angular/core/testing'

import { ContentStripVerticalComponent } from './content-strip-vertical.component'

describe('ContentStripVerticalComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: ContentStripVerticalComponent = TestBed.get(ContentStripVerticalComponent)
    expect(service).toBeTruthy()
  })
})
