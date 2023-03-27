import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { CompCardTableComponent } from './comp-card-table.component'

describe('CompCardTableComponent', () => {
  let component: CompCardTableComponent
  let fixture: ComponentFixture<CompCardTableComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CompCardTableComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CompCardTableComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
