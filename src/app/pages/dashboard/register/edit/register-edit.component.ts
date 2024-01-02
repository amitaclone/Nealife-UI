import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  inject,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropdownModule } from 'primeng/dropdown';
import { forkJoin, map } from 'rxjs';
import { SpinnerComponent } from 'src/app/components/spinner/spinner.component';
import { DropdownOption } from 'src/app/models/common.model';
import { SharedApiService } from 'src/app/services/shared-api.service';
import { Company } from '../../dashboard.model';
import { RegisterService } from '../register.service';

@Component({
  selector: 'nl-register-edit',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SpinnerComponent,
    DropdownModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  templateUrl: './register-edit.component.html',
  styleUrls: ['./register-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterEditComponent {
  @Input()
  set id(id: string) {
    this.spinner.show('register-edit');
    this.registerService.getCompanies(id).subscribe({
      next: resp => {
        if (resp && resp.length) {
          this.company = resp[0];
          this.editForm = this.getEditForm(this.company);
          this.cdRef.markForCheck();
        }
      },
      complete: () => this.spinner.hide('register-edit'),
    });
  }

  parentCompanies: DropdownOption[] = [];
  statusList: DropdownOption[] = [];
  company!: Company;
  editForm!: FormGroup;
  accountTypes: DropdownOption[] = [];
  partnerTypes: DropdownOption[] = [];

  private registerService = inject(RegisterService);
  private sharedApiService = inject(SharedApiService);
  private spinner = inject(NgxSpinnerService);
  private fb = inject(FormBuilder);
  private cdRef = inject(ChangeDetectorRef);
  private translateService = inject(TranslateService);

  constructor() {
    const statusBaseStr = 'nealifeApp.ActivityStatus.';
    const statusValues = ['ACTIVE', 'INACTIVE', 'TERMINATED', 'EXPIRED'];
    this.statusList = statusValues.map(value => ({
      label: this.translateService.instant(statusBaseStr + value),
      value: value,
    }));
    this.parentCompanies = this.registerService.companies.map(company => ({
      label: company.name,
      value: '' + company.id,
    }));
  }

  ngOnInit() {
    this.spinner.show('register-edit');
    forkJoin([
      this.sharedApiService.lookup('COMPANY_TYPE'),
      this.sharedApiService.lookup('PARTNER_TYPE'),
    ])
      .pipe(
        map<[DropdownOption[], DropdownOption[]], { accountTypes: any[]; partnerTypes: any[] }>(
          ([accountTypes, partnerTypes]) => {
            return {
              accountTypes: accountTypes,
              partnerTypes: partnerTypes,
            };
          }
        )
      )
      .subscribe({
        next: resp => {
          this.accountTypes = resp.accountTypes;
          this.partnerTypes = resp.partnerTypes;
          this.cdRef.markForCheck();
        },
        complete: () => this.spinner.hide('register-edit'),
      });
  }

  goBack() {
    window.history.back();
  }

  getEditForm(company: Company) {
    return this.fb.group({
      id: [company.id],
      name: [company.name, [Validators.required, Validators.maxLength(75)]],
      contactPerson: [company.contactPerson, [Validators.required, Validators.maxLength(75)]],
      email: [
        company.email,
        [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')],
      ],
      address: [company.address, [Validators.required, Validators.maxLength(300)]],
      contactNumber1: [
        company.contactNumber1,
        [
          Validators.required,
          Validators.maxLength(10),
          Validators.minLength(10),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      contactNumber2: [
        company.contactNumber2,
        [Validators.maxLength(10), Validators.minLength(10), Validators.pattern('^[0-9]*$')],
      ],
      status: [company.status, Validators.required],
      validFrom: [company.validFrom, [Validators.required]],
      validTo: [company.validTo, [Validators.required]],
      companyType: [company.companyType, Validators.required],
      partnerType: [company.partnerType, Validators.required],
      website: [company.website],
      parentId: [company.parentId],
    });
  }
}
