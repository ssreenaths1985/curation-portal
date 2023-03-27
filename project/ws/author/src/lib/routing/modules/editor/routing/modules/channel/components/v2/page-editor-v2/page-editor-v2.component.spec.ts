import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { PageEditorV2Component } from './page-editor-v2.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('PageEditorV2Component', () => {
  let component: PageEditorV2Component
  let fixture: ComponentFixture<PageEditorV2Component>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [PageEditorV2Component],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PageEditorV2Component)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
