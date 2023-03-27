import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { AuthSelectTypeComponent } from './auth-select-type.component'

describe('AuthSelectTypeComponent', () => {
  let component: AuthSelectTypeComponent
  let fixture: ComponentFixture<AuthSelectTypeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AuthSelectTypeComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthSelectTypeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
