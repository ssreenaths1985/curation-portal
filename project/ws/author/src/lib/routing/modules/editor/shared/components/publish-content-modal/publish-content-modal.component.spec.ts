import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { PublishContentModalComponent } from './publish-content-modal.component'

describe('PublishContentModal', () => {
  let component: PublishContentModalComponent
  let fixture: ComponentFixture<PublishContentModalComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PublishContentModalComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PublishContentModalComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
