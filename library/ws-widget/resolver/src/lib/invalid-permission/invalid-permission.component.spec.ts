import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { InvalidPermissionComponent } from './invalid-permission.component'

describe('InvalidPermissionComponent', () => {
  let component: InvalidPermissionComponent
  let fixture: ComponentFixture<InvalidPermissionComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InvalidPermissionComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(InvalidPermissionComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
