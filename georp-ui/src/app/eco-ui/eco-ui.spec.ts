import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcoUi } from './eco-ui';

describe('EcoUi', () => {
  let component: EcoUi;
  let fixture: ComponentFixture<EcoUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EcoUi]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EcoUi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
