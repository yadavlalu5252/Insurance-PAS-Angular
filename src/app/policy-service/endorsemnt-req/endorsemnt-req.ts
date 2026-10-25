import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EndorsementsService } from '../endorsements-service';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-endorsemnt-req',
  styleUrl: './endorsemnt-req.scss',
  templateUrl: './endorsemnt-req.html',
})
export class EndorsemntReq {
  constructor(private service: EndorsementsService) {
    this.showenedorsements();

  }




  endorsements: any;
  showenedorsements() {
    this.service.getendorsements().subscribe({
      next: (res: any) => {
        this.endorsements = res;
      },
      error: (err: any) => {
        console.log(err);
      }


    })
  }

  selectedendorsement: any

  openModal(endorsement: any) {
    this.selectedendorsement = endorsement
  }

  closeModal() {
    this.selectedendorsement = null
  }

  approveend: any

  approve(id: Number) {
    this.service.approveendorsements(id).subscribe({
      next: (res: any) => {
        this.approveend = res;
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

  rejectend: any

  reject(id: Number) {
    this.service.rejectendorsements(id).subscribe({
      next: res => {
        this.rejectend = res;
      },
      error: err => {
        console.log(err);
      }
    })
  }

}
