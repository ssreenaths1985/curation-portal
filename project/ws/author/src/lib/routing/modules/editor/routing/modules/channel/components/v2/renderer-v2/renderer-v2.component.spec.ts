import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { RendererV2Component } from './renderer-v2.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('RendererV2Component', () => {
  let component: RendererV2Component
  let fixture: ComponentFixture<RendererV2Component>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [RendererV2Component],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(RendererV2Component)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
