import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { NetworkStripMultipleComponent } from './network-strip-multiple.component'

describe('NetworkStripMultipleComponent', () => {
  let component: NetworkStripMultipleComponent
  let fixture: ComponentFixture<NetworkStripMultipleComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NetworkStripMultipleComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkStripMultipleComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
