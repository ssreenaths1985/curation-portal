import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { MyContentComponent } from './my-content.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('MyContentComponent', () => {
  let component: MyContentComponent
  let fixture: ComponentFixture<MyContentComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [MyContentComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MyContentComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
