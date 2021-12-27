import { Injectable } from '@angular/core';
// import { Angular, AngularFireList } from '@angular/fire';
// import { AngularFireStorage } from '@angular/fire/storage';

import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { FileUpload } from '../models/file-upload.model';
import {AngularFireStorage} from "@angular/fire/compat/storage";
import {AngularFireDatabase, AngularFireList} from "@angular/fire/compat/database";
import firebase from "firebase/compat";
import app = firebase.app;
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private basePath = '/uploads';
  baseURL: string = "http://localhost:8080/api/integration";

  constructor(private db: AngularFireDatabase,private storage: AngularFireStorage,
              private http: HttpClient
  ) { }


  csvUpload(fileUpload: FileUpload): void {
    const headers = { 'content-type': 'application/json'}
    const body=JSON.stringify(fileUpload.file);
    console.log(fileUpload.url)
    this.http.post(this.baseURL, body,{'headers':headers})
  }

  pushFileToStorage(fileUpload: FileUpload): Observable<number | undefined> {
    const filePath = `${this.basePath}/${fileUpload.file.name}`;
    const storageRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, fileUpload.file);

    uploadTask.snapshotChanges().pipe(
      finalize(() => {
        storageRef.getDownloadURL().subscribe(downloadURL => {
          fileUpload.url = downloadURL;
          fileUpload.name = fileUpload.file.name;
          this.saveFileData(fileUpload);
        });
      })
    ).subscribe();

    return uploadTask.percentageChanges();
  }

  private saveFileData(fileUpload: FileUpload): void {
    this.db.list(this.basePath).push(fileUpload);
  }

  getFiles(numberItems: number): AngularFireList<FileUpload> {
    return this.db.list(this.basePath, ref =>
      ref.limitToLast(numberItems));
  }

  deleteFile(fileUpload: FileUpload): void {
    this.deleteFileDatabase(fileUpload.key)
      .then(() => {
        this.deleteFileStorage(fileUpload.name);
      })
      .catch(error => console.log(error));
  }

  private deleteFileDatabase(key: string): Promise<void> {
    return this.db.list(this.basePath).remove(key);
  }

  private deleteFileStorage(name: string): void {
    const storageRef = this.storage.ref(this.basePath);
    storageRef.child(name).delete();
  }
}
