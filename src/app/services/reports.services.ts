import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from './http.service';
import { ResponseContentType } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import { CompleteResponse } from '../models/complete-response';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class ReportsService {

 constructor(private http: HttpClient) {}

 complete(desde, hasta, bank): Observable<CompleteResponse[]> {
  return this.http.get(environment.baseURL + 'getLog?dateSince=' + desde + '&dateUntil=' + hasta + '&client=' + bank)
   .map(res => res.json())
   .catch(err => Promise.reject(err));
 }

 download(selected: Array<any>): Observable<ResponseContentType> {
   return this.http.post(environment.baseURL + 'getZip', selected)
    .catch(err => Promise.reject(err) );
 }

}
