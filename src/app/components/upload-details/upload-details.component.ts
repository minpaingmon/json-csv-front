import { Component, OnInit, Input } from '@angular/core';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { FileUpload } from 'src/app/models/file-upload.model';
import { HttpClient } from '@angular/common/http';
import {Observable} from "rxjs";

@Component({
  selector: 'app-upload-details',
  templateUrl: './upload-details.component.html',
  styleUrls: ['./upload-details.component.css']
})
export class UploadDetailsComponent implements OnInit {
  @Input() fileUpload!: FileUpload;

  constructor(
    private uploadService: FileUploadService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
  }

  deleteFileUpload(fileUpload: FileUpload): void {
    this.uploadService.deleteFile(fileUpload);
  }

  csvUpload(fileUpload: FileUpload): void {
    console.log("upload")
    this.uploadService.csvUpload(fileUpload);

  }
}
