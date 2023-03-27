import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { WebModuleEditorComponent } from './web-module-editor.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('WebModuleEditorComponent', () => {
  let component: WebModuleEditorComponent
  let fixture: ComponentFixture<WebModuleEditorComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [WebModuleEditorComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WebModuleEditorComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
