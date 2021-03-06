import { Component, OnInit } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IProduitService } from '../produit-service.model';

import { ASC, DESC, ITEMS_PER_PAGE } from 'app/config/pagination.constants';
import { ProduitServiceService } from '../service/produit-service.service';
import { ProduitServiceDeleteDialogComponent } from '../delete/produit-service-delete-dialog.component';
import { ParseLinks } from 'app/core/util/parse-links.service';

@Component({
  selector: 'jhi-produit-service',
  templateUrl: './produit-service.component.html',
})
export class ProduitServiceComponent implements OnInit {
  produitServices: IProduitService[];
  isLoading = false;
  itemsPerPage: number;
  links: { [key: string]: number };
  page: number;
  predicate: string;
  ascending: boolean; 

  constructor(protected produitServiceService: ProduitServiceService, protected modalService: NgbModal, protected parseLinks: ParseLinks) {
    this.produitServices = [];
    this.itemsPerPage = ITEMS_PER_PAGE;
    this.page = 0;
    this.links = {
      last: 0,
    };
    this.predicate = 'id';
    this.ascending = true;
  }

  loadAll(): void {
    this.isLoading = true;

    this.produitServiceService
      .query({
        page: this.page,
        size: this.itemsPerPage,
        sort: this.sort(),
      })
      .subscribe(
        (res: HttpResponse<IProduitService[]>) => {
          this.isLoading = false;
          this.paginateProduitServices(res.body, res.headers);
        },
        () => {
          this.isLoading = false;
        }
      );
  }
  
  reset(): void {
    this.page = 0;
    this.produitServices = [];
    this.loadAll();
  }

  loadPage(page: number): void {
    this.page = page;
    this.loadAll();
  }

  ngOnInit(): void {
    this.loadAll();
  }

  trackId(index: number, item: IProduitService): number {
    return item.CODE_PRODUIT_SERVICE!;
  }

  delete(produitService: IProduitService): void {
    const modalRef = this.modalService.open(ProduitServiceDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.produitService = produitService;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed.subscribe(reason => {
      if (reason === 'deleted') {
        this.reset();
      }
    });
  }

  protected sort(): string[] {
    const result = [this.predicate + ',' + (this.ascending ? ASC : DESC)];
    if (this.predicate !== 'id') {
      result.push('id');
    }
    return result;
  }

  protected paginateProduitServices(data: IProduitService[] | null, headers: HttpHeaders): void {
    this.links = this.parseLinks.parse(headers.get('link') ?? '');
    if (data) {
      for (const d of data) {
        this.produitServices.push(d);
      }
    }
  }
}
