import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { SelectorResponsiveV2Component } from './selector-responsive-v2.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('SelectorResponsiveV2Component', () => {
  let component: SelectorResponsiveV2Component
  let fixture: ComponentFixture<SelectorResponsiveV2Component>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [SelectorResponsiveV2Component],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectorResponsiveV2Component)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
