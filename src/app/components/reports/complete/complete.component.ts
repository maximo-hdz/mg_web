import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { ReportsService } from '../../../services/reports.services';
import { CompleteResponse } from '../../../models/complete-response';
import { Complete } from '../../../models/complete';
import { environment } from '../../../../environments/environment';

import { Utils } from '../../../utils/utils';
import { SelectItem } from 'primeng/primeng';

@Component({
  selector: 'app-complete',
  templateUrl: './complete.component.html',
  styleUrls: ['./complete.component.sass']
})
export class CompleteComponent implements OnInit {

  completeRequest: Complete;
  completeResponse: Array<any>;

  banks: SelectItem[];
  bankselected: Number;
  bankselectedLabel: String;
  bankinlocalstorage: String;

  desde: Date;
  hasta: Date;
  es: any;

  selected: boolean;

  message: String;
  showError: Boolean = false;
  showLoading: Boolean = false;

  constructor(
    private reportsService: ReportsService,
    private sanitizer: DomSanitizer,
    private utils: Utils
  ) {
    this.completeRequest = new Complete(0, '', '');
    this.selected = false;
  }

  ngOnInit() {
    this.es = this.utils.es;
    this.banks = this.utils.banks;
    this.bankinlocalstorage = localStorage.getItem('X-BANK-ID-MG');
    if (this.bankinlocalstorage !== 'admin') {
      for (let i = 0; i < this.banks.length; i++) {
        if (this.banks[i].value === Number(this.bankinlocalstorage)) {
          this.bankselected = this.banks[i].value;
          this.bankselectedLabel = this.utils.banks[i].label;
          break;
        }
      }
    }
  }

  search() {
    if (typeof this.bankselected === 'undefined' || this.bankselected === 0 ) {
      this.message = 'Selecciona un banco primero';
      this.showError = true;
    } else if (typeof this.desde === 'undefined' || typeof this.hasta === 'undefined' ) {
      this.message = 'Selecciona un rango de fechas';
      this.showError = true;
    } else if (this.desde > this.hasta) {
      this.message = 'La fecha final no debe ser anterior a la inicial';
      this.showError = true;
    } else {
      if (this.bankinlocalstorage === 'admin') {
        for (let i = 0; i < this.banks.length; i++) {
          if (this.banks[i].value === this.bankselected) {
            this.bankselectedLabel = this.utils.banks[i].label;
            break;
          }
        }
      }
      this.showLoading = true;
      this.reportsService.complete(this.utils.getDate(this.desde), this.utils.getDate(this.hasta), this.bankselectedLabel)
        .subscribe(
          res => {
            for (let i = 0; i < res.length; i++){
              this.completeResponse.push({name: res[i], url: this.sanitizer.bypassSecurityTrustResourceUrl(environment.baseURL + res[i])});
            }
            this.showLoading = false;
          },
          err => {
            this.showLoading = false;
            this.message = 'Hubo un error';
            this.showError = true;
          }
        );
    }
  }

  download() {
    let selected: Array<any> = new Array<any>();
    let checkboxes = document.getElementsByName('report');
    for (let i = 0 ; i < checkboxes.length ; i++) {
      let tmp = <HTMLInputElement>checkboxes[i];
      if (tmp.checked) {
        selected.push(tmp.value);
      }
    }
    if (typeof selected === 'undefined' ) {
      this.message = 'Selecciona los reportes a descargar primero';
      this.showError = true;
    } else {
      this.showLoading = true;
      this.reportsService.download(selected)
        .subscribe(
          (data) => {
            console.log('Descargando... según');

/*
// TODO revisar que funcione
let filename = headers['x-filename'];
let contentType = headers['content-type'];

let linkElement = document.createElement('a');
try {
    let blob = new Blob([data], { type: contentType });
    let url = window.URL.createObjectURL(blob);

    linkElement.setAttribute('href', url);
    linkElement.setAttribute('download', filename);

    let clickEvent = new MouseEvent('click', {
        'view': window,
        'bubbles': true,
        'cancelable': false
    });
    linkElement.dispatchEvent(clickEvent);
} catch (ex) {
    console.log(ex);
}
*/
            this.showLoading = false;
          },
          err => {
            this.showLoading = false;
            this.message = 'Hubo un error';
            this.showError = true;
          }
        );
    }
  }

  selectAll(source) {
    let checkboxes = document.getElementsByName('report');
    for (let i = 0 ; i < checkboxes.length ; i++) {
      let tmp = <HTMLInputElement>checkboxes[i];
      tmp.checked = this.selected;
    }
  }

}