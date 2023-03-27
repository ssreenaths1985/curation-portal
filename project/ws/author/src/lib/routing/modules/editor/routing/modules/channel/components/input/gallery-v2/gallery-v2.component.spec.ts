import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { GalleryV2Component } from './gallery-v2.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('GalleryV2Component', () => {
  let component: GalleryV2Component
  let fixture: ComponentFixture<GalleryV2Component>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [GalleryV2Component],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GalleryV2Component)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
