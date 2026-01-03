import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-filter-user',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filter-user.component.html',
  styleUrl: './filter-user.component.css'
})
export class FilterUserComponent {

  @Input() items: any[]=[]
  @Input() searchSee: boolean | null = true;
  @Input() filterSee: boolean | null = true;
@Input() defaultStatus: string = '';
@Input() defaultSearch: string = '';
 @Output() searchChange = new EventEmitter<any>();

  searchForm: FormGroup;


  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      status: ['']
    });
  }

  ngOnInit(): void {

  if (this.defaultStatus || this.defaultSearch) {
    this.searchForm.patchValue({
      status: this.defaultStatus,
      searchTerm: this.defaultSearch
    }, { emitEvent: false });
  }

  this.searchForm.get('searchTerm')?.valueChanges
    .pipe(
      takeUntil(this.destroy$),
      debounceTime(1000),
      distinctUntilChanged()
    )
    .subscribe(() => this.emitSearch());

  this.searchForm.get('status')?.valueChanges
    .pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged()
    )
    .subscribe(() => this.emitSearch());

  // 👉 Lanzar el filtro inicial
  this.emitSearch();
}


  onSearch(): void {
    // Este método se llama al enviar el formulario (Enter en el input)
    this.emitSearch();
  }

  private emitSearch(): void {
    const filters = {
      searchTerm: this.searchForm.get('searchTerm')?.value?.trim() || '',
      status: this.searchForm.get('status')?.value || ''
    };

    // Emitir solo si hay valores válidos
    this.searchChange.emit(filters);
  }

  resetFilters(): void {
    this.searchForm.reset({
      searchTerm: '',
      status: ''
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
