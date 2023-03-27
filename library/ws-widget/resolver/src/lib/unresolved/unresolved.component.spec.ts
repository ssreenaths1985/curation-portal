import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { UnresolvedComponent } from './unresolved.component'

describe('UnresolvedComponent', () => {
  let component: UnresolvedComponent
  let fixture: ComponentFixture<UnresolvedComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UnresolvedComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(UnresolvedComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
