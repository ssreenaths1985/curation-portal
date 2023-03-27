import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AuthEditorStepsComponent } from './auth-editor-steps.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('AuthEditorStepsComponent', () => {
  let component: AuthEditorStepsComponent
  let fixture: ComponentFixture<AuthEditorStepsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [AuthEditorStepsComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthEditorStepsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
