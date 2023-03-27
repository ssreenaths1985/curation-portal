import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { RainDashboardHomeComponent } from './rain-dashboard-home.component'

describe('RainDashboardHomeComponent', () => {
  let component: RainDashboardHomeComponent
  let fixture: ComponentFixture<RainDashboardHomeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RainDashboardHomeComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(RainDashboardHomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
