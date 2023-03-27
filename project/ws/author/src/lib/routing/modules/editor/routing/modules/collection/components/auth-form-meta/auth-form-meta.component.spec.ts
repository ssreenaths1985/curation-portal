import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { AuthFormMetaComponent } from './auth-form-meta.component'

describe('AuthFormMetaComponent', () => {
  let component: AuthFormMetaComponent
  let fixture: ComponentFixture<AuthFormMetaComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AuthFormMetaComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthFormMetaComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
