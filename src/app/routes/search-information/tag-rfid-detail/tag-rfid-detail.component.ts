import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-tag-rfid-detail',
  templateUrl: './tag-rfid-detail.component.html',
  styleUrls: ['./tag-rfid-detail.component.css']
})
export class TagRfidDetailComponent implements OnInit {
  formSearch: FormGroup;
  constructor() { }

  ngOnInit() {
  }

}
