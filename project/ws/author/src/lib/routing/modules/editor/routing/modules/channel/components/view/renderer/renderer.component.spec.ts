import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { RendererComponent } from './renderer.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('RendererComponent', () => {
  let component: RendererComponent
  let fixture: ComponentFixture<RendererComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [RendererComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(RendererComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
