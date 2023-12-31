import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { tap } from 'rxjs/operators';
import { API_URL } from 'src/app/constants/api-url.constants';
import { CompetencyAspectItemROCount, CompetencyAspectProjections } from '../dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private compProjectionsData: CompetencyAspectProjections[] = [];

  getCompetencyAspectProjections() {
    return this.http.get<CompetencyAspectProjections[]>(API_URL.competencyAspectProjections).pipe(
      tap(resp => {
        this.compProjectionsData = resp;
      })
    );
  }

  getCompetencyAspectItemROCount() {
    return this.http.get<CompetencyAspectItemROCount>(API_URL.competencyAspectItemROCount);
  }

  get compProjections() {
    return this.compProjectionsData;
  }
}
