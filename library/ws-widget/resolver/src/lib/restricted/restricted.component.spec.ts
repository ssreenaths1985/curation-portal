import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { RestrictedComponent } from './restricted.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('RestrictedComponent', () => {
  let component: RestrictedComponent
  let fixture: ComponentFixture<RestrictedComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RestrictedComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(RestrictedComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
