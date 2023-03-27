import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ClassDiagramComponent } from './class-diagram.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('ClassDiagramComponent', () => {
  let component: ClassDiagramComponent
  let fixture: ComponentFixture<ClassDiagramComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClassDiagramComponent],
      imports: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassDiagramComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
