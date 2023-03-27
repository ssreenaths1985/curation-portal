import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { AuthEditorActionButtonsComponent } from './auth-editor-action-buttons.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('AuthEditorActionButtonsComponent', () => {
  let component: AuthEditorActionButtonsComponent
  let fixture: ComponentFixture<AuthEditorActionButtonsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [AuthEditorActionButtonsComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthEditorActionButtonsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
