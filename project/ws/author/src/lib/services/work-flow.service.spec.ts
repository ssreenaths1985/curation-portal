import { TestBed } from '@angular/core/testing'

import { WorkFlowService } from './work-flow.service'
import { AccessControlService } from '../modules/shared/services/access-control.service'
import { ConditionCheckService } from '../modules/shared/services/condition-check.service'
import { AuthInitService } from './init.service'

describe('WorkFlowService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [AuthInitService, ConditionCheckService, AccessControlService],
  }))

  it('should be created', () => {
    const service: WorkFlowService = TestBed.get(WorkFlowService)
    expect(service).toBeTruthy()
  })
})
