import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { UrlUploadComponent } from './url-upload.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('UrlUploadComponent', () => {
  let component: UrlUploadComponent
  let fixture: ComponentFixture<UrlUploadComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [UrlUploadComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(UrlUploadComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
