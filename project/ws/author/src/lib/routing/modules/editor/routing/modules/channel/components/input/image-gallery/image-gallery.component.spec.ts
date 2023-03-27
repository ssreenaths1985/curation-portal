import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ImageGalleryComponent } from './image-gallery.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('ImageGalleryComponent', () => {
  let component: ImageGalleryComponent
  let fixture: ComponentFixture<ImageGalleryComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ImageGalleryComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageGalleryComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
