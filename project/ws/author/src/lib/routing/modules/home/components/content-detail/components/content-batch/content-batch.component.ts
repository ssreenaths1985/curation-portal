import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { IBatch } from '../../interface/content-batch.model'
import { LocalDataService } from '../../services/local-data.service'
@Component({
  selector: 'ws-auth-content-batch',
  templateUrl: './content-batch.component.html',
  styleUrls: ['./content-batch.component.scss'],
})
export class ContentBatcheComponent implements OnInit, OnDestroy {
  @Input() batch!: IBatch
  constructor(private router: Router, private localDataService: LocalDataService) {

  }
  ngOnInit(): void {
  }
  ngOnDestroy(): void {
  }
  open() {
    if (this.batch.batchId && this.batch.identifier) {
      this.localDataService.initBatch(this.batch)
      this.router.navigate(
        [
          'author',
          'content-detail',
          this.batch.identifier,
          'batches',
          btoa(JSON.stringify(this.batch)),
        ],
      )
    }
  }
}
