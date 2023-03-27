import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { CurationProgressCardComponent } from './curation-progress-card.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('CurationProgressCardComponent', () => {
  let component: CurationProgressCardComponent
  let fixture: ComponentFixture<CurationProgressCardComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [CurationProgressCardComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CurationProgressCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
