import { SortableDirective } from './sortable.directive'
import { ElementRef } from '@angular/core'
import { TestBed, async } from '@angular/core/testing'
export class MockElementRef extends ElementRef { }

describe('SortableDirective', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ElementRef, useClass: MockElementRef },
      ],
    }).compileComponents()
  }))

  it('should create an instance', () => {
    const directive = TestBed.get(SortableDirective)
    expect(directive).toBeTruthy()
  })
})
