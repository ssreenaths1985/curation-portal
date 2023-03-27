import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { PublicReleaseComponent } from './public-release.component'

describe('PublicReleaseComponent', () => {
  let component: PublicReleaseComponent
  let fixture: ComponentFixture<PublicReleaseComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PublicReleaseComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicReleaseComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
