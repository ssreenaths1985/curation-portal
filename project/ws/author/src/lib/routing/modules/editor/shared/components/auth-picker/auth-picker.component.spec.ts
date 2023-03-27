import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { AuthPickerComponent } from './auth-picker.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('AuthPickerComponent', () => {
  let component: AuthPickerComponent
  let fixture: ComponentFixture<AuthPickerComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [AuthPickerComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthPickerComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
