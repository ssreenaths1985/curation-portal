import { SortableListDirective } from './sortable-list.directive'
import { TestBed } from '@angular/core/testing'
import { ScrollHelperService } from './scroll-helper.service'
import { ElementRef, ChangeDetectorRef } from '@angular/core'

describe('SortableListDirective', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [ChangeDetectorRef, ElementRef, ScrollHelperService],
  }))
  it('should create an instance', () => {
    // const directive = new SortableListDirective()
    const directive = TestBed.get(SortableListDirective)
    expect(directive).toBeTruthy()
  })
})
