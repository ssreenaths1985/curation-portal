import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { CreateComponent } from './create.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('CreateComponent', () => {
  let component: CreateComponent
  let fixture: ComponentFixture<CreateComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [CreateComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
