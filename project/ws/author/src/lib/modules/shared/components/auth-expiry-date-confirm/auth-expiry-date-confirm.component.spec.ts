import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { AuthExpiryDateConfirmComponent } from './auth-expiry-date-confirm.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('AuthExpiryDateConfirmComponent', () => {
  let component: AuthExpiryDateConfirmComponent
  let fixture: ComponentFixture<AuthExpiryDateConfirmComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [AuthExpiryDateConfirmComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthExpiryDateConfirmComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
