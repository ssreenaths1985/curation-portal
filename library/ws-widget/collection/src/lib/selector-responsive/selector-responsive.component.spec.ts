import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { SelectorResponsiveComponent } from './selector-responsive.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('SelectorResponsiveComponent', () => {
  let component: SelectorResponsiveComponent
  let fixture: ComponentFixture<SelectorResponsiveComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [SelectorResponsiveComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectorResponsiveComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
