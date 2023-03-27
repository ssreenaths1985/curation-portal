import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { UploadAudioComponent } from './upload-audio.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('UploadAudioComponent', () => {
  let component: UploadAudioComponent
  let fixture: ComponentFixture<UploadAudioComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [UploadAudioComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadAudioComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
